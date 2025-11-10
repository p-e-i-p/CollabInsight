import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import App from './App.tsx';
import './index.css';

// 自定义 Ant Design 主题（例如修改主色调为科技蓝）
const antdTheme = {
  token: {
    colorPrimary: '#1890ff', // 主色调
  },
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={antdTheme}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);