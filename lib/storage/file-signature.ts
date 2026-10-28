export const RESUME_MIME_TYPES = {
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
} as const;

export type ResumeMimeType =
  (typeof RESUME_MIME_TYPES)[keyof typeof RESUME_MIME_TYPES];

export const RESUME_EXTENSIONS: Record<ResumeMimeType, string> = {
  [RESUME_MIME_TYPES.PDF]: 'pdf',
  [RESUME_MIME_TYPES.DOCX]: 'docx',
};

// Leading bytes of each accepted format. A DOCX is a ZIP archive.
const SIGNATURES: Record<ResumeMimeType, number[]> = {
  [RESUME_MIME_TYPES.PDF]: [0x25, 0x50, 0x44, 0x46, 0x2d], // "%PDF-"
  [RESUME_MIME_TYPES.DOCX]: [0x50, 0x4b, 0x03, 0x04], // "PK\x03\x04"
};

const startsWith = (buffer: Buffer, signature: number[]) =>
  buffer.length >= signature.length &&
  signature.every((byte, index) => buffer[index] === byte);

/**
 * @description Identifies a resume file from its content, not from the
 * browser-supplied `File.type` (which the client controls).
 * @param {Buffer} buffer - File content.
 * @returns {ResumeMimeType | null} The detected MIME type, or null when the
 *          content is neither a PDF nor a ZIP-based DOCX.
 */
export const detectResumeMimeType = (buffer: Buffer): ResumeMimeType | null => {
  for (const [mimeType, signature] of Object.entries(SIGNATURES)) {
    if (startsWith(buffer, signature)) return mimeType as ResumeMimeType;
  }
  return null;
};
