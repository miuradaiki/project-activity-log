import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: process.env.ELECTRON=="true" ? './' : '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: [
        'electron',
        'path',
        'fs'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173
  }
});
