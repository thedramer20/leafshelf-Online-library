import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAdminBook, deleteAdminBook, listBooks, listCategories, updateAdminBook } from '../lib/api';
import { useAdminGuard } from '../hooks/useAdminGuard';
import type { Book } from '../lib/types';

function Badge({ available }: { available: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', padding: '2px 8px',
      borderRadius: 9999, fontSize: 11, fontWeight: 600,
      background: available ? '#F0FDF4' : '#FEF2F2',
      color: available ? '#1B4332' : '#DC2626',
    }}>
      {available ? 'Available' : 'Unavailable'}
    </span>
  );
}

const EMPTY_FORM: Partial<Book> = {
  title: '', author: '', isbn: '', description: '', category: '',
  cover_url: '', total_copies: 1, available_copies: 1,
  published_year: new Date().getFullYear(), pages: 200, rating: 4.0, available: true,
};

type SortKey = 'title' | 'author' | 'category' | 'rating' | 'available_copies';

export default function AdminBooks() {
  useAdminGuard();
  const navigate = useNavigate();

  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('title');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const PER_PAGE = 12;

  const [modalOpen, setModalOpen] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  const [form, setForm] = useState<Partial<Book>>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Book | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    Promise.all([listBooks(), listCategories()])
      .then(([books, cats]) => {
        setAllBooks(books);
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = allBooks
    .filter(b => {
      const q = search.toLowerCase();
      if (q && !b.title.toLowerCase().includes(q) && !b.author.toLowerCase().includes(q) && !(b.isbn ?? '').toLowerCase().includes(q)) return false;
      if (filterCat && b.category !== filterCat) return false;
      if (filterStatus === 'available' && !b.available) return false;
      if (filterStatus === 'unavailable' && b.available) return false;
      return true;
    })
    .sort((a, b) => {
      let va: string | number = a[sortKey] ?? '';
      let vb: string | number = b[sortKey] ?? '';
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  function openAdd() { setEditBook(null); setForm(EMPTY_FORM); setModalOpen(true); }
  function openEdit(b: Book) { setEditBook(b); setForm({ ...b }); setModalOpen(true); }

  async function handleSave() {
    if (!form.title?.trim() || !form.author?.trim()) { showToast('Title and author are required.'); return; }
    setSaving(true);
    try {
      if (editBook) {
        const updated = await updateAdminBook(editBook.id, form);
        setAllBooks(prev => prev.map(b => b.id === editBook.id ? updated : b));
        showToast('Book updated successfully.');
      } else {
        const created = await createAdminBook(form);
        setAllBooks(prev => [created, ...prev]);
        if (form.category && !categories.includes(form.category)) {
          setCategories(prev => [...prev, form.category!].sort());
        }
        showToast('Book added successfully.');
      }
      setModalOpen(false);
    } catch {
      showToast('Failed to save book. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(b: Book) {
    try {
      await deleteAdminBook(b.id);
      setAllBooks(prev => prev.filter(x => x.id !== b.id));
      setDeleteConfirm(null);
      showToast(`"${b.title}" removed.`);
    } catch {
      setDeleteConfirm(null);
      showToast('Failed to delete book. It may have active loans.');
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ color: '#9CA3AF', fontSize: 14 }}>Loading books…</div>
    </div>
  );

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#F9FAFB' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 24, zIndex: 9999,
          background: '#1B4332', color: '#fff', padding: '10px 18px',
          borderRadius: 10, fontSize: 13, fontWeight: 500,
          boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1B4332', margin: 0 }}>
            Books Management
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
            {filtered.length} book{filtered.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#1B4332', color: '#fff', border: 'none',
            borderRadius: 10, padding: '10px 18px', fontSize: 13, fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <svg style={{ width: 16, height: 16 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Book
        </button>
      </div>

      {/* Filters */}
      <div style={{
        background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB',
        padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
      }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search title, author, ISBN…"
            style={{
              width: '100%', paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
              border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <select
          value={filterCat}
          onChange={e => { setFilterCat(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', background: '#fff' }}
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
          style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#374151', background: '#fff' }}
        >
          <option value="">All Status</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
        {(search || filterCat || filterStatus) && (
          <button
            onClick={() => { setSearch(''); setFilterCat(''); setFilterStatus(''); setPage(1); }}
            style={{ padding: '8px 12px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, color: '#6B7280', background: '#fff', cursor: 'pointer' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                {[
                  { key: 'cover', label: 'Cover', sortable: false },
                  { key: 'title', label: 'Title', sortable: true },
                  { key: 'author', label: 'Author', sortable: true },
                  { key: 'category', label: 'Category', sortable: true },
                  { key: 'available_copies', label: 'Copies', sortable: true },
                  { key: 'rating', label: 'Rating', sortable: true },
                  { key: 'status', label: 'Status', sortable: false },
                  { key: 'actions', label: 'Actions', sortable: false },
                ].map(col => (
                  <th
                    key={col.key}
                    onClick={col.sortable ? () => handleSort(col.key as SortKey) : undefined}
                    style={{
                      padding: '12px 14px', textAlign: 'left', fontSize: 11,
                      fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase',
                      letterSpacing: '0.05em', whiteSpace: 'nowrap',
                      cursor: col.sortable ? 'pointer' : 'default',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {col.label}
                      {col.sortable && sortKey === col.key && (
                        <span style={{ fontSize: 10 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '40px 0', textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>
                    No books found
                  </td>
                </tr>
              ) : paged.map(book => (
                <tr
                  key={book.id}
                  style={{ borderBottom: '1px solid #F9FAFB', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#FAFAFA')}
                  onMouseLeave={e => (e.currentTarget.style.background = '')}
                >
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{
                      width: 36, height: 50, borderRadius: 4, overflow: 'hidden',
                      background: '#F3F4F6', flexShrink: 0,
                    }}>
                      {book.cover_url ? (
                        <img src={book.cover_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📚</div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', maxWidth: 200 }} title={book.title}>
                      {book.title.length > 30 ? book.title.slice(0, 30) + '…' : book.title}
                    </div>
                    {book.isbn && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>ISBN: {book.isbn}</div>}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151' }}>{book.author}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px',
                      borderRadius: 6, background: '#F0FDF4', color: '#1B4332',
                      fontSize: 11, fontWeight: 500,
                    }}>
                      {book.category}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151', textAlign: 'center' }}>
                    <span style={{ fontWeight: 700, color: book.available_copies === 0 ? '#DC2626' : '#1B4332' }}>
                      {book.available_copies}
                    </span>
                    <span style={{ color: '#9CA3AF' }}>/{book.total_copies}</span>
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: 13, color: '#374151' }}>
                    <span style={{ color: '#F59E0B' }}>★</span> {book.rating.toFixed(1)}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <Badge available={book.available} />
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => navigate(`/books/${book.id}`)}
                        title="View"
                        style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontSize: 12, color: '#374151' }}
                      >
                        <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => openEdit(book)}
                        title="Edit"
                        style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #DBEAFE', background: '#EFF6FF', cursor: 'pointer', fontSize: 12, color: '#2563EB' }}
                      >
                        <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(book)}
                        title="Delete"
                        style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #FEE2E2', background: '#FEF2F2', cursor: 'pointer', fontSize: 12, color: '#DC2626' }}
                      >
                        <svg style={{ width: 13, height: 13 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: '14px 18px', borderTop: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>
              Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: 12, color: page === 1 ? '#D1D5DB' : '#374151' }}
              >
                ← Prev
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pg = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid', fontSize: 12, cursor: 'pointer', borderColor: pg === page ? '#1B4332' : '#E5E7EB', background: pg === page ? '#1B4332' : '#fff', color: pg === page ? '#fff' : '#374151' }}
                  >
                    {pg}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ padding: '5px 10px', borderRadius: 6, border: '1px solid #E5E7EB', background: '#fff', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: 12, color: page === totalPages ? '#D1D5DB' : '#374151' }}
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600,
            maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
          }}>
            <div style={{ padding: '22px 24px', borderBottom: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: '#1B4332', margin: 0 }}>
                {editBook ? 'Edit Book' : 'Add New Book'}
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#6B7280', fontSize: 20 }}>×</button>
            </div>
            <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {([
                ['title', 'Title *', 'text', 'full'],
                ['author', 'Author *', 'text', 'full'],
                ['category', 'Category', 'select', 'half'],
                ['isbn', 'ISBN', 'text', 'half'],
                ['published_year', 'Published Year', 'number', 'half'],
                ['pages', 'Pages', 'number', 'half'],
                ['total_copies', 'Total Copies', 'number', 'half'],
                ['available_copies', 'Available Copies', 'number', 'half'],
                ['rating', 'Rating (0–5)', 'number', 'half'],
                ['cover_url', 'Cover Image URL', 'text', 'full'],
                ['description', 'Description', 'textarea', 'full'],
              ] as [keyof Book, string, string, string][]).map(([field, label, type, span]) => (
                <div key={field} style={{ gridColumn: span === 'full' ? '1 / -1' : 'auto' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
                  {type === 'textarea' ? (
                    <textarea
                      value={(form[field] as string) ?? ''}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      rows={3}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 13, resize: 'vertical', boxSizing: 'border-box', outline: 'none' }}
                    />
                  ) : type === 'select' ? (
                    <select
                      value={(form[field] as string) ?? ''}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 13, background: '#fff', boxSizing: 'border-box' }}
                    >
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  ) : (
                    <input
                      type={type}
                      step={field === 'rating' ? 0.1 : undefined}
                      min={0}
                      max={field === 'rating' ? 5 : undefined}
                      value={(form[field] as string | number) ?? ''}
                      onChange={e => setForm(f => ({ ...f, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
                    />
                  )}
                </div>
              ))}
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => setModalOpen(false)}
                style={{ padding: '9px 18px', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff', color: '#374151' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{ padding: '9px 18px', background: '#1B4332', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: saving ? 'wait' : 'pointer', color: '#fff' }}
              >
                {saving ? 'Saving…' : editBook ? 'Save Changes' : 'Add Book'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 380, width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 32, marginBottom: 12, textAlign: 'center' }}>🗑️</div>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#1B4332', textAlign: 'center', margin: '0 0 8px' }}>Delete Book?</h3>
            <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 20 }}>
              "{deleteConfirm.title}" will be removed from the library catalog.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteConfirm(null)} style={{ flex: 1, padding: '9px 0', border: '1px solid #E5E7EB', borderRadius: 8, fontSize: 13, cursor: 'pointer', background: '#fff' }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} style={{ flex: 1, padding: '9px 0', background: '#DC2626', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#fff' }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
