import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: '홍익대학교 카우보이스',
        short_name: '카우보이스',
        description: '홍익대학교 미식축구부 카우보이스 스탯 및 정보',
        theme_color: '#cc0000',
        background_color: '#1a1a1a',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/favicon-256.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/favicon-256.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/favicon-256.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
