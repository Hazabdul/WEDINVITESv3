/* global process */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Generate a version string using Netlify's commit hash and current build time
const commitHash = process.env.COMMIT_REF ? process.env.COMMIT_REF.substring(0, 7) : 'dev';
const buildTime = new Date().toLocaleString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
const appVersion = `${commitHash} - ${buildTime} UTC`;

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'https://wedinvitesv3.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    __API_BASE_URL__: JSON.stringify(process.env.VITE_API_BASE_URL || 'https://wedinvitesv3.onrender.com'),
    __APP_VERSION__: JSON.stringify(appVersion),
  },
})
