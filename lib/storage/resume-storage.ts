import { createReadStream } from 'node:fs';
import {
  mkdir,
  readFile,
  rename,
  stat,
  unlink,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';

import { v4 as uuidv4 } from 'uuid';

import { RESUME_EXTENSIONS, ResumeMimeType } from './file-signature';

/**
 * Resume files live on the local filesystem (a Docker volume shared by the
 * web and worker containers). Keys are always generated here and stored in
 * `Resume.filePath`; they are never built from user input.
 */
const STORAGE_ROOT = path.resolve(
  process.env.RESUME_STORAGE_DIR || './storage/resumes'
);

/**
 * @description Maps a storage key to an absolute path, refusing anything that
 * would land outside the storage root (path traversal).
 */
const resolveKey = (key: string): string => {
  const fullPath = path.resolve(STORAGE_ROOT, key);
  if (!fullPath.startsWith(STORAGE_ROOT + path.sep)) {
    throw new Error('Invalid storage key');
  }
  return fullPath;
};

/**
 * @description Stores a resume file and returns its storage key
 * (`<userId>/<uuid>.<ext>`). Written to a temp file and renamed, so readers
 * never see a partial file.
 */
export const saveResumeFile = async (
  userId: string,
  content: Buffer,
  mimeType: ResumeMimeType
): Promise<string> => {
  const key = `${userId}/${uuidv4()}.${RESUME_EXTENSIONS[mimeType]}`;
  const fullPath = resolveKey(key);
  const tempPath = `${fullPath}.tmp`;

  await mkdir(path.dirname(fullPath), { recursive: true, mode: 0o700 });
  await writeFile(tempPath, content, { mode: 0o600 });
  await rename(tempPath, fullPath);

  return key;
};

/** @description Reads a whole resume file (used by the analysis worker). */
export const readResumeFile = (key: string): Promise<Buffer> =>
  readFile(resolveKey(key));

/**
 * @description Opens a resume file as a web stream, for HTTP responses
 * without buffering the file in memory.
 * @returns The stream and file size, or null when the file does not exist.
 */
export const openResumeFile = async (
  key: string
): Promise<{ stream: ReadableStream<Uint8Array>; size: number } | null> => {
  const fullPath = resolveKey(key);
  try {
    const { size } = await stat(fullPath);
    const stream = Readable.toWeb(
      createReadStream(fullPath)
    ) as ReadableStream<Uint8Array>;
    return { stream, size };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw error;
  }
};

/** @description Deletes a resume file; a missing file is not an error. */
export const deleteResumeFile = async (key: string): Promise<void> => {
  try {
    await unlink(resolveKey(key));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
  }
};
