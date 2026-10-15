import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ActiveLoanRow } from '../components/loans/ActiveLoanRow';
import { HistoryLoanRow } from '../components/loans/HistoryLoanRow';
import { ResourceState } from '../components/ResourceState';
import { useLoans } from '../hooks/useLoans';
import { usePageTitle } from '../hooks/usePageTitle';
import { ReservationsSection } from '../components/loans/ReservationsSection';
import { ReadingSection } from '../components/loans/ReadingSection';
import { useResultsFocus } from '../hooks/useResultsFocus';
import styles from './LoansPage.module.css';

export default function LoansPage() {
  const { user } = useAuth();
  const {
    notice,
    actionError,
    pending,
    loading,
    error,
    reload,
    returnLoan,
    active,
    history,
    historyPage,
    setHistoryPage,
    historyPages,
    historyTotal,
    returnedCount,
  } = useLoans();
  usePageTitle('Mi biblioteca');
  const historyHeading = useResultsFocus(String(historyPage), loading);
  const activeHeading = useResultsFocus(String(returnedCount), loading);

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
              <h2
                ref={activeHeading}
                tabIndex={-1}
              >
                Préstamos activos
              </h2>
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
              <h2
                ref={historyHeading}
                tabIndex={-1}
              >
                Historial de préstamos
              </h2>
              <span>{historyTotal}</span>
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
            {historyTotal > 10 && (
              <nav
                className={styles.pagination}
                aria-label="Páginas del historial"
              >
                <button
                  className="button secondary"
                  disabled={loading || historyPage <= 1}
                  onClick={() => setHistoryPage(historyPage - 1)}
                >
                  Anterior
                </button>
                <span>
                  Página {historyPage} de {historyPages}
                </span>
                <button
                  className="button secondary"
                  disabled={loading || historyPage >= historyPages}
                  onClick={() => setHistoryPage(historyPage + 1)}
                >
                  Siguiente
                </button>
              </nav>
            )}
          </section>
        </>
      )}
      <ReservationsSection onBorrowed={reload} />
      <ReadingSection />
    </>
  );
}
