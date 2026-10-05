import { useCallback, useEffect, useState } from 'react';
import { request } from '../services/api';

interface Resource<T> {
  path: string;
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useResource<T>(path: string, authenticated = false) {
  const [state, setState] = useState<Resource<T>>({ path, data: null, error: null, loading: true });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setState({ path, data: null, error: null, loading: true });
    void request<T>(path, { signal: controller.signal }, authenticated)
      .then((data) => {
        if (!controller.signal.aborted) setState({ path, data, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted)
          setState({
            path,
            data: null,
            error: error instanceof Error ? error.message : 'No se pudo cargar la información.',
            loading: false,
          });
      });
    return () => controller.abort();
  }, [path, authenticated, revision]);

  const current = state.path === path;
  return {
    data: current ? state.data : null,
    error: current ? state.error : null,
    loading: !current || state.loading,
    reload,
  };
}
