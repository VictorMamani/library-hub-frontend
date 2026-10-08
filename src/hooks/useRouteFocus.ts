import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export function useRouteFocus() {
  const { pathname } = useLocation();
  const main = useRef<HTMLElement>(null);
  const previousPath = useRef(pathname);
  useEffect(() => {
    if (previousPath.current !== pathname) {
      main.current?.focus();
      window.scrollTo({ top: 0 });
      previousPath.current = pathname;
    }
  }, [pathname]);
  return main;
}
