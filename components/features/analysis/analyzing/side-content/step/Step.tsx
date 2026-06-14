import Button from '@/components/ui/button';
import { useAnalysisStore } from '@/stores/global/useAnalysisStore';

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
  durations: Record<string, number>;
  completedSteps?: string[];
  isCancelled?: boolean;
  failedReason?: string | null;
  onRetry?: () => void;
}

const StepRoot = ({
  progress,
  step,
  status,
  durations,
  completedSteps = [],
  isCancelled,
  failedReason,
  onRetry,
}: StepRootProps) => {
  const setModalCancelProcess = useAnalysisStore(
    (state) => state.setModalCancelProcess
  );

  // Technical error = failed TAPI bukan cancel by user.
  const isTechnicalError = status === 'failed' && !isCancelled;

  const getStepStatus = (targetKey: string) => {
    const stepOder = STEPS.map((step) => step.key);
    const currentIndex = stepOder.indexOf(step || '');
    const targetIndex = stepOder.indexOf(targetKey);

    if (progress >= 100 || status === 'completed') {
      return 'completed';
    }

    // Step yang hasilnya udah tersimpan di checkpoint = selalu completed.
    // Menjamin centang hijau langsung muncul saat resume/retry, bahkan
    // di window singkat ketika worker belum sempat update step pointer.
    if (completedSteps.includes(targetKey)) {
      return 'completed';
    }

    // Saat gagal teknis: step yang lagi diproses ditandai 'error',
    // step sebelumnya 'completed', sisanya 'pending'.
    if (isTechnicalError) {
      if (targetIndex === currentIndex) return 'error';
      if (targetIndex < currentIndex) return 'completed';
      return 'pending';
    }

    if (isCancelled) {
      if (targetIndex === currentIndex) return 'error';
      if (targetIndex < currentIndex) return 'completed';
      return 'pending';
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
            isError={getStepStatus(item.key) === 'error'}
            errorMessage={
              getStepStatus(item.key) === 'error'
                ? failedReason ||
                  'Terjadi kesalahan teknis saat memproses tahap ini.'
                : undefined
            }
            onRetry={onRetry}
            duration={durations[item.key]}
          />
        ))}
      </div>
      {!isTechnicalError && !isCancelled && (
        <Button
          variant="outlined"
          fullWidth
          label="Batalkan Proses"
          preffixIcon="TbCircleX"
          onClick={() => setModalCancelProcess(true)}
        />
      )}
    </div>
  );
};

export default StepRoot;
