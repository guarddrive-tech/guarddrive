import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: 'frontend',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'frontend/index.html'),
        interviewer: resolve(__dirname, 'frontend/index2.html'),
        diagnostico: resolve(__dirname, 'frontend/diagnostico.html'),
      },
    },
  },
  server: {
    port: 5173,
  }
})
