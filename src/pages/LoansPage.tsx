import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ActiveLoanRow } from '../components/loans/ActiveLoanRow';
import { HistoryLoanRow } from '../components/loans/HistoryLoanRow';
import { ResourceState } from '../components/ResourceState';
import { useLoans } from '../hooks/useLoans';
import styles from './LoansPage.module.css';

export default function LoansPage() {
  const { user } = useAuth();
  const { notice, actionError, pending, loading, error, reload, returnLoan, active, history } =
    useLoans();

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
                {active.map((loan) => (
                  <ActiveLoanRow
                    key={loan.id}
                    loan={loan}
                    pending={pending}
                    returnLoan={returnLoan}
                  />
                ))}
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
                  <HistoryLoanRow
                    key={loan.id}
                    loan={loan}
                  />
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
