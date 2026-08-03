import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/nlcil-ppt-generator/', // Exact repo name with slashes on both ends
})