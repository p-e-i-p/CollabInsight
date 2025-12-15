

const Bug = require('../models/Bug');
const Project = require('../models/Project');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// 判断是否项目成员或组长
const ensureProjectAccess = async (projectId, userId) => {
  try {
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
  } catch (error) {
    console.error('检查项目权限错误:', error);
    return { allowed: false, reason: '检查项目权限失败' };
  }
};

// 获取项目下的Bug列表（组长看全部，成员仅看自己）
exports.getBugsByProject = async (req, res) => {
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

    const bugs = await Bug.find(query)
      .populate('assignee', 'username role')
      .populate('createdBy', 'username role')
      .populate('resolvedBy', 'username role')
      .populate('reviewer', 'username role')
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ code: 200, data: bugs });
  } catch (error) {
    console.error('获取Bug列表错误:', error);
    res.status(500).json({ message: '获取Bug列表失败' });
  }
};

// 创建Bug
exports.createBug = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const { bugName, bugDetails, assignee, startDate, deadline, severity } = req.body;

    // 参数校验
    if (!bugName) {
      return res.status(400).json({ message: 'Bug名称不能为空' });
    }

    const access = await ensureProjectAccess(projectId, userId);
    if (!access.allowed) {
      return res.status(403).json({ message: access.reason });
    }

    const isLeader = access.isLeader;
    const assigneeId = assignee || userId;

    // 非组长只能给自己创建Bug
    if (!isLeader && assigneeId !== userId) {
      return res.status(403).json({ message: '成员只能为自己创建Bug' });
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
      console.log(`用户 ${assigneeUser.username} 已被自动添加到项目 ${access.project.name}`);
    }

    const bug = await Bug.create({
      project: projectId,
      bugName,
      bugDetails,
      assignee: assigneeId,
      createdBy: userId,
      severity: severity || '中', // 确保有默认值
      status: '待处理', // 明确设置初始状态
      startDate,
      deadline,
    });

    console.log(`Bug创建成功: ${bug.bugName} (ID: ${bug._id})`);

    const populated = await Bug.findById(bug._id)
      .populate('assignee', 'username role')
      .populate('createdBy', 'username role');

    res.status(201).json({ code: 200, data: populated });
  } catch (error) {
    console.error('创建Bug错误:', error);

    // 处理验证错误
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: '数据验证失败', 
        errors 
      });
    }

    res.status(500).json({ message: error.message || '创建Bug失败' });
  }
};

// 更新Bug
exports.updateBug = async (req, res) => {
  try {
    const { bugId } = req.params;
    const userId = req.user.id;
    const { bugName, bugDetails, assignee, startDate, deadline, severity, status, solution } = req.body;

    // 参数校验
    if (!bugName) {
      return res.status(400).json({ message: 'Bug名称不能为空' });
    }

    const bug = await Bug.findById(bugId).populate('project');
    if (!bug) {
      return res.status(404).json({ message: 'Bug不存在' });
    }

    const project = bug.project;
    const isLeader = project.leader.toString() === userId.toString();
    const isAssignee = bug.assignee.toString() === userId.toString();

    if (!isLeader && !isAssignee) {
      return res.status(403).json({ message: '无权修改该Bug' });
    }

    // 非组长禁止更换执行人
    if (!isLeader && assignee && assignee !== bug.assignee.toString()) {
      return res.status(403).json({ message: '成员无法修改Bug分配对象' });
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
        console.log(`用户 ${assigneeUser.username} 已被自动添加到项目 ${project.name}`);
      }
      bug.assignee = assignee;
    }

    // 更新字段
    if (bugName !== undefined) bug.bugName = bugName;
    if (bugDetails !== undefined) bug.bugDetails = bugDetails;
    if (startDate !== undefined) bug.startDate = startDate;
    if (deadline !== undefined) bug.deadline = deadline;
    if (severity !== undefined) bug.severity = severity;
    if (status !== undefined) {
      // 保存原始状态用于比较
      const originalStatus = bug.status;
      bug.status = status;

      // 状态变更处理
      if (status === '已解决' && originalStatus !== '已解决') {
        bug.resolvedBy = userId;
        bug.resolvedAt = new Date();
        console.log(`Bug "${bug.bugName}" 已标记为解决，解决人: ${userId}`);
      }

      // 状态变更为"待审核"时，重置审核状态
      if (status === '待审核' && originalStatus !== '待审核') {
        bug.approvalStatus = '待审核';
        bug.reviewer = undefined;
        bug.reviewComment = '';
        bug.reviewedAt = undefined;
        console.log(`Bug "${bug.bugName}" 已变更为待审核状态`);
      }
    }
    if (solution !== undefined) bug.solution = solution;

    await bug.save();

    console.log(`Bug更新成功: ${bug.bugName} (ID: ${bug._id})`);

    const populated = await Bug.findById(bug._id)
      .populate('assignee', 'username role')
      .populate('createdBy', 'username role')
      .populate('resolvedBy', 'username role')
      .populate('reviewer', 'username role');

    res.status(200).json({ code: 200, data: populated });
  } catch (error) {
    console.error('更新Bug错误:', error);

    // 处理验证错误
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: '数据验证失败', 
        errors 
      });
    }

    res.status(500).json({ message: error.message || '更新Bug失败' });
  }
};

// 删除Bug
exports.deleteBug = async (req, res) => {
  try {
    const { bugId } = req.params;
    const userId = req.user.id;

    const bug = await Bug.findById(bugId).populate('project');
    if (!bug) {
      return res.status(404).json({ message: 'Bug不存在' });
    }

    const project = bug.project;
    const isLeader = project.leader.toString() === userId.toString();
    const isAssignee = bug.assignee.toString() === userId.toString();

    if (!isLeader && !isAssignee) {
      return res.status(403).json({ message: '无权删除该Bug' });
    }

    await Bug.findByIdAndDelete(bugId);
    console.log(`Bug删除成功: ${bug.bugName} (ID: ${bug._id})`);

    res.status(200).json({ code: 200, message: 'Bug删除成功' });
  } catch (error) {
    console.error('删除Bug错误:', error);
    res.status(500).json({ message: error.message || '删除Bug失败' });
  }
};

// 组长审核Bug
exports.approveBug = async (req, res) => {
  try {
    const { bugId } = req.params;
    const userId = req.user.id;
    const { approvalStatus, reviewComment } = req.body;

    // 参数校验
    if (!approvalStatus || !['通过', '不通过'].includes(approvalStatus)) {
      return res.status(400).json({ message: '请提供有效的审核结果' });
    }

    const bug = await Bug.findById(bugId).populate('project');
    if (!bug) {
      return res.status(404).json({ message: 'Bug不存在' });
    }

    // 仅组长可审核Bug
    if (bug.project.leader.toString() !== userId.toString()) {
      return res.status(403).json({ message: '仅组长可审核Bug' });
    }

    // Bug必须是"待审核"状态才能审核
    if (bug.status !== '待审核') {
      return res.status(400).json({ message: '仅待审核状态的Bug可以审核' });
    }

    // 更新审核信息
    bug.approvalStatus = approvalStatus;
    bug.reviewer = userId;
    bug.reviewComment = reviewComment || '';
    bug.reviewedAt = new Date();

    // 如果审核通过，将状态更新为"已解决"
    if (approvalStatus === '通过') {
      bug.status = '已解决';
      if (!bug.resolvedBy) {
        bug.resolvedBy = userId;
        bug.resolvedAt = new Date();
      }
      console.log(`Bug "${bug.bugName}" 审核通过，状态已更新为已解决`);
    } else {
      console.log(`Bug "${bug.bugName}" 审核不通过，审核意见: ${reviewComment || '无'}`);
    }

    await bug.save();

    console.log(`Bug审核完成: ${bug.bugName} (ID: ${bug._id})，审核结果: ${approvalStatus}`);

    const populated = await Bug.findById(bug._id)
      .populate('assignee', 'username role')
      .populate('createdBy', 'username role')
      .populate('resolvedBy', 'username role')
      .populate('reviewer', 'username role');

    res.status(200).json({ code: 200, data: populated });
  } catch (error) {
    console.error('审核Bug错误:', error);

    // 处理验证错误
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: '数据验证失败', 
        errors 
      });
    }

    res.status(500).json({ message: error.message || '审核Bug失败' });
  }
};

// 组长搜索用户（按用户名或ID），用于分配Bug
exports.searchUserForBug = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { keyword = '' } = req.query;
    const userId = req.user.id;

    const access = await ensureProjectAccess(projectId, userId);
    if (!access.allowed) {
      return res.status(403).json({ message: access.reason });
    }
    if (!access.isLeader) {
      return res.status(403).json({ message: '仅组长可搜索并分配Bug' });
    }

    const regex = new RegExp(keyword, 'i');
    const conditions = [{ username: regex }];
    if (require('mongoose').Types.ObjectId.isValid(keyword)) {
      conditions.push({ _id: keyword });
    }

    const users = await User.find({ $or: conditions })
      .select('_id username role')
      .limit(10);

    res.status(200).json({ code: 200, data: users });
  } catch (error) {
    console.error('搜索用户错误:', error);
    res.status(500).json({ message: '搜索用户失败' });
  }
};

