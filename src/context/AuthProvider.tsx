import { useEffect, useState, useSyncExternalStore } from 'react';
import type { ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { getSession, refreshSession, subscribeSession } from '../services/api';

export function AuthProvider({ children }: { children: ReactNode }) {
  const session = useSyncExternalStore(subscribeSession, getSession);
  const [initializing, setInitializing] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void refreshSession()
      .catch((error: unknown) => {
        if (active)
          setSessionError(
            error instanceof Error ? error.message : 'No se pudo recuperar la sesión.',
          );
      })
      .finally(() => {
        if (active) setInitializing(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user: session?.user ?? null, initializing, sessionError }}>
      {children}
    </AuthContext.Provider>
  );
}
