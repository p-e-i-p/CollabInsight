const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// 获取所有用户
exports.getAllUsers = async (req, res) => {
  try {
    // 确保只有管理员可以访问
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' });
    }

    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取单个用户
exports.getUserById = async (req, res) => {
  try {
    // 确保只有管理员可以访问
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 创建新用户
exports.createUser = async (req, res) => {
  try {
    // 确保只有管理员可以访问
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' });
    }

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

    // 生成令牌
    const token = generateToken(user._id);

    res.status(201).json({
      code: 201,
      msg: '用户创建成功',
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
};

// 更新用户
exports.updateUser = async (req, res) => {
  try {
    // 确保只有管理员可以访问
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' });
    }

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
};

// 删除用户
exports.deleteUser = async (req, res) => {
  try {
    // 确保只有管理员可以访问
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '需要管理员权限' });
    }

    // 不允许删除自己
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: '不能删除自己' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    await user.remove();

    res.status(200).json({
      code: 200,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '服务器错误' });
  }
};
