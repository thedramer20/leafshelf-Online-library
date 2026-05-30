import { getFavoriteIds, getLocalBorrowed, getLocalReturned } from './api';

export interface ReadingStats {
  booksRead: number;
  currentlyReading: number;
  totalPages: number;
  estimatedHours: number;
  streak: number;
  goalTarget: number;
  goalPct: number;
  favoriteGenre: string | null;
  recentCategories: string[];
  allBooks: number;
  savedCount: number;
  completedCount: number;
}

export function getReadingStats(): ReadingStats {
  const borrowed = getLocalBorrowed();
  const returned = getLocalReturned();

  const booksRead = returned.length;
  const currentlyReading = borrowed.length;
  const allBooks = borrowed.length + returned.length;
  const savedCount = getFavoriteIds().length;
  const completedCount = returned.length;

  const allEntries = [...borrowed, ...returned];
  const totalPages = allEntries.reduce((sum, b) => sum + (b.pages ?? 300), 0);
  const estimatedHours = Math.max(0, Math.round(totalPages / 40));

  // Streak: days since user first borrowed (capped at books * 3 days max)
  let streak = 0;
  if (allEntries.length > 0) {
    const timestamps: number[] = [];
    for (const b of allEntries) {
      const d = new Date(b.borrowedAt).getTime();
      if (!isNaN(d)) timestamps.push(d);
    }
    if (timestamps.length > 0) {
      const daysActive = Math.ceil((Date.now() - Math.min(...timestamps)) / 86400000);
      streak = Math.min(daysActive, allEntries.length * 3);
    }
  }

  // Favorite genre from borrowing history
  const genreCounts: Record<string, number> = {};
  for (const b of allEntries) {
    if (b.category) {
      genreCounts[b.category] = (genreCounts[b.category] ?? 0) + 1;
    }
  }
  const favoriteGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const recentCategories = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);

  const goalTarget = 12;
  const goalPct = Math.min(1, allEntries.length / goalTarget);

  return {
    booksRead,
    currentlyReading,
    totalPages,
    estimatedHours,
    streak,
    goalTarget,
    goalPct,
    favoriteGenre,
    recentCategories,
    allBooks,
    savedCount,
    completedCount,
  };
}

export function getReadingStatsDisplay(stats: ReadingStats) {
  const hrs = stats.estimatedHours;
  const h = Math.floor(hrs);
  const m = Math.round((hrs - h) * 60);
  const timeStr = h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
  const pctStr = `${Math.round(stats.goalPct * 100)}%`;
  return { timeStr, pctStr };
}
