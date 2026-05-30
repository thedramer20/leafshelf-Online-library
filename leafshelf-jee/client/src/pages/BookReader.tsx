import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBook } from '../lib/api';
import { getBookContent } from '../lib/bookContent';
import { getReadingPrefs } from '../lib/readingPrefs';
import { getProgress, saveProgress } from '../lib/readingProgress';
import { getReadingStats } from '../lib/readingStats';
import type { Book } from '../lib/types';

type ReaderTheme = 'sepia' | 'light' | 'dark';

const FONT_SIZES = [14, 15, 16, 17, 18, 19, 20, 22, 24];
const LINE_HEIGHTS = [1.55, 1.7, 1.85, 2.05];

const NOTES = [
  {
    type: 'highlight' as const,
    quote: '"Some places keep the stories of those who come before us, and it is our duty to listen."',
    page: 253,
    color: 'amber',
  },
  {
    type: 'note' as const,
    quote: 'Important theme about legacy and remembering the past.',
    page: 251,
    color: 'emerald',
  },
];

function formatDueDate(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? 'text-gold' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function ToolbarButton({
  label,
  icon,
  onClick,
  active,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg text-[10px] font-medium transition-colors min-w-[64px] ${
        disabled
          ? 'text-gray-300 cursor-not-allowed'
          : active
            ? 'bg-forest-dark/10 text-forest-dark'
            : 'text-muted hover:bg-gray-50 hover:text-ink'
      }`}
    >
      <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      <span className="leading-none">{label}</span>
    </button>
  );
}

export default function BookReader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const prefs = getReadingPrefs();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState(0);
  const [fontSizeIdx, setFontSizeIdx] = useState(
    () => Math.max(0, FONT_SIZES.findIndex(s => s >= prefs.fontSize))
  );
  const [lineHeightIdx, setLineHeightIdx] = useState(
    () => Math.max(0, LINE_HEIGHTS.findIndex(h => h >= prefs.lineSpacing))
  );
  const [theme, setTheme] = useState<ReaderTheme>(prefs.theme);
  const [bookmarked, setBookmarked] = useState(false);
  const [highlightMode, setHighlightMode] = useState(false);
  const [showContents, setShowContents] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const readStartRef = useRef<number>(Date.now());
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const activeChapterRef = useRef(0);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newNoteText, setNewNoteText] = useState('');
  const [userNotes, setUserNotes] = useState<{ id: string; quote: string; chapter: number; page: number; type: 'highlight' | 'note'; color: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem(`leafshelf:notes:${id}`) ?? '[]'); } catch { return []; }
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBook(id)
      .then(b => {
        setBook(b);
        // Restore saved chapter progress
        const saved = getProgress(Number(id));
        if (saved) setActiveChapter(saved.chapter);
      })
      .catch(() => navigate('/books'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const content = useMemo(() => {
    if (!book) return null;
    return getBookContent(book.id, book.pages);
  }, [book]);

  // Keep ref in sync so the unmount cleanup always has the latest chapter
  activeChapterRef.current = activeChapter;

  // Track reading session time
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionMinutes(Math.round((Date.now() - readStartRef.current) / 60000));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Persist progress when navigating away or closing tab
  useEffect(() => {
    if (!book || !content) return;
    const save = () => saveProgress(book.id, activeChapterRef.current, content.chapters.length);
    window.addEventListener('beforeunload', save);
    return () => {
      window.removeEventListener('beforeunload', save);
      save();
    };
  }, [book, content]);

  if (loading || !book || !content) {
    return (
      <div className="p-6 animate-pulse">
        <div className="h-24 bg-gray-100 rounded-xl mb-4" />
        <div className="h-12 bg-gray-100 rounded-xl mb-4" />
        <div className="h-96 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  const chapter = content.chapters[activeChapter];
  const chaptersTotal = content.chapters.length;
  const pagesPerChapter = Math.floor(content.totalPages / chaptersTotal);
  const currentPage = Math.min(content.totalPages, (activeChapter + 1) * pagesPerChapter - Math.floor(pagesPerChapter / 3));
  const progressPct = Math.round((currentPage / content.totalPages) * 100);

  function goPrev() {
    const next = Math.max(0, activeChapter - 1);
    setActiveChapter(next);
    if (book) saveProgress(book.id, next, chaptersTotal);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function goNext() {
    const next = Math.min(chaptersTotal - 1, activeChapter + 1);
    setActiveChapter(next);
    if (book) saveProgress(book.id, next, chaptersTotal);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function decreaseFont() { setFontSizeIdx(i => Math.max(0, i - 1)); }
  function increaseFont() { setFontSizeIdx(i => Math.min(FONT_SIZES.length - 1, i + 1)); }
  function cycleLineHeight() { setLineHeightIdx(i => (i + 1) % LINE_HEIGHTS.length); }
  function cycleTheme() {
    setTheme(t => (t === 'sepia' ? 'light' : t === 'light' ? 'dark' : 'sepia'));
  }

  function saveNotes(notes: typeof userNotes) {
    setUserNotes(notes);
    localStorage.setItem(`leafshelf:notes:${book!.id}`, JSON.stringify(notes));
  }
  function handleTextSelect() {
    if (!highlightMode) return;
    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!text || text.length < 3) return;
    saveNotes([{ id: String(Date.now()), quote: text, chapter: activeChapter, page: currentPage, type: 'highlight', color: 'amber' }, ...userNotes]);
    sel?.removeAllRanges();
  }
  function addNote() {
    if (!newNoteText.trim()) return;
    saveNotes([{ id: String(Date.now()), quote: newNoteText.trim(), chapter: activeChapter, page: currentPage, type: 'note', color: 'emerald' }, ...userNotes]);
    setNewNoteText('');
  }
  function deleteNote(noteId: string) {
    saveNotes(userNotes.filter(n => n.id !== noteId));
  }
  function renderWithSearch(text: string) {
    if (!searchQuery.trim()) return <span>{text}</span>;
    const escaped = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return (
      <span>
        {parts.map((p, i) =>
          p.toLowerCase() === searchQuery.toLowerCase()
            ? <mark key={i} style={{ background: '#FCD34D', padding: '0 1px', borderRadius: 2, color: 'inherit' }}>{p}</mark>
            : p
        )}
      </span>
    );
  }

  const themeStyles: Record<ReaderTheme, { bg: string; text: string; border: string; subtle: string }> = {
    sepia:  { bg: '#FBF7EE', text: '#2E2A24', border: '#E9DFC8', subtle: '#86796B' },
    light:  { bg: '#FFFFFF', text: '#1F2937', border: '#E5E7EB', subtle: '#6B7280' },
    dark:   { bg: '#1F2933', text: '#E5E7EB', border: '#2F3B47', subtle: '#9CA3AF' },
  };
  const t = themeStyles[theme];

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      {/* Top breadcrumb */}
      <button onClick={() => navigate(`/books/${book.id}`)}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-4">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to book details
      </button>

      {/* Header bar with cover + meta + progress */}
      <div className="bg-white rounded-2xl border border-border shadow-soft p-5 mb-4 flex gap-5 items-center">
        {/* mini cover */}
        <div className="w-[72px] h-[100px] flex-shrink-0 rounded-lg overflow-hidden shadow-md">
          {book.cover_url
            ? <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
            : <div className="w-full h-full bg-gradient-to-br from-forest-dark/40 to-forest-dark/80" />}
        </div>

        {/* title + meta */}
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-2xl font-bold text-[#1B4332] leading-tight truncate">{book.title}</h1>
          <p className="text-sm text-muted italic mt-0.5">by <span className="text-ink not-italic font-medium">{book.author}</span></p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#1B4332] border border-[#D1FAE5]">{book.category}</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#1B4332] border border-[#D1FAE5]">eBook</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#1B4332] border border-[#D1FAE5]">Historical</span>
            <Stars rating={book.rating} />
            <span className="text-xs text-muted ml-1">{book.rating.toFixed(1)} (1,284 reviews)</span>
          </div>
        </div>

        {/* progress + page + due */}
        <div className="flex-shrink-0 text-right">
          <div className="flex items-center justify-end gap-2 text-sm font-semibold text-ink">
            <span>{progressPct}%</span>
            <span className="text-muted font-normal">complete</span>
          </div>
          <div className="w-44 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1.5 ml-auto">
            <div className="h-full bg-forest-dark rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="text-xs text-muted mt-2">Page {currentPage} of {content.totalPages}</p>
          <p className="text-xs text-red-500 font-semibold mt-2">Due in 5 days</p>
          <p className="text-[10px] text-muted">{formatDueDate(5)}</p>
        </div>

        {/* kebab menu */}
        <button type="button" className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-50 text-muted self-start" title="More options">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM10 11.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zM10 17a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
          </svg>
        </button>
      </div>

      <div className="flex gap-4">
        {/* Main reading column */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="bg-white rounded-2xl border border-border shadow-soft px-3 py-2 mb-4 flex items-center justify-between overflow-x-auto scrollbar-hide">
            <ToolbarButton
              label="Previous Chapter"
              disabled={activeChapter === 0}
              onClick={goPrev}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              }
            />
            <div className="w-px h-8 bg-gray-100" />
            <ToolbarButton label="A-" onClick={decreaseFont}
              icon={<span className="font-serif text-base font-bold">A-</span>} />
            <ToolbarButton label="A+" onClick={increaseFont}
              icon={<span className="font-serif text-base font-bold">A+</span>} />
            <ToolbarButton label="Theme" onClick={cycleTheme} active={theme !== 'light'}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
            />
            <ToolbarButton label="Line Spacing" onClick={cycleLineHeight} active={lineHeightIdx !== 1}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              }
            />
            <ToolbarButton label="Bookmark" onClick={() => setBookmarked(b => !b)} active={bookmarked}
              icon={
                <svg className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              }
            />
            <ToolbarButton label="Highlight" onClick={() => setHighlightMode(h => !h)} active={highlightMode}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              }
            />
            <ToolbarButton label="Notes" onClick={() => setShowNotes(s => !s)} active={showNotes}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              }
            />
            <ToolbarButton label="Contents" onClick={() => setShowContents(s => !s)} active={showContents}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h10M4 18h10" />
                </svg>
              }
            />
            <ToolbarButton label="Search in Book"
              onClick={() => { if (showSearch) setSearchQuery(''); setShowSearch(s => !s); }}
              active={showSearch}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
            <div className="w-px h-8 bg-gray-100" />
            <ToolbarButton
              label="Next Chapter"
              disabled={activeChapter >= chaptersTotal - 1}
              onClick={goNext}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            />
          </div>

          {/* Search bar */}
          {showSearch && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: t.bg, border: `1px solid ${t.border}`, borderRadius: 12, padding: '8px 14px', marginBottom: 12 }}>
              <svg className="w-4 h-4 flex-shrink-0" style={{ color: t.subtle }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search in this chapter…"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: 14, color: t.text }}
              />
              {searchQuery && (
                <span style={{ fontSize: 11, color: t.subtle, whiteSpace: 'nowrap' }}>
                  {chapter.paragraphs.filter(p => p.toLowerCase().includes(searchQuery.toLowerCase())).length} match{chapter.paragraphs.filter(p => p.toLowerCase().includes(searchQuery.toLowerCase())).length !== 1 ? 'es' : ''}
                </span>
              )}
              <button type="button" onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                style={{ fontSize: 12, color: t.subtle, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px', borderRadius: 6 }}>
                Done
              </button>
            </div>
          )}

          {/* Highlight mode banner */}
          {highlightMode && (
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '7px 14px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#92400E' }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span><strong>Highlight mode on</strong> — select any text in the chapter to save a highlight</span>
            </div>
          )}

          {/* Reading surface */}
          <div
            className="rounded-2xl border shadow-soft px-10 md:px-16 lg:px-20 py-14 transition-colors"
            style={{ background: t.bg, borderColor: t.border, color: t.text }}
          >
            <header className="text-center mb-10">
              <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight" style={{ color: t.text }}>
                Chapter {chapter.number}: {chapter.title}
              </h2>
              <div className="flex items-center justify-center gap-2 mt-4" aria-hidden="true">
                <span className="block h-px w-12" style={{ background: t.border }} />
                <span style={{ color: t.subtle }}>✦</span>
                <span className="block h-px w-12" style={{ background: t.border }} />
              </div>
            </header>

            <article
              className="mx-auto max-w-[680px] space-y-6"
              onMouseUp={handleTextSelect}
              style={{
                fontSize: FONT_SIZES[fontSizeIdx],
                lineHeight: LINE_HEIGHTS[lineHeightIdx],
                fontFamily: prefs.font === 'sans' ? 'system-ui, sans-serif' : prefs.font === 'mono' ? 'monospace' : "'Playfair Display', Georgia, serif",
                cursor: highlightMode ? 'text' : undefined,
              }}
            >
              {chapter.paragraphs.map((p, i) => (
                <p key={i} className="text-justify" style={{ textIndent: i === 0 ? 0 : '1.5em' }}>
                  {searchQuery.trim() ? renderWithSearch(p) : p}
                </p>
              ))}
            </article>

            <footer className="text-center mt-12 text-sm" style={{ color: t.subtle }}>
              · {currentPage} ·
            </footer>
          </div>

          {/* Bottom progress + nav */}
          <div className="bg-white rounded-2xl border border-border shadow-soft p-4 mt-4">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-forest-dark rounded-full transition-all" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex items-center justify-between">
              <button onClick={goPrev} disabled={activeChapter === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  activeChapter === 0
                    ? 'border-gray-100 text-gray-300 cursor-not-allowed'
                    : 'border-border text-ink hover:bg-gray-50'
                }`}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous Chapter
              </button>
              <p className="text-sm text-muted">
                Page {currentPage} of {content.totalPages} · {progressPct}% complete
              </p>
              <button onClick={goNext} disabled={activeChapter >= chaptersTotal - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  activeChapter >= chaptersTotal - 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-forest-dark text-white hover:bg-forest'
                }`}>
                Next Chapter
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="w-72 flex-shrink-0 space-y-4">
          {/* Table of Contents */}
          <div className="bg-white rounded-2xl border border-border shadow-soft p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-ink">Table of Contents</h3>
              <button type="button" className="w-6 h-6 rounded-md hover:bg-gray-50 flex items-center justify-center text-muted" title="Expand">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
            <div className="space-y-0.5 max-h-[280px] overflow-y-auto pr-1">
              {content.chapters.map((c, idx) => (
                <button
                  key={c.number}
                  type="button"
                  onClick={() => { setActiveChapter(idx); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left text-sm transition-colors ${
                    idx === activeChapter
                      ? 'bg-forest-dark/10 text-forest-dark font-semibold'
                      : 'text-muted hover:bg-gray-50 hover:text-ink'
                  }`}
                >
                  <span className={`text-xs font-mono w-5 text-right ${idx === activeChapter ? 'text-forest-dark' : 'text-gray-400'}`}>
                    {c.number}
                  </span>
                  <span className="truncate flex-1">{c.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes & Highlights */}
          <div className="bg-white rounded-2xl border border-border shadow-soft p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-ink">Notes & Highlights</h3>
              <button type="button" onClick={() => setShowNotes(true)} className="text-xs text-forest-dark font-semibold hover:underline">View all</button>
            </div>
            <div className="space-y-2.5">
              {[...userNotes, ...NOTES].slice(0, 2).map((n, i) => (
                <div
                  key={i}
                  className={`relative pl-3 py-2 pr-2 rounded-r-lg text-xs ${
                    n.color === 'amber' ? 'bg-amber-50' : 'bg-emerald-50'
                  }`}
                >
                  <span
                    className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${
                      n.color === 'amber' ? 'bg-amber-400' : 'bg-emerald-500'
                    }`}
                  />
                  <p className="text-ink italic leading-snug line-clamp-3">{n.quote}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-muted">Page {n.page}</span>
                    <span className="text-[10px] text-muted">•</span>
                    <span className={`text-[10px] font-semibold ${n.color === 'amber' ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {n.type === 'highlight' ? 'Highlight' : 'Note'}
                    </span>
                  </div>
                </div>
              ))}
              {userNotes.length === 0 && NOTES.length === 0 && (
                <p className="text-xs text-muted text-center py-3">No notes yet.</p>
              )}
            </div>
          </div>

          {/* Reading Stats */}
          <div className="bg-white rounded-2xl border border-border shadow-soft p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-ink">Reading Stats</h3>
            </div>
            <div className="space-y-3">
              {(() => {
                const rs = getReadingStats();
                const pagesLeft = Math.max(0, content.totalPages - currentPage);
                const minsLeft = Math.round(pagesLeft * 1.5);
                const hLeft = Math.floor(minsLeft / 60);
                const mLeft = minsLeft % 60;
                const timeLeft = hLeft > 0 ? `${hLeft}h ${mLeft}m` : `${mLeft}m`;
                const sessionStr = sessionMinutes > 0 ? `${sessionMinutes}m` : '< 1m';
                return (
                  <>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#F0FDF4] flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-forest-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted">This Session</p>
                        <p className="text-xs text-[#86796B] mt-0.5">Reading time today</p>
                      </div>
                      <p className="text-sm font-bold text-ink">{sessionStr}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted">Estimated Time Left</p>
                        <p className="text-xs text-[#86796B] mt-0.5">At avg. reading pace</p>
                      </div>
                      <p className="text-sm font-bold text-ink">{timeLeft}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8 6 6 9 6 13a6 6 0 0012 0c0-2-1-4-3-6-1 2-3 2-3 0 0-2 0-3 0-5z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted">Reading Streak</p>
                        <p className="text-xs text-[#86796B] mt-0.5">{rs.streak > 0 ? 'Keep it going!' : 'Start your streak!'}</p>
                      </div>
                      <p className="text-sm font-bold text-ink">{rs.streak} day{rs.streak !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-muted">Books Completed</p>
                        <p className="text-xs text-[#86796B] mt-0.5">Overall progress</p>
                      </div>
                      <p className="text-sm font-bold text-ink">{rs.completedCount}</p>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </aside>
      </div>

      {/* Contents modal */}
      {showContents && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowContents(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: 'white', borderRadius: 20, width: 480, maxHeight: '72vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #F3F4F6' }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: '#1F2937', margin: 0 }}>Table of Contents</h3>
              <button type="button" onClick={() => setShowContents(false)}
                style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#F3F4F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#6B7280' }}>✕</button>
            </div>
            <div style={{ overflowY: 'auto', padding: '8px 12px' }}>
              {content.chapters.map((c, idx) => (
                <button key={idx} type="button"
                  onClick={() => { setActiveChapter(idx); saveProgress(book.id, idx, chaptersTotal); setShowContents(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  style={{ width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, background: idx === activeChapter ? '#F0FDF4' : 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 2 }}
                >
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: idx === activeChapter ? '#1B4332' : '#9CA3AF', minWidth: 22, textAlign: 'right' }}>{c.number}</span>
                  <span style={{ fontSize: 14, color: idx === activeChapter ? '#1B4332' : '#374151', fontWeight: idx === activeChapter ? 600 : 400, flex: 1 }}>{c.title}</span>
                  {idx === activeChapter && <span style={{ fontSize: 10, background: '#D1FAE5', color: '#1B4332', padding: '2px 8px', borderRadius: 100, fontWeight: 600 }}>Reading</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notes & Highlights modal */}
      {showNotes && (
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowNotes(false); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <div style={{ background: 'white', borderRadius: 20, width: 520, maxHeight: '78vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid #F3F4F6' }}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: '#1F2937', margin: 0 }}>Notes & Highlights</h3>
              <button type="button" onClick={() => setShowNotes(false)}
                style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#F3F4F6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#6B7280' }}>✕</button>
            </div>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #F3F4F6' }}>
              <textarea
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder={`Add a note for Chapter ${chapter.number}…`}
                rows={2}
                style={{ width: '100%', border: '1px solid #E5E7EB', borderRadius: 10, padding: '8px 12px', fontSize: 13, resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', color: '#1F2937' }}
              />
              <button type="button" onClick={addNote} disabled={!newNoteText.trim()}
                style={{ marginTop: 8, padding: '6px 16px', background: newNoteText.trim() ? '#1B4332' : '#E5E7EB', color: newNoteText.trim() ? 'white' : '#9CA3AF', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: newNoteText.trim() ? 'pointer' : 'not-allowed' }}>
                Save Note
              </button>
            </div>
            <div style={{ overflowY: 'auto', flex: 1, padding: '8px 20px' }}>
              {userNotes.length === 0 ? (
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '12px 0 8px' }}>Example highlights</p>
                  {NOTES.map((n, i) => (
                    <div key={i} style={{ borderLeft: `3px solid ${n.color === 'amber' ? '#F59E0B' : '#10B981'}`, paddingLeft: 12, paddingTop: 8, paddingBottom: 8, marginBottom: 10, background: n.color === 'amber' ? '#FFFBEB' : '#F0FDF4', borderRadius: '0 8px 8px 0' }}>
                      <p style={{ fontSize: 12, color: '#1F2937', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>{n.quote}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                        <span style={{ fontSize: 10, color: '#9CA3AF' }}>Page {n.page}</span>
                        <span style={{ fontSize: 10, color: n.color === 'amber' ? '#D97706' : '#059669', fontWeight: 600 }}>{n.type === 'highlight' ? 'Highlight' : 'Note'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                userNotes.map(n => (
                  <div key={n.id} style={{ borderLeft: `3px solid ${n.color === 'amber' ? '#F59E0B' : '#10B981'}`, paddingLeft: 12, paddingTop: 8, paddingBottom: 8, marginBottom: 10, background: n.color === 'amber' ? '#FFFBEB' : '#F0FDF4', borderRadius: '0 8px 8px 0' }}>
                    <p style={{ fontSize: 12, color: '#1F2937', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>{n.quote}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <span style={{ fontSize: 10, color: '#9CA3AF' }}>Ch. {n.chapter + 1} · Page {n.page}</span>
                      <span style={{ fontSize: 10, color: n.color === 'amber' ? '#D97706' : '#059669', fontWeight: 600 }}>{n.type === 'highlight' ? 'Highlight' : 'Note'}</span>
                      <button type="button" onClick={() => deleteNote(n.id)}
                        style={{ marginLeft: 'auto', fontSize: 10, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: '1px 4px' }}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
