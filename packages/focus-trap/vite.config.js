// vite.config.js
import { resolve } from 'path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    minify: false,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'focus-trap',
      // the proper extensions will be added
      fileName: 'index',
    },
    rollupOptions: {
      external: ['true-myth/result'],
      output: { globals: { 'true-myth/result': 'result' } },
    },
  },
  plugins: [dts()],
});
