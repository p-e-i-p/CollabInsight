const express = require('express');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const router = express.Router();

// @desc    注册新用户
// @route   POST /register
// @access  公开
router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ code: 400, message: '用户名或邮箱已被注册' });
    }

    // 创建新用户
    const user = await User.create({
      username,
      email,
      password,
    });

    // 生成令牌
    const token = generateToken(user._id);

    res.status(201).json({
      code: 201,
      msg: '注册成功',
      token,
      userInfo: {
        _id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    
    // 处理验证错误
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        code: 400, 
        message: messages.join(', ') || '数据验证失败' 
      });
    }
    
    // 处理重复键错误
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        code: 400, 
        message: `${field === 'username' ? '用户名' : '邮箱'}已被使用` 
      });
    }
    
    // 处理其他错误
    res.status(500).json({ 
      code: 500, 
      message: error.message || '服务器错误' 
    });
  }
});

module.exports = router;
