import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/__tests__/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
    environmentMatchGlobs: [
      ['src/server/**/*.test.ts', 'node'],
      ['src/app/api/**/*.test.ts', 'node'],
    ],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/server/services/**', 'src/stores/**'],
      exclude: ['src/**/__tests__/**', 'src/**/*.test.*'],
    },
  },
});
