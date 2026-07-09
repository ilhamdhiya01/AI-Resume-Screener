import CSSMatrix from 'dommatrix';

// pdf-parse requires DOMMatrix which is not defined in Node.js by default.
// dommatrix exports a CSSMatrix class that is compatible with the DOMMatrix
// interface, so we use it as a polyfill before loading any code that imports
// pdf-parse.
if (typeof globalThis.DOMMatrix === 'undefined') {
  globalThis.DOMMatrix = CSSMatrix as unknown as typeof globalThis.DOMMatrix;
}
