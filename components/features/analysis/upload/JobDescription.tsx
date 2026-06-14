'use client';

import classNames from 'classnames';
import React from 'react';

import { useAnalysisStore } from '@/stores/global/useAnalysisStore';

const JobDescription = () => {
  const { jobDescription, setJobDescription } = useAnalysisStore();

  return (
    <div
      className={classNames(
        'group card',
        'flex h-70 w-full flex-col gap-4 p-6',
        'border-primary-50 rounded-2xl border',
        'bg-white transition-colors duration-300'
      )}
    >
      <div>
        <h2 className="text-xl font-semibold">Job Description (Optional)</h2>
        <p className="text-sm text-slate-700">
          Adding a job description helps our AI provide more relevant match
          analysis.
        </p>
      </div>
      <div className="relative">
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here to get a more accurate match score..."
          className="focus:border-primary-500 focus:ring-primary-100 min-h-[160px] w-full resize-none rounded-xl border border-slate-200 bg-white p-4 pb-10 text-sm text-slate-900 transition-all placeholder:text-slate-400 focus:ring-2 focus:outline-none"
        />
        <span className="pointer-events-none absolute right-4 bottom-4 text-xs text-slate-400">
          Optional match scoring
        </span>
      </div>
    </div>
  );
};

export default JobDescription;
