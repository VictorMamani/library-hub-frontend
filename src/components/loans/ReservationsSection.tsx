import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Paginated, Reservation } from '../../types';
import { useResource } from '../../hooks/useResource';
import { request } from '../../services/api';
import { ResourceState } from '../ResourceState';
import { useResultsFocus } from '../../hooks/useResultsFocus';
import { BookCover } from '../BookCover';
import styles from '../../pages/LoansPage.module.css';

export function ReservationsSection({ onBorrowed }: { onBorrowed: () => void }) {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useResource<Paginated<Reservation>>(
    `/reservations?page=${page}`,
    true,
  );
  const [pending, setPending] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const heading = useResultsFocus(String(page), loading);

  async function act(reservation: Reservation, borrow: boolean) {
    setPending(reservation.id);
    setFailure(null);
    setNotice('');
    try {
      if (borrow) {
        await request(
          '/loans',
          { method: 'POST', body: JSON.stringify({ bookId: reservation.book.id }) },
          true,
        );
        setNotice('Préstamo registrado. Consulta su vencimiento en Préstamos activos.');
        onBorrowed();
      } else {
        await request(`/reservations/${reservation.id}/cancel`, { method: 'POST' }, true);
        setNotice('Reserva cancelada.');
      }
      const pages = Math.max(1, Math.ceil(((data?.total ?? 1) - 1) / (data?.pageSize ?? 10)));
      heading.current?.focus();
      if (page > pages) setPage(pages);
      else reload();
    } catch (problem) {
      setFailure(problem instanceof Error ? problem.message : 'No se pudo actualizar la reserva.');
      reload();
    } finally {
      setPending(null);
    }
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="reservations-heading"
    >
      <div className={styles.sectionTitle}>
        <h2
          id="reservations-heading"
          ref={heading}
          tabIndex={-1}
        >
          Mis reservas
        </h2>
        <span>{data?.total ?? 0}</span>
      </div>
      <p className={styles.help}>
        Se atienden por orden de solicitud. La primera persona tiene prioridad cuando se devuelve el
        ejemplar.
      </p>
      {failure && (
        <p
          className="error"
          role="alert"
        >
          {failure}
        </p>
      )}
      {notice && (
        <p
          className="notice"
          role="status"
        >
          {notice}
        </p>
      )}
      {loading || error ? (
        <ResourceState
          loading={loading}
          error={error}
          retry={reload}
        />
      ) : data?.items.length ? (
        <ul className={styles.list}>
          {data.items.map((reservation) => (
            <li
              key={reservation.id}
              className={styles.row}
            >
              <Link
                className={styles.cover}
                to={`/books/${reservation.book.id}`}
              >
                <BookCover
                  coverId={reservation.book.coverId}
                  title={reservation.book.title}
                />
              </Link>
              <div className={styles.info}>
                <h3>
                  <Link to={`/books/${reservation.book.id}`}>{reservation.book.title}</Link>
                </h3>
                <p>{reservation.book.authors.join(', ') || 'Autor no disponible'}</p>
                <p className={styles.due}>
                  {reservation.ready
                    ? 'Es tu turno · Disponible para ti'
                    : `Posición ${reservation.position} en la cola`}
                </p>
              </div>
              <div className={styles.rowActions}>
                {reservation.ready && (
                  <button
                    className="button"
                    disabled={pending !== null}
                    onClick={() => void act(reservation, true)}
                  >
                    {pending === reservation.id ? 'Procesando…' : 'Tomar prestado'}
                  </button>
                )}
                <button
                  className="button secondary"
                  disabled={pending !== null}
                  onClick={() => void act(reservation, false)}
                >
                  {pending === reservation.id ? 'Procesando…' : 'Cancelar reserva'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          No tienes reservas activas. Puedes reservar desde el detalle de un ejemplar no disponible.
        </p>
      )}
      {data && data.total > data.pageSize && (
        <nav
          className={styles.pagination}
          aria-label="Páginas de reservas"
        >
          <button
            className="button secondary"
            disabled={loading || page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Anterior
          </button>
          <span>
            Página {page} de {Math.ceil(data.total / data.pageSize)}
          </span>
          <button
            className="button secondary"
            disabled={loading || page * data.pageSize >= data.total}
            onClick={() => setPage(page + 1)}
          >
            Siguiente
          </button>
        </nav>
      )}
    </section>
  );
}
