import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import { useResizeObserver } from '@wojtekmaj/react-hooks';
import React, { useCallback, useEffect, useReducer, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

import Button from '@/components/ui/button';
import useTextHighlighter from '@/lib/hooks/useTextHighlighter';

const pdfLoadingElement = (
  <div className="flex h-96 items-center justify-center">
    <p className="text-lg">Loading PDF...</p>
  </div>
);

const pdfErrorElement = (
  <div className="flex h-96 flex-col items-center justify-center gap-4">
    <p className="text-lg font-bold text-red-600">Failed to load PDF</p>
    <p className="text-sm text-gray-600">Check console for details</p>
    <Button
      iconButton="TbRefresh"
      variant="outlined"
      color="neutral"
      onClick={() => window.location.reload()}
    />
  </div>
);

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

interface PdfState {
  numPages: number;
  pageNumber: number;
}

type PdfAction =
  | { type: 'SET_NUM_PAGES'; payload: number }
  | { type: 'GO_TO_PAGE'; payload: number }
  | { type: 'GO_PREV' }
  | { type: 'GO_NEXT' };

const initialPdfState: PdfState = {
  numPages: 0,
  pageNumber: 1,
};

const pdfReducer = (state: PdfState, action: PdfAction): PdfState => {
  switch (action.type) {
    case 'SET_NUM_PAGES':
      return { ...state, numPages: action.payload };
    case 'GO_TO_PAGE':
      return { ...state, pageNumber: action.payload };
    case 'GO_PREV':
      return { ...state, pageNumber: Math.max(state.pageNumber - 1, 1) };
    case 'GO_NEXT':
      return {
        ...state,
        pageNumber: Math.min(state.pageNumber + 1, state.numPages),
      };
    default:
      return state;
  }
};

const PdfPreview = React.memo<PdfPreviewProps>(
  ({ fileUrl, scale, setScale, minScale, maxScale, criticalHighlights }) => {
    const maxWidth = 900;

    const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
    const [containerWidth, setContainerWidth] = useState<number>();
    const [pdfState, dispatch] = useReducer(pdfReducer, initialPdfState);
    const [pageRendered, setPageRendered] = useState(false);

    const activeHighlights = useTextHighlighter(
      criticalHighlights,
      pdfState.pageNumber,
      scale,
      pageRendered
    );

    const onResize = useCallback<ResizeObserverCallback>((entries) => {
      const [entry] = entries;

      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    }, []);

    useResizeObserver(containerRef, resizeObserverOptions, onResize);

    const goToPrevPage = () => {
      dispatch({ type: 'GO_PREV' });
    };

    const goToNextPage = () => {
      dispatch({ type: 'GO_NEXT' });
    };

    useEffect(() => {
      setPageRendered(false);
    }, [pdfState.pageNumber]);

    useEffect(() => {
      const handleWheel = (e: WheelEvent) => {
        if (e.ctrlKey) {
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
        container.addEventListener('wheel', handleWheel, { passive: true });
      }

      return () => {
        if (container) {
          container.removeEventListener('wheel', handleWheel);
        }
      };
    }, [containerRef, minScale, maxScale, setScale]);

    return (
      <div ref={setContainerRef} className="p-8">
        {fileUrl ? (
          <Document
            file={fileUrl}
            options={pdfOptions}
            externalLinkTarget="_blank"
            onLoadSuccess={({ numPages: nextNumPages }) => {
              dispatch({ type: 'SET_NUM_PAGES', payload: nextNumPages });
              dispatch({ type: 'GO_TO_PAGE', payload: 1 });
            }}
            loading={pdfLoadingElement}
            error={pdfErrorElement}
          >
            <div className="relative space-y-6">
              {/* Pagination Controls */}
              {pdfState.numPages > 1 && (
                <div className="fixed bottom-5 left-[calc((100vw-20rem)/2)] z-100 inline-flex items-center justify-center gap-4 rounded-lg bg-white p-1 drop-shadow-xl transition-opacity duration-200">
                  <Button
                    iconButton="TbChevronLeft"
                    onClick={goToPrevPage}
                    disabled={pdfState.pageNumber <= 1}
                    size="sm"
                    variant="ghost"
                  />
                  <span className="text-sm font-semibold">
                    {pdfState.pageNumber} of {pdfState.numPages}
                  </span>
                  <Button
                    iconButton="TbChevronRight"
                    onClick={goToNextPage}
                    disabled={pdfState.pageNumber >= pdfState.numPages}
                    size="sm"
                    variant="ghost"
                  />
                  {/* <div className="h-4 w-px bg-slate-200" />
                  <Button
                    iconButton="TbRefresh"
                    onClick={handleRefresh}
                    size="sm"
                    variant="ghost"
                    color="neutral"
                  /> */}
                </div>
              )}

              {/* Render current page */}
              <div
                className="relative inline-block origin-top-left transition-transform duration-200"
                style={{ transform: `scale(${scale})` }}
              >
                <Page
                  pageNumber={pdfState.pageNumber}
                  renderAnnotationLayer={true}
                  renderTextLayer={true}
                  width={
                    containerWidth
                      ? Math.min(containerWidth, maxWidth)
                      : maxWidth
                  }
                  onRenderSuccess={() => setPageRendered(true)}
                />
              </div>

              {/* Overlay Highlights dari AI Analysis */}
              {activeHighlights.map((highlight, idx) => (
                <div
                  key={idx}
                  className="group absolute cursor-pointer rounded-[2px] border-b-2 border-red-500 bg-red-500/20"
                  style={{
                    left: `${highlight.x}px`,
                    top: `${highlight.y}px`,
                    width: `${highlight.width}px`,
                    height: `${highlight.height}px`,
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
  }
);

PdfPreview.displayName = 'PdfPreview';

export default PdfPreview;
