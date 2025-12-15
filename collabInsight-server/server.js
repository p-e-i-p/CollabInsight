
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// 数据库连接
const connectDB = require('./config/db');

// 路由
const userRoutes = require('./routes/users');
const registerRoutes = require('./routes/register');
const projectRoutes = require('./routes/projects');
const analyticsRoutes = require('./routes/analytics');
const bugRoutes = require('./routes/bugs');

// 初始化 Express 应用
const app = express();

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

// 根路由
app.get('/', (req, res) => {
  res.send('API 服务器正在运行');
});

// 错误处理中间件
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
});

