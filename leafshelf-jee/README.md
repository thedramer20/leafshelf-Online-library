# 🌿 LeafShelf — Online Library

A small, browseable online library built on classic **Jakarta EE** (Servlet · JSP · JavaBean · JDBC) with a modern **React + TypeScript** frontend.

The same backend serves **two UIs**:
- **Modern SPA** at `/` — React + TypeScript + Tailwind, calls the REST API
- **Classic JSP view** at `/classic/*` — fully server-rendered, demonstrates JSP + JavaBeans + JSTL

Both UIs share the same `Servlet` controllers, `JavaBean` data objects, and `JDBC` data access layer.

---

## Requirements

- **JDK 17 or newer** (Jakarta EE 10 requires it)
- **Maven 3.6+**
- **MySQL 8** (default — see `db.properties` for an H2 fallback that needs zero install)
- **Node.js 18+** (only to build the React frontend)

---

## Project layout

```
leafshelf/
├── pom.xml                       # Maven build (WAR + Jetty dev server)
├── schema.sql                    # MySQL schema (auto-applied on first run too)
├── src/main/
│   ├── java/com/leafshelf/
│   │   ├── beans/                # JavaBeans: User, Book, Loan
│   │   ├── dao/                  # JDBC data access: UserDAO, BookDAO, LoanDAO
│   │   ├── servlets/api/         # REST API servlets → JSON
│   │   ├── servlets/web/         # JSP-serving servlets (classic view)
│   │   ├── filters/              # CORS + Auth filters
│   │   ├── listeners/            # AppListener: schema init + book seed
│   │   └── util/                 # DB, JSON, password, session helpers
│   ├── resources/
│   │   ├── db.properties         # JDBC config (edit me!)
│   │   └── books-seed.json       # 24 books seeded on first launch
│   └── webapp/
│       ├── WEB-INF/web.xml
│       ├── WEB-INF/jsp/          # Server-rendered JSP pages
│       └── index.jsp             # Fallback welcome page
└── client/                       # React + TypeScript frontend (Vite)
    ├── package.json
    └── src/
        ├── components/
        ├── pages/
        ├── lib/                  # api.ts, auth.tsx, types.ts
        └── main.tsx
```

---

## Quick start (Windows)

```bat
START.bat
```

That script will: install React deps, build the frontend, then `mvn jetty:run`.

## Quick start (macOS / Linux)

```sh
./START.sh
```

Then open **http://localhost:8080**.

---

## Manual setup

### 1. Set up MySQL

Create a database named `leafshelf` and load the schema:

```sh
mysql -u root -p < schema.sql
```

Edit `src/main/resources/db.properties` if your MySQL is not on `localhost:3306` or doesn't accept `root` with empty password.

> **Want zero database setup?** Open `db.properties`, comment out the MySQL block and uncomment the H2 block. The app will create the file `./leafshelf-data/leafshelf.mv.db` automatically. No install needed.

### 2. Build the React frontend

```sh
cd client
npm install
npm run build
cd ..
```

This produces `client/dist/` which Maven bundles into the WAR.

### 3. Run

**For development**, use the embedded Jetty 12 (Jakarta EE 10) server:

```sh
mvn jetty:run
```

Then open http://localhost:8080.

**On first start** the app will:
- Create the `users`, `books`, `loans` tables if missing
- Seed 24 books from `books-seed.json`

You'll see this in the terminal:

```
  ✓ Schema ready
  ✓ Seeded 24 books
  🌿 LeafShelf is up. Open http://localhost:8080
```

### 4. (Optional) Deploy as WAR

```sh
mvn clean package
```

Produces `target/leafshelf.war` — drop it into any Jakarta EE 10 servlet container:
- Tomcat 10.1+ (`webapps/leafshelf.war`)
- Jetty 12
- WildFly 27+, Payara 6, etc.

---

## Running with hot-reload (two-terminal dev)

For iterating on the React side, use Vite's dev server:

```sh
# Terminal 1 — backend
mvn jetty:run

# Terminal 2 — frontend
cd client
npm run dev
```

The Vite dev server runs at **http://localhost:5173** and proxies `/api/*` to the backend on `:8080`. Session cookies pass through transparently.

---

## URL map

### React SPA
| URL                | Page                            |
| ------------------ | ------------------------------- |
| `/`                | Home                            |
| `/books`           | Browse catalog                  |
| `/books/:id`       | Book detail                     |
| `/login`           | Sign in                         |
| `/register`        | Create account                  |
| `/library`         | My loans (auth)                 |
| `/profile`         | Account info (auth)             |

### REST API (servlets returning JSON)
| Method | URL                              | Notes                  |
| ------ | -------------------------------- | ---------------------- |
| GET    | `/api/health`                    | Status check           |
| POST   | `/api/auth/register`             | `{name,email,password}`|
| POST   | `/api/auth/login`                | `{email,password}`     |
| POST   | `/api/auth/logout`               |                        |
| GET    | `/api/auth/me`                   | auth                   |
| GET    | `/api/books?search=&category=`   |                        |
| GET    | `/api/books/categories`          |                        |
| GET    | `/api/books/{id}`                |                        |
| GET    | `/api/loans/my-loans`            | auth                   |
| POST   | `/api/loans/borrow/{bookId}`     | auth                   |
| POST   | `/api/loans/return/{loanId}`     | auth                   |

### Classic JSP view (server-rendered)
| URL                       | Page                  |
| ------------------------- | --------------------- |
| `/classic`                | Home                  |
| `/classic/books`          | Catalog               |
| `/classic/book?id={id}`   | Book detail           |
| `/classic/login`          | Sign in               |
| `/classic/register`       | Register              |
| `/classic/library`        | My loans              |
| `/classic/logout`         | Logout (redirect)     |

---

## Where each requirement lives

| Requirement | Files |
|-------------|-------|
| **JSP**     | `src/main/webapp/WEB-INF/jsp/*.jsp` + `_header.jspf`, `_footer.jspf`. Uses JSTL `c:`, `fmt:` taglibs and `<jsp:useBean>` |
| **Servlet** | `src/main/java/com/leafshelf/servlets/{api,web}/*.java` — all controllers extend `HttpServlet` and use `@WebServlet` |
| **JavaBean**| `src/main/java/com/leafshelf/beans/{User,Book,Loan}.java` — `Serializable` POJOs with no-arg ctor + getters/setters |
| **JDBC**    | `src/main/java/com/leafshelf/dao/*.java` — uses `Connection`, `PreparedStatement`, `ResultSet` directly. Transactions in `LoanDAO.borrow/returnLoan` (begin/commit/rollback + `SELECT … FOR UPDATE`) |

---

## Authentication

Auth uses **`HttpSession`** (classic Java EE) — no JWT.

- Session cookie name: `LEAFSHELF_SESSION`, httpOnly, 60 min timeout
- The React frontend sends `withCredentials: true` so cookies flow through XHR
- The Vite dev proxy forwards `Set-Cookie` between `:5173` and `:8080`
- In production both apps are same-origin (served from the WAR), so cookies just work

Passwords are stored as **bcrypt** hashes (`org.mindrot:jbcrypt`).

---

## Loan rules

- 14-day loan period (`LoanDAO.LOAN_DAYS`)
- A user can't borrow the same book twice while a copy is active
- Borrowing decrements `available_copies` atomically inside a transaction with `SELECT … FOR UPDATE`
- Returning is similarly transactional

---

## Tech stack

**Backend:** Jakarta EE 10 · Servlet 6 · JSP · JSTL 3 · JDBC · MySQL 8 (or H2) · HikariCP · Jackson · jBCrypt · Embedded Jetty 12 (dev)

**Frontend:** React 18 · TypeScript 5 · Vite 5 · React Router 6 · Axios · Tailwind 3 · Fraunces + DM Sans

**Build:** Maven (WAR packaging) · npm

---

## Troubleshooting

**"Communications link failure" on startup** — MySQL isn't running or `db.properties` credentials are wrong. Either fix them or switch to H2 in `db.properties`.

**"Address already in use" — port 8080** — Something else is on 8080. Change the Jetty port in `pom.xml` (`<httpConnector><port>8080</port>`) or use `mvn jetty:run -Djetty.http.port=9090`.

**React build fails** — Make sure you're on Node 18+. Run `node --version`.

**Page says "404 Not Found"** — Make sure you built the React frontend (`cd client && npm run build`) before `mvn package`. Maven bundles `client/dist/` into the WAR root.
