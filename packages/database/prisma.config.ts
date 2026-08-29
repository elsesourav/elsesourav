import path from 'node:path';
import dotenv from 'dotenv';
import { defineConfig } from '@prisma/config';

// Load environment variables from monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: {
    url: process.env.DATABASE_URL || '',
    directUrl: process.env.DIRECT_URL || '',
  },
});
