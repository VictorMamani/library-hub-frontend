import { useEffect, useRef } from 'react';

export function useResultsFocus(key: string, loading: boolean) {
  const heading = useRef<HTMLHeadingElement>(null);
  const previous = useRef(key);
  const pending = useRef(false);
  useEffect(() => {
    if (previous.current !== key) {
      previous.current = key;
      pending.current = true;
    }
    if (!loading && pending.current && heading.current) {
      heading.current.focus();
      heading.current.scrollIntoView?.({ block: 'start' });
      pending.current = false;
    }
  }, [key, loading]);
  return heading;
}
