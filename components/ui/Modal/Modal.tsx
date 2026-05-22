/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

const Modal = ({ isOpen, onClose, children }: ModalProps) => {
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  // Handle mounting untuk SSR Next.js
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Handle animasi ketika status isOpen berubah
  useEffect(() => {
    if (isOpen) {
      // Kasih sedikit delay biar browser sempat nge-render DOM awal sebelum class animasi masuk
      const timer = setTimeout(() => setAnimate(true), 10);
      return () => clearTimeout(timer);
    } else {
      setAnimate(false);
    }
  }, [isOpen]);

  // Jika belum mounted di client, jangan render apa-apa (aman dari SSR error)
  if (!mounted) return null;

  // Modalnya tetap di DOM kalau `isOpen` true, ATAU pas lagi proses transisi keluar (`animate` masih true)
  if (!isOpen && !animate) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-999 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-300 ease-out ${
        animate ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onClick={onClose}
    >
      {/* Konten Modal dengan animasi Scale dan Fade */}
      <div
        className={`w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all duration-300 ease-out ${
          animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
