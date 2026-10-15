import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from '../context/AuthProvider';
import { ProtectedRoute } from './ProtectedRoute';
import { deferred, fetchMock, json, session } from '../../tests/fixtures';

function LoginDestination() {
  const location = useLocation();
  return <p>Inicia sesión para volver a {location.state?.from}</p>;
}

function renderProtected() {
  render(
    <MemoryRouter initialEntries={['/loans?tab=history']}>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={<LoginDestination />}
          />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/loans"
              element={<h1>Historial privado</h1>}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('espera la recuperación de sesión sin mostrar contenido privado', async () => {
    const response = deferred<Response>();
    fetchMock().mockReturnValueOnce(response.promise);
    renderProtected();
    expect(screen.getByRole('status')).toHaveTextContent('Consultando la biblioteca');
    expect(screen.queryByRole('heading', { name: 'Historial privado' })).not.toBeInTheDocument();
    response.resolve(json(session));
    expect(await screen.findByRole('heading', { name: 'Historial privado' })).toBeInTheDocument();
  });

  it('redirige al visitante y conserva la ruta y sus parámetros', async () => {
    fetchMock().mockResolvedValueOnce(new Response(null, { status: 204 }));
    renderProtected();
    expect(
      await screen.findByText('Inicia sesión para volver a /loans?tab=history'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Historial privado' })).not.toBeInTheDocument();
  });

  it('rechaza una sesión de renovación vencida', async () => {
    fetchMock().mockResolvedValueOnce(json({ message: 'Sesión terminada' }, 401));
    renderProtected();
    expect(await screen.findByText(/Inicia sesión para volver/)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Historial privado' })).not.toBeInTheDocument();
  });
});
