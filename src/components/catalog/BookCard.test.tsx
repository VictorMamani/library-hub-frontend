import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { BookCard } from './BookCard';
import { book } from '../../../tests/fixtures';

describe('BookCard', () => {
  it('presenta disponibilidad y navega al detalle desde la acción del usuario', async () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route
            path="/"
            element={<BookCard book={book} />}
          />
          <Route
            path="/books/:id"
            element={<h1>Detalle del libro</h1>}
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'El principito' })).toBeInTheDocument();
    expect(screen.getByText('Disponible')).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('link', { name: 'Ver detalles' }));
    expect(screen.getByRole('heading', { name: 'Detalle del libro' })).toBeInTheDocument();
  });

  it('explica datos ausentes y un libro que ya está prestado', () => {
    render(
      <MemoryRouter>
        <BookCard
          book={{ ...book, authors: [], publicationYear: null, coverId: null, available: false }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText('Autor no disponible')).toBeInTheDocument();
    expect(screen.getByText('Fecha no disponible')).toBeInTheDocument();
    expect(screen.getByText('Portada no disponible')).toBeInTheDocument();
    expect(screen.getByText('Prestado')).toBeInTheDocument();
  });

  it('sustituye una portada que falla sin perder la información del libro', () => {
    render(
      <MemoryRouter>
        <BookCard book={book} />
      </MemoryRouter>,
    );
    fireEvent.error(screen.getByRole('img', { name: 'Portada de El principito' }));
    expect(screen.getByText('Portada no disponible')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'El principito' })).toBeInTheDocument();
  });
});
