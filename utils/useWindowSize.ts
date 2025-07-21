import { useState, useEffect } from 'react';

export function useWindowSize() {
  const [size, setSize] = useState({ width: 1024, height: 768 }); // Default desktop size for SSR

  useEffect(() => {
    function updateSize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return size;
} 