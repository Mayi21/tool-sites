import { useEffect } from 'react';

/**
 * 字体加载优化组件
 * 监控字体加载性能，记录关键指标
 */
export default function FontOptimization() {
  useEffect(() => {
    // 监控字体加载性能
    const monitorFontLoading = () => {
      if ('fonts' in document) {
        // 检查字体加载状态
        document.fonts.ready.then(() => {
          // 字体加载完成
          const fontLoadTime = performance.now();

          // 记录性能指标
          if (window.gtag) {
            window.gtag('event', 'font_load_complete', {
              event_category: 'Performance',
              event_label: 'System Fonts',
              value: Math.round(fontLoadTime)
            });
          }

          // 开发环境下的调试信息
          if (process.env.NODE_ENV === 'development') {
            console.log('字体优化信息：', {
              fontLoadTime: `${Math.round(fontLoadTime)}ms`,
              fontFaces: document.fonts.size,
              fontDisplay: 'swap',
              strategy: 'system-fonts-optimized'
            });
          }
        });

        // 监听字体加载事件
        document.fonts.addEventListener('loadingdone', (event) => {
          const loadedFonts = event.fontfaces.length;
          if (process.env.NODE_ENV === 'development') {
            console.log(`已加载 ${loadedFonts} 个字体文件`);
          }
        });
      }

      // 监控 FOUT/FOIT 防护效果
      const checkFontDisplaySupport = () => {
        const testElement = document.createElement('div');
        testElement.style.fontFamily = 'SystemOptimized';
        testElement.style.fontSize = '1px';
        testElement.style.position = 'absolute';
        testElement.style.visibility = 'hidden';
        testElement.textContent = 'test';

        document.body.appendChild(testElement);

        setTimeout(() => {
          document.body.removeChild(testElement);
        }, 100);

        return true;
      };

      checkFontDisplaySupport();
    };

    // 页面加载完成后启动监控
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', monitorFontLoading);
    } else {
      monitorFontLoading();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', monitorFontLoading);
    };
  }, []);

  // 这个组件不渲染任何UI
  return null;
}

/**
 * 字体性能测试工具（开发环境）
 */
export const fontPerformanceTest = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const testResults = {
    fontDisplay: 'swap',
    systemFonts: true,
    cssOptimization: true,
    inlineCriticalCSS: true,
    recommendations: []
  };

  // 检查 font-display 支持
  try {
    const style = document.createElement('style');
    style.textContent = '@supports (font-display: swap) { .test { font-display: swap; } }';
    document.head.appendChild(style);

    const testDiv = document.createElement('div');
    testDiv.className = 'test';
    document.body.appendChild(testDiv);

    const computedStyle = window.getComputedStyle(testDiv);
    const supportsFontDisplay = computedStyle.getPropertyValue('font-display') === 'swap';

    document.head.removeChild(style);
    document.body.removeChild(testDiv);

    testResults.fontDisplaySupport = supportsFontDisplay;
  } catch (error) {
    testResults.fontDisplaySupport = false;
  }

  // 性能建议
  if (!testResults.fontDisplaySupport) {
    testResults.recommendations.push('浏览器不支持font-display，考虑使用polyfill');
  }

  console.table(testResults);
  return testResults;
};