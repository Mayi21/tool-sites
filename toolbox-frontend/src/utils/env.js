/**
 * 环境检测工具
 * 提供统一的环境检测方法
 */

// 环境类型枚举
export const ENV_TYPES = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production',
  PREVIEW: 'preview'
};

// 获取当前环境类型
export const getCurrentEnv = () => {
  if (import.meta.env.PROD) {
    return ENV_TYPES.PRODUCTION;
  }
  if (import.meta.env.DEV) {
    return ENV_TYPES.DEVELOPMENT;
  }
  // 预览环境（如 Cloudflare Pages 的预览部署）
  if (import.meta.env.MODE === 'preview') {
    return ENV_TYPES.PREVIEW;
  }
  return ENV_TYPES.DEVELOPMENT;
};

// 检查是否为开发环境
export const isDevelopment = () => {
  return import.meta.env.DEV;
};

// 检查是否为生产环境
export const isProduction = () => {
  return import.meta.env.PROD;
};

// 检查是否为预览环境
export const isPreview = () => {
  return import.meta.env.MODE === 'preview';
};

// 获取环境信息
export const getEnvInfo = () => {
  return {
    mode: import.meta.env.MODE,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    baseUrl: import.meta.env.BASE_URL,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
    currentEnv: getCurrentEnv()
  };
};

// 根据环境获取配置
export const getEnvConfig = () => {
  const env = getCurrentEnv();
  
  const configs = {
    [ENV_TYPES.DEVELOPMENT]: {
      apiBaseUrl: 'http://localhost:8787',
      debug: true,
      logLevel: 'debug'
    },
    [ENV_TYPES.PRODUCTION]: {
      apiBaseUrl: 'https://throbbing-forest-04a1.xaoohii.workers.dev',
      debug: false,
      logLevel: 'error'
    },
    [ENV_TYPES.PREVIEW]: {
      apiBaseUrl: 'https://throbbing-forest-04a1.xaoohii.workers.dev',
      debug: true,
      logLevel: 'warn'
    }
  };
  
  return configs[env] || configs[ENV_TYPES.DEVELOPMENT];
};

// 获取当前API地址（与API配置保持一致）
export const getCurrentApiUrl = () => {
  // 生产环境强制使用生产API地址
  if (import.meta.env.PROD) {
    return 'https://throbbing-forest-04a1.xaoohii.workers.dev';
  }
  
  // 开发环境：如果设置了环境变量，使用环境变量
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 开发环境：使用默认本地地址
  return 'http://localhost:8787';
};

// 日志函数（根据环境调整日志级别）
export const log = {
  debug: (...args) => {
    if (isDevelopment() || isPreview()) {
      console.log('[DEBUG]', ...args);
    }
  },
  info: (...args) => {
    if (isDevelopment() || isPreview()) {
      console.info('[INFO]', ...args);
    }
  },
  warn: (...args) => {
    if (isDevelopment() || isPreview() || isProduction()) {
      console.warn('[WARN]', ...args);
    }
  },
  error: (...args) => {
    // 生产环境也记录错误
    console.error('[ERROR]', ...args);
  }
};

export default {
  getCurrentEnv,
  isDevelopment,
  isProduction,
  isPreview,
  getEnvInfo,
  getEnvConfig,
  log
}; 