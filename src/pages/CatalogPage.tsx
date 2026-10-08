import { useCatalog } from '../hooks/useCatalog';
import { BookCard } from '../components/catalog/BookCard';
import { ResourceState } from '../components/ResourceState';
import { CatalogFilters } from '../components/catalog/CatalogFilters';
import styles from './CatalogPage.module.css';

export default function CatalogPage() {
  const catalog = useCatalog();
  const { page, data, loading, error, reload, update, pageCount, reset } = catalog;

  return (
    <>
      <div className={styles.heading}>
        <h1>Catálogo de libros</h1>
        <p>Encuentra tu próxima lectura en la biblioteca universitaria.</p>
      </div>
      <CatalogFilters {...catalog} />
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
