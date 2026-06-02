import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { useResizeObserver } from '@wojtekmaj/react-hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import Button from '@/components/ui/button';
import { useTextHighlighter } from '@/lib/hooks/useTextHighlighter';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const pdfOptions = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
};

interface PdfPreviewProps {
  fileUrl: string;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  minScale: number;
  maxScale: number;
  criticalHighlights: { text: string; page: number }[];
}

const resizeObserverOptions = {};

const PdfPreview = ({
  fileUrl,
  scale,
  setScale,
  minScale,
  maxScale,
  criticalHighlights,
}: PdfPreviewProps) => {
  const maxWidth = 900;

  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

  const activeHighlights = useTextHighlighter(
    criticalHighlights,
    pageNumber,
    scale
  );

  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    const [entry] = entries;

    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();

        const delta = -e.deltaY;
        const zoomSpeed = 0.01;

        setScale((prev) => {
          const newScale = prev + delta * zoomSpeed;
          return Math.min(Math.max(newScale, minScale), maxScale);
        });
      }
    };

    const container = containerRef;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [containerRef, minScale, maxScale]);

  return (
    <div ref={setContainerRef} className="p-8">
      {fileUrl ? (
        <Document
          file={fileUrl}
          options={pdfOptions}
          externalLinkTarget="_blank"
          onLoadSuccess={({ numPages: nextNumPages }) => {
            setNumPages(nextNumPages);
          }}
          loading={
            <div className="flex h-96 items-center justify-center">
              <p className="text-lg">Loading PDF...</p>
            </div>
          }
          error={
            <div className="flex h-96 flex-col items-center justify-center gap-4">
              <p className="text-lg font-bold text-red-600">
                Failed to load PDF
              </p>
              <p className="text-sm text-gray-600">Check console for details</p>
            </div>
          }
        >
          <div className="relative space-y-6">
            {/* Pagination Controls */}
            {numPages > 1 && (
              <div className="fixed bottom-5 left-[calc((100vw-20rem)/2)] z-100 inline-flex items-center justify-center gap-4 rounded-lg bg-white p-1 drop-shadow-xl transition-opacity duration-200">
                <Button
                  iconButton="TbChevronLeft"
                  onClick={goToPrevPage}
                  disabled={pageNumber <= 1}
                  size="sm"
                  variant="ghost"
                />
                <span className="text-sm font-semibold">
                  {pageNumber} of {numPages}
                </span>
                <Button
                  iconButton="TbChevronRight"
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                  size="sm"
                  variant="ghost"
                />
              </div>
            )}

            {/* Render current page */}
            <div
              className="relative inline-block origin-top-left transition-transform duration-200"
              style={{ transform: `scale(${scale})` }}
            >
              <Page
                pageNumber={pageNumber}
                renderAnnotationLayer={true}
                renderTextLayer={true}
                width={
                  containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth
                }
              />
            </div>

            {/* ✅ Overlay Highlights dari AI Analysis */}
            {activeHighlights.map((highlight, idx) => (
              <div
                key={idx}
                className="group absolute cursor-pointer"
                style={{
                  left: `${highlight.x}px`,
                  top: `${highlight.y}px`,
                  width: `${highlight.width}px`,
                  height: `${highlight.height}px`,
                  backgroundColor: 'rgba(239, 68, 68, 0.2)', // red-500/20
                  borderBottom: '2px solid rgb(239, 68, 68)', // red-500
                  borderRadius: '2px',
                  zIndex: 9999,
                }}
              >
                {/* Tooltip tetap sama seperti kode lama Anda */}
                <div className="pointer-events-none absolute -top-10 left-1/2 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs text-white group-hover:block">
                  ⚠️ Critical Issue
                </div>
              </div>
            ))}
          </div>
        </Document>
      ) : (
        <div className="flex h-96 items-center justify-center">
          <p className="text-lg text-gray-500">No file URL available</p>
        </div>
      )}
    </div>
  );
};

export default PdfPreview;
