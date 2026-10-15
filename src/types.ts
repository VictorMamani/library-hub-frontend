export interface User {
  id: string;
  name: string;
  email: string;
}
export interface Session {
  user: User;
  accessToken: string;
}
export interface Book {
  id: string;
  title: string;
  authors: string[];
  coverId: number | null;
  publicationYear: number | null;
  subjects: string[];
  description: string;
  available: boolean;
  availability?: 'available' | 'borrowed' | 'reserved';
  loanDays?: number;
  readingCount?: number;
}
export interface CatalogPage {
  books: Book[];
  total: number;
  page: number;
  pageSize: number;
  matchedTotal?: number;
  authorSortLimit?: number;
}
export interface Loan {
  id: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  book: Pick<Book, 'id' | 'title' | 'authors' | 'coverId'>;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface LoansOverview {
  active: Loan[];
  history: Paginated<Loan>;
}

export interface Reservation {
  id: string;
  createdAt: string;
  position: number;
  ready: boolean;
  book: Loan['book'];
}

export interface BookReservationState {
  reservation: Pick<Reservation, 'id' | 'position' | 'ready'> | null;
  borrowedByMe: boolean;
}

export type ReadingState = 'none' | 'wishlist' | 'reading' | 'completed';

export interface ReadingEntry {
  status: Exclude<ReadingState, 'none'>;
  updatedAt: string;
  book: Loan['book'];
}
