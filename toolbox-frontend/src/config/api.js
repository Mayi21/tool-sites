import { getEnvConfig, log } from '../utils/env.js';

// API配置
const API_CONFIG = {
  // 后端API基础URL
  // 根据环境自动选择API地址
  BASE_URL: (() => {
    // 生产环境强制使用生产API地址
    if (import.meta.env.PROD) {
      const prodApiUrl = 'https://toolifyhub-backend.xaoohii.workers.dev';
      log.info('Production environment detected, using:', prodApiUrl);
      return prodApiUrl;
    }
    
    // 开发环境：如果设置了环境变量，使用环境变量
    if (import.meta.env.VITE_API_BASE_URL) {
      log.info('Using VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
      return import.meta.env.VITE_API_BASE_URL;
    }
    
    // 开发环境：使用默认本地地址
    const devApiUrl = 'http://localhost:8787';
    log.info('Development environment, using default:', devApiUrl);
    return devApiUrl;
  })(),
  
  // API端点
  ENDPOINTS: {
    // 访问记录
    ANALYTICS_VISIT: '/api/analytics/visit',
    ANALYTICS_STATS: '/api/analytics/stats',
    ANALYTICS_VISIT_END: '/api/analytics/visit/{id}/end',
    
    // 工具使用记录
    ANALYTICS_TOOL_USAGE: '/api/analytics/tool-usage',
    CRON_NEXT_TIMES: '/api/cron/next-times',
    
    // 管理员操作
    ADMIN_LOGS: '/api/admin/logs'
  },
  
  // 请求配置
  REQUEST_CONFIG: {
    headers: {
      'Content-Type': 'application/json',
    },
    timeout: 10000, // 10秒超时
  },
  
  // 重试配置
  RETRY_CONFIG: {
    maxRetries: 3,
    retryDelay: 1000, // 1秒
  }
};

// 构建完整的API URL
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// 获取API配置
export const getApiConfig = () => {
  return API_CONFIG;
};

// 检查API是否可用
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
      method: 'GET',
      headers: API_CONFIG.REQUEST_CONFIG.headers,
      signal: AbortSignal.timeout(API_CONFIG.REQUEST_CONFIG.timeout)
    });
    return response.ok;
  } catch (error) {
    console.warn('API health check failed:', error);
    return false;
  }
};

// 带重试的API请求
export const apiRequest = async (url, options = {}) => {
  const { maxRetries = API_CONFIG.RETRY_CONFIG.maxRetries, retryDelay = API_CONFIG.RETRY_CONFIG.retryDelay } = options;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...API_CONFIG.REQUEST_CONFIG,
        ...options,
        signal: AbortSignal.timeout(API_CONFIG.REQUEST_CONFIG.timeout)
      });
      
      if (response.ok) {
        return response;
      }
      
      // 如果不是最后一次尝试，等待后重试
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
      }
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }
  
  throw new Error(`API request failed after ${maxRetries + 1} attempts`);
};

export default API_CONFIG; 