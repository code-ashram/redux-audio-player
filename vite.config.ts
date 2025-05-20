import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';
import svgr from "vite-plugin-svgr";
import basicSsl from '@vitejs/plugin-basic-ssl';


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    [svgr()],
    basicSsl()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Настройка алиаса на директорию src
    },
  },
  server: {
    host: '0.0.0.0',
  },
})
