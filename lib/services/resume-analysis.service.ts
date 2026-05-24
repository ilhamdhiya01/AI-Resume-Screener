/* eslint-disable @typescript-eslint/no-explicit-any */
import { PDFParse, VerbosityLevel } from 'pdf-parse';

import { GLM_SYSTEM_PROMPT, KIMI_SYSTEM_PROMPT } from '@/const/prompt-system';

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
  model: 'glm-5.1' | 'kimi-k2.6' | 'gpt-5-mini',
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
        // max_tokens: 1600,
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

      const { data: fileData } = await supabaseAdmin.storage
        .from('resumes')
        .download(filePath);
      resumeText = await extractTextFromPdf(fileData, resumeId);
    } else {
      resumeText = existingExtractedText.text;
    }

    // ✅ Check if GLM analysis already exists (from previous failed attempt)
    let hardData;
    const existingAnalysis = await prisma.analysisResult.findUnique({
      where: { resumeId },
      select: { hardDataRaw: true },
    });

    if (existingAnalysis?.hardDataRaw) {
      console.log('♻️  Reusing existing GLM analysis from previous attempt');
      hardData = existingAnalysis.hardDataRaw as Record<string, any>;

      // Skip to 50% since GLM already done
      await gradualProgress(20, 50, 1000, async (progress) => {
        if (onProgress)
          await onProgress({
            progress,
            step: 'analyzing_competencies',
            duration: 166,
            error: null,
          });
      });
    } else {
      // Step 2: GLM 5.1 — Extract Hard Data (20-50%)
      await gradualProgress(20, 50, 5000, async (progress) => {
        if (onProgress)
          await onProgress({
            progress,
            step: 'analyzing_competencies',
            duration: 166,
            error: null,
          });
      });

      hardData = await aiAnalyze(
        GLM_SYSTEM_PROMPT,
        'gpt-4o-mini',
        resumeText,
        60000,
        signal
      );

      // ✅ Save GLM result immediately (checkpoint)
      await prisma.analysisResult.upsert({
        where: { resumeId },
        create: {
          resumeId,
          score: hardData.score || 0,
          yearsExperience: hardData.yearsExperience,
          matchedSkills: hardData.matchedSkills || [],
          missingSkills: hardData.missingSkills || [],
          role: hardData.role,
          education: hardData.education,
          hasTypos: hardData.hasTypos || false,
          typoCount: hardData.typoCount || 0,
          atsIssues: hardData.atsIssues || {},
          hardDataRaw: hardData,
          // Temporary placeholder values for Kimi fields
          summary: '',
          strengths: [],
          criticals: [],
          criticalHighlights: {},
          suggestions: [],
          typoDetails: [],
          atsRecommendations: {},
          deepAnalysisRaw: {},
        },
        update: {
          score: hardData.score || 0,
          yearsExperience: hardData.yearsExperience,
          matchedSkills: hardData.matchedSkills || [],
          missingSkills: hardData.missingSkills || [],
          role: hardData.role,
          education: hardData.education,
          hasTypos: hardData.hasTypos || false,
          typoCount: hardData.typoCount || 0,
          atsIssues: hardData.atsIssues || {},
          hardDataRaw: hardData,
        },
      });

      console.log('💾 GLM analysis saved (checkpoint)');
    }

    // Step 3: Kimi K2.6 — Deep Analysis (50-85%)
    await gradualProgress(50, 85, 5000, async (progress) => {
      if (onProgress)
        await onProgress({
          progress,
          step: 'mapping_timeline',
          duration: 142,
          error: null,
        });
    });

    const kimiInput = `## Resume Text:\n${resumeText}\n\n## GLM Analysis:\n${JSON.stringify(hardData)}`;
    const deepAnalysis = await aiAnalyze(
      KIMI_SYSTEM_PROMPT,
      'gpt-5-mini',
      kimiInput,
      60000,
      signal
    );

    // Step 4: Save to DB (85-100%)
    await gradualProgress(85, 100, 2000, async (progress) => {
      if (onProgress)
        await onProgress({
          progress,
          step: 'calculating_score',
          duration: 133,
          error: null,
        });
    });

    // ✅ Update with Kimi results (GLM already saved)
    await prisma.analysisResult.update({
      where: { resumeId },
      data: {
        summary: deepAnalysis.summary,
        strengths: deepAnalysis.strengths,
        criticals: deepAnalysis.criticals,
        criticalHighlights: deepAnalysis.criticalHighlights,
        suggestions: deepAnalysis.suggestions,
        typoDetails: deepAnalysis.typoDetails,
        atsRecommendations: deepAnalysis.atsRecommendations,
        deepAnalysisRaw: deepAnalysis,
      },
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
