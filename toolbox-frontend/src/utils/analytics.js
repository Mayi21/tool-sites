import { buildApiUrl, apiRequest } from '../config/api.js';

// 访问追踪服务
class AnalyticsService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.visits = this.loadVisits();
    this.currentPage = null;
    this.pageStartTime = null;
    this.currentVisitId = null;
    this.locationCache = new Map(); // 缓存地理位置信息
  }

  // 生成会话ID
  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // 根据页面路径生成页面名称
  generatePageName(pagePath) {
    if (!pagePath) return 'Unknown Page';
    
    // 移除开头的斜杠
    const cleanPath = pagePath.replace(/^\//, '');
    
    if (!cleanPath) return 'Home Page';
    
    // 特殊页面名称映射
    const pageNameMap = {
      '': 'Home Page',
      'base64': 'Base64 Tool',
      'diff': 'Diff Tool',
      'analytics-test': 'Analytics Test',
      
    };
    
    // 检查是否有预定义的名称
    if (pageNameMap[cleanPath]) {
      return pageNameMap[cleanPath];
    }
    
    // 将路径转换为标题格式
    const pageName = cleanPath
      .split('/')
      .map(segment => {
        // 将连字符和下划线转换为空格
        const words = segment.replace(/[-_]/g, ' ');
        // 首字母大写
        return words.charAt(0).toUpperCase() + words.slice(1);
      })
      .join(' - ');
    
    return pageName || 'Unknown Page';
  }

  // 从本地存储加载访问记录
  loadVisits() {
    try {
      const stored = localStorage.getItem('toolbox_visits');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load visits:', error);
      return [];
    }
  }

  // 保存访问记录到本地存储
  saveVisits() {
    try {
      localStorage.setItem('toolbox_visits', JSON.stringify(this.visits));
    } catch (error) {
      console.error('Failed to save visits:', error);
    }
  }

  // 获取用户IP
  async getClientIP() {
    try {
      // 尝试多个IP查询服务，提高成功率
      const services = [
        'https://api.ipify.org?format=json',
        'https://api64.ipify.org?format=json',
        'https://httpbin.org/ip'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(3000)
          });

          if (!response.ok) continue;

          const data = await response.json();
          const ip = data.ip || data.origin;
          
          if (ip && this.isValidIP(ip)) {
            return ip;
          }
        } catch (error) {
          console.warn(`Failed to get IP from ${service}:`, error.message);
          continue;
        }
      }

      // 如果所有服务都失败，使用模拟IP
      return this.generateMockIP();
    } catch (error) {
      console.warn('All IP services failed, using mock IP:', error.message);
      return this.generateMockIP();
    }
  }

  // 验证IP地址格式
  isValidIP(ip) {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }

  // 生成模拟IP地址
  generateMockIP() {
    const segments = [];
    for (let i = 0; i < 4; i++) {
      segments.push(Math.floor(Math.random() * 256));
    }
    return segments.join('.');
  }

  // 获取地理位置信息
  async getLocationInfo(ip) {
    // 检查缓存
    if (this.locationCache.has(ip)) {
      const cached = this.locationCache.get(ip);
      // 缓存有效期1小时
      if (Date.now() - cached.timestamp < 60 * 60 * 1000) {
        return cached.data;
      }
    }

    try {
      // 优先使用后端代理服务获取地理位置
      const response = await apiRequest(buildApiUrl(`/api/analytics/location?ip=${ip}`), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.result) {
          const locationData = {
            country: result.result.country || 'Unknown',
            city: result.result.city || 'Unknown',
            region: result.result.region || 'Unknown'
          };

          // 缓存结果
          this.locationCache.set(ip, {
            data: locationData,
            timestamp: Date.now()
          });

          return locationData;
        }
      }
      
      // 如果后端服务失败，使用模拟数据
      throw new Error('Backend location service failed');
    } catch (error) {
      console.warn('Failed to get location info from backend, using fallback:', error.message);
      // 如果无法获取真实位置，使用模拟数据
      const mockData = this.generateMockLocation();
      
      // 缓存模拟数据（避免重复请求）
      this.locationCache.set(ip, {
        data: mockData,
        timestamp: Date.now()
      });

      return mockData;
    }
  }

  // 生成模拟地理位置
  generateMockLocation() {
    const countries = [
      { name: '中国', cities: ['北京', '上海', '广州', '深圳', '杭州', '成都'] },
      { name: '美国', cities: ['纽约', '洛杉矶', '芝加哥', '休斯顿', '凤凰城', '费城'] },
      { name: '日本', cities: ['东京', '大阪', '名古屋', '横滨', '神户', '京都'] },
      { name: '韩国', cities: ['首尔', '釜山', '仁川', '大邱', '大田', '光州'] },
      { name: '德国', cities: ['柏林', '汉堡', '慕尼黑', '科隆', '法兰克福', '斯图加特'] },
      { name: '法国', cities: ['巴黎', '马赛', '里昂', '图卢兹', '尼斯', '南特'] },
      { name: '英国', cities: ['伦敦', '伯明翰', '利兹', '格拉斯哥', '谢菲尔德', '布拉德福德'] },
      { name: '加拿大', cities: ['多伦多', '蒙特利尔', '温哥华', '卡尔加里', '埃德蒙顿', '渥太华'] },
      { name: '澳大利亚', cities: ['悉尼', '墨尔本', '布里斯班', '珀斯', '阿德莱德', '堪培拉'] },
      { name: '新加坡', cities: ['新加坡'] }
    ];

    const country = countries[Math.floor(Math.random() * countries.length)];
    const city = country.cities[Math.floor(Math.random() * country.cities.length)];

    return {
      country: country.name,
      city: city,
      region: 'Unknown'
    };
  }

  // 获取浏览器信息
  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let version = '';

    if (userAgent.includes('Chrome')) {
      browser = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      if (match) version = match[1];
    } else if (userAgent.includes('Firefox')) {
      browser = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      if (match) version = match[1];
    } else if (userAgent.includes('Safari')) {
      browser = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      if (match) version = match[1];
    } else if (userAgent.includes('Edge')) {
      browser = 'Edge';
      const match = userAgent.match(/Edge\/(\d+)/);
      if (match) version = match[1];
    } else if (userAgent.includes('Opera')) {
      browser = 'Opera';
      const match = userAgent.match(/Opera\/(\d+)/);
      if (match) version = match[1];
    }

    return {
      name: browser,
      version: version,
      userAgent: userAgent,
      isMobile: /Mobile|Android|iPhone|iPad/.test(userAgent),
      isTablet: /iPad|Android(?=.*\bMobile\b)(?=.*\bSafari\b)/.test(userAgent)
    };
  }

  // 记录页面访问
  async trackPageView(pagePath, pageName = null) {
    try {
      // 结束上一个页面的访问
      if (this.currentPage && this.pageStartTime) {
        this.endPageView();
      }

      // 开始新页面访问
      this.currentPage = pagePath;
      this.pageStartTime = Date.now();

      // 获取访问信息
      const ip = await this.getClientIP();
      const location = await this.getLocationInfo(ip);
      const browser = this.getBrowserInfo();

      // 如果没有提供pageName，从pagePath生成一个
      const finalPageName = pageName || this.generatePageName(pagePath);
      
      const visitRecord = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        sessionId: this.sessionId,
        pagePath,
        pageName: finalPageName,
        ip,
        country: location.country,
        city: location.city,
        region: location.region,
        browser: browser.name,
        browserVersion: browser.version,
        userAgent: browser.userAgent,
        isMobile: browser.isMobile,
        isTablet: browser.isTablet,
        timestamp: new Date().toISOString(),
        startTime: this.pageStartTime,
        duration: null, // 将在页面结束时设置
        status: 'active'
      };

      // 保存访问记录
      this.visits.push(visitRecord);
      this.saveVisits();

      // 发送到服务器（如果有后端）
      this.sendToServer(visitRecord);

      console.log('Page view tracked:', visitRecord);
    } catch (error) {
      console.error('Failed to track page view:', error);
    }
  }

  // 结束页面访问
  async endPageView() {
    if (this.currentPage && this.pageStartTime) {
      const duration = Date.now() - this.pageStartTime;
      
      // 更新本地记录
      if (this.visits.length > 0) {
        const lastVisit = this.visits[this.visits.length - 1];
        if (lastVisit.pagePath === this.currentPage) {
          lastVisit.duration = duration;
          lastVisit.status = 'completed';
          this.saveVisits();
        }
      }

      // 更新后端记录
      if (this.currentVisitId) {
        await this.updateVisitEnd(this.currentVisitId, duration);
        this.currentVisitId = null;
      }

      this.currentPage = null;
      this.pageStartTime = null;
    }
  }

  // 记录工具使用
  async trackToolUsage(toolName, action = 'view', options = {}) {
    try {
      const ip = await this.getClientIP();
      const location = await this.getLocationInfo(ip);
      const browser = this.getBrowserInfo();

      const toolRecord = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        sessionId: this.sessionId,
        tool: toolName,
        action,
        ip,
        country: location.country,
        city: location.city,
        region: location.region,
        browser: browser.name,
        userAgent: browser.userAgent,
        isMobile: browser.isMobile,
        timestamp: new Date().toISOString(),
        status: 'success',
        ...options
      };

      // 保存工具使用记录到本地
      this.visits.push(toolRecord);
      this.saveVisits();

      // 发送到后端API
      await this.sendToolUsageToServer(toolRecord);

      console.log('Tool usage tracked:', toolRecord);
    } catch (error) {
      console.error('Failed to track tool usage:', error);
    }
  }

  // 发送工具使用记录到后端API
  async sendToolUsageToServer(data) {
    try {
      const response = await apiRequest(buildApiUrl('/api/analytics/tool-usage'), {
        method: 'POST',
        body: JSON.stringify({
          sessionId: data.sessionId,
          tool: data.tool,
          action: data.action,
          inputData: data.inputData,
          outputData: data.outputData,
          processingTime: data.processingTime,
          success: data.success !== false,
          errorMessage: data.errorMessage,
          ip: data.ip,
          userAgent: data.userAgent
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          console.log('Tool usage recorded successfully:', result.result);
        }
      } else {
        console.error('Failed to record tool usage:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to send tool usage to server:', error);
    }
  }

  // 发送访问记录到后端API
  async sendToServer(data) {
    try {
      const response = await apiRequest(buildApiUrl('/api/analytics/visit'), {
        method: 'POST',
        body: JSON.stringify({
          sessionId: data.sessionId,
          pagePath: data.pagePath,
          pageName: data.pageName,
          ip: data.ip,
          userAgent: data.userAgent,
          country: data.country,
          region: data.region,
          city: data.city,
          latitude: data.latitude,
          longitude: data.longitude,
          browser: data.browser,
          browserVersion: data.browserVersion,
          os: data.os,
          osVersion: data.osVersion,
          isMobile: data.isMobile,
          isTablet: data.isTablet,
          isDesktop: data.isDesktop,
          tool: data.tool,
          toolAction: data.toolAction,
          referrer: data.referrer,
          utmSource: data.utmSource,
          utmMedium: data.utmMedium,
          utmCampaign: data.utmCampaign,
          metadata: data.metadata
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.result) {
          // 保存后端返回的visitId，用于后续更新
          this.currentVisitId = result.result.visitId;
          console.log('Visit recorded successfully:', result.result);
        }
      } else {
        console.error('Failed to send data to server:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to send data to server:', error);
    }
  }

  // 更新访问记录（结束访问）
  async updateVisitEnd(visitId, duration) {
    try {
      const response = await apiRequest(buildApiUrl(`/api/analytics/visit/${visitId}/end`), {
        method: 'PUT',
        body: JSON.stringify({
          endTime: Date.now(),
          duration: duration
        })
      });

      if (response.ok) {
        console.log('Visit end updated successfully');
      } else {
        console.error('Failed to update visit end:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Failed to update visit end:', error);
    }
  }

  // 获取访问统计
  async getStats() {
    try {
      // 优先从后端获取统计数据
      const response = await apiRequest(buildApiUrl('/api/analytics/stats'));
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return result.result;
        }
      }
    } catch (error) {
      console.error('Failed to get stats from server, falling back to local data:', error);
    }

    // 如果后端不可用，使用本地数据
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    const allVisits = this.visits.filter(v => v.pagePath);
    const toolVisits = this.visits.filter(v => v.tool);

    return {
      totalVisits: allVisits.length,
      todayVisits: allVisits.filter(v => now - new Date(v.timestamp).getTime() < oneDay).length,
      weekVisits: allVisits.filter(v => now - new Date(v.timestamp).getTime() < oneWeek).length,
      monthVisits: allVisits.filter(v => now - new Date(v.timestamp).getTime() < oneMonth).length,
      uniqueVisitors: new Set(allVisits.map(v => v.ip)).size,
      uniqueIPs: new Set(allVisits.map(v => v.ip)).size,
      countries: new Set(allVisits.map(v => v.country)).size,
      averageSessionDuration: this.calculateAverageSessionDuration(),
      bounceRate: 0,
      topTools: this.getTopTools(),
      topCountries: this.getTopCountries(),
      topBrowsers: this.getTopBrowsers()
    };
  }

  // 计算平均会话时长
  calculateAverageSessionDuration() {
    const sessions = {};
    
    this.visits.forEach(visit => {
      if (!sessions[visit.sessionId]) {
        sessions[visit.sessionId] = [];
      }
      sessions[visit.sessionId].push(visit);
    });

    let totalDuration = 0;
    let sessionCount = 0;

    Object.values(sessions).forEach(sessionVisits => {
      const sessionDuration = sessionVisits.reduce((total, visit) => {
        return total + (visit.duration || 0);
      }, 0);
      
      if (sessionDuration > 0) {
        totalDuration += sessionDuration;
        sessionCount++;
      }
    });

    return sessionCount > 0 ? Math.round(totalDuration / sessionCount) : 0;
  }

  // 获取最常用工具
  getTopTools() {
    const toolCounts = {};
    
    this.visits.forEach(visit => {
      if (visit.tool) {
        toolCounts[visit.tool] = (toolCounts[visit.tool] || 0) + 1;
      }
    });

    return Object.entries(toolCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([tool, count]) => ({ tool, count }));
  }

  // 获取访问最多的国家
  getTopCountries() {
    const countryCounts = {};
    
    this.visits.forEach(visit => {
      if (visit.country) {
        countryCounts[visit.country] = (countryCounts[visit.country] || 0) + 1;
      }
    });

    return Object.entries(countryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }));
  }

  // 获取热门浏览器
  getTopBrowsers() {
    const browserCounts = {};
    
    this.visits.forEach(visit => {
      if (visit.browser) {
        browserCounts[visit.browser] = (browserCounts[visit.browser] || 0) + 1;
      }
    });

    return Object.entries(browserCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([browser, count]) => ({ browser, count }));
  }

  // 清理旧数据
  cleanupOldData(daysToKeep = 30) {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    this.visits = this.visits.filter(visit => 
      new Date(visit.timestamp).getTime() > cutoffTime
    );
    this.saveVisits();
  }
}

// 创建全局实例
const analytics = new AnalyticsService();

// 页面卸载时结束当前页面访问
window.addEventListener('beforeunload', () => {
  analytics.endPageView().catch(error => {
    console.error('Failed to end page view on unload:', error);
  });
});

export default analytics; 