import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  server: {
    port: 5174,
    proxy: {
      '/cities': 'http://localhost:8001',
      '/users': 'http://localhost:8001',
      '/hotels': 'http://localhost:8001',
      '/bookings': 'http://localhost:8001',
      '/widget': 'http://localhost:8001',
      '/payments': 'http://localhost:8001',
    },
  },
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
