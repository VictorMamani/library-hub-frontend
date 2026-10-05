import type { Session } from '../types';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

let session: Session | null = null;
let refreshPending: Promise<Session | null> | null = null;
const listeners = new Set<() => void>();

export const getSession = () => session;
export function subscribeSession(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function setSession(next: Session | null) {
  session = next;
  listeners.forEach((listener) => listener());
}

export async function request<T>(
  path: string,
  options: RequestInit = {},
  authenticated = false,
  retry = true,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('X-Library-Client', 'web');
  if (options.body) headers.set('Content-Type', 'application/json');
  if (authenticated && session) headers.set('Authorization', `Bearer ${session.accessToken}`);
  let response: Response;
  try {
    response = await fetch(`/api${path}`, { ...options, headers, credentials: 'include' });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiError('No se pudo conectar con la biblioteca. Intenta nuevamente.', 0);
  }
  if (response.status === 401 && authenticated && retry) {
    if (await refreshSession()) return request<T>(path, options, authenticated, false);
  }
  if (!response.ok) {
    const body: { message?: unknown } = await response.json().catch(() => ({}));
    const message =
      typeof body.message === 'string'
        ? body.message
        : Array.isArray(body.message)
          ? 'Revisa los datos del formulario.'
          : 'No se pudo completar la solicitud.';
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export function refreshSession(): Promise<Session | null> {
  refreshPending ??= request<Session | undefined>('/auth/refresh', { method: 'POST' }, false, false)
    .then((next) => {
      const restored = next ?? null;
      setSession(restored);
      return restored;
    })
    .catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        setSession(null);
        return null;
      }
      throw error;
    })
    .finally(() => {
      refreshPending = null;
    });
  return refreshPending;
}

export async function signIn(email: string, password: string) {
  setSession(
    await request<Session>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  );
}

export async function signUp(name: string, email: string, password: string) {
  setSession(
    await request<Session>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),
  );
}

export async function signOut() {
  await request<void>('/auth/logout', { method: 'POST' });
  setSession(null);
}
