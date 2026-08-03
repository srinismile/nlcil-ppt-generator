import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/nlcil-ppt-generator/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets', // Forces Vite to place JS and CSS in dist/assets
  },
})