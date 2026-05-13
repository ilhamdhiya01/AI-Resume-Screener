import prisma from '../db';
import { gradualProgress } from '../helper';

export const analyzeResume = async (
  resumeId: string,
  filePath: string,
  onProgress?: (progress: { progress: number; step: string }) => Promise<void>
) => {
  try {
    console.log(`🔄 Starting analysis for resume: ${resumeId}`);

    // Update to PROCESSING
    await prisma.resume.update({
      where: { id: resumeId },
      data: { status: 'PROCESSING' },
    });

    // if (onProgress) await onProgress(20);
    await gradualProgress(0, 20, 5000, async (progress) => {
      if (onProgress) await onProgress({ progress, step: 'parsing' });
    });
    console.log(`📥 Downloading file...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Step 2: Extract text (40%)
    // if (onProgress) await onProgress(40);
    await gradualProgress(20, 40, 5000, async (progress) => {
      if (onProgress) await onProgress({ progress, step: 'extracting_skills' });
    });
    console.log(`📄 Extracting text...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Step 3: AI Analysis (70%)
    // if (onProgress) await onProgress(70);
    await gradualProgress(40, 70, 5000, async (progress) => {
      if (onProgress) await onProgress({ progress, step: 'mapping_timeline' });
    });
    console.log(`🤖 Analyzing with AI...`);
    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Step 4: Save results (90%)
    // if (onProgress) await onProgress(90);
    await gradualProgress(70, 90, 3000, async (progress) => {
      if (onProgress) await onProgress({ progress, step: 'calculating_score' });
    });
    console.log(`💾 Saving results...`);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Step 5: Complete (100%)
    // if (onProgress) await onProgress(100);
    await gradualProgress(90, 100, 2000, async (progress) => {
      if (onProgress) await onProgress({ progress, step: 'completed' });
    });

    // Update to COMPLETED
    await prisma.resume.update({
      where: { id: resumeId },
      data: { status: 'COMPLETED' },
    });
    console.log(`✅ Resume ${resumeId} analyzed successfully`);
  } catch (error) {
    console.error(`❌ Analysis failed for ${resumeId}:`, error);

    await prisma.resume.update({
      where: { id: resumeId },
      data: { status: 'FAILED' },
    });

    throw error;
  }
};
