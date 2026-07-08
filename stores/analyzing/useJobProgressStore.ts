import { create } from 'zustand';

import { ResumeJobStatus } from '@/lib/types/resume-analysis.types';

interface JobProgressState extends ResumeJobStatus {
  displayProgress: number;
}

interface JobProgressActions {
  setJobStatus: (data: Partial<ResumeJobStatus>) => void;
  setDisplayProgress: (value: number | ((prev: number) => number)) => void;
  reset: () => void;
}

type JobProgressStore = JobProgressState & JobProgressActions;

const InitialState: JobProgressState = {
  status: 'idle',
  progress: 0,
  displayProgress: 0,
};

export const useJobProgressStore = create<JobProgressStore>()((set) => ({
  ...InitialState,
  setJobStatus: (data) =>
    set((prev) => ({
      ...prev,
      ...data,
    })),
  setDisplayProgress: (value) =>
    set((prev) => ({
      ...prev,
      displayProgress:
        typeof value === 'function'
          ? (value as (prev: number) => number)(prev.displayProgress)
          : value,
    })),
  reset: () => set(InitialState),
}));
