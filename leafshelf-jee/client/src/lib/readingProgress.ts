const PROGRESS_KEY = 'leafshelf:reading-progress';

export interface BookProgress {
  bookId: number;
  chapter: number;
  scrollPct: number;
  lastRead: string;
  totalChapters: number;
}

type ProgressMap = Record<number, BookProgress>;

function loadAll(): ProgressMap {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '{}') as ProgressMap;
  } catch {
    return {};
  }
}

export function getProgress(bookId: number): BookProgress | null {
  const all = loadAll();
  return all[bookId] ?? null;
}

export function saveProgress(bookId: number, chapter: number, totalChapters: number, scrollPct = 0): void {
  try {
    const all = loadAll();
    all[bookId] = {
      bookId,
      chapter,
      scrollPct,
      lastRead: new Date().toISOString(),
      totalChapters,
    };
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
  } catch {
    // ignore
  }
}

export function getProgressPct(bookId: number, totalChapters: number): number {
  const p = getProgress(bookId);
  if (!p || totalChapters === 0) return 0;
  return Math.round(((p.chapter + p.scrollPct) / totalChapters) * 100);
}
