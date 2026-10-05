import { createContext, useContext } from 'react';
import type { User } from '../types';

export const AuthContext = createContext<{
  user: User | null;
  initializing: boolean;
  sessionError: string | null;
} | null>(null);
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('AuthProvider no está disponible.');
  return context;
}
