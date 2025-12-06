import React, { useEffect, useState } from 'react';
import type MenuItem from 'antd/es/menu/MenuItem';
import {
  BugOutlined,
  MessageOutlined,
  PieChartOutlined,
  MenuFoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { auth } from '@/utils/http';
import type { UserProfile } from '@/request/type';
type MenuItem = Required<MenuProps>['items'][number];

export const menuItems: MenuItem[] = [];

// 动态生成菜单项
export const generateMenuItems = (): MenuItem[] => {
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';
  console.log('用户角色:', userRole, '是否管理员:', isAdmin);
  
  // 如果用户角色不存在，默认为普通用户
  const finalUserRole = userRole || 'user';
  
  const baseItems: MenuItem[] = [
    {
      key: '/',
      icon: <PieChartOutlined />,
      label: '数据概览',
      className: 'py-6',
    },
    {
      key: 'task-center',
      icon: <MenuFoldOutlined />,
      label: '任务中心',
      className: 'py-6',
    },
    {
      key: 'message',
      icon: <MessageOutlined />,
      label: '消息中心',
      className: 'py-6',
    },
    {
      key: 'bug',
      icon: <BugOutlined />,
      label: 'Bug管理',
      className: 'py-6',
    },
  ];
  
  // 如果是管理员，添加人员管理菜单项
  if (finalUserRole === 'admin') {
    baseItems.push({
      key: 'user-management',
      icon: <UserOutlined />,
      label: '人员管理',
      className: 'py-6',
    });
  }
  
  return baseItems;
};
