const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 连接数据库
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 获取用户模型
const User = require('../models/User');

// 初始化管理员用户
const initAdmin = async () => {
  try {
    // 检查是否已存在管理员用户
    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('管理员用户已存在，无需创建');
      process.exit(0);
    }

    // 创建默认管理员用户
    const admin = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });

    // 保存管理员用户
    await admin.save();

    console.log('管理员用户创建成功');
    console.log('用户名: admin');
    console.log('密码: admin123');
    console.log('请登录后立即修改密码！');

    process.exit(0);
  } catch (error) {
    console.error('创建管理员用户失败:', error);
    process.exit(1);
  }
};

// 执行初始化
initAdmin();
