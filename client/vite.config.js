import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Same-origin API in development so the httpOnly auth cookies just work.
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },
});
