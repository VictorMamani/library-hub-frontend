import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import CatalogPage from '../pages/CatalogPage';
import NotFoundPage from '../pages/NotFoundPage';
const BookPage = lazy(() => import('../pages/BookPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const LoansPage = lazy(() => import('../pages/LoansPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
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
          element={<NotFoundPage />}
        />
      </Route>
    </Routes>
  );
}
