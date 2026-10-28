import { NextRequest } from 'next/server';

import { auth } from '@/auth';
import { detectResumeMimeType } from '@/lib/storage/file-signature';
import { errorResponse, successResponse } from '@/lib/utils/api-response';
import { getCreditStatus } from '@/services/server/credit.service';
import { uploadResume } from '@/services/server/upload.service';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const POST = async (request: NextRequest) => {
  try {
    const session = await auth();

    if (!session?.user.id || !session?.user.role) {
      return errorResponse('Unauthorized', 401);
    }

    const { canAnalyze } = await getCreditStatus(
      session.user.id,
      session.user.role
    );

    if (!canAnalyze) {
      return errorResponse(
        'Free analysis limit reached. Upgrade to Pro to continue.',
        403
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const jobDescription = formData.get('jobDescription');

    if (!(file instanceof File)) {
      return errorResponse('No file provided', 400);
    }

    // Checked before reading the content into memory.
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse('File too large. Max size is 10MB.', 400);
    }

    // The type comes from the file's bytes, not from the browser-supplied
    // `file.type`, so a renamed file cannot pass as a PDF/DOCX.
    const content = Buffer.from(await file.arrayBuffer());
    const mimeType = detectResumeMimeType(content);

    if (!mimeType) {
      return errorResponse(
        'Invalid file type. Only PDF and DOCX are allowed.',
        400
      );
    }

    const { fileUrl, resumeId } = await uploadResume({
      content,
      mimeType,
      fileName: file.name,
      userId: session.user.id,
      jobDescription:
        typeof jobDescription === 'string' ? jobDescription : undefined,
    });

    return successResponse('File uploaded successfully', {
      resumeId,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      status: 'PENDING',
    });
  } catch (error) {
    console.error('Upload error:', error);
    return errorResponse('Upload failed', 500);
  }
};
