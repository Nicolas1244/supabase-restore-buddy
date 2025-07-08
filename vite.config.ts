import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Port explicitement défini pour correspondre à l'URL de prévisualisation
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Votre adresse de serveur backend
        changeOrigin: true, // Nécessaire pour les sites hébergés virtuellement
      },
    },
  },
});
