import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      util:    'util',
      events:  'events',
      process: 'process/browser',
    },
  },

  optimizeDeps: {
    include: ['monaco-editor', 'events', 'util', 'process'],
  },

  server: {
    proxy: {
      '/api':        'http://localhost:3001',
      '/socket.io': { target: 'ws://localhost:3001', ws: true },
    },
  },
  define: { global: 'globalThis' },
});
