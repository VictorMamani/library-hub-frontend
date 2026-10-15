import { Link, useLocation, useParams } from 'react-router-dom';
import type { Book } from '../types';
import { useAuth } from '../context/AuthContext';
import { useResource } from '../hooks/useResource';
import { usePageTitle } from '../hooks/usePageTitle';
import { BookActions } from '../components/books/BookActions';
import { ReadingStatus } from '../components/books/ReadingStatus';
import { BookCover } from '../components/BookCover';
import { ResourceState } from '../components/ResourceState';
import backIcon from '../assets/back.svg';
import styles from './BookPage.module.css';

export default function BookPage() {
  const { bookId } = useParams();
  const location = useLocation();
  const candidate: unknown = (location.state as { catalog?: unknown } | null)?.catalog;
  const catalogPath =
    typeof candidate === 'string' && (candidate === '/' || candidate.startsWith('/?'))
      ? candidate
      : '/';
  const { user, initializing } = useAuth();
  const {
    data: book,
    loading,
    error,
    reload,
  } = useResource<Book>(`/books/${encodeURIComponent(bookId ?? '')}`);
  usePageTitle(book?.title ?? 'Detalle del libro');

  return (
    <>
      <Link
        className={styles.back}
        to={catalogPath}
      >
        <img
          src={backIcon}
          alt=""
        />
        Volver al catálogo
      </Link>
      {!book && (loading || error) ? (
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
                    <dd>
                      {book.available
                        ? 'Un ejemplar disponible'
                        : book.availability === 'reserved'
                          ? 'Ejemplar reservado'
                          : 'Ejemplar prestado'}
                    </dd>
                  </div>
                </dl>
                {user ? (
                  <BookActions
                    key={book.id}
                    book={book}
                    reload={reload}
                  />
                ) : (
                  <section
                    className={styles.actions}
                    aria-label="Préstamo del libro"
                  >
                    <h2>Préstamo</h2>
                    <p>
                      Un ejemplar académico por obra. Plazo de préstamo: {book.loanDays ?? 21} días.
                    </p>
                    <Link
                      className="button"
                      to="/login"
                      state={{ from: `/books/${book.id}`, catalog: catalogPath }}
                    >
                      {initializing ? 'Acceder a mi cuenta' : 'Iniciar sesión para tomar prestado'}
                    </Link>
                  </section>
                )}
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
            {error && (
              <ResourceState
                error={error}
                retry={reload}
              />
            )}
            {user && (
              <ReadingStatus
                key={book.id}
                bookId={book.id}
              />
            )}
            <section className={styles.description}>
              <h2>Acerca de este libro</h2>
              <p>
                {book.description ||
                  'La fuente del catálogo no incluye una descripción para este libro.'}
              </p>
            </section>
          </>
        )
      )}
    </>
  );
}
