package com.leafshelf.servlets.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.leafshelf.beans.Book;
import com.leafshelf.beans.User;
import com.leafshelf.dao.BookDAO;
import com.leafshelf.dao.LoanDAO;
import com.leafshelf.dao.UserDAO;
import com.leafshelf.util.DB;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.sql.*;
import java.util.*;

@WebServlet("/api/admin/*")
public class AdminServlet extends HttpServlet {
    private static final ObjectMapper OM = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    // ── GET ────────────────────────────────────────────────────────────────
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json;charset=UTF-8");
        String path = req.getPathInfo();
        try {
            if ("/stats".equals(path))  { handleStats(res); }
            else if ("/users".equals(path))  { handleListUsers(res); }
            else if ("/loans".equals(path))  { handleListLoans(res); }
            else { res.setStatus(404); }
        } catch (Exception e) {
            res.setStatus(500);
            OM.writeValue(res.getOutputStream(), Map.of("error", e.getMessage()));
        }
    }

    // ── POST ───────────────────────────────────────────────────────────────
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json;charset=UTF-8");
        String path = req.getPathInfo();
        try {
            if ("/users".equals(path))                              { handleCreateUser(req, res); }
            else if (path != null && path.startsWith("/loans/return/")) { handleAdminReturn(req, res, path); }
            else if ("/books".equals(path))                         { handleCreateBook(req, res); }
            else { res.setStatus(404); }
        } catch (Exception e) {
            res.setStatus(500);
            OM.writeValue(res.getOutputStream(), Map.of("error", e.getMessage()));
        }
    }

    // ── PUT ────────────────────────────────────────────────────────────────
    @Override
    protected void doPut(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json;charset=UTF-8");
        String path = req.getPathInfo();
        try {
            if (path != null && path.startsWith("/books/"))      { handleUpdateBook(req, res, path); }
            else if (path != null && path.startsWith("/users/")) { handleUpdateUser(req, res, path); }
            else { res.setStatus(404); }
        } catch (Exception e) {
            res.setStatus(500);
            OM.writeValue(res.getOutputStream(), Map.of("error", e.getMessage()));
        }
    }

    // ── DELETE ─────────────────────────────────────────────────────────────
    @Override
    protected void doDelete(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json;charset=UTF-8");
        String path = req.getPathInfo();
        try {
            if (path != null && path.startsWith("/books/")) { handleDeleteBook(req, res, path); }
            else { res.setStatus(404); }
        } catch (Exception e) {
            res.setStatus(500);
            OM.writeValue(res.getOutputStream(), Map.of("error", e.getMessage()));
        }
    }

    // ── Handler: GET /stats ────────────────────────────────────────────────
    private void handleStats(HttpServletResponse res) throws Exception {
        try (Connection c = DB.get().getConnection()) {
            Map<String, Object> stats = new LinkedHashMap<>();

            try (ResultSet rs = c.createStatement().executeQuery("SELECT COUNT(*) FROM books")) {
                stats.put("totalBooks", rs.next() ? rs.getLong(1) : 0L);
            }
            stats.put("totalUsers", new UserDAO().countUsers());
            try (ResultSet rs = c.createStatement().executeQuery(
                    "SELECT COUNT(*) FROM loans WHERE status='active'")) {
                stats.put("issuedBooks", rs.next() ? rs.getLong(1) : 0L);
            }
            try (ResultSet rs = c.createStatement().executeQuery(
                    "SELECT COUNT(*) FROM loans WHERE status='active' AND due_at < CURRENT_TIMESTAMP")) {
                stats.put("overdueBooks", rs.next() ? rs.getLong(1) : 0L);
            }
            try (ResultSet rs = c.createStatement().executeQuery("SELECT COUNT(*) FROM loans")) {
                stats.put("totalLoans", rs.next() ? rs.getLong(1) : 0L);
            }

            List<Map<String, Object>> cats = new ArrayList<>();
            try (ResultSet rs = c.createStatement().executeQuery(
                    "SELECT category AS name, COUNT(*) AS cnt FROM books GROUP BY category ORDER BY cnt DESC")) {
                while (rs.next()) {
                    Map<String, Object> cat = new LinkedHashMap<>();
                    cat.put("name", rs.getString("name"));
                    cat.put("count", rs.getLong("cnt"));
                    cats.add(cat);
                }
            }
            stats.put("categoryDistribution", cats);

            List<Map<String, Object>> loans = new ArrayList<>();
            String loanSql = """
                    SELECT l.id, u.name AS userName, b.title AS bookTitle,
                           l.borrowed_at, l.due_at, l.status
                    FROM loans l
                    JOIN users u ON u.id = l.user_id
                    JOIN books b ON b.id = l.book_id
                    ORDER BY l.borrowed_at DESC
                    LIMIT 10
                    """;
            try (ResultSet rs = c.createStatement().executeQuery(loanSql)) {
                while (rs.next()) {
                    Map<String, Object> loan = new LinkedHashMap<>();
                    loan.put("id", rs.getLong("id"));
                    loan.put("userName", rs.getString("userName"));
                    loan.put("bookTitle", rs.getString("bookTitle"));
                    Timestamp ba = rs.getTimestamp("borrowed_at");
                    loan.put("borrowedAt", ba != null ? ba.toInstant().toString() : null);
                    Timestamp da = rs.getTimestamp("due_at");
                    loan.put("dueAt", da != null ? da.toInstant().toString() : null);
                    loan.put("status", rs.getString("status"));
                    loans.add(loan);
                }
            }
            stats.put("recentLoans", loans);
            OM.writeValue(res.getOutputStream(), stats);
        }
    }

    // ── Handler: GET /users ────────────────────────────────────────────────
    private void handleListUsers(HttpServletResponse res) throws Exception {
        List<User> users = new UserDAO().findAll();
        OM.writeValue(res.getOutputStream(), users);
    }

    // ── Handler: POST /users ───────────────────────────────────────────────
    private void handleCreateUser(HttpServletRequest req, HttpServletResponse res) throws Exception {
        @SuppressWarnings("unchecked")
        Map<String, Object> body = OM.readValue(req.getInputStream(), Map.class);
        String name     = str(body, "name");
        String email    = str(body, "email");
        String password = str(body, "password");
        boolean isAdmin = Boolean.TRUE.equals(body.get("is_admin"));

        if (name.isEmpty() || email.isEmpty()) {
            res.setStatus(400);
            OM.writeValue(res.getOutputStream(), Map.of("error", "Name and email are required"));
            return;
        }
        UserDAO dao = new UserDAO();
        if (dao.findByEmail(email) != null) {
            res.setStatus(409);
            OM.writeValue(res.getOutputStream(), Map.of("error", "Email already registered"));
            return;
        }
        String pw = password.isEmpty() ? "changeme123" : password;
        User user = dao.createUser(name, email, pw, isAdmin);
        res.setStatus(201);
        OM.writeValue(res.getOutputStream(), user);
    }

    // ── Handler: PUT /users/{id} ───────────────────────────────────────────
    private void handleUpdateUser(HttpServletRequest req, HttpServletResponse res, String path) throws Exception {
        long id;
        try { id = Long.parseLong(path.substring("/users/".length())); }
        catch (NumberFormatException e) {
            res.setStatus(400); OM.writeValue(res.getOutputStream(), Map.of("error", "Invalid user id")); return;
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> body = OM.readValue(req.getInputStream(), Map.class);
        UserDAO dao = new UserDAO();
        if (body.containsKey("is_admin")) {
            dao.setAdminById(id, Boolean.TRUE.equals(body.get("is_admin")));
        }
        User user = dao.findById(id);
        if (user == null) {
            res.setStatus(404); OM.writeValue(res.getOutputStream(), Map.of("error", "User not found")); return;
        }
        OM.writeValue(res.getOutputStream(), user);
    }

    // ── Handler: GET /loans ────────────────────────────────────────────────
    private void handleListLoans(HttpServletResponse res) throws Exception {
        List<Map<String, Object>> loans = new LoanDAO().findAllAdmin();
        OM.writeValue(res.getOutputStream(), loans);
    }

    // ── Handler: POST /loans/return/{id} ──────────────────────────────────
    private void handleAdminReturn(HttpServletRequest req, HttpServletResponse res, String path) throws Exception {
        long loanId;
        try { loanId = Long.parseLong(path.substring("/loans/return/".length())); }
        catch (NumberFormatException e) {
            res.setStatus(400); OM.writeValue(res.getOutputStream(), Map.of("error", "Invalid loan id")); return;
        }
        boolean ok = new LoanDAO().adminReturnLoan(loanId);
        if (!ok) {
            res.setStatus(404);
            OM.writeValue(res.getOutputStream(), Map.of("error", "Loan not found or already returned"));
            return;
        }
        OM.writeValue(res.getOutputStream(), Map.of("ok", true));
    }

    // ── Handler: POST /books ───────────────────────────────────────────────
    private void handleCreateBook(HttpServletRequest req, HttpServletResponse res) throws Exception {
        @SuppressWarnings("unchecked")
        Map<String, Object> body = OM.readValue(req.getInputStream(), Map.class);
        String title  = str(body, "title");
        String author = str(body, "author");
        if (title.isEmpty() || author.isEmpty()) {
            res.setStatus(400);
            OM.writeValue(res.getOutputStream(), Map.of("error", "Title and author are required"));
            return;
        }
        Book book = new BookDAO().createBook(
            title, author,
            str(body, "isbn"), str(body, "description"), str(body, "category"),
            str(body, "cover_url"),
            intVal(body, "total_copies", 1), intVal(body, "available_copies", 1),
            intOrNull(body, "published_year"), intOrNull(body, "pages"),
            dblVal(body, "rating", 0.0)
        );
        res.setStatus(201);
        OM.writeValue(res.getOutputStream(), Map.of("book", book));
    }

    // ── Handler: PUT /books/{id} ───────────────────────────────────────────
    private void handleUpdateBook(HttpServletRequest req, HttpServletResponse res, String path) throws Exception {
        long id;
        try { id = Long.parseLong(path.substring("/books/".length())); }
        catch (NumberFormatException e) {
            res.setStatus(400); OM.writeValue(res.getOutputStream(), Map.of("error", "Invalid book id")); return;
        }
        @SuppressWarnings("unchecked")
        Map<String, Object> body = OM.readValue(req.getInputStream(), Map.class);
        BookDAO dao = new BookDAO();
        Book existing = dao.findById(id);
        if (existing == null) {
            res.setStatus(404); OM.writeValue(res.getOutputStream(), Map.of("error", "Book not found")); return;
        }
        boolean ok = dao.updateBook(id,
            bodyStr(body, "title",           existing.getTitle()),
            bodyStr(body, "author",          existing.getAuthor()),
            bodyStr(body, "isbn",            existing.getIsbn() != null ? existing.getIsbn() : ""),
            bodyStr(body, "description",     existing.getDescription()),
            bodyStr(body, "category",        existing.getCategory()),
            bodyStr(body, "cover_url",       existing.getCoverUrl() != null ? existing.getCoverUrl() : ""),
            intVal(body, "total_copies",     existing.getTotalCopies()),
            intVal(body, "available_copies", existing.getAvailableCopies()),
            intOrNull(body, "published_year"),
            intOrNull(body, "pages"),
            dblVal(body, "rating",           existing.getRating())
        );
        if (!ok) {
            res.setStatus(500); OM.writeValue(res.getOutputStream(), Map.of("error", "Update failed")); return;
        }
        OM.writeValue(res.getOutputStream(), Map.of("book", dao.findById(id)));
    }

    // ── Handler: DELETE /books/{id} ────────────────────────────────────────
    private void handleDeleteBook(HttpServletRequest req, HttpServletResponse res, String path) throws Exception {
        long id;
        try { id = Long.parseLong(path.substring("/books/".length())); }
        catch (NumberFormatException e) {
            res.setStatus(400); OM.writeValue(res.getOutputStream(), Map.of("error", "Invalid book id")); return;
        }
        boolean ok = new BookDAO().deleteBook(id);
        if (!ok) {
            res.setStatus(404); OM.writeValue(res.getOutputStream(), Map.of("error", "Book not found")); return;
        }
        OM.writeValue(res.getOutputStream(), Map.of("ok", true));
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    private String str(Map<String, Object> m, String k) {
        Object v = m.get(k); return v == null ? "" : v.toString().trim();
    }
    private String bodyStr(Map<String, Object> m, String k, String fallback) {
        Object v = m.get(k);
        return (v != null && !v.toString().isBlank()) ? v.toString().trim() : fallback;
    }
    private int intVal(Map<String, Object> m, String k, int def) {
        Object v = m.get(k); return v instanceof Number ? ((Number) v).intValue() : def;
    }
    private Integer intOrNull(Map<String, Object> m, String k) {
        Object v = m.get(k); return v instanceof Number ? ((Number) v).intValue() : null;
    }
    private double dblVal(Map<String, Object> m, String k, double def) {
        Object v = m.get(k); return v instanceof Number ? ((Number) v).doubleValue() : def;
    }
}
