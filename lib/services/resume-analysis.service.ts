import { PDFParse, VerbosityLevel } from 'pdf-parse';

import { GLM_SYSTEM_PROMPT, KIMI_SYSTEM_PROMPT } from '@/const/prompt-system';

import prisma from '../db';
import { gradualProgress } from '../helper';
import { openai } from '../open-ai';
import { supabaseAdmin } from '../supabase-admin';
import { AnalysisResultPayload } from '../types/resume-analysis.types';

const updateResumeStatus = async (resumeId: string, status: string) => {
  await prisma.resume.update({
    where: { id: resumeId },
    data: { status },
  });
};

const createAnalysisResult = async (data: AnalysisResultPayload) => {
  await prisma.analysisResult.create({
    data,
  });
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
  model: string,
  content: string,
  timeoutMs: number = 60000
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
        // max_tokens: 2000,
        temperature: 0.7,
      },
      {
        timeout: timeoutMs,
      }
    );

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
  onProgress?: (progress: {
    progress: number;
    step: string;
    duration: number;
  }) => Promise<void>
) => {
  try {
    console.log(`🔄 Starting analysis for resume: ${resumeId}`);

    // Update to PROCESSING
    await updateResumeStatus(resumeId, 'PROCESSING');

    // Step 1: Download PDF from Supabase (0-20%)
    await gradualProgress(0, 20, 3000, async (progress) => {
      if (onProgress)
        await onProgress({
          progress,
          step: 'extracting_text_metadata',
          duration: 150,
        });
    });

    const { data: fileData } = await supabaseAdmin.storage
      .from('resumes')
      .download(filePath);

    // Extract text from PDF
    const resumeText = await extractTextFromPdf(fileData);

    // Step 2: GLM 5.1 — Extract Hard Data (20-50%)
    await gradualProgress(20, 50, 5000, async (progress) => {
      if (onProgress)
        await onProgress({
          progress,
          step: 'analyzing_competencies',
          duration: 166,
        });
    });

    const hardData = await aiAnalyze(GLM_SYSTEM_PROMPT, 'glm-5.1', resumeText);

    // Step 3: Kimi K2.6 — Deep Analysis (50-85%)
    await gradualProgress(50, 85, 5000, async (progress) => {
      if (onProgress)
        await onProgress({ progress, step: 'mapping_timeline', duration: 142 });
    });

    const kimiInput = `## Resume Text:\n${resumeText}\n\n## GLM Analysis:\n${JSON.stringify(hardData)}`;
    const deepAnalysis = await aiAnalyze(
      KIMI_SYSTEM_PROMPT,
      'kimi-k2.6',
      kimiInput
    );

    // Step 4: Save to DB (85-100%)
    await gradualProgress(85, 100, 2000, async (progress) => {
      if (onProgress)
        await onProgress({
          progress,
          step: 'calculating_score',
          duration: 133,
        });
    });

    await createAnalysisResult({
      resumeId,
      score: hardData.score,
      yearsExperience: hardData.yearsExperience,
      matchedSkills: hardData.matchedSkills,
      missingSkills: hardData.missingSkills,
      role: hardData.role, // ← NEW
      education: hardData.education, // ← NEW
      hasTypos: hardData.hasTypos, // ← NEW
      typoCount: hardData.typoCount, // ← NEW
      atsIssues: hardData.atsIssues, // ← NEW
      hardDataRaw: hardData,
      summary: deepAnalysis.summary,
      strengths: deepAnalysis.strengths,
      weaknesses: deepAnalysis.weaknesses,
      suggestions: deepAnalysis.suggestions,
      typoDetails: deepAnalysis.typoDetails, // ← NEW
      atsRecommendations: deepAnalysis.atsRecommendations, // ← NEW
      deepAnalysisRaw: deepAnalysis,
    });

    // Update to COMPLETED
    await updateResumeStatus(resumeId, 'COMPLETED');
    console.log(`✅ Resume ${resumeId} analyzed successfully`);
  } catch (error) {
    console.error(`❌ Analysis failed for ${resumeId}:`, error);

    await updateResumeStatus(resumeId, 'FAILED');

    throw error;
  }
};
