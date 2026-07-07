import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'StockPilot Admin',
        short_name: 'StockPilot',
        description: 'Spare Parts Shop Inventory & Billing',
        theme_color: '#2563EB',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
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
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
          charts: ['recharts', 'd3-geo', 'react-simple-maps'],
          utils: ['jspdf', 'jspdf-autotable', 'xlsx', 'html5-qrcode']
        }
      }
    }
  }
})
