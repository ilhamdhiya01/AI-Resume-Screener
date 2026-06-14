import { useCallback, useState } from 'react';

import { Preview } from '.';

interface PreviewRootProps {
  progress: number;
  fileName?: string;
  fileUrl?: string;
  criticalHighlights: { text: string; page: number }[];
}

const ZOOM_CONFIG = {
  min: 0.5,
  max: 2.0,
  step: 0.25,
  default: 1,
} as const;

const PreviewRoot = ({
  progress,
  fileName,
  fileUrl,
  criticalHighlights,
}: PreviewRootProps) => {
  const [scale, setScale] = useState<number>(ZOOM_CONFIG.default);

  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + ZOOM_CONFIG.step, ZOOM_CONFIG.max));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - ZOOM_CONFIG.step, ZOOM_CONFIG.min));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(ZOOM_CONFIG.default);
  }, []);

  const isDocx = (fileName || fileUrl || '')
    .toLowerCase()
    .split('?')[0]
    .endsWith('.docx');

  return (
    <div className="relative flex w-full max-w-[65%] flex-col">
      {fileUrl && (
        <Preview.Header
          fileName={fileName}
          zoomIn={zoomIn}
          zoomOut={zoomOut}
          resetZoom={resetZoom}
        />
      )}
      <div className="scrollbar-auto flex-1 overflow-auto">
        {!fileUrl ? (
          <div className="relative m-8 flex min-h-[calc(100%-1rem)] flex-col items-center justify-center gap-10 overflow-hidden rounded-xl bg-white drop-shadow-xl">
            <div className="animate-shimmer-scan pointer-events-none absolute top-0 z-50 h-24 w-full bg-linear-to-t from-transparent via-blue-700/20 to-transparent" />
            <Preview.Skelaton />
            <Preview.PercentageProgress
              progress={progress}
              fileName={fileName}
            />
          </div>
        ) : isDocx ? (
          <Preview.Docx
            fileUrl={fileUrl}
            scale={scale}
            setScale={setScale}
            minScale={ZOOM_CONFIG.min}
            maxScale={ZOOM_CONFIG.max}
            criticalHighlights={criticalHighlights}
          />
        ) : (
          <Preview.Pdf
            fileUrl={fileUrl}
            scale={scale}
            setScale={setScale}
            minScale={ZOOM_CONFIG.min}
            maxScale={ZOOM_CONFIG.max}
            criticalHighlights={criticalHighlights}
          />
        )}
      </div>
    </div>
  );
};

export default PreviewRoot;
