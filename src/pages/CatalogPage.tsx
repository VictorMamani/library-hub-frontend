import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { CatalogPage as CatalogData } from '../types';
import { useResource } from '../hooks/useResource';
import { BookCover } from '../components/BookCover';
import { ResourceState } from '../components/ResourceState';
import searchIcon from '../assets/search.svg';
import styles from './CatalogPage.module.css';

export default function CatalogPage() {
  const [parameters, setParameters] = useSearchParams();
  const query = parameters.get('q') ?? '';
  const category = parameters.get('category') ?? '';
  const sort = parameters.get('sort') ?? 'relevance';
  const page = Math.max(1, Number(parameters.get('page')) || 1);
  const [search, setSearch] = useState(query);
  useEffect(() => setSearch(query), [query]);
  const apiParameters = new URLSearchParams({ q: query, category, sort, page: String(page) });
  const { data, loading, error, reload } = useResource<CatalogData>(`/books?${apiParameters}`);

  function update(key: string, value: string) {
    const next = new URLSearchParams(parameters);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParameters(next);
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    update('q', search.trim());
  }
  const pageCount = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <div className={styles.heading}>
        <h1>Catálogo de libros</h1>
        <p>Encuentra tu próxima lectura en la biblioteca universitaria.</p>
      </div>
      <section
        className={styles.searchPanel}
        aria-label="Buscar y filtrar libros"
      >
        <form
          onSubmit={submit}
          className={styles.searchForm}
          role="search"
        >
          <div className={styles.searchInput}>
            <img
              src={searchIcon}
              alt=""
            />
            <label
              className="sr-only"
              htmlFor="book-search"
            >
              Título, autor o palabra clave
            </label>
            <input
              id="book-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              maxLength={200}
              placeholder="Título, autor o palabra clave"
            />
          </div>
          <button
            className="button"
            type="submit"
          >
            Buscar libros
          </button>
        </form>
        <div className={styles.filters}>
          <div className={styles.filter}>
            <label htmlFor="book-category">Categoría</label>
            <select
              id="book-category"
              value={category}
              onChange={(event) => update('category', event.target.value)}
            >
              <option value="">Todas las categorías</option>
              <option value="fiction">Ficción</option>
              <option value="science">Ciencia</option>
              <option value="history">Historia</option>
              <option value="computers">Informática</option>
            </select>
          </div>
          <div className={styles.filter}>
            <label htmlFor="book-sort">Ordenar por</label>
            <select
              id="book-sort"
              value={sort}
              onChange={(event) => update('sort', event.target.value)}
            >
              <option value="relevance">Relevancia</option>
              <option value="new">Publicación más reciente</option>
              <option value="old">Publicación más antigua</option>
            </select>
          </div>
          <p
            className={styles.resultCount}
            role="status"
          >
            {loading
              ? 'Buscando libros…'
              : data
                ? `${data.total.toLocaleString('es-BO')} resultados`
                : 'Catálogo no disponible'}
          </p>
        </div>
        {!query && !category && (
          <p className={styles.initialSelection}>
            Selección inicial de informática. Usa el buscador para explorar otros temas.
          </p>
        )}
      </section>
      {loading || error ? (
        <ResourceState
          loading={loading}
          error={error}
          retry={reload}
        />
      ) : (
        data && (
          <>
            {data.books.length ? (
              <section
                className={styles.grid}
                aria-label="Resultados del catálogo"
              >
                {data.books.map((book) => (
                  <article
                    className={styles.book}
                    key={book.id}
                  >
                    <Link
                      className={styles.coverLink}
                      to={`/books/${book.id}`}
                      aria-label={`Ver ${book.title}`}
                    >
                      <BookCover
                        coverId={book.coverId}
                        title={book.title}
                      />
                    </Link>
                    <div className={styles.bookText}>
                      <h2>
                        <Link to={`/books/${book.id}`}>{book.title}</Link>
                      </h2>
                      <p>{book.authors.join(', ') || 'Autor no disponible'}</p>
                    </div>
                    <div className={styles.bookMeta}>
                      <span>{book.publicationYear ?? 'Fecha no disponible'}</span>
                      <span className={book.available ? styles.available : styles.unavailable}>
                        {book.available ? 'Disponible' : 'Prestado'}
                      </span>
                    </div>
                    <Link
                      className="button secondary"
                      to={`/books/${book.id}`}
                    >
                      Ver detalles
                    </Link>
                  </article>
                ))}
              </section>
            ) : (
              <section className={styles.empty}>
                <h2>No encontramos libros</h2>
                <p>Prueba con otra palabra clave o cambia la categoría.</p>
                <button
                  className="button secondary"
                  onClick={() => setParameters({})}
                >
                  Restablecer búsqueda
                </button>
              </section>
            )}
            {data.books.length > 0 && (
              <nav
                className={styles.pagination}
                aria-label="Páginas del catálogo"
              >
                <button
                  className="button secondary"
                  disabled={page <= 1}
                  onClick={() => update('page', String(page - 1))}
                >
                  Anterior
                </button>
                <span>
                  Página {page} de {pageCount.toLocaleString('es-BO')}
                </span>
                <button
                  className="button secondary"
                  disabled={page >= pageCount}
                  onClick={() => update('page', String(page + 1))}
                >
                  Siguiente
                </button>
              </nav>
            )}
          </>
        )
      )}
    </>
  );
}
