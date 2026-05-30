package com.leafshelf.listeners;

import com.leafshelf.dao.BookDAO;
import com.leafshelf.dao.UserDAO;
import com.leafshelf.util.DB;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;

import java.sql.Connection;
import java.sql.Statement;

@WebListener
public class AppListener implements ServletContextListener {

    @Override
    public void contextInitialized(ServletContextEvent sce) {
        try {
            DB.init();
            initSchema();
            migrateSchema();
            int seeded = new BookDAO().seedIfEmpty();
            if (seeded > 0) System.out.println("  ✓ Seeded " + seeded + " books");
            ensureAdminExists();
            System.out.println("🌿 LeafShelf is up. Open http://localhost:8081");
        } catch (Exception e) {
            throw new RuntimeException("LeafShelf startup failed: " + e.getMessage(), e);
        }
    }

    private void initSchema() throws Exception {
        try (Connection c = DB.get().getConnection(); Statement s = c.createStatement()) {
            s.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id            BIGINT       NOT NULL AUTO_INCREMENT,
                    name          VARCHAR(80)  NOT NULL,
                    email         VARCHAR(160) NOT NULL UNIQUE,
                    password_hash VARCHAR(255) NOT NULL,
                    created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (id)
                )
                """);
            s.execute("""
                CREATE TABLE IF NOT EXISTS books (
                    id               BIGINT       NOT NULL AUTO_INCREMENT,
                    title            VARCHAR(255) NOT NULL,
                    author           VARCHAR(160) NOT NULL,
                    isbn             VARCHAR(20),
                    description      TEXT         NOT NULL,
                    category         VARCHAR(60)  NOT NULL DEFAULT 'General',
                    cover_url        VARCHAR(500) NOT NULL DEFAULT '',
                    total_copies     INT          NOT NULL DEFAULT 1,
                    available_copies INT          NOT NULL DEFAULT 1,
                    published_year   INT,
                    pages            INT,
                    rating           DOUBLE       NOT NULL DEFAULT 0,
                    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (id)
                )
                """);
            s.execute("""
                CREATE TABLE IF NOT EXISTS loans (
                    id           BIGINT      NOT NULL AUTO_INCREMENT,
                    user_id      BIGINT      NOT NULL,
                    book_id      BIGINT      NOT NULL,
                    borrowed_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    due_at       TIMESTAMP   NOT NULL,
                    returned_at  TIMESTAMP   NULL DEFAULT NULL,
                    status       VARCHAR(16) NOT NULL DEFAULT 'active',
                    PRIMARY KEY (id),
                    CONSTRAINT fk_loans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    CONSTRAINT fk_loans_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
                )
                """);
            System.out.println("  ✓ Schema ready");
        }
    }

    private void migrateSchema() throws Exception {
        try (Connection c = DB.get().getConnection(); Statement s = c.createStatement()) {
            s.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT FALSE");
        }
    }

    private void ensureAdminExists() throws Exception {
        UserDAO dao = new UserDAO();
        if (dao.countUsers() > 0) {
            dao.setAdminById(1L, true);
            System.out.println("  ✓ User id=1 is admin");
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        DB.close();
    }
}
