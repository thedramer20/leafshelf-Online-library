# LeafShelf — CLAUDE.md

Project-level instructions for Claude Code. Read this before any action.

---

## What This Project Is

Full-stack online library — Jakarta EE 10 backend (Servlet · JSP · JavaBean · JDBC) + React 18 / TypeScript frontend. Two UIs share one backend:

- **React SPA** at `/` — Vite · React Router · Axios · Tailwind
- **Classic JSP view** at `/classic` — server-rendered, JSTL

Database: **H2 embedded** (already configured — zero setup needed). MySQL option exists but is commented out in `db.properties`.

---

## Prerequisites (confirmed working on this machine)

| Tool | Version |
|------|---------|
| JDK  | 17.0.17 (Eclipse Temurin) |
| Maven | 3.9.15 |
| Node.js | v24.15.0 |
| npm | 11.12.1 |

---

## Step 0 — Check prerequisites

```powershell
java -version; javac -version; mvn -version; node --version; npm --version
```

All must pass before continuing.

---

## Step 1 — Database

H2 is already active in `src/main/resources/db.properties` (MySQL block is commented out). No action needed. The app auto-creates tables and seeds 24 books on first start.

To switch to MySQL: edit `db.properties` — uncomment the MySQL block, comment out H2, run `mysql -u root -p < schema.sql`, set your password.

---

## Step 2 — Build React frontend

```powershell
cd client
npm install        # skip if node_modules exists
npm run build      # produces client/dist/ — Maven bundles this into the WAR
cd ..
```

Expected output: `✓ built in Xs` with no errors.

---

## Step 3 — Start the server

From the project root (where `pom.xml` is):

```powershell
mvn jetty:run
```

Wait for: `🌿 LeafShelf is up. Open http://localhost:8080`

**Note:** Port 8080 may already be in use on this machine — Jetty will bind to **8081** instead. Check the log line `Started ServerConnector...{0.0.0.0:808X}` to confirm the actual port.

---

## Step 4 — Verify endpoints

**Important:** This machine has `http_proxy=http://127.0.0.1:7897` set in the environment. All `curl` calls to localhost must include `--noproxy localhost,127.0.0.1` or they will get `502 Bad Gateway` from the proxy.

```bash
# Health check
curl --noproxy localhost,127.0.0.1 http://localhost:8081/api/health
# Expected: {"ok":true,"service":"leafshelf-api","time":"..."}

# Book categories
curl --noproxy localhost,127.0.0.1 http://localhost:8081/api/books/categories
# Expected: {"categories":["Classic","Dystopian","Fantasy",...]}

# Books list
curl --noproxy localhost,127.0.0.1 http://localhost:8081/api/books
# Expected: {"books":[...]} with 24 entries

# React SPA root
curl --noproxy localhost,127.0.0.1 -o /dev/null -w "%{http_code}" http://localhost:8081/
# Expected: 200

# Classic JSP view
curl --noproxy localhost,127.0.0.1 -o /dev/null -w "%{http_code}" http://localhost:8081/classic
# Expected: 200
```

---

## URL Map

| URL | What |
|-----|------|
| `http://localhost:8081/` | React SPA |
| `http://localhost:8081/classic` | Classic JSP view |
| `http://localhost:8081/api/health` | Health check |
| `http://localhost:8081/api/books` | Book catalog (JSON) |
| `http://localhost:8081/api/books/categories` | Categories (JSON) |
| `http://localhost:8081/api/auth/register` | POST register |
| `http://localhost:8081/api/auth/login` | POST login |
| `http://localhost:8081/api/loans/my-loans` | GET loans (auth) |

---

## Known Issues & Fixes

| Issue | Fix |
|-------|-----|
| `curl` returns `502 Bad Gateway` on localhost | Add `--noproxy localhost,127.0.0.1` to every curl command |
| Port 8080 in use | Jetty auto-uses 8081; check `pom.xml` `<httpConnector><port>` to change it explicitly |
| `Communications link failure` on startup | MySQL not running; switch to H2 in `db.properties` |
| React build fails | Confirm `node --version` >= 18; run from inside `client/` |
| `404 Not Found` on SPA routes | Run `npm run build` in `client/` before `mvn jetty:run` |

---

## Quick Windows Start

```bat
START.bat
```

Then open `http://localhost:8081` (or 8080 if that port was free).

---

## Hot-reload Dev (two terminals)

```powershell
# Terminal 1 — backend
mvn jetty:run

# Terminal 2 — frontend
cd client
npm run dev      # Vite at http://localhost:5173, proxies /api/* to :8081
```

---

## Auth

Session-based (`HttpSession`), no JWT. Cookie: `LEAFSHELF_SESSION`, httpOnly, 60-min timeout. Passwords: bcrypt via jBCrypt.

---

## Tech Stack

**Backend:** Jakarta EE 10 · Servlet 6 · JSP · JSTL 3 · JDBC · H2 (or MySQL 8) · HikariCP · Jackson · jBCrypt · Jetty 12

**Frontend:** React 18 · TypeScript 5 · Vite 5 · React Router 6 · Axios · Tailwind 3
