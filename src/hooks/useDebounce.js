// src/hooks/useDebounce.js

import { useState, useEffect } from 'react';

/**
 * Debounce a value.
 * @param {*} value
 * @param {number} delay - milliseconds
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
