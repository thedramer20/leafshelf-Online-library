import axios, { AxiosError } from 'axios';
import type { AdminStats, Book, Loan, User } from './types';

/**
 * Auth is via HttpSession cookies, not JWT.
 *   - Dev: Vite proxy forwards /api to Tomcat at :8080. Set-Cookie comes back through
 *          the proxy and is scoped to :5173, so subsequent requests include it.
 *   - Prod: same origin (WAR serves React + servlets together), so cookies work natively.
 *
 * `withCredentials: true` is required for the browser to attach cookies to XHR requests.
 */
export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export function apiErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const err = e as AxiosError<{ error?: string }>;
    return err.response?.data?.error ?? err.message ?? 'Something went wrong';
  }
  return 'Something went wrong';
}

// ====== Auth ======
export async function register(payload: { name: string; email: string; password: string }) {
  const { data } = await api.post<{ user: User }>('/auth/register', payload);
  return data.user;
}
export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post<{ user: User }>('/auth/login', payload);
  return data.user;
}
export async function logout() {
  await api.post('/auth/logout');
}
export async function me() {
  const { data } = await api.get<{ user: User }>('/auth/me');
  return data.user;
}

// ====== Books ======
export async function listBooks(params: { search?: string; category?: string } = {}) {
  const { data } = await api.get<{ books: Book[] }>('/books', { params });
  return data.books;
}
export async function getBook(id: number | string) {
  const { data } = await api.get<{ book: Book }>(`/books/${id}`);
  return data.book;
}
export async function listCategories() {
  const { data } = await api.get<{ categories: string[] }>('/books/categories');
  return data.categories;
}

// ====== Admin ======
export async function getAdminStats() {
  const { data } = await api.get<AdminStats>('/admin/stats');
  return data;
}

// ====== Loans ======
export async function myLoans() {
  const { data } = await api.get<{ loans: Loan[] }>('/loans/my-loans');
  return data.loans;
}
export async function borrow(bookId: number | string) {
  await api.post(`/loans/borrow/${bookId}`);
}
export async function returnLoan(loanId: number | string) {
  await api.post(`/loans/return/${loanId}`);
}
