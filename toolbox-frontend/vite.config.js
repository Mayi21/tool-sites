import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load all env vars (without VITE_ prefix restriction)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Expose API_URL to client code via import.meta.env.API_URL
    define: {
      'import.meta.env.API_URL': JSON.stringify(env.API_URL || ''),
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