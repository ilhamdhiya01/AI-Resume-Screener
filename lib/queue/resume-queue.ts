/**
 * @description **[REDIS QUEUE - CONFIGURATION]** BullMQ queue setup for resume
 * analysis background jobs. Configures Redis connection, job options, and
 * automatic cleanup policies.
 *
 * **Architecture:**
 * - **Queue Name:** `resume-analysis` (must match worker processor)
 * - **Connection:** ioredis client with optimized settings for BullMQ
 * - **Job Options:** Single attempt, exponential backoff, automatic cleanup
 *
 * **Redis Connection:**
 * - `maxRetriesPerRequest: null` - Required for BullMQ (uses blocking commands)
 * - `enableReadyCheck: false` - Faster startup, assumes Redis is available
 * - URL from `REDIS_URL` env var (e.g., redis://localhost:6379)
 *
 * **Job Configuration:**
 * - **Attempts:** 1 (no automatic retry, manual retry via `retrySpecificJob`)
 * - **Backoff:** Exponential with 5s initial delay (not used with attempts: 1)
 * - **Cleanup - Completed:** Remove after 24 hours OR keep max 1000 jobs
 * - **Cleanup - Failed:** Remove after 7 days (allows manual inspection/retry)
 *
 * **Business Logic:**
 * - Single attempt prevents duplicate LLM API calls (expensive)
 * - Manual retry gives user control (via retry button in UI)
 * - Aggressive cleanup for completed jobs (saves Redis memory)
 * - Longer retention for failed jobs (debugging and retry)
 */
import { Queue } from 'bullmq';
import Redis from 'ioredis';

/**
 * @description Redis connection for BullMQ queue and worker.
 * Shared between producer (queue) and consumer (worker).
 *
 * **Configuration:**
 * - `maxRetriesPerRequest: null` - Required for BullMQ blocking commands
 * - `enableReadyCheck: false` - Skip ready check for faster startup
 */
const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false, // Faster startup
});

/**
 * @description BullMQ queue for resume analysis jobs.
 * Producer (upload service) adds jobs, consumer (worker) processes them.
 *
 * **Default Job Options:**
 * - Single attempt (no auto-retry)
 * - Exponential backoff (5s initial, not used with attempts: 1)
 * - Auto-cleanup: 24h for completed, 7d for failed
 */
export const resumeQueue = new Queue('resume-analysis', {
  connection,
  defaultJobOptions: {
    attempts: 1, // No automatic retry (manual retry only)
    backoff: {
      type: 'exponential',
      delay: 5000, // 5s initial delay (not used with attempts: 1)
    },
    removeOnComplete: {
      age: 24 * 3600, // Remove completed jobs after 24 hours
      count: 1000, // OR keep max 1000 completed jobs
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Remove failed jobs after 7 days
    },
  },
});

export { connection };
