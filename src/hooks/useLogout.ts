import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from '../services/api';

export function useLogout() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function logout() {
    setBusy(true);
    setError(null);
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudo cerrar la sesión.');
    } finally {
      setBusy(false);
    }
  }
  return { busy, error, logout };
}
