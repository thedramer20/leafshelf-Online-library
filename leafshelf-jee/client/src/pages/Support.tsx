import { useState } from 'react';

const HELP_TOPICS = [
  { emoji: '📚', title: 'Borrowing & Returns', desc: 'How to borrow, renew, and return books', color: 'bg-blue-50 text-blue-600 border-blue-100' },
  { emoji: '👤', title: 'Account & Login', desc: 'Sign in, registration, and account management', color: 'bg-purple-50 text-purple-600 border-purple-100' },
  { emoji: '⬇️', title: 'Downloads & Offline', desc: 'Download books for offline reading', color: 'bg-green-50 text-green-600 border-green-100' },
  { emoji: '🎧', title: 'Audiobooks', desc: 'How to access and listen to audiobooks', color: 'bg-amber-50 text-amber-600 border-amber-100' },
  { emoji: '⭐', title: 'Membership Plans', desc: 'Upgrade, cancel, and manage subscriptions', color: 'bg-pink-50 text-pink-600 border-pink-100' },
  { emoji: '🔧', title: 'Troubleshooting', desc: 'Fix common issues and technical problems', color: 'bg-red-50 text-red-600 border-red-100' },
];

const FAQS = [
  {
    q: 'How do I borrow a book?',
    a: 'To borrow a book, navigate to any book page and click the "Borrow Now" button. If the book is available, it will be added to your library immediately. You can access it from the My Library page. You need to be signed in to borrow books.',
  },
  {
    q: 'How long can I keep a borrowed book?',
    a: 'The standard loan period is 14 days. You can see the exact due date on any borrowed book in your library. If you need more time, you can renew the book as long as no one else is waiting for it.',
  },
  {
    q: 'Can I renew a borrowed book?',
    a: 'Yes! You can renew a book from your My Library page by clicking the "Renew" option in the book\'s menu. Renewals are free and extend your loan by another 14 days. Note that renewal is not available if another user is waiting for that title.',
  },
  {
    q: 'How do I return a book?',
    a: 'Go to My Library, find the book you want to return, and click "Return" next to it. The book will be returned immediately and made available for other readers. Early returns are always welcome!',
  },
  {
    q: 'Why can\'t I download a book?',
    a: 'Downloads require a LeafShelf Premium membership. Free accounts can read books online only. If you have Premium and still cannot download, make sure you\'re connected to the internet, try clearing your browser cache, or contact our support team.',
  },
];

const POPULAR_ARTICLES = [
  'How to set up your reading preferences',
  'Using LeafShelf on multiple devices',
  'Understanding borrow limits and queues',
  'How to create and share reading lists',
  'Getting the most from Premium membership',
];

export default function Support() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex gap-6 p-6 min-h-full">
      {/* Main content */}
      <div className="flex-1 min-w-0">
        <div className="mb-6">
          <h1 className="font-serif text-2xl font-bold text-ink">Support Center</h1>
          <p className="text-sm text-muted mt-1">Find answers, tutorials, and get help from our team</p>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-white border border-border rounded-xl px-4 py-3 mb-8 focus-within:border-forest-dark focus-within:ring-2 focus-within:ring-forest-dark/10 transition-all">
          <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search help articles, topics, or FAQs..."
            className="flex-1 text-sm outline-none bg-transparent text-ink placeholder:text-gray-400" />
        </div>

        {/* Help topics grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {HELP_TOPICS.map(({ emoji, title, desc, color }) => (
            <div key={title} className={`p-5 rounded-xl border ${color} hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer`}>
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{emoji}</span>
                <div>
                  <p className="font-semibold text-sm text-ink">{title}</p>
                  <p className="text-xs text-muted mt-0.5">{desc}</p>
                  <button className="text-xs font-semibold mt-2 hover:underline" style={{ color: 'inherit' }}>
                    View Articles →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ + Contact side by side */}
        <div className="flex gap-6">
          {/* FAQ */}
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-lg font-bold text-ink mb-4">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {FAQS.map((faq, idx) => (
                <div key={idx} className="bg-white rounded-xl border border-border shadow-soft overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-semibold text-ink pr-4">{faq.q}</span>
                    <svg
                      className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${openFaq === idx ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50">
                      <p className="pt-3">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="w-64 flex-shrink-0">
            <h2 className="font-serif text-lg font-bold text-ink mb-4">Contact Support</h2>
            <div className="space-y-3">
              <div className="bg-white rounded-xl border border-border shadow-soft p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">💬</span>
                  <div>
                    <p className="font-semibold text-sm text-ink">Live Chat</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">Online</span>
                  </div>
                </div>
                <p className="text-xs text-muted">Chat with our support team — usually replies in under 2 minutes.</p>
                <button className="mt-3 w-full py-2 bg-forest-dark text-white text-xs font-semibold rounded-lg hover:bg-forest transition-colors">
                  Start Chat
                </button>
              </div>

              <div className="bg-white rounded-xl border border-border shadow-soft p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">✉️</span>
                  <div>
                    <p className="font-semibold text-sm text-ink">Email Support</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">Within 24h</span>
                  </div>
                </div>
                <p className="text-xs text-muted">support@leafshelf.com</p>
              </div>

              <div className="bg-white rounded-xl border border-border shadow-soft p-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">📞</span>
                  <div>
                    <p className="font-semibold text-sm text-ink">Call Us</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">Mon–Fri 9AM–6PM</span>
                  </div>
                </div>
                <p className="text-xs text-muted">+1 (555) 123-4567</p>
              </div>

              <button className="text-sm text-forest-dark hover:text-forest font-medium transition-colors">
                View all contact options →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <aside className="w-60 flex-shrink-0 space-y-4">
        {/* Popular articles */}
        <div className="bg-white rounded-card border border-border shadow-soft p-4">
          <h3 className="font-semibold text-sm text-ink mb-3">Popular Articles</h3>
          <ul className="space-y-2">
            {POPULAR_ARTICLES.map(article => (
              <li key={article}>
                <button className="text-xs text-forest-dark hover:text-forest hover:underline transition-colors text-left">
                  {article}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-card border border-border shadow-soft p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-ink">System Status</h3>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-100">All Operational</span>
          </div>
          <div className="space-y-2">
            {[
              'Website', 'Borrowing Service', 'Downloads', 'Audiobooks', 'User Accounts',
            ].map(service => (
              <div key={service} className="flex items-center justify-between text-xs">
                <span className="text-muted">{service}</span>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-green-700 font-medium">Operational</span>
                </div>
              </div>
            ))}
          </div>
          <button className="text-xs text-forest-dark hover:text-forest font-medium transition-colors mt-3">
            View status page →
          </button>
        </div>

        {/* Need more help */}
        <div className="bg-white rounded-card border border-border shadow-soft p-4">
          <h3 className="font-semibold text-sm text-ink mb-2">Need More Help?</h3>
          <p className="text-xs text-muted mb-3">Our team is here to help you with anything you need.</p>
          <button className="w-full py-2.5 bg-forest-dark text-white text-sm font-semibold rounded-lg hover:bg-forest transition-colors">
            Submit a Ticket
          </button>
          <p className="text-[10px] text-muted text-center mt-2">Average response time: within 24 hours</p>
        </div>
      </aside>
    </div>
  );
}
