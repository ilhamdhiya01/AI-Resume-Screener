import 'dotenv/config';
import '@/lib/dommatrix-polyfill';

import { connection } from '@/lib/queue/resume-queue';
import { ensureWorkerRunning } from '@/lib/queue/resume-worker';

// Standalone worker should stay alive for a long time (1 hour idle timeout).
// This prevents the lazy-worker auto-shutdown logic from closing the worker
// between job batches.
process.env.WORKER_IDLE_TIMEOUT_MS = String(60 * 60 * 1000);

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
