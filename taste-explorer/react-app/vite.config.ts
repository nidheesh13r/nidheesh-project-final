import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  server: {
    port: 5176,
    proxy: {
      '/cities': 'http://localhost:8099',
      '/taste': 'http://localhost:8099',
      '/users': 'http://localhost:8099',
      '/widget': 'http://localhost:8099',
    },
  },
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
