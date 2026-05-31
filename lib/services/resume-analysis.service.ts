import { PDFParse, VerbosityLevel } from 'pdf-parse';

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

const extractTextFromPdf = async (file: Blob | null, resumeId: string) => {
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

  await prisma.extractedText.create({
    data: {
      resumeId,
      text: data.text,
    },
  });

  return data.text;
};

const aiAnalyze = async (
  prompt: string,
  model: 'kimi-k2.6',
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
        // max_tokens: 700,
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

    const result = JSON.parse(response.choices[0].message.content!);
    console.log(`✅ ${model} completed successfully`);

    return result;
  } catch (error) {
    clearTimeout(timeout);
    console.timeEnd(`⏱️  ${model} Analysis`);

    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`${model} analysis timeout after ${timeoutMs}ms`);
    }

    console.error(`❌ ${model} analysis failed:`, error);
    throw error;
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

    // Akumulasi durasi NYATA tiap stage (ms). Dikirim ulang tiap emit
    // biar polling yang kelewat tetap dapet snapshot lengkap.
    const durations: Record<string, number> = {};
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

    let resumeText;
    const existingExtractedText = await prisma.extractedText.findUnique({
      where: {
        resumeId,
      },
    });

    // === STAGE 1: Ekstraksi teks PDF (0 -> 25%) ===
    await report(0, 'extracting_text_metadata');

    // ✅ Check if user cancelled
    if (signal?.aborted) {
      throw new Error('Proses dibatalkan oleh user');
    }

    if (!existingExtractedText?.text) {
      const extractStart = Date.now();
      const { data: fileData } = await supabaseAdmin.storage
        .from('resumes')
        .download(filePath);
      resumeText = await extractTextFromPdf(fileData, resumeId);
      durations.extracting_text_metadata = Date.now() - extractStart;
    } else {
      resumeText = existingExtractedText.text;
      durations.extracting_text_metadata = 0;
    }

    // === STAGE 2: AI Ekstraksi fakta (analyzing_competencies, 25 -> 50%) ===
    await report(25, 'analyzing_competencies');

    if (signal?.aborted) {
      throw new Error('Proses dibatalkan oleh user');
    }

    const extractStart = Date.now();
    const extraction = await aiAnalyze(
      EXTRACTION_SYSTEM_PROMPT,
      'kimi-k2.6',
      `## Resume Text:\n${resumeText}`,
      60000,
      signal
    );
    durations.analyzing_competencies = Date.now() - extractStart;

    // === STAGE 3: AI Penilaian & red flags (mapping_timeline, 50 -> 85%) ===
    await report(50, 'mapping_timeline');

    if (signal?.aborted) {
      throw new Error('Proses dibatalkan oleh user');
    }

    const scoringStart = Date.now();
    const scoring = await aiAnalyze(
      SCORING_SYSTEM_PROMPT,
      'kimi-k2.6',
      `## Data Ekstraksi:\n${JSON.stringify(extraction)}\n\n## Resume Text:\n${resumeText}\n\n## Job Description:\n${
        jobDescription || '(tidak ada job description)'
      }`,
      60000,
      signal
    );
    durations.mapping_timeline = Date.now() - scoringStart;

    // === STAGE 4: AI Sintesis naratif (calculating_score, 85 -> 100%) ===
    await report(85, 'calculating_score');

    if (signal?.aborted) {
      throw new Error('Proses dibatalkan oleh user');
    }

    const synthesisStart = Date.now();
    const synthesis = await aiAnalyze(
      SYNTHESIS_SYSTEM_PROMPT,
      'kimi-k2.6',
      `## Data Kandidat:\n${JSON.stringify({ ...extraction, ...scoring })}`,
      60000,
      signal
    );

    // Gabungkan hasil ketiga tahap jadi satu objek hasil analisis.
    const analysisResult = { ...extraction, ...scoring, ...synthesis };

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

    durations.calculating_score = Date.now() - synthesisStart;
    await report(100, 'completed');

    console.log('💾 Analysis saved successfully');

    // Update to COMPLETED
    await updateResumeStatus(resumeId, 'COMPLETED');
    console.log(`✅ Resume ${resumeId} analyzed successfully`);
  } catch (error) {
    console.error(`❌ Analysis failed for ${resumeId}:`, error);

    await updateResumeStatus(resumeId, 'FAILED');

    throw error;
  }
};
