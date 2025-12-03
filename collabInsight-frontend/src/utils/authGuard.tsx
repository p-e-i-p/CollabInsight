import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import auth from './http';

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

  // 如果用户未登录，重定向到登录页
  if (!isLoggedIn) {
    // 保存当前路径，登录后可以跳转回来
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 用户已登录，渲染子组件
  return <>{children}</>;
};
