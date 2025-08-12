// 配置加载器
class ConfigLoader {
  constructor() {
    this.config = null;
    this.loaded = false;
  }

  // 从环境变量读取配置
  loadFromEnv() {
    const config = {};
    
    // 目前无管理员看板，移除相关环境变量读取
    
    return config;
  }

  // 从本地存储读取配置（用于开发环境）
  loadFromLocalStorage() {
    const config = {};
    
    const storedConfig = localStorage.getItem('env_config');
    if (storedConfig) {
      try {
        const parsed = JSON.parse(storedConfig);
        Object.assign(config, parsed);
      } catch (error) {
        console.error('Failed to parse stored config:', error);
      }
    }
    
    return config;
  }

  // 从配置文件读取（已废弃，改为使用环境变量）
  loadFromFile() {
    console.warn('loadFromFile() 已废弃，请使用环境变量配置');
    return {};
  }

  // 获取默认配置（仅用于开发环境）
  getDefaultConfig() {
    if (import.meta.env.DEV) {
      return {};
    }
    return {};
  }

  // 加载配置
  async load() {
    if (this.loaded) {
      return this.config;
    }

    try {
      // 按优先级加载配置
      let config = {};
      
      // 1. 优先从环境变量加载（当前无变量，保持空配置）
      const envConfig = this.loadFromEnv();
      config = { ...config, ...envConfig };
      // 2. 从本地存储加载（开发环境可用）
      const localConfig = this.loadFromLocalStorage();
      config = { ...config, ...localConfig };
      // 3. 默认配置兜底
      config = { ...this.getDefaultConfig(), ...config };

      this.config = config;
      this.loaded = true;
      
      console.log('Final config loaded');
      
      return config;
    } catch (error) {
      console.error('Failed to load config:', error);
      this.config = this.getDefaultConfig();
      this.loaded = true;
      return this.config;
    }
  }

  // 获取配置
  get(key) {
    if (!this.loaded) {
      console.warn('Config not loaded yet, loading now...');
      this.load();
    }
    return this.config[key];
  }

  // 获取所有配置
  getAll() {
    if (!this.loaded) {
      console.warn('Config not loaded yet, loading now...');
      this.load();
    }
    return { ...this.config };
  }

  // 设置配置（用于开发环境）
  set(key, value) {
    if (!this.loaded) {
      this.load();
    }
    this.config[key] = value;
    
    // 保存到本地存储
    try {
      localStorage.setItem('env_config', JSON.stringify(this.config));
    } catch (error) {
      console.error('Failed to save config to localStorage:', error);
    }
  }

  // 重置配置
  reset() {
    this.config = this.getDefaultConfig();
    this.loaded = true;
    
    // 清除本地存储
    try {
      localStorage.removeItem('env_config');
    } catch (error) {
      console.error('Failed to clear config from localStorage:', error);
    }
  }

  // 验证配置
  validate() {
    if (!this.loaded) {
      this.load();
    }
    
    const required = ['admin_username', 'admin_password'];
    const missing = required.filter(key => !this.config[key]);
    
    if (missing.length > 0) {
      console.warn('Missing required config keys:', missing);
      return false;
    }
    
    return true;
  }
}

// 创建全局配置实例
const configLoader = new ConfigLoader();

// 立即加载配置
configLoader.load().then(() => {
  console.log('ConfigLoader initialized successfully');
}).catch(error => {
  console.error('ConfigLoader initialization failed:', error);
});

export default configLoader; 