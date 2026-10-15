import { useSearchParams } from 'react-router-dom';
import type { CatalogPage as CatalogData } from '../types';
import { useResource } from './useResource';

export function useCatalog() {
  const [parameters, setParameters] = useSearchParams();
  const query = parameters.get('q') ?? '';
  const author = parameters.get('author') ?? '';
  const rawCategory = parameters.get('category') ?? '';
  const category = ['', 'fiction', 'science', 'history', 'computers'].includes(rawCategory)
    ? rawCategory
    : '';
  const rawSort = parameters.get('sort') ?? 'relevance';
  const sort = ['relevance', 'new', 'old', 'popular', 'author'].includes(rawSort)
    ? rawSort
    : 'relevance';
  const rawPage = Number(parameters.get('page') ?? 1);
  const page = Number.isInteger(rawPage) ? Math.min(10000, Math.max(1, rawPage)) : 1;
  const apiParameters = new URLSearchParams({
    q: query.slice(0, 200),
    author: author.slice(0, 200),
    category,
    sort,
    page: String(page),
  });
  const { data, loading, error, reload } = useResource<CatalogData>(`/books?${apiParameters}`);

  function update(key: string, value: string) {
    const next = new URLSearchParams(parameters);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParameters(next);
  }
  function submit(search: string, authorSearch: string) {
    const next = new URLSearchParams(parameters);
    for (const [key, value] of [
      ['q', search.trim()],
      ['author', authorSearch.trim()],
    ]) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete('page');
    setParameters(next);
  }
  const pageCount = data ? Math.min(10000, Math.max(1, Math.ceil(data.total / data.pageSize))) : 1;

  return {
    query,
    author,
    category,
    sort,
    page,
    data,
    loading,
    error,
    reload,
    update,
    submit,
    pageCount,
    reset: () => setParameters({}),
  };
}
