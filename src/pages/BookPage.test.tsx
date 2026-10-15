import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { setSession } from '../services/api';
import BookPage from './BookPage';
import { book, deferred, fetchMock, json, session, mockBookRequests } from '../../tests/fixtures';

function renderBook(authenticated = true) {
  if (authenticated) setSession(session);
  render(
    <MemoryRouter initialEntries={['/books/OL123W']}>
      <AuthContext.Provider
        value={{
          user: authenticated ? session.user : null,
          initializing: false,
          sessionError: null,
        }}
      >
        <Routes>
          <Route
            path="/books/:bookId"
            element={<BookPage />}
          />
          <Route
            path="/loans"
            element={<h1>Mis préstamos</h1>}
          />
          <Route
            path="/login"
            element={<h1>Acceso a la biblioteca</h1>}
          />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
  return userEvent.setup();
}

describe('BookPage y useBorrowBook con la API simulada', () => {
  it('registra un préstamo con Bearer y lleva al usuario a su biblioteca', async () => {
    mockBookRequests(json(book), json({ id: 'loan-id' }, 201));
    const user = renderBook();
    await user.click(await screen.findByRole('button', { name: 'Tomar prestado' }));
    expect(await screen.findByRole('heading', { name: 'Mis préstamos' })).toBeInTheDocument();
    const call = fetchMock().mock.calls.find(([url]) => url === '/api/loans');
    expect(call?.[1]?.method).toBe('POST');
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({ bookId: 'OL123W' });
    expect(new Headers(call?.[1]?.headers).get('Authorization')).toBe('Bearer test-access-token');
  });

  it('impide envíos adicionales durante el registro de un préstamo', async () => {
    const pending = deferred<Response>();
    mockBookRequests(json(book), pending.promise);
    const user = renderBook();
    await user.click(await screen.findByRole('button', { name: 'Tomar prestado' }));
    expect(screen.getByRole('button', { name: 'Registrando préstamo…' })).toBeDisabled();
    pending.resolve(json({ id: 'loan-id' }, 201));
    expect(await screen.findByRole('heading', { name: 'Mis préstamos' })).toBeInTheDocument();
  });

  it('actualiza la disponibilidad cuando otro usuario tomó el ejemplar', async () => {
    mockBookRequests(
      json(book),
      json({ message: 'El ejemplar ya está prestado.' }, 409),
      json({ ...book, available: false }),
    );
    const user = renderBook();
    await user.click(await screen.findByRole('button', { name: 'Tomar prestado' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('El ejemplar ya está prestado.');
    expect(await screen.findByRole('button', { name: 'Reservar libro' })).toBeEnabled();
    expect(screen.queryByRole('heading', { name: 'Mis préstamos' })).not.toBeInTheDocument();
  });

  it('invita al visitante a iniciar sesión antes de tomar un libro', async () => {
    mockBookRequests(json(book));
    const user = renderBook(false);
    await user.click(
      await screen.findByRole('link', { name: 'Iniciar sesión para tomar prestado' }),
    );
    expect(screen.getByRole('heading', { name: 'Acceso a la biblioteca' })).toBeInTheDocument();
    expect(fetchMock().mock.calls.some(([url]) => url === '/api/loans')).toBe(false);
  });

  it('permite recuperar un detalle que no pudo cargarse', async () => {
    mockBookRequests(json({ message: 'No se pudo cargar el libro.' }, 503));
    const user = renderBook();
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cargar el libro.');
    mockBookRequests(json({ ...book, description: '', publicationYear: null, subjects: [] }));
    await user.click(screen.getByRole('button', { name: 'Intentar nuevamente' }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'El principito' })).toBeInTheDocument(),
    );
    expect(
      screen.getByText('La fuente del catálogo no incluye una descripción para este libro.'),
    ).toBeInTheDocument();
  });
});
