import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const repositoryName = 'leetcode-48-rotate-image'
const base = process.env.VITE_APP_BASE || `/${repositoryName}/`

export default defineConfig({
  plugins: [react()],
  base,
  server: {
    port: 54321
  }
})
