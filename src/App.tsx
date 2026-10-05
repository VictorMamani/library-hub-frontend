import { lazy, Suspense, useEffect, useRef } from 'react';
import { Link, Navigate, NavLink, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import CatalogPage from './pages/CatalogPage';
import { ResourceState } from './components/ResourceState';
import bookIcon from './assets/book.svg';
import styles from './App.module.css';

const BookPage = lazy(() => import('./pages/BookPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const LoansPage = lazy(() => import('./pages/LoansPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

function ProtectedRoute() {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <ResourceState loading />;
  return user ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      state={{ from: `${location.pathname}${location.search}` }}
      replace
    />
  );
}

function Layout() {
  const { user } = useAuth();
  const location = useLocation();
  const main = useRef<HTMLElement>(null);
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      main.current?.focus();
      window.scrollTo({ top: 0 });
      previousPath.current = location.pathname;
    }
  }, [location.pathname]);

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

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          index
          element={<CatalogPage />}
        />
        <Route
          path="books/:bookId"
          element={<BookPage />}
        />
        <Route
          path="login"
          element={<LoginPage />}
        />
        <Route element={<ProtectedRoute />}>
          <Route
            path="loans"
            element={<LoansPage />}
          />
          <Route
            path="profile"
            element={<ProfilePage />}
          />
        </Route>
        <Route
          path="*"
          element={
            <section>
              <h1>Página no encontrada</h1>
              <p>La dirección no corresponde a una página de la biblioteca.</p>
              <Link
                className="button secondary"
                to="/"
              >
                Volver al catálogo
              </Link>
            </section>
          }
        />
      </Route>
    </Routes>
  );
}
