import configLoader from '../utils/configLoader';

// 读取环境配置文件
const loadEnvConfig = async () => {
  try {
    const config = await configLoader.load();
    return config;
  } catch (error) {
    console.error('Failed to load env config:', error);
    // 返回默认配置作为备用
    return {
      admin_username: 'admin',
      admin_password: 'admin123'
    };
  }
};

// 管理员配置
export const ADMIN_CONFIG = {
  // 凭据配置 - 从环境变量读取
  credentials: {
    admin_username: ''
  },
  
  // 会话配置
  session: {
    timeout: 30 * 60 * 1000, // 30分钟
    tokenKey: 'admin_token',
    usernameKey: 'admin_username',
    loginTimeKey: 'admin_login_time'
  },
  
  // 安全配置
  security: {
    enableLogging: true,
    logKey: 'admin_action_logs',
    maxLogEntries: 100
  }
};

// 从环境变量加载凭据
const loadCredentialsFromEnv = () => {
  const username = import.meta.env.VITE_ADMIN_USERNAME;
  
  if (username) {
    ADMIN_CONFIG.credentials.admin_username = username;
    console.log('Admin username loaded from environment variables');
    return true;
  }
  
  return false;
};

// 初始化凭据
export const initCredentials = () => {
  // 优先从环境变量加载
  if (loadCredentialsFromEnv()) {
    return;
  }
  
  // 如果没有环境变量，使用开发环境的默认值（仅用于开发）
  if (import.meta.env.DEV) {
    ADMIN_CONFIG.credentials.admin_username = 'admin';
    console.warn('⚠️ 使用开发环境默认用户名，生产环境请设置环境变量');
  } else {
    console.error('❌ 生产环境缺少管理员用户名环境变量');
    throw new Error('Missing admin username in production environment');
  }
};

// 验证管理员用户名
export const validateAdminUsername = (username) => {
  return username === ADMIN_CONFIG.credentials.admin_username;
};

// 生成管理员令牌
export const generateAdminToken = (username) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `admin_${timestamp}_${random}`;
};

// 验证管理员令牌
export const validateAdminToken = (token) => {
  if (!token) return false;
  
  // 检查令牌格式
  if (!token.startsWith('admin_')) return false;
  
  // 检查令牌是否过期
  const parts = token.split('_');
  if (parts.length !== 3) return false;
  
  const timestamp = parseInt(parts[1]);
  const now = Date.now();
  
  // 检查是否超过会话超时时间
  if (now - timestamp > ADMIN_CONFIG.session.timeout) {
    return false;
  }
  
  return true;
};



// 记录管理员操作日志
export const logAdminAction = (action, details = {}) => {
  if (!ADMIN_CONFIG.security.enableLogging) return;
  
  const log = {
    timestamp: new Date().toISOString(),
    action,
    details,
    userAgent: navigator.userAgent,
    ip: 'client_ip' // 在实际应用中应该获取真实IP
  };
  
  // 保存到本地存储（在实际应用中应该发送到服务器）
  const logs = JSON.parse(localStorage.getItem(ADMIN_CONFIG.security.logKey) || '[]');
  logs.push(log);
  
  // 只保留最近maxLogEntries条日志
  if (logs.length > ADMIN_CONFIG.security.maxLogEntries) {
    logs.splice(0, logs.length - ADMIN_CONFIG.security.maxLogEntries);
  }
  
  localStorage.setItem(ADMIN_CONFIG.security.logKey, JSON.stringify(logs));
};

// 获取管理员操作日志
export const getAdminLogs = () => {
  return JSON.parse(localStorage.getItem(ADMIN_CONFIG.security.logKey) || '[]');
};

// 清除管理员操作日志
export const clearAdminLogs = () => {
  localStorage.removeItem(ADMIN_CONFIG.security.logKey);
}; 