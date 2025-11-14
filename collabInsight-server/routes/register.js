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
      return res.status(400).json({ message: '用户已存在' });
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
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
