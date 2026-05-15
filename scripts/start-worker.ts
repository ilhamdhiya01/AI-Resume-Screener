import 'dotenv/config';

import { connection } from '@/lib/queue/resume-queue';
import { ensureWorkerRunning } from '@/lib/queue/resume-worker';

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
