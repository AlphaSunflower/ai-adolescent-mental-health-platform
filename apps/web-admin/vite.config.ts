import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
      // 补充：指定扩展名，导入文件时可省略 .vue/.js 等后缀（可选但推荐）
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json', '.vue']
  },
  server: {
      host: '0.0.0.0',
      port: 5173,
      strictPort: true,       // 端口被占用时不自动切换
      cors: true,      // 可选：允许跨域（避免前端请求时的跨域问题）
      allowedHosts: true,
      // hmr: {
      //     host: '0.0.0.0',      // 热更新允许外部访问
      //     clientPort: 5173
      // },
    proxy: {
      '/api': {
        // target: 'https://122.51.12.200:8080',
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            // SSE 需要一些特殊的头
          });
        }
      }
    }
  }
})
