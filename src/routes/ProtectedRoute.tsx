import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ResourceState } from '../components/ResourceState';

export function ProtectedRoute() {
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
