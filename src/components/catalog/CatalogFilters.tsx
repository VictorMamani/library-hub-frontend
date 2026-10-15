import type { useCatalog } from '../../hooks/useCatalog';
import { useEffect, useState } from 'react';
import searchIcon from '../../assets/search.svg';
import styles from '../../pages/CatalogPage.module.css';

type CatalogFiltersProps = Pick<
  ReturnType<typeof useCatalog>,
  'query' | 'author' | 'category' | 'sort' | 'submit' | 'update' | 'data'
>;

export function CatalogFilters({
  query,
  author,
  category,
  sort,
  submit,
  update,
  data,
}: CatalogFiltersProps) {
  const [search, setSearch] = useState(query);
  const [authorSearch, setAuthorSearch] = useState(author);
  useEffect(() => setSearch(query), [query]);
  useEffect(() => setAuthorSearch(author), [author]);
  const [filtersOpen, setFiltersOpen] = useState(() => window.innerWidth >= 680);
  return (
    <section
      className={styles.searchPanel}
      aria-label="Buscar y filtrar libros"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(search, authorSearch);
        }}
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
        <div className={styles.authorInput}>
          <label
            className="sr-only"
            htmlFor="author-search"
          >
            Filtrar por autor
          </label>
          <input
            id="author-search"
            type="search"
            value={authorSearch}
            onChange={(event) => setAuthorSearch(event.target.value)}
            maxLength={200}
            placeholder="Autor (opcional)"
          />
        </div>
        <button
          className="button"
          type="submit"
        >
          Buscar libros
        </button>
      </form>
      <details
        className={styles.filterDisclosure}
        open={filtersOpen}
        onToggle={(event) => setFiltersOpen(event.currentTarget.open)}
      >
        <summary>
          Filtros y orden
          {category &&
            ` · ${({ fiction: 'Ficción', science: 'Ciencia', history: 'Historia', computers: 'Informática' } as Record<string, string>)[category]}`}
          {sort !== 'relevance' && ' · Orden aplicado'}
        </summary>
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
              <option value="popular">Popularidad · registros de lectura</option>
              <option value="author">Autor A–Z</option>
            </select>
          </div>
        </div>
      </details>
      {!query && !category && !author && (
        <p className={styles.initialSelection}>
          Selección inicial de informática. Usa el buscador para explorar otros temas.
        </p>
      )}
      {sort === 'popular' && (
        <p className={styles.initialSelection}>
          Popularidad según registros de lectura de Open Library, no según préstamos de esta
          biblioteca.
        </p>
      )}
      {sort === 'author' && (
        <p className={styles.initialSelection}>
          Orden A–Z por el primer autor mostrado; libros sin autor al final.
          {data && data.matchedTotal !== undefined && data.matchedTotal > data.total
            ? ` Se ordena una selección de hasta ${data.authorSortLimit ?? 200} resultados por relevancia de Open Library, de ${data.matchedTotal.toLocaleString('es-BO')} coincidencias. Afina la búsqueda para abarcar todos sus resultados.`
            : ' Se ordenan los resultados de la consulta antes de paginar.'}
        </p>
      )}
      {sort !== 'author' &&
        data &&
        data.matchedTotal !== undefined &&
        data.matchedTotal > data.total && (
          <p className={styles.initialSelection}>
            La consulta tiene {data.matchedTotal.toLocaleString('es-BO')} coincidencias; se pueden
            recorrer hasta {data.total.toLocaleString('es-BO')}. Afina la búsqueda.
          </p>
        )}
      <p className={styles.initialSelection}>
        Los datos provienen de Open Library. La disponibilidad corresponde al ejemplar académico de
        esta aplicación.
      </p>
    </section>
  );
}
