import React from 'react';
import { Spin } from 'antd';
export const PageLoading = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
      }}
    >
      <Spin size="large" />
    </div>
  );
};
