import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Same precedence as Next.js: `.env.local` overrides `.env`. (Inline rather
// than `lib/load-env`, because the migrator image only ships `prisma/` and
// this file.)
config({ path: ['.env.local', '.env'], quiet: true });

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
