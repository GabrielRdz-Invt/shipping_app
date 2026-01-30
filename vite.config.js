import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  server: {
      proxy: {
        '/api': {
          // target: 'http://localhost:7054', // el backend de desarrollo
          target: 'https://iep-app-n.iec.inventec:443/Warehouse_Api/api', // el backend real
          changeOrigin: true,
          secure: false
        }
      }
    },
});
