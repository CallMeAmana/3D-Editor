import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    lib: {
      entry: 'lib/3DEditor.js',
      name: '3DEditor',
      fileName: (format) => `3d-editor.${format}.js`
    },
    rollupOptions: {
      external: ['three'],
      output: {
        globals: {
          three: 'THREE'
        }
      }
    }
  }
});