import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if component is mounted on client
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
