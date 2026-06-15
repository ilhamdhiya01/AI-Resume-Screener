import { UploadStatus } from '@/app/generated/prisma/enums';

export type UploadResumeRequest = {
  file: File;
  jobDescription?: string;
};

export type UploadResumeResponse = {
  resumeId: string;
  signedUrl: string;
  path: string;
  fileName: string;
  fileSize: number;
  status: UploadStatus;
};
