import { useState } from 'react';
import bookIcon from '../assets/book.svg';
import styles from './BookCover.module.css';

export function BookCover({
  coverId,
  title,
  eager = false,
}: {
  coverId: number | null;
  title: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={styles.cover}>
      {coverId && !failed ? (
        <img
          className={styles.image}
          src={`https://covers.openlibrary.org/b/id/${coverId}-M.jpg?default=false`}
          alt={`Portada de ${title}`}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className={styles.fallback}>
          <img
            src={bookIcon}
            alt=""
          />
          <span>Portada no disponible</span>
        </div>
      )}
    </div>
  );
}
