
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

// 数据库连接
const connectDB = require('./config/db');
const { verifyToken } = require('./utils/jwt');
const User = require('./models/User');

// 路由
const userRoutes = require('./routes/users');
const registerRoutes = require('./routes/register');
const projectRoutes = require('./routes/projects');
const analyticsRoutes = require('./routes/analytics');
const bugRoutes = require('./routes/bugs');
const messageRoutes = require('./routes/messages');

// 初始化 Express 应用
const app = express();

// 创建 HTTP 服务器（用于挂载 Socket.IO）
const server = http.createServer(app);

// 连接数据库
connectDB();

// 中间件
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由
app.use('/api', userRoutes);
app.use('/api/userInfo', userRoutes);
app.use('/api/register', registerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bugs', bugRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/messages', messageRoutes);

// 根路由
app.get('/', (req, res) => {
  res.send('API 服务器正在运行');
});

// 错误处理中间件
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// ================= Socket.IO 实时通信 =================
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Socket 级别的鉴权：使用与 HTTP 相同的 JWT
io.use(async (socket, next) => {
  try {
    const authToken =
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization || '').toString().replace(/^Bearer\s+/i, '');

    if (!authToken) {
      return next(new Error('未授权，缺少令牌'));
    }

    const decoded = verifyToken(authToken);
    if (!decoded) {
      return next(new Error('未授权，令牌无效'));
    }

    const user = await User.findById(decoded.id).select('_id username');
    if (!user) {
      return next(new Error('未授权，用户不存在'));
    }

    // 挂在到 socket 上，后续事件里直接使用
    socket.user = {
      id: user._id.toString(),
      username: user.username,
    };

    next();
  } catch (error) {
    console.error('Socket 鉴权失败', error);
    next(new Error('未授权'));
  }
});

// 按项目房间的协作消息
io.on('connection', (socket) => {
  console.log('Socket 已连接:', socket.user);

  // 加入项目房间
  socket.on('joinProject', (projectId) => {
    if (!projectId) return;
    const room = `project:${projectId}`;
    socket.join(room);
    console.log(`用户 ${socket.user?.username} 加入房间 ${room}`);
  });

  // 退出项目房间
  socket.on('leaveProject', (projectId) => {
    if (!projectId) return;
    const room = `project:${projectId}`;
    socket.leave(room);
    console.log(`用户 ${socket.user?.username} 离开房间 ${room}`);
  });

  // 项目消息广播
  socket.on('projectMessage', async (payload) => {
    const { projectId, content, type = 'text' } = payload || {};
    if (!projectId || !content || !socket.user) return;

    try {
      // 持久化到数据库
      const Message = require('./models/Message');
      const created = await Message.create({
        project: projectId,
        sender: socket.user.id,
        content,
        type,
      });

      const message = {
        id: created._id.toString(),
        projectId: created.project.toString(),
        senderId: socket.user.id,
        senderName: socket.user.username,
        content: created.content,
        type: created.type,
        createdAt: created.createdAt,
      };

      // 向项目房间内所有成员广播
      io.to(`project:${projectId}`).emit('projectMessage', message);
    } catch (error) {
      console.error('保存项目消息失败', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket 已断开:', socket.user);
  });
});

server.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});
