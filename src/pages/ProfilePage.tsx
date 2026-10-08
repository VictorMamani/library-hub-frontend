import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLogout } from '../hooks/useLogout';
import { ProfilePhotoEditor } from '../components/profile/ProfilePhotoEditor';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user } = useAuth();
  const { busy, error, logout } = useLogout();
  return (
    <section>
      <div className={styles.heading}>
        <h1>Mi cuenta</h1>
        <p>Consulta tus datos y personaliza tu foto de perfil.</p>
      </div>
      <div className={styles.profile}>
        <section
          className={styles.details}
          aria-labelledby="profile-details-heading"
        >
          <h2 id="profile-details-heading">Datos de la cuenta</h2>
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
          <Link
            className="button secondary"
            to="/loans"
          >
            Ver mi biblioteca
          </Link>
          <div className={styles.session}>
            <h2>Sesión</h2>
            {error && (
              <p
                className="error"
                role="alert"
              >
                {error}
              </p>
            )}
            <button
              type="button"
              className="button secondary"
              disabled={busy}
              onClick={() => void logout()}
            >
              {busy ? 'Cerrando sesión…' : 'Cerrar sesión'}
            </button>
          </div>
        </section>
        <ProfilePhotoEditor name={user?.name ?? ''} />
      </div>
    </section>
  );
}
