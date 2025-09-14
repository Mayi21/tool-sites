import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { preloadPlugin } from './src/plugins/preloadPlugin.js';
import { criticalCssPlugin } from './src/plugins/criticalCssPlugin.js';
import viteCompression from 'vite-plugin-compression';
import { constants } from 'zlib';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (without VITE_ prefix restriction)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      preloadPlugin(),
      criticalCssPlugin(), // 关键CSS内联优化
      // Gzip压缩配置
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024, // 只压缩大于1KB的文件
        deleteOriginFile: false, // 保留原文件
        compressionOptions: {
          level: 9 // 最高压缩级别
        }
      }),
      // Brotli压缩配置（更好的压缩率）
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
        deleteOriginFile: false,
        compressionOptions: {
          params: {
            [constants.BROTLI_PARAM_QUALITY]: 11 // 最高质量
          }
        }
      })
    ],
    // Expose API_URL to client code via import.meta.env.API_URL
    define: {
      'import.meta.env.API_URL': JSON.stringify(env.API_URL || ''),
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // React核心库分离
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            // Material UI库分离
            'mui-vendor': ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
            // Ant Design库分离
            'antd-vendor': ['antd'],
            // 图表库分离
            'chart-vendor': ['recharts', 'chart.js', 'd3-scale'],
            // 国际化库分离
            'i18n-vendor': ['react-i18next', 'i18next', 'i18n-iso-countries'],
            // 其他工具库分离
            'utils-vendor': ['react-helmet-async', 'dayjs', 'qrcode', 'js-base64']
          }
        }
      },
      // 字体和关键资源优化
      cssCodeSplit: true,
      minify: 'esbuild', // 使用更快的 esbuild 代替 terser
      // 预加载关键资源配置
      assetsInlineLimit: 4096,
    },
    server: {
      proxy: {
        '/api': {
          target: 'http://127.0.0.1:8787',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
  };
});