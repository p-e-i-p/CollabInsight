/**
 * 清空数据库并初始化演示数据（用户 / 项目 / 任务 / Bug）
 * 运行：npm run reset-demo
 * 依赖：.env 内的 MONGODB_URI
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Bug = require('../models/Bug');

const day = 24 * 60 * 60 * 1000;
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const range = (n) => Array.from({ length: n }, (_, i) => i);

const seed = async () => {
  await connectDB();

  console.log('开始清空数据库...');
  await Promise.all([User.deleteMany({}), Project.deleteMany({}), Task.deleteMany({}), Bug.deleteMany({})]);
  console.log('已清空 User / Project / Task / Bug');

  console.log('创建演示用户...');
  // 必须用 create 以触发密码加密的 pre-save 中间件，避免明文存储导致登录失败
  const userDocs = [];
  const userInput = [
    { username: 'leader', email: 'leader@test.com', password: '123456', role: 'admin', nickname: '组长' },
    { username: 'alice', email: 'alice@test.com', password: '123456', role: 'user', nickname: 'Alice' },
    { username: 'bob', email: 'bob@test.com', password: '123456', role: 'user', nickname: 'Bob' },
    { username: 'charlie', email: 'charlie@test.com', password: '123456', role: 'user', nickname: 'Charlie' },
    { username: 'david', email: 'david@test.com', password: '123456', role: 'user', nickname: 'David' },
    { username: 'eva', email: 'eva@test.com', password: '123456', role: 'user', nickname: 'Eva' },
  ];
  for (const u of userInput) {
    const created = await User.create(u);
    userDocs.push(created);
  }

  const userMap = Object.fromEntries(userDocs.map((u) => [u.username, u]));

  console.log('创建演示项目...');
  const projectCount = 12;
  const baseNames = [
    '核心产品迭代',
    '数据中台升级',
    '移动端优化',
    '增长实验',
    '报表体系',
    '监控告警',
    '权限中心',
    '自动化测试',
    'LLM 助手',
    '埋点体系',
    'CI/CD 管线',
    '灰度发布',
  ];
  const statusPool = ['未开始', '进行中', '已完成'];
  const priorityPool = ['高', '中', '普通', '低'];
  const memberPool = Object.values(userMap).map((u) => u._id);

  const projectPayload = range(projectCount).map((i) => {
    const members = memberPool.filter(() => Math.random() > 0.25);
    const uniqueMembers = Array.from(new Set([userMap.leader._id, ...members]));
    return {
      name: `演示项目${i + 1}`,
      description: baseNames[i % baseNames.length],
      status: statusPool[i % statusPool.length],
      priority: priorityPool[i % priorityPool.length],
      leader: userMap.leader._id,
      members: uniqueMembers,
      deadline: new Date(Date.now() + (5 + i * 2) * day),
      createdAt: new Date(Date.now() - i * day),
    };
  });

  const projects = await Project.insertMany(projectPayload);

  console.log('创建演示任务...');
  const taskStatusPool = ['待办', '进行中', '已完成', '已取消'];
  const urgencyPool = ['高', '中', '普通'];
  const tasksPerProject = 25;
  const taskPayload = [];
  projects.forEach((p, idx) => {
    range(tasksPerProject).forEach((j) => {
      const assignee = rand(p.members);
      const status = taskStatusPool[(idx + j) % taskStatusPool.length];
      const urgency = urgencyPool[(idx + j) % urgencyPool.length];
      const start = new Date(Date.now() - rand([1, 2, 3, 5, 8, 10, 15, 20]) * day);
      const deadline = new Date(Date.now() + rand([2, 5, 7, 10, 12, 15, 20, 25]) * day);
      taskPayload.push({
        project: p._id,
        taskName: `任务 ${idx + 1}-${j + 1}`,
        taskDetails: `项目 ${p.name} 的第 ${j + 1} 个任务，状态 ${status}`,
        assignee,
        createdBy: userMap.leader._id,
        urgency,
        status,
        startDate: start,
        deadline,
      });
    });
  });
  await Task.insertMany(taskPayload);

  console.log('创建演示 Bug...');
  const now = Date.now();
  const bugStatusPool = ['待处理', '处理中', '待审核', '已解决', '已关闭', '已取消'];
  const bugSeverityPool = ['严重', '高', '中', '低'];
  const bugsPerProject = 12;
  const bugPayload = [];
  projects.forEach((p, idx) => {
    range(bugsPerProject).forEach((j) => {
      const assignee = rand(p.members);
      const status = bugStatusPool[(idx + j) % bugStatusPool.length];
      const severity = bugSeverityPool[(idx + j) % bugSeverityPool.length];
      const startDate = new Date(now - rand([1, 2, 3, 5, 8, 10]) * day);
      const deadline = new Date(now + rand([1, 3, 5, 7, 10]) * day);
      bugPayload.push({
        project: p._id,
        bugName: `Bug ${idx + 1}-${j + 1}`,
        bugDetails: `项目 ${p.name} 的第 ${j + 1} 个缺陷，严重度 ${severity}`,
        assignee,
        createdBy: userMap.leader._id,
        severity,
        status,
        startDate,
        deadline,
        ...(status === '已解决'
          ? {
              solution: '示例解决方案',
              resolvedBy: assignee,
              resolvedAt: new Date(now - 1 * day),
              approvalStatus: '通过',
              reviewer: userMap.leader._id,
              reviewComment: '示例审核意见',
              reviewedAt: new Date(now - 1 * day),
            }
          : {}),
      });
    });
  });
  await Bug.insertMany(bugPayload);

  console.log('初始化完成：');
  console.log('- 用户：leader / alice / bob / charlie，密码均为 123456');
  console.log(`- 项目：${projects.length} 个，任务：${taskPayload.length} 条，Bug：${bugPayload.length} 条`);
  console.log('完成后可用 leader 账号登录（admin 权限）');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('初始化失败：', err);
  mongoose.connection.close();
  process.exit(1);
});

