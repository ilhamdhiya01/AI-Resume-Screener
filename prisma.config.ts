import 'dotenv/config';

import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DATABASE_URL'],
    // Only `prisma migrate dev` needs it; when unset Prisma creates and drops
    // a temporary shadow database itself.
    shadowDatabaseUrl: process.env['SHADOW_DATABASE_URL'],
  },
});
