const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB 连接成功: ${conn.connection.host}`);
    
    // 检查用户集合
    const User = require('../models/User');
    console.log('\n检查用户集合...');
    
    // 获取用户总数
    const userCount = await User.countDocuments();
    console.log(`用户总数: ${userCount}`);
    
    if (userCount === 0) {
      console.log('用户集合为空，创建测试用户...');
      // 创建测试用户
      const testUser = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        nickname: '管理员',
      });
      
      await testUser.save();
      console.log('测试用户创建成功');
      
      // 创建普通用户
      const normalUser = new User({
        username: 'user',
        email: 'user@example.com',
        password: 'user123',
        role: 'user',
        nickname: '普通用户',
      });
      
      await normalUser.save();
      console.log('普通用户创建成功');
      
      // 再次获取用户总数
      const newUserCount = await User.countDocuments();
      console.log(`新用户总数: ${newUserCount}`);
    } else {
      // 获取所有用户
      const users = await User.find().select('-password');
      console.log('用户列表:', users);
    }
    
    // 关闭数据库连接
    await mongoose.disconnect();
    console.log('\n数据库连接已关闭');
    process.exit(0);
  } catch (error) {
    console.error(`MongoDB 连接失败: ${error.message}`);
    process.exit(1);
  }
};

connectDB();