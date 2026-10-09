import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: true,
    proxy: {
      '/adm': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
});
