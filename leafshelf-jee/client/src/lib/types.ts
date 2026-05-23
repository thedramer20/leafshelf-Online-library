export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface CategoryCount {
  name: string;
  count: number;
}

export interface RecentLoan {
  id: number;
  userName: string;
  bookTitle: string;
  borrowedAt: string;
  dueAt: string;
  status: string;
}

export interface AdminStats {
  totalBooks: number;
  totalUsers: number;
  issuedBooks: number;
  overdueBooks: number;
  totalLoans: number;
  categoryDistribution: CategoryCount[];
  recentLoans: RecentLoan[];
}

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string | null;
  description: string;
  category: string;
  cover_url: string;
  total_copies: number;
  available_copies: number;
  published_year: number | null;
  pages: number | null;
  rating: number;
  available: boolean;
  created_at: string;
}

export interface Loan {
  id: number;
  user_id: number;
  book_id: number;
  borrowed_at: string;
  due_at: string;
  returned_at: string | null;
  status: 'active' | 'returned';
  active: boolean;
  title?: string;
  author?: string;
  cover_url?: string;
  category?: string;
  pages?: number | null;
}

export interface ApiError {
  error: string;
}
