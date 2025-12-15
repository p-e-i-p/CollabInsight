
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Bug = require('../models/Bug');
const Project = require('../models/Project');
const User = require('../models/User');

dotenv.config();

// 支持独立的 Bug 库（优先 BUG_MONGODB_URI，其次 MONGODB_URI，最后本地默认）
const MONGO_URI =
  process.env.BUG_MONGODB_URI ||
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/collabInsight';

// 可通过环境变量指定种子使用的项目 ID（未指定则取第一个项目）
const TARGET_PROJECT_ID = process.env.SEED_PROJECT_ID;

// 连接数据库
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const initializeBugs = async () => {
  try {
    console.log('开始初始化Bug数据...');

    // 获取项目
    const project = TARGET_PROJECT_ID
      ? await Project.findById(TARGET_PROJECT_ID)
      : await Project.findOne();
    const user = await User.findOne();
    const leader = await User.findOne({ role: 'admin' });

    if (!project) {
      console.log('未找到项目，请先创建项目或设置 SEED_PROJECT_ID');
      return;
    }

    if (!user) {
      console.log('未找到用户，请先注册用户');
      return;
    }

    if (!leader) {
      console.log('未找到管理员用户');
      return;
    }

    console.log(`使用项目: ${project.name}, 用户: ${user.username}, 管理员: ${leader.username}`);

    // 检查是否已有Bug数据
    const existingBugs = await Bug.countDocuments();
    if (existingBugs > 0) {
      console.log(`已存在 ${existingBugs} 条Bug记录，跳过初始化`);
      return;
    }

    // 创建示例bug
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const bugs = [
      {
        project: project._id,
        bugName: '登录页面样式错乱',
        bugDetails: '在Chrome浏览器中，登录按钮位置偏移，导致用户无法点击',
        assignee: user._id,
        createdBy: user._id,
        severity: '高',
        status: '已解决',
        solution: '修复了CSS定位问题，调整了按钮的margin和padding值',
        resolvedBy: user._id,
        resolvedAt: new Date(now - 2 * day), // 2天前
        approvalStatus: '通过',
        reviewer: leader._id,
        reviewComment: '已验证修复效果良好',
        reviewedAt: new Date(now - 1 * day), // 1天前
        startDate: new Date(now - 3 * day), // 3天前
        deadline: new Date(now - 1 * day), // 1天前
      },
      {
        project: project._id,
        bugName: '数据导出功能异常',
        bugDetails: '导出Excel时部分数据格式不正确，日期显示为数字',
        assignee: user._id,
        createdBy: leader._id,
        severity: '中',
        status: '处理中',
        startDate: new Date(now - 1 * day), // 1天前
        deadline: new Date(now + 2 * day), // 2天后
      },
      {
        project: project._id,
        bugName: '系统响应缓慢',
        bugDetails: '在处理大量数据时，系统响应时间超过5秒',
        assignee: leader._id,
        createdBy: user._id,
        severity: '严重',
        status: '待处理',
        startDate: new Date(),
        deadline: new Date(now + 3 * day), // 3天后
      },
      {
        project: project._id,
        bugName: '搜索功能无法使用特殊字符',
        bugDetails: '当搜索关键词包含@、#等特殊字符时，搜索功能失效',
        assignee: user._id,
        createdBy: leader._id,
        severity: '低',
        status: '待审核',
        solution: '修改了搜索查询逻辑，对特殊字符进行转义处理',
        resolvedBy: user._id,
        resolvedAt: new Date(),
        approvalStatus: '待审核',
        reviewer: leader._id,
        startDate: new Date(now - 4 * day), // 4天前
        deadline: new Date(now - 1 * day), // 1天前
      }
    ];

    await Bug.insertMany(bugs);
    console.log(`成功初始化 ${bugs.length} 条Bug数据`);

    // 打印创建的Bug信息
    for (const bug of bugs) {
      console.log(`- ${bug.bugName} (${bug.severity}): ${bug.status}`);
    }
  } catch (error) {
    console.error('初始化Bug数据失败:', error);
  } finally {
    mongoose.connection.close();
    console.log('Bug数据初始化完成，数据库连接已关闭');
  }
};

initializeBugs();
