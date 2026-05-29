import { PDFParse, VerbosityLevel } from 'pdf-parse';

import { UNIFIED_SYSTEM_PROMPT } from '@/const/prompt-system';

import prisma from '../db';
import { gradualProgress } from '../helpers';
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
  model: 'glm-5.1',
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
      // {
      //   timeout: timeoutMs,
      // }
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
    duration: number;
    error?: string | null;
  }) => Promise<void>
) => {
  try {
    console.log(`🔄 Starting analysis for resume: ${resumeId}`);

    // Update to PROCESSING
    await updateResumeStatus(resumeId, 'PROCESSING');

    let resumeText;
    const existingExtractedText = await prisma.extractedText.findUnique({
      where: {
        resumeId,
      },
    });

    // Extract text from PDF
    if (!existingExtractedText?.text) {
      await gradualProgress(0, 20, 3000, async (progress) => {
        if (onProgress)
          await onProgress({
            progress,
            step: 'extracting_text_metadata',
            duration: 150,
            error: null,
          });
      });

      // ✅ Check if user cancelled
      if (signal?.aborted) {
        throw new Error('Proses dibatalkan oleh user');
      }

      const { data: fileData } = await supabaseAdmin.storage
        .from('resumes')
        .download(filePath);
      resumeText = await extractTextFromPdf(fileData, resumeId);
    } else {
      resumeText = existingExtractedText.text;
    }

    // ✅ Check if analysis already exists (from previous failed attempt)
    // const existingAnalysis = await prisma.analysisResult.findUnique({
    //   where: { resumeId },
    //   select: { hardDataRaw: true },
    // });

    // if (existingAnalysis?.hardDataRaw) {
    //   console.log('♻️  Analysis already completed, skipping AI call');
    //   // Skip to 100% since analysis already done
    //   await gradualProgress(20, 100, 1000, async (progress) => {
    //     if (onProgress)
    //       await onProgress({
    //         progress,
    //         step: 'calculating_score',
    //         duration: 100,
    //         error: null,
    //       });
    //   });
    // } else {

    // }

    // Step 2: AI Analysis (20-85%)
    // await gradualProgress(20, 50, 8000, async (progress) => {
    //   if (onProgress)
    //     await onProgress({
    //       progress,
    //       step: 'analyzing_competencies',
    //       duration: 140,
    //       error: null,
    //     });
    // });

    await gradualProgress(20, 90, 8000, async (progress) => {
      if (onProgress)
        await onProgress({
          progress,
          step: progress < 50 ? 'analyzing_competencies' : 'mapping_timeline',
          duration: 140,
          error: null,
        });
    });

    // ✅ Check if user cancelled before AI call
    if (signal?.aborted) {
      throw new Error('Proses dibatalkan oleh user');
    }

    const analysisResult = await aiAnalyze(
      UNIFIED_SYSTEM_PROMPT,
      'glm-5.1',
      resumeText,
      60000,
      signal
    );

    // Step 3: Calculating score (90-100%)
    await gradualProgress(90, 100, 2000, async (progress) => {
      if (onProgress)
        await onProgress({
          progress,
          step: 'calculating_score',
          duration: 133,
          error: null,
        });
    });

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
        deepAnalysisRaw: analysisResult,
      },
    });

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
