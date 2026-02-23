import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

// Load .env.local (Next.js convention) so Prisma commands
// pick up DATABASE_URL without a dotenv-cli prefix.
dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: `tsx prisma/seed.ts`
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
