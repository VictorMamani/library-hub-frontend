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
}
export interface CatalogPage {
  books: Book[];
  total: number;
  page: number;
  pageSize: number;
}
export interface Loan {
  id: string;
  borrowedAt: string;
  dueAt: string;
  returnedAt: string | null;
  book: Pick<Book, 'id' | 'title' | 'authors' | 'coverId'>;
}
