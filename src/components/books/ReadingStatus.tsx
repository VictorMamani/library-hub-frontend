import { useEffect, useState } from 'react';
import type { ReadingState } from '../../types';
import { useResource } from '../../hooks/useResource';
import { request } from '../../services/api';
import { ResourceState } from '../ResourceState';
import styles from '../../pages/BookPage.module.css';

export function ReadingStatus({ bookId }: { bookId: string }) {
  const { data, loading, error, reload } = useResource<{ status: ReadingState }>(
    `/reading/${bookId}`,
    true,
  );
  const [status, setStatus] = useState<ReadingState>('none');
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    if (data) setStatus(data.status);
  }, [data]);

  async function save() {
    setBusy(true);
    setFailure(null);
    setNotice('');
    try {
      await request(
        `/reading/${bookId}`,
        { method: 'POST', body: JSON.stringify({ status }) },
        true,
      );
      setNotice('Estado de lectura guardado.');
      reload();
    } catch (problem) {
      setFailure(problem instanceof Error ? problem.message : 'No se pudo guardar el estado.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className={styles.reading}
      aria-labelledby="reading-heading"
    >
      <h2 id="reading-heading">Mi lectura</h2>
      <p>Tu seguimiento personal se guarda en tu cuenta y es independiente del préstamo.</p>
      {loading || error ? (
        <ResourceState
          loading={loading}
          error={error}
          retry={reload}
        />
      ) : (
        <div className={styles.readingForm}>
          <label htmlFor="reading-status">
            Estado de lectura
            <select
              id="reading-status"
              value={status}
              disabled={busy}
              onChange={(event) => {
                setStatus(event.target.value as ReadingState);
                setNotice('');
              }}
            >
              <option value="none">Sin seguimiento</option>
              <option value="wishlist">Lista de deseos</option>
              <option value="reading">Leyendo</option>
              <option value="completed">Completado</option>
            </select>
          </label>
          <button
            className="button secondary"
            onClick={() => void save()}
            disabled={busy}
          >
            {busy ? 'Guardando…' : 'Guardar estado'}
          </button>
        </div>
      )}
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
    </section>
  );
}
