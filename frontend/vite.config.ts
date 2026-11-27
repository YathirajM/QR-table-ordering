import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  root: resolve(__dirname, '.'),
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@lib': resolve(__dirname, './src/lib'),
      '@components': resolve(__dirname, './src/components'),
      '@styles': resolve(__dirname, './src/styles'),
    },
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})