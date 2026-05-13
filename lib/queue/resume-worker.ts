import { Worker } from 'bullmq';

import { connection } from '@/lib/queue/resume-queue';
import { analyzeResume } from '@/lib/services/resume-analysis.service';

export const resumeWorker = new Worker(
  'resume-analysis',
  async (job) => {
    const { resumeId, filePath } = job.data;

    console.log(`🔄
       Processing job ${job.id} - Resume: ${resumeId}`);

    await analyzeResume(resumeId, filePath, async (data) => {
      console.log('📊 Sending progress:', JSON.stringify(data));
      await job.updateProgress(data);
    });

    console.log(`✅ Job ${job.id} completed`);
  },
  {
    connection,
    concurrency: 5,
  }
);

resumeWorker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`);
});

resumeWorker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message);
});

resumeWorker.on('error', (err) => {
  console.error('❌ Worker error:', err);
});

console.log('🚀 Resume worker started');
