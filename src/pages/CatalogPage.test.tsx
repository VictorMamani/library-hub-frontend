import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { book, deferred, fetchMock, json } from '../../tests/fixtures';
import CatalogPage from './CatalogPage';
import BookPage from './BookPage';

const catalog = { books: [book], total: 30, page: 1, pageSize: 12 };

function renderCatalog(path = '/') {
  render(
    <MemoryRouter initialEntries={[path]}>
      <AuthContext.Provider value={{ user: null, initializing: false, sessionError: null }}>
        <Routes>
          <Route
            path="/"
            element={<CatalogPage />}
          />
          <Route
            path="/books/:bookId"
            element={<BookPage />}
          />
        </Routes>
      </AuthContext.Provider>
    </MemoryRouter>,
  );
  return userEvent.setup();
}

describe('Exploración del catálogo', () => {
  it('aplica autor y palabras clave, reinicia la página y conserva los filtros al volver del detalle', async () => {
    fetchMock().mockImplementation((input) =>
      Promise.resolve(json(String(input).startsWith('/api/books?') ? catalog : book)),
    );
    const user = renderCatalog('/?category=science&page=2');
    await screen.findByRole('link', { name: 'Ver detalles' });
    await user.type(
      screen.getByRole('searchbox', { name: 'Título, autor o palabra clave' }),
      'amistad',
    );
    await user.type(screen.getByRole('searchbox', { name: 'Filtrar por autor' }), 'Saint-Exupéry');
    await user.click(screen.getByRole('button', { name: 'Buscar libros' }));
    const parameters = await waitFor(() => {
      const call = fetchMock()
        .mock.calls.map(([path]) => String(path))
        .find((path) => path.includes('author=Saint-Exup'));
      expect(call).toBeDefined();
      return new URL(call!, 'http://localhost').searchParams;
    });
    expect(parameters.get('q')).toBe('amistad');
    expect(parameters.get('category')).toBe('science');
    expect(parameters.get('page')).toBe('1');
    await user.click(await screen.findByRole('link', { name: 'Ver detalles' }));
    const back = await screen.findByRole('link', { name: 'Volver al catálogo' });
    const href = new URL(back.getAttribute('href')!, 'http://localhost');
    expect(href.searchParams.get('author')).toBe('Saint-Exupéry');
    expect(href.searchParams.get('q')).toBe('amistad');
    expect(href.searchParams.get('category')).toBe('science');
  });

  it('conserva la paginación durante carga y enfoca resultados después de la respuesta', async () => {
    const pending = deferred<Response>();
    fetchMock().mockResolvedValueOnce(json(catalog)).mockReturnValueOnce(pending.promise);
    const user = renderCatalog();
    await screen.findByRole('link', { name: 'Ver detalles' });
    const next = screen.getByRole('button', { name: 'Siguiente' });
    await user.click(next);
    expect(screen.getByRole('button', { name: 'Siguiente' })).toBe(next);
    expect(next).toBeDisabled();
    pending.resolve(json({ ...catalog, page: 2 }));
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Resultados del catálogo' })).toHaveFocus(),
    );
    expect(screen.getByText('Página 2 de 3')).toBeInTheDocument();
  });

  it('normaliza página, categoría y orden no válidos de la URL antes de consultar', async () => {
    fetchMock().mockResolvedValue(json(catalog));
    renderCatalog('/?page=1.5&category=bad&sort=invalid');
    await screen.findByRole('link', { name: 'Ver detalles' });
    const parameters = new URL(String(fetchMock().mock.calls[0][0]), 'http://localhost')
      .searchParams;
    expect(parameters.get('page')).toBe('1');
    expect(parameters.get('category')).toBe('');
    expect(parameters.get('sort')).toBe('relevance');
    expect(screen.getByRole('option', { name: 'Autor A–Z' })).toBeInTheDocument();
  });

  it('aplica el orden por autor desde la página inicial y explica el límite de la selección', async () => {
    fetchMock().mockImplementation(() =>
      Promise.resolve(json({ ...catalog, total: 200, matchedTotal: 5000, authorSortLimit: 200 })),
    );
    const user = renderCatalog('/?q=historia&page=2');
    await screen.findByRole('link', { name: 'Ver detalles' });
    await user.selectOptions(screen.getByLabelText('Ordenar por'), 'author');
    await waitFor(() => {
      const paths = fetchMock().mock.calls.map(([input]) => String(input));
      expect(paths.some((path) => path.includes('sort=author&page=1'))).toBe(true);
    });
    expect(screen.getByText(/Se ordena una selección de hasta 200/)).toBeInTheDocument();
  });

  it('escribir mantiene los resultados actuales sin pedir datos hasta enviar el formulario', async () => {
    fetchMock().mockImplementation(() => Promise.resolve(json(catalog)));
    const user = renderCatalog('/?q=original&author=Primero');
    await screen.findByRole('link', { name: 'Ver detalles' });
    const count = fetchMock().mock.calls.length;
    await user.type(
      screen.getByRole('searchbox', { name: 'Título, autor o palabra clave' }),
      ' nuevo',
    );
    await user.type(screen.getByRole('searchbox', { name: 'Filtrar por autor' }), ' segundo');
    expect(fetchMock()).toHaveBeenCalledTimes(count);
    expect(screen.getByRole('link', { name: 'Ver detalles' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Buscar libros' }));
    await waitFor(() => expect(fetchMock()).toHaveBeenCalledTimes(count + 1));
    const parameters = new URL(String(fetchMock().mock.calls.at(-1)![0]), 'http://localhost')
      .searchParams;
    expect(parameters.get('q')).toBe('original nuevo');
    expect(parameters.get('author')).toBe('Primero segundo');
  });
});
