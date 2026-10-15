import { Suspense } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRouteFocus } from '../hooks/useRouteFocus';
import { ResourceState } from '../components/ResourceState';
import { ThemeSwitcher } from '../components/ThemeSwitcher';
import bookIcon from '../assets/book.svg';
import styles from './AppLayout.module.css';

export default function AppLayout() {
  const { user } = useAuth();
  const main = useRouteFocus();
  return (
    <div className={styles.app}>
      <a
        className={styles.skip}
        href="#main-content"
      >
        Saltar al contenido
      </a>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Link
            to="/"
            className={styles.brand}
          >
            <span className={styles.brandMark}>
              <img
                src={bookIcon}
                alt=""
              />
            </span>
            Library Hub
          </Link>
          <div className={styles.controls}>
            <nav
              className={styles.nav}
              aria-label="Navegación principal"
            >
              <NavLink
                to="/"
                end
              >
                Catálogo
              </NavLink>
              <NavLink to="/loans">Mi biblioteca</NavLink>
              <NavLink to={user ? '/profile' : '/login'}>
                {user ? 'Mi cuenta' : 'Iniciar sesión'}
              </NavLink>
            </nav>
            <ThemeSwitcher />
          </div>
        </div>
      </header>
      <main
        id="main-content"
        ref={main}
        tabIndex={-1}
        className={styles.main}
      >
        <Suspense fallback={<ResourceState loading />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className={styles.footer}>
        <span>Library Hub · Biblioteca universitaria</span>
        <span>Catálogo de Open Library</span>
      </footer>
    </div>
  );
}
