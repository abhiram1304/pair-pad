import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['monaco-editor'],            // <<< NEW (speeds dev start)
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3001',
      '/socket.io': { target: 'ws://localhost:3001', ws: true },
    },
  },
});
