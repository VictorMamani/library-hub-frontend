import { Link } from 'react-router-dom';
import type { Book } from '../../types';
import { useBorrowBook } from '../../hooks/useBorrowBook';
import { useReservation } from '../../hooks/useReservation';
import { ResourceState } from '../ResourceState';
import styles from '../../pages/BookPage.module.css';

export function BookActions({ book, reload }: { book: Book; reload: () => void }) {
  const { busy, actionError, borrow } = useBorrowBook(book, reload);
  const reservation = useReservation(book.id, reload);
  const waiting = reservation.data?.reservation;
  const pending = busy || reservation.pending;

  return (
    <section
      className={styles.actions}
      aria-label="Préstamo y reserva del libro"
    >
      <h2>Préstamo</h2>
      <p>Un ejemplar académico por obra. Plazo de préstamo: {book.loanDays ?? 21} días.</p>
      {reservation.loading || reservation.error ? (
        <ResourceState
          loading={reservation.loading}
          error={reservation.error}
          retry={reservation.reload}
        />
      ) : reservation.data?.borrowedByMe ? (
        <>
          <p>Este libro ya está en tus préstamos.</p>
          <Link
            className="button secondary"
            to="/loans"
          >
            Ver mi biblioteca
          </Link>
        </>
      ) : waiting ? (
        <>
          <p>
            {waiting.ready
              ? 'Es tu turno. Puedes tomar prestado el ejemplar.'
              : `Tu reserva está en la posición ${waiting.position}.`}
          </p>
          {waiting.ready && (
            <button
              className="button"
              disabled={pending}
              onClick={() => void borrow()}
            >
              {busy ? 'Registrando préstamo…' : 'Tomar prestado'}
            </button>
          )}
          <button
            className="button secondary"
            disabled={pending}
            onClick={() => void reservation.change(true)}
          >
            {reservation.pending ? 'Cancelando…' : 'Cancelar reserva'}
          </button>
        </>
      ) : book.available ? (
        <button
          className="button"
          disabled={pending}
          onClick={() => void borrow()}
        >
          {busy ? 'Registrando préstamo…' : 'Tomar prestado'}
        </button>
      ) : (
        <>
          <p>
            {book.availability === 'reserved'
              ? 'El ejemplar está reservado para otra persona.'
              : 'El ejemplar está prestado. Puedes unirte a la cola de reservas.'}
          </p>
          <button
            className="button"
            disabled={pending}
            onClick={() => void reservation.change()}
          >
            {reservation.pending ? 'Reservando…' : 'Reservar libro'}
          </button>
        </>
      )}
      {(actionError || reservation.actionError) && (
        <p
          className="error"
          role="alert"
        >
          {actionError || reservation.actionError}
        </p>
      )}
      {reservation.notice && (
        <p
          className="notice"
          role="status"
        >
          {reservation.notice}
        </p>
      )}
      <p>
        Las reservas siguen el orden de solicitud. Cuando se devuelve el ejemplar, la primera
        persona tiene prioridad hasta tomarlo prestado o cancelar.
      </p>
    </section>
  );
}
