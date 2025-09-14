/**
 * Vite插件：自动为关键资源添加preload标签
 * 优化首屏加载性能
 */
export function preloadPlugin() {
  return {
    name: 'preload-critical-resources',
    transformIndexHtml: {
      order: 'post', // 使用新的order选项替代enforce
      handler(html, ctx) {
        // 只在生产构建时添加预加载标签
        if (!ctx.bundle) return html;

        const preloadTags = [];

        // 分析构建结果，找到关键资源
        for (const [fileName, chunk] of Object.entries(ctx.bundle)) {
          // 预加载主CSS文件（高优先级）
          if (fileName.includes('index') && fileName.endsWith('.css')) {
            preloadTags.push(
              `<link rel="preload" href="/${fileName}" as="style" onload="this.onload=null;this.rel='stylesheet'">`
            );
          }

          // 预加载关键JavaScript模块（高优先级）
          if (fileName.includes('react-vendor') && fileName.endsWith('.js')) {
            preloadTags.push(
              `<link rel="preload" href="/${fileName}" as="script">`
            );
          }

          if (fileName.includes('mui-vendor') && fileName.endsWith('.js')) {
            preloadTags.push(
              `<link rel="preload" href="/${fileName}" as="script">`
            );
          }

          // 预加载国际化模块（中优先级）
          if (fileName.includes('i18n-vendor') && fileName.endsWith('.js')) {
            preloadTags.push(
              `<link rel="prefetch" href="/${fileName}" as="script">`
            );
          }

          // 预加载工具模块（低优先级）
          if (fileName.includes('utils-vendor') && fileName.endsWith('.js')) {
            preloadTags.push(
              `<link rel="prefetch" href="/${fileName}" as="script">`
            );
          }
        }

        // 在head标签结束前插入预加载标签
        return html.replace(
          '</head>',
          `    <!-- 构建时自动生成的关键资源预加载 -->\n    ${preloadTags.join('\n    ')}\n  </head>`
        );
      }
    }
  };
}