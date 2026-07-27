import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // พอร์ตคงที่ให้ Cursor debug (launch.json) ชี้ถูกทุกครั้ง
  server: {
    port: 5173,
    strictPort: true,
  },
  // source map ชัด ๆ สำหรับ breakpoint ใน .jsx
  css: {
    devSourcemap: true,
  },
})
