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

const useTextHighlighter = (
  snippets: CriticalSnippet[], // CHANGED: Now receives array of objects from AI
  pageNumber: number,
  scale: number
) => {
  const [coords, setCoords] = useState<HighlightCoord[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Make sure snippets exist before processing DOM
      if (!snippets || snippets.length === 0) {
        setCoords([]);
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

          // ADJUSTMENT 2: Search for specific text inside the ACTIVE page container only
          const pageContainer = document.querySelector(
            `.react-pdf__Page[data-page-number="${pageNumber}"]`
          );

          if (!pageContainer) return null;

          const textSpans = pageContainer.querySelectorAll(
            '.react-pdf__Page__textContent span'
          );
          let foundRange: Range | null = null;

          // Search for span containing the keyword
          // 2. Search for span containing the keyword
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
    }, 1000);

    return () => clearTimeout(timer);
  }, [snippets, pageNumber, scale]);

  return coords;
};

export default useTextHighlighter;
