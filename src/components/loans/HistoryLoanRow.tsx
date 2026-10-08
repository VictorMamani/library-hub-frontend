import { Link } from 'react-router-dom';
import type { Loan } from '../../types';
import styles from '../../pages/LoansPage.module.css';
const date = (value: string) =>
  new Date(value).toLocaleDateString('es-BO', { day: 'numeric', month: 'short', year: 'numeric' });

export function HistoryLoanRow({ loan }: { loan: Loan }) {
  if (!loan.returnedAt) return null;
  return (
    <li
      key={loan.id}
      className={styles.row}
    >
      <div className={styles.info}>
        <h3>
          <Link to={`/books/${loan.book.id}`}>{loan.book.title}</Link>
        </h3>
        <p>
          Prestado el {date(loan.borrowedAt)} · Devuelto el {date(loan.returnedAt)}
        </p>
      </div>
      <span className={styles.returned}>Devuelto</span>
    </li>
  );
}
