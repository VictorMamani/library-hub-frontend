import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { Loan } from '../types';
import { useAuth } from '../context/AuthContext';
import { useResource } from '../hooks/useResource';
import { request } from '../services/api';
import { BookCover } from '../components/BookCover';
import { ResourceState } from '../components/ResourceState';
import styles from './LoansPage.module.css';

const date = (value: string) =>
  new Date(value).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' });

export default function LoansPage() {
  const { user } = useAuth();
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

  return (
    <>
      <div className={styles.heading}>
        <h1>Mi biblioteca</h1>
        <p>{user?.name}, consulta tus préstamos y próximas devoluciones.</p>
      </div>
      {notice && (
        <p
          className="notice"
          role="status"
        >
          {notice}
        </p>
      )}
      {actionError && (
        <p
          className="error"
          role="alert"
        >
          {actionError}
        </p>
      )}
      {loading || error ? (
        <ResourceState
          loading={loading}
          error={error}
          retry={reload}
        />
      ) : (
        <>
          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <h2>Préstamos activos</h2>
              <span>{active.length}</span>
            </div>
            {active.length ? (
              <ul className={styles.list}>
                {active.map((loan) => {
                  const overdue = new Date(loan.dueAt).getTime() < Date.now();
                  return (
                    <li
                      key={loan.id}
                      className={styles.row}
                    >
                      <Link
                        className={styles.cover}
                        to={`/books/${loan.book.id}`}
                      >
                        <BookCover
                          coverId={loan.book.coverId}
                          title={loan.book.title}
                        />
                      </Link>
                      <div className={styles.info}>
                        <h3>
                          <Link to={`/books/${loan.book.id}`}>{loan.book.title}</Link>
                        </h3>
                        <p>{loan.book.authors.join(', ') || 'Autor no disponible'}</p>
                        <p className={overdue ? styles.overdue : styles.due}>
                          Devolver el {date(loan.dueAt)}
                          {overdue ? ' · Vencido' : ''}
                        </p>
                      </div>
                      <button
                        className="button secondary"
                        disabled={pending !== null}
                        onClick={() => void returnLoan(loan.id)}
                      >
                        {pending === loan.id ? 'Devolviendo…' : 'Devolver libro'}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className={styles.empty}>
                <p>Aún no tienes préstamos activos.</p>
                <Link
                  className="button secondary"
                  to="/"
                >
                  Explorar el catálogo
                </Link>
              </div>
            )}
          </section>
          <section className={styles.section}>
            <div className={styles.sectionTitle}>
              <h2>Historial de préstamos</h2>
              <span>{history.length}</span>
            </div>
            {history.length ? (
              <ul className={styles.list}>
                {history.map((loan) => (
                  <li
                    key={loan.id}
                    className={styles.row}
                  >
                    <div className={styles.info}>
                      <h3>
                        <Link to={`/books/${loan.book.id}`}>{loan.book.title}</Link>
                      </h3>
                      <p>
                        Prestado el {date(loan.borrowedAt)} · Devuelto el {date(loan.returnedAt!)}
                      </p>
                    </div>
                    <span className={styles.returned}>Devuelto</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.empty}>Aquí aparecerán los libros que devuelvas.</p>
            )}
          </section>
        </>
      )}
    </>
  );
}
