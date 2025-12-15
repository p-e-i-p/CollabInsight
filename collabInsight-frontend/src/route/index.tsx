import { createBrowserRouter } from 'react-router-dom';

import { lazy } from 'react';
import { AuthGuard } from '@/utils/authGuard';

const Home = lazy(() => import('@/views/home/Home').then((mod) => ({ default: mod.default })));
const Login = lazy(() => import('@/views/login/Login').then((mod) => ({ default: mod.default })));
const Register = lazy(() =>
  import('@/views/register/Register').then((mod) => ({ default: mod.default }))
);
const Dashboard = lazy(() =>
  import('@/views/dashboard/Dashboard').then((mod) => ({ default: mod.default }))
);
const TaskCenter = lazy(() =>
  import('@/views/center/TaskCenter').then((mod) => ({ default: mod.default }))
);
const Message = lazy(() =>
  import('@/views/message/Message').then((mod) => ({ default: mod.default }))
);
const Bug = lazy(() => import('@/views/bug/Bug').then((mod) => ({ default: mod.default })));
const Profile = lazy(() =>
  import('@/views/profile/Profile').then((mod) => ({ default: mod.default }))
);
const UserManagement = lazy(() =>
  import('@/views/userManagement/UserManagement').then((mod) => ({ default: mod.default }))
);
const NotFound = lazy(() =>
  import('@/views/otherPage/NotFound').then((mod) => ({ default: mod.default }))
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
      ,
      {
        path: 'profile',
        element: (
          <AuthGuard>
            <Profile />
          </AuthGuard>
        ),
        meta: { title: '个人中心' },
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
