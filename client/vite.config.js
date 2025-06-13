// client/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      util:    'util',
      events:  'events',
      process: 'process/browser',    // polyfill package
    },
  },

  optimizeDeps: {
    include: [
      'monaco-editor',
      'events',
      'util',
      'process/browser'             // ensure vite pre-bundles this
    ],
  },

  define: {
    global: 'globalThis',
    // ---- stub out process.env so simple-peer’s stream code is happy ----
    'process.env': {},              // minimal, avoids “process is not defined”
  },

  server: {
    proxy: {
      '/api':        'http://localhost:3001',
      '/socket.io': { target: 'ws://localhost:3001', ws: true },
    },
  },
});
