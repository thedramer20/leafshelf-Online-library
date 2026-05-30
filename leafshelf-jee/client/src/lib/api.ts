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

const CACHE_PREFIX = 'leafshelf:cache:';
const USER_FIELDS = ['id', 'name', 'email', 'created_at'] as const;

function isUserShape(value: unknown): value is User {
  if (!value || typeof value !== 'object') return false;
  return USER_FIELDS.every(field => field in value);
}

function extractUser(payload: unknown): User | null {
  if (isUserShape(payload)) return payload;
  if (payload && typeof payload === 'object' && 'user' in payload) {
    const nested = (payload as { user?: unknown }).user;
    if (isUserShape(nested)) return nested;
  }
  return null;
}

async function resolveUserFromResponse(fetcher: () => Promise<unknown>) {
  const payload = await fetcher();
  const user = extractUser(payload);
  if (!user) {
    throw new Error('Unable to read the signed-in user from the server response');
  }
  return user;
}

export function readCached<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw || raw === 'undefined') return null;
    const parsed = JSON.parse(raw) as T | undefined;
    return typeof parsed === 'undefined' ? null : parsed;
  } catch {
    return null;
  }
}

export function writeCached<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof value === 'undefined') {
      window.sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
      return;
    }
    window.sessionStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // ignore cache failures
  }
}

export function clearCached(key: string) {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch {
    // ignore cache failures
  }
}

export function apiErrorMessage(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const err = e as AxiosError<{ error?: string }>;
    return err.response?.data?.error ?? err.message ?? 'Something went wrong';
  }
  return 'Something went wrong';
}

export function isUnauthorizedError(e: unknown): boolean {
  return axios.isAxiosError(e) && e.response?.status === 401;
}

// ====== Auth ======
export async function register(payload: { name: string; email: string; password: string }) {
  return resolveUserFromResponse(async () => {
    const { data } = await api.post('/auth/register', payload);
    return data;
  });
}
export async function login(payload: { email: string; password: string }) {
  return resolveUserFromResponse(async () => {
    const { data } = await api.post('/auth/login', payload);
    return data;
  });
}
export async function logout() {
  await api.post('/auth/logout');
}
export async function me() {
  return resolveUserFromResponse(async () => {
    const { data } = await api.get('/auth/me');
    return data;
  });
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

export interface AdminUserRecord {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface AdminLoanRecord {
  id: number;
  userName: string;
  bookTitle: string;
  borrowedAt: string | null;
  dueAt: string | null;
  returnedAt: string | null;
  status: string;
}

export async function getAdminUsers(): Promise<AdminUserRecord[]> {
  const { data } = await api.get<AdminUserRecord[]>('/admin/users');
  return data;
}

export async function createAdminUser(payload: { name: string; email: string; password?: string; is_admin: boolean }): Promise<AdminUserRecord> {
  const { data } = await api.post<AdminUserRecord>('/admin/users', payload);
  return data;
}

export async function updateAdminUser(id: number, payload: { is_admin?: boolean }): Promise<AdminUserRecord> {
  const { data } = await api.put<AdminUserRecord>(`/admin/users/${id}`, payload);
  return data;
}

export async function getAdminLoans(): Promise<AdminLoanRecord[]> {
  const { data } = await api.get<AdminLoanRecord[]>('/admin/loans');
  return data;
}

export async function adminReturnLoan(id: number): Promise<void> {
  await api.post(`/admin/loans/return/${id}`);
}

export async function createAdminBook(payload: Partial<Book>): Promise<Book> {
  const { data } = await api.post<{ book: Book }>('/admin/books', payload);
  return data.book;
}

export async function updateAdminBook(id: number, payload: Partial<Book>): Promise<Book> {
  const { data } = await api.put<{ book: Book }>(`/admin/books/${id}`, payload);
  return data.book;
}

export async function deleteAdminBook(id: number): Promise<void> {
  await api.delete(`/admin/books/${id}`);
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

// ====== Favorites (localStorage) ======
const FAV_KEY = 'leafshelf:favorites';
export function getFavoriteIds(): number[] {
  try { return JSON.parse(localStorage.getItem(FAV_KEY) ?? '[]') as number[]; } catch { return []; }
}
export function isFavorite(id: number): boolean { return getFavoriteIds().includes(id); }
export function toggleFavorite(id: number): boolean {
  const ids = getFavoriteIds();
  const idx = ids.indexOf(id);
  if (idx >= 0) { ids.splice(idx, 1); localStorage.setItem(FAV_KEY, JSON.stringify(ids)); return false; }
  ids.push(id); localStorage.setItem(FAV_KEY, JSON.stringify(ids)); return true;
}

// ====== Downloads (localStorage) ======
const DL_KEY = 'leafshelf:downloads';
export interface DownloadEntry { id: number; title: string; author: string; cover_url?: string; addedAt: string; type?: 'ebook' | 'audiobook' | 'pdf'; }
export function getDownloads(): DownloadEntry[] {
  try { return JSON.parse(localStorage.getItem(DL_KEY) ?? '[]') as DownloadEntry[]; } catch { return []; }
}
export function addDownload(book: { id: number; title: string; author: string; cover_url?: string; type?: 'ebook' | 'audiobook' | 'pdf' }): void {
  const dl = getDownloads();
  if (!dl.find(d => d.id === book.id)) {
    dl.unshift({ id: book.id, title: book.title, author: book.author, cover_url: book.cover_url,
      type: book.type ?? 'ebook',
      addedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) });
    localStorage.setItem(DL_KEY, JSON.stringify(dl));
  }
}
export function removeDownload(id: number): void {
  localStorage.setItem(DL_KEY, JSON.stringify(getDownloads().filter(d => d.id !== id)));
}
export function isDownloaded(id: number): boolean { return getDownloads().some(d => d.id === id); }

// ====== Reviews (localStorage) ======
export interface Review {
  id: string; bookId: number; userName: string; initials: string;
  color: string; rating: number; text: string; date: string;
}
const REVIEWS_KEY = 'leafshelf:reviews';
export function getReviews(bookId: number): Review[] {
  try {
    const all = JSON.parse(localStorage.getItem(REVIEWS_KEY) ?? '{}') as Record<string, Review[]>;
    return all[String(bookId)] ?? [];
  } catch { return []; }
}
export function saveReview(review: Review): void {
  try {
    const all: Record<string, Review[]> = JSON.parse(localStorage.getItem(REVIEWS_KEY) ?? '{}');
    if (!all[String(review.bookId)]) all[String(review.bookId)] = [];
    const idx = all[String(review.bookId)].findIndex(r => r.userName === review.userName);
    if (idx >= 0) all[String(review.bookId)][idx] = review;
    else all[String(review.bookId)].unshift(review);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(all));
  } catch { /* ignore */ }
}

// ====== Reading Goal (localStorage) ======
export interface ReadingGoal { yearly: number; }
const GOAL_KEY = 'leafshelf:reading-goal';
export function getReadingGoal(): ReadingGoal {
  try { return JSON.parse(localStorage.getItem(GOAL_KEY) ?? '{"yearly":12}') as ReadingGoal; }
  catch { return { yearly: 12 }; }
}
export function saveReadingGoal(goal: ReadingGoal): void {
  localStorage.setItem(GOAL_KEY, JSON.stringify(goal));
}

// ====== Local borrow (localStorage) — used when user not signed in ======
const BORROW_KEY = 'leafshelf:borrowed';
export interface BorrowEntry { id: number; title: string; author: string; cover_url?: string; category?: string; pages?: number | null; borrowedAt: string; dueAt: string; }
export function getLocalBorrowed(): BorrowEntry[] {
  try { return JSON.parse(localStorage.getItem(BORROW_KEY) ?? '[]') as BorrowEntry[]; } catch { return []; }
}
export function isLocallyBorrowed(id: number): boolean { return getLocalBorrowed().some(b => b.id === id); }
export function addLocalBorrow(book: { id: number; title: string; author: string; cover_url?: string; category?: string; pages?: number | null }): void {
  const list = getLocalBorrowed();
  if (list.find(b => b.id === book.id)) return;
  const now = new Date();
  const due = new Date(now); due.setDate(due.getDate() + 14);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  list.unshift({ id: book.id, title: book.title, author: book.author, cover_url: book.cover_url, category: book.category, pages: book.pages,
    borrowedAt: fmt(now), dueAt: fmt(due) });
  localStorage.setItem(BORROW_KEY, JSON.stringify(list));
}
export function removeLocalBorrow(id: number): void {
  localStorage.setItem(BORROW_KEY, JSON.stringify(getLocalBorrowed().filter(b => b.id !== id)));
}

const RETURNED_KEY = 'leafshelf:returned';
export interface ReturnedEntry extends BorrowEntry { returnedAt: string; }
export function getLocalReturned(): ReturnedEntry[] {
  try { return JSON.parse(localStorage.getItem(RETURNED_KEY) ?? '[]') as ReturnedEntry[]; } catch { return []; }
}
export function returnLocalBorrow(id: number): void {
  const list = getLocalBorrowed();
  const entry = list.find(b => b.id === id);
  if (!entry) return;
  removeLocalBorrow(id);
  const returned = getLocalReturned();
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  returned.unshift({ ...entry, returnedAt: fmt(new Date()) });
  localStorage.setItem(RETURNED_KEY, JSON.stringify(returned));
}
