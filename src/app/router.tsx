import { useCallback, useEffect, useState, type MouseEvent, type ReactNode } from 'react';

// Three routes do not justify a routing library. History API, with the Vite base
// path respected so the same build can sit under a sub-path.

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

const stripBase = (pathname: string) => {
  const p = BASE && pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname;
  return p.replace(/\/+$/, '') || '/';
};

export const href = (path: string) => `${BASE}${path}`;

export function navigate(path: string) {
  window.history.pushState(null, '', href(path));
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function usePath(): string {
  const [path, setPath] = useState(() => stripBase(window.location.pathname));
  useEffect(() => {
    const onPop = () => setPath(stripBase(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  return path;
}

export function Link({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  const onClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      navigate(to);
    },
    [to],
  );
  return (
    <a href={href(to)} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
