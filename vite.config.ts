import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,    // 👈 permite que otros dispositivos accedan
    port: 5173     // 👈 el puerto que usa tu dev server
  }
})

