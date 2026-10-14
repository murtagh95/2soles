import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // El chunk de Firestore ronda los 575 KB y ya se carga de forma diferida
  build: { chunkSizeWarningLimit: 600 },
})
