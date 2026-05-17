import { Step } from '.';

const STEPS = [
  {
    key: 'extracting_text_metadata',
    title: ' Ekstraksi Teks & Metadata',
    description:
      'Berhasil mengekstrak struktur dokumen, font, dan elemen metadata.',
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

interface StepRootProps {
  progress: number;
  step: string;
  status: string;
  duration: number;
}

const StepRoot = ({ progress, step, status, duration }: StepRootProps) => {
  const getStepStatus = (targetKey: string) => {
    const stepOder = STEPS.map((step) => step.key);
    const currentIndex = stepOder.indexOf(step || '');
    const targetIndex = stepOder.indexOf(targetKey);

    if (progress >= 100 || status === 'completed') {
      return 'completed';
    }

    if (currentIndex === -1) return 'pending';
    if (targetIndex === currentIndex) return 'active';
    if (targetIndex < currentIndex) return 'completed';
    return 'pending';
  };
  return (
    <div className="flex flex-1 flex-col justify-center gap-10 p-12">
      <h2 className="text-sm font-bold tracking-widest text-gray-900 uppercase">
        workflow progress
      </h2>
      <div className="relative">
        {STEPS.map((item, index) => (
          <Step.Item
            key={item.key}
            isLast={index === STEPS.length - 1}
            title={item.title}
            description={item.description}
            stepIndex={index}
            isActive={getStepStatus(item.key) === 'active'}
            isCompleted={getStepStatus(item.key) === 'completed'}
            duration={duration}
          />
        ))}
      </div>
    </div>
  );
};

export default StepRoot;
