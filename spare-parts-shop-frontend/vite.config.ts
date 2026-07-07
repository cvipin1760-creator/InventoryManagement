import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: false,
        secure: false,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('X-Forwarded-Host', 'localhost:3000')
            proxyReq.setHeader('X-Forwarded-Proto', 'http')
          })
          proxy.on('proxyRes', (proxyRes) => {
            const setCookie = proxyRes.headers['set-cookie'] as string | string[] | undefined
            if (Array.isArray(setCookie)) {
              proxyRes.headers['set-cookie'] = setCookie.map((cookie) =>
                cookie.replace(/;\s*Domain=[^;]+/gi, '').replace(/;\s*$/g, '')
              ) as any
            } else if (typeof setCookie === 'string') {
              proxyRes.headers['set-cookie'] = setCookie.replace(/;\s*Domain=[^;]+/gi, '').replace(/;\s*$/g, '') as any
            }
          })
        },
      },
    },
  },
})
