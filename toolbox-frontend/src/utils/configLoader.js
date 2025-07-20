// 配置加载器
class ConfigLoader {
  constructor() {
    this.config = null;
    this.loaded = false;
  }

  // 从环境变量读取配置
  loadFromEnv() {
    const config = {};
    
    // 从环境变量读取（在构建时注入）
    if (import.meta.env.VITE_ADMIN_USERNAME) {
      config.admin_username = import.meta.env.VITE_ADMIN_USERNAME;
    }
    
    if (import.meta.env.VITE_ADMIN_PASSWORD) {
      config.admin_password = import.meta.env.VITE_ADMIN_PASSWORD;
    }
    
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
      return {
        admin_username: 'dev_admin',
        admin_password: 'dev_password_123'
      };
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
      
      // 1. 首先尝试从环境变量加载
      const envConfig = this.loadFromEnv();
      if (envConfig.admin_username && envConfig.admin_password) {
        config = envConfig;
        console.log('Config loaded from environment variables');
      } else {
        // 2. 尝试从配置文件加载（优先于本地存储）
        const fileConfig = this.loadFromFile();
        if (fileConfig.admin_username && fileConfig.admin_password) {
          config = fileConfig;
          console.log('Config loaded from file (env.cfg)');
        } else {
          // 3. 尝试从本地存储加载（开发环境）
          const localConfig = this.loadFromLocalStorage();
          if (localConfig.admin_username && localConfig.admin_password) {
            config = localConfig;
            console.log('Config loaded from local storage');
          } else {
            // 4. 使用默认配置
            config = this.getDefaultConfig();
            console.log('Config loaded from defaults');
          }
        }
      }

      this.config = config;
      this.loaded = true;
      
      console.log('Final admin config:', {
        username: config.admin_username,
        password: config.admin_password ? '***' : 'undefined'
      });
      
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