import { defineConfig } from 'vitest/config';

const apiServer = 'http://127.0.0.1:8080';

export default defineConfig({
  server: { proxy: { '/api': apiServer, '/healthz': apiServer } },
  build: { target: 'es2022' },
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
