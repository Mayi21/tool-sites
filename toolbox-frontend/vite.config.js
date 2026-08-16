import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import viteCompression from 'vite-plugin-compression';
import { constants } from 'zlib';

// https://vitejs.dev/config/
export default defineConfig(() => {
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
  };
});
