import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// The source entry is src/index.html. The repository root index.html is the
// BUILT site, committed by `npm run build:pages`, because GitHub Pages serves
// the root of main as-is.
// BASE_PATH lets the same static build sit under a sub-path on any host.
export default defineConfig({
  root: 'src',
  publicDir: '../public',
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  test: {
    root: '.',
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
