import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useLogout } from './useLogout';
import { getSession, setSession } from '../services/api';
import { fetchMock, session } from '../../tests/fixtures';

function Wrapper({ children }: { children: ReactNode }) {
  return <MemoryRouter initialEntries={['/profile']}>{children}</MemoryRouter>;
}

describe('useLogout', () => {
  it('revoca la sesión y vuelve al catálogo', async () => {
    setSession(session);
    fetchMock().mockResolvedValueOnce(new Response(null, { status: 204 }));
    const { result } = renderHook(() => ({ logout: useLogout(), location: useLocation() }), {
      wrapper: Wrapper,
    });
    await act(async () => result.current.logout.logout());
    expect(getSession()).toBeNull();
    expect(result.current.location.pathname).toBe('/');
    expect(result.current.logout.error).toBeNull();
    expect(result.current.logout.busy).toBe(false);
  });

  it('mantiene al usuario en su página y comunica un fallo de red', async () => {
    setSession(session);
    fetchMock().mockRejectedValueOnce(new TypeError('Network error'));
    const { result } = renderHook(() => ({ logout: useLogout(), location: useLocation() }), {
      wrapper: Wrapper,
    });
    await act(async () => result.current.logout.logout());
    expect(result.current.logout.error).toMatch(/No se pudo conectar/);
    expect(result.current.location.pathname).toBe('/profile');
    expect(getSession()).toEqual(session);
    expect(result.current.logout.busy).toBe(false);
  });
});
