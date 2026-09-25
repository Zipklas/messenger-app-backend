
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: '../libs/infrastructure/db/src/prisma',
  migrations: {
    path: '../libs/infrastructure/db/src/prisma/migrations',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});