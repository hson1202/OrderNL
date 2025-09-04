import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Enable history API fallback for development
    historyApiFallback: true
  },
  preview: {
    // Enable history API fallback for preview
    historyApiFallback: true
  }
})
