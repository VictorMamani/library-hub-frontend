import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { setSession } from '../services/api';
import LoansPage from './LoansPage';
import {
  deferred,
  fetchMock,
  json,
  loan,
  session,
  overview,
  mockLoanRequests,
} from '../../tests/fixtures';

function renderLoans() {
  setSession(session);
  render(
    <MemoryRouter>
      <AuthContext.Provider value={{ user: session.user, initializing: false, sessionError: null }}>
        <LoansPage />
      </AuthContext.Provider>
    </MemoryRouter>,
  );
  return userEvent.setup();
}

describe('LoansPage y useLoans con el cliente HTTP real', () => {
  it('muestra un estado vacío y permite explorar el catálogo', async () => {
    mockLoanRequests(json(overview([])));
    renderLoans();
    expect(await screen.findByText('Aún no tienes préstamos activos.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explorar el catálogo' })).toHaveAttribute('href', '/');
    expect(screen.getByText('Aquí aparecerán los libros que devuelvas.')).toBeInTheDocument();
  });

  it('devuelve el libro con Bearer y lo conserva en el historial', async () => {
    mockLoanRequests(
      json(overview([loan])),
      new Response(null, { status: 204 }),
      json(overview([{ ...loan, returnedAt: '2026-10-11T12:00:00Z' }])),
    );
    const user = renderLoans();
    await user.click(await screen.findByRole('button', { name: 'Devolver libro' }));
    expect(await screen.findByText('Aún no tienes préstamos activos.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(
      'Libro devuelto. El préstamo se conserva en tu historial.',
    );
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Préstamos activos' })).toHaveFocus(),
    );
    const history = screen
      .getByRole('heading', { name: 'Historial de préstamos' })
      .closest('section');
    expect(within(history!).getByRole('link', { name: 'El principito' })).toBeInTheDocument();
    const call = fetchMock().mock.calls.find(([url]) => url === '/api/loans/loan-id/return');
    expect(call?.[1]?.method).toBe('POST');
    expect(new Headers(call?.[1]?.headers).get('Authorization')).toBe('Bearer test-access-token');
  });

  it('bloquea una devolución repetida mientras espera al servidor', async () => {
    const pending = deferred<Response>();
    mockLoanRequests(json(overview([loan])), pending.promise, json(overview([])));
    const user = renderLoans();
    await user.click(await screen.findByRole('button', { name: 'Devolver libro' }));
    const processing = screen.getByRole('button', { name: 'Devolviendo…' });
    expect(processing).toBeDisabled();
    await user.click(processing);
    expect(
      fetchMock().mock.calls.filter(([url]) => url === '/api/loans/loan-id/return'),
    ).toHaveLength(1);
    pending.resolve(new Response(null, { status: 204 }));
    expect(await screen.findByText('Aún no tienes préstamos activos.')).toBeInTheDocument();
  });

  it('mantiene el préstamo activo si la devolución falla y permite reintentar', async () => {
    mockLoanRequests(
      json(overview([loan])),
      json({ message: 'No se pudo devolver el libro.' }, 503),
    );
    const user = renderLoans();
    await user.click(await screen.findByRole('button', { name: 'Devolver libro' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo devolver el libro.');
    expect(screen.getByRole('button', { name: 'Devolver libro' })).toBeEnabled();
    mockLoanRequests(new Response(null, { status: 204 }), json(overview([])));
    await user.click(screen.getByRole('button', { name: 'Devolver libro' }));
    expect(await screen.findByText('Aún no tienes préstamos activos.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('recupera una lista que falló al consultar la API', async () => {
    mockLoanRequests(json({ message: 'Servicio no disponible' }, 503));
    const user = renderLoans();
    expect(await screen.findByRole('alert')).toHaveTextContent('Servicio no disponible');
    mockLoanRequests(json(overview([loan])));
    await user.click(screen.getByRole('button', { name: 'Intentar nuevamente' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Devolver libro' })).toBeEnabled(),
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
