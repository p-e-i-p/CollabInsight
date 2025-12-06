const mongoose = require('mongoose');
require('dotenv').config();

// 连接数据库
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 获取用户模型
const User = require('../models/User');

// 重置用户数据
const resetUsers = async () => {
  try {
    // 删除所有用户
    const deleteResult = await User.deleteMany({});
    console.log(`已删除 ${deleteResult.deletedCount} 个用户`);

    // 创建新的管理员用户
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
    console.error('重置用户数据失败:', error);
    process.exit(1);
  }
};

// 执行重置
resetUsers();
