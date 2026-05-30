<div align="center">

<img src="leafshelf-jee/client/public/favicon.svg" width="72" alt="LeafShelf Logo" />

# LeafShelf

### The World's Best Online Library Experience

*Discover · Read · Borrow · Explore — all in one beautifully crafted app*

<br/>

[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Java](https://img.shields.io/badge/Jakarta_EE-10-ED8B00?style=for-the-badge&logo=oracle&logoColor=white)](https://jakarta.ee/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![H2](https://img.shields.io/badge/H2-Database-1E4D78?style=for-the-badge&logo=databricks&logoColor=white)](https://www.h2database.com/)

<br/>

![LeafShelf Landing](leafshelf-jee/client/screenshots/readme/01-home-landing.png)

</div>

---

## What is LeafShelf?

LeafShelf is a **full-stack online library platform** that lets readers discover, borrow, and read books in a beautifully designed environment. It pairs a cinematic, animated React frontend with a rock-solid Jakarta EE 10 backend — no bloated frameworks, just clean Servlet + JDBC engineering backed by a zero-config H2 database.

Whether you're browsing a curated catalog of 24 books, diving deep into an immersive reader, or running the library as an admin — LeafShelf has it all, polished to perfection.

---

## Feature Highlights

### For Readers
| Feature | Description |
|---|---|
| 🏠 **Cinematic Landing** | Animated falling-book hero with glassmorphism login form |
| 📚 **Full Book Catalog** | 24 books across 6 genres with covers, ratings, and metadata |
| 🎧 **Audiobooks** | Dedicated audiobook section with a persistent mini-player |
| 📖 **Immersive Reader** | Full reading experience with custom fonts, themes, and page tracking |
| 🔦 **Highlight Mode** | Select any text to save highlights, stored per-book |
| 📝 **Notes** | Add personal notes to any chapter, all saved to your device |
| 📋 **Table of Contents** | Jump to any chapter instantly with progress tracking |
| 🔍 **Search in Book** | Real-time text search within the current chapter with highlighting |
| ❤️ **Favorites** | Save and revisit your favourite books |
| 📥 **Downloads** | Track downloaded ebooks, audiobooks, and PDFs |
| 🗂️ **My Library** | View active loans and borrowing history |
| 👤 **Profile & Stats** | Days active, books completed, genres explored |
| ⚙️ **Settings** | Theme, notifications, privacy, and reading preferences |
| 🤖 **AI Chatbot** | Powered by Groq — get book recommendations and ask anything |
| 🌐 **Multi-language** | i18n support built in |

### For Admins
| Feature | Description |
|---|---|
| 📊 **Dashboard** | Live stats — total books, active users, issued books, overdue count |
| 📈 **Charts** | Borrowing activity line chart + category distribution donut chart |
| 📚 **Book Management** | Add, edit, delete books with full metadata |
| 👥 **User Management** | View all registered members, manage accounts |
| 🔄 **Borrowings** | Track every borrow and return across the system |
| 🏷️ **Categories** | Create and manage book categories |
| 📑 **Reports** | Export usage reports |
| 🕵️ **Audit Logs** | Full history of every admin action |
| ⚙️ **Admin Settings** | System-wide configuration |

---

## Screenshots

### Landing & Authentication

<table>
  <tr>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/01-home-landing.png" alt="Home — Logged Out" />
      <p align="center"><b>Home — Welcome Screen</b><br/>Animated hero with book recommendations and featured title</p>
    </td>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/02-login.png" alt="Login Page" />
      <p align="center"><b>Login</b><br/>Cinematic mountain backdrop with animated falling books</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/03-register.png" alt="Register Page" />
      <p align="center"><b>Register</b><br/>Create your account to start borrowing and reading</p>
    </td>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/04-home-loggedin.png" alt="Home — Logged In" />
      <p align="center"><b>Home — Personalised</b><br/>Recommendations, reading stats, and popular categories</p>
    </td>
  </tr>
</table>

---

### Browse & Discovery

<table>
  <tr>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/05-books-browse.png" alt="Browse Books" />
      <p align="center"><b>Browse Books</b><br/>Filter by genre, author, or availability — 24 books across 6 categories</p>
    </td>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/06-categories.png" alt="Categories" />
      <p align="center"><b>Categories</b><br/>Explore books by genre — Classic, Fantasy, Dystopian, and more</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/07-audiobooks.png" alt="Audiobooks" />
      <p align="center"><b>Audiobooks</b><br/>Dedicated audiobook section with playback controls</p>
    </td>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/08-book-detail.png" alt="Book Detail" />
      <p align="center"><b>Book Detail</b><br/>Full book info — synopsis, ratings, borrow, and add to library</p>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td>
      <img src="leafshelf-jee/client/screenshots/readme/09-book-detail-reviews.png" alt="Book Reviews" />
      <p align="center"><b>Reviews & Ratings</b><br/>Community reviews with star ratings for every title</p>
    </td>
  </tr>
</table>

---

### Immersive Book Reader

The reader is the heart of LeafShelf — a distraction-free reading environment with a full toolbar of tools.

<img src="leafshelf-jee/client/screenshots/readme/10-book-reader.png" alt="Book Reader" />
<p align="center"><b>Book Reader</b> — Chapter navigation, reading progress bar, font & theme controls, sidebar with Table of Contents and Notes</p>

<br/>

<table>
  <tr>
    <td width="33%">
      <img src="leafshelf-jee/client/screenshots/readme/11-book-reader-notes.png" alt="Notes & Highlights" />
      <p align="center"><b>Notes & Highlights</b><br/>Add personal notes to any chapter. Highlights captured by selecting text.</p>
    </td>
    <td width="33%">
      <img src="leafshelf-jee/client/screenshots/readme/12-book-reader-contents.png" alt="Table of Contents" />
      <p align="center"><b>Table of Contents</b><br/>Jump to any chapter instantly. Current chapter marked "Reading".</p>
    </td>
    <td width="33%">
      <img src="leafshelf-jee/client/screenshots/readme/13-book-reader-search.png" alt="Search in Book" />
      <p align="center"><b>Search in Book</b><br/>Real-time keyword search across the chapter with match count.</p>
    </td>
  </tr>
</table>

---

### Personal Library & Profile

<table>
  <tr>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/14-my-library.png" alt="My Library" />
      <p align="center"><b>My Library</b><br/>All active loans and borrowing history in one place</p>
    </td>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/15-favorites.png" alt="Favorites" />
      <p align="center"><b>Favorites</b><br/>Curated list of your saved books with quick access</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/16-downloads.png" alt="Downloads" />
      <p align="center"><b>Downloads</b><br/>Manage downloaded ebooks, audiobooks, and PDFs by tab</p>
    </td>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/17-profile.png" alt="Profile" />
      <p align="center"><b>Profile</b><br/>Reading stats — currently reading, books completed, days active, genres explored</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/18-settings.png" alt="Settings" />
      <p align="center"><b>Settings</b><br/>Account, notifications, privacy, and reading preferences</p>
    </td>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/19-support.png" alt="Support" />
      <p align="center"><b>Support</b><br/>Help center, FAQ, and contact options</p>
    </td>
  </tr>
</table>

---

### AI Chatbot

<img src="leafshelf-jee/client/screenshots/readme/20-chatbot-open.png" alt="AI Chatbot" />
<p align="center"><b>AI Chatbot — powered by Groq</b><br/>Ask for book recommendations, get plot summaries, or chat about anything. Available on every page as a floating assistant.</p>

---

### Admin Panel

<img src="leafshelf-jee/client/screenshots/readme/21-admin-login.png" alt="Admin Login" />
<p align="center"><b>Admin Login</b> — Secure restricted-access portal. Demo: <code>admin</code> / <code>admin123</code></p>

<br/>

<img src="leafshelf-jee/client/screenshots/readme/22-admin-dashboard.png" alt="Admin Dashboard" />
<p align="center"><b>Admin Dashboard</b> — Live KPIs, borrowing activity chart, category distribution donut, recent borrow requests, and quick-action cards</p>

<br/>

<table>
  <tr>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/23-admin-books.png" alt="Admin Books" />
      <p align="center"><b>Book Management</b><br/>Full CRUD for the entire catalog — add, edit, delete books</p>
    </td>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/24-admin-users.png" alt="Admin Users" />
      <p align="center"><b>User Management</b><br/>View all registered members, roles, and account details</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/25-admin-borrowings.png" alt="Admin Borrowings" />
      <p align="center"><b>Borrowings</b><br/>Track every active and returned loan system-wide</p>
    </td>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/26-admin-categories.png" alt="Admin Categories" />
      <p align="center"><b>Category Management</b><br/>Create and manage book genre categories</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/27-admin-reports.png" alt="Admin Reports" />
      <p align="center"><b>Reports</b><br/>Usage analytics and exportable data reports</p>
    </td>
    <td width="50%">
      <img src="leafshelf-jee/client/screenshots/readme/28-admin-audit.png" alt="Admin Audit Logs" />
      <p align="center"><b>Audit Logs</b><br/>Full chronological history of every admin action taken</p>
    </td>
  </tr>
</table>

<table>
  <tr>
    <td>
      <img src="leafshelf-jee/client/screenshots/readme/29-admin-settings.png" alt="Admin Settings" />
      <p align="center"><b>Admin Settings</b><br/>System-wide configuration — library name, borrowing rules, notifications</p>
    </td>
  </tr>
</table>

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI component library |
| **TypeScript 5** | Type safety across the entire codebase |
| **Vite 5** | Lightning-fast dev server and bundler |
| **React Router 6** | Client-side routing |
| **Tailwind CSS 3** | Utility-first styling |
| **Axios** | HTTP client for API calls |
| **Groq SDK** | AI chatbot integration |

### Backend
| Technology | Purpose |
|---|---|
| **Jakarta EE 10** | Enterprise Java platform |
| **Servlet 6** | HTTP request handling |
| **JDBC + HikariCP** | Database access with connection pooling |
| **H2 Embedded** | Zero-config embedded database |
| **Jackson** | JSON serialization |
| **jBCrypt** | Password hashing |
| **Jetty 12** | Embedded web server |

### Storage & State
| Layer | Mechanism |
|---|---|
| **Server data** | H2 relational database (books, users, loans) |
| **Session auth** | `HttpSession` — cookie `LEAFSHELF_SESSION` |
| **Client state** | React state + Context API |
| **Persistence** | `localStorage` (reading progress, notes, favorites, prefs) |

---

## Getting Started

### Prerequisites

| Tool | Version |
|---|---|
| JDK | 17+ (Eclipse Temurin recommended) |
| Maven | 3.9+ |
| Node.js | 18+ |
| npm | 9+ |

Verify with:
```bash
java -version && mvn -version && node --version && npm --version
```

### 1 — Clone the repo

```bash
git clone https://github.com/thedramer20/leafshelf-Online-library.git
cd leafshelf-Online-library/leafshelf-jee
```

### 2 — Build the React frontend

```bash
cd client
npm install
npm run build
cd ..
```

### 3 — Start the backend

```bash
mvn jetty:run
```

Wait for: `🌿 LeafShelf is up. Open http://localhost:8080`

> **Note:** If port 8080 is in use, Jetty auto-switches to **8081**. Check the log line for the actual port.

### 4 — Open the app

| URL | What |
|---|---|
| `http://localhost:8081/` | React SPA (main app) |
| `http://localhost:8081/admin` | Admin panel |
| `http://localhost:8081/api/health` | API health check |
| `http://localhost:8081/api/books` | Books JSON |

### Hot-Reload Development (two terminals)

```bash
# Terminal 1 — Backend
mvn jetty:run

# Terminal 2 — Frontend (with hot reload)
cd client
npm run dev       # → http://localhost:5173
```

Vite automatically proxies all `/api/*` requests to the backend at `:8081`.

---

## Demo Credentials

### Reader Account
Register any account at `/register` — instant access, no email verification.

### Admin Account
| Field | Value |
|---|---|
| Username | `admin` |
| Password | `admin123` |

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/books` | All books (supports `?search=`, `?category=`) |
| `GET` | `/api/books/{id}` | Single book by ID |
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login (returns session cookie) |
| `POST` | `/api/auth/logout` | End session |
| `GET` | `/api/loans/my-loans` | Current user's loans (auth required) |
| `POST` | `/api/loans` | Borrow a book (auth required) |
| `PUT` | `/api/loans/{id}/return` | Return a book (auth required) |
| `GET` | `/api/admin/stats` | Dashboard stats (admin only) |
| `GET` | `/api/admin/users` | All users (admin only) |

---

## Project Structure

```
leafshelf-jee/
├── client/                          # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatBot.tsx          # AI chatbot (Groq)
│   │   │   ├── GlobalAudioPlayer.tsx# Persistent audio player
│   │   │   ├── Sidebar.tsx          # Main navigation
│   │   │   └── Topbar.tsx           # Search + notifications
│   │   ├── pages/
│   │   │   ├── Home.tsx             # Landing / discovery
│   │   │   ├── Books.tsx            # Browse catalog
│   │   │   ├── BookDetail.tsx       # Book info + borrow
│   │   │   ├── BookReader.tsx       # Immersive reader
│   │   │   ├── Audiobooks.tsx       # Audio library
│   │   │   ├── Categories.tsx       # Genre browser
│   │   │   ├── MyLibrary.tsx        # Active loans
│   │   │   ├── Favorites.tsx        # Saved books
│   │   │   ├── Downloads.tsx        # Downloaded content
│   │   │   ├── Profile.tsx          # User stats
│   │   │   ├── Settings.tsx         # Preferences
│   │   │   ├── Support.tsx          # Help center
│   │   │   ├── AdminDashboard.tsx   # Admin overview
│   │   │   ├── AdminBooks.tsx       # Book CRUD
│   │   │   ├── AdminUsers.tsx       # User management
│   │   │   ├── AdminBorrowings.tsx  # Loan tracking
│   │   │   ├── AdminCategories.tsx  # Genre management
│   │   │   ├── AdminReports.tsx     # Analytics
│   │   │   └── AdminAudit.tsx       # Audit log
│   │   └── lib/
│   │       ├── api.ts               # All API calls + localStorage helpers
│   │       ├── bookContent.ts       # Book text content
│   │       ├── audioPlayer.tsx      # Audio player context
│   │       ├── readingProgress.ts   # Chapter progress persistence
│   │       └── i18n.ts              # Internationalisation
│   └── public/
│       └── favicon.svg
│
└── src/main/                        # Jakarta EE backend
    ├── java/com/leafshelf/
    │   ├── beans/                   # Book, User, Loan POJOs
    │   ├── dao/                     # BookDAO, UserDAO, LoanDAO
    │   ├── servlets/api/            # REST endpoints
    │   │   ├── AuthServlet.java
    │   │   ├── BooksServlet.java
    │   │   ├── LoansServlet.java
    │   │   └── AdminServlet.java
    │   ├── filters/
    │   │   ├── CorsFilter.java      # CORS headers
    │   │   └── SpaFilter.java       # SPA routing fallback
    │   └── util/
    │       └── DB.java              # HikariCP connection pool
    └── resources/
        ├── books-seed.json          # 24 books auto-seeded on first run
        └── db.properties            # H2 / MySQL config
```

---

## Database

LeafShelf ships with **H2 embedded** — zero setup, auto-creates tables and seeds 24 books on first launch.

**Switching to MySQL:**
1. Edit `src/main/resources/db.properties`
2. Comment out the H2 block, uncomment MySQL
3. Run `mysql -u root -p < schema.sql`
4. Set your password

---

## localStorage Keys

All client-side persistence uses structured localStorage keys:

| Key | Contents |
|---|---|
| `leafshelf:reading-progress` | Per-book chapter position |
| `leafshelf:reading-prefs` | Font, size, theme, line spacing |
| `leafshelf:notes:{bookId}` | Highlights and notes per book |
| `leafshelf:borrowed` | Borrow history |
| `leafshelf:returned` | Return history |
| `leafshelf:reviews` | User-written reviews |
| `leafshelf:reading-goal` | Weekly reading goal |
| `leafshelf:downloads` | Downloaded content entries |

---

## Licence

MIT — free to use, fork, and build upon.

---

<div align="center">

Built with ❤️ — **LeafShelf** · *Your story starts here*

</div>
