import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { signOut } from '../services/api';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function logout() {
    setBusy(true);
    setError(null);
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudo cerrar la sesión.');
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className={styles.profile}>
      <h1>Mi cuenta</h1>
      <dl>
        <div>
          <dt>Nombre</dt>
          <dd>{user?.name}</dd>
        </div>
        <div>
          <dt>Correo electrónico</dt>
          <dd>{user?.email}</dd>
        </div>
      </dl>
      {error && (
        <p
          className="error"
          role="alert"
        >
          {error}
        </p>
      )}
      <button
        className="button secondary"
        disabled={busy}
        onClick={() => void logout()}
      >
        {busy ? 'Cerrando sesión…' : 'Cerrar sesión'}
      </button>
    </section>
  );
}
