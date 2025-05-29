import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: 'app/javascript', // JSXなどのルート
  build: {
    outDir: '../../public', // ✅ public配下にビルドファイルを出力
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@': '/app/javascript',
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
