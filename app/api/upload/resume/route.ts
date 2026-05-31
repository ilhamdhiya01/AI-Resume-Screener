import { NextRequest } from 'next/server';

import { auth } from '@/auth';
import { uploadResumeToSupabaseStorage } from '@/lib/services/upload.service';
import { errorResponse, successResponse } from '@/lib/utils/api-response';

export const POST = async (request: NextRequest) => {
  try {
    const session = await auth();

    if (!session?.user.id) {
      return errorResponse('Unauthorized', 401);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const jobDescription = (formData.get('jobDescription') as string) || '';

    if (!file) {
      return errorResponse('No file provided', 400);
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return errorResponse(
        'Invalid file type. Only PDF and DOCX are allowed.',
        400
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return errorResponse('File too large. Max size is 10MB.', 400);
    }

    // Upload to Supabase (private bucket)
    const { signedUrl, path, resumeId } = await uploadResumeToSupabaseStorage(
      file,
      session.user.id,
      jobDescription
    );

    // ✅ Return signedUrl instead of publicUrl
    return successResponse('File uploaded successfully', {
      resumeId,
      signedUrl, // ← Temporary URL (expires in 1 hour)
      path, // ← Storage path (save this to DB)
      fileName: file.name,
      fileSize: file.size,
      status: 'PENDING',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Upload failed',
      500
    );
  }
};
