import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Paginated, ReadingEntry } from '../../types';
import { useResource } from '../../hooks/useResource';
import { request } from '../../services/api';
import { BookCover } from '../BookCover';
import { ResourceState } from '../ResourceState';
import { useResultsFocus } from '../../hooks/useResultsFocus';
import styles from '../../pages/LoansPage.module.css';

const labels = { wishlist: 'Lista de deseos', reading: 'Leyendo', completed: 'Completado' };

export function ReadingSection() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useResource<Paginated<ReadingEntry>>(
    `/reading?status=${status}&page=${page}`,
    true,
  );
  const [pending, setPending] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const heading = useResultsFocus(`${status}|${page}`, loading);

  async function remove(bookId: string) {
    setPending(bookId);
    setFailure(null);
    setNotice('');
    try {
      await request(
        `/reading/${bookId}`,
        { method: 'POST', body: JSON.stringify({ status: 'none' }) },
        true,
      );
      setNotice('Libro quitado de tu seguimiento.');
      heading.current?.focus();
      const pages = Math.max(1, Math.ceil(((data?.total ?? 1) - 1) / (data?.pageSize ?? 10)));
      if (page > pages) setPage(pages);
      else reload();
    } catch (problem) {
      setFailure(problem instanceof Error ? problem.message : 'No se pudo quitar el seguimiento.');
    } finally {
      setPending(null);
    }
  }

  return (
    <section
      className={styles.section}
      aria-labelledby="my-reading-heading"
    >
      <div className={styles.sectionTitle}>
        <h2
          id="my-reading-heading"
          ref={heading}
          tabIndex={-1}
        >
          Mi lectura
        </h2>
        <span>{data?.total ?? 0}</span>
      </div>
      <label
        className={styles.readingFilter}
        htmlFor="my-reading-filter"
      >
        Mostrar
        <select
          id="my-reading-filter"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
        >
          <option value="">Todos los estados</option>
          <option value="wishlist">Lista de deseos</option>
          <option value="reading">Leyendo</option>
          <option value="completed">Completado</option>
        </select>
      </label>
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
          {data.items.map((entry) => (
            <li
              className={styles.row}
              key={entry.book.id}
            >
              <Link
                className={styles.cover}
                to={`/books/${entry.book.id}`}
              >
                <BookCover
                  coverId={entry.book.coverId}
                  title={entry.book.title}
                />
              </Link>
              <div className={styles.info}>
                <h3>
                  <Link to={`/books/${entry.book.id}`}>{entry.book.title}</Link>
                </h3>
                <p>{entry.book.authors.join(', ') || 'Autor no disponible'}</p>
                <p className={styles.due}>{labels[entry.status]}</p>
              </div>
              <button
                className="button secondary"
                disabled={pending !== null}
                onClick={() => void remove(entry.book.id)}
              >
                {pending === entry.book.id ? 'Quitando…' : 'Quitar seguimiento'}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.empty}>
          No tienes libros en este estado. Puedes guardar tu lectura desde el detalle de cada libro.
        </p>
      )}
      {data && data.total > data.pageSize && (
        <nav
          className={styles.pagination}
          aria-label="Páginas de lectura"
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
