import type { Book, Loan, LoansOverview, Session } from '../src/types';

export const session: Session = {
  user: { id: 'student-id', name: 'Estudiante', email: 'student@example.com' },
  accessToken: 'test-access-token',
};

export const book: Book = {
  id: 'OL123W',
  title: 'El principito',
  authors: ['Antoine de Saint-Exupéry'],
  coverId: 123,
  publicationYear: 1943,
  subjects: ['Ficción'],
  description: 'Una historia sobre la amistad.',
  available: true,
};

export const loan: Loan = {
  id: 'loan-id',
  borrowedAt: '2026-10-01T12:00:00Z',
  dueAt: '2099-10-22T12:00:00Z',
  returnedAt: null,
  book,
};

export const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export const fetchMock = () => jest.mocked(globalThis.fetch);

export function overview(loans: Loan[]): LoansOverview {
  return {
    active: loans.filter((loan) => !loan.returnedAt),
    history: {
      items: loans.filter((loan) => loan.returnedAt),
      total: loans.filter((loan) => loan.returnedAt).length,
      page: 1,
      pageSize: 10,
    },
  };
}

export function mockBookRequests(...replies: Array<Response | Promise<Response>>) {
  fetchMock().mockImplementation((input) => {
    const path = String(input);
    if (path.startsWith('/api/reading?'))
      return Promise.resolve(json({ items: [], total: 0, page: 1, pageSize: 10 }));
    if (path.startsWith('/api/reservations/book/'))
      return Promise.resolve(json({ reservation: null, borrowedByMe: false }));
    if (path.startsWith('/api/reading/')) return Promise.resolve(json({ status: 'none' }));
    const next = replies.shift();
    return next
      ? Promise.resolve(next)
      : Promise.reject(new Error(`Solicitud sin simular: ${path}`));
  });
}

export function mockLoanRequests(...replies: Array<Response | Promise<Response>>) {
  fetchMock().mockImplementation((input) => {
    const path = String(input);
    if (path.startsWith('/api/reading?'))
      return Promise.resolve(json({ items: [], total: 0, page: 1, pageSize: 10 }));
    if (path.startsWith('/api/reservations?'))
      return Promise.resolve(json({ items: [], total: 0, page: 1, pageSize: 10 }));
    const next = replies.shift();
    return next
      ? Promise.resolve(next)
      : Promise.reject(new Error(`Solicitud sin simular: ${path}`));
  });
}

export function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
