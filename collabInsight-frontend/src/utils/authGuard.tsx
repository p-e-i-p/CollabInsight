import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { message } from 'antd';
import { auth } from './http';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * 路由守卫组件，用于保护需要登录才能访问的页面
 * 如果用户未登录，则重定向到登录页
 * 如果用户已登录，则渲染子组件
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const location = useLocation();

  // 检查用户是否已登录
  const isLoggedIn = auth.isLogin();
  const userRole = sessionStorage.getItem('userRole');
  const currentPath = location.pathname;

  // 如果用户未登录，重定向到登录页
  if (!isLoggedIn) {
    // 保存当前路径，登录后可以跳转回来
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 检查是否是人员管理页面，如果是，检查用户是否是管理员
  if (currentPath.includes('user-management') && userRole !== 'admin') {
    message.error('您没有权限访问此页面');
    return <Navigate to="/" replace />;
  }

  // 用户已登录且有权限，渲染子组件
  return <>{children}</>;
};
