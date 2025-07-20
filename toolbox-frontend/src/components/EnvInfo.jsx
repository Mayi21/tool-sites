import React from 'react';
import { Card, Descriptions, Tag, Alert } from 'antd';
import { 
  getEnvInfo, 
  getCurrentEnv, 
  isDevelopment, 
  isProduction, 
  isPreview,
  getEnvConfig,
  getCurrentApiUrl
} from '../utils/env.js';

const EnvInfo = () => {
  const envInfo = getEnvInfo();
  const envConfig = getEnvConfig();
  const currentEnv = getCurrentEnv();
  const currentApiUrl = getCurrentApiUrl();

  const getEnvColor = (env) => {
    switch (env) {
      case 'development':
        return 'blue';
      case 'production':
        return 'green';
      case 'preview':
        return 'orange';
      default:
        return 'default';
    }
  };

  const getEnvIcon = (env) => {
    switch (env) {
      case 'development':
        return '🔧';
      case 'production':
        return '🚀';
      case 'preview':
        return '👀';
      default:
        return '❓';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>环境信息</h1>
      
      <Alert
        message={`当前环境: ${getEnvIcon(currentEnv)} ${currentEnv.toUpperCase()}`}
        description={`运行模式: ${envInfo.mode} | 调试模式: ${envConfig.debug ? '开启' : '关闭'}`}
        type={currentEnv === 'production' ? 'success' : currentEnv === 'development' ? 'info' : 'warning'}
        showIcon
        style={{ marginBottom: '20px' }}
      />

      <Card title="环境检测结果" style={{ marginBottom: '20px' }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="当前环境">
            <Tag color={getEnvColor(currentEnv)}>
              {getEnvIcon(currentEnv)} {currentEnv}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="环境模式">
            {envInfo.mode}
          </Descriptions.Item>
          <Descriptions.Item label="是否为开发环境">
            <Tag color={isDevelopment() ? 'green' : 'red'}>
              {isDevelopment() ? '是' : '否'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="是否为生产环境">
            <Tag color={isProduction() ? 'green' : 'red'}>
              {isProduction() ? '是' : '否'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="是否为预览环境">
            <Tag color={isPreview() ? 'green' : 'red'}>
              {isPreview() ? '是' : '否'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="基础URL">
            {envInfo.baseUrl}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="API配置" style={{ marginBottom: '20px' }}>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="环境变量API地址">
            {envInfo.apiBaseUrl || '未设置'}
          </Descriptions.Item>
          <Descriptions.Item label="实际API地址">
            {currentApiUrl}
          </Descriptions.Item>
          <Descriptions.Item label="调试模式">
            <Tag color={envConfig.debug ? 'green' : 'red'}>
              {envConfig.debug ? '开启' : '关闭'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="日志级别">
            <Tag color="blue">{envConfig.logLevel}</Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="Vite环境变量" style={{ marginBottom: '20px' }}>
        <Descriptions bordered column={2}>
          <Descriptions.Item label="MODE">
            {import.meta.env.MODE}
          </Descriptions.Item>
          <Descriptions.Item label="DEV">
            <Tag color={import.meta.env.DEV ? 'green' : 'red'}>
              {import.meta.env.DEV ? 'true' : 'false'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="PROD">
            <Tag color={import.meta.env.PROD ? 'green' : 'red'}>
              {import.meta.env.PROD ? 'true' : 'false'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="BASE_URL">
            {import.meta.env.BASE_URL}
          </Descriptions.Item>
          <Descriptions.Item label="VITE_API_BASE_URL">
            {import.meta.env.VITE_API_BASE_URL || '未设置'}
          </Descriptions.Item>
          <Descriptions.Item label="SSR">
            <Tag color={import.meta.env.SSR ? 'green' : 'red'}>
              {import.meta.env.SSR ? 'true' : 'false'}
            </Tag>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="环境说明">
        <div>
          <h4>环境类型说明：</h4>
          <ul>
            <li><strong>开发环境 (development)</strong>：本地开发时使用，API指向本地服务器</li>
            <li><strong>生产环境 (production)</strong>：正式部署时使用，API指向生产服务器</li>
            <li><strong>预览环境 (preview)</strong>：预览部署时使用，API指向生产服务器但开启调试</li>
          </ul>
          
          <h4>API地址选择逻辑：</h4>
          <ol>
            <li><strong>生产环境</strong>：强制使用 <code>https://throbbing-forest-04a1.xaoohii.workers.dev</code></li>
            <li><strong>开发环境</strong>：优先使用 <code>VITE_API_BASE_URL</code> 环境变量</li>
            <li><strong>开发环境</strong>：如果未设置环境变量，使用 <code>http://localhost:8787</code></li>
          </ol>
          
          <h4>调试信息：</h4>
          <ul>
            <li><strong>当前环境变量:</strong> <code>VITE_API_BASE_URL = {import.meta.env.VITE_API_BASE_URL || '未设置'}</code></li>
            <li><strong>生产环境检测:</strong> <code>import.meta.env.PROD = {import.meta.env.PROD ? 'true' : 'false'}</code></li>
            <li><strong>开发环境检测:</strong> <code>import.meta.env.DEV = {import.meta.env.DEV ? 'true' : 'false'}</code></li>
            <li><strong>最终API地址:</strong> <code>{currentApiUrl}</code></li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default EnvInfo; 