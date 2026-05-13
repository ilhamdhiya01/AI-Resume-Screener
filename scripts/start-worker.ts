import 'dotenv/config';
import '@/lib/queue/resume-worker';

import { connection } from '@/lib/queue/resume-queue';

connection.ping((err, result) => {
  if (err) {
    console.error('❌ Redis connection failed:', err.message);
    process.exit(1);
  }
  console.log('✅ Redis connected:', result);
});
console.log('Worker is running... Press Ctrl+C to stop');
