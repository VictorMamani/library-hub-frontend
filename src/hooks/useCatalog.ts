import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { CatalogPage as CatalogData } from '../types';
import { useResource } from './useResource';

export function useCatalog() {
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

  return {
    query,
    category,
    sort,
    page,
    search,
    setSearch,
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
