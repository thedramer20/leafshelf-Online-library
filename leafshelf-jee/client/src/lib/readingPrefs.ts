const PREFS_KEY = 'leafshelf:reading-prefs';

export type ReaderTheme = 'sepia' | 'light' | 'dark';
export type ReaderFont = 'serif' | 'sans' | 'mono';

export interface ReadingPrefs {
  fontSize: number;
  lineSpacing: number;
  theme: ReaderTheme;
  font: ReaderFont;
  autoBookmark: boolean;
  nightLight: boolean;
}

const DEFAULT_PREFS: ReadingPrefs = {
  fontSize: 16,
  lineSpacing: 1.7,
  theme: 'sepia',
  font: 'serif',
  autoBookmark: true,
  nightLight: false,
};

export function getReadingPrefs(): ReadingPrefs {
  try {
    const stored = localStorage.getItem(PREFS_KEY);
    if (!stored) return { ...DEFAULT_PREFS };
    return { ...DEFAULT_PREFS, ...JSON.parse(stored) as Partial<ReadingPrefs> };
  } catch {
    return { ...DEFAULT_PREFS };
  }
}

export function saveReadingPrefs(prefs: Partial<ReadingPrefs>): void {
  try {
    const current = getReadingPrefs();
    localStorage.setItem(PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
  } catch {
    // ignore storage errors
  }
}
