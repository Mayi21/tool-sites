/**
 * 懒加载性能监控工具
 * 监控和分析懒加载的效果
 */
export class LazyLoadingMonitor {
  constructor() {
    this.metrics = {
      totalComponents: 0,
      lazyComponents: 0,
      loadedComponents: 0,
      intersectionObservers: 0,
      averageLoadTime: 0,
      memoryUsage: 0
    };

    this.componentLoadTimes = [];
    this.init();
  }

  init() {
    // 监控懒加载组件数量
    this.observeComponentCounts();

    // 监控性能指标
    this.monitorPerformance();

    // 开发环境设置
    if (process.env.NODE_ENV === 'development') {
      this.setupDevTools();
    }
  }

  observeComponentCounts() {
    // 初始扫描现有的懒加载组件
    this.scanExistingComponents();

    // 使用 MutationObserver 监控DOM变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.scanNodeForComponents(node);
            }
          });
        } else if (mutation.type === 'attributes' && mutation.attributeName === 'data-lazy-component') {
          // 监控属性变化
          if (mutation.target.hasAttribute('data-lazy-component')) {
            this.metrics.lazyComponents++;
          }
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-lazy-component']
    });

    // 定期重新扫描以确保准确性
    setInterval(() => {
      this.scanExistingComponents();
    }, 5000);

    // 清理函数
    this.cleanup = () => observer.disconnect();
  }

  scanExistingComponents() {
    // 重新计算懒加载组件数量
    const lazyComponents = document.querySelectorAll('[data-lazy-component]');
    this.metrics.lazyComponents = lazyComponents.length;

    // 重新计算总组件数
    const totalComponents = document.querySelectorAll('div, section, article, main, aside').length;
    this.metrics.totalComponents = totalComponents;
  }

  scanNodeForComponents(node) {
    // 检查节点本身
    if (node.hasAttribute && node.hasAttribute('data-lazy-component')) {
      this.metrics.lazyComponents++;
    }

    // 检查子节点
    const lazyChildren = node.querySelectorAll ? node.querySelectorAll('[data-lazy-component]') : [];
    this.metrics.lazyComponents += lazyChildren.length;

    // 统计总组件数
    if (node.tagName && ['DIV', 'SECTION', 'ARTICLE', 'MAIN', 'ASIDE'].includes(node.tagName)) {
      this.metrics.totalComponents++;
    }
    const componentChildren = node.querySelectorAll ? node.querySelectorAll('div, section, article, main, aside') : [];
    this.metrics.totalComponents += componentChildren.length;
  }

  recordComponentLoad(componentName, loadTime) {
    this.componentLoadTimes.push({
      name: componentName,
      loadTime,
      timestamp: performance.now()
    });

    this.metrics.loadedComponents++;
    this.updateAverageLoadTime();

    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 懒加载组件加载完成: ${componentName} (${loadTime}ms)`);
    }
  }

  updateAverageLoadTime() {
    if (this.componentLoadTimes.length > 0) {
      const totalTime = this.componentLoadTimes.reduce((sum, item) => sum + item.loadTime, 0);
      this.metrics.averageLoadTime = totalTime / this.componentLoadTimes.length;
    }
  }

  monitorPerformance() {
    // 监控内存使用情况
    const updateMemoryUsage = () => {
      if (performance.memory) {
        this.metrics.memoryUsage = {
          used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024), // MB
          total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024), // MB
          limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) // MB
        };
      }
    };

    // 定期更新内存使用情况
    setInterval(updateMemoryUsage, 5000);
    updateMemoryUsage();

    // 监控 Intersection Observer 数量
    const originalIntersectionObserver = window.IntersectionObserver;
    let observerCount = 0;

    window.IntersectionObserver = ((self) => {
      return function(...args) {
        observerCount++;
        self.metrics.intersectionObservers = observerCount;

        const observer = new originalIntersectionObserver(...args);

        // 重写disconnect方法来跟踪清理
        const originalDisconnect = observer.disconnect;
        observer.disconnect = function() {
          observerCount--;
          self.metrics.intersectionObservers = observerCount;
          return originalDisconnect.call(this);
        };

        return observer;
      };
    })(this);
  }

  setupDevTools() {
    // 添加全局访问
    window.lazyLoadingMonitor = this;

    // 添加调试面板
    this.addDebugPanel();

    // 定期输出统计
    setInterval(() => {
      this.logStats();
    }, 10000);
  }

  addDebugPanel() {
    if (document.getElementById('lazy-loading-monitor')) return;

    const panel = document.createElement('div');
    panel.id = 'lazy-loading-monitor';
    panel.style.cssText = `
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 10px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 11px;
      z-index: 10001;
      max-width: 280px;
      display: none;
    `;

    panel.innerHTML = `
      <div style="margin-bottom: 8px; font-weight: bold;">🔄 懒加载监控面板</div>
      <div id="lazy-stats"></div>
      <button onclick="window.lazyLoadingMonitor?.scanExistingComponents?.(); window.lazyLoadingMonitor?.updatePanelContent?.()"
              style="margin-top: 5px; padding: 2px 6px; margin-right: 5px;">刷新</button>
      <button onclick="this.parentElement.style.display='none'"
              style="margin-top: 5px; padding: 2px 6px;">关闭</button>
    `;

    document.body.appendChild(panel);

    // 快捷键显示/隐藏面板 (Ctrl+Shift+L)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        this.scanExistingComponents(); // 显示时刷新数据
        this.updatePanelContent();
      }
    });
  }

  updatePanelContent() {
    const statsDiv = document.getElementById('lazy-stats');
    if (!statsDiv) return;

    const lazyLoadRatio = this.metrics.totalComponents > 0
      ? Math.round((this.metrics.lazyComponents / this.metrics.totalComponents) * 100)
      : 0;

    // 调试信息：查找实际的懒加载组件
    const actualLazyComponents = document.querySelectorAll('[data-lazy-component]');
    const debugInfo = Array.from(actualLazyComponents).map(el => ({
      tag: el.tagName.toLowerCase(),
      type: el.getAttribute('data-lazy-component'),
      id: el.id || 'no-id',
      class: el.className || 'no-class'
    }));

    statsDiv.innerHTML = `
      <div>总组件: ${this.metrics.totalComponents}</div>
      <div>懒加载组件: ${this.metrics.lazyComponents} (${lazyLoadRatio}%)</div>
      <div>实际DOM查询: ${actualLazyComponents.length}</div>
      <div>已加载: ${this.metrics.loadedComponents}</div>
      <div>平均加载时间: ${Math.round(this.metrics.averageLoadTime)}ms</div>
      <div>Observer数量: ${this.metrics.intersectionObservers}</div>
      ${this.metrics.memoryUsage ? `
        <div>内存使用: ${this.metrics.memoryUsage.used}MB / ${this.metrics.memoryUsage.total}MB</div>
      ` : ''}
      <div style="margin-top: 5px; font-size: 10px; color: #aaa;">
        调试: ${debugInfo.length > 0 ? debugInfo.map(c => c.type).join(', ') : '无懒加载组件'}
      </div>
      <div style="margin-top: 5px; font-size: 10px; color: #aaa;">
        按 Ctrl+Shift+L 切换显示
      </div>
    `;
  }

  logStats() {
    const stats = {
      ...this.metrics,
      lazyLoadingEfficiency: this.calculateEfficiency(),
      recentLoads: this.componentLoadTimes.slice(-5),
      recommendations: this.generateRecommendations()
    };

    console.group('🔄 懒加载性能统计');
    console.table({
      '总组件数': stats.totalComponents,
      '懒加载组件数': stats.lazyComponents,
      '已加载组件数': stats.loadedComponents,
      '平均加载时间': `${Math.round(stats.averageLoadTime)}ms`,
      '效率评分': `${stats.lazyLoadingEfficiency}%`,
      'Observer数量': stats.intersectionObservers
    });

    if (stats.recommendations.length > 0) {
      console.log('📋 优化建议:', stats.recommendations);
    }

    console.groupEnd();

    // 更新调试面板
    this.updatePanelContent();

    return stats;
  }

  calculateEfficiency() {
    if (this.metrics.totalComponents === 0) return 100;

    const lazyRatio = this.metrics.lazyComponents / this.metrics.totalComponents;
    const loadRatio = this.metrics.loadedComponents / this.metrics.lazyComponents || 0;

    // 综合评分：懒加载覆盖率 * 0.6 + 加载效率 * 0.4
    return Math.round((lazyRatio * 0.6 + loadRatio * 0.4) * 100);
  }

  generateRecommendations() {
    const recommendations = [];

    // 检查懒加载覆盖率
    const lazyRatio = this.metrics.lazyComponents / this.metrics.totalComponents;
    if (lazyRatio < 0.3) {
      recommendations.push('建议增加懒加载组件的使用，当前覆盖率较低');
    }

    // 检查平均加载时间
    if (this.metrics.averageLoadTime > 200) {
      recommendations.push('组件加载时间偏长，建议优化组件大小');
    }

    // 检查Observer数量
    if (this.metrics.intersectionObservers > 50) {
      recommendations.push('Intersection Observer数量过多，建议复用或合并');
    }

    // 检查内存使用
    if (this.metrics.memoryUsage && this.metrics.memoryUsage.used > 100) {
      recommendations.push('内存使用量较高，建议检查组件清理逻辑');
    }

    return recommendations;
  }

  destroy() {
    if (this.cleanup) {
      this.cleanup();
    }

    const panel = document.getElementById('lazy-loading-monitor');
    if (panel) {
      panel.remove();
    }
  }
}

// 自动启动监控（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  // 页面加载完成后启动监控
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      new LazyLoadingMonitor();
    });
  } else {
    new LazyLoadingMonitor();
  }
}

export default LazyLoadingMonitor;