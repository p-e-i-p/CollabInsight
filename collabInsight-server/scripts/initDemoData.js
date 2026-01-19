/**
 * 清空数据库并初始化完整的演示数据
 * 生成20个左右有实际意义的项目，确保成员数正确计算
 * 运行：node scripts/initDemoData.js
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
const now = Date.now();
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const range = (n) => Array.from({ length: n }, (_, i) => i);

const seed = async () => {
  await connectDB();

  console.log('开始清空数据库...');
  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
    Bug.deleteMany({}),
  ]);
  console.log('✓ 已清空所有数据');

  // 创建用户（20个用户，确保有足够的成员）
  console.log('\n创建用户数据...');
  const userInput = [
    // 管理员
    { username: 'admin', email: 'admin@collabinsight.com', password: '123456', role: 'admin', nickname: '系统管理员' },
    { username: 'project_manager', email: 'manager@collabinsight.com', password: '123456', role: 'admin', nickname: '项目经理' },
    
    // 开发团队
    { username: 'zhang_senior', email: 'zhang.senior@company.com', password: '123456', role: 'user', nickname: '张工程师' },
    { username: 'li_frontend', email: 'li.frontend@company.com', password: '123456', role: 'user', nickname: '李前端' },
    { username: 'wang_backend', email: 'wang.backend@company.com', password: '123456', role: 'user', nickname: '王后端' },
    { username: 'chen_fullstack', email: 'chen.fullstack@company.com', password: '123456', role: 'user', nickname: '陈全栈' },
    { username: 'zhao_devops', email: 'zhao.devops@company.com', password: '123456', role: 'user', nickname: '赵运维' },
    
    // 测试团队
    { username: 'sun_qa', email: 'sun.qa@company.com', password: '123456', role: 'user', nickname: '孙测试' },
    { username: 'zhou_qa', email: 'zhou.qa@company.com', password: '123456', role: 'user', nickname: '周测试' },
    
    // 设计团队
    { username: 'wu_designer', email: 'wu.designer@company.com', password: '123456', role: 'user', nickname: '吴设计师' },
    { username: 'xu_ui', email: 'xu.ui@company.com', password: '123456', role: 'user', nickname: '徐UI' },
    
    // 产品团队
    { username: 'guo_product', email: 'guo.product@company.com', password: '123456', role: 'user', nickname: '郭产品' },
    { username: 'ma_product', email: 'ma.product@company.com', password: '123456', role: 'user', nickname: '马产品' },
    
    // 其他角色
    { username: 'hu_analyst', email: 'hu.analyst@company.com', password: '123456', role: 'user', nickname: '胡分析师' },
    { username: 'lin_architect', email: 'lin.architect@company.com', password: '123456', role: 'user', nickname: '林架构师' },
    { username: 'he_security', email: 'he.security@company.com', password: '123456', role: 'user', nickname: '何安全' },
    { username: 'luo_data', email: 'luo.data@company.com', password: '123456', role: 'user', nickname: '罗数据' },
    { username: 'gao_mobile', email: 'gao.mobile@company.com', password: '123456', role: 'user', nickname: '高移动' },
    { username: 'tang_intern', email: 'tang.intern@company.com', password: '123456', role: 'user', nickname: '唐实习生' },
  ];

  const userDocs = [];
  for (const u of userInput) {
    const created = await User.create(u);
    userDocs.push(created);
  }
  console.log(`✓ 创建了 ${userDocs.length} 个用户`);

  const userMap = Object.fromEntries(userDocs.map((u) => [u.username, u]));
  const allUserIds = userDocs.map((u) => u._id);

  // 创建15个有实际意义的项目
  console.log('\n创建项目数据...');
  const projectData = [
    {
      name: '电商平台核心系统重构',
      description: '对现有电商平台进行微服务架构改造，提升系统性能和可扩展性',
      status: '进行中',
      priority: '高',
      members: ['admin', 'zhang_senior', 'wang_backend', 'chen_fullstack', 'zhao_devops', 'sun_qa'],
    },
    {
      name: '移动端App V3.0开发',
      description: '全新设计移动端应用，支持iOS和Android双平台，优化用户体验',
      status: '进行中',
      priority: '高',
      members: ['project_manager', 'li_frontend', 'gao_mobile', 'wu_designer', 'zhou_qa', 'tang_intern'],
    },
    {
      name: '数据中台建设',
      description: '构建统一的数据中台，整合各业务系统数据，提供数据服务能力',
      status: '进行中',
      priority: '高',
      members: ['admin', 'luo_data', 'lin_architect', 'wang_backend', 'hu_analyst'],
    },
    {
      name: '用户画像系统',
      description: '基于大数据分析构建用户画像系统，支持精准营销和个性化推荐',
      status: '进行中',
      priority: '中',
      members: ['luo_data', 'hu_analyst', 'wang_backend', 'chen_fullstack'],
    },
    {
      name: '支付系统升级',
      description: '升级支付系统，支持多种支付方式，提升支付成功率和安全性',
      status: '进行中',
      priority: '高',
      members: ['zhang_senior', 'he_security', 'wang_backend', 'sun_qa', 'zhou_qa'],
    },
    {
      name: '智能客服系统',
      description: '基于AI的智能客服系统，支持自动问答和人工转接',
      status: '进行中',
      priority: '中',
      members: ['project_manager', 'chen_fullstack', 'li_frontend', 'guo_product'],
    },
    {
      name: '内容管理系统',
      description: '构建统一的内容管理系统，支持多端内容发布和管理',
      status: '进行中',
      priority: '中',
      members: ['li_frontend', 'xu_ui', 'wang_backend', 'sun_qa'],
    },
    {
      name: '监控告警平台',
      description: '构建统一的监控告警平台，实时监控系统运行状态',
      status: '进行中',
      priority: '高',
      members: ['zhao_devops', 'lin_architect', 'wang_backend', 'sun_qa'],
    },
    {
      name: 'API网关建设',
      description: '构建统一的API网关，提供路由、限流、鉴权等功能',
      status: '进行中',
      priority: '高',
      members: ['lin_architect', 'zhao_devops', 'wang_backend', 'he_security'],
    },
    {
      name: '自动化测试平台',
      description: '构建自动化测试平台，提升测试效率和质量',
      status: '进行中',
      priority: '中',
      members: ['sun_qa', 'zhou_qa', 'zhao_devops', 'wang_backend'],
    },
    {
      name: '消息推送系统',
      description: '构建统一的消息推送系统，支持短信、邮件、App推送',
      status: '进行中',
      priority: '中',
      members: ['wang_backend', 'gao_mobile', 'chen_fullstack', 'sun_qa'],
    },
    {
      name: '报表分析平台',
      description: '构建数据报表分析平台，支持多维度数据分析和可视化',
      status: '进行中',
      priority: '中',
      members: ['luo_data', 'hu_analyst', 'li_frontend', 'xu_ui'],
    },
    {
      name: '权限管理系统',
      description: '重构权限管理系统，支持RBAC和ABAC权限模型',
      status: '进行中',
      priority: '高',
      members: ['he_security', 'wang_backend', 'lin_architect', 'sun_qa'],
    },
    {
      name: '搜索服务优化',
      description: '优化搜索服务性能，支持全文检索和智能推荐',
      status: '进行中',
      priority: '中',
      members: ['wang_backend', 'luo_data', 'chen_fullstack', 'zhou_qa'],
    },
    {
      name: '数据库性能优化',
      description: '优化数据库查询性能，建立索引和分库分表',
      status: '进行中',
      priority: '高',
      members: ['lin_architect', 'wang_backend', 'luo_data', 'zhao_devops'],
    },
    {
      name: '安全漏洞修复',
      description: '修复系统安全漏洞，加强安全防护措施',
      status: '进行中',
      priority: '高',
      members: ['he_security', 'wang_backend', 'zhao_devops', 'sun_qa'],
    },
    {
      name: '灰度发布系统',
      description: '构建灰度发布系统，支持渐进式发布和回滚',
      status: '已完成',
      priority: '高',
      members: ['zhao_devops', 'lin_architect', 'wang_backend', 'sun_qa'],
    },
  ];

  const projects = [];
  for (let i = 0; i < projectData.length; i++) {
    const p = projectData[i];
    const leader = userMap[p.members[0]] || userMap.admin;
    const memberIds = p.members
      .map((username) => userMap[username]?._id)
      .filter(Boolean);
    
    // 确保leader在members中
    const uniqueMembers = Array.from(new Set([leader._id, ...memberIds]));
    
    const project = await Project.create({
      name: p.name,
      description: p.description,
      status: p.status,
      priority: p.priority,
      leader: leader._id,
      members: uniqueMembers,
      deadline: new Date(now + (30 + i * 5) * day),
      createdAt: new Date(now - (projectData.length - i) * 7 * day),
    });
    projects.push(project);
  }
  console.log(`✓ 创建了 ${projects.length} 个项目`);

  // 为每个项目创建任务
  console.log('\n创建任务数据...');
  const taskStatusPool = ['待办', '进行中', '已完成', '已取消'];
  const urgencyPool = ['高', '中', '普通'];
  let totalTasks = 0;

  const taskTemplates = [
    '需求分析',
    '技术方案设计',
    '数据库设计',
    '接口开发',
    '前端页面开发',
    '单元测试编写',
    '集成测试',
    '性能优化',
    '代码审查',
    '文档编写',
    '部署上线',
    '问题修复',
    '功能优化',
    '安全加固',
    '监控配置',
  ];

  for (const project of projects) {
    const taskCount = project.status === '已完成' ? 15 : project.status === '进行中' ? 20 : 8;
    const projectTasks = [];

    for (let i = 0; i < taskCount; i++) {
      const assignee = rand(project.members);
      const status = project.status === '已完成' 
        ? rand(['已完成', '已完成', '已完成', '已取消'])
        : project.status === '进行中'
        ? rand(['待办', '进行中', '进行中', '已完成'])
        : '待办';
      
      const urgency = rand(urgencyPool);
      const daysAgo = rand([1, 2, 3, 5, 7, 10, 15, 20, 30]);
      const daysLater = rand([3, 5, 7, 10, 14, 20, 30]);
      
      const taskName = `${taskTemplates[i % taskTemplates.length]} - ${project.name}`;
      const assigneeUser = userDocs.find((u) => u._id.toString() === assignee.toString());
      const assigneeName = assigneeUser ? assigneeUser.nickname || assigneeUser.username : '成员';
      
      projectTasks.push({
        project: project._id,
        taskName,
        taskDetails: `${taskName}的详细说明，需要${assigneeName}完成`,
        assignee,
        createdBy: project.leader,
        urgency,
        status,
        startDate: new Date(now - daysAgo * day),
        deadline: new Date(now + daysLater * day),
        createdAt: new Date(now - daysAgo * day),
      });
    }

    await Task.insertMany(projectTasks);
    totalTasks += projectTasks.length;
  }
  console.log(`✓ 创建了 ${totalTasks} 个任务`);

  // 为每个项目创建Bug
  console.log('\n创建Bug数据...');
  const bugStatusPool = ['待处理', '处理中', '待审核', '已解决', '已关闭', '已取消'];
  const bugSeverityPool = ['严重', '高', '中', '低'];
  let totalBugs = 0;

  const bugTemplates = [
    '登录功能异常',
    '页面加载缓慢',
    '数据展示错误',
    '接口返回异常',
    '权限验证失败',
    '文件上传失败',
    '支付流程异常',
    '消息推送失败',
    '搜索功能异常',
    '报表数据不准确',
  ];

  for (const project of projects) {
    const bugCount = project.status === '已完成' ? 8 : project.status === '进行中' ? 12 : 5;
    const projectBugs = [];

    for (let i = 0; i < bugCount; i++) {
      const assignee = rand(project.members);
      const status = rand(bugStatusPool);
      const severity = rand(bugSeverityPool);
      const daysAgo = rand([1, 2, 3, 5, 7, 10, 15]);
      const daysLater = rand([1, 3, 5, 7, 10]);

      const bugName = `${bugTemplates[i % bugTemplates.length]} - ${project.name}`;
      const isResolved = status === '已解决' || status === '已关闭';

      projectBugs.push({
        project: project._id,
        bugName,
        bugDetails: `${bugName}的详细描述，严重程度为${severity}，需要尽快处理`,
        assignee,
        createdBy: project.leader,
        severity,
        status,
        startDate: new Date(now - daysAgo * day),
        deadline: new Date(now + daysLater * day),
        ...(isResolved
          ? {
              solution: '已通过代码修复解决该问题，经过测试验证无误',
              resolvedBy: assignee,
              resolvedAt: new Date(now - 1 * day),
              approvalStatus: '通过',
              reviewer: project.leader,
              reviewComment: '修复方案合理，测试通过',
              reviewedAt: new Date(now - 1 * day),
            }
          : {
              approvalStatus: status === '待审核' ? '待审核' : '待审核',
            }),
        createdAt: new Date(now - daysAgo * day),
      });
    }

    await Bug.insertMany(projectBugs);
    totalBugs += projectBugs.length;
  }
  console.log(`✓ 创建了 ${totalBugs} 个Bug`);

  // 统计成员数
  const allMemberIds = new Set();
  const allProjects = await Project.find().select('leader members').lean();
  allProjects.forEach((p) => {
    if (p.leader) allMemberIds.add(p.leader.toString());
    if (Array.isArray(p.members)) {
      p.members.forEach((m) => {
        if (m) allMemberIds.add(m.toString());
      });
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log('数据初始化完成！');
  console.log('='.repeat(50));
  console.log(`用户数: ${userDocs.length}`);
  console.log(`项目数: ${projects.length}`);
  console.log(`任务数: ${totalTasks}`);
  console.log(`Bug数: ${totalBugs}`);
  console.log(`总成员数: ${allMemberIds.size}`);
  console.log('\n登录信息：');
  console.log('管理员账号: admin / project_manager');
  console.log('密码: 123456');
  console.log('\n提示：登录后可在数据概览页面查看统计信息');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('初始化失败：', err);
  mongoose.connection.close();
  process.exit(1);
});

