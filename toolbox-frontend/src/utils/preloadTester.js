/**
 * 预加载性能测试工具
 * 测量和分析资源预加载效果
 */
export class PreloadPerformanceTester {
  constructor() {
    this.metrics = {
      preloadResources: [],
      loadTimes: {},
      cacheHitRatio: 0,
      totalPreloadSize: 0,
      performanceGains: {}
    };

    this.init();
  }

  init() {
    // 监控预加载资源
    this.detectPreloadResources();

    // 监控资源加载性能
    this.monitorResourceLoading();

    // 在开发环境显示实时统计
    if (process.env.NODE_ENV === 'development') {
      this.setupDevTools();
    }
  }

  detectPreloadResources() {
    const preloadLinks = document.querySelectorAll('link[rel="preload"], link[rel="prefetch"], link[rel="modulepreload"]');

    preloadLinks.forEach(link => {
      this.metrics.preloadResources.push({
        href: link.href,
        as: link.as || 'unknown',
        rel: link.rel,
        crossorigin: link.crossOrigin || null,
        timestamp: performance.now()
      });
    });
  }

  monitorResourceLoading() {
    // 使用Performance Observer监控资源加载
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'resource') {
            this.recordResourceLoad(entry);
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }

    // 监控关键指标
    this.monitorCoreWebVitals();
  }

  recordResourceLoad(entry) {
    const resourceUrl = entry.name;
    const isPreloaded = this.metrics.preloadResources.some(
      resource => resourceUrl.includes(resource.href.split('/').pop())
    );

    this.metrics.loadTimes[resourceUrl] = {
      duration: entry.duration,
      transferSize: entry.transferSize || 0,
      wasPreloaded: isPreloaded,
      startTime: entry.startTime,
      responseEnd: entry.responseEnd
    };

    // 计算预加载效果
    if (isPreloaded) {
      this.calculatePreloadBenefit(entry);
    }
  }

  calculatePreloadBenefit(entry) {
    // 估算预加载节省的时间
    const estimatedSavings = Math.max(0, entry.duration * 0.3); // 保守估计30%提升

    if (!this.metrics.performanceGains[entry.name]) {
      this.metrics.performanceGains[entry.name] = {
        estimatedTimeSaved: estimatedSavings,
        resourceSize: entry.transferSize || 0,
        loadTime: entry.duration
      };
    }
  }

  monitorCoreWebVitals() {
    // First Contentful Paint (FCP)
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
        }
      });
    }).observe({ entryTypes: ['paint'] });

    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const lastEntry = list.getEntries()[list.getEntries().length - 1];
      this.metrics.lcp = lastEntry.startTime;
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.metrics.cls = clsValue;
    }).observe({ entryTypes: ['layout-shift'] });
  }

  setupDevTools() {
    // 添加控制台命令
    window.preloadTester = this;

    // 定期输出统计信息
    setTimeout(() => {
      this.generateReport();
    }, 5000);

    // 添加性能面板
    this.addPerformancePanel();
  }

  addPerformancePanel() {
    if (document.getElementById('preload-performance-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'preload-performance-panel';
    panel.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 10px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      max-width: 300px;
      display: none;
    `;

    panel.innerHTML = `
      <div style="margin-bottom: 8px; font-weight: bold;">🚀 预加载性能面板</div>
      <div id="preload-stats"></div>
      <button onclick="this.parentElement.style.display='none'" style="margin-top: 5px; padding: 2px 6px;">关闭</button>
    `;

    document.body.appendChild(panel);

    // 快捷键显示/隐藏面板 (Ctrl+Shift+P)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'P') {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        this.updatePanelContent();
      }
    });
  }

  updatePanelContent() {
    const statsDiv = document.getElementById('preload-stats');
    if (!statsDiv) return;

    const totalResources = this.metrics.preloadResources.length;
    const loadedResources = Object.keys(this.metrics.loadTimes).length;
    const totalTimeSaved = Object.values(this.metrics.performanceGains)
      .reduce((sum, gain) => sum + gain.estimatedTimeSaved, 0);

    statsDiv.innerHTML = `
      <div>预加载资源: ${totalResources}</div>
      <div>已加载资源: ${loadedResources}</div>
      <div>估计节省时间: ${Math.round(totalTimeSaved)}ms</div>
      <div>FCP: ${Math.round(this.metrics.fcp || 0)}ms</div>
      <div>LCP: ${Math.round(this.metrics.lcp || 0)}ms</div>
      <div style="margin-top: 5px; font-size: 10px; color: #aaa;">
        按 Ctrl+Shift+P 切换显示
      </div>
    `;
  }

  generateReport() {
    const report = {
      summary: {
        totalPreloadResources: this.metrics.preloadResources.length,
        totalLoadedResources: Object.keys(this.metrics.loadTimes).length,
        estimatedTimeSaved: Object.values(this.metrics.performanceGains)
          .reduce((sum, gain) => sum + gain.estimatedTimeSaved, 0),
        coreWebVitals: {
          fcp: this.metrics.fcp,
          lcp: this.metrics.lcp,
          cls: this.metrics.cls
        }
      },
      preloadResources: this.metrics.preloadResources,
      performanceGains: this.metrics.performanceGains,
      recommendations: this.generateRecommendations()
    };

    console.group('🚀 预加载性能报告');
    console.table(report.summary);
    console.log('详细数据:', report);
    console.groupEnd();

    // 更新开发面板
    this.updatePanelContent();

    return report;
  }

  generateRecommendations() {
    const recommendations = [];

    // 检查是否有未使用的预加载资源
    const unusedPreloads = this.metrics.preloadResources.filter(preload => {
      return !Object.keys(this.metrics.loadTimes).some(loadedUrl =>
        loadedUrl.includes(preload.href.split('/').pop())
      );
    });

    if (unusedPreloads.length > 0) {
      recommendations.push(`发现${unusedPreloads.length}个未使用的预加载资源，建议移除`);
    }

    // 检查Core Web Vitals
    if (this.metrics.fcp > 1800) {
      recommendations.push('FCP超过1.8秒，建议优化关键渲染路径');
    }

    if (this.metrics.lcp > 2500) {
      recommendations.push('LCP超过2.5秒，建议优化最大内容绘制');
    }

    if (this.metrics.cls > 0.1) {
      recommendations.push('CLS超过0.1，建议优化布局稳定性');
    }

    return recommendations;
  }
}

// 自动启动性能测试（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  // 页面加载完成后启动测试
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new PreloadPerformanceTester();
    });
  } else {
    new PreloadPerformanceTester();
  }
}

export default PreloadPerformanceTester;