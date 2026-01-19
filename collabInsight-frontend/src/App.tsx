import React, { Suspense } from 'react';

import { ConfigProvider } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { router } from './route';
import {PageLoading} from './components/loading/PageLoading';
// 自定义 Ant Design 主题
const antdTheme = {
  token: {
    colorPrimary: '#6c70e6',
  },
};
export const App = () => {
  return (
    <>
      <ConfigProvider theme={antdTheme}>
        <Suspense fallback={<PageLoading />}>
          <RouterProvider router={router} /> {/* 仅保留路由提供者 */}
        </Suspense>
      </ConfigProvider>
    </>
  );
};
