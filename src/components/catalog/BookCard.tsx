import { Link } from 'react-router-dom';
import type { Book } from '../../types';
import { BookCover } from '../BookCover';
import styles from '../../pages/CatalogPage.module.css';

export function BookCard({ book }: { book: Book }) {
  return (
    <article className={styles.book}>
      <Link
        className={styles.coverLink}
        to={`/books/${book.id}`}
        aria-label={`Ver ${book.title}`}
      >
        <BookCover
          coverId={book.coverId}
          title={book.title}
        />
      </Link>
      <div className={styles.bookText}>
        <h2>
          <Link to={`/books/${book.id}`}>{book.title}</Link>
        </h2>
        <p>{book.authors.join(', ') || 'Autor no disponible'}</p>
      </div>
      <div className={styles.bookMeta}>
        <span>{book.publicationYear ?? 'Fecha no disponible'}</span>
        <span className={book.available ? styles.available : styles.unavailable}>
          {book.available ? 'Disponible' : 'Prestado'}
        </span>
      </div>
      <Link
        className="button secondary"
        to={`/books/${book.id}`}
      >
        Ver detalles
      </Link>
    </article>
  );
}
