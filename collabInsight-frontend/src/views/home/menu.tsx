import React from 'react';
import type MenuItem from 'antd/es/menu/MenuItem';
import {
  BugOutlined,
  MessageOutlined,
  PieChartOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
type MenuItem = Required<MenuProps>['items'][number];
export const menuItems: MenuItem[] = [
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
