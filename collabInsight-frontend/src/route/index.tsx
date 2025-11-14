import { createBrowserRouter, Navigate } from 'react-router-dom';
import React from 'react';

import { lazy } from 'react';

const Home = lazy(() => import('@/views/home/Home').then((mod) => ({ default: mod.Home })));
const Login = lazy(() => import('@/views/login/Login').then((mod) => ({ default: mod.Login })));
const Register = lazy(() => import('@/views/register/Register').then((mod) => ({ default: mod.Register })));
const TaskCenter = lazy(() =>
  import('@/views/center/TaskCenter').then((mod) => ({ default: mod.TaskCenter }))
);
const Message = lazy(() =>
  import('@/views/message/Message').then((mod) => ({ default: mod.Message }))
);
const Bug = lazy(() => import('@/views/bug/Bug').then((mod) => ({ default: mod.Bug })));
const NotFound = lazy(() =>
  import('@/views/otherPage/NotFound').then((mod) => ({ default: mod.NotFound }))
);
export const routes = [
  {
    path: '/login',
    element: <Login />,
    meta: { title: '登录页' },
  },
  {
    path: '/register',
    element: <Register />,
    meta: { title: '注册页' },
  },

  {
    path: '/',
    element: <Home />,
    meta: { title: '首页' },
    children: [
      {
        path: 'task-center',
        element: <TaskCenter />,
        meta: { title: '任务中心' },
      },
      {
        path: 'message',
        element: <Message />,
        meta: { title: '消息中心' },
      },
      {
        path: 'bug',
        element: <Bug />,
        meta: { title: 'Bug管理' },
      },
    ],
  },

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
