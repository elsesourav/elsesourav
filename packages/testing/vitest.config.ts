import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const prismaClientPath = path.dirname(require.resolve('@prisma/client'));

export default defineConfig({
  resolve: {
    alias: {
      '@elsesourav/auth': path.resolve(__dirname, '../auth/src'),
      '@elsesourav/config': path.resolve(__dirname, '../config/src'),
      '@elsesourav/database': path.resolve(__dirname, '../database/src'),
      '@elsesourav/media': path.resolve(__dirname, '../media/src'),
      '@elsesourav/types': path.resolve(__dirname, '../types/src'),
      '@elsesourav/ui': path.resolve(__dirname, '../ui/src'),
      '@elsesourav/utils': path.resolve(__dirname, '../utils/src'),
      '@elsesourav/validation': path.resolve(__dirname, '../validation/src'),
      '@elsesourav/testing': path.resolve(__dirname, './src'),
      '@prisma/client': prismaClientPath,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
});
