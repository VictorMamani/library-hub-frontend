import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, getSession, request, setSession } from './api';

const user = { id: 'user-id', name: 'Estudiante', email: 'student@example.com' };
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

afterEach(() => {
  setSession(null);
  vi.unstubAllGlobals();
});

describe('Cliente de API', () => {
  it('renueva una sola vez ante solicitudes simultáneas con access token vencido', async () => {
    setSession({ user, accessToken: 'expired-token' });
    const refresh = vi.fn();
    const mockFetch = vi.fn(async (url: string, options: RequestInit) => {
      if (url.endsWith('/auth/refresh')) {
        refresh();
        return json({ user, accessToken: 'new-token' });
      }
      const headers = new Headers(options.headers);
      return headers.get('Authorization') === 'Bearer new-token'
        ? json([])
        : json({ message: 'Sesión vencida' }, 401);
    });
    vi.stubGlobal('fetch', mockFetch);
    const results = await Promise.all([request('/loans', {}, true), request('/loans', {}, true)]);
    expect(results).toEqual([[], []]);
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(getSession()?.accessToken).toBe('new-token');
  });

  it('elimina la sesión local si la renovación fue rechazada', async () => {
    setSession({ user, accessToken: 'expired-token' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(json({ message: 'Sesión terminada' }, 401)));
    await expect(request('/loans', {}, true)).rejects.toBeInstanceOf(ApiError);
    expect(getSession()).toBeNull();
  });

  it('conserva la sesión ante un fallo transitorio del servidor', async () => {
    setSession({ user, accessToken: 'expired-token' });
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockImplementation((url: string) =>
          Promise.resolve(
            url.endsWith('/auth/refresh')
              ? json({ message: 'Servicio no disponible' }, 503)
              : json({}, 401),
          ),
        ),
    );
    await expect(request('/loans', {}, true)).rejects.toThrow('Servicio no disponible');
    expect(getSession()?.user.id).toBe(user.id);
  });
});
