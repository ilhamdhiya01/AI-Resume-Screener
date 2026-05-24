/* eslint-disable @typescript-eslint/no-explicit-any */
import { Worker } from 'bullmq';

import { connection, resumeQueue } from '@/lib/queue/resume-queue';
import { analyzeResume } from '@/lib/services/resume-analysis.service';

let workerInstance: Worker | null = null;
let idleTimeout: NodeJS.Timeout | null = null;

const IDLE_TIMEOUT_MS = 10000; // Close worker after 30s idle

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
    async (job, token, signal) => {
      const { resumeId, filePath } = job.data;
      // Clear idle timeout while processing
      clearIdleTimer();

      console.log(`🔄 Processing job ${job.id} - Resume: ${resumeId}`);

      try {
        if (signal?.aborted) {
          throw new Error('Proses dibatalkan oleh user');
        }

        // if (signal) {
        //   await analyzeResume(resumeId, filePath, signal, async (data) => {
        //     await job.updateProgress(data); // ← data bisa include error
        //   });
        // }
        await analyzeResume(
          resumeId,
          filePath,
          signal || new AbortSignal(),
          async (data) => {
            await job.updateProgress(data); // ← data bisa include error
          }
        );
        console.log(`✅ Job ${job.id} completed`);
      } catch (error: any) {
        if (
          signal?.aborted ||
          error?.name === 'AbortError' ||
          error?.message?.includes('cancel')
        ) {
          const cancelError = new Error('Proses dibatalkan oleh user');
          console.error(`❌ Job ${job.id} cancelled:`, cancelError.message);
          throw cancelError;
        }
        // ✅ Error sudah di-throw dari analyzeResume
        // BullMQ otomatis set job state = 'failed'
        console.error(`❌ Job ${job.id} failed:`, error);
        throw error; // Re-throw biar BullMQ handle
      }
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
      console.log('💤 Worker idle for 10s, closing connection...');
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

export const retrySpecificJob = async (jobId: string) => {
  const job = await resumeQueue.getJob(jobId);

  if (job && (await job.isFailed())) {
    console.log(`🔄 Retrying job ${jobId} manually...`);

    // 💡 KUNCI PENTING: Karena lu pakai sistem Lazy Worker (auto-close),
    // lu harus bangunin worker-nya lagi pas mau retry!
    ensureWorkerRunning();

    await job.retry();
    return { success: true, message: `Job ${jobId} dikembalikan ke antrean.` };
  }

  throw new Error('Job tidak ditemukan atau statusnya bukan failed');
};

export const cancelSpecificJob = async (jobId: string) => {
  const job = await resumeQueue.getJob(jobId);

  try {
    if (!job) {
      throw new Error('Job is not found');
    }

    const state = await job.getState();

    if (state === 'active') {
      ensureWorkerRunning();

      // Kirim sinyal cancel melalui instance worker
      await workerInstance?.cancelJob(jobId, 'Proses dibatalkan oleh user');

      return {
        success: true,
        message: 'Sinyal pembatalan berhasil dikirim ke worker',
      };
    }

    // Logika untuk state 'waiting' tetap bisa langsung menggunakan job.remove()
    if (state === 'waiting' || state === 'delayed') {
      // Langsung hapus dari antrean Redis tanpa melibatkan worker
      await job.remove();
      return { success: true, message: 'Job berhasil dihapus dari antrean' };
    }

    return {
      success: false,
      message: `Job tidak bisa dibatalkan karena berstatus: ${state}`,
    };
  } catch (error) {
    console.error('Failed to cancel job:', error);
    throw error;
  }
};
