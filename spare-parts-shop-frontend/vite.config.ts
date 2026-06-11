import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'Icon-192.png', 'Icon-512.png'],
      manifest: {
        name: 'StockPilot',
        short_name: 'StockPilot',
        description: 'Inventory and Billing management for Spare Parts Shop',
        theme_color: '#2563eb',
        background_color: '#f8fafc',
        display: 'standalone',
        icons: [
          {
            src: 'Icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'Icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'Icon-maskable-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'Icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
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
