package com.leafshelf.dao;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.leafshelf.beans.Book;
import com.leafshelf.util.BookCoverUrls;
import com.leafshelf.util.DB;

import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

public class BookDAO {

    public List<Book> findAll(String search, String category) throws SQLException {
        StringBuilder sql = new StringBuilder(
            "SELECT id, title, author, isbn, description, category, cover_url, " +
            "total_copies, available_copies, published_year, pages, rating, created_at " +
            "FROM books WHERE 1=1");

        List<Object> params = new ArrayList<>();

        if (search != null && !search.isBlank()) {
            sql.append(" AND (LOWER(title) LIKE ? OR LOWER(author) LIKE ?)");
            String like = "%" + search.toLowerCase() + "%";
            params.add(like);
            params.add(like);
        }
        if (category != null && !category.isBlank()) {
            sql.append(" AND category = ?");
            params.add(category);
        }
        sql.append(" ORDER BY title");

        List<Book> books = new ArrayList<>();
        try (Connection c = DB.get().getConnection();
             PreparedStatement ps = c.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) books.add(map(rs));
            }
        }
        return books;
    }

    public Book findById(long id) throws SQLException {
        String sql = "SELECT id, title, author, isbn, description, category, cover_url, " +
                     "total_copies, available_copies, published_year, pages, rating, created_at " +
                     "FROM books WHERE id = ?";
        try (Connection c = DB.get().getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return map(rs);
            }
        }
        return null;
    }

    public List<String> findCategories() throws SQLException {
        String sql = "SELECT DISTINCT category FROM books ORDER BY category";
        List<String> cats = new ArrayList<>();
        try (Connection c = DB.get().getConnection();
             Statement s = c.createStatement();
             ResultSet rs = s.executeQuery(sql)) {
            while (rs.next()) cats.add(rs.getString(1));
        }
        return cats;
    }

    public Book createBook(String title, String author, String isbn, String description,
                           String category, String coverUrl, int totalCopies, int availableCopies,
                           Integer publishedYear, Integer pages, double rating) throws SQLException {
        String sql = "INSERT INTO books (title, author, isbn, description, category, cover_url, " +
                     "total_copies, available_copies, published_year, pages, rating) " +
                     "VALUES (?,?,?,?,?,?,?,?,?,?,?)";
        try (Connection c = DB.get().getConnection();
             PreparedStatement ps = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, title);
            ps.setString(2, author);
            ps.setString(3, isbn == null ? "" : isbn);
            ps.setString(4, description == null ? "" : description);
            ps.setString(5, category == null ? "General" : category);
            ps.setString(6, coverUrl == null ? "" : coverUrl);
            ps.setInt(7, totalCopies);
            ps.setInt(8, availableCopies);
            if (publishedYear != null) ps.setInt(9, publishedYear); else ps.setNull(9, Types.INTEGER);
            if (pages != null) ps.setInt(10, pages); else ps.setNull(10, Types.INTEGER);
            ps.setDouble(11, rating);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return findById(keys.getLong(1));
            }
        }
        throw new SQLException("Book creation failed");
    }

    public boolean updateBook(long id, String title, String author, String isbn, String description,
                              String category, String coverUrl, int totalCopies, int availableCopies,
                              Integer publishedYear, Integer pages, double rating) throws SQLException {
        String sql = "UPDATE books SET title=?, author=?, isbn=?, description=?, category=?, " +
                     "cover_url=?, total_copies=?, available_copies=?, published_year=?, pages=?, rating=? WHERE id=?";
        try (Connection c = DB.get().getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, title);
            ps.setString(2, author);
            ps.setString(3, isbn == null ? "" : isbn);
            ps.setString(4, description == null ? "" : description);
            ps.setString(5, category == null ? "General" : category);
            ps.setString(6, coverUrl == null ? "" : coverUrl);
            ps.setInt(7, totalCopies);
            ps.setInt(8, availableCopies);
            if (publishedYear != null) ps.setInt(9, publishedYear); else ps.setNull(9, Types.INTEGER);
            if (pages != null) ps.setInt(10, pages); else ps.setNull(10, Types.INTEGER);
            ps.setDouble(11, rating);
            ps.setLong(12, id);
            return ps.executeUpdate() > 0;
        }
    }

    public boolean deleteBook(long id) throws SQLException {
        try (Connection c = DB.get().getConnection();
             PreparedStatement ps = c.prepareStatement("DELETE FROM books WHERE id=?")) {
            ps.setLong(1, id);
            return ps.executeUpdate() > 0;
        }
    }

    /** Migrates any existing books that have external cover URLs to use local SVG covers. */
    public void fixCoverUrls() throws SQLException {
        record BookRow(long id, String title, String author, String category) {}
        List<BookRow> rows = new ArrayList<>();

        try (Connection c = DB.get().getConnection();
             Statement s = c.createStatement();
             ResultSet rs = s.executeQuery(
                 "SELECT id, title, author, category FROM books WHERE cover_url LIKE 'http%' OR cover_url = ''")) {
            while (rs.next()) {
                rows.add(new BookRow(rs.getLong("id"), rs.getString("title"),
                                     rs.getString("author"), rs.getString("category")));
            }
        }
        if (rows.isEmpty()) return;

        try (Connection c = DB.get().getConnection();
             PreparedStatement ps = c.prepareStatement("UPDATE books SET cover_url = ? WHERE id = ?")) {
            for (BookRow row : rows) {
                String url = "/api/covers?title=" + URLEncoder.encode(row.title(), StandardCharsets.UTF_8)
                           + "&author=" + URLEncoder.encode(row.author(), StandardCharsets.UTF_8)
                           + "&cat=" + URLEncoder.encode(row.category(), StandardCharsets.UTF_8);
                ps.setString(1, url);
                ps.setLong(2, row.id());
                ps.addBatch();
            }
            ps.executeBatch();
        }
        System.out.println("  ✓ Updated cover URLs for " + rows.size() + " books");
    }

    /** Loads books-seed.json and inserts all books if the table is empty. Returns count seeded. */
    public int seedIfEmpty() throws Exception {
        try (Connection c = DB.get().getConnection();
             Statement s = c.createStatement();
             ResultSet rs = s.executeQuery("SELECT COUNT(*) FROM books")) {
            if (rs.next() && rs.getLong(1) > 0) return 0;
        }

        InputStream in = getClass().getClassLoader().getResourceAsStream("books-seed.json");
        if (in == null) return 0;

        ObjectMapper om = new ObjectMapper();
        List<Map<String, Object>> entries = om.readValue(in, new TypeReference<>() {});

        String sql = "INSERT INTO books (title, author, isbn, description, category, cover_url, " +
                     "total_copies, available_copies, published_year, pages, rating) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        try (Connection c = DB.get().getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            for (Map<String, Object> e : entries) {
                ps.setString(1, str(e, "title"));
                ps.setString(2, str(e, "author"));
                ps.setString(3, str(e, "isbn"));
                ps.setString(4, str(e, "description"));
                ps.setString(5, str(e, "category"));
                ps.setString(6, BookCoverUrls.resolve(str(e, "cover_url"), str(e, "isbn")));
                ps.setInt(7, num(e, "total_copies", 3));
                ps.setInt(8, num(e, "available_copies", 3));
                Object py = e.get("published_year");
                if (py != null) ps.setInt(9, ((Number) py).intValue());
                else ps.setNull(9, Types.INTEGER);
                Object pg = e.get("pages");
                if (pg != null) ps.setInt(10, ((Number) pg).intValue());
                else ps.setNull(10, Types.INTEGER);
                ps.setDouble(11, ((Number) e.getOrDefault("rating", 0.0)).doubleValue());
                ps.addBatch();
            }
            int[] counts = ps.executeBatch();
            return counts.length;
        }
    }

    private static String str(Map<String, Object> m, String k) {
        Object v = m.get(k);
        return v == null ? "" : v.toString();
    }

    private static int num(Map<String, Object> m, String k, int def) {
        Object v = m.get(k);
        return v instanceof Number ? ((Number) v).intValue() : def;
    }

    private Book map(ResultSet rs) throws SQLException {
        Book b = new Book();
        b.setId(rs.getLong("id"));
        b.setTitle(rs.getString("title"));
        b.setAuthor(rs.getString("author"));
        b.setIsbn(rs.getString("isbn"));
        b.setDescription(rs.getString("description"));
        b.setCategory(rs.getString("category"));
        b.setCoverUrl(BookCoverUrls.resolve(rs.getString("cover_url"), rs.getString("isbn")));
        b.setTotalCopies(rs.getInt("total_copies"));
        b.setAvailableCopies(rs.getInt("available_copies"));
        int py = rs.getInt("published_year");
        if (!rs.wasNull()) b.setPublishedYear(py);
        int pg = rs.getInt("pages");
        if (!rs.wasNull()) b.setPages(pg);
        b.setRating(rs.getDouble("rating"));
        Timestamp ts = rs.getTimestamp("created_at");
        if (ts != null) b.setCreatedAt(ts.toInstant());
        return b;
    }
}
