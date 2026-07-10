import 'dotenv/config';
import '@/lib/dommatrix-polyfill';

import { connection } from '@/lib/queue/resume-queue';
import { ensureWorkerRunning } from '@/lib/queue/resume-worker';

// Standalone worker should stay alive forever. Docker handles restarts if the
// process exits, so we disable the lazy-worker auto-shutdown logic.
process.env.WORKER_IDLE_TIMEOUT_MS =
  process.env.WORKER_IDLE_TIMEOUT_MS || 'never';

connection.ping((err, result) => {
  if (err) {
    console.error('❌ Redis connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Redis connected:', result);
});

// Start worker immediately for standalone mode
ensureWorkerRunning();
console.log('Worker is running... Press Ctrl+C to stop');
