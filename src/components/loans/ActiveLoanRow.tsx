import { Link } from 'react-router-dom';
import type { Loan } from '../../types';
import { BookCover } from '../BookCover';
import styles from '../../pages/LoansPage.module.css';
const date = (value: string) =>
  new Date(value).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' });

export function ActiveLoanRow({
  loan,
  pending,
  returnLoan,
}: {
  loan: Loan;
  pending: string | null;
  returnLoan: (id: string) => Promise<void>;
}) {
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
}
