import path from 'path';
import babel from '@rolldown/plugin-babel';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/workouttracker/' : '/',
  plugins: [
    react(),
    babel({
      plugins: [['module:@preact/signals-react-transform']],
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "variables" as *;\n@use "mixins" as *;\n`,
        loadPaths: [path.resolve(__dirname, 'src/styles')],
      },
    },
  },
}));
