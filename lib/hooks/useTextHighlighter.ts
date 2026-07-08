import { useEffect, useState } from 'react';

// Create interface so data types are clear and safe from eslint any
interface CriticalSnippet {
  text: string;
  page: number;
}

interface HighlightCoord {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

/**
 * Compute highlight coordinates over react-pdf rendered text spans.
 * @description Waits for the target page's text layer to be rendered (via MutationObserver
 * or an explicit renderReady signal) before measuring ranges, so highlights don't require
 * a manual zoom to appear.
 * @param {CriticalSnippet[]} snippets - Critical snippets from AI analysis.
 * @param {number} pageNumber - Active page number displayed by react-pdf.
 * @param {number} scale - Current PDF zoom scale.
 * @param {boolean} [renderReady=false] - External signal that the current page has finished rendering.
 * @returns {HighlightCoord[]} Highlight rectangles relative to the page container.
 */
const useTextHighlighter = (
  snippets: CriticalSnippet[],
  pageNumber: number,
  scale: number,
  renderReady: boolean = false
) => {
  const [coords, setCoords] = useState<HighlightCoord[]>([]);

  useEffect(() => {
    if (!snippets || snippets.length === 0) {
      return;
    }

    let cancelled = false;
    let observer: MutationObserver | null = null;

    const findCoords = () => {
      if (cancelled) return;

      const pageContainer = document.querySelector(
        `.react-pdf__Page[data-page-number="${pageNumber}"]`
      );

      if (!pageContainer) {
        return;
      }

      const textSpans = pageContainer.querySelectorAll(
        '.react-pdf__Page__textContent span'
      );

      // Text layer not ready yet — keep observing.
      if (textSpans.length === 0) {
        return;
      }

      const newCoords = snippets
        .map((snippetObj) => {
          // ADJUSTMENT 1: Validate object, page match, and empty string (global issue)
          if (
            !snippetObj ||
            snippetObj.page !== pageNumber ||
            !snippetObj.text
          ) {
            return null;
          }

          const targetText = snippetObj.text;
          let foundRange: Range | null = null;

          // Search for span containing the keyword
          for (const span of Array.from(textSpans)) {
            const textContent = span.textContent || '';
            const index = textContent
              .toLowerCase()
              .indexOf(targetText.toLowerCase());

            // If text is found inside this span
            if (index !== -1) {
              const range = document.createRange();

              // SAFE: Find the exact Text Node inside the span, don't guess using firstChild
              let currentOffset = 0;
              let startNode: Node | null = null;
              let startOffset = 0;
              let endNode: Node | null = null;
              let endOffset = 0;

              // Run walker to inspect every text node fragment inside the span
              const textNodes: Node[] = [];
              const walk = document.createTreeWalker(
                span,
                NodeFilter.SHOW_TEXT,
                null
              );
              let currentNode = walk.nextNode();
              while (currentNode) {
                textNodes.push(currentNode);
                currentNode = walk.nextNode();
              }

              for (const node of textNodes) {
                const nodeLength = node.textContent?.length || 0;

                // Determine highlight start position
                if (!startNode && currentOffset + nodeLength >= index) {
                  startNode = node;
                  startOffset = index - currentOffset;
                }

                // Determine highlight end position
                if (
                  startNode &&
                  !endNode &&
                  currentOffset + nodeLength >= index + targetText.length
                ) {
                  endNode = node;
                  endOffset = index + targetText.length - currentOffset;
                  break;
                }
                currentOffset += nodeLength;
              }

              // Execute Range only if marker nodes are mapped safely
              if (startNode && endNode) {
                range.setStart(startNode, startOffset);
                range.setEnd(endNode, endOffset);
                foundRange = range;
                break;
              }
            }
          }

          // Get precise coordinates relative to active page container
          if (foundRange) {
            const rangeRect = foundRange.getBoundingClientRect();
            const containerRect = pageContainer.getBoundingClientRect();

            return {
              x: (rangeRect.left - containerRect.left) / scale,
              y: (rangeRect.top - containerRect.top) / scale,
              width: rangeRect.width / scale,
              height: rangeRect.height / scale,
              text: targetText,
            };
          }

          return null;
        })
        .filter((coord): coord is HighlightCoord => coord !== null); // Filter null using type guard

      setCoords(newCoords);
    };

    // Run immediately if page already reports rendered or if text layer is already present.
    findCoords();

    // Keep watching until the text layer appears (react-pdf renders it asynchronously).
    observer = new MutationObserver(() => {
      const spans = document.querySelectorAll(
        `.react-pdf__Page[data-page-number="${pageNumber}"] .react-pdf__Page__textContent span`
      );
      if (spans.length > 0) {
        findCoords();
        if (observer) {
          observer.disconnect();
          observer = null;
        }
      }
    });

    const pageContainer = document.querySelector(
      `.react-pdf__Page[data-page-number="${pageNumber}"]`
    );

    if (pageContainer) {
      observer.observe(pageContainer, {
        childList: true,
        subtree: true,
      });
    }

    return () => {
      cancelled = true;
      if (observer) {
        observer.disconnect();
      }
    };
  }, [snippets, pageNumber, scale, renderReady]);

  return coords;
};

export default useTextHighlighter;
