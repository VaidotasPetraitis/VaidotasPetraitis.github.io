import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: { target: 'es2022' },
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
