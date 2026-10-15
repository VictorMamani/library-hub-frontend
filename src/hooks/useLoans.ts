import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import type { LoansOverview } from '../types';
import { useResource } from './useResource';
import { request } from '../services/api';

export function useLoans() {
  const location = useLocation();
  const initialNotice: unknown = (location.state as { notice?: unknown } | null)?.notice;
  const [notice, setNotice] = useState(typeof initialNotice === 'string' ? initialNotice : '');
  const [actionError, setActionError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [returnedCount, setReturnedCount] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const {
    data: loans,
    loading,
    error,
    reload,
  } = useResource<LoansOverview>(`/loans/overview?page=${historyPage}`, true);

  async function returnLoan(id: string) {
    setPending(id);
    setActionError(null);
    setNotice('');
    try {
      await request(`/loans/${id}/return`, { method: 'POST' }, true);
      setNotice('Libro devuelto. El préstamo se conserva en tu historial.');
      setReturnedCount((count) => count + 1);
      reload();
    } catch (failure) {
      setActionError(failure instanceof Error ? failure.message : 'No se pudo devolver el libro.');
    } finally {
      setPending(null);
    }
  }
  const active = loans?.active ?? [];
  const history = loans?.history.items ?? [];

  return {
    notice,
    actionError,
    pending,
    loading,
    error,
    reload,
    returnLoan,
    active,
    history,
    historyPage,
    setHistoryPage,
    historyTotal: loans?.history.total ?? 0,
    returnedCount,
    historyPages: Math.max(
      1,
      Math.ceil((loans?.history.total ?? 0) / (loans?.history.pageSize ?? 10)),
    ),
  };
}
