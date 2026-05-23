import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiErrorMessage, borrow, getBook, listBooks } from '../lib/api';
import { useAuth } from '../lib/auth';
import type { Book } from '../lib/types';

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'w-5 h-5' : size === 'md' ? 'w-4 h-4' : 'w-3 h-3';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`${cls} ${i <= Math.round(rating) ? 'text-gold' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ratingBreakdown(rating: number): number[] {
  const r = Math.min(5, Math.max(0, rating));
  if (r >= 4.5) return [68, 22, 7, 2, 1];
  if (r >= 4.0) return [52, 30, 12, 4, 2];
  if (r >= 3.5) return [35, 35, 20, 7, 3];
  if (r >= 3.0) return [25, 30, 25, 12, 8];
  return [15, 20, 25, 25, 15];
}

function formatDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function SmallBookCard({ book }: { book: Book }) {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/books/${book.id}`)}
      className="flex-shrink-0 w-28 cursor-pointer group">
      <div className="rounded-lg overflow-hidden shadow-soft group-hover:shadow-md group-hover:-translate-y-0.5 transition-all"
        style={{ paddingBottom: '150%', position: 'relative' }}>
        {book.cover_url
          ? <img src={book.cover_url} alt={book.title} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
          : <div className="absolute inset-0 bg-gradient-to-br from-forest-dark/20 to-forest-dark/40 flex items-end p-1.5"><span className="text-white text-[10px] leading-tight line-clamp-2">{book.title}</span></div>
        }
      </div>
      <p className="text-[11px] font-semibold text-ink mt-1.5 line-clamp-2 leading-tight">{book.title}</p>
      <p className="text-[10px] text-muted truncate">{book.author}</p>
    </div>
  );
}

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [related, setRelated] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBook = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const b = await getBook(id);
      setBook(b);
      const all = await listBooks({ category: b.category });
      setRelated(all.filter(x => x.id !== b.id).slice(0, 6));
    } catch {
      navigate('/books');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { void loadBook(); }, [loadBook]);

  async function handleBorrow() {
    if (!user) { navigate('/login'); return; }
    if (!book) return;
    setBorrowing(true); setError(null);
    try {
      await borrow(book.id);
      setSuccess(true);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBorrowing(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex gap-6 animate-pulse">
        <div className="w-72 flex-shrink-0 bg-gray-100 rounded-xl" style={{ height: '400px' }} />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-100 rounded w-3/4" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
          <div className="h-4 bg-gray-100 rounded w-full" />
        </div>
      </div>
    );
  }
  if (!book) return null;

  const breakdown = ratingBreakdown(book.rating);
  const totalRatings = 1284;

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        ← Back to Discover
      </button>

      {/* Three-column layout */}
      <div className="flex gap-8">
        {/* Left: Cover */}
        <div className="w-64 flex-shrink-0">
          <div className="rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.20)]" style={{ paddingBottom: '150%', position: 'relative' }}>
            {book.cover_url
              ? <img src={book.cover_url} alt={book.title} className="absolute inset-0 w-full h-full object-cover" />
              : <div className="absolute inset-0 bg-gradient-to-br from-forest-dark to-forest-dark/60 flex items-center justify-center"><span className="text-5xl">📚</span></div>
            }
          </div>
          <div className="mt-4 p-4 bg-white rounded-xl border border-border shadow-soft">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Book Details</p>
            <div className="space-y-2 text-sm">
              {book.pages && <div className="flex justify-between"><span className="text-muted">Pages</span><span className="font-medium text-ink">{book.pages}</span></div>}
              <div className="flex justify-between"><span className="text-muted">Genre</span><span className="font-medium text-ink">{book.category}</span></div>
              {book.published_year && <div className="flex justify-between"><span className="text-muted">Published</span><span className="font-medium text-ink">{book.published_year}</span></div>}
              {book.isbn && <div className="flex justify-between"><span className="text-muted">ISBN</span><span className="font-medium text-ink text-xs">{book.isbn}</span></div>}
              <div className="flex justify-between"><span className="text-muted">Format</span><span className="font-medium text-ink">eBook</span></div>
              <div className="flex justify-between"><span className="text-muted">Language</span><span className="font-medium text-ink">English</span></div>
            </div>
          </div>
        </div>

        {/* Center: Details */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 flex-wrap mb-3">
            <span className="text-[11px] font-semibold px-3 py-1 bg-[#F0FDF4] text-[#1B4332] rounded-full border border-[#D1FAE5]">
              {book.category}
            </span>
            <span className="text-[11px] font-semibold px-3 py-1 bg-[#F0FDF4] text-[#1B4332] rounded-full border border-[#D1FAE5]">
              eBook
            </span>
          </div>

          <h1 className="font-serif text-[36px] font-bold text-[#1B4332] leading-[1.2] mb-2">{book.title}</h1>
          <p className="text-base text-muted italic mb-4">by <span className="font-semibold text-ink not-italic">{book.author}</span></p>

          <div className="flex items-center gap-3 mb-4">
            <Stars rating={book.rating} size="md" />
            <span className="font-bold text-ink">{book.rating.toFixed(1)}</span>
            <span className="text-sm text-muted">(1,284 ratings)</span>
          </div>

          <div className={`inline-flex flex-col px-3 py-2 rounded-xl text-sm font-medium mb-6 ${
            book.available ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${book.available ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className={book.available ? 'text-[#2D6A4F]' : 'text-red-700'}>
                {book.available ? 'Available to borrow' : 'Checked out — All copies are currently borrowed.'}
              </span>
            </div>
            {book.available && (
              <p className="text-sm text-[#2D6A4F] mt-0.5 ml-4">You can borrow this title.</p>
            )}
          </div>

          {error && <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-3 mb-4 text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-700 border border-green-200 rounded-lg px-4 py-3 mb-4 text-sm">✓ Added to your library! Check My Library to start reading.</div>}

          <div className="flex gap-3 mb-8 flex-wrap">
            <button onClick={handleBorrow} disabled={borrowing || success || !book.available}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-colors shadow-soft ${
                success ? 'bg-green-100 text-green-700 cursor-default' :
                !book.available ? 'bg-gray-100 text-gray-400 cursor-not-allowed' :
                'bg-forest-dark text-white hover:bg-forest'
              }`}>
              <span>📖</span>
              {success ? '✓ Borrowed' : borrowing ? 'Borrowing…' : 'Borrow Now'}
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border border-border text-ink hover:bg-gray-50 transition-colors">
              <span>👁</span> Read Sample
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border border-border text-ink hover:bg-gray-50 transition-colors">
              <span>🔖</span> Save to Library
            </button>
          </div>

          <div className="mb-6">
            <h2 className="font-serif text-xl font-bold text-ink mb-3">About the Book</h2>
            <div className="text-sm text-gray-600 leading-relaxed space-y-3">
              {book.description.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </div>

          {/* Related books */}
          {related.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-bold text-ink mb-4">More Books You Might Like</h2>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {related.map(b => <SmallBookCard key={b.id} book={b} />)}
              </div>
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="w-60 flex-shrink-0 space-y-4">
          {/* Borrow details */}
          <div className="bg-white rounded-card border border-border shadow-soft p-4">
            <h3 className="font-semibold text-sm text-ink mb-4">Borrow Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#F9FAFB] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📅</span>
                </div>
                <div>
                  <p className="font-medium text-ink">14 days</p>
                  <p className="text-xs text-muted">Loan period</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#F9FAFB] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📅</span>
                </div>
                <div>
                  <p className="font-medium text-ink">{formatDueDate()}</p>
                  <p className="text-xs text-muted">Due date</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#F9FAFB] rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📄</span>
                </div>
                <div>
                  <p className="font-medium text-ink">eBook / EPUB</p>
                  <p className="text-xs text-muted">2.1 MB</p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-3 bg-[#F0FDF4] rounded-lg text-xs text-[#2D6A4F]">
              You can renew this book if no one else is waiting.
            </div>
          </div>

          {/* Reader reviews */}
          <div className="bg-white rounded-card border border-border shadow-soft p-4">
            <h3 className="font-semibold text-sm text-ink mb-4">Reader Reviews</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-ink leading-none">{book.rating.toFixed(1)}</p>
                <Stars rating={book.rating} size="sm" />
                <p className="text-[10px] text-muted mt-1">{totalRatings.toLocaleString()} ratings</p>
              </div>
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((star, idx) => (
                  <div key={star} className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted w-3">{star}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-gold rounded-full h-1.5 transition-all" style={{ width: `${breakdown[idx]}%` }} />
                    </div>
                    <span className="text-[10px] text-muted w-6 text-right">{Math.round(totalRatings * breakdown[idx] / 100)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-50 pt-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-full bg-forest-dark flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">SJ</div>
                <div>
                  <p className="text-xs font-semibold text-ink">Sarah J.</p>
                  <div className="flex items-center gap-1">
                    <Stars rating={5} />
                    <span className="text-[10px] text-muted">5 days ago</span>
                  </div>
                </div>
                <span className="ml-auto text-[9px] font-semibold px-1.5 py-0.5 bg-green-50 text-green-700 rounded-full">Verified</span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
                Absolutely captivating. Couldn't put it down — finished it in one sitting. The prose is beautiful and the plot twists are genuinely unexpected.
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                <button className="flex items-center gap-1 hover:text-ink transition-colors">👍 24</button>
                <button className="flex items-center gap-1 hover:text-ink transition-colors">💬 2</button>
              </div>
            </div>

            <button className="mt-3 w-full py-2 rounded-lg text-sm font-medium text-forest-dark border border-forest-dark/20 hover:bg-forest-dark/5 transition-colors">
              See all reviews
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
