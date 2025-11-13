// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom'; // 导入 Suspense4
import { router } from './route'; // 导入路由实例
import './index.css'; // Tailwind 基础样式

// 自定义 Ant Design 主题
const antdTheme = {
  token: {
    colorPrimary: '#6C70E6',
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={antdTheme}>
      {/* Suspense：处理懒加载组件的加载状态 */}
      <RouterProvider router={router} /> {/* 仅保留路由提供者 */}
    </ConfigProvider>
  </React.StrictMode>
);
