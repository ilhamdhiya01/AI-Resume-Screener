import { Worker } from 'bullmq';

import { connection } from '@/lib/queue/resume-queue';
import { analyzeResume } from '@/lib/services/resume-analysis.service';

let workerInstance: Worker | null = null;
let idleTimeout: NodeJS.Timeout | null = null;

const IDLE_TIMEOUT_MS = 30000; // Close worker after 30s idle

/**
 * @description Creates and starts the BullMQ worker if not already running.
 * Worker auto-closes after 30s of inactivity to save Redis commands.
 */
export const ensureWorkerRunning = () => {
  if (workerInstance) {
    // Worker already running, reset idle timeout
    resetIdleTimeout();
    return;
  }

  workerInstance = new Worker(
    'resume-analysis',
    async (job) => {
      const { resumeId, filePath } = job.data;

      // Clear idle timeout while processing
      clearIdleTimer();

      console.log(`🔄 Processing job ${job.id} - Resume: ${resumeId}`);

      await analyzeResume(resumeId, filePath, async (data) => {
        await job.updateProgress(data);
      });

      console.log(`✅ Job ${job.id} completed`);
    },
    {
      connection,
      concurrency: 1,
      stalledInterval: 60000,
      maxStalledCount: 1,
    }
  );

  workerInstance.on('completed', () => {
    resetIdleTimeout();
  });

  workerInstance.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
    resetIdleTimeout();
  });

  workerInstance.on('error', (err) => {
    console.error('❌ Worker error:', err);
  });

  workerInstance.on('drained', () => {
    // Queue is empty, start idle countdown
    resetIdleTimeout();
  });

  console.log('🚀 Lazy worker started');
};

/**
 * @description Resets the idle timeout. Worker closes after IDLE_TIMEOUT_MS of no activity.
 */
const resetIdleTimeout = () => {
  clearIdleTimer();
  idleTimeout = setTimeout(async () => {
    if (workerInstance) {
      console.log('💤 Worker idle for 30s, closing connection...');
      await workerInstance.close();
      workerInstance = null;
    }
  }, IDLE_TIMEOUT_MS);
};

const clearIdleTimer = () => {
  if (idleTimeout) {
    clearTimeout(idleTimeout);
    idleTimeout = null;
  }
};
