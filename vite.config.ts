import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: process.env.ELECTRON === 'true' ? './' : '.',
  define: {
    'import.meta.env.VITE_ENABLE_TEST_DATA':
      mode === 'development' ? JSON.stringify('true') : JSON.stringify('false'),
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['electron', 'path', 'fs'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
  },
}));
