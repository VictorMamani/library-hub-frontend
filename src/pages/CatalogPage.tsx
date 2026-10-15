import { useCatalog } from '../hooks/useCatalog';
import { usePageTitle } from '../hooks/usePageTitle';
import { useResultsFocus } from '../hooks/useResultsFocus';
import { BookCard } from '../components/catalog/BookCard';
import { ResourceState } from '../components/ResourceState';
import { CatalogFilters } from '../components/catalog/CatalogFilters';
import styles from './CatalogPage.module.css';

export default function CatalogPage() {
  const catalog = useCatalog();
  const { page, data, loading, error, reload, update, pageCount, reset } = catalog;
  usePageTitle('Catálogo');
  const currentQuery = `${catalog.query}|${catalog.author}|${catalog.category}|${catalog.sort}|${page}`;
  const results = useResultsFocus(currentQuery, loading);

  return (
    <>
      <div className={styles.heading}>
        <h1>Catálogo de libros</h1>
        <p>Encuentra tu próxima lectura en la biblioteca universitaria.</p>
      </div>
      <CatalogFilters {...catalog} />
      <div className={styles.resultsHeader}>
        <h2
          className={styles.resultsHeading}
          ref={results}
          tabIndex={-1}
        >
          Resultados del catálogo
        </h2>
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
                  <BookCard
                    key={book.id}
                    book={book}
                  />
                ))}
              </section>
            ) : (
              <section className={styles.empty}>
                <h2>No encontramos libros</h2>
                <p>Prueba con otra palabra clave o cambia la categoría.</p>
                <button
                  className="button secondary"
                  onClick={reset}
                >
                  Restablecer búsqueda
                </button>
              </section>
            )}
          </>
        )
      )}
      <nav
        className={styles.pagination}
        aria-label="Páginas del catálogo"
      >
        <button
          className="button secondary"
          disabled={loading || page <= 1}
          onClick={() => update('page', String(page - 1))}
        >
          Anterior
        </button>
        <span>
          Página {page}
          {data && ` de ${pageCount.toLocaleString('es-BO')}`}
        </span>
        <button
          className="button secondary"
          disabled={loading || !data || page >= pageCount}
          onClick={() => update('page', String(page + 1))}
        >
          Siguiente
        </button>
      </nav>
    </>
  );
}
