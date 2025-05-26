import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  define: {
    'process.env': {
      VITE_BACKEND_URL: JSON.stringify(process.env.VITE_BACKEND_URL || 'http://localhost:5000'),
    },
  },
});