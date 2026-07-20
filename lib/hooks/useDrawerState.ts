'use client';

import { useCallback, useState } from 'react';

/**
 * @description Simple toggle state for a mobile/tablet navigation drawer.
 * @returns {Object} isOpen, open, close, toggle
 */
export const useDrawerState = () => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, open, close, toggle };
};

export default useDrawerState;
