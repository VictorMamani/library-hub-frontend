import styles from './ResourceState.module.css';

export function ResourceState({
  loading,
  error,
  retry,
}: {
  loading?: boolean;
  error?: string | null;
  retry?: () => void;
}) {
  return (
    <div
      className={styles.state}
      role={error ? 'alert' : 'status'}
    >
      <p>{loading ? 'Consultando la biblioteca…' : error}</p>
      {error && retry && (
        <button
          className="button secondary"
          onClick={retry}
        >
          Intentar nuevamente
        </button>
      )}
    </div>
  );
}
