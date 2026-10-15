import { act, renderHook, waitFor } from '@testing-library/react';
import { useResource } from './useResource';
import { setSession } from '../services/api';
import { deferred, fetchMock, json, session } from '../../tests/fixtures';

describe('useResource con el cliente HTTP real', () => {
  it('pasa de carga a datos obtenidos desde la API', async () => {
    const response = deferred<Response>();
    fetchMock().mockReturnValueOnce(response.promise);
    const { result } = renderHook(() => useResource<string[]>('/catalog'));
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    await act(async () => response.resolve(json(['El principito'])));
    expect(result.current.data).toEqual(['El principito']);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('muestra un error HTTP y permite recuperarse al reintentar', async () => {
    fetchMock().mockResolvedValueOnce(json({ message: 'Servicio no disponible' }, 503));
    const { result } = renderHook(() => useResource<string[]>('/catalog'));
    await waitFor(() => expect(result.current.error).toBe('Servicio no disponible'));
    expect(result.current.loading).toBe(false);
    fetchMock().mockResolvedValueOnce(json(['Recuperado']));
    act(() => result.current.reload());
    await waitFor(() => expect(result.current.data).toEqual(['Recuperado']));
    expect(result.current.error).toBeNull();
  });

  it('comunica fallos de red de forma comprensible', async () => {
    fetchMock().mockRejectedValueOnce(new TypeError('Network error'));
    const { result } = renderHook(() => useResource('/catalog'));
    await waitFor(() => expect(result.current.error).toMatch(/No se pudo conectar/));
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('envía el token cuando obtiene información privada', async () => {
    setSession(session);
    fetchMock().mockResolvedValueOnce(json([]));
    const { result } = renderHook(() => useResource('/loans', true));
    await waitFor(() => expect(result.current.loading).toBe(false));
    const [url, options] = fetchMock().mock.calls[0];
    expect(url).toBe('/api/loans');
    expect(new Headers(options?.headers).get('Authorization')).toBe('Bearer test-access-token');
  });

  it('descarta la respuesta antigua cuando cambia el recurso solicitado', async () => {
    const old = deferred<Response>();
    fetchMock()
      .mockReturnValueOnce(old.promise)
      .mockResolvedValueOnce(json(['Nuevo libro']));
    const { result, rerender } = renderHook(({ path }) => useResource<string[]>(path), {
      initialProps: { path: '/catalog?q=old' },
    });
    rerender({ path: '/catalog?q=new' });
    await waitFor(() => expect(result.current.data).toEqual(['Nuevo libro']));
    await act(async () => old.resolve(json(['Libro anterior'])));
    expect(result.current.data).toEqual(['Nuevo libro']);
    expect(result.current.error).toBeNull();
  });

  it('cancela la solicitud al desmontarse', async () => {
    const response = deferred<Response>();
    fetchMock().mockReturnValueOnce(response.promise);
    const { unmount } = renderHook(() => useResource('/catalog'));
    const signal = fetchMock().mock.calls[0][1]?.signal;
    expect(signal?.aborted).toBe(false);
    unmount();
    expect(signal?.aborted).toBe(true);
    await act(async () => response.resolve(json([])));
  });
});
