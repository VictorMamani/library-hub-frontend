import {
  ApiError,
  getSession,
  refreshSession,
  request,
  setSession,
  signIn,
  signOut,
  signUp,
} from './api';
import { fetchMock, json, session } from '../../tests/fixtures';

const user = { id: 'user-id', name: 'Estudiante', email: 'student@example.com' };
describe('Cliente de API', () => {
  it('renueva una sola vez ante solicitudes simultáneas con access token vencido', async () => {
    setSession({ user, accessToken: 'expired-token' });
    const refresh = jest.fn();
    fetchMock().mockImplementation(async (url, options) => {
      if (String(url).endsWith('/auth/refresh')) {
        refresh();
        return json({ user, accessToken: 'new-token' });
      }
      const headers = new Headers(options?.headers);
      return headers.get('Authorization') === 'Bearer new-token'
        ? json([])
        : json({ message: 'Sesión vencida' }, 401);
    });
    const results = await Promise.all([request('/loans', {}, true), request('/loans', {}, true)]);
    expect(results).toEqual([[], []]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(getSession()?.accessToken).toBe('new-token');
  });

  it('elimina la sesión local si la renovación fue rechazada', async () => {
    setSession({ user, accessToken: 'expired-token' });
    fetchMock().mockImplementation(async () => json({ message: 'Sesión terminada' }, 401));
    await expect(request('/loans', {}, true)).rejects.toBeInstanceOf(ApiError);
    expect(getSession()).toBeNull();
  });

  it('conserva la sesión ante un fallo transitorio del servidor', async () => {
    setSession({ user, accessToken: 'expired-token' });
    fetchMock().mockImplementation(async (url) =>
      String(url).endsWith('/auth/refresh')
        ? json({ message: 'Servicio no disponible' }, 503)
        : json({}, 401),
    );
    await expect(request('/loans', {}, true)).rejects.toThrow('Servicio no disponible');
    expect(getSession()?.user.id).toBe(user.id);
  });

  it('inicia sesión, guarda el JWT solo en memoria y lo envía a la API protegida', async () => {
    fetchMock().mockResolvedValueOnce(json(session)).mockResolvedValueOnce(json([]));
    await signIn('student@example.com', 'a-test-password');
    await request('/loans', {}, true);

    expect(getSession()).toEqual(session);
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
    const [url, options] = fetchMock().mock.calls[1];
    expect(url).toBe('/api/loans');
    expect(new Headers(options?.headers).get('Authorization')).toBe('Bearer test-access-token');
    expect(options?.credentials).toBe('include');
  });

  it('registra al usuario y establece la sesión devuelta por el backend', async () => {
    fetchMock().mockResolvedValueOnce(json(session, 201));
    await signUp('Estudiante', 'student@example.com', 'a-test-password');
    const [url, options] = fetchMock().mock.calls[0];
    expect(url).toBe('/api/auth/register');
    expect(JSON.parse(String(options?.body))).toEqual({
      name: 'Estudiante',
      email: 'student@example.com',
      password: 'a-test-password',
    });
    expect(new Headers(options?.headers).get('X-Library-Client')).toBe('web');
    expect(getSession()).toEqual(session);
  });

  it('no envía el JWT a rutas públicas', async () => {
    setSession(session);
    fetchMock().mockResolvedValueOnce(json([]));
    await request('/catalog');
    expect(new Headers(fetchMock().mock.calls[0][1]?.headers).has('Authorization')).toBe(false);
  });

  it('deja de reintentar cuando el servidor rechaza también el nuevo token', async () => {
    setSession(session);
    fetchMock()
      .mockResolvedValueOnce(json({}, 401))
      .mockResolvedValueOnce(json({ ...session, accessToken: 'renewed-token' }))
      .mockResolvedValueOnce(json({ message: 'Acceso rechazado' }, 401));
    await expect(request('/loans', {}, true)).rejects.toThrow('Acceso rechazado');
    expect(fetchMock()).toHaveBeenCalledTimes(3);
  });

  it('recupera una sesión usando la cookie al iniciar la aplicación', async () => {
    fetchMock().mockResolvedValueOnce(json(session));
    await expect(refreshSession()).resolves.toEqual(session);
    expect(fetchMock()).toHaveBeenCalledWith(
      '/api/auth/refresh',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
    expect(getSession()).toEqual(session);
  });

  it('continúa como visitante cuando no existe cookie de renovación', async () => {
    fetchMock().mockResolvedValueOnce(new Response(null, { status: 204 }));
    await expect(refreshSession()).resolves.toBeNull();
    expect(getSession()).toBeNull();
  });

  it('cierra sesión en servidor y elimina el JWT local después de la confirmación', async () => {
    setSession(session);
    fetchMock().mockResolvedValueOnce(new Response(null, { status: 204 }));
    await signOut();
    expect(fetchMock()).toHaveBeenCalledWith(
      '/api/auth/logout',
      expect.objectContaining({ method: 'POST', credentials: 'include' }),
    );
    expect(getSession()).toBeNull();
  });

  it('conserva la sesión y comunica el error si no puede confirmar el logout', async () => {
    setSession(session);
    fetchMock().mockRejectedValueOnce(new TypeError('Network error'));
    await expect(signOut()).rejects.toThrow('No se pudo conectar con la biblioteca');
    expect(getSession()).toEqual(session);
  });

  it('mantiene la cancelación de solicitudes sin convertirla en error de red', async () => {
    const abort = new DOMException('Aborted', 'AbortError');
    fetchMock().mockRejectedValueOnce(abort);
    await expect(request('/catalog')).rejects.toBe(abort);
  });
});
