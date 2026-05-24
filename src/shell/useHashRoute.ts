import { useEffect, useState } from 'react';

/** hash router — `#/path` 형식. SPA 정적 호스팅과 호환. */
export function useHashRoute(): string {
  const [hash, setHash] = useState<string>(() => window.location.hash || '#/');
  useEffect(() => {
    const onChange = (): void => setHash(window.location.hash || '#/');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash.replace(/^#/, '') || '/';
}

export function navigate(path: string): void {
  window.location.hash = path;
}
