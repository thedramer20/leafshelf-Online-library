(function () {
  function normalize(text) {
    return (text || "").replace(/\s+/g, " ").trim();
  }

  if (window.location.pathname === "/register" && !window.location.search.includes("immersive=1")) {
    window.location.replace("/login?tab=register&immersive=1");
    return;
  }

  function syncImmersiveAuthClass() {
    const isImmersiveAuth =
      window.location.pathname === "/login" &&
      (!!document.querySelector("video") || new URLSearchParams(window.location.search).get("immersive") === "1");
    document.documentElement.classList.toggle("ls-auth-immersive", isImmersiveAuth);
    document.body.classList.toggle("ls-auth-immersive", isImmersiveAuth);
  }

  function applyAuthFieldFixes() {
    if (!document.body.classList.contains("ls-auth-immersive")) return;

    const fields = Array.from(document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]'));
    fields.forEach((input) => {
      const wrap = input.parentElement;
      if (!wrap) return;

      input.style.paddingLeft = "52px";
      input.style.paddingRight = input.type === "password" ? "52px" : "20px";
      input.style.textIndent = "0";
      input.style.position = "relative";
      input.style.zIndex = "1";

      const icons = wrap.querySelectorAll("span");
      icons.forEach((icon, index) => {
        icon.style.position = "absolute";
        icon.style.top = "50%";
        icon.style.transform = "translateY(-50%)";
        icon.style.display = "flex";
        icon.style.alignItems = "center";
        icon.style.justifyContent = "center";
        icon.style.lineHeight = "1";
        icon.style.zIndex = "2";
        if (index === 0) {
          icon.style.left = "16px";
          icon.style.right = "auto";
        } else {
          icon.style.right = "16px";
          icon.style.left = "auto";
        }
      });
    });
  }

  function syncImmersiveLoginAutofill() {
    if (window.location.pathname !== "/login") return;

    const form = document.querySelector("#login-form form");
    if (!form || form.dataset.lsAutofillSyncBound === "1") return;
    form.dataset.lsAutofillSyncBound = "1";

    const setNativeValue = (input, value) => {
      const prototype = Object.getPrototypeOf(input);
      const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
      if (descriptor && typeof descriptor.set === "function") {
        descriptor.set.call(input, value);
      } else {
        input.value = value;
      }
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    };

    const syncInputs = () => {
      Array.from(form.querySelectorAll('input[type="email"], input[type="password"]')).forEach((input) => {
        if (input.value) {
          setNativeValue(input, input.value);
        }
      });
    };

    const submitButton = form.querySelector('button[type="submit"]');
    const ensureErrorBox = () => {
      let box = form.querySelector("[data-ls-login-error='1']");
      if (!box) {
        box = document.createElement("div");
        box.dataset.lsLoginError = "1";
        box.style.background = "#fef2f2";
        box.style.border = "1px solid #fecaca";
        box.style.borderRadius = "0.75rem";
        box.style.padding = "12px 16px";
        box.style.marginBottom = "20px";
        box.style.fontSize = "14px";
        box.style.color = "#b91c1c";
        form.insertBefore(box, form.firstElementChild || null);
      }
      return box;
    };

    const clearErrorBox = () => {
      const existing = form.querySelector("[data-ls-login-error='1']");
      if (existing) existing.remove();
    };

    const writeAuthUserCache = async (payload) => {
      try {
        let user = payload && payload.user ? payload.user : null;
        if (!user) {
          const meResponse = await fetch("/api/auth/me", { credentials: "include" });
          if (meResponse.ok) {
            const mePayload = await meResponse.json().catch(() => ({}));
            user = mePayload && mePayload.user ? mePayload.user : null;
          }
        }
        if (user) {
          window.sessionStorage.setItem("leafshelf:cache:auth:user", JSON.stringify(user));
        }
      } catch (_) {
        // ignore cache sync failures here; the server session is still the source of truth
      }
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (form.dataset.lsLoginSubmitting === "1") return;

      syncInputs();

      const emailInput = form.querySelector('input[type="email"]');
      const passwordInput = form.querySelector('input[type="password"]');
      const email = normalize(emailInput && emailInput.value).toLowerCase();
      const password = passwordInput ? passwordInput.value : "";

      if (!form.reportValidity()) return;

      form.dataset.lsLoginSubmitting = "1";
      clearErrorBox();

      const originalLabel = submitButton ? submitButton.innerHTML : "";
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Signing in...";
      }

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(payload.error || "Unable to sign in");
        }
        await writeAuthUserCache(payload);
        window.location.replace("/");
      } catch (error) {
        ensureErrorBox().textContent = error && error.message ? error.message : "Unable to sign in";
      } finally {
        form.dataset.lsLoginSubmitting = "0";
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalLabel;
        }
      }
    }, true);

    const syncTimer = window.setInterval(syncInputs, 350);
    window.setTimeout(() => window.clearInterval(syncTimer), 5000);
    setTimeout(syncInputs, 120);
    setTimeout(syncInputs, 800);
  }

  syncImmersiveAuthClass();
  applyAuthFieldFixes();
  syncImmersiveLoginAutofill();
  window.addEventListener("load", syncImmersiveAuthClass);
  window.addEventListener("load", applyAuthFieldFixes);
  window.addEventListener("load", syncImmersiveLoginAutofill);
  setTimeout(syncImmersiveAuthClass, 250);
  setTimeout(applyAuthFieldFixes, 250);
  setTimeout(syncImmersiveLoginAutofill, 250);
  setTimeout(syncImmersiveAuthClass, 1000);
  setTimeout(applyAuthFieldFixes, 1000);
  setTimeout(syncImmersiveLoginAutofill, 1000);

  if (window.location.pathname === "/login" && new URLSearchParams(window.location.search).get("tab") === "register") {
    window.addEventListener("load", () => {
      const pickRegister = () => {
        const button = Array.from(document.querySelectorAll("button")).find(
          (el) => normalize(el.textContent) === "Create Account",
        );
        if (button) {
          button.click();
          return true;
        }
        return false;
      };

      if (!pickRegister()) {
        let tries = 0;
        const timer = setInterval(() => {
          tries += 1;
          if (pickRegister() || tries > 20) {
            clearInterval(timer);
          }
        }, 200);
      }
    }, { once: true });
  }

  const SUPPORT_ARTICLES = {
    "Borrowing & Reading": [
      { icon: "📚", title: "How borrowing works", desc: "Learn how to borrow, renew, and return books." },
      { icon: "⏱️", title: "Loan periods", desc: "Check borrowing durations and renewal rules." },
      { icon: "🔁", title: "Managing renewals", desc: "See when a renewal is available and how to use it." },
    ],
    "Account & Security": [
      { icon: "🔐", title: "Password and sign-in help", desc: "Reset your password and protect your account." },
      { icon: "📱", title: "Device access", desc: "Manage devices and secure your reading sessions." },
      { icon: "🛡️", title: "Privacy controls", desc: "Review privacy and notification settings." },
    ],
    "Downloads & Offline": [
      { icon: "⬇️", title: "Offline reading setup", desc: "Prepare books for offline access." },
      { icon: "💾", title: "Storage tips", desc: "Free space and manage downloaded items." },
      { icon: "🎧", title: "Audio downloads", desc: "Listen offline with audiobook downloads." },
    ],
    "Technical Support": [
      { icon: "🧰", title: "Troubleshooting basics", desc: "Fix common loading and playback issues." },
      { icon: "🌐", title: "Connection issues", desc: "Understand what to do when sync fails." },
      { icon: "🧪", title: "Service status", desc: "Check whether LeafShelf services are healthy." },
    ],
    "Premium Features": [
      { icon: "✨", title: "Premium overview", desc: "See what extra features premium unlocks." },
      { icon: "📖", title: "Extended borrowing", desc: "Borrow more titles and access bonus perks." },
      { icon: "🎯", title: "Recommendations", desc: "Get more tailored reading suggestions." },
    ],
  };

  const FAVORITES_KEY = "leafshelf:favorites";
  let catalogPromise = null;
  let favoritesFilter = "all";
  let pageRefreshTimer = 0;
  let lastObservedUrl = `${window.location.pathname}${window.location.search}`;

  function normalizeKey(text) {
    return normalize(text).toLowerCase();
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  async function getCatalog() {
    if (!catalogPromise) {
      catalogPromise = fetch("/api/books")
        .then((res) => {
          if (!res.ok) throw new Error("Unable to load books");
          return res.json();
        })
        .then((data) => Array.isArray(data?.books) ? data.books : [])
        .catch((error) => {
          console.error("LeafShelf favorites: failed to load catalog", error);
          return [];
        });
    }
    return catalogPromise;
  }

  function getFavoriteIds() {
    try {
      const parsed = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.map((value) => Number(value)).filter((value) => Number.isFinite(value));
    } catch {
      return [];
    }
  }

  function setFavoriteIds(ids) {
    const uniqueIds = Array.from(new Set(ids.map((value) => Number(value)).filter((value) => Number.isFinite(value))));
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(uniqueIds));
    window.dispatchEvent(new CustomEvent("leafshelf:favorites-changed", { detail: uniqueIds }));
  }

  function isFavorite(bookId) {
    return getFavoriteIds().includes(Number(bookId));
  }

  function toggleFavorite(bookId) {
    const numericId = Number(bookId);
    const currentIds = getFavoriteIds();
    if (currentIds.includes(numericId)) {
      setFavoriteIds(currentIds.filter((id) => id !== numericId));
      return false;
    }
    setFavoriteIds([numericId, ...currentIds]);
    return true;
  }

  function summarizeFavorites(books) {
    const categories = new Map();
    const authors = new Map();
    let ratingTotal = 0;
    let availableNow = 0;

    books.forEach((book) => {
      const category = normalize(book.category) || "Other";
      const author = normalize(book.author) || "Unknown";
      categories.set(category, (categories.get(category) || 0) + 1);
      authors.set(author, (authors.get(author) || 0) + 1);
      ratingTotal += Number(book.rating) || 0;
      if (book.available) availableNow += 1;
    });

    return {
      availableNow,
      averageRating: books.length ? (ratingTotal / books.length).toFixed(1) : "0.0",
      categories: Array.from(categories.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
      authors: Array.from(authors.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
    };
  }

  function ensureFavoritesStyles() {
    if (document.getElementById("ls-favorites-styles")) return;

    const style = document.createElement("style");
    style.id = "ls-favorites-styles";
    style.textContent = `
      .ls-favorite-button {
        position: absolute;
        top: 10px;
        left: 10px;
        width: 34px;
        height: 34px;
        border: 1px solid rgba(255,255,255,0.9);
        border-radius: 999px;
        background: rgba(255,255,255,0.92);
        color: #4b5563;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        line-height: 1;
        box-shadow: 0 10px 24px rgba(15, 23, 42, 0.14);
        cursor: pointer;
        transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease;
        z-index: 3;
      }

      .ls-favorite-button:hover {
        transform: translateY(-1px);
      }

      .ls-favorite-button.is-active {
        background: #fee2e2;
        border-color: #fecaca;
        color: #dc2626;
      }

      .ls-favorite-card {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
      }

      .ls-favorite-card-cover {
        position: relative;
        aspect-ratio: 2 / 3;
        overflow: hidden;
        background: #f8fafc;
      }

      .ls-favorite-card-cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .ls-favorite-pill {
        border: 1px solid #d1d5db;
        border-radius: 999px;
        padding: 8px 14px;
        background: #fff;
        color: #374151;
        font-size: 13px;
        font-weight: 600;
        transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
      }

      .ls-favorite-pill.is-active {
        background: #1b4332;
        border-color: #1b4332;
        color: #fff;
      }

      .ls-favorites-empty {
        border: 1px dashed #cbd5e1;
        border-radius: 20px;
        background: linear-gradient(135deg, #f8fafc 0%, #f0fdf4 100%);
      }

      .ls-favorites-stat {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06);
      }
    `;
    document.head.appendChild(style);
  }

  function findBookByTitle(books, title) {
    const wanted = normalizeKey(title);
    return books.find((book) => normalizeKey(book.title) === wanted) || null;
  }

  function countBorrowButtons(node) {
    return Array.from(node.querySelectorAll("button")).filter(
      (button) => normalize(button.textContent) === "Borrow",
    ).length;
  }

  function getCardFromBorrowButton(button) {
    let node = button.parentElement;
    while (node && node !== document.body) {
      const imageCount = node.querySelectorAll("img[alt]").length;
      if (imageCount === 1 && countBorrowButtons(node) === 1) {
        return node;
      }
      if (node.tagName === "SECTION" || node.tagName === "MAIN") {
        break;
      }
      node = node.parentElement;
    }
    return null;
  }

  function updateFavoriteButton(button, book) {
    const active = isFavorite(book.id);
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-label", active ? `Remove ${book.title} from favorites` : `Add ${book.title} to favorites`);
    button.setAttribute("title", active ? "Remove from favorites" : "Add to favorites");
    button.innerHTML = active ? "&#9829;" : "&#9825;";
  }

  function decorateBookCards(books) {
    ensureFavoritesStyles();

    const borrowButtons = Array.from(document.querySelectorAll("button")).filter(
      (button) => normalize(button.textContent) === "Borrow",
    );
    const seenCards = new Set();

    borrowButtons.forEach((borrowButton) => {
      const card = getCardFromBorrowButton(borrowButton);
      if (!card || seenCards.has(card)) return;
      seenCards.add(card);

      const image = card.querySelector("img[alt]");
      const mediaWrap = image?.parentElement;
      if (!image || !mediaWrap) return;

      const book = findBookByTitle(books, image.alt);
      if (!book) return;

      mediaWrap.style.position = mediaWrap.style.position || "relative";
      let favoriteButton = mediaWrap.querySelector("[data-ls-favorite-toggle='1']");

      if (!favoriteButton) {
        favoriteButton = document.createElement("button");
        favoriteButton.type = "button";
        favoriteButton.className = "ls-favorite-button";
        favoriteButton.dataset.lsFavoriteToggle = "1";
        favoriteButton.dataset.bookId = String(book.id);
        favoriteButton.addEventListener("click", (event) => {
          event.preventDefault();
          event.stopPropagation();
          toggleFavorite(book.id);
        });
        mediaWrap.appendChild(favoriteButton);
      }

      favoriteButton.dataset.bookId = String(book.id);
      updateFavoriteButton(favoriteButton, book);
    });
  }

  function findCurrentDetailBook(books) {
    if (!/^\/books\/\d+/.test(window.location.pathname)) return null;

    const pathId = Number(window.location.pathname.split("/").pop());
    if (Number.isFinite(pathId)) {
      const byId = books.find((book) => Number(book.id) === pathId);
      if (byId) return byId;
    }

    const title = document.querySelector("h1")?.textContent;
    const authorLine = Array.from(document.querySelectorAll("p, span, div"))
      .map((el) => normalize(el.textContent))
      .find((text) => text.startsWith("by "));
    const author = authorLine ? authorLine.replace(/^by\s+/i, "") : "";

    return books.find((book) =>
      normalizeKey(book.title) === normalizeKey(title) &&
      (!author || normalizeKey(book.author) === normalizeKey(author))
    ) || null;
  }

  function syncDetailFavoriteButton(books) {
    const book = findCurrentDetailBook(books);
    if (!book) return;

    const detailButton = Array.from(document.querySelectorAll("button")).find((button) => {
      const text = normalize(button.textContent);
      return (
        button.dataset.lsFavoriteToggle === "1" ||
        text.includes("Save to Library") ||
        text.includes("Add to Favorites") ||
        text.includes("Remove from Favorites")
      );
    });
    if (!detailButton) return;

    detailButton.dataset.lsFavoriteToggle = "1";
    detailButton.dataset.bookId = String(book.id);

    const active = isFavorite(book.id);
    detailButton.innerHTML = active ? "? Remove from Favorites" : "? Add to Favorites";
    detailButton.setAttribute("aria-label", active ? `Remove ${book.title} from favorites` : `Add ${book.title} to favorites`);
    detailButton.style.borderColor = active ? "#fecaca" : "#e5e7eb";
    detailButton.style.background = active ? "#fff1f2" : "";
    detailButton.style.color = active ? "#b91c1c" : "";
  }

  function readDownloadsState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(DOWNLOADS_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }

  function writeDownloadsState(nextState) {
    localStorage.setItem(DOWNLOADS_KEY, JSON.stringify(nextState));
  }

  function estimateBookDownload(book, format) {
    if (format === "Audiobook") {
      return Math.max(48, Math.round((Math.max(180, Math.round((Number(book.pages) || 300) * 1.7))) * 0.22));
    }
    return Math.max(1.1, Number((((Number(book.pages) || 250) / 220)).toFixed(1)));
  }

  function upsertDownloadEntry(book, format, extra) {
    const state = readDownloadsState();
    state[String(book.id)] = {
      bookId: Number(book.id),
      format,
      sizeMb: estimateBookDownload(book, format),
      downloadedAt: new Date().toISOString(),
      progress: format === "Audiobook" ? Math.max(0, Math.min(100, Number(extra?.progress) || 0)) : 100,
      completed: format === "Audiobook" ? !!extra?.completed : true,
    };
    writeDownloadsState(state);
  }

  function removeDownloadEntry(bookId) {
    const state = readDownloadsState();
    delete state[String(bookId)];
    writeDownloadsState(state);
  }

  function syncDetailDownloadButton(books) {
    const book = findCurrentDetailBook(books);
    if (!book) return;

    const favoriteButton = Array.from(document.querySelectorAll("button")).find((button) => {
      const text = normalize(button.textContent);
      return text.includes("Add to Favorites") || text.includes("Remove from Favorites") || button.dataset.lsFavoriteToggle === "1";
    });
    if (!favoriteButton || !favoriteButton.parentElement) return;

    let downloadButton = favoriteButton.parentElement.querySelector("[data-ls-detail-download='1']");
    if (!downloadButton) {
      downloadButton = document.createElement("button");
      downloadButton.type = "button";
      downloadButton.dataset.lsDetailDownload = "1";
      downloadButton.className = favoriteButton.className;
      favoriteButton.insertAdjacentElement("afterend", downloadButton);
    }

    const downloadsState = readDownloadsState();
    const hasDownload = !!downloadsState[String(book.id)];
    downloadButton.dataset.bookId = String(book.id);
    downloadButton.innerHTML = hasDownload ? "? Open Download" : "? Download";
    downloadButton.style.borderColor = hasDownload ? "#bbf7d0" : "#e5e7eb";
    downloadButton.style.background = hasDownload ? "#f0fdf4" : "";
    downloadButton.style.color = hasDownload ? "#166534" : "";
  }

  function favoriteCardHtml(book) {
    return `
      <article class="ls-favorite-card" data-ls-favorites-card="1">
        <div class="ls-favorite-card-cover">
          <img src="${escapeHtml(book.cover_url)}" alt="${escapeHtml(book.title)}" loading="lazy">
          <button
            type="button"
            class="ls-favorite-button is-active"
            data-ls-favorite-toggle="1"
            data-book-id="${book.id}"
            aria-label="Remove ${escapeHtml(book.title)} from favorites"
            title="Remove from favorites"
          >&#9829;</button>
          <span style="position:absolute;top:12px;right:12px;width:10px;height:10px;border-radius:999px;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.12);background:${book.available ? "#22c55e" : "#ef4444"};"></span>
        </div>
        <div style="padding:14px;">
          <p style="margin:0 0 4px 0;font-size:12px;color:#6b7280;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(book.author)}</p>
          <h3 style="margin:0;font-size:14px;line-height:1.35;color:#111827;font-weight:700;min-height:38px;">${escapeHtml(book.title)}</h3>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;font-size:12px;color:#6b7280;">
            <span>${escapeHtml(String(book.rating))} star</span>
            <span>${escapeHtml(book.category)}</span>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;">
            <button
              type="button"
              data-ls-open-book="1"
              data-book-title="${escapeHtml(book.title)}"
              style="flex:1;height:36px;border:none;border-radius:10px;background:#1b4332;color:#fff;font-size:13px;font-weight:700;cursor:pointer;"
            >Borrow</button>
            <button
              type="button"
              data-ls-favorite-toggle="1"
              data-book-id="${book.id}"
              style="width:42px;height:36px;border:1px solid #fecaca;border-radius:10px;background:#fff1f2;color:#dc2626;font-size:16px;cursor:pointer;"
              aria-label="Remove ${escapeHtml(book.title)} from favorites"
              title="Remove from favorites"
            >&#9829;</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderFavoritesPage(books, force) {
    if (window.location.pathname !== "/favorites") return;

    const container = document.querySelector("main .fade-in");
    if (!container) return;
    if (!force && container.dataset.lsRealFavorites === "1") return;

    ensureFavoritesStyles();

    const favoritesById = new Map(books.map((book) => [Number(book.id), book]));
    const favoriteBooks = getFavoriteIds()
      .map((id) => favoritesById.get(Number(id)))
      .filter(Boolean);
    const summary = summarizeFavorites(favoriteBooks);
    const availableCategories = summary.categories.map(([category]) => category);

    if (favoritesFilter !== "all" && !availableCategories.includes(favoritesFilter)) {
      favoritesFilter = "all";
    }

    const visibleBooks = favoritesFilter === "all"
      ? favoriteBooks
      : favoriteBooks.filter((book) => normalize(book.category) === favoritesFilter);

    const filterButtons = [
      `<button type="button" class="ls-favorite-pill ${favoritesFilter === "all" ? "is-active" : ""}" data-ls-favorites-filter="all">All Favorites (${favoriteBooks.length})</button>`,
      ...summary.categories.map(
        ([category, count]) => `<button type="button" class="ls-favorite-pill ${favoritesFilter === category ? "is-active" : ""}" data-ls-favorites-filter="${escapeHtml(category)}">${escapeHtml(category)} (${count})</button>`,
      ),
    ].join("");

    const authorSummary = summary.authors.length
      ? summary.authors.slice(0, 6).map(([author, count]) => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9;">
            <span style="font-size:13px;color:#111827;">${escapeHtml(author)}</span>
            <span style="font-size:12px;color:#6b7280;">${count} book${count === 1 ? "" : "s"}</span>
          </div>
        `).join("")
      : `<p style="margin:0;font-size:13px;color:#6b7280;">Your favorite authors will appear here after you save books.</p>`;

    const contentHtml = favoriteBooks.length
      ? `
        <div class="grid gap-4" style="grid-template-columns:repeat(auto-fill,minmax(180px,1fr));">
          ${visibleBooks.map((book) => favoriteCardHtml(book)).join("")}
        </div>
      `
      : `
        <div class="ls-favorites-empty p-10 text-center">
          <div style="font-size:42px;line-height:1;">&#9825;</div>
          <h2 style="margin:14px 0 8px 0;font:700 1.6rem Georgia,serif;color:#1b4332;">No favorites yet</h2>
          <p style="margin:0 auto 18px auto;max-width:420px;font-size:14px;color:#6b7280;">
            Save books from the library pages and they will appear here automatically.
          </p>
          <button
            type="button"
            data-ls-browse-books="1"
            style="height:42px;padding:0 18px;border:none;border-radius:12px;background:#1b4332;color:#fff;font-size:14px;font-weight:700;cursor:pointer;"
          >Browse Books</button>
        </div>
      `;

    container.dataset.lsRealFavorites = "1";
    container.innerHTML = `
      <div class="flex gap-6 p-6 min-h-full">
        <div class="flex-1 min-w-0">
          <div class="mb-6">
            <h1 class="font-serif text-2xl font-bold text-ink">Favorites</h1>
            <p class="text-sm text-muted mt-1">Only the books you actually save will appear here.</p>
          </div>

          <div class="grid gap-4 mb-6" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));">
            <div class="ls-favorites-stat p-4">
              <div style="font-size:24px;line-height:1;margin-bottom:8px;">&#9825;</div>
              <p style="margin:0;font-size:28px;font-weight:700;color:#111827;">${favoriteBooks.length}</p>
              <p style="margin:4px 0 0 0;font-size:12px;color:#6b7280;">Total Favorites</p>
            </div>
            <div class="ls-favorites-stat p-4">
              <div style="font-size:16px;line-height:1.2;margin-bottom:8px;font-weight:700;color:#1b4332;">Books</div>
              <p style="margin:0;font-size:28px;font-weight:700;color:#111827;">${summary.availableNow}</p>
              <p style="margin:4px 0 0 0;font-size:12px;color:#6b7280;">Available Now</p>
            </div>
            <div class="ls-favorites-stat p-4">
              <div style="font-size:16px;line-height:1.2;margin-bottom:8px;font-weight:700;color:#1b4332;">Tags</div>
              <p style="margin:0;font-size:28px;font-weight:700;color:#111827;">${summary.categories.length}</p>
              <p style="margin:4px 0 0 0;font-size:12px;color:#6b7280;">Favorite Categories</p>
            </div>
            <div class="ls-favorites-stat p-4">
              <div style="font-size:16px;line-height:1.2;margin-bottom:8px;font-weight:700;color:#1b4332;">Rating</div>
              <p style="margin:0;font-size:28px;font-weight:700;color:#111827;">${summary.averageRating}</p>
              <p style="margin:4px 0 0 0;font-size:12px;color:#6b7280;">Average Rating</p>
            </div>
          </div>

          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px;">
            ${filterButtons}
          </div>

          ${contentHtml}
        </div>

        <aside class="w-80 flex-shrink-0" style="display:${window.innerWidth < 1100 ? "none" : "block"};">
          <div class="ls-favorites-stat p-5 mb-4">
            <h2 style="margin:0 0 6px 0;font:700 1.1rem Georgia,serif;color:#111827;">Favorite Authors</h2>
            <p style="margin:0 0 10px 0;font-size:12px;color:#6b7280;">Based on the books you saved.</p>
            ${authorSummary}
          </div>
          <div class="ls-favorites-stat p-5">
            <h2 style="margin:0 0 6px 0;font:700 1.1rem Georgia,serif;color:#111827;">How It Works</h2>
            <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">
              Use the heart button on any book card to save or remove a favorite. This page updates instantly and only shows your real saved books.
            </p>
          </div>
        </aside>
      </div>
    `;
  }

  const SETTINGS_KEY = "leafshelf:settings-state";
  const SETTINGS_TABS = ["Profile", "Account", "Notifications", "Privacy", "Reading Preferences", "Security"];
  const AUDIO_STATE_KEY = "leafshelf:audio-state";
  const DOWNLOADS_KEY = "leafshelf:downloads-state";
  let chatbotBooks = [];
  const AUDIO_NARRATORS = [
    "Dominic Hoffman",
    "Julia Whelan",
    "Bahni Turpin",
    "Xe Sands",
    "Dion Graham",
    "Robin Miles",
  ];
  let audioFilter = "all";
  let audioSearch = "";
  let audioCategory = "All Categories";
  let audioSort = "Most Popular";
  let downloadsFilter = "all";
  const CHATBOT_STATE = {
    open: false,
    messages: [],
  };
  let floatingNoticeTimer = 0;

  function readSettingsState() {
    const defaults = {
      fullName: "Reader",
      email: "thedreamerer20@gmail.com",
      phone: "+1 (555) 000-0000",
      language: "English",
      theme: "Light",
      readingGoal: "16",
      notifications_new_releases: true,
      notifications_borrow_reminders: true,
      notifications_recommendations: true,
      notifications_promotions: false,
      privacy_profile_visible: true,
      privacy_reading_activity: false,
      privacy_personalized_search: true,
      privacy_data_collection: true,
      fontSize: "Large",
      readingMode: "Sepia",
      autoplay: true,
      wifiOnly: true,
      pageAnimations: true,
      twoFactor: false,
      signinAlerts: true,
      rememberedDevices: true,
      publicReviews: true,
      activeTab: "Profile",
    };

    try {
      const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
      return { ...defaults, ...parsed };
    } catch {
      return defaults;
    }
  }

  function writeSettingsState(nextState) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(nextState));
  }

  function settingToggleRow(label, description, key, checked) {
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid #f1f5f9;">
        <div>
          <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">${label}</p>
          <p style="margin:4px 0 0 0;font-size:12px;color:#6b7280;">${description}</p>
        </div>
        <button
          type="button"
          data-ls-settings-toggle="${key}"
          aria-pressed="${checked ? "true" : "false"}"
          style="position:relative;width:44px;height:24px;border:none;border-radius:999px;background:${checked ? "#1b4332" : "#d1d5db"};cursor:pointer;flex-shrink:0;"
        >
          <span style="position:absolute;top:3px;left:${checked ? "23px" : "3px"};width:18px;height:18px;border-radius:999px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.18);transition:left 0.15s ease;"></span>
        </button>
      </div>
    `;
  }

  function settingsCard(title, bodyHtml) {
    return `
      <section class="bg-white rounded-card border border-border shadow-soft p-6">
        <h3 class="font-semibold text-sm text-ink mb-4">${title}</h3>
        ${bodyHtml}
      </section>
    `;
  }

  function settingsSelect(label, key, value, options) {
    return `
      <div>
        <label style="display:block;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">${label}</label>
        <select data-ls-settings-field="${key}" style="width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:12px;font-size:14px;color:#111827;background:#fff;">
          ${options.map((option) => `<option value="${option}" ${option === value ? "selected" : ""}>${option}</option>`).join("")}
        </select>
      </div>
    `;
  }

  function settingsInput(label, key, value, type) {
    return `
      <div>
        <label style="display:block;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:6px;">${label}</label>
        <input data-ls-settings-field="${key}" type="${type}" value="${escapeHtml(value)}" style="width:100%;padding:10px 12px;border:1px solid #e5e7eb;border-radius:12px;font-size:14px;color:#111827;background:#fff;">
      </div>
    `;
  }

  function renderSettingsTab(tab, state) {
    if (tab === "Profile") {
      return [
        settingsCard("Profile Information", `
          <div class="grid grid-cols-2 gap-4">
            ${settingsInput("Full Name", "fullName", state.fullName, "text")}
            ${settingsInput("Email Address", "email", state.email, "email")}
            ${settingsInput("Phone Number", "phone", state.phone, "tel")}
            ${settingsSelect("Preferred Language", "language", state.language, ["English", "Arabic", "French", "Chinese"])}
            ${settingsSelect("Theme Preference", "theme", state.theme, ["Light", "Dark", "System Default"])}
            ${settingsInput("Reading Goal (books/month)", "readingGoal", state.readingGoal, "number")}
          </div>
        `),
        settingsCard("Quick Preferences", `
          ${settingToggleRow("New book releases", "Get notified when books in your genres are added.", "notifications_new_releases", state.notifications_new_releases)}
          ${settingToggleRow("Borrow reminders", "Receive reminders when due dates are close.", "notifications_borrow_reminders", state.notifications_borrow_reminders)}
          ${settingToggleRow("Recommendations", "Use your reading history for better suggestions.", "notifications_recommendations", state.notifications_recommendations)}
        `),
      ].join("");
    }

    if (tab === "Account") {
      return [
        settingsCard("Account Overview", `
          <div class="grid grid-cols-2 gap-4">
            ${settingsInput("Display Name", "fullName", state.fullName, "text")}
            ${settingsInput("Primary Email", "email", state.email, "email")}
            ${settingsSelect("Membership Plan", "membershipPlan", "Premium Reader", ["Premium Reader", "Standard Reader"])}
            ${settingsSelect("Preferred Language", "language", state.language, ["English", "Arabic", "French", "Chinese"])}
          </div>
        `),
        settingsCard("Connected Devices", `
          <div style="display:grid;gap:12px;">
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid #e5e7eb;border-radius:14px;"><div><strong>MacBook Pro</strong><div style="font-size:12px;color:#6b7280;">Current session</div></div><span style="font-size:12px;color:#15803d;">Active</span></div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid #e5e7eb;border-radius:14px;"><div><strong>iPhone 14</strong><div style="font-size:12px;color:#6b7280;">Mobile reading</div></div><span style="font-size:12px;color:#15803d;">Active</span></div>
            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px;border:1px solid #e5e7eb;border-radius:14px;"><div><strong>iPad Air</strong><div style="font-size:12px;color:#6b7280;">Last used 3 days ago</div></div><span style="font-size:12px;color:#6b7280;">Idle</span></div>
          </div>
        `),
      ].join("");
    }

    if (tab === "Notifications") {
      return settingsCard("Notification Settings", `
        ${settingToggleRow("New book releases", "Stay updated when fresh titles match your genres.", "notifications_new_releases", state.notifications_new_releases)}
        ${settingToggleRow("Borrow reminders", "Receive reminders before a loan is due.", "notifications_borrow_reminders", state.notifications_borrow_reminders)}
        ${settingToggleRow("Recommendations", "Get personalized reading suggestions.", "notifications_recommendations", state.notifications_recommendations)}
        ${settingToggleRow("Promotions and updates", "LeafShelf news and special offers.", "notifications_promotions", state.notifications_promotions)}
      `);
    }

    if (tab === "Privacy") {
      return settingsCard("Privacy Controls", `
        ${settingToggleRow("Public profile", "Allow your display name to appear on public reviews.", "privacy_profile_visible", state.privacy_profile_visible)}
        ${settingToggleRow("Reading activity", "Share your reading streak and annual stats across the app.", "privacy_reading_activity", state.privacy_reading_activity)}
        ${settingToggleRow("Personalized search", "Use your library history to improve search ranking.", "privacy_personalized_search", state.privacy_personalized_search)}
        ${settingToggleRow("Usage analytics", "Help improve LeafShelf with anonymous activity data.", "privacy_data_collection", state.privacy_data_collection)}
      `);
    }

    if (tab === "Reading Preferences") {
      return [
        settingsCard("Reader Preferences", `
          <div class="grid grid-cols-2 gap-4">
            ${settingsSelect("Font Size", "fontSize", state.fontSize, ["Small", "Medium", "Large"])}
            ${settingsSelect("Reading Mode", "readingMode", state.readingMode, ["Day", "Night", "Sepia"])}
          </div>
        `),
        settingsCard("Playback and Downloads", `
          ${settingToggleRow("Audiobook autoplay", "Automatically play the next chapter.", "autoplay", state.autoplay)}
          ${settingToggleRow("Download over Wi-Fi only", "Save mobile data when downloading titles.", "wifiOnly", state.wifiOnly)}
          ${settingToggleRow("Page animations", "Keep page-turn and transition effects enabled.", "pageAnimations", state.pageAnimations)}
        `),
      ].join("");
    }

    return [
      settingsCard("Security Settings", `
        ${settingToggleRow("Two-factor authentication", "Require a verification code for new sign-ins.", "twoFactor", state.twoFactor)}
        ${settingToggleRow("Sign-in alerts", "Email me when a new device signs in.", "signinAlerts", state.signinAlerts)}
        ${settingToggleRow("Remember trusted devices", "Keep this device signed in for faster access.", "rememberedDevices", state.rememberedDevices)}
        ${settingToggleRow("Allow public review profile", "Show your name on verified reviews.", "publicReviews", state.publicReviews)}
      `),
      settingsCard("Change Password", `
        <div class="grid grid-cols-1 gap-4">
          ${settingsInput("Current Password", "currentPassword", "", "password")}
          ${settingsInput("New Password", "newPassword", "", "password")}
          ${settingsInput("Confirm New Password", "confirmPassword", "", "password")}
        </div>
      `),
    ].join("");
  }

  function patchSettingsSidebar(root) {
    const favoritesCount = getFavoriteIds().length;
    const sidebarTextNodes = Array.from(root.querySelectorAll("p, span, div"));
    const favoritesLabel = sidebarTextNodes.find((el) => normalize(el.textContent) === "Favorites");
    if (favoritesLabel) {
      const countNode = favoritesLabel.parentElement?.querySelector("p:last-child, span:last-child, div:last-child");
      if (countNode && /^\d+$/.test(normalize(countNode.textContent))) {
        countNode.textContent = String(favoritesCount);
      }
    }
  }

  function renderSettingsPage() {
    if (window.location.pathname !== "/settings") return;

    const root = document.querySelector("main .fade-in > div");
    if (!root || root.dataset.lsSettingsEnhanced === "1") return;

    const navButtons = Array.from(root.querySelectorAll("aside nav button")).filter((button) => SETTINGS_TABS.includes(normalize(button.textContent)));
    const contentArea = root.querySelector(".flex-1.min-w-0.space-y-5");
    if (!navButtons.length || !contentArea) return;

    const state = readSettingsState();
    root.dataset.lsSettingsEnhanced = "1";

    const applyTab = (tab) => {
      const nextState = { ...readSettingsState(), activeTab: tab };
      writeSettingsState(nextState);
      navButtons.forEach((button) => {
        const isActive = normalize(button.textContent) === tab;
        button.className = isActive
          ? "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors bg-[#1B4332] text-white font-semibold"
          : "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors text-gray-500 hover:bg-gray-50 hover:text-forest-dark";
      });
      contentArea.innerHTML = renderSettingsTab(tab, nextState) + `
        <div style="display:flex;gap:12px;justify-content:flex-end;">
          <button type="button" data-ls-settings-save="1" style="padding:10px 18px;border:none;border-radius:12px;background:#1b4332;color:#fff;font-size:14px;font-weight:700;">Save Changes</button>
          <button type="button" data-ls-settings-cancel="1" style="padding:10px 18px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;color:#111827;font-size:14px;font-weight:600;">Cancel</button>
        </div>
      `;
      contentArea.dataset.lsSettingsTab = tab;
      patchSettingsSidebar(root);
    };

    navButtons.forEach((button) => {
      button.dataset.lsSettingsTabButton = normalize(button.textContent);
    });

    applyTab(SETTINGS_TABS.includes(state.activeTab) ? state.activeTab : "Profile");
  }

  function readAudioState() {
    const defaults = {
      borrowedIds: [],
      downloadedIds: [],
      completedIds: [],
      progressById: {},
      nowPlayingId: null,
    };

    try {
      const parsed = JSON.parse(localStorage.getItem(AUDIO_STATE_KEY) || "{}");
      return {
        ...defaults,
        ...parsed,
        borrowedIds: Array.isArray(parsed.borrowedIds) ? parsed.borrowedIds.map(Number).filter(Number.isFinite) : [],
        downloadedIds: Array.isArray(parsed.downloadedIds) ? parsed.downloadedIds.map(Number).filter(Number.isFinite) : [],
        completedIds: Array.isArray(parsed.completedIds) ? parsed.completedIds.map(Number).filter(Number.isFinite) : [],
        progressById: parsed.progressById && typeof parsed.progressById === "object" ? parsed.progressById : {},
      };
    } catch {
      return defaults;
    }
  }

  function writeAudioState(nextState) {
    localStorage.setItem(AUDIO_STATE_KEY, JSON.stringify(nextState));
  }

  function minutesToLabel(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${String(minutes).padStart(2, "0")}m`;
  }

  function audioItemsFromBooks(books) {
    return books.map((book, index) => ({
      ...book,
      narrator: AUDIO_NARRATORS[index % AUDIO_NARRATORS.length],
      durationMinutes: Math.max(180, Math.round((Number(book.pages) || 300) * 1.7)),
      popularity: 100 - index,
    }));
  }

  function ensureAudioStyles() {
    if (document.getElementById("ls-audio-styles")) return;

    const style = document.createElement("style");
    style.id = "ls-audio-styles";
    style.textContent = `
      .ls-audio-shell {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 310px;
        gap: 24px;
      }

      .ls-audio-card,
      .ls-audio-sidecard,
      .ls-audio-stat {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
      }

      .ls-audio-pill {
        border: 1px solid #d6d3d1;
        border-radius: 12px;
        background: #fff;
        color: #111827;
        padding: 10px 14px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }

      .ls-audio-pill.is-active {
        background: #1b4332;
        border-color: #1b4332;
        color: #fff;
      }

      .ls-audio-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
        gap: 16px;
      }

      .ls-audio-cover {
        aspect-ratio: 1 / 1;
        border-radius: 16px;
        overflow: hidden;
        position: relative;
        background: linear-gradient(135deg, #edf7ef 0%, #dcefe1 100%);
      }

      .ls-audio-cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .ls-audio-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background: rgba(17, 24, 39, 0.78);
        color: #fff;
        border-radius: 999px;
        padding: 6px 9px;
        font-size: 11px;
        font-weight: 700;
      }

      .ls-audio-progress {
        height: 6px;
        border-radius: 999px;
        background: #e5e7eb;
        overflow: hidden;
      }

      .ls-audio-progress > span {
        display: block;
        height: 100%;
        background: #1b4332;
        border-radius: 999px;
      }

      @media (max-width: 1080px) {
        .ls-audio-shell {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderAudioBooksPage(books) {
    if (window.location.pathname !== "/audio-books") return;

    const container = document.querySelector("main .fade-in");
    if (!container) return;

    ensureAudioStyles();

    const state = readAudioState();
    const items = audioItemsFromBooks(books);
    const nowPlaying = items.find((item) => item.id === Number(state.nowPlayingId)) || items[0] || null;
    const enriched = items.map((item) => {
      const progress = Math.max(0, Math.min(100, Number(state.progressById[item.id]) || 0));
      const borrowed = state.borrowedIds.includes(item.id);
      const downloaded = state.downloadedIds.includes(item.id);
      const completed = state.completedIds.includes(item.id) || progress >= 100;
      return { ...item, progress, borrowed, downloaded, completed };
    });

    const categories = ["All Categories", ...Array.from(new Set(enriched.map((item) => item.category))).sort()];
    const filtered = enriched
      .filter((item) => {
        if (audioCategory !== "All Categories" && item.category !== audioCategory) return false;
        if (audioSearch) {
          const haystack = `${item.title} ${item.author} ${item.narrator}`.toLowerCase();
          if (!haystack.includes(audioSearch.toLowerCase())) return false;
        }
        if (audioFilter === "in-progress") return item.borrowed && item.progress > 0 && item.progress < 100;
        if (audioFilter === "unplayed") return !item.borrowed || item.progress === 0;
        if (audioFilter === "downloaded") return item.downloaded;
        if (audioFilter === "narrator") return true;
        return true;
      })
      .sort((a, b) => {
        if (audioSort === "Newest Added") return Number(b.published_year) - Number(a.published_year);
        if (audioSort === "Longest") return b.durationMinutes - a.durationMinutes;
        if (audioSort === "Highest Rated") return Number(b.rating) - Number(a.rating);
        if (audioSort === "Narrator") return a.narrator.localeCompare(b.narrator) || a.title.localeCompare(b.title);
        return b.popularity - a.popularity;
      });

    const borrowedCount = enriched.filter((item) => item.borrowed).length;
    const completedCount = enriched.filter((item) => item.completed).length;
    const totalListeningMinutes = enriched.reduce(
      (sum, item) => sum + Math.round((item.durationMinutes * item.progress) / 100),
      0,
    );
    const narrators = Array.from(
      enriched.reduce((map, item) => map.set(item.narrator, (map.get(item.narrator) || 0) + 1), new Map()),
    ).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 4);

    const categoryList = categories.slice(1, 5)
      .map((category) => `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9;"><span>${escapeHtml(category)}</span><span style="color:#6b7280;">${enriched.filter((item) => item.category === category).length}</span></div>`)
      .join("");

    const cardHtml = filtered.map((item) => {
      const primaryLabel = item.completed
        ? "Resume Listening"
        : item.borrowed && item.progress > 0
          ? "Continue Audio"
          : item.borrowed
            ? "Start Listening"
            : "Borrow Audio";
      const secondaryLabel = item.downloaded ? "Remove Download" : "Download";
      return `
        <article class="ls-audio-card" style="padding:12px;">
          <div class="ls-audio-cover">
            <img src="${escapeHtml(item.cover_url)}" alt="${escapeHtml(item.title)}" loading="lazy">
            <span class="ls-audio-badge">${minutesToLabel(item.durationMinutes)}</span>
          </div>
          <div style="padding:14px 2px 4px 2px;">
            <h3 style="margin:0 0 4px 0;font-size:15px;line-height:1.35;color:#111827;font-weight:700;">${escapeHtml(item.title)}</h3>
            <p style="margin:0;font-size:13px;color:#111827;">By ${escapeHtml(item.author)}</p>
            <p style="margin:6px 0 0 0;font-size:12px;color:#6b7280;">Narrated by ${escapeHtml(item.narrator)}</p>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;font-size:12px;color:#6b7280;">
              <span>${escapeHtml(String(item.rating))} rating</span>
              <span>${item.completed ? "Completed" : item.borrowed ? `${item.progress}% progress` : item.available ? "Available" : "Checked out"}</span>
            </div>
            <div class="ls-audio-progress" style="margin-top:10px;"><span style="width:${item.progress}%;"></span></div>
            <div style="display:grid;gap:8px;margin-top:12px;">
              <button type="button" data-ls-audio-action="primary" data-book-id="${item.id}" style="height:38px;border:none;border-radius:11px;background:#1b4332;color:#fff;font-size:13px;font-weight:700;cursor:pointer;">${primaryLabel}</button>
              <button type="button" data-ls-audio-action="download" data-book-id="${item.id}" style="height:36px;border:1px solid #d6d3d1;border-radius:11px;background:#fff;color:#111827;font-size:12px;font-weight:600;cursor:pointer;">${secondaryLabel}</button>
            </div>
          </div>
        </article>
      `;
    }).join("");

    container.innerHTML = `
      <div class="p-6 min-h-full">
        <div class="ls-audio-shell">
          <div>
            <div style="display:flex;align-items:center;gap:14px;margin-bottom:18px;">
              <input
                data-ls-audio-search="1"
                type="text"
                value="${escapeHtml(audioSearch)}"
                placeholder="Search for audio books, authors..."
                style="flex:1;height:48px;border:1px solid #e5e7eb;border-radius:14px;padding:0 16px;font-size:14px;background:#fff;"
              >
              <select data-ls-audio-category="1" style="height:48px;border:1px solid #e5e7eb;border-radius:14px;padding:0 14px;font-size:14px;background:#fff;min-width:180px;">
                ${categories.map((category) => `<option value="${escapeHtml(category)}" ${category === audioCategory ? "selected" : ""}>${escapeHtml(category)}</option>`).join("")}
              </select>
            </div>

            <h1 style="margin:0;font:700 3rem Fraunces, serif;color:#1b4332;">Audio Books</h1>
            <p style="margin:8px 0 22px 0;font-size:16px;color:#374151;">Listen to your favorite stories anytime, anywhere.</p>

            <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px;margin-bottom:20px;">
              <div class="ls-audio-stat" style="padding:18px;">
                <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Total Listening Time</div>
                <div style="margin-top:8px;font-size:2rem;font-weight:700;color:#111827;">${(totalListeningMinutes / 60).toFixed(1)} hrs</div>
              </div>
              <div class="ls-audio-stat" style="padding:18px;">
                <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Audiobooks Borrowed</div>
                <div style="margin-top:8px;font-size:2rem;font-weight:700;color:#111827;">${borrowedCount}</div>
              </div>
              <div class="ls-audio-stat" style="padding:18px;">
                <div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Completed</div>
                <div style="margin-top:8px;font-size:2rem;font-weight:700;color:#111827;">${completedCount}</div>
              </div>
            </div>

            <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:18px;flex-wrap:wrap;">
              <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <button type="button" class="ls-audio-pill ${audioFilter === "all" ? "is-active" : ""}" data-ls-audio-filter="all">All Audiobooks</button>
                <button type="button" class="ls-audio-pill ${audioFilter === "in-progress" ? "is-active" : ""}" data-ls-audio-filter="in-progress">In Progress</button>
                <button type="button" class="ls-audio-pill ${audioFilter === "unplayed" ? "is-active" : ""}" data-ls-audio-filter="unplayed">Unplayed</button>
                <button type="button" class="ls-audio-pill ${audioFilter === "downloaded" ? "is-active" : ""}" data-ls-audio-filter="downloaded">Downloaded</button>
                <button type="button" class="ls-audio-pill ${audioFilter === "narrator" ? "is-active" : ""}" data-ls-audio-filter="narrator">By Narrator</button>
              </div>
              <select data-ls-audio-sort="1" style="height:42px;border:1px solid #d6d3d1;border-radius:12px;padding:0 12px;font-size:13px;background:#fff;">
                ${["Most Popular", "Highest Rated", "Newest Added", "Longest", "Narrator"].map((option) => `<option value="${option}" ${option === audioSort ? "selected" : ""}>Sort by: ${option}</option>`).join("")}
              </select>
            </div>

            <div class="ls-audio-grid">
              ${cardHtml || `<div class="ls-audio-card" style="padding:28px;text-align:center;grid-column:1 / -1;"><h2 style="margin:0 0 8px 0;font:700 1.8rem Fraunces, serif;color:#1b4332;">No audiobook matches yet</h2><p style="margin:0;color:#6b7280;">Try another filter or search term.</p></div>`}
            </div>

            <div class="ls-audio-card" style="margin-top:18px;padding:20px;background:linear-gradient(135deg,#f8f5ec 0%,#e8f0df 100%);display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;">
              <div>
                <div style="font:700 1.8rem Fraunces, serif;color:#1b4332;">Immerse yourself in stories.</div>
                <div style="margin-top:6px;font-size:14px;color:#374151;">High-quality audio narration based on the LeafShelf catalog.</div>
              </div>
              <button type="button" data-ls-audio-upgrade="1" style="height:42px;padding:0 18px;border:none;border-radius:12px;background:#1b4332;color:#fff;font-size:14px;font-weight:700;cursor:pointer;">Upgrade Now</button>
            </div>
          </div>

          <aside style="display:grid;gap:16px;align-content:start;">
            <div class="ls-audio-sidecard" style="padding:18px;">
              <h2 style="margin:0 0 12px 0;font:700 1.2rem Fraunces, serif;color:#111827;">Now Playing</h2>
              ${nowPlaying ? `
                <div style="display:flex;justify-content:center;"><img src="${escapeHtml(nowPlaying.cover_url)}" alt="${escapeHtml(nowPlaying.title)}" style="width:140px;height:140px;object-fit:cover;border-radius:16px;box-shadow:0 14px 28px rgba(15,23,42,0.14);"></div>
                <div style="margin-top:14px;text-align:center;">
                  <div style="font-size:15px;font-weight:700;color:#111827;">${escapeHtml(nowPlaying.title)}</div>
                  <div style="margin-top:4px;font-size:13px;color:#6b7280;">${escapeHtml(nowPlaying.narrator)}</div>
                </div>
                <div class="ls-audio-progress" style="margin-top:14px;"><span style="width:${Math.max(8, Number(state.progressById[nowPlaying.id]) || 0)}%;"></span></div>
                <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:12px;color:#6b7280;">
                  <span>0:00</span>
                  <span>${minutesToLabel(nowPlaying.durationMinutes)}</span>
                </div>
                <div style="display:flex;justify-content:center;gap:10px;margin-top:14px;">
                  <button type="button" data-ls-audio-action="rewind" data-book-id="${nowPlaying.id}" class="ls-audio-pill">Back 15</button>
                  <button type="button" data-ls-audio-action="play" data-book-id="${nowPlaying.id}" class="ls-audio-pill is-active">Play</button>
                  <button type="button" data-ls-audio-action="forward" data-book-id="${nowPlaying.id}" class="ls-audio-pill">Next 15</button>
                </div>
              ` : `<p style="margin:0;color:#6b7280;">Choose an audiobook to start listening.</p>`}
            </div>

            <div class="ls-audio-sidecard" style="padding:18px;">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
                <h2 style="margin:0;font:700 1.2rem Fraunces, serif;color:#111827;">Top Narrators</h2>
                <button type="button" data-ls-audio-filter="narrator" style="border:none;background:none;color:#1b4332;font-size:12px;font-weight:700;cursor:pointer;">View all</button>
              </div>
              <div style="margin-top:12px;">
                ${narrators.map(([name, count]) => `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9;"><span>${escapeHtml(name)}</span><span style="color:#6b7280;">${count} titles</span></div>`).join("")}
              </div>
            </div>

            <div class="ls-audio-sidecard" style="padding:18px;">
              <h2 style="margin:0 0 12px 0;font:700 1.2rem Fraunces, serif;color:#111827;">Listening Goals</h2>
              <div style="display:flex;align-items:center;gap:16px;">
                <div style="width:92px;height:92px;border-radius:999px;border:8px solid #d7e8dd;border-top-color:#1b4332;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700;color:#111827;">${Math.min(300, totalListeningMinutes)}</div>
                <div>
                  <div style="font-size:13px;color:#6b7280;">Weekly target</div>
                  <div style="margin-top:4px;font-size:24px;font-weight:700;color:#111827;">${Math.min(300, totalListeningMinutes)} / 300 mins</div>
                  <div style="margin-top:6px;font-size:12px;color:#6b7280;">Keep listening to reach your weekly goal.</div>
                </div>
              </div>
            </div>

            <div class="ls-audio-sidecard" style="padding:18px;">
              <h2 style="margin:0 0 12px 0;font:700 1.2rem Fraunces, serif;color:#111827;">Explore Audiobook Categories</h2>
              ${categoryList}
            </div>
          </aside>
        </div>
      </div>
    `;
  }

  function downloadEntriesFromBooks(books) {
    const audioState = readAudioState();
    const audioItems = audioItemsFromBooks(books);
    const downloadsState = readDownloadsState();

    return Object.values(downloadsState)
      .map((entry) => {
        const book = books.find((item) => Number(item.id) === Number(entry.bookId));
        if (!book) return null;
        const audioMeta = audioItems.find((item) => item.id === Number(entry.bookId));
        const durationMinutes = audioMeta ? audioMeta.durationMinutes : Math.max(180, Math.round((Number(book.pages) || 300) * 1.7));
        return {
          id: Number(book.id),
          ...book,
          narrator: audioMeta?.narrator || "LeafShelf Narration",
          durationMinutes,
          format: entry.format || "eBook",
          sizeMb: Number(entry.sizeMb) || estimateBookDownload(book, entry.format || "eBook"),
          downloadedAt: entry.downloadedAt || new Date().toISOString(),
          progress: Math.max(0, Math.min(100, Number(entry.progress) || 0)),
          completed: !!entry.completed,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime());
  }

  function ensureDownloadsStyles() {
    if (document.getElementById("ls-downloads-styles")) return;

    const style = document.createElement("style");
    style.id = "ls-downloads-styles";
    style.textContent = `
      .ls-download-filter {
        padding: 10px 16px;
        border: none;
        background: transparent;
        color: #6b7280;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -1px;
        white-space: nowrap;
      }

      .ls-download-filter.is-active {
        color: #1b4332;
        border-bottom-color: #1b4332;
      }

      .ls-download-shell {
        display: grid;
        grid-template-columns: minmax(0, 1fr) 270px;
        gap: 20px;
      }

      .ls-download-card {
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 18px;
        box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
      }

      @media (max-width: 1080px) {
        .ls-download-shell {
          grid-template-columns: 1fr;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function renderDownloadsPage(books) {
    if (window.location.pathname !== "/downloads") return;

    const container = document.querySelector("main .fade-in");
    if (!container) return;

    ensureDownloadsStyles();

    const queryFormat = new URLSearchParams(window.location.search).get("format");
    if (queryFormat === "Audiobook") {
      downloadsFilter = "audiobooks";
    }

    const entries = downloadEntriesFromBooks(books);
    const filtered = entries.filter((entry) => {
      if (downloadsFilter === "audiobooks") return entry.format === "Audiobook";
      if (downloadsFilter === "completed") return entry.completed;
      if (downloadsFilter === "in-progress") return !entry.completed;
      if (downloadsFilter === "ebooks") return entry.format === "eBook";
      if (downloadsFilter === "pdfs") return entry.format === "PDF";
      return true;
    });

    const totalStorage = entries.reduce((sum, entry) => sum + entry.sizeMb, 0);
    const totalDownloads = entries.length;
    const audiobookCount = entries.filter((entry) => entry.format === "Audiobook").length;
    const ebookCount = entries.filter((entry) => entry.format === "eBook").length;
    const completedCount = entries.filter((entry) => entry.completed).length;
    const totalCapacity = 10000;
    const percentUsed = Math.min(100, Math.round((totalStorage / totalCapacity) * 100));

    const rowsHtml = filtered.length
      ? filtered.map((entry) => `
          <tr style="border-bottom:1px solid #f1f5f9;">
            <td style="padding:16px 18px;">
              <div style="display:flex;align-items:center;gap:12px;">
                <img src="${escapeHtml(entry.cover_url)}" alt="${escapeHtml(entry.title)}" style="width:44px;height:60px;border-radius:10px;object-fit:cover;">
                <div>
                  <div style="font-size:15px;font-weight:700;color:#111827;">${escapeHtml(entry.title)}</div>
                  <div style="font-size:13px;color:#6b7280;">${escapeHtml(entry.author)}</div>
                </div>
              </div>
            </td>
            <td style="padding:16px 10px;font-size:13px;color:#111827;">${entry.format}</td>
            <td style="padding:16px 10px;font-size:13px;color:#6b7280;">${entry.sizeMb} MB</td>
            <td style="padding:16px 10px;font-size:13px;color:#6b7280;">${new Date(entry.downloadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
            <td style="padding:16px 10px;">
              ${entry.completed
                ? `<span style="display:inline-flex;padding:6px 10px;border-radius:999px;background:#ecfdf5;color:#15803d;font-size:12px;font-weight:700;">Completed</span>`
                : `<div style="min-width:90px;"><div class="ls-audio-progress"><span style="width:${entry.progress}%;"></span></div><div style="margin-top:6px;font-size:11px;color:#6b7280;">${entry.progress}%</div></div>`}
            </td>
            <td style="padding:16px 10px;">
              <div style="display:flex;gap:12px;">
                <button type="button" data-ls-download-open="${entry.id}" style="border:none;background:none;color:#1b4332;font-size:12px;font-weight:700;cursor:pointer;">Open</button>
                <button type="button" data-ls-download-delete="${entry.id}" style="border:none;background:none;color:#dc2626;font-size:12px;font-weight:700;cursor:pointer;">Delete</button>
              </div>
            </td>
          </tr>
        `).join("")
      : `<tr><td colspan="6" style="padding:42px 18px;text-align:center;"><div style="font:700 1.8rem Fraunces, serif;color:#1b4332;">No downloads yet</div><p style="margin:8px 0 0 0;color:#6b7280;">Download audiobooks from the audio page and they will appear here.</p></td></tr>`;

    container.innerHTML = `
      <div class="p-6 min-h-full">
        <div class="ls-download-shell">
          <div>
            <div style="margin-bottom:18px;">
              <h1 class="font-serif text-2xl font-bold text-ink">Downloads</h1>
              <p class="text-sm text-muted mt-1">Manage your offline reading collection</p>
            </div>

            <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px;margin-bottom:18px;">
              <div class="ls-download-card" style="padding:18px;"><div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Total Downloads</div><div style="margin-top:8px;font-size:2rem;font-weight:700;color:#111827;">${totalDownloads}</div></div>
              <div class="ls-download-card" style="padding:18px;"><div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">eBooks</div><div style="margin-top:8px;font-size:2rem;font-weight:700;color:#111827;">${ebookCount}</div></div>
              <div class="ls-download-card" style="padding:18px;"><div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Audiobooks</div><div style="margin-top:8px;font-size:2rem;font-weight:700;color:#111827;">${audiobookCount}</div></div>
              <div class="ls-download-card" style="padding:18px;"><div style="font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Storage Used</div><div style="margin-top:8px;font-size:2rem;font-weight:700;color:#111827;">${(totalStorage / 1000).toFixed(1)} GB</div></div>
            </div>

            <div style="display:flex;gap:4px;border-bottom:1px solid #e5e7eb;margin-bottom:18px;overflow:auto;">
              <button type="button" class="ls-download-filter ${downloadsFilter === "all" ? "is-active" : ""}" data-ls-download-filter="all">All Downloads</button>
              <button type="button" class="ls-download-filter ${downloadsFilter === "ebooks" ? "is-active" : ""}" data-ls-download-filter="ebooks">eBooks</button>
              <button type="button" class="ls-download-filter ${downloadsFilter === "audiobooks" ? "is-active" : ""}" data-ls-download-filter="audiobooks">Audiobooks</button>
              <button type="button" class="ls-download-filter ${downloadsFilter === "pdfs" ? "is-active" : ""}" data-ls-download-filter="pdfs">PDFs</button>
              <button type="button" class="ls-download-filter ${downloadsFilter === "completed" ? "is-active" : ""}" data-ls-download-filter="completed">Completed</button>
              <button type="button" class="ls-download-filter ${downloadsFilter === "in-progress" ? "is-active" : ""}" data-ls-download-filter="in-progress">In Progress</button>
            </div>

            <div class="ls-download-card" data-ls-downloads-root="1" style="overflow:hidden;">
              <table style="width:100%;border-collapse:collapse;">
                <thead>
                  <tr style="border-bottom:1px solid #f1f5f9;">
                    <th style="padding:14px 18px;text-align:left;font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Title</th>
                    <th style="padding:14px 10px;text-align:left;font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Format</th>
                    <th style="padding:14px 10px;text-align:left;font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Size</th>
                    <th style="padding:14px 10px;text-align:left;font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Downloaded</th>
                    <th style="padding:14px 10px;text-align:left;font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Status</th>
                    <th style="padding:14px 10px;text-align:left;font-size:11px;font-weight:800;color:#6b7280;text-transform:uppercase;letter-spacing:0.08em;">Actions</th>
                  </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
              </table>
            </div>
          </div>

          <aside style="display:grid;gap:16px;align-content:start;">
            <div class="ls-download-card" style="padding:18px;">
              <h2 style="margin:0 0 12px 0;font:700 1.15rem Fraunces, serif;color:#111827;">Offline Storage</h2>
              <div style="display:flex;justify-content:center;"><div style="width:88px;height:88px;border-radius:999px;border:8px solid #e5e7eb;border-top-color:#1b4332;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#111827;">${percentUsed}%</div></div>
              <div style="margin-top:14px;display:grid;gap:8px;font-size:13px;color:#6b7280;">
                <div style="display:flex;justify-content:space-between;"><span>Used</span><strong style="color:#111827;">${(totalStorage / 1000).toFixed(1)} GB</strong></div>
                <div style="display:flex;justify-content:space-between;"><span>Available</span><strong style="color:#111827;">${((totalCapacity - totalStorage) / 1000).toFixed(1)} GB</strong></div>
                <div style="display:flex;justify-content:space-between;"><span>Total</span><strong style="color:#111827;">10 GB</strong></div>
              </div>
            </div>

            <div class="ls-download-card" style="padding:18px;">
              <h2 style="margin:0 0 12px 0;font:700 1.15rem Fraunces, serif;color:#111827;">Download Preferences</h2>
              <div style="display:grid;gap:10px;font-size:13px;color:#6b7280;">
                <div style="display:flex;justify-content:space-between;"><span>Auto-download</span><strong style="color:#111827;">Wi-Fi only</strong></div>
                <div style="display:flex;justify-content:space-between;"><span>Quality</span><strong style="color:#111827;">High</strong></div>
                <div style="display:flex;justify-content:space-between;"><span>Storage limit</span><strong style="color:#111827;">10 GB</strong></div>
              </div>
            </div>

            <div class="ls-download-card" style="padding:18px;">
              <h2 style="margin:0 0 12px 0;font:700 1.15rem Fraunces, serif;color:#111827;">Recently Downloaded</h2>
              <div style="display:grid;gap:10px;">
                ${(entries.slice(0, 4).map((entry) => `
                  <div style="display:flex;justify-content:space-between;gap:12px;font-size:13px;">
                    <span style="color:#111827;">${escapeHtml(entry.title)}</span>
                    <span style="color:#6b7280;">${new Date(entry.downloadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                  </div>
                `).join("")) || `<p style="margin:0;color:#6b7280;font-size:13px;">No offline downloads yet.</p>`}
              </div>
            </div>

            <div class="ls-download-card" style="padding:18px;">
              <h2 style="margin:0 0 12px 0;font:700 1.15rem Fraunces, serif;color:#111827;">Library Snapshot</h2>
              <div style="display:grid;gap:8px;font-size:13px;color:#6b7280;">
                <div style="display:flex;justify-content:space-between;"><span>Completed</span><strong style="color:#111827;">${completedCount}</strong></div>
                <div style="display:flex;justify-content:space-between;"><span>In progress</span><strong style="color:#111827;">${Math.max(0, totalDownloads - completedCount)}</strong></div>
                <div style="display:flex;justify-content:space-between;"><span>Available books</span><strong style="color:#111827;">${books.length}</strong></div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    `;
  }

  function normalizeWords(text) {
    return normalize(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function findBookFromQuestion(question, books) {
    const normalizedQuestion = normalizeWords(question);
    const exact = books.find((book) => normalizedQuestion.includes(normalizeWords(book.title)));
    if (exact) return exact;

    let bestBook = null;
    let bestScore = 0;
    books.forEach((book) => {
      const words = normalizeWords(book.title).split(" ").filter((word) => word.length > 2);
      const score = words.filter((word) => normalizedQuestion.includes(word)).length;
      if (score > bestScore) {
        bestBook = book;
        bestScore = score;
      }
    });

    return bestScore >= 2 ? bestBook : null;
  }

  function answerLibraryQuestion(question, books) {
    const text = normalizeWords(question);
    if (!text) {
      return "Ask me about a book, for example: is 1984 available, what genre is Dracula, or who wrote The Hobbit?";
    }

    if (/(hi|hello|hey|good morning|good evening)\b/.test(text)) {
      return "Hello. I can help with book availability, genre, author, rating, pages, year, summaries, favorites, downloads, and recommendations.";
    }

    if (/(help|what can you do|how do you work)\b/.test(text)) {
      return "You can ask things like: is 1984 available, what kind of book is Dracula, who wrote Jane Eyre, what is the rating of The Hobbit, or recommend fantasy books.";
    }

    const categories = Array.from(new Set(books.map((book) => normalizeWords(book.category))));
    const askedCategory = categories.find((category) => category && text.includes(category));
    const book = findBookFromQuestion(question, books);

    if (book) {
      if (/(available|borrow|in stock|copies)\b/.test(text)) {
        return book.available
          ? `${book.title} is available now in ${book.available_copies} of ${book.total_copies} copies.`
          : `${book.title} is currently checked out.`;
      }
      if (/(genre|category|kind|type)\b/.test(text)) {
        return `${book.title} is a ${book.category} book.`;
      }
      if (/(author|who wrote|writer)\b/.test(text)) {
        return `${book.title} was written by ${book.author}.`;
      }
      if (/(rating|score|review)\b/.test(text)) {
        return `${book.title} has a rating of ${book.rating}.`;
      }
      if (/(page|pages|length)\b/.test(text)) {
        return `${book.title} has ${book.pages} pages.`;
      }
      if (/(year|published|when)\b/.test(text)) {
        return `${book.title} was published in ${book.published_year}.`;
      }
      if (/(summary|about|tell me about|description)\b/.test(text)) {
        return `${book.title} by ${book.author}: ${book.description}`;
      }
      return `${book.title} is a ${book.category} book by ${book.author}. It has a rating of ${book.rating} and ${book.pages} pages.${book.available ? ` It is available now.` : ` It is not available right now.`}`;
    }

    if (askedCategory && /(available|books|show|list|recommend)\b/.test(text)) {
      const matches = books
        .filter((item) => normalizeWords(item.category) === askedCategory)
        .sort((a, b) => Number(b.rating) - Number(a.rating));
      if (!matches.length) {
        return `I could not find books in ${askedCategory}.`;
      }
      const preview = matches.slice(0, 4).map((item) => `${item.title} by ${item.author}`).join(", ");
      return `We have ${matches.length} ${matches[0].category} books. Top picks: ${preview}.`;
    }

    if (/(recommend|suggest|best books|popular books)\b/.test(text)) {
      const picks = books
        .slice()
        .sort((a, b) => Number(b.rating) - Number(a.rating))
        .slice(0, 4)
        .map((item) => `${item.title} (${item.rating})`)
        .join(", ");
      return `Here are some strong picks from the current library: ${picks}.`;
    }

    if (/(favorite|favorites)\b/.test(text) && /(how many|count)\b/.test(text)) {
      return `You currently have ${getFavoriteIds().length} favorite books.`;
    }

    if (/(download|downloads)\b/.test(text) && /(how many|count)\b/.test(text)) {
      return `You currently have ${Object.keys(readDownloadsState()).length} downloaded books.`;
    }

    return "I could not match that to a book yet. Try using the book title, or ask about availability, genre, author, rating, pages, year, recommendations, favorites, or downloads.";
  }

  function ensureChatbotStyles() {
    if (document.getElementById("ls-chatbot-styles")) return;
    const style = document.createElement("style");
    style.id = "ls-chatbot-styles";
    style.textContent = `
      .ls-chatbot-fab {
        position: fixed;
        right: 28px;
        bottom: 26px;
        width: 72px;
        height: 72px;
        border: none;
        border-radius: 999px;
        background: radial-gradient(circle at 30% 30%, #2f7a57 0%, #1b4332 68%, #102d22 100%);
        color: #fff;
        box-shadow: 0 22px 40px rgba(27, 67, 50, 0.32);
        cursor: pointer;
        z-index: 9997;
        font-size: 28px;
        font-weight: 700;
      }

      .ls-chatbot-panel {
        position: fixed;
        right: 24px;
        bottom: 112px;
        width: min(390px, calc(100vw - 28px));
        height: min(620px, calc(100vh - 150px));
        background: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 26px;
        box-shadow: 0 28px 64px rgba(15, 23, 42, 0.18);
        overflow: hidden;
        display: flex;
        flex-direction: column;
        z-index: 9998;
      }

      .ls-chatbot-thread {
        flex: 1;
        overflow: auto;
        padding: 18px;
        background:
          radial-gradient(circle at 12px 12px, rgba(27, 67, 50, 0.12) 1.5px, transparent 1.5px) 0 0 / 38px 38px,
          linear-gradient(180deg, #f6fbf7 0%, #ffffff 100%);
      }

      .ls-chatbot-bubble-user {
        margin-left: auto;
        max-width: 82%;
        background: linear-gradient(135deg, #2a6a4a 0%, #1b4332 100%);
        color: #fff;
        border-radius: 20px 20px 6px 20px;
        padding: 12px 14px;
        font-size: 14px;
        line-height: 1.5;
        margin-bottom: 12px;
      }

      .ls-chatbot-bubble-bot {
        max-width: 88%;
        background: #f1f5f9;
        color: #0f172a;
        border-radius: 20px 20px 20px 6px;
        padding: 12px 14px;
        font-size: 14px;
        line-height: 1.55;
        margin-bottom: 12px;
        white-space: pre-wrap;
      }
    `;
    document.head.appendChild(style);
  }

  function showFloatingNotice(message) {
    let toast = document.getElementById("ls-floating-notice");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "ls-floating-notice";
      toast.style.cssText = [
        "position:fixed",
        "right:24px",
        "bottom:110px",
        "background:#1b4332",
        "color:#fff",
        "padding:12px 16px",
        "border-radius:14px",
        "box-shadow:0 18px 34px rgba(27,67,50,0.28)",
        "z-index:10000",
        "font-size:13px",
        "font-weight:600",
        "max-width:280px",
        "line-height:1.5",
      ].join(";");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.display = "block";
    clearTimeout(floatingNoticeTimer);
    floatingNoticeTimer = window.setTimeout(() => {
      if (toast) toast.style.display = "none";
    }, 2200);
  }

  function seedChatbotMessages() {
    if (CHATBOT_STATE.messages.length) return;
    CHATBOT_STATE.messages = [
      {
        role: "bot",
        text: "LeafShelf AI is ready. Ask me if a book is available, what kind of book it is, who wrote it, its rating, pages, year, or ask for recommendations.",
      },
    ];
  }

  function renderChatbotUi() {
    ensureChatbotStyles();
    seedChatbotMessages();

    let fab = document.getElementById("ls-chatbot-fab");
    if (!fab) {
      fab = document.createElement("button");
      fab.id = "ls-chatbot-fab";
      fab.className = "ls-chatbot-fab";
      fab.type = "button";
      fab.innerHTML = "AI";
      fab.setAttribute("aria-label", "Open LeafShelf AI assistant");
      document.body.appendChild(fab);
    }

    let panel = document.getElementById("ls-chatbot-panel");
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "ls-chatbot-panel";
      panel.className = "ls-chatbot-panel";
      document.body.appendChild(panel);
    }

    panel.style.display = CHATBOT_STATE.open ? "flex" : "none";
    if (!CHATBOT_STATE.open) return;

    const existingInput = document.getElementById("ls-chatbot-input");
    const preservedDraft = existingInput ? existingInput.value : "";
    const hadFocus = document.activeElement === existingInput;

    panel.innerHTML = `
      <div style="padding:18px 18px 14px 18px;border-bottom:1px solid #eef2f7;display:flex;align-items:center;justify-content:space-between;gap:12px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:42px;height:42px;border-radius:999px;background:linear-gradient(135deg,#dff2e8 0%,#cce3d6 100%);display:flex;align-items:center;justify-content:center;color:#1b4332;font-weight:800;">AI</div>
          <div>
            <div style="font-size:15px;font-weight:700;color:#0f172a;">LeafShelf AI</div>
            <div style="font-size:12px;color:#64748b;">Library Assistant</div>
          </div>
        </div>
        <button type="button" data-ls-chatbot-close="1" style="border:none;background:none;color:#94a3b8;font-size:18px;cursor:pointer;">x</button>
      </div>
      <div class="ls-chatbot-thread" id="ls-chatbot-thread">
        ${CHATBOT_STATE.messages.map((message) => `
          <div class="${message.role === "user" ? "ls-chatbot-bubble-user" : "ls-chatbot-bubble-bot"}">${escapeHtml(message.text)}</div>
        `).join("")}
      </div>
      <div style="padding:14px;border-top:1px solid #eef2f7;background:#fff;display:flex;gap:10px;">
        <input id="ls-chatbot-input" type="text" placeholder="Ask about any book..." style="flex:1;height:46px;border:1px solid #dbe2ea;border-radius:16px;padding:0 14px;font-size:14px;">
        <button type="button" data-ls-chatbot-send="1" style="width:52px;height:46px;border:none;border-radius:16px;background:linear-gradient(135deg,#2f7a57 0%,#1b4332 100%);color:#fff;font-size:20px;cursor:pointer;">></button>
      </div>
    `;

    const thread = document.getElementById("ls-chatbot-thread");
    if (thread) {
      thread.scrollTop = thread.scrollHeight;
    }

    const closeButton = panel.querySelector("[data-ls-chatbot-close='1']");
    if (closeButton) {
      closeButton.onclick = () => {
        CHATBOT_STATE.open = false;
        renderChatbotUi();
      };
    }

    const sendButton = panel.querySelector("[data-ls-chatbot-send='1']");
    const input = panel.querySelector("#ls-chatbot-input");
    if (sendButton && input) {
      input.value = preservedDraft;
      sendButton.onclick = () => {
        const value = input.value;
        input.value = "";
        handleChatbotQuestion(value);
      };
      input.onkeydown = (event) => {
        if (event.key !== "Enter") return;
        event.preventDefault();
        const value = input.value;
        input.value = "";
        handleChatbotQuestion(value);
      };
      if (hadFocus) {
        setTimeout(() => input.focus(), 0);
      }
    }
  }

  function handleChatbotQuestion(question) {
    const trimmed = normalize(question);
    if (!trimmed) return;
    CHATBOT_STATE.messages.push({ role: "user", text: trimmed });
    const answer = answerLibraryQuestion(trimmed, chatbotBooks);
    CHATBOT_STATE.messages.push({ role: "bot", text: answer });
    renderChatbotUi();
  }

  function ensureChatbot(books) {
    chatbotBooks = books.slice();
    if (!document.getElementById("ls-chatbot-fab") || !document.getElementById("ls-chatbot-panel")) {
      renderChatbotUi();
    }
  }

  async function refreshFavoritesUi(options) {
    const books = await getCatalog();
    ensureChatbot(books);
    decorateBookCards(books);
    syncDetailFavoriteButton(books);
    syncDetailDownloadButton(books);
    renderFavoritesPage(books, !!options?.forceFavoritesRender);
    renderAudioBooksPage(books);
    renderDownloadsPage(books);
    renderSettingsPage();
  }

  function scheduleFavoritesRefresh(options) {
    clearTimeout(pageRefreshTimer);
    pageRefreshTimer = window.setTimeout(() => {
      void refreshFavoritesUi(options);
    }, 120);
  }

  function handleRouteRefresh() {
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (currentUrl === lastObservedUrl) return;
    lastObservedUrl = currentUrl;
    syncImmersiveAuthClass();
    applyAuthFieldFixes();
    if (window.location.pathname !== "/favorites") {
      favoritesFilter = "all";
    }
    scheduleFavoritesRefresh({ forceFavoritesRender: true });
  }

  window.addEventListener("popstate", handleRouteRefresh);
  window.addEventListener("storage", () => scheduleFavoritesRefresh({ forceFavoritesRender: true }));
  window.addEventListener("leafshelf:favorites-changed", () => scheduleFavoritesRefresh({ forceFavoritesRender: true }));

  function isChatbotNode(node) {
    return !!(node && node.nodeType === 1 && (node.id === "ls-chatbot-panel" || node.id === "ls-chatbot-fab" || node.closest?.("#ls-chatbot-panel") || node.closest?.("#ls-chatbot-fab")));
  }

  const mutationObserver = new MutationObserver((mutationsList) => {
    const mutations = Array.from(mutationsList || []);
    const onlyChatbotMutations = mutations.length > 0 && mutations.every((mutation) => {
      const changedNodes = [...Array.from(mutation.addedNodes || []), ...Array.from(mutation.removedNodes || [])];
      if (!changedNodes.length) {
        return isChatbotNode(mutation.target);
      }
      return changedNodes.every((node) => !node.nodeType || isChatbotNode(node));
    });

    if (onlyChatbotMutations) return;

    handleRouteRefresh();
    scheduleFavoritesRefresh();
  });

  mutationObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  window.setInterval(handleRouteRefresh, 500);
  window.addEventListener("load", () => scheduleFavoritesRefresh({ forceFavoritesRender: true }), { once: true });
  scheduleFavoritesRefresh({ forceFavoritesRender: true });

  function navigate(url) {
    window.location.assign(url);
  }

  function closeOverlay() {
    const overlay = document.getElementById("ls-enhancement-overlay");
    if (overlay) overlay.remove();
  }

  function openOverlay(title, subtitle, items) {
    closeOverlay();
    const overlay = document.createElement("div");
    overlay.id = "ls-enhancement-overlay";
    overlay.style.cssText = [
      "position:fixed",
      "inset:0",
      "background:rgba(15,23,42,0.45)",
      "display:flex",
      "justify-content:flex-end",
      "z-index:9999",
    ].join(";");

    const panel = document.createElement("div");
    panel.style.cssText = [
      "width:min(420px,95vw)",
      "height:100%",
      "overflow:auto",
      "background:#fff",
      "padding:24px",
      "box-shadow:-8px 0 32px rgba(0,0,0,0.18)",
      "position:relative",
    ].join(";");

    panel.innerHTML = `
      <button id="ls-enhancement-close" style="position:absolute;right:12px;top:12px;border:none;background:none;font-size:24px;cursor:pointer;color:#6b7280;">×</button>
      <h2 style="margin:0 0 4px 0;font:700 1.1rem Georgia,serif;color:#1b4332;">${title}</h2>
      <p style="margin:0 0 20px 0;font-size:12px;color:#6b7280;">${subtitle}</p>
      <div>
        ${items
          .map(
            (item) => `
            <div style="display:flex;gap:12px;border:1px solid #e5e7eb;border-radius:12px;padding:12px;margin-bottom:10px;">
              <div style="font-size:20px;line-height:1;">${item.icon}</div>
              <div>
                <div style="font-weight:600;font-size:13px;color:#111827;margin-bottom:2px;">${item.title}</div>
                <div style="font-size:12px;color:#6b7280;">${item.desc}</div>
              </div>
            </div>`,
          )
          .join("")}
      </div>
    `;

    overlay.appendChild(panel);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeOverlay();
    });

    document.body.appendChild(overlay);
    const closeBtn = document.getElementById("ls-enhancement-close");
    if (closeBtn) closeBtn.addEventListener("click", closeOverlay, { once: true });
  }

  function findSupportCardTitle(button) {
    const card = button.closest("div");
    if (!card) return null;
    const titles = Array.from(card.parentElement?.querySelectorAll("h3, h2, p, span") || []);
    const near = titles.find((el) => {
      const text = normalize(el.textContent);
      return SUPPORT_ARTICLES[text];
    });
    return near ? normalize(near.textContent) : null;
  }

  async function showStatusOverlay() {
    let status = "Service status is currently unavailable.";
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      status = data.ok
        ? `API healthy at ${data.time}`
        : "The API reported an unhealthy status.";
    } catch {
      status = "Unable to reach the health endpoint right now.";
    }
    openOverlay("System Status", "Live service health", [
      { icon: "🩺", title: "LeafShelf API", desc: status },
      { icon: "📡", title: "What to try", desc: "Refresh the page or sign in again if something looks stale." },
    ]);
  }

  function handleClick(event) {
    const chatbotFab = event.target.closest("#ls-chatbot-fab");
    if (chatbotFab) {
      event.preventDefault();
      CHATBOT_STATE.open = !CHATBOT_STATE.open;
      renderChatbotUi();
      return;
    }

    const chatbotClose = event.target.closest("[data-ls-chatbot-close='1']");
    if (chatbotClose) {
      event.preventDefault();
      CHATBOT_STATE.open = false;
      renderChatbotUi();
      return;
    }

    const chatbotSend = event.target.closest("[data-ls-chatbot-send='1']");
    if (chatbotSend) {
      event.preventDefault();
      const input = document.getElementById("ls-chatbot-input");
      if (input) {
        const value = input.value;
        input.value = "";
        handleChatbotQuestion(value);
      }
      return;
    }

    const audioFilterButton = event.target.closest("[data-ls-audio-filter]");
    if (audioFilterButton) {
      event.preventDefault();
      audioFilter = audioFilterButton.dataset.lsAudioFilter || "all";
      scheduleFavoritesRefresh({ forceFavoritesRender: true });
      return;
    }

    const downloadsFilterButton = event.target.closest("[data-ls-download-filter]");
    if (downloadsFilterButton) {
      event.preventDefault();
      downloadsFilter = downloadsFilterButton.dataset.lsDownloadFilter || "all";
      scheduleFavoritesRefresh({ forceFavoritesRender: true });
      return;
    }

    const detailDownloadButton = event.target.closest("[data-ls-detail-download='1']");
    if (detailDownloadButton) {
      event.preventDefault();
      const bookId = Number(detailDownloadButton.dataset.bookId);
      void getCatalog().then((books) => {
        const book = books.find((item) => Number(item.id) === bookId);
        if (!book) return;
        upsertDownloadEntry(book, "eBook");
        navigate("/downloads");
      });
      return;
    }

    const downloadsOpenButton = event.target.closest("[data-ls-download-open]");
    if (downloadsOpenButton) {
      event.preventDefault();
      const bookId = Number(downloadsOpenButton.dataset.lsDownloadOpen);
      const state = readAudioState();
      const downloads = readDownloadsState();
      const entry = downloads[String(bookId)];
      if (Number.isFinite(bookId) && entry?.format === "Audiobook") {
        state.nowPlayingId = bookId;
        if (!state.borrowedIds.includes(bookId)) {
          state.borrowedIds = [bookId, ...state.borrowedIds];
        }
        state.progressById[bookId] = Math.max(8, Number(state.progressById[bookId]) || 0);
        writeAudioState(state);
        navigate("/audio-books");
      } else if (Number.isFinite(bookId)) {
        navigate(`/books/${bookId}`);
      }
      return;
    }

    const downloadsDeleteButton = event.target.closest("[data-ls-download-delete]");
    if (downloadsDeleteButton) {
      event.preventDefault();
      const bookId = Number(downloadsDeleteButton.dataset.lsDownloadDelete);
      const state = readAudioState();
      state.downloadedIds = state.downloadedIds.filter((id) => id !== bookId);
      if (state.nowPlayingId === bookId) {
        state.nowPlayingId = state.borrowedIds.find((id) => id !== bookId) || null;
      }
      writeAudioState(state);
      removeDownloadEntry(bookId);
      scheduleFavoritesRefresh({ forceFavoritesRender: true });
      return;
    }

    const audioActionButton = event.target.closest("[data-ls-audio-action]");
    if (audioActionButton) {
      event.preventDefault();
      event.stopPropagation();
      const action = audioActionButton.dataset.lsAudioAction;
      const bookId = Number(audioActionButton.dataset.bookId);
      const state = readAudioState();
      const progress = Number(state.progressById[bookId]) || 0;

      if (action === "download") {
        const addingDownload = !state.downloadedIds.includes(bookId);
        state.downloadedIds = state.downloadedIds.includes(bookId)
          ? state.downloadedIds.filter((id) => id !== bookId)
          : [bookId, ...state.downloadedIds];
        void getCatalog().then((books) => {
          const book = books.find((item) => Number(item.id) === bookId);
          if (!book) return;
          if (state.downloadedIds.includes(bookId)) {
            upsertDownloadEntry(book, "Audiobook", { progress: Number(state.progressById[bookId]) || 0, completed: state.completedIds.includes(bookId) });
            showFloatingNotice(`${book.title} was added to Downloads.`);
            scheduleFavoritesRefresh({ forceFavoritesRender: true });
            setTimeout(() => navigate("/downloads?format=Audiobook"), 180);
          } else {
            removeDownloadEntry(bookId);
            showFloatingNotice(`${book.title} was removed from Downloads.`);
            scheduleFavoritesRefresh({ forceFavoritesRender: true });
          }
        });
      } else if (["primary", "play", "forward", "rewind"].includes(action) && Number.isFinite(bookId)) {
        if (!state.borrowedIds.includes(bookId)) {
          state.borrowedIds = [bookId, ...state.borrowedIds];
        }
        state.nowPlayingId = bookId;

        let nextProgress = progress;
        if (action === "rewind") nextProgress = Math.max(0, progress - 10);
        if (action === "forward") nextProgress = Math.min(100, progress + 15);
        if (action === "play") nextProgress = Math.min(100, Math.max(progress, 8));
        if (action === "primary") nextProgress = Math.min(100, progress > 0 ? progress + 15 : 12);

        state.progressById[bookId] = nextProgress;
        if (nextProgress >= 100) {
          if (!state.completedIds.includes(bookId)) state.completedIds = [bookId, ...state.completedIds];
        } else {
          state.completedIds = state.completedIds.filter((id) => id !== bookId);
        }
      }

      writeAudioState(state);
      if (Number.isFinite(bookId) && state.downloadedIds.includes(bookId)) {
        void getCatalog().then((books) => {
          const book = books.find((item) => Number(item.id) === bookId);
          if (book) {
            upsertDownloadEntry(book, "Audiobook", { progress: Number(state.progressById[bookId]) || 0, completed: state.completedIds.includes(bookId) });
          }
        });
      }
      if (["primary", "play"].includes(action) && Number.isFinite(bookId)) {
        const nowPlayingCard = document.querySelector(".ls-audio-sidecard");
        if (nowPlayingCard) {
          nowPlayingCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        void getCatalog().then((books) => {
          const book = books.find((item) => Number(item.id) === bookId);
          if (book && action === "primary") {
            showFloatingNotice(`${book.title} is now in your listening queue.`);
          }
        });
      }
      scheduleFavoritesRefresh({ forceFavoritesRender: true });
      return;
    }

    const audioUpgradeButton = event.target.closest("[data-ls-audio-upgrade='1']");
    if (audioUpgradeButton) {
      event.preventDefault();
      navigate("/register");
      return;
    }

    const settingsTabButton = event.target.closest("[data-ls-settings-tab-button]");
    if (settingsTabButton) {
      event.preventDefault();
      event.stopPropagation();
      const nextState = readSettingsState();
      nextState.activeTab = settingsTabButton.dataset.lsSettingsTabButton || "Profile";
      writeSettingsState(nextState);
      const root = document.querySelector("main .fade-in > div");
      if (root) {
        root.dataset.lsSettingsEnhanced = "";
      }
      renderSettingsPage();
      return;
    }

    const settingsToggle = event.target.closest("[data-ls-settings-toggle]");
    if (settingsToggle) {
      event.preventDefault();
      event.stopPropagation();
      const key = settingsToggle.dataset.lsSettingsToggle;
      const nextState = readSettingsState();
      nextState[key] = !nextState[key];
      writeSettingsState(nextState);
      const root = document.querySelector("main .fade-in > div");
      if (root) {
        root.dataset.lsSettingsEnhanced = "";
      }
      renderSettingsPage();
      return;
    }

    const settingsSave = event.target.closest("[data-ls-settings-save='1']");
    if (settingsSave) {
      event.preventDefault();
      event.stopPropagation();
      const nextState = readSettingsState();
      Array.from(document.querySelectorAll("[data-ls-settings-field]")).forEach((field) => {
        nextState[field.dataset.lsSettingsField] = field.value;
      });
      writeSettingsState(nextState);
      renderSettingsPage();
      return;
    }

    const settingsCancel = event.target.closest("[data-ls-settings-cancel='1']");
    if (settingsCancel) {
      event.preventDefault();
      event.stopPropagation();
      renderSettingsPage();
      return;
    }

    const favoriteToggle = event.target.closest("[data-ls-favorite-toggle='1']");
    if (favoriteToggle) {
      event.preventDefault();
      event.stopPropagation();
      const bookId = Number(favoriteToggle.dataset.bookId);
      if (Number.isFinite(bookId)) {
        toggleFavorite(bookId);
        renderSettingsPage();
      }
      return;
    }

    const favoritesFilterButton = event.target.closest("[data-ls-favorites-filter]");
    if (favoritesFilterButton) {
      event.preventDefault();
      favoritesFilter = favoritesFilterButton.dataset.lsFavoritesFilter || "all";
      scheduleFavoritesRefresh({ forceFavoritesRender: true });
      return;
    }

    const openBookButton = event.target.closest("[data-ls-open-book='1']");
    if (openBookButton) {
      event.preventDefault();
      const title = openBookButton.dataset.bookTitle;
      navigate(`/books?search=${encodeURIComponent(title || "")}`);
      return;
    }

    const browseBooksButton = event.target.closest("[data-ls-browse-books='1']");
    if (browseBooksButton) {
      event.preventDefault();
      navigate("/books");
      return;
    }

    const button = event.target.closest("button");
    if (!button) return;
    const text = normalize(button.textContent);
    const path = window.location.pathname;

    if (text === "Audio Books") {
      event.preventDefault();
      navigate("/audio-books");
      return;
    }

    if (text === "Upgrade Now") {
      event.preventDefault();
      navigate("/register");
      return;
    }

    if (path === "/downloads" && text === "Open") {
      event.preventDefault();
      const row = button.closest("tr");
      const title = normalize(row?.querySelector("td p")?.textContent);
      if (title) navigate(`/books?search=${encodeURIComponent(title)}`);
      return;
    }

    if (path === "/downloads" && text === "Delete") {
      event.preventDefault();
      const row = button.closest("tr");
      if (row) {
        row.remove();
      }
      const bodyRows = Array.from(document.querySelectorAll("tbody tr"));
      if (!bodyRows.some((rowEl) => rowEl.querySelector("td"))) {
        const tbody = document.querySelector("tbody");
        if (tbody) {
          const emptyRow = document.createElement("tr");
          emptyRow.innerHTML =
            '<td colspan="6" class="text-center py-12 text-muted text-sm">No downloads in this category</td>';
          tbody.appendChild(emptyRow);
        }
      }
      return;
    }

    if ((path === "/login" || path === "/register") && ["Google", "Apple", "Facebook"].includes(text)) {
      event.preventDefault();
      openOverlay("Social Sign-In", "This option is not enabled yet", [
        { icon: "🔑", title: "Use email and password", desc: "The email sign-in form is fully available right now." },
        { icon: "🛟", title: "Need help?", desc: "Open Support if you want account access assistance." },
      ]);
      return;
    }

    if (path === "/support" && text === "View Articles →") {
      event.preventDefault();
      const category = findSupportCardTitle(button) || "Technical Support";
      openOverlay(category, "Helpful support articles", SUPPORT_ARTICLES[category] || SUPPORT_ARTICLES["Technical Support"]);
      return;
    }

    if (path === "/support" && text === "Start Chat") {
      event.preventDefault();
      openOverlay("Start Chat", "Contact the LeafShelf support team", [
        { icon: "💬", title: "Chat request", desc: "Email support@leafshelf.app and mention the issue you are seeing." },
        { icon: "🕒", title: "Response hours", desc: "Support replies Monday to Friday, 9:00 AM to 6:00 PM." },
      ]);
      return;
    }

    if (path === "/support" && text === "View all contact options →") {
      event.preventDefault();
      openOverlay("Contact Options", "Ways to reach the LeafShelf team", [
        { icon: "✉️", title: "Email support", desc: "support@leafshelf.app" },
        { icon: "💬", title: "Chat request", desc: "Use Start Chat to open a support email draft." },
        { icon: "🕒", title: "Hours", desc: "Monday to Friday, 9:00 AM to 6:00 PM." },
      ]);
      return;
    }

    if (path === "/support" && text === "View status page →") {
      event.preventDefault();
      void showStatusOverlay();
      return;
    }

    if (path === "/support" && text === "Submit a Ticket") {
      event.preventDefault();
      openOverlay("Submit a Ticket", "Create a support request", [
        { icon: "📝", title: "Email subject", desc: "Use: LeafShelf Support Ticket" },
        { icon: "✉️", title: "Send to", desc: "support@leafshelf.app" },
        { icon: "📚", title: "Helpful details", desc: "Include the page name, what you clicked, and what you expected." },
      ]);
    }
  }

  document.addEventListener("click", handleClick, true);

  document.addEventListener("input", (event) => {
    const searchInput = event.target.closest("[data-ls-audio-search='1']");
    if (searchInput) {
      audioSearch = searchInput.value || "";
      scheduleFavoritesRefresh({ forceFavoritesRender: true });
      return;
    }

    const settingsField = event.target.closest("[data-ls-settings-field]");
    if (settingsField && settingsField.type !== "password") {
      const nextState = readSettingsState();
      nextState[settingsField.dataset.lsSettingsField] = settingsField.value;
      writeSettingsState(nextState);
    }
  }, true);

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const input = event.target.closest("#ls-chatbot-input");
    if (!input) return;
    event.preventDefault();
    const value = input.value;
    input.value = "";
    handleChatbotQuestion(value);
  }, true);

  document.addEventListener("change", (event) => {
    const categorySelect = event.target.closest("[data-ls-audio-category='1']");
    if (categorySelect) {
      audioCategory = categorySelect.value || "All Categories";
      scheduleFavoritesRefresh({ forceFavoritesRender: true });
      return;
    }

    const sortSelect = event.target.closest("[data-ls-audio-sort='1']");
    if (sortSelect) {
      audioSort = (sortSelect.value || "").replace(/^Sort by:\s*/, "") || "Most Popular";
      scheduleFavoritesRefresh({ forceFavoritesRender: true });
      return;
    }
  }, true);
})();



