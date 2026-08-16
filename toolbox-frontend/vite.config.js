import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import viteCompression from 'vite-plugin-compression';
import { constants } from 'zlib';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (without VITE_ prefix restriction)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Gzip压缩配置
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
        deleteOriginFile: false,
        compressionOptions: {
          level: 9
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
            [constants.BROTLI_PARAM_QUALITY]: 11
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
            'react-vendor': ['react', 'react-dom', 'react-router-dom']
          }
        }
      },
      cssCodeSplit: true,
      minify: 'esbuild',
      target: 'es2020',
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
