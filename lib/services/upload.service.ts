import { v4 as uuidv4 } from 'uuid';

import prisma from '../db';
import { ensureWorkerRunning, resumeQueue } from '../queue';
import { supabaseAdmin } from '../supabase-admin';

/**
 * @description **[REDIS QUEUE - PRODUCER]** Orchestrates file upload, database
 * persistence, and asynchronous job enqueueing for resume analysis. This is the
 * entry point that triggers the entire analysis pipeline.
 *
 * **Data Flow:**
 * 1. Generate unique file path (userId/timestamp-uuid.ext)
 * 2. Upload file to Supabase Storage (private bucket)
 * 3. Generate signed URL for temporary access (1 hour expiry)
 * 4. Create resume record in database with PENDING status
 * 5. **Enqueue job to Redis** via BullMQ (producer role)
 * 6. Wake up lazy worker (on-demand connection)
 *
 * **Side Effects:**
 * - **External API Call:** Uploads file to Supabase Storage (S3-compatible)
 * - **Database Write:** Creates `Resume` record in `resumes` table
 * - **Redis Write:** Adds job to `resume-analysis` queue (persistent)
 * - **Worker Activation:** Calls `ensureWorkerRunning()` to process job
 *
 * **Business Logic:**
 * - **Job ID = Resume ID:** Enables direct job lookup without mapping table
 * - **Lazy Worker:** Worker only connects when jobs exist (saves Redis commands)
 * - **Signed URL:** Temporary access for frontend preview (expires in 1 hour)
 * - **Private Storage:** Files are not publicly accessible (security)
 *
 * **Queue Configuration:**
 * - Attempts: 1 (no automatic retry on failure)
 * - Backoff: Exponential, 5s initial delay
 * - Cleanup: Completed jobs removed after 24h, failed after 7 days
 *
 * @param {File} file - Uploaded file object (PDF or DOCX)
 * @param {string} userId - ID of user uploading the resume
 * @param {string} [jobDescription] - Optional job description for context-aware analysis
 * @returns {Promise<{ signedUrl: string; path: string; resumeId: string }>}
 *          Signed URL for preview, storage path, and resume ID (also job ID)
 * @throws {Error} If upload fails or signed URL generation fails
 *
 * @example
 * const result = await uploadResumeToSupabaseStorage(
 *   fileBlob,
 *   'user-123',
 *   'Senior Frontend Engineer at Google'
 * );
 * // Job enqueued, worker will process asynchronously
 * // result.resumeId can be used to poll job status
 */
export const uploadResumeToSupabaseStorage = async (
  file: File,
  userId: string,
  jobDescription?: string
): Promise<{ signedUrl: string; path: string; resumeId: string }> => {
  // Step 1: Generate unique file path to prevent collisions
  const uuidV4 = uuidv4();
  const timeStamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${timeStamp}-${uuidV4}.${fileExt}`;

  // Step 2: Upload file to Supabase Storage (private bucket)
  const { data, error } = await supabaseAdmin.storage
    .from('resumes')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false, // Prevent accidental overwrites
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // Step 3: Generate signed URL for temporary frontend access (1 hour)
  const { data: signedUrlData, error: signedUrlErrorr } =
    await supabaseAdmin.storage
      .from('resumes')
      .createSignedUrl(data.path, 3600);

  if (signedUrlErrorr) {
    throw new Error(
      `Failed to generate signed URL: ${signedUrlErrorr.message}`
    );
  }

  // Step 4: Persist resume metadata to database with PENDING status
  const resume = await prisma.resume.create({
    data: {
      userId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      filePath: data.path,
      status: 'PENDING', // ← Worker will update to PROCESSING → COMPLETED/FAILED
      jobDescription: jobDescription || null,
    },
  });

  // Step 5: **ENQUEUE JOB TO REDIS** (Producer role)
  // This is the critical handoff from HTTP request to background processing
  await resumeQueue.add(
    'resume-analysis', // Queue name
    {
      resumeId: resume.id, // Payload: worker will use this to fetch file
      filePath: data.path,
    },
    {
      jobId: resume.id, // ← Key optimization: Job ID = Resume ID (no mapping table)
    }
  );

  // Step 6: Wake up lazy worker (auto-closes after 10s idle)
  // Worker will pick up job from Redis and start processing
  ensureWorkerRunning();

  return {
    signedUrl: signedUrlData.signedUrl,
    path: data.path,
    resumeId: resume.id,
  };
};

/**
 * @description Generate signed URL untuk file yang sudah ada di storage
 * @param filePath - Path file di storage (e.g., "user_123/1683456789.pdf")
 * @param expiresIn - Durasi URL valid (dalam detik), default 1 hour
 * @returns Signed URL
 */
export const getSignedUrl = async (
  filePath: string,
  expiresIn: number = 3600
): Promise<string> => {
  const { data, error } = await supabaseAdmin.storage
    .from('resumes')
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }

  return data.signedUrl;
};
