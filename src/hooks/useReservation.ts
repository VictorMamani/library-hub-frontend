import { useState } from 'react';
import { request } from '../services/api';
import { useResource } from './useResource';
import type { BookReservationState } from '../types';

export function useReservation(bookId: string, onChanged: () => void) {
  const resource = useResource<BookReservationState>(`/reservations/book/${bookId}`, true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  async function change(cancel = false) {
    setPending(true);
    setError(null);
    setNotice('');
    try {
      if (cancel && resource.data?.reservation) {
        await request(
          `/reservations/${resource.data.reservation.id}/cancel`,
          { method: 'POST' },
          true,
        );
        setNotice('Reserva cancelada.');
      } else {
        await request('/reservations', { method: 'POST', body: JSON.stringify({ bookId }) }, true);
        setNotice('Reserva registrada. Consulta tu turno en Mi biblioteca.');
      }
      resource.reload();
      onChanged();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudo actualizar la reserva.');
      resource.reload();
      onChanged();
    } finally {
      setPending(false);
    }
  }
  return { ...resource, actionError: error, pending, notice, change };
}
