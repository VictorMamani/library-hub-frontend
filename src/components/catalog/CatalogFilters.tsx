import type { useCatalog } from '../../hooks/useCatalog';
import searchIcon from '../../assets/search.svg';
import styles from '../../pages/CatalogPage.module.css';

type CatalogFiltersProps = Pick<
  ReturnType<typeof useCatalog>,
  'query' | 'category' | 'sort' | 'search' | 'setSearch' | 'submit' | 'update' | 'loading' | 'data'
>;

export function CatalogFilters({
  query,
  category,
  sort,
  search,
  setSearch,
  submit,
  update,
  loading,
  data,
}: CatalogFiltersProps) {
  return (
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
  );
}
