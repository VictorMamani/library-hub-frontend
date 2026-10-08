import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Book } from '../types';
import { request } from '../services/api';

export function useBorrowBook(book: Book | null, reload: () => void) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function borrow() {
    if (!book) return;
    setBusy(true);
    setActionError(null);
    try {
      await request('/loans', { method: 'POST', body: JSON.stringify({ bookId: book.id }) }, true);
      navigate('/loans', {
        state: { notice: 'Préstamo registrado. Consulta aquí la fecha de devolución.' },
      });
    } catch (failure) {
      setActionError(
        failure instanceof Error ? failure.message : 'No se pudo registrar el préstamo.',
      );
      reload();
    } finally {
      setBusy(false);
    }
  }

  return { busy, actionError, borrow };
}
