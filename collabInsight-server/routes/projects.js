const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 判断是否项目成员或组长
const ensureProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    return { allowed: false, reason: '项目不存在' };
  }

  const isLeader = project.leader.toString() === userId.toString();
  const isMember = project.members.map((m) => m.toString()).includes(userId.toString());

  if (!isLeader && !isMember) {
    return { allowed: false, reason: '无权限访问该项目' };
  }

  return { allowed: true, project, isLeader };
};

// 组长搜索用户（按用户名或ID），用于添加到项目/任务分配
router.get('/:projectId/searchUser', protect, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { keyword = '' } = req.query;
    const userId = req.user.id;

    const access = await ensureProjectAccess(projectId, userId);
    if (!access.allowed) {
      return res.status(403).json({ message: access.reason });
    }
    if (!access.isLeader) {
      return res.status(403).json({ message: '仅组长可搜索并添加成员' });
    }

    const regex = new RegExp(keyword, 'i');
    const conditions = [{ username: regex }];
    if (mongoose.Types.ObjectId.isValid(keyword)) {
      conditions.push({ _id: keyword });
    }

    const users = await User.find({ $or: conditions })
      .select('_id username role')
      .limit(10);

    res.status(200).json({ code: 200, data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '搜索用户失败' });
  }
});

// 获取当前用户相关的项目列表（支持按名称/描述模糊查询）
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { keyword = '' } = req.query;

    const baseFilter = {
      $or: [{ leader: userId }, { members: userId }],
    };

    const query = keyword
      ? {
          ...baseFilter,
          $and: [
            {
              $or: [
                { name: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } },
              ],
            },
          ],
        }
      : baseFilter;

    const projects = await Project.find(query)
      .populate('leader', 'username role')
      .populate('members', 'username role')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ code: 200, data: projects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取项目失败' });
  }
});

// 创建项目：创建者为组长，自动加入成员列表
router.post('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, status, priority, deadline, memberIds = [] } = req.body;

    const members = Array.from(new Set([userId, ...memberIds]));

    const project = await Project.create({
      name,
      description,
      status,
      priority,
      deadline,
      leader: userId,
      members,
    });

    const populated = await Project.findById(project._id)
      .populate('leader', 'username role')
      .populate('members', 'username role');

    res.status(201).json({ code: 200, data: populated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || '创建项目失败' });
  }
});

// 获取项目下的任务（组长看全部，成员仅看自己）
router.get('/:projectId/tasks', protect, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    const access = await ensureProjectAccess(projectId, userId);
    if (!access.allowed) {
      return res.status(403).json({ message: access.reason });
    }

    const query = { project: projectId };
    if (!access.isLeader) {
      query.assignee = userId;
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'username role')
      .populate('createdBy', 'username role')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ code: 200, data: tasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取任务失败' });
  }
});

// 创建任务
router.post('/:projectId/tasks', protect, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { taskName, taskDetails, assignee, startDate, deadline, urgency, status } = req.body;

    const access = await ensureProjectAccess(projectId, userId);
    if (!access.allowed) {
      return res.status(403).json({ message: access.reason });
    }

    const isLeader = access.isLeader;
    const assigneeId = assignee || userId;

    // 非组长只能给自己创建任务
    if (!isLeader && assigneeId !== userId) {
      return res.status(403).json({ message: '成员只能为自己创建任务' });
    }

    // 校验被分配人是否存在
    const assigneeUser = await User.findById(assigneeId);
    if (!assigneeUser) {
      return res.status(400).json({ message: '分配的用户不存在' });
    }

    // 如果组长分配给新成员，自动加入项目成员
    if (isLeader && !access.project.members.map((m) => m.toString()).includes(assigneeId)) {
      access.project.members.push(assigneeId);
      await access.project.save();
    }

    const task = await Task.create({
      project: projectId,
      taskName,
      taskDetails,
      assignee: assigneeId,
      createdBy: userId,
      startDate,
      deadline,
      urgency,
      status: status || '待办',
    });

    const populated = await Task.findById(task._id)
      .populate('assignee', 'username role')
      .populate('createdBy', 'username role');

    res.status(201).json({ code: 200, data: populated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || '创建任务失败' });
  }
});

// 更新任务（组长可更改任何，成员仅能更改自己的且不能改分配对象）
router.put('/tasks/:taskId', protect, async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    const { taskName, taskDetails, assignee, startDate, deadline, urgency, status } = req.body;

    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }

    const project = task.project;
    const isLeader = project.leader.toString() === userId.toString();
    const isAssignee = task.assignee.toString() === userId.toString();

    if (!isLeader && !isAssignee) {
      return res.status(403).json({ message: '无权修改该任务' });
    }

    // 非组长禁止更换执行人
    if (!isLeader && assignee && assignee !== task.assignee.toString()) {
      return res.status(403).json({ message: '成员无法修改任务分配对象' });
    }

    // 组长更换执行人时校验
    if (isLeader && assignee) {
      const assigneeUser = await User.findById(assignee);
      if (!assigneeUser) {
        return res.status(400).json({ message: '分配的用户不存在' });
      }
      if (!project.members.map((m) => m.toString()).includes(assignee)) {
        project.members.push(assignee);
        await project.save();
      }
      task.assignee = assignee;
    }

    if (taskName !== undefined) task.taskName = taskName;
    if (taskDetails !== undefined) task.taskDetails = taskDetails;
    if (startDate !== undefined) task.startDate = startDate;
    if (deadline !== undefined) task.deadline = deadline;
    if (urgency !== undefined) task.urgency = urgency;
    if (status !== undefined) task.status = status;

    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignee', 'username role')
      .populate('createdBy', 'username role');

    res.status(200).json({ code: 200, data: populated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || '更新任务失败' });
  }
});

// 删除任务（组长可删全部，成员仅能删除自己的）
router.delete('/tasks/:taskId', protect, async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;

    const task = await Task.findById(taskId).populate('project');
    if (!task) {
      return res.status(404).json({ message: '任务不存在' });
    }

    const project = task.project;
    const isLeader = project.leader.toString() === userId.toString();
    const isAssignee = task.assignee.toString() === userId.toString();

    if (!isLeader && !isAssignee) {
      return res.status(403).json({ message: '无权删除该任务' });
    }

    await task.remove();
    res.status(200).json({ code: 200, message: '任务删除成功' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || '删除任务失败' });
  }
});

module.exports = router;

