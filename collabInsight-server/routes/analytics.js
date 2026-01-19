const express = require('express');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Bug = require('../models/Bug');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 统计枚举，确保没有数据时也能返回 0
const PROJECT_STATUS = ['未开始', '进行中', '已完成'];
const TASK_STATUS = ['待办', '进行中', '已完成', '已取消'];
const TASK_URGENCY = ['高', '中', '普通'];
const BUG_STATUS = ['待处理', '处理中', '待审核', '已解决', '已关闭', '已取消'];
const BUG_SEVERITY = ['严重', '高', '中', '低'];

router.get('/overview', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // 仅统计与当前用户相关的项目
    const projects = await Project.find({
      $or: [{ leader: userId }, { members: userId }],
    })
      .select('_id name status priority deadline leader members createdAt')
      .lean();

    if (!projects.length) {
      return res.status(200).json({
        code: 200,
        data: {
          summary: { projects: 0, tasks: 0, bugs: 0, members: 0 },
          projectStatus: PROJECT_STATUS.map((name) => ({ name, count: 0 })),
          taskStatus: TASK_STATUS.map((name) => ({ name, count: 0 })),
          taskUrgency: TASK_URGENCY.map((name) => ({ name, count: 0 })),
          bugStatus: BUG_STATUS.map((name) => ({ name, count: 0 })),
          bugSeverity: BUG_SEVERITY.map((name) => ({ name, count: 0 })),
          taskTrend: [],
          projectProgress: [],
          upcomingTasks: [],
          topContributors: [],
        },
      });
    }

    const projectIds = projects.map((p) => p._id);

    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);
    const trendStart = new Date();
    trendStart.setDate(now.getDate() - 13); // 最近 14 天

    const [
      taskStatusAgg,
      taskUrgencyAgg,
      bugStatusAgg,
      bugSeverityAgg,
      taskTrendAgg,
      projectTaskAgg,
      upcomingTasksRaw,
      topContributorsAgg,
    ] = await Promise.all([
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$urgency', count: { $sum: 1 } } },
      ]),
      Bug.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Bug.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$severity', count: { $sum: 1 } } },
      ]),
      Task.aggregate([
        {
          $match: { project: { $in: projectIds }, createdAt: { $gte: trendStart } },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            created: { $sum: 1 },
            completed: {
              $sum: { $cond: [{ $eq: ['$status', '已完成'] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        {
          $group: {
            _id: '$project',
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', '已完成'] }, 1, 0] } },
          },
        },
      ]),
      Task.find({
        project: { $in: projectIds },
        deadline: { $gte: now, $lte: nextWeek },
      })
        .select('taskName deadline status project')
        .populate('project', 'name')
        .sort({ deadline: 1 })
        .limit(10)
        .lean(),
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        {
          $group: {
            _id: '$assignee',
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', '已完成'] }, 1, 0] } },
          },
        },
        { $sort: { completed: -1, total: -1 } },
        { $limit: 5 },
      ]),
    ]);

    const projectStatus = PROJECT_STATUS.map((name) => ({
      name,
      count: projects.filter((p) => p.status === name).length,
    }));

    const taskStatus = TASK_STATUS.map((name) => ({
      name,
      count: taskStatusAgg.find((i) => i._id === name)?.count || 0,
    }));

    const taskUrgency = TASK_URGENCY.map((name) => ({
      name,
      count: taskUrgencyAgg.find((i) => i._id === name)?.count || 0,
    }));

    const bugStatus = BUG_STATUS.map((name) => ({
      name,
      count: bugStatusAgg.find((i) => i._id === name)?.count || 0,
    }));

    const bugSeverity = BUG_SEVERITY.map((name) => ({
      name,
      count: bugSeverityAgg.find((i) => i._id === name)?.count || 0,
    }));

    const projectProgress = projectTaskAgg
      .map((item) => {
        const proj = projects.find((p) => p._id.toString() === item._id.toString());
        if (!proj) return null;
        return {
          projectId: item._id.toString(),
          projectName: proj.name,
          total: item.total,
          completed: item.completed,
        };
      })
      .filter(Boolean);

    const taskTrend = taskTrendAgg.map((item) => ({
      date: item._id,
      created: item.created,
      completed: item.completed,
    }));

    const upcomingTasks = upcomingTasksRaw.map((task) => ({
      taskId: task._id.toString(),
      taskName: task.taskName,
      projectName: task.project?.name || '未知项目',
      deadline: task.deadline,
      status: task.status,
    }));

    const memberIds = new Set();
    projects.forEach((p) => {
      // 某些旧数据可能缺少 leader 或 members，需保护性判断
      if (p.leader) {
        memberIds.add(p.leader.toString());
      }
      if (Array.isArray(p.members)) {
        p.members.forEach((m) => {
          if (m) memberIds.add(m.toString());
        });
      }
    });

    const contributorIds = topContributorsAgg.map((item) => item._id).filter(Boolean);
    const contributorUsers = contributorIds.length
      ? await User.find({ _id: { $in: contributorIds } })
          .select('_id username')
          .lean()
      : [];
    const userMap = new Map(contributorUsers.map((u) => [u._id.toString(), u.username]));

    const topContributors = topContributorsAgg.map((item) => ({
      userId: item._id?.toString(),
      username: userMap.get(item._id?.toString()) || '未知成员',
      completed: item.completed,
      total: item.total,
    }));

    const summary = {
      projects: projects.length,
      tasks: taskStatusAgg.reduce((acc, cur) => acc + cur.count, 0),
      bugs: bugStatusAgg.reduce((acc, cur) => acc + cur.count, 0),
      members: memberIds.size,
    };

    return res.status(200).json({
      code: 200,
      data: {
        summary,
        projectStatus,
        taskStatus,
        taskUrgency,
        bugStatus,
        bugSeverity,
        taskTrend,
        projectProgress,
        upcomingTasks,
        topContributors,
      },
    });
  } catch (error) {
    console.error('获取概览数据失败', error);
    res.status(500).json({ message: error.message || '获取概览数据失败' });
  }
});

module.exports = router;

