// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // forward every call that starts with /api to the Express server
      '/api': 'http://localhost:3001',
    },
  },
});
