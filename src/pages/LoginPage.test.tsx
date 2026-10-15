import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../context/AuthProvider';
import { getSession } from '../services/api';
import LoginPage from './LoginPage';
import { deferred, fetchMock, json, session } from '../../tests/fixtures';

function renderLogin(from = '/loans') {
  fetchMock().mockResolvedValueOnce(new Response(null, { status: 204 }));
  render(
    <MemoryRouter initialEntries={[{ pathname: '/login', state: { from } }]}>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={<LoginPage />}
          />
          <Route
            path="/loans"
            element={<h1>Mis préstamos</h1>}
          />
          <Route
            path="/profile"
            element={<h1>Mi cuenta</h1>}
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
  return userEvent.setup();
}

async function fillCredentials(user: ReturnType<typeof userEvent.setup>) {
  await waitFor(() => expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled());
  await user.type(screen.getByLabelText('Correo electrónico'), 'STUDENT@example.com');
  await user.type(screen.getByLabelText('Contraseña'), 'a-test-password');
}

describe('LoginPage con AuthProvider y cliente HTTP reales', () => {
  it('inicia sesión y vuelve a la ruta protegida solicitada', async () => {
    const user = renderLogin('/profile');
    fetchMock().mockResolvedValueOnce(json(session));
    await fillCredentials(user);
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByRole('heading', { name: 'Mi cuenta' })).toBeInTheDocument();
    expect(getSession()).toEqual(session);
    const loginCall = fetchMock().mock.calls.find(([url]) => url === '/api/auth/login');
    expect(JSON.parse(String(loginCall?.[1]?.body))).toEqual({
      email: 'student@example.com',
      password: 'a-test-password',
    });
    expect(localStorage.length).toBe(0);
  });

  it('muestra credenciales incorrectas y permite corregirlas sin abandonar el formulario', async () => {
    const user = renderLogin();
    fetchMock().mockResolvedValueOnce(json({ message: 'Correo o contraseña incorrectos.' }, 401));
    await fillCredentials(user);
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Correo o contraseña incorrectos.');
    expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeEnabled();
    expect(getSession()).toBeNull();

    fetchMock().mockResolvedValueOnce(json(session));
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByRole('heading', { name: 'Mis préstamos' })).toBeInTheDocument();
  });

  it('impide otro envío mientras el inicio de sesión está pendiente', async () => {
    const user = renderLogin();
    const response = deferred<Response>();
    fetchMock().mockReturnValueOnce(response.promise);
    await fillCredentials(user);
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    const processing = screen.getByRole('button', { name: 'Procesando…' });
    expect(processing).toBeDisabled();
    await user.click(processing);
    expect(fetchMock().mock.calls.filter(([url]) => url === '/api/auth/login')).toHaveLength(1);
    response.resolve(json(session));
    expect(await screen.findByRole('heading', { name: 'Mis préstamos' })).toBeInTheDocument();
  });

  it('permite mostrar y ocultar la contraseña', async () => {
    const user = renderLogin();
    const password = screen.getByLabelText('Contraseña');
    expect(password).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(password).toHaveAttribute('type', 'text');
    await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(password).toHaveAttribute('type', 'password');
  });

  it('registra una cuenta desde el formulario y entra a la biblioteca', async () => {
    const user = renderLogin();
    fetchMock().mockResolvedValueOnce(json(session, 201));
    await user.click(screen.getByRole('button', { name: 'Crear una cuenta' }));
    await user.type(screen.getByLabelText('Nombre'), 'Estudiante');
    await user.type(screen.getByLabelText('Correo electrónico'), 'student@example.com');
    await user.type(screen.getByLabelText('Contraseña'), 'a-test-password');
    await waitFor(() => expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeEnabled());
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    expect(await screen.findByRole('heading', { name: 'Mis préstamos' })).toBeInTheDocument();
    expect(fetchMock().mock.calls.some(([url]) => url === '/api/auth/register')).toBe(true);
  });

  it('descarta destinos externos y dirige a los préstamos', async () => {
    const user = renderLogin('//outside.example');
    fetchMock().mockResolvedValueOnce(json(session));
    await fillCredentials(user);
    await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }));
    expect(await screen.findByRole('heading', { name: 'Mis préstamos' })).toBeInTheDocument();
  });
});
