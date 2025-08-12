// 测试数据生成器
import analytics from './analytics.js';

class TestDataGenerator {
  constructor() {
    this.analytics = analytics;
  }

  // 生成测试访问数据
  async generateTestData() {
    console.log('Generating test data...');
    
    const testPages = [
      { path: '/', name: '首页' },
      { path: '/base64', name: 'Base64工具' },
      { path: '/diff', name: '文本对比' },
      { path: '/analytics-test', name: '分析测试' }
    ];

    const testTools = [
      { name: 'Base64工具', action: 'encode' },
      { name: 'Base64工具', action: 'decode' },
      { name: '文本对比', action: 'compare' },
      { name: 'JSON格式化', action: 'format' },
      { name: 'URL编码', action: 'encode' }
    ];

    // 生成页面访问记录
    for (let i = 0; i < 20; i++) {
      const page = testPages[Math.floor(Math.random() * testPages.length)];
      await this.analytics.trackPageView(page.path, page.name);
      
      // 随机等待一段时间
      await new Promise(resolve => setTimeout(resolve, Math.random() * 1000));
    }

    // 生成工具使用记录
    for (let i = 0; i < 15; i++) {
      const tool = testTools[Math.floor(Math.random() * testTools.length)];
      await this.analytics.trackToolUsage(tool.name, tool.action, {
        inputData: `test_input_${i}`,
        outputData: `test_output_${i}`,
        processingTime: Math.floor(Math.random() * 1000) + 100
      });
      
      // 随机等待一段时间
      await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
    }

    console.log('Test data generation completed');
    
    // 显示生成的统计数据
    const stats = await this.analytics.getStats();
    console.log('Generated stats:', stats);
    
    return stats;
  }

  // 清除测试数据
  clearTestData() {
    localStorage.removeItem('toolbox_visits');
    console.log('Test data cleared');
  }

  // 显示当前数据
  showCurrentData() {
    const visits = this.analytics.visits;
    console.log('Current visits data:', visits);
    console.log('Total visits:', visits.length);
    
    const countries = new Set(visits.map(v => v.country));
    console.log('Countries:', Array.from(countries));
    
    const tools = new Set(visits.map(v => v.tool).filter(Boolean));
    console.log('Tools used:', Array.from(tools));
  }
}

// 创建全局实例
const testDataGenerator = new TestDataGenerator();

// 在开发环境中自动生成一些测试数据
if (import.meta.env.DEV) {
  // 延迟执行，确保页面加载完成
  setTimeout(() => {
    // 检查是否已有数据
    const visits = analytics.visits;
    if (visits.length < 5) {
      console.log('Generating initial test data...');
      testDataGenerator.generateTestData();
    }
  }, 2000);
}

export { testDataGenerator }; 