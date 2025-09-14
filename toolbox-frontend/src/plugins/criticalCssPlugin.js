/**
 * Vite插件 - 关键CSS内联优化
 * 自动提取并内联关键渲染路径的CSS
 */

import fs from 'fs';
import path from 'path';

export function criticalCssPlugin() {
  return {
    name: 'critical-css-inline',
    apply: 'build',
    generateBundle(options, bundle) {
      // 查找主CSS文件
      const cssFiles = Object.keys(bundle).filter(fileName =>
        fileName.endsWith('.css') && fileName.includes('index-')
      );

      if (cssFiles.length === 0) return;

      const cssFileName = cssFiles[0];
      const cssContent = bundle[cssFileName].source;

      // 提取关键CSS - 首屏相关样式
      const criticalCssRules = [
        // 根变量和基础样式
        ':root\\s*{[^}]*}',
        ':root\\.dark\\s*{[^}]*}',
        'body\\s*{[^}]*}',
        '#root\\s*{[^}]*}',

        // 字体相关
        '@font-face\\s*{[^}]*}',
        'font-display:\\s*swap[^;]*;',

        // MUI基础组件
        '\\.MuiCssBaseline-root\\s*{[^}]*}',
        '\\.MuiAppBar-root\\s*{[^}]*}',
        '\\.MuiToolbar-root\\s*{[^}]*}',
        '\\.MuiContainer-root\\s*{[^}]*}',

        // 关键动画
        '@keyframes\\s+fadeIn\\s*{[^}]*}',
        '\\.fade-in\\s*{[^}]*}',

        // 加载状态
        '\\.loading-placeholder\\s*{[^}]*}',

        // 主题切换相关
        '\\.theme-transition\\s*{[^}]*}',
        '\\.theme-switcher-btn\\s*{[^}]*}'
      ];

      let extractedCriticalCss = '';

      criticalCssRules.forEach(rule => {
        const regex = new RegExp(rule, 'gi');
        const matches = cssContent.match(regex);
        if (matches) {
          extractedCriticalCss += matches.join('\n') + '\n';
        }
      });

      // 手动添加关键样式（如果自动提取不完整）
      const manualCriticalCss = `
        /* 关键渲染路径优化 - 内联关键CSS */
        :root {
          font-family: system-ui, Avenir, Helvetica, Arial, sans-serif;
          line-height: 1.5;
          font-weight: 400;
          color-scheme: light dark;
          font-synthesis: none;
          text-rendering: optimizeLegibility;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          transition: all .3s ease;
          --bg-primary: #ffffff;
          --bg-secondary: #f7f8fa;
          --text-primary: #262626;
          --text-secondary: #666666;
          --border-color: #d9d9d9;
          --shadow-color: rgba(0, 0, 0, .06);
          --card-bg: #ffffff;
        }
        :root.dark {
          --bg-primary: #141414;
          --bg-secondary: #1f1f1f;
          --text-primary: #ffffff;
          --text-secondary: #a6a6a6;
          --border-color: #434343;
          --shadow-color: rgba(0, 0, 0, .2);
          --card-bg: #1f1f1f;
        }
        body {
          margin: 0;
          min-width: 320px;
          min-height: 100vh;
          width: 100%;
          background-color: var(--bg-primary);
          color: var(--text-primary);
        }
        #root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .MuiCssBaseline-root {
          font-display: swap;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        .MuiAppBar-root {
          background-color: var(--bg-primary) !important;
          border-bottom: 1px solid var(--border-color);
          box-shadow: none !important;
        }
        .loading-placeholder {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          background-color: var(--bg-primary);
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .fade-in {
          animation: fadeIn 0.3s ease;
        }
      `;

      const finalCriticalCss = extractedCriticalCss || manualCriticalCss;

      // 查找HTML文件并内联关键CSS
      const htmlFiles = Object.keys(bundle).filter(fileName => fileName.endsWith('.html'));

      htmlFiles.forEach(htmlFileName => {
        const htmlBundle = bundle[htmlFileName];
        let htmlContent = htmlBundle.source;

        // 在head中插入关键CSS
        const criticalStyleTag = `
    <!-- 关键渲染路径优化 - 内联关键CSS -->
    <style>
      ${finalCriticalCss.trim()}
    </style>`;

        // 在现有style标签之前插入
        htmlContent = htmlContent.replace(
          /<style>/,
          criticalStyleTag + '\n    <style>'
        );

        // 将原CSS文件设置为非阻塞加载
        htmlContent = htmlContent.replace(
          new RegExp(`<link rel="stylesheet" crossorigin href="/assets/${cssFileName}">`),
          `<link rel="preload" href="/assets/${cssFileName}" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="/assets/${cssFileName}"></noscript>`
        );

        // 同时处理可能的其他CSS文件格式
        htmlContent = htmlContent.replace(
          /<link rel="stylesheet"([^>]*href="\/assets\/[^"]*\.css"[^>]*)>/g,
          (match, attributes) => {
            const href = match.match(/href="([^"]*\.css)"/)?.[1];
            if (href) {
              return `<link rel="preload" ${attributes} as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" ${attributes}></noscript>`;
            }
            return match;
          }
        );

        htmlBundle.source = htmlContent;
      });

      console.log('✨ [critical-css-inline]: 关键CSS已内联，首屏渲染优化完成');
    }
  };
}

export default criticalCssPlugin;