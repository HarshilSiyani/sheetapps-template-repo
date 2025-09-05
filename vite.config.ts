import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    // Configure for E2B sandbox compatibility
    hmr: {
      clientPort: 443,
      protocol: 'wss'
    },
    // Allow E2B sandbox hosts
    allowedHosts: [
      '.e2b.app',    // Allow all E2B subdomains
      'localhost',   // Local development
      '127.0.0.1'    // Local IP
    ]
  },
  build: {
    outDir: 'dist',
  },
})