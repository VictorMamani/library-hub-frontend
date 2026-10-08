import { Link, useParams } from 'react-router-dom';
import type { Book } from '../types';
import { useAuth } from '../context/AuthContext';
import { useResource } from '../hooks/useResource';
import { useBorrowBook } from '../hooks/useBorrowBook';
import { BookCover } from '../components/BookCover';
import { ResourceState } from '../components/ResourceState';
import backIcon from '../assets/back.svg';
import styles from './BookPage.module.css';

export default function BookPage() {
  const { bookId } = useParams();
  const { user, initializing } = useAuth();
  const {
    data: book,
    loading,
    error,
    reload,
  } = useResource<Book>(`/books/${encodeURIComponent(bookId ?? '')}`);
  const { busy, actionError, borrow } = useBorrowBook(book, reload);

  return (
    <>
      <Link
        className={styles.back}
        to="/"
      >
        <img
          src={backIcon}
          alt=""
        />
        Volver al catálogo
      </Link>
      {loading || error ? (
        <ResourceState
          loading={loading}
          error={error}
          retry={reload}
        />
      ) : (
        book && (
          <>
            <section className={styles.metadata}>
              <div className={styles.cover}>
                <BookCover
                  key={book.id}
                  coverId={book.coverId}
                  title={book.title}
                  eager
                />
              </div>
              <div className={styles.details}>
                <h1>{book.title}</h1>
                <p className={styles.author}>{book.authors.join(', ') || 'Autor no disponible'}</p>
                <dl>
                  <div>
                    <dt>Primera publicación</dt>
                    <dd>{book.publicationYear ?? 'No disponible'}</dd>
                  </div>
                  <div>
                    <dt>Disponibilidad</dt>
                    <dd>{book.available ? 'Un ejemplar disponible' : 'Ejemplar prestado'}</dd>
                  </div>
                </dl>
                {book.subjects.length > 0 && (
                  <div className={styles.subjects}>
                    <h2>Temas</h2>
                    <ul>
                      {book.subjects.map((subject) => (
                        <li key={subject}>{subject}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
            <section className={styles.description}>
              <h2>Acerca de este libro</h2>
              <p>
                {book.description ||
                  'La fuente del catálogo no incluye una descripción para este libro.'}
              </p>
            </section>
            <section
              className={styles.actions}
              aria-label="Préstamo del libro"
            >
              {actionError && (
                <p
                  role="alert"
                  className="error"
                >
                  {actionError}
                </p>
              )}
              {user ? (
                <button
                  className="button"
                  disabled={!book.available || busy}
                  onClick={() => void borrow()}
                >
                  {busy
                    ? 'Registrando préstamo…'
                    : book.available
                      ? 'Tomar prestado'
                      : 'Ejemplar no disponible'}
                </button>
              ) : (
                <Link
                  className="button"
                  to="/login"
                  state={{ from: `/books/${book.id}` }}
                >
                  {initializing ? 'Acceder a mi cuenta' : 'Iniciar sesión para tomar prestado'}
                </Link>
              )}
              <p>Consulta el vencimiento de cada préstamo en Mi biblioteca.</p>
            </section>
          </>
        )
      )}
    </>
  );
}
