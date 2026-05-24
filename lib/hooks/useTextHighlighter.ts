import { useEffect, useState } from 'react';

// Buat interface agar tipe data jelas dan aman dari eslint any
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

export const useTextHighlighter = (
  snippets: CriticalSnippet[], // UBAH: Sekarang menerima array objek dari AI
  pageNumber: number,
  scale: number
) => {
  const [coords, setCoords] = useState<HighlightCoord[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Pastikan ada snippets sebelum memproses DOM
      if (!snippets || snippets.length === 0) {
        setCoords([]);
        return;
      }

      const newCoords = snippets
        .map((snippetObj) => {
          // ADJUSTMENT 1: Validasi objek, kecocokan halaman, dan string kosong (global issue)
          if (
            !snippetObj ||
            snippetObj.page !== pageNumber ||
            !snippetObj.text
          ) {
            return null;
          }

          const targetText = snippetObj.text;

          // ADJUSTMENT 2: Cari teks khusus di dalam container halaman yang AKTIF saja
          const pageContainer = document.querySelector(
            `.react-pdf__Page[data-page-number="${pageNumber}"]`
          );

          if (!pageContainer) return null;

          const textSpans = pageContainer.querySelectorAll(
            '.react-pdf__Page__textContent span'
          );
          let foundRange: Range | null = null;

          // Cari span yang mengandung kata kunci
          // 2. Cari span yang mengandung kata kunci
          for (const span of Array.from(textSpans)) {
            const textContent = span.textContent || '';
            const index = textContent
              .toLowerCase()
              .indexOf(targetText.toLowerCase());

            // Jika teks ditemukan di dalam span ini
            if (index !== -1) {
              const range = document.createRange();

              // AMAN: Cari Text Node yang tepat di dalam span, jangan tebak pakai firstChild
              let currentOffset = 0;
              let startNode: Node | null = null;
              let startOffset = 0;
              let endNode: Node | null = null;
              let endOffset = 0;

              // Jalankan walker untuk memeriksa setiap serpihan text node di dalam span
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

                // Tentukan posisi awal highlight
                if (!startNode && currentOffset + nodeLength >= index) {
                  startNode = node;
                  startOffset = index - currentOffset;
                }

                // Tentukan posisi akhir highlight
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

              // Eksekusi Range hanya jika node penanda berhasil dipetakan dengan aman
              if (startNode && endNode) {
                range.setStart(startNode, startOffset);
                range.setEnd(endNode, endOffset);
                foundRange = range;
                break;
              }
            }
          }

          // Ambil koordinat presisi relatif terhadap page container aktif
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
        .filter((coord): coord is HighlightCoord => coord !== null); // Filter null dengan type guard

      setCoords(newCoords);
    }, 1000);

    return () => clearTimeout(timer);
  }, [snippets, pageNumber, scale]);

  return coords;
};
