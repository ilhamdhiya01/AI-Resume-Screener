import { resumeFileUrl } from '@/routes';

import prisma from '../../lib/db';
import { publishWorkerWake, resumeQueue } from '../../lib/queue';
import { ResumeMimeType } from '../../lib/storage/file-signature';
import {
  deleteResumeFile,
  saveResumeFile,
} from '../../lib/storage/resume-storage';

/**
 * @description **[REDIS QUEUE - PRODUCER]** Stores an uploaded resume,
 * records it in the database and enqueues it for analysis. This is the entry
 * point of the analysis pipeline.
 *
 * **Data Flow:**
 * 1. Save the file to resume storage (key `userId/uuid.ext`)
 * 2. Create the resume record with PENDING status
 * 3. **Enqueue job to Redis** via BullMQ (producer role)
 * 4. Wake up sleeping workers via Redis Pub/Sub
 *
 * **Business Logic:**
 * - **Job ID = Resume ID:** Enables direct job lookup without mapping table
 * - **No orphan files:** if the database write fails, the stored file is removed
 * - **Private files:** served only through `/api/resume/[id]/file`, which
 *   checks the session and ownership
 *
 * @param {object} params
 * @param {Buffer} params.content - File content (already size- and type-checked)
 * @param {ResumeMimeType} params.mimeType - MIME type detected from the content
 * @param {string} params.fileName - Original file name (display only)
 * @param {string} params.userId - ID of the uploading user
 * @param {string} [params.jobDescription] - Optional job description for context-aware analysis
 * @returns {Promise<{ fileUrl: string; resumeId: string }>} File URL for preview
 *          and the resume ID (also the job ID)
 */
export const uploadResume = async ({
  content,
  mimeType,
  fileName,
  userId,
  jobDescription,
}: {
  content: Buffer;
  mimeType: ResumeMimeType;
  fileName: string;
  userId: string;
  jobDescription?: string;
}): Promise<{ fileUrl: string; resumeId: string }> => {
  const filePath = await saveResumeFile(userId, content, mimeType);

  let resumeId: string;
  try {
    const resume = await prisma.resume.create({
      data: {
        userId,
        fileName,
        fileSize: content.length,
        fileType: mimeType,
        filePath,
        status: 'PENDING', // ← Worker will update to PROCESSING → COMPLETED/FAILED
        jobDescription: jobDescription || null,
      },
      select: { id: true },
    });
    resumeId = resume.id;
  } catch (error) {
    await deleteResumeFile(filePath);
    throw error;
  }

  // **ENQUEUE JOB TO REDIS** (Producer role): the handoff from the HTTP
  // request to background processing.
  await resumeQueue.add(
    'resume-analysis',
    { resumeId, filePath },
    { jobId: resumeId } // ← Job ID = Resume ID (no mapping table)
  );

  // Notify sleeping worker containers via Redis Pub/Sub.
  await publishWorkerWake();

  return { fileUrl: resumeFileUrl(resumeId), resumeId };
};
