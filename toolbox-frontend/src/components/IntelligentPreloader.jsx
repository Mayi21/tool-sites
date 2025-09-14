import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 智能资源预加载核心逻辑
 */
function PreloaderCore({ location }) {
  useEffect(() => {
    // 预加载策略：基于当前页面预测用户可能访问的页面
    const preloadNextResources = () => {
      const currentPath = location.pathname;

      // 定义相关工具映射
      const relatedTools = {
        '/': ['base64', 'json-formatter', 'regex-tester'], // 首页预加载热门工具
        '/base64': ['url-encoder', 'hash-generator', 'jwt-decoder'],
        '/json-formatter': ['csv-converter', 'diff', 'text-analyzer'],
        '/regex-tester': ['text-analyzer', 'unicode-converter', 'text-processor'],
        '/url-encoder': ['base64', 'hash-generator'],
        '/timestamp': ['cron-parser', 'uuid-generator'],
        '/color-converter': ['qr-generator', 'image-compressor'],
        '/hash-generator': ['password-generator', 'jwt-decoder'],
        '/qr-generator': ['color-converter', 'image-watermark'],
        '/diff': ['text-analyzer', 'csv-converter'],
        '/text-analyzer': ['unicode-converter', 'text-processor'],
        '/csv-converter': ['json-formatter', 'diff'],
        '/cron-parser': ['timestamp', 'text-analyzer'],
        '/unicode-converter': ['text-processor', 'regex-tester'],
        '/jwt-decoder': ['base64', 'hash-generator'],
        '/uuid-generator': ['password-generator', 'hash-generator'],
        '/password-generator': ['hash-generator', 'uuid-generator'],
        '/image-compressor': ['image-watermark', 'qr-generator'],
        '/image-watermark': ['image-compressor', 'color-converter'],
        '/text-processor': ['text-analyzer', 'unicode-converter'],
        '/markdown-preview': ['text-processor', 'diff']
      };

      const toolsToPreload = relatedTools[currentPath] || [];

      // 预加载相关工具的关键资源
      toolsToPreload.forEach(toolPath => {
        // 预加载工具页面（使用prefetch低优先级）
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = `/${toolPath}`;
        document.head.appendChild(link);

        // 记录预加载行为（用于分析）
        if (window.gtag) {
          window.gtag('event', 'resource_prefetch', {
            event_category: 'Performance',
            event_label: toolPath,
            custom_parameter_1: currentPath
          });
        }
      });
    };

    // 延迟执行预加载，避免影响当前页面加载
    const timer = setTimeout(preloadNextResources, 2000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // 鼠标悬停预加载 - 简化版本，更安全
  useEffect(() => {
    // 使用事件委托的安全版本
    const addLinkListeners = () => {
      try {
        const links = document.querySelectorAll('a[href^="/"]');

        links.forEach(link => {
          // 避免重复添加监听器
          if (!link.hasAttribute('data-preload-listener')) {
            link.setAttribute('data-preload-listener', 'true');

            link.addEventListener('mouseenter', () => {
              if (!link.hasAttribute('data-preloaded')) {
                link.setAttribute('data-preloaded', 'true');

                // 创建预加载链接
                const prefetchLink = document.createElement('link');
                prefetchLink.rel = 'prefetch';
                prefetchLink.href = link.href;

                // 安全地添加到head
                if (document.head) {
                  document.head.appendChild(prefetchLink);

                  // 开发环境调试信息
                  if (process.env.NODE_ENV === 'development') {
                    console.log('🚀 预加载:', link.href);
                  }
                }
              }
            }, { passive: true }); // 使用passive监听器提升性能
          }
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('预加载监听器添加失败:', error);
        }
      }
    };

    // 初始化
    const initializePreloading = () => {
      // 等待DOM完全加载
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addLinkListeners);
      } else {
        addLinkListeners();
      }

      // 监听动态添加的链接
      let observer;
      try {
        observer = new MutationObserver((mutations) => {
          let shouldUpdate = false;

          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  // 检查是否添加了新的链接
                  if (node.tagName === 'A' || node.querySelector('a[href^="/"]')) {
                    shouldUpdate = true;
                  }
                }
              });
            }
          });

          if (shouldUpdate) {
            // 防抖，避免频繁更新
            setTimeout(addLinkListeners, 100);
          }
        });

        if (document.body) {
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('MutationObserver 初始化失败:', error);
        }
      }

      return observer;
    };

    const observer = initializePreloading();

    return () => {
      // 清理
      if (observer) {
        observer.disconnect();
      }

      document.removeEventListener('DOMContentLoaded', addLinkListeners);

      // 清理所有预加载标记
      try {
        const links = document.querySelectorAll('a[data-preload-listener]');
        links.forEach(link => {
          link.removeAttribute('data-preload-listener');
          link.removeAttribute('data-preloaded');
        });
      } catch (error) {
        // 忽略清理错误
      }
    };
  }, []);

  // 预加载用户最近访问的工具
  useEffect(() => {
    const preloadRecentTools = () => {
      try {
        const recentTools = JSON.parse(localStorage.getItem('recentTools') || '[]');

        recentTools.slice(0, 3).forEach(toolPath => {
          const prefetchLink = document.createElement('link');
          prefetchLink.rel = 'prefetch';
          prefetchLink.href = toolPath;
          document.head.appendChild(prefetchLink);
        });

        // 记录当前访问的工具
        const currentPath = location.pathname;
        if (currentPath !== '/') {
          const updatedRecent = [currentPath, ...recentTools.filter(path => path !== currentPath)].slice(0, 5);
          localStorage.setItem('recentTools', JSON.stringify(updatedRecent));
        }

      } catch (error) {
        console.warn('预加载最近工具失败:', error);
      }
    };

    preloadRecentTools();
  }, [location.pathname]);

  return null;
}

/**
 * 智能资源预加载组件
 * 根据用户行为预加载可能需要的资源
 */
export default function IntelligentPreloader() {
  const location = useLocation();

  return <PreloaderCore location={location} />;
}

/**
 * 关键资源预加载检查工具（开发环境）
 */
export const checkPreloadEffectiveness = () => {
  if (process.env.NODE_ENV !== 'development') return;

  const preloadLinks = document.querySelectorAll('link[rel="preload"], link[rel="prefetch"], link[rel="modulepreload"]');

  const preloadStats = {
    preload: 0,
    prefetch: 0,
    modulepreload: 0,
    total: preloadLinks.length,
    resources: []
  };

  preloadLinks.forEach(link => {
    preloadStats[link.rel]++;
    preloadStats.resources.push({
      rel: link.rel,
      href: link.href,
      as: link.as || 'unknown',
      type: link.type || 'unknown'
    });
  });

  console.group('🚀 预加载资源统计');
  console.table(preloadStats.resources);
  console.log('总计:', preloadStats.total, '个资源');
  console.log('- preload:', preloadStats.preload, '个（高优先级）');
  console.log('- prefetch:', preloadStats.prefetch, '个（低优先级）');
  console.log('- modulepreload:', preloadStats.modulepreload, '个（ES模块）');
  console.groupEnd();

  return preloadStats;
};