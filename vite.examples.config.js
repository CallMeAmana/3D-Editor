import { defineConfig } from 'vite';

export default defineConfig({
  root: 'examples',
  server: {
    port: 3000,
    open: '/vanilla-js/index.html'
  },
  build: {
    outDir: '../dist-examples'
  }
});