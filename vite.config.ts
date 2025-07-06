import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy requests starting with /api to the backend server
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Your backend server address
        changeOrigin: true, // Needed for virtual hosted sites
        // Removed: rewrite: (path) => path.replace(/^\/api/, ''), // This line is removed
      },
    },
  },
});
