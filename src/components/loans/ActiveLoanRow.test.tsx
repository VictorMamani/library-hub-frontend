import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ActiveLoanRow } from './ActiveLoanRow';
import { loan } from '../../../tests/fixtures';

describe('ActiveLoanRow', () => {
  it('muestra el libro y permite devolver el préstamo correcto', async () => {
    const returnLoan = jest.fn().mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <ul>
          <ActiveLoanRow
            loan={loan}
            pending={null}
            returnLoan={returnLoan}
          />
        </ul>
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: 'El principito' })).toHaveAttribute(
      'href',
      '/books/OL123W',
    );
    expect(screen.getByText('Antoine de Saint-Exupéry')).toBeInTheDocument();
    expect(screen.queryByText(/Vencido/)).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Devolver libro' }));
    expect(returnLoan).toHaveBeenCalledWith('loan-id');
    expect(returnLoan).toHaveBeenCalledTimes(1);
  });

  it('muestra el vencimiento de un préstamo atrasado', () => {
    render(
      <MemoryRouter>
        <ul>
          <ActiveLoanRow
            loan={{ ...loan, dueAt: '2000-01-01T12:00:00Z' }}
            pending={null}
            returnLoan={jest.fn()}
          />
        </ul>
      </MemoryRouter>,
    );
    expect(screen.getByText(/Vencido/)).toBeInTheDocument();
  });

  it.each(['loan-id', 'another-loan'])(
    'impide otra devolución cuando está pendiente %s',
    async (pending) => {
      const returnLoan = jest.fn();
      render(
        <MemoryRouter>
          <ul>
            <ActiveLoanRow
              loan={loan}
              pending={pending}
              returnLoan={returnLoan}
            />
          </ul>
        </MemoryRouter>,
      );
      const button = screen.getByRole('button', {
        name: pending === loan.id ? 'Devolviendo…' : 'Devolver libro',
      });
      expect(button).toBeDisabled();
      await userEvent.setup().click(button);
      expect(returnLoan).not.toHaveBeenCalled();
    },
  );
});
