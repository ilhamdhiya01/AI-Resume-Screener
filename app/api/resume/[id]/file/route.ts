import { NextRequest } from 'next/server';

import { auth } from '@/auth';
import prisma from '@/lib/db';
import { openResumeFile } from '@/lib/storage/resume-storage';
import { errorResponse } from '@/lib/utils/api-response';

export const runtime = 'nodejs';

/**
 * @description Builds a Content-Disposition header that is safe for any file
 * name: an ASCII fallback plus the RFC 5987 UTF-8 form.
 */
const contentDisposition = (
  type: 'inline' | 'attachment',
  fileName: string
) => {
  const asciiName = fileName.replace(/[^\x20-\x7e]|["\\]/g, '_');
  return `${type}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
};

/**
 * @description Streams a resume file to its owner. Used by the preview
 * (inline) and by history downloads (`?download=1`).
 */
export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    const { id } = await params;
    const resume = await prisma.resume.findUnique({
      where: { id },
      select: { userId: true, fileName: true, fileType: true, filePath: true },
    });

    // Another user's resume answers like a missing one, so IDs cannot be probed.
    if (!resume || resume.userId !== userId) {
      return errorResponse('Resume not found', 404);
    }

    const file = await openResumeFile(resume.filePath);
    if (!file) {
      return errorResponse('Resume file not found', 404);
    }

    const download = request.nextUrl.searchParams.get('download') === '1';

    return new Response(file.stream, {
      headers: {
        'Content-Type': resume.fileType,
        'Content-Length': String(file.size),
        'Content-Disposition': contentDisposition(
          download ? 'attachment' : 'inline',
          resume.fileName
        ),
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Resume file error:', error);
    return errorResponse('Failed to load resume file', 500);
  }
};
