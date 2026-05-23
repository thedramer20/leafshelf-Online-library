import { useState } from 'react';

type Format = 'eBook' | 'Audiobook' | 'PDF';
type Status = 'Completed' | 'In Progress';
type FilterTab = 'All Downloads' | 'eBooks' | 'Audiobooks' | 'PDFs' | 'Completed' | 'In Progress';

interface DownloadItem {
  id: number;
  title: string;
  author: string;
  cover: string;
  format: Format;
  fileSize: string;
  downloadedOn: string;
  status: Status;
  progress?: number;
}

const MOCK_DOWNLOADS: DownloadItem[] = [
  { id: 1, title: 'To Kill a Mockingbird', author: 'Harper Lee', cover: '', format: 'eBook', fileSize: '2.1 MB', downloadedOn: 'May 20, 2026', status: 'Completed' },
  { id: 2, title: '1984', author: 'George Orwell', cover: '', format: 'PDF', fileSize: '1.8 MB', downloadedOn: 'May 18, 2026', status: 'Completed' },
  { id: 3, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover: '', format: 'eBook', fileSize: '1.3 MB', downloadedOn: 'May 15, 2026', status: 'Completed' },
  { id: 4, title: 'Brave New World', author: 'Aldous Huxley', cover: '', format: 'Audiobook', fileSize: '128 MB', downloadedOn: 'May 12, 2026', status: 'Completed' },
  { id: 5, title: 'The Alchemist', author: 'Paulo Coelho', cover: '', format: 'eBook', fileSize: '1.6 MB', downloadedOn: 'May 10, 2026', status: 'In Progress', progress: 62 },
  { id: 6, title: 'Pride and Prejudice', author: 'Jane Austen', cover: '', format: 'PDF', fileSize: '2.4 MB', downloadedOn: 'May 8, 2026', status: 'In Progress', progress: 35 },
];

const FILTER_TABS: FilterTab[] = ['All Downloads', 'eBooks', 'Audiobooks', 'PDFs', 'Completed', 'In Progress'];

const FORMAT_ICON: Record<Format, string> = { eBook: '📖', Audiobook: '🎧', PDF: '📄' };
const FORMAT_COLOR: Record<Format, string> = {
  eBook: 'bg-blue-50 text-blue-700',
  Audiobook: 'bg-purple-50 text-purple-700',
  PDF: 'bg-red-50 text-red-700',
};

const STAT_CARDS = [
  { icon: '⬇️', label: 'Total Downloads', value: '68' },
  { icon: '📖', label: 'eBooks', value: '42' },
  { icon: '🎧', label: 'Audiobooks', value: '16' },
  { icon: '💾', label: 'Storage Used', value: '3.2 GB' },
];

const RECENT = [
  { title: 'To Kill a Mockingbird', date: 'May 20' },
  { title: '1984', date: 'May 18' },
  { title: 'Brave New World', date: 'May 12' },
];

export default function Downloads() {
  const [activeTab, setActiveTab] = useState<FilterTab>('All Downloads');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = MOCK_DOWNLOADS.filter(item => {
    if (activeTab === 'All Downloads') return true;
    if (activeTab === 'eBooks') return item.format === 'eBook';
    if (activeTab === 'Audiobooks') return item.format === 'Audiobook';
    if (activeTab === 'PDFs') return item.format === 'PDF';
    if (activeTab === 'Completed') return item.status === 'Completed';
    if (activeTab === 'In Progress') return item.status === 'In Progress';
    return true;
  });

  function handleDelete(id: number) {
    setDeletingId(id);
    setTimeout(() => setDeletingId(null), 1000);
  }

  return (
    <div className="flex gap-6 p-6 min-h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-ink">Downloads</h1>
          <p className="text-sm text-muted mt-1">Manage your offline reading collection</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {STAT_CARDS.map(({ icon, label, value }) => (
            <div key={label} className="bg-white rounded-card border border-border shadow-soft p-4">
              <div className="text-2xl mb-2">{icon}</div>
              <p className="text-2xl font-bold text-ink">{value}</p>
              <p className="text-xs text-muted">{label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border mb-5 overflow-x-auto scrollbar-hide">
          {FILTER_TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${
                activeTab === t ? 'text-forest-dark border-forest-dark' : 'text-muted border-transparent hover:text-ink'
              }`}>
              {t}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Title</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Format</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Size</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Downloaded</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-14 flex-shrink-0 rounded-lg bg-gradient-to-br from-forest-dark/10 to-forest-dark/20 flex items-center justify-center">
                        <span className="text-lg">{FORMAT_ICON[item.format]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-ink line-clamp-1">{item.title}</p>
                        <p className="text-xs text-muted">{item.author}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${FORMAT_COLOR[item.format]}`}>
                      {item.format}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{item.fileSize}</td>
                  <td className="px-4 py-4 text-sm text-muted">{item.downloadedOn}</td>
                  <td className="px-4 py-4">
                    {item.status === 'Completed' ? (
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">Completed</span>
                    ) : (
                      <div>
                        <div className="w-20 bg-gray-100 rounded-full h-1.5 mb-1">
                          <div className="bg-forest-dark rounded-full h-1.5" style={{ width: `${item.progress ?? 0}%` }} />
                        </div>
                        <span className="text-[10px] text-muted">{item.progress}%</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button className="text-xs text-forest-dark hover:text-forest font-medium transition-colors">Open</button>
                      <button onClick={() => handleDelete(item.id)}
                        className="text-xs text-red-500 hover:text-red-600 font-medium transition-colors">
                        {deletingId === item.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-12 text-muted text-sm">No downloads in this category</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right panel */}
      <aside className="w-60 flex-shrink-0 space-y-4">
        {/* Storage donut */}
        <div className="bg-white rounded-card border border-border shadow-soft p-4">
          <h3 className="font-semibold text-sm text-ink mb-4">Offline Storage</h3>
          <div className="flex justify-center mb-3">
            <div className="relative w-24 h-24">
              <svg viewBox="0 0 100 100" className="-rotate-90 w-24 h-24">
                <circle cx="50" cy="50" r="40" fill="none" stroke="#E5E7EB" strokeWidth="12" />
                <circle cx="50" cy="50" r="40" fill="none" stroke="#1B4332" strokeWidth="12"
                  strokeDasharray={`${0.32 * 251} ${251 - 0.32 * 251}`} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-ink">32%</span>
                <span className="text-[10px] text-muted">Used</span>
              </div>
            </div>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between"><span className="text-muted">Used</span><span className="font-medium text-ink">3.2 GB</span></div>
            <div className="flex justify-between"><span className="text-muted">Available</span><span className="font-medium text-ink">6.8 GB</span></div>
            <div className="flex justify-between"><span className="text-muted">Total</span><span className="font-medium text-ink">10 GB</span></div>
          </div>
        </div>

        {/* Download Preferences */}
        <div className="bg-white rounded-card border border-border shadow-soft p-4">
          <h3 className="font-semibold text-sm text-ink mb-3">Download Preferences</h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-muted">Auto-download</span>
              <span className="font-medium text-ink">Wi-Fi only</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">Quality</span>
              <span className="font-medium text-ink">High</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted">Storage limit</span>
              <span className="font-medium text-ink">10 GB</span>
            </div>
          </div>
        </div>

        {/* Recently downloaded */}
        <div className="bg-white rounded-card border border-border shadow-soft p-4">
          <h3 className="font-semibold text-sm text-ink mb-3">Recently Downloaded</h3>
          <div className="space-y-2">
            {RECENT.map(({ title, date }) => (
              <div key={title} className="flex justify-between items-center text-xs">
                <span className="text-ink font-medium line-clamp-1 flex-1 pr-2">{title}</span>
                <span className="text-muted flex-shrink-0">{date}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
