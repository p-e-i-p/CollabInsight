// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';

import './index.css'; // Tailwind 基础样式

import { App } from './App';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App></App>
  </React.StrictMode>
);
