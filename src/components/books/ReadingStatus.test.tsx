import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setSession } from '../../services/api';
import { fetchMock, json, session } from '../../../tests/fixtures';
import { ReadingStatus } from './ReadingStatus';

describe('Seguimiento personal de lectura', () => {
  it('guarda la lista de deseos con autorización y muestra el estado persistido', async () => {
    setSession(session);
    fetchMock()
      .mockResolvedValueOnce(json({ status: 'none' }))
      .mockResolvedValueOnce(json({ status: 'wishlist' }))
      .mockResolvedValueOnce(json({ status: 'wishlist' }));
    render(<ReadingStatus bookId="OL123W" />);
    const user = userEvent.setup();
    await user.selectOptions(
      await screen.findByRole('combobox', { name: 'Estado de lectura' }),
      'wishlist',
    );
    await user.click(screen.getByRole('button', { name: 'Guardar estado' }));
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('wishlist'));
    expect(screen.getByRole('status')).toHaveTextContent('Estado de lectura guardado.');
    const call = fetchMock().mock.calls.find(([, options]) => options?.method === 'POST');
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({ status: 'wishlist' });
    expect(new Headers(call?.[1]?.headers).get('Authorization')).toBe('Bearer test-access-token');
  });

  it('conserva la elección ante un fallo del servidor y permite reintentar', async () => {
    setSession(session);
    fetchMock()
      .mockResolvedValueOnce(json({ status: 'reading' }))
      .mockResolvedValueOnce(json({ message: 'No se pudo guardar.' }, 503))
      .mockResolvedValueOnce(json({ status: 'completed' }))
      .mockResolvedValueOnce(json({ status: 'completed' }));
    render(<ReadingStatus bookId="OL123W" />);
    const user = userEvent.setup();
    await user.selectOptions(await screen.findByRole('combobox'), 'completed');
    await user.click(screen.getByRole('button', { name: 'Guardar estado' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo guardar.');
    expect(screen.getByRole('combobox')).toHaveValue('completed');
    await user.click(screen.getByRole('button', { name: 'Guardar estado' }));
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('completed'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
