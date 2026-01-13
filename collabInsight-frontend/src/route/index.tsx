import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import { AuthGuard } from '@/utils/authGuard';

// 使用更简洁的动态import语法进行路由懒加载
const Home = lazy(() => import('@/views/home/Home'));
const Login = lazy(() => import('@/views/login/Login'));
const Register = lazy(() => import('@/views/register/Register'));
const Dashboard = lazy(() => import('@/views/dashboard/Dashboard'));
const TaskCenter = lazy(() => import('@/views/center/TaskCenter'));
const Message = lazy(() => import('@/views/message/Message'));
const Bug = lazy(() => import('@/views/bug/Bug'));
const UserManagement = lazy(() => import('@/views/userManagement/UserManagement'));
const NotFound = lazy(() => import('@/views/otherPage/NotFound'));
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
    element: (
      <AuthGuard>
        <Home />
      </AuthGuard>
    ),
    meta: { title: '首页' },
    children: [
      {
        index: true,
        element: (
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        ),
        meta: { title: '数据概览' },
      },
      {
        path: 'task-center',
        element: (
          <AuthGuard>
            <TaskCenter />
          </AuthGuard>
        ),
        meta: { title: '任务中心' },
      },
      {
        path: 'message',
        element: (
          <AuthGuard>
            <Message />
          </AuthGuard>
        ),
        meta: { title: '消息中心' },
      },
      {
        path: 'bug',
        element: (
          <AuthGuard>
            <Bug />
          </AuthGuard>
        ),
        meta: { title: 'Bug管理' },
      },
      {
        path: 'user-management',
        element: (
          <AuthGuard>
            <UserManagement />
          </AuthGuard>
        ),
        meta: { title: '人员管理' },
      },
    ],
  },

  {
    path: '*',
    element: <NotFound />,
    meta: { title: '页面未找到' },
  },
];

// 创建路由实例
export const router = createBrowserRouter([...routes]);
