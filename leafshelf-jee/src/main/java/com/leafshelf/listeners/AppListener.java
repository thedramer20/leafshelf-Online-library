package com.leafshelf.listeners;

import com.fasterxml.jackson.core.type.TypeReference;
import com.leafshelf.beans.Book;
import com.leafshelf.dao.BookDAO;
import com.leafshelf.util.DB;
import com.leafshelf.util.Json;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.Statement;
import java.util.List;

/**
 * Runs at app startup:
 *   1. Ensures the DB schema exists (creates tables if missing).
 *   2. Seeds 24 curated books on first launch (when the books table is empty).
 */
@WebListener
public class AppListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        try {
            createSchemaIfMissing();
            seedBooksIfEmpty();
            System.out.println("\n  🌿 LeafShelf is up. Open http://localhost:8080\n");
        } catch (Exception e) {
            System.err.println("[LeafShelf] Startup failed: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException(e);
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        DB.shutdown();
    }

    private void createSchemaIfMissing() throws Exception {
        boolean h2 = DB.isH2();
        String autoinc = h2 ? "BIGINT AUTO_INCREMENT PRIMARY KEY"
                            : "BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY";
        String engine = h2 ? "" : " ENGINE=InnoDB";

        String usersDdl =
                "CREATE TABLE IF NOT EXISTS users (" +
                "  id " + autoinc + "," +
                "  name VARCHAR(80) NOT NULL," +
                "  email VARCHAR(160) NOT NULL UNIQUE," +
                "  password_hash VARCHAR(255) NOT NULL," +
                "  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP" +
                ")" + engine;

        String booksDdl =
                "CREATE TABLE IF NOT EXISTS books (" +
                "  id " + autoinc + "," +
                "  title VARCHAR(255) NOT NULL," +
                "  author VARCHAR(160) NOT NULL," +
                "  isbn VARCHAR(20)," +
                "  description TEXT NOT NULL," +
                "  category VARCHAR(60) NOT NULL DEFAULT 'General'," +
                "  cover_url VARCHAR(500) NOT NULL DEFAULT ''," +
                "  total_copies INT NOT NULL DEFAULT 1," +
                "  available_copies INT NOT NULL DEFAULT 1," +
                "  published_year INT," +
                "  pages INT," +
                "  rating DOUBLE NOT NULL DEFAULT 0," +
                "  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP" +
                ")" + engine;

        String loansDdl =
                "CREATE TABLE IF NOT EXISTS loans (" +
                "  id " + autoinc + "," +
                "  user_id BIGINT NOT NULL," +
                "  book_id BIGINT NOT NULL," +
                "  borrowed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP," +
                "  due_at TIMESTAMP NOT NULL," +
                "  returned_at TIMESTAMP NULL DEFAULT NULL," +
                "  status VARCHAR(16) NOT NULL DEFAULT 'active'," +
                "  CONSTRAINT fk_loans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE," +
                "  CONSTRAINT fk_loans_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE" +
                ")" + engine;

        try (Connection c = DB.getConnection(); Statement s = c.createStatement()) {
            s.execute(usersDdl);
            s.execute(booksDdl);
            s.execute(loansDdl);
            // Indexes (create separately so re-runs don't fail)
            try { s.execute("CREATE INDEX idx_books_category ON books(category)"); } catch (Exception ignore) { }
            try { s.execute("CREATE INDEX idx_loans_user ON loans(user_id)"); } catch (Exception ignore) { }
            try { s.execute("CREATE INDEX idx_loans_book ON loans(book_id)"); } catch (Exception ignore) { }
            // Add is_admin column if missing (safe to re-run)
            try { s.execute("ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE"); } catch (Exception ignore) { }
        }
        System.out.println("  ✓ Schema ready");
    }

    private void seedBooksIfEmpty() throws Exception {
        BookDAO bookDAO = new BookDAO();
        if (bookDAO.count() > 0) {
            System.out.println("  ℹ Books already seeded (" + bookDAO.count() + " rows). Skipping.");
            return;
        }
        try (InputStream in = getClass().getResourceAsStream("/books-seed.json")) {
            if (in == null) {
                System.err.println("  ⚠ books-seed.json not found, skipping seed.");
                return;
            }
            List<Book> books = Json.MAPPER.readValue(in, new TypeReference<List<Book>>() {});
            for (Book b : books) bookDAO.insert(b);
            System.out.println("  ✓ Seeded " + books.size() + " books");
        }
    }
}
