
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // This ensures paths are relative so the app works on GitHub Pages sub-folders
  base: './', 
  build: {
    outDir: 'dist',
  }
})
