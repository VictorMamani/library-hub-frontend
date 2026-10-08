import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signIn, signUp } from '../services/api';

export function useLoginForm() {
  const { user, initializing, sessionError } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const candidate: unknown = (location.state as { from?: unknown } | null)?.from;
  const destination =
    typeof candidate === 'string' && candidate.startsWith('/') && !candidate.startsWith('//')
      ? candidate
      : '/loans';

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const email = String(values.get('email') ?? '')
      .trim()
      .toLowerCase();
    const password = String(values.get('password') ?? '');
    setBusy(true);
    setError(null);
    try {
      if (register) await signUp(String(values.get('name') ?? '').trim(), email, password);
      else await signIn(email, password);
      navigate(destination, { replace: true });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudo iniciar sesión.');
    } finally {
      setBusy(false);
    }
  }

  function toggleMode() {
    setRegister((value) => !value);
    setError(null);
  }
  return {
    user,
    initializing,
    sessionError,
    register,
    busy,
    error,
    showPassword,
    setShowPassword,
    destination,
    submit,
    toggleMode,
  };
}
