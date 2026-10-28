import { UploadStatus } from '@/app/generated/prisma/enums';

export type UploadResumeRequest = {
  file: File;
  jobDescription?: string;
};

export type UploadResumeResponse = {
  resumeId: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  status: UploadStatus;
};
