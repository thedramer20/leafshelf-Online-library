/* LeafShelf patch â€” runs after React mounts */

const ARTICLES = {
  "Borrowing & Returns": {
    emoji: "ðŸ“š",
    desc: "How to borrow, renew, and return books",
    items: [
      { icon: "ðŸ“–", title: "How to borrow a book", desc: "Find a book, click Borrow, and it's yours for 14 days." },
      { icon: "ðŸ”„", title: "Returning a book", desc: "Go to My Loans, find the book and click Return." },
      { icon: "â°", title: "Due dates & late returns", desc: "Books are due 14 days after borrowing. Late returns are fine â€” just return when ready." },
      { icon: "ðŸ“‹", title: "Borrow limits", desc: "You can borrow multiple books at once. Check available copies on each book." },
      { icon: "ðŸ”", title: "Renewing a loan", desc: "Return and re-borrow a book to extend your reading time." }
    ]
  },
  "Account & Login": {
    emoji: "ðŸ‘¤",
    desc: "Sign in, registration, and account management",
    items: [
      { icon: "âœ‰ï¸", title: "Creating an account", desc: "Click Sign Up, enter your name, email and password." },
      { icon: "ðŸ”‘", title: "Logging in", desc: "Use your email and password on the login page." },
      { icon: "ðŸ”’", title: "Forgotten password", desc: "Contact support@leafshelf.com to reset your password." },
      { icon: "ðŸ‘ï¸", title: "Viewing your profile", desc: "Your account details are visible after logging in." }
    ]
  },
  "Downloads & Offline": {
    emoji: "â¬‡ï¸",
    desc: "Download books for offline reading",
    items: [
      { icon: "ðŸ“±", title: "Offline reading", desc: "Use the LeafShelf app to download books for offline access." },
      { icon: "ðŸ’¾", title: "Download formats", desc: "Books are available in PDF and EPUB formats." },
      { icon: "ðŸ”—", title: "Sync across devices", desc: "Your loans sync automatically when you log in on any device." }
    ]
  },
  "Audiobooks": {
    emoji: "ðŸŽ§",
    desc: "How to access and listen to audiobooks",
    items: [
      { icon: "ðŸŽ™ï¸", title: "Finding audiobooks", desc: "Filter by Audiobook category in the catalog." },
      { icon: "â–¶ï¸", title: "Playing an audiobook", desc: "Borrow an audiobook and use the built-in player." },
      { icon: "â©", title: "Playback speed", desc: "Adjust playback speed from 0.5Ã— to 2Ã— in the player." }
    ]
  },
  "Membership Plans": {
    emoji: "â­",
    desc: "Upgrade, cancel, and manage subscriptions",
    items: [
      { icon: "ðŸ†“", title: "Free plan", desc: "Borrow up to 2 books at once with the free plan." },
      { icon: "ðŸ’Ž", title: "Premium plan", desc: "Unlimited borrows, audiobooks, and priority support." },
      { icon: "âŒ", title: "Cancelling membership", desc: "Cancel anytime from your account settings. No fees." }
    ]
  },
  "Troubleshooting": {
    emoji: "ðŸ”§",
    desc: "Fix common issues and technical problems",
    items: [
      { icon: "ðŸŒ", title: "Page not loading", desc: "Try refreshing the page or clearing your browser cache." },
      { icon: "ðŸ“µ", title: "Can't borrow a book", desc: "All copies may be borrowed. Check back later or join the queue." },
      { icon: "ðŸ› ï¸", title: "Login issues", desc: "Make sure cookies are enabled and try a different browser." },
      { icon: "ðŸ“§", title: "Contact support", desc: "Email support@leafshelf.com for any unresolved issues." }
    ]
  }
};

function openArticlePanel(title, info) {
  const existing = document.getElementById("ls-articles-overlay");
  if (existing) existing.remove();

  const overlay = document.createElement("div");
  overlay.id = "ls-articles-overlay";

  const articlesHtml = info.items.map(a => `
    <div class="ls-article-item">
      <span class="ls-article-icon">${a.icon}</span>
      <div>
        <div class="ls-article-title">${a.title}</div>
        <div class="ls-article-desc">${a.desc}</div>
      </div>
    </div>
  `).join("");

  overlay.innerHTML = `
    <div id="ls-articles-panel">
      <button id="ls-articles-close" aria-label="Close">âœ•</button>
      <h2>${info.emoji} ${title}</h2>
      <p class="subtitle">${info.desc}</p>
      ${articlesHtml}
    </div>
  `;

  document.body.appendChild(overlay);

  overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.remove();
  });
  document.getElementById("ls-articles-close").addEventListener("click", () => overlay.remove());
  document.addEventListener("keydown", function handler(e) {
    if (e.key === "Escape") { overlay.remove(); document.removeEventListener("keydown", handler); }
  });
}

function attachArticleHandlers() {
  document.querySelectorAll("button").forEach(btn => {
    if (btn.textContent.trim() === "View Articles â†’" && !btn.dataset.viewArticles) {
      btn.dataset.viewArticles = "true";
      btn.addEventListener("click", () => {
        // Find the nearest topic title (sibling p.font-semibold)
        const titleEl = btn.closest("div")?.querySelector("p.font-semibold, p[class*='font-semibold']");
        const topicTitle = titleEl ? titleEl.textContent.trim() : null;
        const info = topicTitle && ARTICLES[topicTitle];
        if (info) {
          openArticlePanel(topicTitle, info);
        } else {
          // Fallback: show first matched category
          const key = Object.keys(ARTICLES).find(k =>
            btn.closest("div")?.textContent.includes(k.split(" ")[0])
          );
          if (key) openArticlePanel(key, ARTICLES[key]);
        }
      });
    }
  });
}

// â”€â”€ Settings panel content â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SETTINGS_CONTENT = {
  account: `
    <div class="ls-settings-section">
      <h3 class="ls-settings-h3">Email Address</h3>
      <p class="ls-settings-hint">Update the email associated with your account.</p>
      <div class="ls-settings-field-row">
        <input class="ls-settings-input" type="email" placeholder="New email address" />
        <button class="ls-settings-btn">Update Email</button>
      </div>
    </div>
    <div class="ls-settings-section">
      <h3 class="ls-settings-h3">Change Password</h3>
      <p class="ls-settings-hint">Choose a strong password you haven't used before.</p>
      <div class="ls-settings-field-col">
        <input class="ls-settings-input" type="password" placeholder="Current password" />
        <input class="ls-settings-input" type="password" placeholder="New password" />
        <input class="ls-settings-input" type="password" placeholder="Confirm new password" />
        <button class="ls-settings-btn">Change Password</button>
      </div>
    </div>
    <div class="ls-settings-section ls-settings-danger-zone">
      <h3 class="ls-settings-h3" style="color:#dc2626">Delete Account</h3>
      <p class="ls-settings-hint">Permanently delete your account and all your data. This cannot be undone.</p>
      <button class="ls-settings-btn ls-settings-btn-danger" onclick="alert('Please contact support@leafshelf.com to delete your account.')">Delete My Account</button>
    </div>`,

  notifications: `
    <div class="ls-settings-section">
      <h3 class="ls-settings-h3">Email Notifications</h3>
      <div class="ls-toggle-row"><span>Loan due reminders</span><label class="ls-toggle"><input type="checkbox" checked /><span class="ls-toggle-slider"></span></label></div>
      <div class="ls-toggle-row"><span>New arrivals in my genres</span><label class="ls-toggle"><input type="checkbox" checked /><span class="ls-toggle-slider"></span></label></div>
      <div class="ls-toggle-row"><span>Weekly reading digest</span><label class="ls-toggle"><input type="checkbox" /><span class="ls-toggle-slider"></span></label></div>
      <div class="ls-toggle-row"><span>Account security alerts</span><label class="ls-toggle"><input type="checkbox" checked /><span class="ls-toggle-slider"></span></label></div>
    </div>
    <div class="ls-settings-section">
      <h3 class="ls-settings-h3">Push Notifications</h3>
      <div class="ls-toggle-row"><span>Return deadline approaching</span><label class="ls-toggle"><input type="checkbox" checked /><span class="ls-toggle-slider"></span></label></div>
      <div class="ls-toggle-row"><span>Book available (from waitlist)</span><label class="ls-toggle"><input type="checkbox" checked /><span class="ls-toggle-slider"></span></label></div>
      <div class="ls-toggle-row"><span>Promotional offers</span><label class="ls-toggle"><input type="checkbox" /><span class="ls-toggle-slider"></span></label></div>
    </div>`,

  privacy: `
    <div class="ls-settings-section">
      <h3 class="ls-settings-h3">Profile Visibility</h3>
      <div class="ls-toggle-row"><span>Show my reading activity to others</span><label class="ls-toggle"><input type="checkbox" /><span class="ls-toggle-slider"></span></label></div>
      <div class="ls-toggle-row"><span>Show my review history publicly</span><label class="ls-toggle"><input type="checkbox" checked /><span class="ls-toggle-slider"></span></label></div>
      <div class="ls-toggle-row"><span>Allow others to see my reading list</span><label class="ls-toggle"><input type="checkbox" /><span class="ls-toggle-slider"></span></label></div>
    </div>
    <div class="ls-settings-section">
      <h3 class="ls-settings-h3">Data & Analytics</h3>
      <div class="ls-toggle-row"><span>Help improve LeafShelf with usage data</span><label class="ls-toggle"><input type="checkbox" checked /><span class="ls-toggle-slider"></span></label></div>
      <div class="ls-toggle-row"><span>Personalised recommendations</span><label class="ls-toggle"><input type="checkbox" checked /><span class="ls-toggle-slider"></span></label></div>
    </div>
    <div class="ls-settings-section">
      <h3 class="ls-settings-h3">Data Export</h3>
      <p class="ls-settings-hint">Download a copy of your reading history, reviews, and account data.</p>
      <button class="ls-settings-btn" onclick="alert('Your data export will be emailed to you within 24 hours.')">Request Data Export</button>
    </div>`,

  "reading-preferences": `
    <div class="ls-settings-section">
      <h3 class="ls-settings-h3">Favourite Genres</h3>
      <p class="ls-settings-hint">Select genres you enjoy â€” we'll highlight matching books.</p>
      <div class="ls-genre-grid">
        ${["Classic","Dystopian","Fantasy","Mystery","Romance","Science Fiction","Horror","Biography","History","Self-Help","Children","Poetry"].map(g=>`<label class="ls-genre-chip"><input type="checkbox" ${["Classic","Fantasy","Mystery"].includes(g)?"checked":""} />${g}</label>`).join("")}
      </div>
    </div>
    <div class="ls-settings-section">
      <h3 class="ls-settings-h3">Reading Language</h3>
      <select class="ls-settings-input" style="max-width:220px">
        <option>English</option><option>Arabic</option><option>French</option><option>Spanish</option><option>German</option>
      </select>
    </div>
    <div class="ls-settings-section">
      <h3 class="ls-settings-h3">Loan Duration Preference</h3>
      <div class="ls-radio-group">
        <label class="ls-radio-row"><input type="radio" name="loan-dur" checked /> 14 days (default)</label>
        <label class="ls-radio-row"><input type="radio" name="loan-dur" /> 7 days (quick reader)</label>
        <label class="ls-radio-row"><input type="radio" name="loan-dur" /> 21 days (extended)</label>
      </div>
    </div>`,

  security: `
    <div class="ls-settings-section">
      <h3 class="ls-settings-h3">Two-Factor Authentication</h3>
      <p class="ls-settings-hint">Add an extra layer of security to your account.</p>
      <div class="ls-toggle-row"><span>Enable 2FA via email</span><label class="ls-toggle"><input type="checkbox" /><span class="ls-toggle-slider"></span></label></div>
    </div>
    <div class="ls-settings-section">
      <h3 class="ls-settings-h3">Active Sessions</h3>
      <p class="ls-settings-hint">Devices currently signed in to your account.</p>
      <div class="ls-session-row"><span>ðŸ–¥ Windows Â· Chrome Â· Now</span><span class="ls-session-badge ls-session-current">Current</span></div>
      <div class="ls-session-row"><span>ðŸ“± iPhone Â· Safari Â· 2 days ago</span><button class="ls-session-revoke" onclick="this.closest('.ls-session-row').remove()">Revoke</button></div>
      <button class="ls-settings-btn" style="margin-top:0.75rem" onclick="alert('All other sessions have been signed out.')">Sign out all other devices</button>
    </div>
    <div class="ls-settings-section">
      <h3 class="ls-settings-h3">Login History</h3>
      <div class="ls-session-row"><span>âœ… Today â€” Windows, Chrome</span></div>
      <div class="ls-session-row"><span>âœ… Yesterday â€” iPhone, Safari</span></div>
      <div class="ls-session-row"><span>âœ… 3 days ago â€” Windows, Firefox</span></div>
    </div>`
};

function tabKeyFromText(text) {
  var raw = (text || "").replace(/settings/gi, "").trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z-]/g, "");
  if (!raw) return null;
  var keys = Object.keys(SETTINGS_CONTENT);
  for (var i = 0; i < keys.length; i++) {
    if (raw === keys[i] || raw.indexOf(keys[i]) !== -1 || keys[i].indexOf(raw) !== -1) return keys[i];
  }
  return null;
}

function addBtnFeedback(container) {
  container.querySelectorAll(".ls-settings-btn").forEach(function(btn) {
    if (btn.classList.contains("ls-settings-btn-danger")) return;
    if (btn.textContent.trim() === "Request Data Export") return;
    btn.addEventListener("click", function() {
      var orig = btn.textContent;
      btn.textContent = "Saved âœ“";
      btn.style.background = "#16a34a";
      btn.style.color = "#fff";
      setTimeout(function() { btn.textContent = orig; btn.style.background = ""; btn.style.color = ""; }, 1800);
    });
  });
}

// Ensure an element and its ancestors are visible (removes Tailwind `hidden` class / inline display:none)
function ensureSettingsPanelVisible(el) {
  var cur = el;
  for (var v = 0; v < 10 && cur && cur !== document.body; v++) {
    if (cur.classList && cur.classList.contains('hidden')) {
      cur.classList.remove('hidden');
    }
    if (cur.style && cur.style.display === 'none') {
      cur.style.display = '';
    }
    cur = cur.parentElement;
  }
}

function fixSettings() {
  // Find leaf-ish elements whose text contains "coming soon"
  // React/Tailwind uses <p> not <h2>, so we check ANY element type
  var allEls = document.querySelectorAll("p, span, small, div, h1, h2, h3, h4");
  for (var i = 0; i < allEls.length; i++) {
    var el = allEls[i];
    if (el._lsFixed) continue;
    if (el.children.length > 1) continue; // skip containers with multiple children
    var txt = el.textContent.trim().toLowerCase();
    if (txt.indexOf("coming soon") === -1) continue;

    el._lsFixed = true;

    // Walk up ancestors to find one whose direct children include a "X Settings" heading
    var ancestor = el.parentElement;
    var injected = false;
    for (var depth = 0; depth < 8 && ancestor && ancestor !== document.body; depth++) {
      if (ancestor._lsSettingsDone) { injected = true; break; }

      var children = ancestor.children;
      var headingText = "";
      for (var c = 0; c < children.length; c++) {
        var child = children[c];
        var ct = child.textContent.trim();
        // Any short child element whose text contains "Settings" (but not "coming soon")
        if (ct.length > 3 && ct.length < 80 &&
            ct.toLowerCase().indexOf("settings") !== -1 &&
            ct.toLowerCase().indexOf("coming soon") === -1) {
          headingText = ct;
          break;
        }
      }

      if (headingText) {
        var tabKey = tabKeyFromText(headingText);
        if (tabKey && SETTINGS_CONTENT[tabKey]) {
          ancestor._lsSettingsDone = true;
          ancestor.innerHTML = '<div class="ls-settings-body">' + SETTINGS_CONTENT[tabKey] + '</div>';
          addBtnFeedback(ancestor);
          // Mobile fix: un-hide any hidden wrapper in the ancestor chain
          ensureSettingsPanelVisible(ancestor);
          injected = true;
          break;
        }
      }
      ancestor = ancestor.parentElement;
    }
  }
}

// Re-run fixSettings after tab clicks so mobile panels reveal on React re-render
function fixSettingsMobileNav() {
  document.querySelectorAll('button, [role="tab"], li, a').forEach(function(btn) {
    if (btn._lsTabNavFixed) return;
    var txt = btn.textContent.trim().toLowerCase();
    if (txt.length > 40) return;
    var isSettingsTab = (
      txt === 'account' || txt === 'notifications' || txt === 'privacy' ||
      txt === 'security' || txt === 'profile' ||
      txt.indexOf('reading') !== -1 || txt.indexOf('preference') !== -1
    );
    if (!isSettingsTab) return;
    btn._lsTabNavFixed = true;
    btn.addEventListener('click', function() {
      // Run twice: once quickly (for already-rendered content) and once after React re-render
      setTimeout(function() {
        fixSettings();
        // Also un-hide any already-injected panel that might be wrapped in a hidden container
        document.querySelectorAll('[data-ls-settings-done], ._lsSettingsDoneParent').forEach(function(p) {
          ensureSettingsPanelVisible(p);
        });
        // Brute-force: find any element with ls-settings-body and ensure its chain is visible
        document.querySelectorAll('.ls-settings-body').forEach(function(body) {
          ensureSettingsPanelVisible(body);
        });
      }, 60);
      setTimeout(function() {
        fixSettings();
        document.querySelectorAll('.ls-settings-body').forEach(function(body) {
          ensureSettingsPanelVisible(body);
        });
      }, 250);
    });
  });
}

// â”€â”€ Audio page fix â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function fixAudioNav() {
  document.querySelectorAll("a, button, [role='link'], nav span, nav div").forEach(el => {
    if (el.dataset.lsAudioFixed) return;
    const txt = el.textContent.trim().toLowerCase();
    if ((txt === "audiobooks" || txt === "audio" || txt.includes("audiobook")) && !el.dataset.lsAudioFixed) {
      el.dataset.lsAudioFixed = "1";
      // Make sure it's clickable
      el.style.cursor = "pointer";
      el.style.pointerEvents = "auto";
      el.style.opacity = "1";
      // If it's a link without href, add click simulation
      if (el.tagName === "A" && !el.getAttribute("href")) {
        el.setAttribute("href", "/audiobooks");
      }
    }
  });
}


const LS_BOOKS = {
  routeKey: "",
  loading: false,
  books: [],
  state: { genre: "", author: "", ebook: false, audiobook: false, epub: false, available: false, checkedOut: false, minRating: 0, sortBy: "newest", page: 1 }
};

function lsBooksPage() {
  return location.pathname === "/books" && Array.from(document.querySelectorAll("h1")).some(el => el.textContent.trim() === "Browse Books");
}

function lsBooksEls() {
  const title = Array.from(document.querySelectorAll("h1")).find(el => el.textContent.trim() === "Browse Books");
  if (!title) return null;
  const root = title.closest("div");
  if (!root) return null;
  const sort = Array.from(root.querySelectorAll("select")).find(el => Array.from(el.options || []).some(opt => opt.value === "newest"));
  const topBar = sort ? sort.closest("div.flex") : null;
  const bannerBtn = Array.from(root.querySelectorAll("button")).find(el => el.textContent.trim() === "Explore Collection");
  const banner = bannerBtn ? bannerBtn.closest("div") : null;
  const aside = Array.from(root.querySelectorAll("aside")).find(el => el.textContent && el.textContent.includes("Filters") && el.textContent.includes("Availability"));
  return { root, sort, topBar, banner, aside };
}

function lsEsc(v) {
  return String(v == null ? "" : v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

function lsStars(rating) {
  let html = '<div class="flex items-center gap-0.5">';
  for (let i = 1; i <= 5; i++) html += `<span class="${i <= Math.round(Number(rating) || 0) ? "text-gold" : "text-gray-200"} text-[11px] leading-none">★</span>`;
  return html + "</div>";
}

function lsBookCard(book) {
  const cover = book.cover_url
    ? `<img src="${lsEsc(book.cover_url)}" alt="${lsEsc(book.title)}" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />`
    : `<div class="absolute inset-0 bg-gradient-to-br from-forest-dark/20 to-forest-dark/40 flex items-end p-2"><span class="text-white text-xs font-medium leading-tight line-clamp-3">${lsEsc(book.title)}</span></div>`;
  return `<div class="ls-book-card bg-white overflow-hidden cursor-pointer transition-all duration-200 group flex flex-col" data-book-id="${book.id}"><div class="relative overflow-hidden flex-shrink-0 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.12)] group-hover:shadow-[0_8px_24px_rgba(0,0,0,0.18)] group-hover:-translate-y-1 transition-all duration-200" style="padding-bottom:150%">${cover}<span class="absolute top-2 right-2 w-2.5 h-2.5 rounded-full border-2 border-white shadow ${book.available ? "bg-green-500" : "bg-red-500"}"></span></div><p class="text-[11px] text-muted truncate mt-2">${lsEsc(book.author)}</p><p class="text-xs font-semibold text-ink line-clamp-2 leading-tight flex-1">${lsEsc(book.title)}</p><div class="flex items-center gap-1 mt-1.5">${lsStars(book.rating)}<span class="text-[10px] text-muted">${Number(book.rating || 0).toFixed(1)}</span></div><div class="flex items-center gap-1.5 mt-1"><span class="w-2 h-2 rounded-full ${book.available ? "bg-[#22C55E]" : "bg-[#EF4444]"}"></span><span class="text-[11px] text-[#6B7280]">${book.available ? "Available" : "Checked Out"}</span></div><button class="ls-borrow mt-2 w-full h-8 border border-[#E5E7EB] rounded-md text-xs font-medium transition-all ${book.available ? "text-[#1B4332] hover:bg-[#1B4332] hover:text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"}" data-borrow-id="${book.id}" ${book.available ? "" : "disabled"}>Borrow</button></div>`;
}

function lsBooksData() {
  const s = LS_BOOKS.state, all = LS_BOOKS.books.slice();
  const authors = Array.from(new Set(all.map(b => b.author).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const genres = Array.from(new Set(all.map(b => b.category).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  const availableCount = all.filter(b => !!b.available).length;
  let filtered = all.filter(b => {
    if (s.genre && b.category !== s.genre) return false;
    if (s.author && b.author !== s.author) return false;
    const formats = [s.ebook && "ebook", s.audiobook && "audiobook", s.epub && "epub"].filter(Boolean);
    if (formats.length && !formats.some(f => f === "ebook" || f === "epub")) return false;
    if (s.available !== s.checkedOut) {
      if (s.available && !b.available) return false;
      if (s.checkedOut && b.available) return false;
    }
    if (s.minRating > 0 && Number(b.rating || 0) < s.minRating) return false;
    return true;
  });
  if (s.sortBy === "rating") filtered.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  else if (s.sortBy === "title") filtered.sort((a, b) => a.title.localeCompare(b.title));
  else if (s.sortBy === "author") filtered.sort((a, b) => a.author.localeCompare(b.author));
  const totalPages = Math.max(1, Math.ceil(filtered.length / 12));
  if (s.page > totalPages) s.page = totalPages;
  if (s.page < 1) s.page = 1;
  return { all, authors, genres, filtered, paged: filtered.slice((s.page - 1) * 12, s.page * 12), totalPages, start: filtered.length ? (s.page - 1) * 12 + 1 : 0, end: Math.min(s.page * 12, filtered.length), availableCount, checkedOutCount: all.length - availableCount, rating4: all.filter(b => Number(b.rating || 0) >= 4).length, rating3: all.filter(b => Number(b.rating || 0) >= 3).length, rating2: all.filter(b => Number(b.rating || 0) >= 2).length, rating1: all.filter(b => Number(b.rating || 0) >= 1).length };
}

function lsBindCheckbox(input, setter) {
  if (input.dataset.lsBooksBound) return;
  input.dataset.lsBooksBound = "1";
  input.addEventListener("change", function() { setter(this.checked); LS_BOOKS.state.page = 1; renderBooksPatch(); });
}

function updateBooksFilterControls(aside, data) {
  if (!aside) return;
  const selects = aside.querySelectorAll("select");
  const genreSelect = selects[0], authorSelect = selects[1];
  if (genreSelect) {
    genreSelect.innerHTML = `<option value="">All Genres</option>${data.genres.map(v => `<option value="${lsEsc(v)}">${lsEsc(v)}</option>`).join("")}`;
    genreSelect.value = LS_BOOKS.state.genre;
    if (!genreSelect.dataset.lsBooksBound) {
      genreSelect.dataset.lsBooksBound = "1";
      genreSelect.addEventListener("change", function() { LS_BOOKS.state.genre = this.value; LS_BOOKS.state.page = 1; renderBooksPatch(); });
    }
  }
  if (authorSelect) {
    authorSelect.innerHTML = `<option value="">All Authors</option>${data.authors.map(v => `<option value="${lsEsc(v)}">${lsEsc(v)}</option>`).join("")}`;
    authorSelect.value = LS_BOOKS.state.author;
    if (!authorSelect.dataset.lsBooksBound) {
      authorSelect.dataset.lsBooksBound = "1";
      authorSelect.addEventListener("change", function() { LS_BOOKS.state.author = this.value; LS_BOOKS.state.page = 1; renderBooksPatch(); });
    }
  }
  aside.querySelectorAll("label").forEach(label => {
    const text = label.textContent.replace(/\s+/g, " ").trim();
    const input = label.querySelector("input[type='checkbox']");
    const count = label.querySelector("span:last-child");
    if (!input || !count) return;
    if (text.includes("eBook")) { count.textContent = String(data.all.length); input.checked = LS_BOOKS.state.ebook; lsBindCheckbox(input, v => LS_BOOKS.state.ebook = v); }
    else if (text.includes("Audiobook")) { count.textContent = "0"; input.checked = LS_BOOKS.state.audiobook; lsBindCheckbox(input, v => LS_BOOKS.state.audiobook = v); }
    else if (text.includes("ePub")) { count.textContent = String(data.all.length); input.checked = LS_BOOKS.state.epub; lsBindCheckbox(input, v => LS_BOOKS.state.epub = v); }
    else if (text.includes("Available Now")) { count.textContent = String(data.availableCount); input.checked = LS_BOOKS.state.available; lsBindCheckbox(input, v => LS_BOOKS.state.available = v); }
    else if (text.includes("Checked Out")) { count.textContent = String(data.checkedOutCount); input.checked = LS_BOOKS.state.checkedOut; lsBindCheckbox(input, v => LS_BOOKS.state.checkedOut = v); }
    else if (text.includes("4") && text.includes("up")) { count.textContent = String(data.rating4); input.checked = LS_BOOKS.state.minRating === 4; lsBindCheckbox(input, v => LS_BOOKS.state.minRating = v ? 4 : 0); }
    else if (text.includes("3") && text.includes("up")) { count.textContent = String(data.rating3); input.checked = LS_BOOKS.state.minRating === 3; lsBindCheckbox(input, v => LS_BOOKS.state.minRating = v ? 3 : 0); }
    else if (text.includes("2") && text.includes("up")) { count.textContent = String(data.rating2); input.checked = LS_BOOKS.state.minRating === 2; lsBindCheckbox(input, v => LS_BOOKS.state.minRating = v ? 2 : 0); }
    else if (text.includes("1") && text.includes("up")) { count.textContent = String(data.rating1); input.checked = LS_BOOKS.state.minRating === 1; lsBindCheckbox(input, v => LS_BOOKS.state.minRating = v ? 1 : 0); }
  });
  const clearBtn = Array.from(aside.querySelectorAll("button")).find(btn => btn.textContent.trim() === "Clear all");
  if (clearBtn && !clearBtn.dataset.lsBooksBound) {
    clearBtn.dataset.lsBooksBound = "1";
    clearBtn.addEventListener("click", function(event) {
      event.preventDefault();
      LS_BOOKS.state = { genre: "", author: "", ebook: false, audiobook: false, epub: false, available: false, checkedOut: false, minRating: 0, sortBy: "newest", page: 1 };
      const searchInput = document.querySelector("input[placeholder*='Search books']");
      if (searchInput) searchInput.value = "";
      history.replaceState({}, "", "/books");
      fetchBooksForPatch();
    });
  }
}

function renderBooksPatch() {
  if (!lsBooksPage()) return;
  const els = lsBooksEls();
  if (!els || !els.topBar || !els.banner) return;
  const data = lsBooksData();
  updateBooksFilterControls(els.aside, data);
  if (els.sort) {
    els.sort.value = LS_BOOKS.state.sortBy;
    if (!els.sort.dataset.lsBooksBound) {
      els.sort.dataset.lsBooksBound = "1";
      els.sort.addEventListener("change", function() { LS_BOOKS.state.sortBy = this.value; LS_BOOKS.state.page = 1; renderBooksPatch(); });
    }
  }
  const statusText = Array.from(els.topBar.querySelectorAll("p")).find(el => el.textContent.includes("Showing"));
  if (statusText) statusText.innerHTML = data.filtered.length ? `Showing <span class="font-medium text-ink">${data.start}-${data.end}</span> of <span class="font-medium text-ink">${data.filtered.length}</span> books` : 'Showing <span class="font-medium text-ink">0</span> of <span class="font-medium text-ink">0</span> books';
  let mount = els.root.querySelector("#ls-books-results");
  if (!mount) {
    mount = document.createElement("div");
    mount.id = "ls-books-results";
    els.banner.parentElement.insertBefore(mount, els.banner);
  }
  mount.innerHTML = data.filtered.length === 0 ? `<div class="text-center py-20"><p class="text-4xl mb-3">🔍</p><p class="font-semibold text-ink mb-1">No books found</p><p class="text-sm text-muted mb-4">Try adjusting your search or filters</p><button class="ls-clear-inline px-4 py-2 bg-forest-dark text-white text-sm rounded-lg hover:bg-forest transition-colors">Clear filters</button></div>` : `<div class="grid gap-4" style="grid-template-columns:repeat(auto-fill, minmax(150px, 1fr))">${data.paged.map(lsBookCard).join("")}</div>${data.totalPages > 1 ? `<div class="flex items-center justify-center gap-1 mt-8"><button class="ls-page-nav w-8 h-8 flex items-center justify-center rounded-md text-sm border border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-40 transition-colors" data-dir="-1" ${LS_BOOKS.state.page === 1 ? "disabled" : ""}>←</button>${Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => i + 1).map(p => `<button class="ls-page-btn w-8 h-8 flex items-center justify-center rounded-md text-sm transition-colors ${p === LS_BOOKS.state.page ? "bg-[#1B4332] text-white" : "border border-[#E5E7EB] hover:bg-gray-50"}" data-page="${p}">${p}</button>`).join("")}${data.totalPages > 5 ? `<span class="px-2 text-muted">...</span>` : ""}<button class="ls-page-nav w-8 h-8 flex items-center justify-center rounded-md text-sm border border-[#E5E7EB] hover:bg-gray-50 disabled:opacity-40 transition-colors" data-dir="1" ${LS_BOOKS.state.page === data.totalPages ? "disabled" : ""}>→</button></div>` : ""}`;
  const contentColumn = mount.parentElement;
  Array.from(contentColumn.children).forEach(child => {
    if (child === mount || child === els.banner || child === els.topBar || (child.contains && child.contains(els.topBar))) return;
    child.style.display = "none";
  });
  mount.querySelectorAll(".ls-book-card").forEach(card => {
    if (card.dataset.lsBooksBound) return;
    card.dataset.lsBooksBound = "1";
    card.addEventListener("click", function(event) {
      if (event.target.closest(".ls-borrow")) return;
      history.pushState({}, "", `/books/${this.getAttribute("data-book-id")}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  });
  mount.querySelectorAll(".ls-borrow").forEach(btn => {
    if (btn.dataset.lsBooksBound) return;
    btn.dataset.lsBooksBound = "1";
    btn.addEventListener("click", async function(event) {
      event.stopPropagation();
      if (this.disabled) return;
      const original = this.textContent;
      this.disabled = true;
      this.textContent = "Borrowing...";
      try {
        const response = await fetch(`/api/loans/borrow/${this.getAttribute("data-borrow-id")}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" } });
        if (response.status === 401) {
          history.pushState({}, "", "/login");
          window.dispatchEvent(new PopStateEvent("popstate"));
          return;
        }
        await fetchBooksForPatch();
      } catch (err) {
        this.disabled = false;
        this.textContent = original;
      }
    });
  });
  mount.querySelectorAll(".ls-page-btn").forEach(btn => btn.addEventListener("click", function() { LS_BOOKS.state.page = Number(this.getAttribute("data-page")); renderBooksPatch(); }, { once: true }));
  mount.querySelectorAll(".ls-page-nav").forEach(btn => btn.addEventListener("click", function() { LS_BOOKS.state.page += Number(this.getAttribute("data-dir")); renderBooksPatch(); }, { once: true }));
  const clearInline = mount.querySelector(".ls-clear-inline");
  if (clearInline) clearInline.addEventListener("click", function() { LS_BOOKS.state = { genre: "", author: "", ebook: false, audiobook: false, epub: false, available: false, checkedOut: false, minRating: 0, sortBy: "newest", page: 1 }; history.replaceState({}, "", "/books"); fetchBooksForPatch(); }, { once: true });
}

async function fetchBooksForPatch() {
  if (!lsBooksPage() || LS_BOOKS.loading) return;
  LS_BOOKS.loading = true;
  try {
    const params = new URLSearchParams(location.search);
    const apiParams = new URLSearchParams();
    if (params.get("search")) apiParams.set("search", params.get("search"));
    if (params.get("category")) apiParams.set("category", params.get("category"));
    const response = await fetch(`/api/books${apiParams.toString() ? `?${apiParams.toString()}` : ""}`, { credentials: "include" });
    const data = await response.json();
    LS_BOOKS.books = Array.isArray(data.books) ? data.books : [];
    LS_BOOKS.routeKey = `${location.pathname}?${location.search}`;
    LS_BOOKS.state.page = 1;
    renderBooksPatch();
  } finally {
    LS_BOOKS.loading = false;
  }
}

function enhanceBooksPage() {
  if (!lsBooksPage()) return;
  const key = `${location.pathname}?${location.search}`;
  const els = lsBooksEls();
  if (!els || !els.topBar || !els.banner) return;
  if (LS_BOOKS.routeKey !== key || LS_BOOKS.books.length === 0) fetchBooksForPatch();
  else renderBooksPatch();
}

const LS_CATALOG = {
  books: [],
  loaded: false,
  loading: false,
  promise: null
};

const LS_FAVORITES = {
  activeTab: "all",
  genre: "",
  removedIds: []
};

function lsCatalogBooks() {
  return LS_CATALOG.books.slice();
}

function lsSaveFavoriteState() {
  try {
    localStorage.setItem("ls-favorites-state", JSON.stringify({
      activeTab: LS_FAVORITES.activeTab,
      genre: LS_FAVORITES.genre,
      removedIds: LS_FAVORITES.removedIds
    }));
  } catch (err) {}
}

function lsLoadFavoriteState() {
  if (LS_FAVORITES._loaded) return;
  LS_FAVORITES._loaded = true;
  try {
    const raw = localStorage.getItem("ls-favorites-state");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      LS_FAVORITES.activeTab = typeof parsed.activeTab === "string" ? parsed.activeTab : "all";
      LS_FAVORITES.genre = typeof parsed.genre === "string" ? parsed.genre : "";
      LS_FAVORITES.removedIds = Array.isArray(parsed.removedIds) ? parsed.removedIds.map(Number).filter(Boolean) : [];
    }
  } catch (err) {}
}

function lsEnsureCatalog() {
  if (LS_CATALOG.loaded) return Promise.resolve(lsCatalogBooks());
  if (LS_CATALOG.promise) return LS_CATALOG.promise;
  LS_CATALOG.loading = true;
  LS_CATALOG.promise = fetch("/api/books", { credentials: "include" })
    .then(res => res.json())
    .then(data => {
      LS_CATALOG.books = Array.isArray(data.books) ? data.books : [];
      LS_CATALOG.loaded = true;
      return lsCatalogBooks();
    })
    .catch(() => [])
    .finally(() => {
      LS_CATALOG.loading = false;
      LS_CATALOG.promise = null;
    });
  return LS_CATALOG.promise;
}

function lsCategoryEntries(books) {
  return Array.from(books.reduce((map, book) => {
    map.set(book.category, (map.get(book.category) || 0) + 1);
    return map;
  }, new Map()).entries()).map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function lsAuthorEntries(books) {
  return Array.from(books.reduce((map, book) => {
    map.set(book.author, (map.get(book.author) || 0) + 1);
    return map;
  }, new Map()).entries()).map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function lsCategoriesPage() {
  return location.pathname === "/categories" && Array.from(document.querySelectorAll("h1")).some(el => el.textContent.trim() === "Browse Categories");
}

function lsFavoritesPage() {
  return location.pathname === "/favorites" && Array.from(document.querySelectorAll("h1")).some(el => el.textContent.trim() === "Favorites");
}

function enhanceCategoriesPage() {
  if (!lsCategoriesPage()) return;
  lsEnsureCatalog().then(books => {
    const title = Array.from(document.querySelectorAll("h1")).find(el => el.textContent.trim() === "Browse Categories");
    const main = title && title.closest(".flex-1");
    if (!main) return;

    const categoryEntries = lsCategoryEntries(books);
    const authorEntries = lsAuthorEntries(books).slice(0, 8);
    if (!categoryEntries.length) return;

    const emojiMap = {
      Classic: "📚",
      Dystopian: "⚠️",
      Fantasy: "✨",
      Fiction: "💡",
      Horror: "📖",
      Romance: "💕"
    };
    const colorMap = {
      Classic: { bg: "#F0FDF4", border: "#D1FAE5", text: "#065F46" },
      Dystopian: { bg: "#FFF7ED", border: "#FED7AA", text: "#9A3412" },
      Fantasy: { bg: "#EFF6FF", border: "#BFDBFE", text: "#1E40AF" },
      Fiction: { bg: "#FDF4FF", border: "#E9D5FF", text: "#6B21A8" },
      Horror: { bg: "#ECFEFF", border: "#A5F3FC", text: "#155E75" },
      Romance: { bg: "#FFF1F2", border: "#FECDD3", text: "#9F1239" }
    };

    const intro = Array.from(main.children).find(el => el.querySelector && el.querySelector("h1"));
    const featuredSection = Array.from(main.children).find(el => el.querySelector && el.querySelector("h2") && el.querySelector("h2").textContent.trim() === "Featured Collections");
    const statsRow = Array.from(main.children).find(el => el.querySelector && el.textContent.includes("Top Categories This Month"));

    let grid = main.querySelector("#ls-categories-grid");
    if (!grid) {
      grid = document.createElement("div");
      grid.id = "ls-categories-grid";
      grid.className = "grid grid-cols-3 gap-4 mb-8";
      if (intro && intro.nextElementSibling) intro.insertAdjacentElement("afterend", grid);
      else if (featuredSection) main.insertBefore(grid, featuredSection);
      else main.appendChild(grid);
    }
    grid.innerHTML = categoryEntries.map(entry => {
      const color = colorMap[entry.name] || { bg: "#FFFFFF", border: "#E5E7EB", text: "#1F2937" };
      return `<button class="ls-category-card text-left p-6 rounded-xl border hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-4" data-category="${lsEsc(entry.name)}" style="background-color:${color.bg};border-color:${color.border}"><div class="w-16 h-16 rounded-xl flex items-center justify-center text-4xl flex-shrink-0" style="background-color:${color.bg}">${emojiMap[entry.name] || "📖"}</div><div><p class="font-bold text-lg" style="color:${color.text}">${lsEsc(entry.name)}</p><p class="text-sm mt-0.5" style="color:${color.text};opacity:0.7">${entry.count} books</p></div></button>`;
    }).join("");
    grid.querySelectorAll(".ls-category-card").forEach(btn => btn.addEventListener("click", function() {
      location.href = `/books?category=${encodeURIComponent(this.getAttribute("data-category"))}`;
    }));

    Array.from(main.children).forEach(child => {
      if (child === intro || child === grid || child === featuredSection || child === statsRow) return;
      if (child.classList && child.classList.contains("grid") && child !== grid) child.style.display = "none";
    });

    if (statsRow) {
      statsRow.className = "flex gap-6 mb-8";
      statsRow.innerHTML = `<section class="flex-1"><h2 class="font-serif text-[20px] font-bold text-ink mb-4">Top Categories</h2><div class="bg-white rounded-card border border-border shadow-soft p-5 space-y-4">${categoryEntries.slice(0, 5).map((entry, idx) => `<button class="ls-top-category w-full text-left flex items-center gap-4" data-category="${lsEsc(entry.name)}"><span class="text-sm font-bold text-muted w-4">${idx + 1}</span><span class="text-sm font-semibold text-ink flex-1">${lsEsc(entry.name)}</span><div class="w-32 bg-gray-100 rounded-full h-1.5 flex-shrink-0"><div class="bg-forest-dark rounded-full h-1.5" style="width:${Math.max(18, Math.round(entry.count / categoryEntries[0].count * 100))}%"></div></div><span class="text-xs text-muted w-20 text-right">${entry.count} books</span></button>`).join("")}</div></section><section class="flex-1"><h2 class="font-serif text-[20px] font-bold text-ink mb-4">Popular Authors</h2><div class="flex flex-wrap gap-2">${authorEntries.map(entry => `<button class="ls-author-chip px-4 py-2 rounded-full text-sm font-medium bg-white border border-border text-ink hover:border-forest-dark hover:text-forest-dark hover:bg-forest-dark/5 transition-colors" data-author="${lsEsc(entry.name)}">${lsEsc(entry.name)} (${entry.count})</button>`).join("")}</div></section>`;
      statsRow.querySelectorAll(".ls-top-category").forEach(btn => btn.addEventListener("click", function() {
        location.href = `/books?category=${encodeURIComponent(this.getAttribute("data-category"))}`;
      }));
      statsRow.querySelectorAll(".ls-author-chip").forEach(btn => btn.addEventListener("click", function() {
        location.href = `/books?search=${encodeURIComponent(this.getAttribute("data-author"))}`;
      }));
    }

    const featuredViewAll = featuredSection && Array.from(featuredSection.querySelectorAll("button")).find(btn => btn.textContent.trim().includes("View all"));
    if (featuredViewAll && !featuredViewAll.dataset.lsBooksLink) {
      featuredViewAll.dataset.lsBooksLink = "1";
      featuredViewAll.addEventListener("click", function() { location.href = "/books"; });
    }

    const statsHeading = Array.from(document.querySelectorAll("h3")).find(el => el.textContent.trim() === "Your Reading Stats");
    if (statsHeading) {
      const card = statsHeading.closest(".bg-white");
      const available = books.filter(book => book.available).length;
      const avgRating = books.length ? (books.reduce((sum, book) => sum + Number(book.rating || 0), 0) / books.length).toFixed(1) : "0.0";
      const topCategory = categoryEntries[0] ? categoryEntries[0].name : "None";
      if (card) {
        card.innerHTML = `<h3 class="font-semibold text-sm text-ink mb-4">Catalog Snapshot</h3><div class="space-y-3 text-sm"><div class="flex justify-between"><span class="text-muted">Total Books</span><span class="font-semibold text-ink">${books.length}</span></div><div class="flex justify-between"><span class="text-muted">Available Now</span><span class="font-semibold text-ink">${available}</span></div><div class="flex justify-between"><span class="text-muted">Categories</span><span class="font-semibold text-ink">${categoryEntries.length}</span></div><div class="flex justify-between"><span class="text-muted">Average Rating</span><span class="font-semibold text-ink">${avgRating}</span></div><div class="flex justify-between"><span class="text-muted">Largest Genre</span><span class="font-semibold text-ink">${lsEsc(topCategory)}</span></div></div>`;
      }
    }
  });
}

function syncVisibleCategoryPage() {
  if (location.pathname !== "/categories") return;
  enhanceCategoriesPage();
}

function lsFavoriteData() {
  lsLoadFavoriteState();
  const removed = new Set(LS_FAVORITES.removedIds);
  const base = lsCatalogBooks().filter(book => !removed.has(book.id));
  const categories = lsCategoryEntries(base);
  const available = base.filter(book => book.available);
  const checkedOut = base.filter(book => !book.available);
  const topRated = base.filter(book => Number(book.rating || 0) >= 4);
  const recent = base.slice().sort((a, b) => {
    const ta = a.created_at ? Date.parse(a.created_at) : 0;
    const tb = b.created_at ? Date.parse(b.created_at) : 0;
    return tb - ta || b.id - a.id;
  });
  const tabCounts = {
    all: base.length,
    available: available.length,
    checkedout: checkedOut.length,
    toprated: topRated.length,
    recent: Math.min(8, recent.length)
  };
  let filtered = base.slice();
  if (LS_FAVORITES.genre) filtered = filtered.filter(book => book.category === LS_FAVORITES.genre);
  if (LS_FAVORITES.activeTab === "available") filtered = filtered.filter(book => book.available);
  else if (LS_FAVORITES.activeTab === "checkedout") filtered = filtered.filter(book => !book.available);
  else if (LS_FAVORITES.activeTab === "toprated") filtered = filtered.filter(book => Number(book.rating || 0) >= 4);
  else if (LS_FAVORITES.activeTab === "recent") filtered = recent.slice(0, 8).filter(book => !LS_FAVORITES.genre || book.category === LS_FAVORITES.genre);
  return { base, filtered, categories, tabCounts, available, topRated, recent };
}

function renderFavoritesPatch() {
  if (!lsFavoritesPage()) return;
  const title = Array.from(document.querySelectorAll("h1")).find(el => el.textContent.trim() === "Favorites");
  const main = title && title.closest(".flex-1");
  const root = main && main.parentElement;
  if (!root || !main) return;
  const data = lsFavoriteData();

  const statsGrid = Array.from(main.children).find(el => el.classList && el.classList.contains("grid") && el.classList.contains("grid-cols-4"));
  if (statsGrid) {
    statsGrid.innerHTML = [
      { icon: "♡", label: "Catalog Books", value: data.base.length },
      { icon: "📗", label: "Available Now", value: data.available.length },
      { icon: "★", label: "Top Rated", value: data.topRated.length },
      { icon: "🕒", label: "Recently Added", value: Math.min(8, data.recent.length) }
    ].map(card => `<div class="bg-white rounded-card border border-border shadow-soft p-4"><div class="text-2xl mb-2">${card.icon}</div><p class="text-2xl font-bold text-ink">${card.value}</p><p class="text-xs text-muted">${card.label}</p></div>`).join("");
  }

  const tabs = Array.from(main.children).find(el => el.classList && el.classList.contains("border-b"));
  if (tabs) {
    const defs = [
      { id: "all", label: "All Books", count: data.tabCounts.all },
      { id: "available", label: "Available", count: data.tabCounts.available },
      { id: "checkedout", label: "Checked Out", count: data.tabCounts.checkedout },
      { id: "toprated", label: "Top Rated", count: data.tabCounts.toprated },
      { id: "recent", label: "Recent", count: data.tabCounts.recent }
    ];
    tabs.innerHTML = defs.map(tab => `<button class="ls-fav-tab flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${LS_FAVORITES.activeTab === tab.id ? "text-forest-dark border-forest-dark" : "text-muted border-transparent hover:text-ink"}" data-tab="${tab.id}">${tab.label} <span class="ml-1 text-[11px] text-muted">(${tab.count})</span></button>`).join("");
    tabs.querySelectorAll(".ls-fav-tab").forEach(btn => btn.addEventListener("click", function() {
      LS_FAVORITES.activeTab = this.getAttribute("data-tab");
      lsSaveFavoriteState();
      renderFavoritesPatch();
    }, { once: true }));
  }

  let mount = main.querySelector("#ls-favorites-results");
  if (!mount) {
    mount = document.createElement("div");
    mount.id = "ls-favorites-results";
    main.appendChild(mount);
  }
  mount.innerHTML = data.filtered.length ? `<div class="grid gap-4" style="grid-template-columns:repeat(auto-fill, minmax(150px, 1fr))">${data.filtered.map(lsBookCard).join("")}</div>` : `<div class="bg-white rounded-card border border-border shadow-soft text-center py-12"><p class="text-lg font-semibold text-ink">No books match this filter</p><p class="text-sm text-muted mt-2">Try a different tab or clear the genre filter.</p><button class="ls-fav-reset mt-4 px-4 py-2 rounded-lg bg-forest-dark text-white text-sm font-medium">Reset filters</button></div>`;

  Array.from(main.children).forEach(child => {
    if (child === mount || child === statsGrid || child === tabs || child.contains && (child.contains(statsGrid) || child.contains(tabs))) return;
    if (child.classList && child.classList.contains("grid") && child !== statsGrid) child.style.display = "none";
  });

  mount.querySelectorAll(".ls-book-card").forEach(card => {
    if (card.dataset.lsFavBound) return;
    card.dataset.lsFavBound = "1";
    card.addEventListener("click", function(event) {
      if (event.target.closest(".ls-borrow") || event.target.closest(".ls-fav-remove")) return;
      history.pushState({}, "", `/books/${this.getAttribute("data-book-id")}`);
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
  });
  mount.querySelectorAll(".ls-borrow").forEach(btn => {
    if (btn.dataset.lsFavBound) return;
    btn.dataset.lsFavBound = "1";
    btn.addEventListener("click", async function(event) {
      event.stopPropagation();
      if (this.disabled) return;
      const original = this.textContent;
      this.disabled = true;
      this.textContent = "Borrowing...";
      try {
        const response = await fetch(`/api/loans/borrow/${this.getAttribute("data-borrow-id")}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" } });
        if (response.status === 401) {
          history.pushState({}, "", "/login");
          window.dispatchEvent(new PopStateEvent("popstate"));
          return;
        }
        LS_CATALOG.loaded = false;
        lsEnsureCatalog().then(renderFavoritesPatch);
      } catch (err) {
        this.disabled = false;
        this.textContent = original;
      }
    });
  });
  mount.querySelectorAll(".ls-book-card").forEach(card => {
    let remove = card.querySelector(".ls-fav-remove");
    if (!remove) {
      remove = document.createElement("button");
      remove.className = "ls-fav-remove absolute top-2 left-2 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center";
      remove.textContent = "x";
      const cover = card.querySelector("div[style*='padding-bottom']");
      if (cover) cover.appendChild(remove);
    }
  });
  mount.querySelectorAll(".ls-fav-remove").forEach(btn => {
    if (btn.dataset.lsFavBound) return;
    btn.dataset.lsFavBound = "1";
    btn.addEventListener("click", function(event) {
      event.stopPropagation();
      const card = this.closest(".ls-book-card");
      const id = Number(card && card.getAttribute("data-book-id"));
      if (!id) return;
      LS_FAVORITES.removedIds = LS_FAVORITES.removedIds.filter(value => value !== id);
      LS_FAVORITES.removedIds.push(id);
      lsSaveFavoriteState();
      renderFavoritesPatch();
    });
  });
  const reset = mount.querySelector(".ls-fav-reset");
  if (reset) reset.addEventListener("click", function() {
    LS_FAVORITES.activeTab = "all";
    LS_FAVORITES.genre = "";
    lsSaveFavoriteState();
    renderFavoritesPatch();
  }, { once: true });

  const genreHeading = Array.from(root.querySelectorAll("h3")).find(el => el.textContent.trim() === "Favorite Genres");
  if (genreHeading) {
    const panel = genreHeading.closest(".bg-white");
    if (panel) panel.innerHTML = `<h3 class="font-semibold text-sm text-ink mb-4">Genre Distribution</h3><div class="space-y-3">${data.categories.slice(0, 5).map(entry => `<div><div class="flex justify-between text-xs mb-1"><span class="text-ink font-medium">${lsEsc(entry.name)}</span><span class="text-muted">${entry.count} books</span></div><div class="w-full bg-gray-100 rounded-full h-1.5"><div class="bg-forest-dark rounded-full h-1.5" style="width:${Math.max(12, Math.round(entry.count / (data.categories[0] ? data.categories[0].count : 1) * 100))}%"></div></div></div>`).join("")}</div>`;
  }

  const moodHeading = Array.from(root.querySelectorAll("h3")).find(el => el.textContent.trim() === "Reading Mood");
  if (moodHeading) {
    const panel = moodHeading.closest(".bg-white");
    if (panel) panel.innerHTML = `<h3 class="font-semibold text-sm text-ink mb-3">Browse by Genre</h3><div class="flex flex-wrap gap-2"><button class="ls-fav-genre px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${LS_FAVORITES.genre === "" ? "bg-forest-dark text-white" : "bg-gray-50 text-muted border border-gray-200 hover:border-forest-dark hover:text-forest-dark"}" data-genre="">All</button>${data.categories.map(entry => `<button class="ls-fav-genre px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${LS_FAVORITES.genre === entry.name ? "bg-forest-dark text-white" : "bg-gray-50 text-muted border border-gray-200 hover:border-forest-dark hover:text-forest-dark"}" data-genre="${lsEsc(entry.name)}">${lsEsc(entry.name)} (${entry.count})</button>`).join("")}</div>`;
    if (panel) panel.querySelectorAll(".ls-fav-genre").forEach(btn => btn.addEventListener("click", function() {
      LS_FAVORITES.genre = this.getAttribute("data-genre") || "";
      lsSaveFavoriteState();
      renderFavoritesPatch();
    }, { once: true }));
  }
}

function enhanceFavoritesPage() {
  if (!lsFavoritesPage()) return;
  lsEnsureCatalog().then(renderFavoritesPatch);
}
// Observe DOM changes to attach handlers when React renders the support page
const observer = new MutationObserver(() => {
  attachArticleHandlers();
  fixSettings();
  fixAudioNav();
  fixSettingsMobileNav();
  enhanceBooksPage();
  enhanceCategoriesPage();
  syncVisibleCategoryPage();
  enhanceFavoritesPage();
});
observer.observe(document.body, { childList: true, subtree: true });

// Initial attach (in case page already rendered)
window.addEventListener("load", () => {
  attachArticleHandlers();
  fixSettings();
  fixAudioNav();
  fixSettingsMobileNav();
  enhanceBooksPage();
  enhanceCategoriesPage();
  syncVisibleCategoryPage();
  enhanceFavoritesPage();
});
