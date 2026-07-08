'use client';

import { queryOptions, useQuery } from '@tanstack/react-query';
import mammoth from 'mammoth';
import React, { useEffect, useState } from 'react';

interface DocxPreviewProps {
  fileUrl: string;
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  minScale: number;
  maxScale: number;
  criticalHighlights?: { text: string; page: number }[];
}

/**
 * @description Wrap each occurrence of critical text in the HTML result
 * from mammoth with <mark class="docx-highlight">. Unlike PDF which
 * uses overlay based on coordinates, DOCX is highlighted inline in the text.
 * @param {string} rawHtml - HTML result from mammoth conversion.
 * @param {{ text: string; page: number }[]} snippets - List of critical texts.
 * @returns {string} HTML with critical texts already highlighted.
 */
const highlightCriticalText = (
  rawHtml: string,
  snippets?: { text: string; page: number }[]
): string => {
  if (typeof window === 'undefined' || !snippets || snippets.length === 0) {
    return rawHtml;
  }

  const targets = snippets
    .map((snippet) => snippet?.text?.trim())
    .filter((text): text is string => Boolean(text));

  if (targets.length === 0) {
    return rawHtml;
  }

  const doc = new DOMParser().parseFromString(rawHtml, 'text/html');

  targets.forEach((target) => {
    const walker = doc.createTreeWalker(doc.body, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];
    let node = walker.nextNode();
    while (node) {
      textNodes.push(node as Text);
      node = walker.nextNode();
    }

    textNodes.forEach((textNode) => {
      const content = textNode.textContent || '';
      const index = content.toLowerCase().indexOf(target.toLowerCase());

      // Skip if not found or already inside a highlight.
      if (
        index === -1 ||
        textNode.parentElement?.closest('mark.docx-highlight')
      ) {
        return;
      }

      const before = content.slice(0, index);
      const match = content.slice(index, index + target.length);
      const after = content.slice(index + target.length);

      const mark = doc.createElement('mark');
      mark.className = 'docx-highlight';
      mark.textContent = match;

      const fragment = doc.createDocumentFragment();
      if (before) fragment.appendChild(doc.createTextNode(before));
      fragment.appendChild(mark);
      if (after) fragment.appendChild(doc.createTextNode(after));

      textNode.parentNode?.replaceChild(fragment, textNode);
    });
  });

  return doc.body.innerHTML;
};

/**
 * @description Render preview dokumen DOCX with converting to HTML
 * using mammoth (browser build). Critical text is highlighted inline
 * using <mark> (not coordinate-based overlay like PDF).
 * @param {string} fileUrl - URL (signed) to the DOCX file.
 * @param {number} scale - Current zoom factor.
 * @param {React.Dispatch<React.SetStateAction<number>>} setScale - Zoom setter.
 * @param {number} minScale - Minimum zoom.
 * @param {number} maxScale - Maximum zoom.
 * @param {{ text: string; page: number }[]} [criticalHighlights] - Critical texts.
 * @returns {React.ReactElement} DOCX preview element.
 */
const DocxPreview = React.memo<DocxPreviewProps>(
  ({
    fileUrl,
    scale,
    setScale,
    minScale,
    maxScale,
    criticalHighlights,
  }): React.ReactElement => {
    const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);

    const docxQuery = queryOptions({
      queryKey: ['docx-preview', fileUrl, criticalHighlights],
      queryFn: async ({ signal }) => {
        const response = await fetch(fileUrl, { signal });
        if (!response.ok) {
          throw new Error('Gagal mengunduh file DOCX.');
        }
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        return highlightCriticalText(result.value, criticalHighlights);
      },
      enabled: !!fileUrl,
      staleTime: Infinity,
    });

    const {
      data: html,
      isPending: isLoading,
      error: queryError,
    } = useQuery(docxQuery);

    const error = queryError instanceof Error ? queryError.message : null;

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
        {isLoading ? (
          <div className="flex h-96 items-center justify-center">
            <p className="text-lg">Loading DOCX...</p>
          </div>
        ) : error ? (
          <div className="flex h-96 flex-col items-center justify-center gap-4">
            <p className="text-lg font-bold text-red-600">
              Failed to load DOCX
            </p>
            <p className="text-sm text-gray-600">{error}</p>
          </div>
        ) : (
          <div
            className="inline-block origin-top-left transition-transform duration-200"
            style={{ transform: `scale(${scale})` }}
          >
            <div
              className="docx-content mx-auto max-w-[900px] rounded-md bg-white p-12 drop-shadow-xl"
              dangerouslySetInnerHTML={{ __html: html ?? '' }}
            />
          </div>
        )}
      </div>
    );
  }
);

DocxPreview.displayName = 'DocxPreview';

export default DocxPreview;
