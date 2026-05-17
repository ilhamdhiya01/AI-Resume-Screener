import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { useResizeObserver } from '@wojtekmaj/react-hooks';
import React, { useCallback, useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import Button from '@/components/ui/button';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const pdfOptions = {
  cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
  cMapPacked: true,
  standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
};

const DUMMY_HIGHLIGHTS = [
  {
    id: 1,
    type: 'critical',
    text: 'Missing quantifiable achievements',
    page: 1,
    boundingBox: { x: 154, y: 405, width: 700, height: 40 },
  },
  {
    id: 2,
    type: 'strength',
    text: 'Strong technical skills',
    page: 1,
    boundingBox: { x: 102, y: 383, width: 220, height: 20 },
  },
  {
    id: 3,
    type: 'critical',
    text: 'Vague job description',
    page: 1,
    boundingBox: { x: 154, y: 574, width: 710, height: 40 },
  },
  {
    id: 4,
    type: 'strength',
    text: 'Relevant experience',
    page: 1,
    boundingBox: { x: 102, y: 551, width: 280, height: 20 },
  },
];

interface PdfPreviewProps {
  fileUrl: string;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  minScale: number;
  maxScale: number;
}

const resizeObserverOptions = {};

const PdfPreview = ({
  fileUrl,
  scale,
  setScale,
  minScale,
  maxScale,
}: PdfPreviewProps) => {
  const maxWidth = 900;

  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);

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
            console.log('✅ PDF Loaded successfully');
            console.log('Total pages:', nextNumPages);
            setNumPages(nextNumPages);
          }}
          onLoadError={(error) => {
            console.error('❌ PDF Load Error:', error);
            console.error('Error message:', error.message);
            console.error('File URL:', fileUrl);
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
              className="inline-block origin-top-left transition-transform duration-200"
              style={{ transform: `scale(${scale})` }}
            >
              <Page
                pageNumber={pageNumber}
                renderAnnotationLayer={true}
                renderTextLayer={true}
                width={
                  containerWidth ? Math.min(containerWidth, maxWidth) : maxWidth
                }
                onLoadSuccess={(page) => {
                  console.log('Page loaded:', page.width, 'x', page.height);
                }}
                onLoadError={(error) => {
                  console.error('❌ Page Load Error:', error);
                }}
              />
            </div>

            {/* ✅ Overlay Highlights dari AI Analysis */}
            {/* {DUMMY_HIGHLIGHTS.map((highlight) => (
                    <div
                      key={highlight.id}
                      className="group absolute cursor-pointer transition-all hover:z-100"
                      style={{
                        left: `${highlight.boundingBox.x}px`,
                        top: `${highlight.boundingBox.y}px`,
                        width: `${highlight.boundingBox.width}px`,
                        height: `${highlight.boundingBox.height}px`,
                      }}
                      onMouseEnter={() => console.log('Hover:', highlight.text)}
                    >
                      <div
                        className={
                          highlight.type === 'critical'
                            ? 'h-full w-full rounded border-2 border-red-500 bg-red-500/20 transition-all group-hover:bg-red-500/30'
                            : 'h-full w-full rounded border-2 border-green-500 bg-green-500/20 transition-all group-hover:bg-green-500/30'
                        }
                      />
                      <div className="pointer-events-none absolute -top-14 left-1/2 z-[200] hidden -translate-x-1/2 rounded-lg bg-gray-900 px-3 py-2 text-sm whitespace-nowrap text-white shadow-xl group-hover:block">
                        <div className="flex items-center gap-2">
                          <span
                            className={
                              highlight.type === 'critical'
                                ? 'size-2 rounded-full bg-red-500'
                                : 'size-2 rounded-full bg-green-500'
                            }
                          />
                          <span>
                            {highlight.type === 'critical'
                              ? '⚠️ Critical'
                              : '✅ Strength'}
                            : {highlight.text}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-gray-900" />
                      </div>
                    </div>
                  ))} */}
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
