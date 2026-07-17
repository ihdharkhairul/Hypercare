import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // ── Proxy untuk development ─────────────────────────────
    // Saat npm run dev, semua request ke /api/* akan diteruskan
    // ke backend PHP XAMPP secara transparan.
    // Ini menghindari masalah CORS cross-origin di development.
    // Saat production build (npm run build), proxy ini TIDAK aktif —
    // frontend langsung terhubung ke BASE_URL di src/api/axios.js
    proxy: {
      '/api': {
        target: 'http://localhost/hypercare/backend',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'react';
          }
          if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/react-router/')) {
            return 'router';
          }
          if (id.includes('node_modules/axios/')) {
            return 'axios';
          }
        },
      },
    },
  },
})
