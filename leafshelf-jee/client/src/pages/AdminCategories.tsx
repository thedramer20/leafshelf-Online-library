import { useEffect, useRef, useState } from 'react';
import { getAdminStats, listCategories } from '../lib/api';
import { useAdminGuard } from '../hooks/useAdminGuard';

const CAT_ADDED_KEY = 'leafshelf:admin:categories-added';
const CAT_DELETED_KEY = 'leafshelf:admin:categories-deleted';

const CAT_ICONS: Record<string, string> = {
  Fiction: '📖', 'Non-Fiction': '📰', Science: '🔬', History: '📜',
  Fantasy: '🧙', Mystery: '🔍', Romance: '💕', Biography: '👤',
  Classic: '🏛', Dystopian: '🌆', Adventure: '⚔️', Philosophy: '🧠',
  Technology: '💻', Art: '🎨', Poetry: '✍️', Drama: '🎭',
};
function catIcon(name: string) { return CAT_ICONS[name] ?? '📚'; }

export default function AdminCategories() {
  useAdminGuard();

  const [categories, setCategories] = useState<string[]>([]);
  const [distribution, setDistribution] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const [editVal, setEditVal] = useState('');
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 3000);
  }

  function loadDeleted(): Set<string> {
    try { return new Set(JSON.parse(localStorage.getItem(CAT_DELETED_KEY) ?? '[]')); } catch { return new Set(); }
  }
  function loadAdded(): string[] {
    try { return JSON.parse(localStorage.getItem(CAT_ADDED_KEY) ?? '[]'); } catch { return []; }
  }

  useEffect(() => {
    Promise.all([listCategories(), getAdminStats()])
      .then(([cats, stats]) => {
        const deleted = loadDeleted();
        const added = loadAdded();
        const dist: Record<string, number> = {};
        stats.categoryDistribution.forEach(c => { dist[c.name] = c.count; });
        const merged = [...added, ...cats.filter(c => !deleted.has(c))];
        const unique = [...new Set(merged)];
        setCategories(unique);
        setDistribution(dist);
      })
      .finally(() => setLoading(false));
  }, []);

  function handleAdd() {
    const name = newCat.trim();
    if (!name) return;
    if (categories.some(c => c.toLowerCase() === name.toLowerCase())) {
      showToast('Category already exists.'); return;
    }
    const added = loadAdded();
    added.push(name);
    localStorage.setItem(CAT_ADDED_KEY, JSON.stringify(added));
    setCategories(prev => [...prev, name]);
    setNewCat('');
    showToast(`"${name}" category added.`);
  }

  function handleDelete(cat: string) {
    const deleted = loadDeleted();
    deleted.add(cat);
    localStorage.setItem(CAT_DELETED_KEY, JSON.stringify([...deleted]));
    const added = loadAdded().filter(c => c !== cat);
    localStorage.setItem(CAT_ADDED_KEY, JSON.stringify(added));
    setCategories(prev => prev.filter(c => c !== cat));
    setDeleteConfirm(null);
    showToast(`"${cat}" removed.`);
  }

  function handleRename(old: string) {
    const name = editVal.trim();
    if (!name || name === old) { setEditing(null); return; }
    if (categories.some(c => c !== old && c.toLowerCase() === name.toLowerCase())) {
      showToast('That name is already taken.'); return;
    }
    const added = loadAdded().map(c => c === old ? name : c);
    localStorage.setItem(CAT_ADDED_KEY, JSON.stringify(added));
    const deleted = loadDeleted();
    deleted.add(old);
    localStorage.setItem(CAT_DELETED_KEY, JSON.stringify([...deleted]));
    setCategories(prev => prev.map(c => c === old ? name : c));
    setDistribution(prev => {
      const d = { ...prev };
      if (d[old] !== undefined) { d[name] = d[old]; delete d[old]; }
      return d;
    });
    setEditing(null);
    showToast(`Renamed to "${name}".`);
  }

  const filtered = categories.filter(c => c.toLowerCase().includes(search.toLowerCase()));
  const total = Object.values(distribution).reduce((s, v) => s + v, 0);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <div style={{ color: '#9CA3AF', fontSize: 14 }}>Loading categories…</div>
    </div>
  );

  return (
    <div style={{ padding: 24, minHeight: '100vh', background: '#F9FAFB' }}>
      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 24, zIndex: 9999, background: '#1B4332', color: '#fff', padding: '10px 18px', borderRadius: 10, fontSize: 13, fontWeight: 500, boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
          {toast}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 26, fontWeight: 700, color: '#1B4332', margin: 0 }}>Categories</h1>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{categories.length} categories across {total} books</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
        {/* Left: category list */}
        <div>
          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 15, height: 15, color: '#9CA3AF' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search categories…" style={{ width: '100%', paddingLeft: 36, paddingRight: 12, paddingTop: 9, paddingBottom: 9, border: '1px solid #E5E7EB', borderRadius: 10, fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#fff' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {filtered.length === 0 ? (
              <div style={{ gridColumn: '1/-1', padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>No categories found</div>
            ) : filtered.map(cat => {
              const count = distribution[cat] ?? 0;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div
                  key={cat}
                  style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', padding: '16px 16px 14px', transition: 'box-shadow 0.2s' }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)')}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 22 }}>{catIcon(cat)}</span>
                      {editing === cat ? (
                        <input
                          autoFocus
                          value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleRename(cat); if (e.key === 'Escape') setEditing(null); }}
                          onBlur={() => handleRename(cat)}
                          style={{ fontSize: 13, fontWeight: 600, border: '1px solid #1B4332', borderRadius: 4, padding: '2px 6px', outline: 'none', width: 100 }}
                        />
                      ) : (
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>{cat}</span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        onClick={() => { setEditing(cat); setEditVal(cat); }}
                        title="Rename"
                        style={{ padding: '3px 6px', border: '1px solid #E5E7EB', borderRadius: 5, background: '#fff', cursor: 'pointer', fontSize: 11, color: '#6B7280' }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(cat)}
                        title="Delete"
                        style={{ padding: '3px 6px', border: '1px solid #FEE2E2', borderRadius: 5, background: '#FEF2F2', cursor: 'pointer', fontSize: 11, color: '#DC2626' }}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>{count} book{count !== 1 ? 's' : ''} · {pct}% of catalog</div>
                  <div style={{ height: 4, background: '#F3F4F6', borderRadius: 99 }}>
                    <div style={{ height: '100%', borderRadius: 99, background: '#1B4332', width: `${pct}%`, minWidth: pct > 0 ? 4 : 0, transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Add category */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #E5E7EB', padding: 22, position: 'sticky', top: 24 }}>
          <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 16, fontWeight: 700, color: '#1B4332', margin: '0 0 16px' }}>Add Category</h3>
          <input
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder="Category name…"
            style={{ width: '100%', padding: '9px 12px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 13, outline: 'none', marginBottom: 12, boxSizing: 'border-box' }}
          />
          <button
            onClick={handleAdd}
            disabled={!newCat.trim()}
            style={{ width: '100%', padding: '10px 0', background: newCat.trim() ? '#1B4332' : '#D1D5DB', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, cursor: newCat.trim() ? 'pointer' : 'not-allowed' }}
          >
            + Add Category
          </button>

          <div style={{ marginTop: 22, borderTop: '1px solid #F3F4F6', paddingTop: 18 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 12 }}>Distribution</div>
            {Object.entries(distribution)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 8)
              .map(([cat, count]) => {
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={cat} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#374151', marginBottom: 4 }}>
                      <span>{catIcon(cat)} {cat}</span>
                      <span style={{ color: '#6B7280' }}>{count}</span>
                    </div>
                    <div style={{ height: 4, background: '#F3F4F6', borderRadius: 99 }}>
                      <div style={{ height: '100%', borderRadius: 99, background: '#1B4332', width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: 14, padding: 28, maxWidth: 360, width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>🗑️</div>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 700, color: '#1B4332', textAlign: 'center', margin: '0 0 8px' }}>Delete Category?</h3>
            <p style={{ fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 20 }}>"{deleteConfirm}" will be removed. Books in this category won't be deleted.</p>
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
