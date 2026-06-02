import { PDFParse, VerbosityLevel } from 'pdf-parse';

import { Prisma } from '@/app/generated/prisma/client';
import {
  EXTRACTION_SYSTEM_PROMPT,
  SCORING_SYSTEM_PROMPT,
  SYNTHESIS_SYSTEM_PROMPT,
} from '@/const/prompt-system';

import prisma from '../db';
import { openai } from '../open-ai';
import { supabaseAdmin } from '../supabase-admin';

const updateResumeStatus = async (resumeId: string, status: string) => {
  await prisma.resume.update({
    where: { id: resumeId },
    data: { status },
  });
};

// Tipe hasil tiap stage AI (longgar, karena bentuknya JSON dari model).
type StageResult = Record<string, unknown>;

// Ambil checkpoint yang tersimpan (kalau ada) untuk resume ini.
const loadCheckpoint = async (resumeId: string) => {
  return prisma.analysisCheckpoint.findUnique({ where: { resumeId } });
};

// Upsert checkpoint secara partial. Cuma field yang dikirim yang ke-update.
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

// Hapus checkpoint setelah analisis final tersimpan (cleanup).
const clearCheckpoint = async (resumeId: string) => {
  await prisma.analysisCheckpoint
    .delete({ where: { resumeId } })
    .catch(() => null); // abaikan kalau memang gak ada
};

const extractTextFromPdf = async (file: Blob | null) => {
  if (!file) {
    throw new Error('File is null');
  }

  const arrayBuffer = await file.arrayBuffer();

  const parser = new PDFParse({
    data: arrayBuffer,
    verbosity: VerbosityLevel.WARNINGS,
  });
  const data = await parser.getText();
  await parser.destroy();

  return data.text;
};

const aiAnalyze = async (
  prompt: string,
  model: 'deepseek-v4-flash' | 'kimi-k2.6',
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
        // max_tokens: 50, // Commented: biarkan model decide, atau set ke angka reasonable (e.g., 4000+)
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

    // Fallback untuk error yang gak ketangkep
    throw new Error(
      'Terjadi kesalahan pada saat analisis AI. Coba lagi atau upload resume lain.'
    );
  }
};

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

    // Update to PROCESSING
    await updateResumeStatus(resumeId, 'PROCESSING');

    // Load checkpoint hasil run sebelumnya (kalau ini retry).
    const checkpoint = await loadCheckpoint(resumeId);

    // Akumulasi durasi NYATA tiap stage (ms). Dikirim ulang tiap emit
    // biar polling yang kelewat tetap dapet snapshot lengkap.
    // Seed dari checkpoint biar step yang sudah selesai tetap nampilin durasi asli.
    const durations: Record<string, number> = {
      ...((checkpoint?.durations as Record<string, number>) || {}),
    };
    const report = async (progress: number, step: string) => {
      if (onProgress) {
        await onProgress({
          progress,
          step,
          durations: { ...durations },
          error: null,
        });
      }
    };

    // Fetch job description from resume
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

    // === STAGE 1: Ekstraksi teks PDF (0 -> 25%) ===
    await report(0, 'extracting_text_metadata');

    // ✅ Check if user cancelled
    if (signal?.aborted) {
      throw new Error('Proses dibatalkan oleh user');
    }

    let resumeText: string;
    if (checkpoint?.text) {
      resumeText = checkpoint.text;
      // durations.extracting_text_metadata = 0;
    } else {
      const extractStart = Date.now();
      const { data: fileData } = await supabaseAdmin.storage
        .from('resumes')
        .download(filePath);
      resumeText = await extractTextFromPdf(fileData);
      durations.extracting_text_metadata = Date.now() - extractStart;
      await saveCheckpoint(resumeId, {
        text: resumeText,
        durations,
      });
    }

    // === STAGE 2: AI Ekstraksi fakta (analyzing_competencies, 25 -> 50%) ===
    await report(25, 'analyzing_competencies');

    if (signal?.aborted) {
      throw new Error('Proses dibatalkan oleh user');
    }

    let extraction: StageResult;
    if (checkpoint?.extractionResult) {
      // ✅ Checkpoint hit: pakai hasil yang sudah ada, skip AI call.
      console.log('⏭️  Skip STAGE 2 (extraction) - pakai checkpoint');
      extraction = checkpoint.extractionResult as StageResult;
    } else {
      const extractStart = Date.now();
      extraction = await aiAnalyze(
        EXTRACTION_SYSTEM_PROMPT,
        'deepseek-v4-flash',
        `## Resume Text:\n${resumeText}`,
        60000,
        signal
      );
      durations.analyzing_competencies = Date.now() - extractStart;
      // Simpan checkpoint segera setelah stage sukses.
      await saveCheckpoint(resumeId, {
        extractionResult: extraction,
        durations,
      });
    }

    // === STAGE 3: AI Penilaian & red flags (mapping_timeline, 50 -> 85%) ===
    await report(50, 'mapping_timeline');

    if (signal?.aborted) {
      throw new Error('Proses dibatalkan oleh user');
    }

    let scoring: StageResult;
    if (checkpoint?.scoringResult) {
      console.log('⏭️  Skip STAGE 3 (scoring) - pakai checkpoint');
      scoring = checkpoint.scoringResult as StageResult;
    } else {
      const scoringStart = Date.now();
      scoring = await aiAnalyze(
        SCORING_SYSTEM_PROMPT,
        'deepseek-v4-flash',
        `## Data Ekstraksi:\n${JSON.stringify(extraction)}\n\n## Resume Text:\n${resumeText}\n\n## Job Description:\n${
          jobDescription || '(tidak ada job description)'
        }`,
        60000,
        signal
      );
      durations.mapping_timeline = Date.now() - scoringStart;
      await saveCheckpoint(resumeId, {
        scoringResult: scoring,
        durations,
      });
    }

    // === STAGE 4: AI Sintesis naratif (calculating_score, 85 -> 100%) ===
    await report(85, 'calculating_score');

    if (signal?.aborted) {
      throw new Error('Proses dibatalkan oleh user');
    }

    let synthesis: StageResult;
    if (checkpoint?.synthesisResult) {
      console.log('⏭️  Skip STAGE 4 (synthesis) - pakai checkpoint');
      synthesis = checkpoint.synthesisResult as StageResult;
    } else {
      const synthesisStart = Date.now();
      synthesis = await aiAnalyze(
        SYNTHESIS_SYSTEM_PROMPT,
        'kimi-k2.6',
        `## Data Kandidat:\n${JSON.stringify({ ...extraction, ...scoring })}`,
        60000,
        signal
      );
      durations.calculating_score = Date.now() - synthesisStart;
      await saveCheckpoint(resumeId, {
        synthesisResult: synthesis,
        durations,
      });
    }

    // Gabungkan hasil ketiga tahap jadi satu objek hasil analisis.
    // Cast ke any karena isinya JSON dinamis hasil parsing dari model AI.
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

    // ✅ Analisis final tersimpan -> checkpoint gak diperlukan lagi.
    await clearCheckpoint(resumeId);

    await report(100, 'completed');

    console.log('💾 Analysis saved successfully');

    // Update to COMPLETED
    await updateResumeStatus(resumeId, 'COMPLETED');
    console.log(`✅ Resume ${resumeId} analyzed successfully`);
  } catch (error) {
    // Log detail error untuk debugging
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

    // Re-throw dengan preserve error message yang udah user-friendly dari aiAnalyze
    throw error;
  }
};
