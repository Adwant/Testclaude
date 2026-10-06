import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

// Сборка рассчитана на публикацию в подпапку (например, /styles/):
// корень — сплэш выбора стиля, /1/ — приложение «Спортика · стиль 1».
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    rollupOptions: {
      input: {
        splash: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, '1/index.html'),
      },
    },
  },
});
