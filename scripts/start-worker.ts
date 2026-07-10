import 'dotenv/config';
import '@/lib/dommatrix-polyfill';

import { connection } from '@/lib/queue/resume-queue';
import { subscribeToWakeChannel } from '@/lib/queue/resume-worker';

connection.ping((err, result) => {
  if (err) {
    console.error('❌ Redis connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Redis connected:', result);
});

// Subscribe to the wake channel. Workers sleep while idle and are woken up
// by the web app via Redis Pub/Sub after a job is enqueued. This avoids the
// continuous Redis blocking commands required by an always-on BullMQ worker.
subscribeToWakeChannel();
console.log('💤 Worker is listening for wake signals... Press Ctrl+C to stop');
