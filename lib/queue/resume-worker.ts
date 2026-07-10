/* eslint-disable @typescript-eslint/no-explicit-any */
import { Worker } from 'bullmq';

import { connection, resumeQueue } from '@/lib/queue/resume-queue';
import { analyzeResume } from '@/services/server/resume-analysis.service';

let workerInstance: Worker | null = null;
let idleTimeout: NodeJS.Timeout | null = null;

/**
 * @description Redis Pub/Sub channel used to wake sleeping worker containers.
 * The web app publishes a message here after enqueueing a job, so workers do
 * not need to keep BullMQ blocking connections alive while idle.
 */
export const WORKER_WAKE_CHANNEL = 'resume-analysis:wake';

/**
 * @description Get idle timeout from env at runtime. This allows standalone
 * startup scripts (e.g. scripts/start-worker.ts) to override the value before
 * the worker starts processing jobs.
 */
const getIdleTimeoutMs = () => {
  const value = process.env.WORKER_IDLE_TIMEOUT_MS;
  if (value === 'never') {
    return null; // Always-on mode (no idle shutdown)
  }
  return value ? parseInt(value, 10) : 10000; // Default 10s lazy timeout
};

/**
 * @description **[WORKER - LAZY STARTUP]** Creates and starts the BullMQ worker
 * if not already running. Implements "lazy worker" pattern to minimize Redis
 * connections and command usage.
 *
 * **Architecture Pattern:**
 * - **On-Demand Connection:** Worker only connects when jobs exist in queue
 * - **Auto-Shutdown:** Closes after configured idle timeout (default 10s, saves Redis commands)
 * - **Singleton:** Only one worker instance runs at a time (prevents race conditions)
 *
 * **Worker Configuration:**
 * - Concurrency: 3 (processes up to 3 jobs concurrently)
 * - Stalled Interval: 60s (checks for stuck jobs every minute)
 * - Max Stalled Count: 1 (job fails if stalled once)
 *
 * **Side Effects:**
 * - **Redis Connection:** Opens persistent connection to Redis
 * - **Event Listeners:** Registers handlers for completed, failed, error, drained
 * - **Idle Timer:** Starts idle countdown to auto-close
 *
 * @returns {void}
 *
 * @example
 * // Called by producer after enqueuing job
 * ensureWorkerRunning();
 * // Worker wakes up, processes job, then auto-closes after idle timeout
 */
export const ensureWorkerRunning = () => {
  // Guard: If worker already running, just reset idle timer
  if (workerInstance) {
    resetIdleTimeout(); // Prevent premature shutdown
    return;
  }

  /**
   * @description **[WORKER - JOB PROCESSOR]** Main job processing function.
   * Dequeues jobs from Redis and delegates to `analyzeResume` service.
   *
   * **Data Flow:**
   * 1. Dequeue job from Redis (blocking pop)
   * 2. Extract resumeId and filePath from job payload
   * 3. Clear idle timer (worker is now busy)
   * 4. Call `analyzeResume` with AbortSignal for cancellation support
   * 5. Stream progress updates back to Redis via `job.updateProgress()`
   * 6. Mark job as completed or failed in Redis
   *
   * **Cancellation Handling:**
   * - User can cancel via `cancelSpecificJob(jobId)`
   * - Worker receives AbortSignal and propagates to `analyzeResume`
   * - Analysis stops immediately at next checkpoint
   * - Job marked as failed with "cancelled" error message
   *
   * **Error Handling:**
   * - Cancellation errors: Caught and re-thrown with clear message
   * - Analysis errors: Re-thrown to let BullMQ mark job as failed
   * - BullMQ automatically updates job state in Redis
   */
  workerInstance = new Worker(
    'resume-analysis', // Queue name (must match producer)
    async (job, token, signal) => {
      const { resumeId, filePath } = job.data;

      // Clear idle timeout while processing (prevent auto-shutdown mid-job)
      clearIdleTimer();

      console.log(`🔄 Processing job ${job.id} - Resume: ${resumeId}`);

      // Internal abort controller that can be triggered by the Redis cancel flag.
      // The standalone worker polls Redis because BullMQ's workerInstance is not
      // accessible from the Next.js API process.
      const abortController = new AbortController();
      const abortHandler = () => abortController.abort();
      signal?.addEventListener('abort', abortHandler);

      const cancelPollInterval = setInterval(async () => {
        try {
          const cancelFlag = await connection.get(`cancel:${job.id}`);
          if (cancelFlag) {
            console.log(
              `🛑 Cancel flag detected for job ${job.id}, aborting...`
            );
            abortController.abort();
            clearInterval(cancelPollInterval);
          }
        } catch (err) {
          console.error('Cancel poll error:', err);
        }
      }, 500);

      try {
        // Check if job was cancelled before starting
        if (abortController.signal.aborted) {
          throw new Error('Proses dibatalkan oleh user');
        }

        // Delegate to analysis service with cancellation support
        await analyzeResume(
          resumeId,
          filePath,
          abortController.signal, // AbortSignal for cancellation
          async (data) => {
            // Stream progress updates to Redis (polled by frontend)
            await job.updateProgress(data);
          }
        );
        console.log(`✅ Job ${job.id} completed`);
      } catch (error: any) {
        // Handle cancellation errors (user-initiated or timeout)
        if (
          abortController.signal.aborted ||
          error?.name === 'AbortError' ||
          error?.message?.includes('cancel')
        ) {
          const cancelError = new Error('Proses dibatalkan oleh user');
          console.error(`❌ Job ${job.id} cancelled:`, cancelError.message);
          throw cancelError; // BullMQ marks as failed with this message
        }

        // Handle analysis errors (LLM API failure, file parsing, etc.)
        console.error(`❌ Job ${job.id} failed:`, error);
        throw error; // Re-throw to let BullMQ handle (marks job as failed)
      } finally {
        clearInterval(cancelPollInterval);
        signal?.removeEventListener('abort', abortHandler);
        // Best-effort cleanup of the cancel flag
        await connection.del(`cancel:${job.id}`).catch(() => {});
      }
    },
    {
      connection,
      concurrency: 3,
      stalledInterval: 60000,
      maxStalledCount: 1,
    }
  );

  // Event: Job completed successfully
  workerInstance.on('completed', () => {
    resetIdleTimeout(); // Start idle countdown (may close worker)
  });

  // Event: Job failed (error thrown in processor)
  workerInstance.on('failed', (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
    resetIdleTimeout(); // Start idle countdown
  });

  // Event: Worker-level error (connection issues, etc.)
  workerInstance.on('error', (err) => {
    console.error('❌ Worker error:', err);
  });

  // Event: Queue is empty (no more jobs to process)
  workerInstance.on('drained', () => {
    resetIdleTimeout(); // Start idle countdown to auto-close
  });

  console.log('🚀 Lazy worker started');
};

/**
 * @description **[WORKER - PUB/SUB WAKE]** Subscribes to a Redis Pub/Sub channel
 * so the worker container can sleep while idle and only wake up when the web app
 * publishes a signal after enqueueing a job. This avoids the continuous blocking
 * Redis commands that an always-on BullMQ worker would issue.
 *
 * **Side Effects:**
 * - Opens a dedicated Redis subscriber connection.
 * - Calls `ensureWorkerRunning()` whenever a wake message is received.
 * - Keeps the Node.js process alive while listening.
 *
 * @returns The Redis subscriber instance.
 */
export const subscribeToWakeChannel = () => {
  const subscriber = connection.duplicate();

  subscriber.on('error', (err) => {
    console.error('❌ Wake subscriber error:', err.message);
  });

  subscriber.on('connect', () => {
    console.log('📡 Wake subscriber connected');
  });

  subscriber.subscribe(WORKER_WAKE_CHANNEL, (err) => {
    if (err) {
      console.error(
        `❌ Failed to subscribe to ${WORKER_WAKE_CHANNEL}:`,
        err.message
      );
      process.exit(1);
    }
    console.log(`📡 Subscribed to ${WORKER_WAKE_CHANNEL}`);
  });

  subscriber.on('message', (channel) => {
    if (channel === WORKER_WAKE_CHANNEL) {
      console.log('🔔 Wake signal received, starting worker...');
      ensureWorkerRunning();
    }
  });

  return subscriber;
};

/**
 * @description **[WORKER - IDLE MANAGEMENT]** Resets the idle timeout timer.
 * Worker auto-closes after `WORKER_IDLE_TIMEOUT_MS` of inactivity to save Redis
 * commands and connections. Defaults to 10s when not configured.
 *
 * **Lazy Worker Pattern:**
 * - Worker closes itself when queue is empty for the configured idle timeout
 * - Next job enqueue will call `ensureWorkerRunning()` to wake it up
 * - Reduces Redis command usage by ~90% compared to always-on worker
 *
 * **Side Effects:**
 * - **Timer Reset:** Clears existing timeout and starts a new idle countdown
 * - **Worker Shutdown:** Closes Redis connection after timeout expires
 * - **State Cleanup:** Sets `workerInstance` to null after close
 *
 * @returns {void}
 */
const resetIdleTimeout = () => {
  clearIdleTimer(); // Clear existing timer if any

  const idleTimeoutMs = getIdleTimeoutMs();
  if (idleTimeoutMs === null) {
    // Always-on mode: do not schedule auto-close
    return;
  }

  // Start new countdown to auto-close
  idleTimeout = setTimeout(async () => {
    if (workerInstance) {
      console.log(
        `💤 Worker idle for ${idleTimeoutMs}ms, closing connection...`
      );
      await workerInstance.close(); // Graceful shutdown
      workerInstance = null; // Allow re-creation on next job
    }
  }, idleTimeoutMs);
};

const clearIdleTimer = () => {
  if (idleTimeout) {
    clearTimeout(idleTimeout);
    idleTimeout = null;
  }
};

/**
 * @description **[WORKER - RETRY MECHANISM]** Manually retries a failed job.
 * Wakes up lazy worker and re-enqueues the job to Redis.
 *
 * **Data Flow:**
 * 1. Fetch job from Redis by jobId
 * 2. Verify job exists and is in "failed" state
 * 3. Wake up worker (lazy pattern requires explicit activation)
 * 4. Call `job.retry()` to re-enqueue to Redis
 *
 * **Business Logic:**
 * - **Manual Retry Only:** Automatic retries are disabled (attempts: 1)
 * - **Lazy Worker:** Must call `ensureWorkerRunning()` before retry
 * - **State Validation:** Only failed jobs can be retried
 *
 * **Side Effects:**
 * - **Redis Write:** Moves job from "failed" to "waiting" state
 * - **Worker Activation:** Calls `ensureWorkerRunning()` to process retry
 *
 * @param {string} jobId - BullMQ job ID (same as resumeId)
 * @returns {Promise<{ success: boolean; message: string }>} Retry confirmation
 * @throws {Error} If job not found or not in failed state
 *
 * @example
 * await retrySpecificJob('resume-123');
 * // Job re-enqueued, worker will process again
 */
export const retrySpecificJob = async (jobId: string) => {
  const job = await resumeQueue.getJob(jobId);

  if (job && (await job.isFailed())) {
    console.log(`🔄 Retrying job ${jobId} manually...`);

    // Critical: Wake up lazy worker before retry
    // (Worker auto-closes after 10s idle, must be restarted)
    ensureWorkerRunning();

    await job.retry(); // Re-enqueue to Redis
    return { success: true, message: `Job ${jobId} dikembalikan ke antrean.` };
  }

  throw new Error('Job tidak ditemukan atau statusnya bukan failed');
};

/**
 * @description **[WORKER - CANCELLATION]** Cancels a running or queued job.
 * Handles both active jobs (via AbortSignal) and waiting jobs (direct removal).
 *
 * **Data Flow:**
 * 1. Fetch job from Redis by jobId
 * 2. Check job state (active, waiting, delayed, etc.)
 * 3. **If active:** Send AbortSignal to worker processor
 * 4. **If waiting/delayed:** Remove directly from Redis queue
 * 5. **Otherwise:** Reject (job already completed/failed)
 *
 * **Cancellation Strategies:**
 * - **Active Job:** Sends AbortSignal → worker catches → throws cancel error
 * - **Waiting Job:** Direct removal from Redis (no worker involvement)
 * - **Delayed Job:** Direct removal from Redis (scheduled jobs)
 *
 * **Business Logic:**
 * - **Graceful Cancellation:** Worker stops at next checkpoint (not immediate)
 * - **State Validation:** Only active/waiting/delayed jobs can be cancelled
 * - **Lazy Worker:** Must wake worker to send AbortSignal to active jobs
 *
 * **Side Effects:**
 * - **Redis Write:** Removes job or marks as failed with cancel message
 * - **Worker Signal:** Sends AbortSignal to running processor
 * - **Database Update:** `analyzeResume` updates resume status to FAILED
 *
 * @param {string} jobId - BullMQ job ID (same as resumeId)
 * @returns {Promise<{ success: boolean; message: string }>} Cancellation result
 * @throws {Error} If job not found or cancellation fails
 *
 * @example
 * // User clicks "Cancel" button during analysis
 * await cancelSpecificJob('resume-123');
 * // Worker receives AbortSignal and stops at next checkpoint
 */
export const cancelSpecificJob = async (jobId: string) => {
  const job = await resumeQueue.getJob(jobId);

  try {
    if (!job) {
      throw new Error('Job is not found');
    }

    const state = await job.getState();

    // Case 1: Job is currently being processed by worker
    if (state === 'active') {
      // Standalone worker runs in a separate process, so workerInstance is
      // null in this (Next.js) process. Use a Redis flag instead: the worker
      // polls this key every 500ms and aborts the job when it appears.
      const cancelKey = `cancel:${jobId}`;
      await connection.set(cancelKey, '1', 'EX', 300); // expires in 5 min
      console.log(`🏴 Cancel flag set for job ${jobId}`);

      return {
        success: true,
        message: 'Sinyal pembatalan berhasil dikirim ke worker',
      };
    }

    // Case 2: Job is waiting in queue or scheduled (not started yet)
    if (state === 'waiting' || state === 'delayed') {
      // Direct removal from Redis (no worker involvement)
      await job.remove();
      return { success: true, message: 'Job berhasil dihapus dari antrean' };
    }

    // Case 3: Job already completed/failed (cannot cancel)
    return {
      success: false,
      message: `Job tidak bisa dibatalkan karena berstatus: ${state}`,
    };
  } catch (error) {
    console.error('Failed to cancel job:', error);
    throw error;
  }
};
