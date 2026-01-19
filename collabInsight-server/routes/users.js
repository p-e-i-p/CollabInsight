const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// 配置multer用于头像上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads/avatars');
    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // 使用用户ID和文件扩展名作为文件名
    const userId = req.user.id;
    const ext = path.extname(file.originalname);
    cb(null, `${userId}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 2 // 限制2MB
  },
  fileFilter: (req, file, cb) => {
    // 检查文件类型
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

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
      token,
      userInfo: {
        _id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message || '服务器错误' });
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

// @desc    修改用户密码
// @route   POST /change-password
// @access  私有
router.post('/change-password', protect, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // 检查是否提供了旧密码和新密码
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: '请提供旧密码和新密码' });
    }
    
    // 检查新密码长度是否符合要求
    if (newPassword.length < 6) {
      return res.status(400).json({ message: '新密码长度至少为6位' });
    }
    
    // 查找当前用户
    const user = await User.findById(req.user.id).select('+password');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 验证旧密码是否正确
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ message: '旧密码错误' });
    }
    
    // 更新密码
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      code: 200,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// @desc    获取用户详细信息
// @route   GET /profile
// @access  私有
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.status(200).json({
      code: 200,
      data: {
        _id: user._id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        gender: user.gender,

        bio: user.bio,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// @desc    更新用户信息
// @route   PUT /profile
// @access  私有
router.put('/profile', protect, async (req, res) => {
  try {
    const { nickname, gender, bio } = req.body;

    // 查找当前用户
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 更新用户信息
    if (nickname !== undefined) user.nickname = nickname;
    if (gender !== undefined) user.gender = gender;

    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.status(200).json({
      code: 200,
      message: '个人信息更新成功',
      data: {
        _id: user._id,
        username: user.username,
        nickname: user.nickname,
        avatar: user.avatar,
        gender: user.gender,

        bio: user.bio
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// @desc    上传用户头像
// @route   POST /avatar
// @access  私有
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请选择要上传的头像' });
    }

    // 构建头像URL
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    // 更新用户头像
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 删除旧头像文件（如果存在）
    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '../..', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    user.avatar = avatarUrl;
    await user.save();

    res.status(200).json({
      code: 200,
      message: '头像上传成功',
      data: {
        avatar: avatarUrl
      }
    });
  } catch (error) {
    console.error(error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: '文件大小不能超过2MB' });
    }
    res.status(500).json({ message: '服务器错误' });
  }
});

// @desc    搜索用户（用户名或ID，模糊），用于项目成员选择
// @route   GET /search
// @access  私有(管理员/组长)
router.get('/search', protect, async (req, res) => {
  try {
    const { keyword = '' } = req.query;
    console.log('搜索用户请求，关键词:', keyword);
    
    let users;
    if (!keyword || keyword.trim() === '') {
      // 如果关键词为空，返回所有用户（限制数量）
      console.log('搜索所有用户');
      users = await User.find()
        .select('_id username role')
        .limit(50)
        .sort({ username: 1 }); // 按用户名排序
    } else {
      // 有关键词时进行搜索
      const trimmedKeyword = keyword.trim();
      console.log('搜索关键词:', trimmedKeyword);
      const regex = new RegExp(trimmedKeyword, 'i');
      const conditions = [{ username: regex }];

      // 仅当 keyword 是合法 ObjectId 时才按 _id 查询，避免 CastError
      if (mongoose.Types.ObjectId.isValid(trimmedKeyword)) {
        console.log('关键词是有效的ObjectId，添加_id查询条件');
        try {
          const objectId = new mongoose.Types.ObjectId(trimmedKeyword);
          conditions.push({ _id: objectId });
        } catch (err) {
          console.log('ObjectId转换失败，跳过_id查询:', err);
        }
      }

      users = await User.find({ $or: conditions })
        .select('_id username role')
        .limit(50)
        .sort({ username: 1 }); // 按用户名排序
    }

    console.log('找到用户数量:', users.length);
    res.status(200).json({ code: 200, data: users });
  } catch (error) {
    console.error('搜索用户错误详情:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({ 
      code: 500,
      message: error.message || '搜索用户失败',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// @desc    获取所有用户
// @route   GET /users
// @access  私有(管理员)
router.get('/users', protect, admin, async (req, res) => {
  try {
    console.log('开始获取用户列表...');
    const users = await User.find().select('-password');
    console.log(`找到 ${users.length} 个用户`);
    console.log('用户列表:', users);
    res.status(200).json(users);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// @desc    获取单个用户
// @route   GET /users/:id
// @access  私有(管理员)
router.get('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// @desc    创建新用户
// @route   POST /users
// @access  私有(管理员)
router.post('/users', protect, admin, async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // 检查用户是否已存在
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) {
      return res.status(400).json({ message: '用户名或邮箱已被注册' });
    }

    // 创建新用户
    const user = await User.create({
      username,
      email,
      password,
      role: role || 'user',
    });

    res.status(201).json({
      code: 201,
      message: '用户创建成功',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// @desc    更新用户
// @route   PUT /users/:id
// @access  私有(管理员)
router.put('/users/:id', protect, admin, async (req, res) => {
  try {
    const { username, email, role } = req.body;

    // 查找用户
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 检查用户名或邮箱是否已被其他用户使用
    if (username || email) {
      const existingUser = await User.findOne({ 
        $or: [{ email }, { username }], 
        _id: { $ne: req.params.id } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: '用户名或邮箱已被使用' });
      }
    }

    // 更新用户信息
    if (username) user.username = username;
    if (email) user.email = email;
    if (role) user.role = role;

    await user.save();

    res.status(200).json({
      code: 200,
      message: '用户信息更新成功',
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// @desc    删除用户
// @route   DELETE /users/:id
// @access  私有(管理员)
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    // 不允许删除自己
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: '不能删除自己' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      code: 200,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router;
