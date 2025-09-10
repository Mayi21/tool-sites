import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
import './index.css';
import './i18n';

// 在开发环境中导入测试数据生成器
if (import.meta.env.DEV) {
  import('./utils/testDataGenerator.js');
}



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
