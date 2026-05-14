'use client';

import classNames from 'classnames';
import React, { useEffect } from 'react';

import Icon from '@/components/ui/icon';
import { useJobProgress } from '@/lib/hooks/useJobProgress';

import { Preview } from './preview';
import SideContent from './side-content/SideContent';

const STEPS = [
  {
    key: 'extracting_text_metadata',
    title: ' Ekstraksi Teks & Metadata',
    description:
      'Berhasil mengekstrak struktur dokumen, font, dan elemen metadata dalam 1.2 detik.',
  },
  {
    key: 'analyzing_competencies',
    title: 'Menganalisis Kompetensi',
    description:
      'Memetakan skill teknis, pengalaman manajerial, dan pencapaian kuantitatif ke dalam database AI.',
  },
  {
    key: 'mapping_timeline',
    title: 'Mapping experience timeline',
    description:
      'Memetakan pengalaman kerja dan pencapaian kualitatif ke dalam timeline karier.',
  },
  {
    key: 'calculating_score',
    title: 'Calculating match score',
    description:
      'Menghitung skor kecocokan berdasarkan kompetensi, pengalaman, dan pencapaian kualitatif.',
  },
];

interface AnalyzingProcessProps {
  resumeId: string;
}

const AnalyzingProcess = ({ resumeId }: AnalyzingProcessProps) => {
  const { progress, step, status } = useJobProgress(resumeId);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full">
      <Preview />
      {/* <aside className="flex w-full max-w-[418px] flex-col border-l border-slate-300 bg-white">
        <div className="flex flex-1 flex-col justify-center gap-10 p-12">
          <h2 className="text-sm font-bold tracking-widest text-gray-900 uppercase">
            workflow progress
          </h2>
          <div className="relative">
            {STEPS.map((item, index) => (
              <div key={item.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="bg-secondary-700 flex size-10 items-center justify-center rounded-full">
                    <Icon
                      icon="TbCheck"
                      className="shrink-0 stroke-3 text-white"
                      size={20}
                    />
                  </div>
                  {index !== STEPS.length - 1 && (
                    <div className="h-20 w-0.5 bg-slate-300" />
                  )}
                </div>
                <div className="space-y-3">
                  <span className="text-lg font-semibold">{item.title}</span>
                  <p className="text-sm">{item.description}</p>
                </div>
              </div>
            ))}
            <div className="border-primary-200/90 rounded-full border-4">
            </div>
            <div className="bg-primary-700 relative flex size-10 items-center justify-center rounded-full">
              <Icon
                icon="FiActivity"
                className="shrink-0 animate-pulse stroke-3 text-white"
                size={20}
              />
            </div>
            <div className="flex size-10 items-center justify-center rounded-full border border-slate-300">
              <Icon
                icon="TbNumber3"
                className="shrink-0 stroke-3 text-slate-400"
                size={20}
              />
              </div>
              </div>
              </div>
      </aside> */}
      <SideContent
        progress={progress}
        step={step as string}
        status={status as string}
      />
    </div>
  );
};

export default AnalyzingProcess;
