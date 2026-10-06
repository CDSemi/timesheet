import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Builds the React client into dist/client; Hono serves it on the same origin as /api. Source maps are on for local
// builds; the image build sets BUILD_SOURCEMAPS=off (Dockerfile), so the image carries no map and no map comment.
export default defineConfig({
  root: fileURLToPath(new URL('./src/client', import.meta.url)),
  plugins: [react()],
  build: {
    outDir: fileURLToPath(new URL('./dist/client', import.meta.url)),
    emptyOutDir: true,
    sourcemap: process.env.BUILD_SOURCEMAPS !== 'off',
  },
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: { '/api': 'http://127.0.0.1:3000' },
  },
});
