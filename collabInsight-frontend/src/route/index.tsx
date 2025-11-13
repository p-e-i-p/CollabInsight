import { createBrowserRouter, Navigate } from 'react-router-dom';
import React from 'react';

// 导入页面组件（注意：如果组件是默认导出，需用 import Home from 'xxx'；命名导出用 import { Home } from 'xxx'）
import { Home } from '@/views/home/Home';
import { Login } from '@/views/login/Login';
import { TaskCenter } from '@/views/center/TaskCenter';
import { Message } from '@/views/message/Message';
import { Bug } from '@/views/bug/Bug';
import { NotFound } from '@/views/otherPage/NotFound';

// 路由规则：修复语法错误 + 优化逻辑
export const routes = [
  // 1. 登录页（公开路由，无嵌套子路由）
  {
    path: '/login',
    element: <Login />,
    meta: { title: '登录页' },
  },

  // 2. 主路由（登录后访问，嵌套子路由）
  {
    path: '/',
    element: <Home />, // 根路径默认显示首页（替代之前的 Login 作为根元素）
    meta: { title: '首页' },
    children: [
      // 子路由：路径无需加 "/"，自动拼接父路径（如 "task-center" → "/task-center"）
      {
        path: 'task-center', // 规范路径：小写+中划线（替代大写 /TASKCENTER）
        element: <TaskCenter />,
        meta: { title: '任务中心' },
      },
      {
        path: 'message', // 规范路径：小写（替代大写 /MESSAGE）
        element: <Message />,
        meta: { title: '消息中心' },
      },
      {
        path: 'bug', // 规范路径：小写（替代大写 /BUG）
        element: <Bug />,
        meta: { title: 'Bug管理' },
      },
      // 重定向：兼容旧的大写路径（如 /TASKCENTER → /task-center）
      {
        path: 'TASKCENTER',
        element: <Navigate to="task-center" replace />,
      },
      {
        path: 'MESSAGE',
        element: <Navigate to="message" replace />,
      },
      {
        path: 'BUG',
        element: <Navigate to="bug" replace />,
      },
    ],
  },

  // 3. 404页面（匹配所有未定义路由）
  {
    path: '*',
    element: <NotFound />,
    meta: { title: '页面未找到' },
  },

  // 4. 根路径重定向（可选：如果想让 / 跳转到登录页，需调整逻辑）
  // {
  //   path: '/',
  //   element: <Navigate to="/login" replace />,
  // },
];

// 创建路由实例
export const router = createBrowserRouter([...routes]);
