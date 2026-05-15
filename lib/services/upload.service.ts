import { v4 as uuidv4 } from 'uuid';

import prisma from '../db';
import { ensureWorkerRunning, resumeQueue } from '../queue';
import { supabaseAdmin } from '../supabase-admin';

/**
 * @description Upload file ke Supabase Storage bucket "resumes" (PRIVATE)
 * @param file - File object dari input
 * @param userId - ID user yang upload
 * @returns Promise dengan signed URL (expires in 1 hour)
 */
export const uploadResumeToSupabaseStorage = async (
  file: File,
  userId: string
): Promise<{ signedUrl: string; path: string; resumeId: string }> => {
  const uuidV4 = uuidv4();

  const timeStamp = Date.now();
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${timeStamp}-${uuidV4}.${fileExt}`;

  const { data, error } = await supabaseAdmin.storage
    .from('resumes')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  const { data: signedUrlData, error: signedUrlErrorr } =
    await supabaseAdmin.storage
      .from('resumes')
      .createSignedUrl(data.path, 3600);

  if (signedUrlErrorr) {
    throw new Error(
      `Failed to generate signed URL: ${signedUrlErrorr.message}`
    );
  }

  const resume = await prisma.resume.create({
    data: {
      userId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      filePath: data.path,
      status: 'PENDING',
    },
  });

  await resumeQueue.add(
    'resume-analysis',
    {
      resumeId: resume.id,
      filePath: data.path,
    },
    {
      jobId: resume.id, // Use resumeId as BullMQ job ID for direct lookup
    }
  );

  // Start worker on-demand (lazy — only connects when needed)
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
