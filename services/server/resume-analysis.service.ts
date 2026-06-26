import mammoth from 'mammoth';
import { PDFParse, VerbosityLevel } from 'pdf-parse';

import { Prisma, UploadStatus } from '@/app/generated/prisma/client';
import {
  EXTRACTION_SYSTEM_PROMPT,
  SCORING_SYSTEM_PROMPT,
  SYNTHESIS_SYSTEM_PROMPT,
} from '@/const/prompt-system';

import prisma from '../../lib/db';
import { openai } from '../../lib/open-ai';
import { supabaseAdmin } from '../../lib/supabase-admin';

const updateResumeStatus = async (resumeId: string, status: UploadStatus) => {
  await prisma.resume.update({
    where: { id: resumeId },
    data: { status },
  });
};

// Loose type for each AI stage result (dynamic JSON from model).
type StageResult = Record<string, unknown>;

// Load saved checkpoint (if any) for this resume.
const loadCheckpoint = async (resumeId: string) => {
  return prisma.analysisCheckpoint.findUnique({ where: { resumeId } });
};

// Partial upsert checkpoint. Only sent fields get updated.
const saveCheckpoint = async (
  resumeId: string,
  data: {
    text?: string;
    extractionResult?: StageResult;
    scoringResult?: StageResult;
    synthesisResult?: StageResult;
    durations?: Record<string, number>;
  }
) => {
  await prisma.analysisCheckpoint.upsert({
    where: { resumeId },
    create: {
      resumeId,
      ...data,
    } as Prisma.AnalysisCheckpointUncheckedCreateInput,
    update: { ...data } as Prisma.AnalysisCheckpointUncheckedUpdateInput,
  });
};

// Clear checkpoint after final analysis is saved (cleanup).
const clearCheckpoint = async (resumeId: string) => {
  await prisma.analysisCheckpoint
    .delete({ where: { resumeId } })
    .catch(() => null); // ignore if it doesn't exist
};

// Supported mimetypes for resume text extraction.
const SUPPORTED_MIMETYPES = {
  PDF: 'application/pdf',
  DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
} as const;

type SupportedMimetype =
  (typeof SUPPORTED_MIMETYPES)[keyof typeof SUPPORTED_MIMETYPES];

// Trim excess whitespace so text is ready to send to LLM.
const normalizeText = (text: string): string =>
  text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

// Extract text from PDF using pdf-parse.
const extractFromPdf = async (buffer: Buffer): Promise<string> => {
  const parser = new PDFParse({
    data: buffer,
    verbosity: VerbosityLevel.WARNINGS,
  });
  try {
    const data = await parser.getText();
    return data.text;
  } finally {
    await parser.destroy();
  }
};

// Extract text from DOCX using mammoth.
const extractFromDocx = async (buffer: Buffer): Promise<string> => {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
};

/**
 * @description Extract raw text from resume file (PDF or DOCX).
 * @param {Buffer} buffer - File content as Buffer.
 * @param {string} mimetype - File MIME type (e.g., 'application/pdf').
 * @returns {Promise<string>} Clean text ready for LLM processing.
 */
/**
 * @description **[ANALYSIS PROCESS - TEXT EXTRACTION]** Unified text extraction
 * for PDF and DOCX files. Uses pdf-parse for PDF, mammoth for DOCX.
 *
 * **Data Flow:**
 * 1. Check mimetype (application/pdf or application/vnd.openxmlformats...)
 * 2. **If PDF:** Use pdf-parse to extract text
 * 3. **If DOCX:** Use mammoth to convert to plain text
 * 4. Clean extracted text (trim whitespace)
 * 5. Return plain text string
 *
 * **Side Effects:**
 * - **CPU Intensive:** Parsing large files can take seconds
 * - **Memory Usage:** Loads entire file into memory
 *
 * **Business Logic:**
 * - **Supported Formats:** PDF, DOCX only (validated in upload API)
 * - **Error Handling:** Throws on unsupported format or parsing failure
 * - **Text Cleaning:** Removes extra whitespace for better LLM processing
 *
 * @param {Buffer} buffer - File buffer from Supabase Storage
 * @param {string} mimetype - MIME type (e.g., "application/pdf")
 * @returns {Promise<string>} Extracted plain text
 * @throws {Error} If mimetype unsupported or extraction fails
 *
 * @example
 * const text = await extractTextFromFile(pdfBuffer, 'application/pdf');
 * // Returns: "John Doe\nSoftware Engineer\n..."
 */
const extractTextFromFile = async (
  buffer: Buffer,
  mimetype: string
): Promise<string> => {
  if (!buffer || buffer.length === 0) {
    throw new Error('File kosong atau tidak valid.');
  }

  let rawText: string;

  switch (mimetype as SupportedMimetype) {
    case SUPPORTED_MIMETYPES.PDF:
      rawText = await extractFromPdf(buffer);
      break;

    case SUPPORTED_MIMETYPES.DOCX:
      rawText = await extractFromDocx(buffer);
      break;

    default:
      throw new Error(
        `Format file tidak didukung (${mimetype}). Hanya menerima PDF atau DOCX.`
      );
  }

  const cleanText = normalizeText(rawText);

  if (!cleanText) {
    throw new Error(
      'Tidak ada teks yang bisa diekstrak. Pastikan file bukan hasil scan/gambar.'
    );
  }

  return cleanText;
};

/**
 * @description **[ANALYSIS PROCESS - LLM API CALL]** Sends content to LLM API
 * (DeepSeek or Kimi) for structured analysis. Handles timeout, cancellation,
 * and JSON response parsing.
 *
 * **Data Flow:**
 * 1. Create AbortController for timeout management (60s default)
 * 2. Send HTTP request to OpenAI-compatible API (via openai SDK)
 * 3. Wait for streaming response completion
 * 4. Parse JSON response from LLM
 * 5. Return structured analysis result
 *
 * **Side Effects:**
 * - **External API Call:** HTTP POST to DeepSeek or Kimi API endpoint
 * - **Timeout:** Aborts request after timeoutMs (default 60s)
 * - **Cancellation:** Aborts if signal is triggered by user
 *
 * **Business Logic:**
 * - **Model Selection:** DeepSeek for extraction/scoring, Kimi for synthesis
 * - **JSON Mode:** Forces LLM to return valid JSON (response_format: json_object)
 * - **Temperature:** 0.2 (low randomness for consistent structured output)
 * - **Error Handling:** Throws generic error to avoid exposing API details
 *
 * **API Configuration:**
 * - Uses OpenAI SDK with custom base URL (configured in lib/open-ai.ts)
 * - API keys: DEEPSEEK_API_KEY, KIMI_API_KEY (from env)
 * - Timeout: Configurable per call (extraction: 60s, scoring: 60s, synthesis: 60s)
 *
 * @param {string} prompt - System prompt (EXTRACTION_SYSTEM_PROMPT, etc.)
 * @param {'deepseek-v4-flash' | 'kimi-k2.6'} model - LLM model identifier
 * @param {string} content - User content (resume text or JSON from previous stage)
 * @param {number} [timeoutMs=60000] - Request timeout in milliseconds
 * @param {AbortSignal} [signal] - Cancellation signal from worker
 * @returns {Promise<StageResult>} Parsed JSON response from LLM
 * @throws {Error} If API call fails, times out, or is cancelled
 *
 * @example
 * const result = await aiAnalyze(
 *   EXTRACTION_SYSTEM_PROMPT,
 *   'deepseek-v4-flash',
 *   `## Resume Text:\n${resumeText}`,
 *   60000,
 *   abortSignal
 * );
 * // Returns: { competencies: [...], experiences: [...], ... }
 */
const aiAnalyze = async (
  prompt: string,
  model: 'deepseek-v4-flash' | 'kimi-k2.7',
  content: string,
  timeoutMs: number = 60000,
  signal?: AbortSignal
) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.time(`⏱️  ${model} Analysis`);
    console.log(`🤖 Starting ${model} analysis (timeout: ${timeoutMs}ms)...`);

    const response = await openai.chat.completions.create(
      {
        model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content },
        ],
        response_format: { type: 'json_object' },
        // max_tokens: 50, // Commented: let model decide, or set to a reasonable number (e.g., 4000+)
        temperature: 0.2,
      },
      {
        signal,
        timeout: timeoutMs,
      }
    );

    if (signal?.aborted) throw new Error('Proses dibatalkan oleh user');

    clearTimeout(timeout);
    console.timeEnd(`⏱️  ${model} Analysis`);

    const message = response.choices[0].message;

    const result = JSON.parse(message.content!);
    console.log(`✅ ${model} completed successfully`);

    return result;
  } catch (error) {
    clearTimeout(timeout);
    console.timeEnd(`⏱️  ${model} Analysis`);

    // Fallback for uncaught errors
    throw new Error(
      'Terjadi kesalahan pada saat analisis AI. Coba lagi atau upload resume lain.'
    );
  }
};

/**
 * @description **[ANALYSIS PROCESS - ORCHESTRATOR]** Main orchestration function
 * for resume analysis pipeline. Coordinates text extraction, multi-stage LLM
 * analysis, checkpoint saving, and real-time progress reporting.
 *
 * **Data Flow:**
 * 1. Update resume status to PROCESSING in database
 * 2. Load checkpoint (if retry) to resume from last successful stage
 * 3. **Stage 1 (0→25%):** Download file from Supabase & extract text (PDF/DOCX)
 * 4. **Stage 2 (25→50%):** DeepSeek extraction (competencies, experiences, education)
 * 5. Save checkpoint after Stage 2
 * 6. **Stage 3 (50→85%):** DeepSeek scoring (timeline mapping, red flags, gaps)
 * 7. Save checkpoint after Stage 3
 * 8. **Stage 4 (85→100%):** Kimi synthesis (narrative analysis, final score)
 * 9. Save final results to database with COMPLETED status
 * 10. Clear checkpoint (cleanup)
 * 11. Report 100% progress to Redis
 *
 * **Side Effects:**
 * - **Database Writes:** Multiple updates to `resumes`, `analysisCheckpoint`, `analysisResult` tables
 * - **External API Calls:** 3 LLM API calls (DeepSeek x2, Kimi x1)
 * - **Storage Download:** Fetches file from Supabase Storage (signed URL)
 * - **Redis Updates:** Streams progress via `onProgress` callback (polled by frontend)
 *
 * **Business Logic:**
 * - **Checkpointing:** Saves partial results after each stage (enables retry on failure)
 * - **Cancellation:** Checks AbortSignal after each stage (graceful cancellation)
 * - **Progress Reporting:** Streams real-time progress with durations (0% → 100%)
 * - **Model Selection:** DeepSeek for extraction/scoring (fast), Kimi for synthesis (deep reasoning)
 * - **Error Handling:** Updates status to FAILED and propagates error to worker
 * - **Job Description:** Optionally includes job description for context-aware scoring
 *
 * **Cancellation Support:**
 * - User can cancel via `cancelSpecificJob(resumeId)` in worker
 * - Worker sends AbortSignal to this function
 * - Function checks signal after each stage (extraction, scoring, synthesis)
 * - Database status updated to FAILED on cancellation
 * - Checkpoint preserved for potential retry
 *
 * **Checkpoint Strategy:**
 * - Saves text, extractionResult, scoringResult, synthesisResult, durations
 * - On retry: Skips completed stages, resumes from last checkpoint
 * - Cleared after successful completion (cleanup)
 *
 * @param {string} resumeId - Resume ID (also BullMQ job ID)
 * @param {string} filePath - Supabase Storage path (e.g., "user-123/file.pdf")
 * @param {AbortSignal} signal - Cancellation signal from worker
 * @param {Function} [onProgress] - Callback for streaming progress to Redis
 * @returns {Promise<void>}
 * @throws {Error} If extraction fails, LLM API fails, or user cancels
 *
 * @example
 * await analyzeResume(
 *   'resume-123',
 *   'user-456/1234567890-uuid.pdf',
 *   abortSignal,
 *   async (progress) => {
 *     await job.updateProgress(progress); // Stream to Redis
 *   }
 * );
 * // Analysis complete, results saved to database
 */
export const analyzeResume = async (
  resumeId: string,
  filePath: string,
  signal: AbortSignal,
  onProgress?: (progress: {
    progress: number;
    step: string;
    durations: Record<string, number>;
    error?: string | null;
  }) => Promise<void>
) => {
  try {
    console.log(`🔄 Starting analysis for resume: ${resumeId}`);

    // Step 1: Mark resume as PROCESSING in database
    // This signals to frontend that analysis has started
    await updateResumeStatus(resumeId, 'PROCESSING');

    // Step 2: Load checkpoint from previous run (if this is a retry)
    // Checkpoint contains: text, extractionResult, scoringResult, synthesisResult, durations
    const checkpoint = await loadCheckpoint(resumeId);

    // Initialize durations tracker (accumulates real duration per stage in ms)
    // Seed from checkpoint so completed stages retain their original duration
    // This ensures frontend shows accurate timing even after retry
    const durations: Record<string, number> = {
      ...((checkpoint?.durations as Record<string, number>) || {}),
    };

    /**
     * Helper to report progress to Redis via callback.
     * Frontend polls this data to show real-time progress bar and step names.
     */
    const report = async (progress: number, step: string) => {
      if (onProgress) {
        await onProgress({
          progress,
          step,
          durations: { ...durations }, // Send full snapshot every time
          error: null,
        });
      }
    };

    // Fetch job description from resume (optional context for scoring stage)
    // If provided, LLM will compare candidate skills against job requirements
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      select: { jobDescription: true },
    });
    const jobDescription = resume?.jobDescription || '';

    // const existingExtractedText = await prisma.extractedText.findUnique({
    //   where: {
    //     resumeId,
    //   },
    // });

    // === STAGE 1: TEXT EXTRACTION (0 → 25%) ===
    await report(0, 'extracting_text_metadata');

    // Checkpoint: Check for cancellation before starting extraction
    if (signal?.aborted) {
      throw new Error('Proses dibatalkan oleh user');
    }

    let resumeText: string;
    // Optimization: Skip extraction if checkpoint exists (retry scenario)
    if (checkpoint?.text) {
      console.log('⏭️  Skip STAGE 1 (extraction) - using checkpoint');
      resumeText = checkpoint.text;
    } else {
      // Download file from Supabase Storage and extract text
      const extractStart = Date.now();

      // Download file from Supabase Storage (private bucket)
      const { data: fileData } = await supabaseAdmin.storage
        .from('resumes')
        .download(filePath);

      if (!fileData) {
        throw new Error('Gagal mengunduh file dari storage.');
      }

      // Convert blob to buffer and extract text (PDF or DOCX)
      const fileBuffer = Buffer.from(await fileData.arrayBuffer());
      resumeText = await extractTextFromFile(fileBuffer, fileData.type);

      // Track duration and save checkpoint (enables retry from Stage 2)
      durations.extracting_text_metadata = Date.now() - extractStart;
      await saveCheckpoint(resumeId, {
        text: resumeText,
        durations,
      });
    }

    // === STAGE 2: FACT EXTRACTION (25 → 50%) ===
    // DeepSeek extracts structured data: competencies, experiences, education, certifications
    await report(25, 'analyzing_competencies');

    // Checkpoint: Check for cancellation before LLM call
    if (signal?.aborted) {
      throw new Error('Proses dibatalkan oleh user');
    }

    let extraction: StageResult;
    // Optimization: Skip extraction if checkpoint exists (retry scenario)
    if (checkpoint?.extractionResult) {
      console.log('⏭️  Skip STAGE 2 (extraction) - using checkpoint');
      extraction = checkpoint.extractionResult as StageResult;
    } else {
      const extractStart = Date.now();

      // Call DeepSeek API for fact extraction (60s timeout)
      extraction = await aiAnalyze(
        EXTRACTION_SYSTEM_PROMPT,
        'kimi-k2.7', // Fast model for structured extraction
        `## Resume Text:\n${resumeText}`,
        60000, // 60s timeout
        signal
      );

      // Track duration and save checkpoint immediately after success
      durations.analyzing_competencies = Date.now() - extractStart;
      await saveCheckpoint(resumeId, {
        extractionResult: extraction,
        durations,
      });
    }

    // === STAGE 3: SCORING & RED FLAGS (50 → 85%) ===
    // DeepSeek maps timeline, detects gaps, typos, and scores against job description
    await report(50, 'mapping_timeline');

    // Checkpoint: Check for cancellation before LLM call
    if (signal?.aborted) {
      throw new Error('Proses dibatalkan oleh user');
    }

    let scoring: StageResult;
    // Optimization: Skip scoring if checkpoint exists (retry scenario)
    if (checkpoint?.scoringResult) {
      console.log('⏭️  Skip STAGE 3 (scoring) - using checkpoint');
      scoring = checkpoint.scoringResult as StageResult;
    } else {
      const scoringStart = Date.now();

      // Call DeepSeek API for timeline mapping and scoring (60s timeout)
      // Includes: extraction data, original resume text, and job description (if provided)
      scoring = await aiAnalyze(
        SCORING_SYSTEM_PROMPT,
        'deepseek-v4-flash', // Same model for consistency
        `## Data Ekstraksi:\n${JSON.stringify(extraction)}\n\n## Resume Text:\n${resumeText}\n\n## Job Description:\n${
          jobDescription || '(tidak ada job description)'
        }`,
        60000, // 60s timeout
        signal
      );

      // Track duration and save checkpoint immediately after success
      durations.mapping_timeline = Date.now() - scoringStart;
      await saveCheckpoint(resumeId, {
        scoringResult: scoring,
        durations,
      });
    }

    // === STAGE 4: DEEP SYNTHESIS (85 → 100%) ===
    // Kimi performs narrative analysis and generates final score with insights
    await report(85, 'calculating_score');

    // Checkpoint: Check for cancellation before LLM call
    if (signal?.aborted) {
      throw new Error('Proses dibatalkan oleh user');
    }

    let synthesis: StageResult;
    // Optimization: Skip synthesis if checkpoint exists (retry scenario)
    if (checkpoint?.synthesisResult) {
      console.log('⏭️  Skip STAGE 4 (synthesis) - using checkpoint');
      synthesis = checkpoint.synthesisResult as StageResult;
    } else {
      const synthesisStart = Date.now();

      // Call Kimi API for deep analysis and final scoring (60s timeout)
      // Kimi excels at narrative synthesis and holistic evaluation
      synthesis = await aiAnalyze(
        SYNTHESIS_SYSTEM_PROMPT,
        'kimi-k2.7', // Kimi for deep reasoning and narrative generation
        `## Data Kandidat:\n${JSON.stringify({ ...extraction, ...scoring })}`,
        60000, // 60s timeout
        signal
      );

      // Track duration and save checkpoint immediately after success
      durations.calculating_score = Date.now() - synthesisStart;
      await saveCheckpoint(resumeId, {
        synthesisResult: synthesis,
        durations,
      });
    }

    // Merge results from all three stages into a single analysis result object.
    // Cast to any because content is dynamic JSON from AI model parsing.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const analysisResult: any = { ...extraction, ...scoring, ...synthesis };

    // ✅ Save complete analysis result (after calculating_score step completes)
    await prisma.analysisResult.create({
      data: {
        resumeId,
        score: analysisResult.score || 0,
        yearsExperience: analysisResult.yearsExperience,
        matchedSkills: analysisResult.matchedSkills || [],
        missingSkills: analysisResult.missingSkills || [],
        role: analysisResult.role,
        education: analysisResult.education,
        hasTypos: analysisResult.hasTypos || false,
        typoCount: analysisResult.typoCount || 0,
        atsIssues: analysisResult.atsIssues || {},
        hardDataRaw: analysisResult,
        summary: analysisResult.summary,
        strengths: analysisResult.strengths || [],
        criticals: analysisResult.criticals || [],
        criticalHighlights: analysisResult.criticalHighlights || [],
        suggestions: analysisResult.suggestions || [],
        typoDetails: analysisResult.typoDetails || [],
        atsRecommendations: analysisResult.atsRecommendations || {},
        matchSummary: analysisResult.matchSummary || null,
        deepAnalysisRaw: analysisResult,
      },
    });

    // ✅ Final analysis saved -> checkpoint no longer needed.
    await clearCheckpoint(resumeId);

    await report(100, 'completed');

    console.log('💾 Analysis saved successfully');

    // Update to COMPLETED
    await updateResumeStatus(resumeId, 'COMPLETED');
    console.log(`✅ Resume ${resumeId} analyzed successfully`);
  } catch (error) {
    // Log error details for debugging
    if (error instanceof Error) {
      console.error(`❌ Analysis failed for ${resumeId}:`, {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    } else {
      console.error(`❌ Analysis failed for ${resumeId} (unknown):`, error);
    }

    await updateResumeStatus(resumeId, 'FAILED');

    // Re-throw preserving the user-friendly error message from aiAnalyze
    throw error;
  }
};
