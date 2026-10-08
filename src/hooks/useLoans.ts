import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { Loan } from '../types';
import { useResource } from './useResource';
import { request } from '../services/api';

export function useLoans() {
  const location = useLocation();
  const initialNotice: unknown = (location.state as { notice?: unknown } | null)?.notice;
  const [notice, setNotice] = useState(typeof initialNotice === 'string' ? initialNotice : '');
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const { data: loans, loading, error, reload } = useResource<Loan[]>('/loans', true);

  async function returnLoan(id: string) {
    setPending(id);
    setActionError(null);
    setNotice('');
    try {
      await request(`/loans/${id}/return`, { method: 'POST' }, true);
      setNotice('Libro devuelto. El préstamo se conserva en tu historial.');
      reload();
    } catch (failure) {
      setActionError(failure instanceof Error ? failure.message : 'No se pudo devolver el libro.');
    } finally {
      setPending(null);
    }
  }
  const active = loans?.filter((loan) => !loan.returnedAt) ?? [];
  const history = loans?.filter((loan) => loan.returnedAt) ?? [];

  return { notice, actionError, pending, loading, error, reload, returnLoan, active, history };
}
