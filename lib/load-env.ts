import { config } from 'dotenv';

/**
 * Loads env files for processes Next.js does not start (the worker), with
 * Next's precedence: `.env.local` overrides `.env`. Import it first — as a
 * side-effect import it runs before modules that read `process.env` at load
 * time (e.g. the Redis connection). No-op in Docker, where env comes from
 * compose and these files do not exist.
 */
config({ path: ['.env.local', '.env'], quiet: true });
