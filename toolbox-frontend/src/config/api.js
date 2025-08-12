import { getEnvConfig, log } from '../utils/env.js';

// API配置
const API_CONFIG = {
  // 后端API基础URL
  // 优先从环境变量 API_URL 获取；本地开发缺失时回退到 http://localhost:8787
  BASE_URL: (() => {
    const envApiUrl = import.meta.env.API_URL;
    if (envApiUrl && typeof envApiUrl === 'string' && envApiUrl.trim().length > 0) {
      log.info('Using API_URL from environment:', envApiUrl);
      return envApiUrl.trim();
    }

    // 本地开发默认值
    const localDefault = 'http://localhost:8787';
    if (import.meta.env.DEV) {
      log.info('API_URL not set. Using local default:', localDefault);
      return localDefault;
    }

    // 生产/预览环境如果未设置，仍回退到本地默认以避免崩溃
    log.warn('API_URL not set in environment. Falling back to local default:', localDefault);
    return localDefault;
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