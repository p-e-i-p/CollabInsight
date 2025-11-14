const express = require('express');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    用户登录
// @route   POST /login
// @access  公开
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 检查用户是否存在
    const user = await User.findOne({ $or: [{ email: username }, { username }] }).select('+password');
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 检查密码是否匹配
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 生成令牌
    const token = generateToken(user._id);

    res.status(200).json({
      code: 200,
      data: {
        token,
        userInfo: {
          _id: user._id,
          username: user.username,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// @desc    获取当前登录用户信息
// @route   GET /userInfo
// @access  私有
router.get('/userInfo', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.status(200).json({
      code: 200,
      token: req.headers.authorization?.split(' ')[1] || '',
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
