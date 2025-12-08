/* 初始化演示用户、项目、任务数据。
 * 运行：npm run seed-demo
 * 环境：依赖 .env 中的 Mongo/JWT 配置
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');

const seed = async () => {
  await connectDB();

  const usersInput = [
    { username: 'leader', email: 'leader@test.com', password: '123456', role: 'admin' },
    { username: 'alice', email: 'alice@test.com', password: '123456', role: 'user' },
    { username: 'bob', email: 'bob@test.com', password: '123456', role: 'user' },
  ];

  // 创建/获取用户
  const users = {};
  for (const u of usersInput) {
    let user = await User.findOne({ username: u.username });
    if (!user) {
      user = await User.create(u);
    }
    users[u.username] = user;
  }

  // 清理旧项目/任务演示数据
  await Task.deleteMany({});
  await Project.deleteMany({});

  // 创建项目
  const projects = await Project.insertMany([
    {
      name: '演示项目A',
      description: '由组长创建，含两名成员',
      status: '进行中',
      priority: '高',
      leader: users.leader._id,
      members: [users.leader._id, users.alice._id, users.bob._id],
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      name: '演示项目B',
      description: '备选项目，只有组长和 Alice',
      status: '未开始',
      priority: '中',
      leader: users.leader._id,
      members: [users.leader._id, users.alice._id],
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  ]);

  // 创建任务（组长看到全部，成员只看自己）
  const [projA, projB] = projects;
  await Task.insertMany([
    {
      project: projA._id,
      taskName: '搭建前端框架',
      taskDetails: '初始化 Vite + React + TS 基础结构',
      assignee: users.alice._id,
      createdBy: users.leader._id,
      urgency: '高',
      startDate: new Date(),
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      project: projA._id,
      taskName: '接口联调',
      taskDetails: '完成登录与任务列表接口联调',
      assignee: users.bob._id,
      createdBy: users.leader._id,
      urgency: '中',
      startDate: new Date(),
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
    {
      project: projB._id,
      taskName: '需求梳理',
      taskDetails: '整理项目B的需求列表并输出文档',
      assignee: users.alice._id,
      createdBy: users.leader._id,
      urgency: '普通',
      startDate: new Date(),
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  ]);

  console.log('初始化完成：');
  console.log(`用户: ${Object.keys(users).join(', ')}`);
  console.log(`项目: ${projects.map((p) => p.name).join(', ')}`);
  await mongoose.connection.close();
};

seed().catch((err) => {
  console.error(err);
  mongoose.connection.close();
});

