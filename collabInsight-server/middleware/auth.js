const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 检查请求头中是否有 token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // 获取 token
      token = req.headers.authorization.split(' ')[1];

      // 验证 token
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({ message: '未授权，令牌无效' });
      }

      // 获取用户信息，但不包含密码
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ message: '未授权，用户不存在' });
      }
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: '未授权，令牌无效' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: '未授权，缺少令牌' });
  }
};

// 管理员权限中间件
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: '需要管理员权限' });
  }
};

module.exports = { protect, admin };
