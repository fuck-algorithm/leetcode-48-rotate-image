import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/leetcode-48-rotate-image/',
  server: {
    port: 54321
  }
})
