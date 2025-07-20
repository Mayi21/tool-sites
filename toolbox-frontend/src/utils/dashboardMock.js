// 仪表板模拟数据服务
class DashboardMockService {
  constructor() {
    // 导入访问追踪服务
    this.analytics = null;
    try {
      import('./analytics.js').then(module => {
        this.analytics = module.default;
      });
    } catch (error) {
      console.log('Analytics service not available, using mock data only');
    }
    this.tools = [
      'Base64工具',
      '文本对比',
      'JSON格式化',
      'URL编码',
      'Unicode转换',
      '文本处理',
      'CSV转换'
    ];

    this.countries = [
      { name: '中国', cities: ['北京', '上海', '广州', '深圳', '杭州', '成都'] },
      { name: '美国', cities: ['纽约', '洛杉矶', '芝加哥', '休斯顿', '凤凰城', '费城'] },
      { name: '日本', cities: ['东京', '大阪', '名古屋', '横滨', '神户', '京都'] },
      { name: '韩国', cities: ['首尔', '釜山', '仁川', '大邱', '大田', '光州'] },
      { name: '德国', cities: ['柏林', '汉堡', '慕尼黑', '科隆', '法兰克福', '斯图加特'] },
      { name: '法国', cities: ['巴黎', '马赛', '里昂', '图卢兹', '尼斯', '南特'] },
      { name: '英国', cities: ['伦敦', '伯明翰', '利兹', '格拉斯哥', '谢菲尔德', '布拉德福德'] },
      { name: '加拿大', cities: ['多伦多', '蒙特利尔', '温哥华', '卡尔加里', '埃德蒙顿', '渥太华'] },
      { name: '澳大利亚', cities: ['悉尼', '墨尔本', '布里斯班', '珀斯', '阿德莱德', '堪培拉'] },
      { name: '新加坡', cities: ['新加坡'] },
      { name: '印度', cities: ['孟买', '德里', '班加罗尔', '海得拉巴', '艾哈迈达巴德', '钦奈'] },
      { name: '巴西', cities: ['圣保罗', '里约热内卢', '萨尔瓦多', '巴西利亚', '福塔雷萨', '贝洛奥里藏特'] },
      { name: '俄罗斯', cities: ['莫斯科', '圣彼得堡', '新西伯利亚', '叶卡捷琳堡', '下诺夫哥罗德', '喀山'] },
      { name: '意大利', cities: ['罗马', '米兰', '那不勒斯', '都灵', '巴勒莫', '热那亚'] },
      { name: '西班牙', cities: ['马德里', '巴塞罗那', '瓦伦西亚', '塞维利亚', '萨拉戈萨', '马拉加'] }
    ];

    this.browsers = [
      'Chrome',
      'Firefox',
      'Safari',
      'Edge',
      'Opera'
    ];

    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36'
    ];
  }

  // 生成随机IP地址
  generateRandomIP() {
    const segments = [];
    for (let i = 0; i < 4; i++) {
      segments.push(Math.floor(Math.random() * 256));
    }
    return segments.join('.');
  }

  // 生成随机时间戳
  generateRandomTimestamp(daysAgo = 30) {
    const now = new Date();
    const pastDate = new Date(now.getTime() - Math.random() * daysAgo * 24 * 60 * 60 * 1000);
    return pastDate.toISOString();
  }

  // 生成访问量趋势数据
  generateTrendData(days = 30) {
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const visits = Math.floor(Math.random() * 100) + 20;
      const uniqueVisitors = Math.floor(visits * (0.6 + Math.random() * 0.3));
      
      data.push({
        date: date.toLocaleDateString('zh-CN'),
        visits,
        uniqueVisitors
      });
    }
    
    return data;
  }

  // 从真实数据生成趋势数据
  generateTrendDataFromRealData(visits, days = 30) {
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('zh-CN');
      
      // 过滤当天的访问记录
      const dayVisits = visits.filter(visit => {
        const visitDate = new Date(visit.timestamp);
        return visitDate.toDateString() === date.toDateString();
      });
      
      const visitsCount = dayVisits.length;
      const uniqueVisitors = new Set(dayVisits.map(v => v.ip)).size;
      
      data.push({
        date: dateStr,
        visits: visitsCount,
        uniqueVisitors: uniqueVisitors
      });
    }
    
    return data;
  }

  // 生成IP访问记录
  generateIPRecords(count = 100) {
    const records = [];
    
    for (let i = 0; i < count; i++) {
      const country = this.countries[Math.floor(Math.random() * this.countries.length)];
      const city = country.cities[Math.floor(Math.random() * country.cities.length)];
      const tool = this.tools[Math.floor(Math.random() * this.tools.length)];
      const browser = this.browsers[Math.floor(Math.random() * this.browsers.length)];
      const userAgent = this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
      
      records.push({
        id: i + 1,
        ip: this.generateRandomIP(),
        country: country.name,
        city,
        tool,
        browser,
        userAgent,
        timestamp: this.generateRandomTimestamp(),
        duration: Math.floor(Math.random() * 300) + 30, // 30秒到5分钟
        status: Math.random() > 0.1 ? 'success' : 'error'
      });
    }
    
    // 按时间倒序排列
    return records.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  // 生成概览数据
  generateOverviewData() {
    const totalVisits = Math.floor(Math.random() * 5000) + 2000;
    const todayVisits = Math.floor(Math.random() * 200) + 50;
    const uniqueVisitors = Math.floor(totalVisits * 0.7);
    const countries = this.countries.length;
    
    return {
      totalVisits,
      todayVisits,
      uniqueVisitors,
      countries
    };
  }

  // 获取仪表板数据
  async getDashboardData({ dateRange, tool } = {}) {
    // 模拟API延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 尝试使用真实数据，如果没有则使用模拟数据
    let overview, toolStats, ipRecords;
    
    if (this.analytics) {
      try {
        const stats = this.analytics.getStats();
        const visits = this.analytics.visits;
        
        // 使用真实数据
        overview = {
          totalVisits: stats.totalVisits,
          todayVisits: stats.todayVisits,
          uniqueVisitors: stats.uniqueIPs,
          countries: stats.countries
        };
        
        // 转换访问记录为IP记录格式
        ipRecords = visits
          .filter(visit => visit.tool || visit.pagePath)
          .map(visit => ({
            id: visit.id,
            ip: visit.ip,
            country: visit.country,
            city: visit.city,
            tool: visit.tool || visit.pageName || '页面访问',
            browser: visit.browser,
            userAgent: visit.userAgent,
            timestamp: visit.timestamp,
            duration: visit.duration,
            status: visit.status
          }));
        
        // 生成趋势数据
        toolStats = this.generateTrendDataFromRealData(visits);
      } catch (error) {
        console.error('Failed to get real data, using mock data:', error);
        overview = this.generateOverviewData();
        toolStats = this.generateTrendData();
        ipRecords = this.generateIPRecords(200);
      }
    } else {
      overview = this.generateOverviewData();
      toolStats = this.generateTrendData();
      ipRecords = this.generateIPRecords(200);
    }
    
    // 如果指定了特定工具，过滤数据
    let filteredIPRecords = ipRecords;
    if (tool && tool !== 'all') {
      const toolMap = {
        'base64': 'Base64工具',
        'diff': '文本对比',
        'json': 'JSON格式化',
        'url': 'URL编码',
        'unicode': 'Unicode转换',
        'text': '文本处理',
        'csv': 'CSV转换'
      };
      const toolName = toolMap[tool];
      if (toolName) {
        filteredIPRecords = ipRecords.filter(record => record.tool === toolName);
      }
    }
    
    return {
      overview,
      toolStats,
      ipRecords: filteredIPRecords
    };
  }

  // 获取实时数据
  async getRealTimeData() {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      currentVisitors: Math.floor(Math.random() * 50) + 10,
      todayVisits: Math.floor(Math.random() * 200) + 50,
      averageSessionDuration: Math.floor(Math.random() * 300) + 120,
      topTool: this.tools[Math.floor(Math.random() * this.tools.length)]
    };
  }

  // 获取工具使用统计
  async getToolStats() {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return this.tools.map(tool => ({
      name: tool,
      visits: Math.floor(Math.random() * 1000) + 100,
      uniqueUsers: Math.floor(Math.random() * 500) + 50,
      averageTime: Math.floor(Math.random() * 300) + 60
    }));
  }

  // 获取地理分布数据
  async getGeographicData() {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    return this.countries.map(country => ({
      country: country.name,
      visits: Math.floor(Math.random() * 500) + 50,
      uniqueIPs: Math.floor(Math.random() * 200) + 20,
      topCity: country.cities[Math.floor(Math.random() * country.cities.length)]
    }));
  }
}

// 创建全局实例
const mockDashboardData = new DashboardMockService();

export { mockDashboardData }; 