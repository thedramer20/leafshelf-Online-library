package com.leafshelf.dao;

import com.leafshelf.beans.Book;
import com.leafshelf.util.DB;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class BookDAO {

    private static final String SELECT_ALL =
            "SELECT id, title, author, isbn, description, category, cover_url, " +
            "       total_copies, available_copies, published_year, pages, rating, created_at " +
            "FROM books";

    public List<Book> list(String search, String category) throws SQLException {
        StringBuilder sql = new StringBuilder(SELECT_ALL);
        List<Object> params = new ArrayList<>();
        List<String> where = new ArrayList<>();

        if (search != null && !search.isBlank()) {
            where.add("(LOWER(title) LIKE ? OR LOWER(author) LIKE ? OR LOWER(description) LIKE ?)");
            String like = "%" + search.toLowerCase() + "%";
            params.add(like); params.add(like); params.add(like);
        }
        if (category != null && !category.isBlank() && !"All".equalsIgnoreCase(category)) {
            where.add("category = ?");
            params.add(category);
        }
        if (!where.isEmpty()) {
            sql.append(" WHERE ").append(String.join(" AND ", where));
        }
        sql.append(" ORDER BY title");

        try (Connection c = DB.getConnection();
             PreparedStatement ps = c.prepareStatement(sql.toString())) {
            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }
            try (ResultSet rs = ps.executeQuery()) {
                List<Book> out = new ArrayList<>();
                while (rs.next()) out.add(map(rs));
                return out;
            }
        }
    }

    public Book findById(long id) throws SQLException {
        try (Connection c = DB.getConnection();
             PreparedStatement ps = c.prepareStatement(SELECT_ALL + " WHERE id = ?")) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? map(rs) : null;
            }
        }
    }

    public List<String> listCategories() throws SQLException {
        try (Connection c = DB.getConnection();
             PreparedStatement ps = c.prepareStatement(
                     "SELECT DISTINCT category FROM books ORDER BY category");
             ResultSet rs = ps.executeQuery()) {
            List<String> out = new ArrayList<>();
            while (rs.next()) out.add(rs.getString(1));
            return out;
        }
    }

    public long count() throws SQLException {
        try (Connection c = DB.getConnection();
             PreparedStatement ps = c.prepareStatement("SELECT COUNT(*) FROM books");
             ResultSet rs = ps.executeQuery()) {
            return rs.next() ? rs.getLong(1) : 0;
        }
    }

    public long insert(Book b) throws SQLException {
        String sql = "INSERT INTO books (title, author, isbn, description, category, cover_url, " +
                     "                   total_copies, available_copies, published_year, pages, rating) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection c = DB.getConnection();
             PreparedStatement ps = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, b.getTitle());
            ps.setString(2, b.getAuthor());
            ps.setString(3, b.getIsbn());
            ps.setString(4, b.getDescription());
            ps.setString(5, b.getCategory());
            ps.setString(6, b.getCoverUrl());
            ps.setInt(7, b.getTotalCopies());
            ps.setInt(8, b.getTotalCopies()); // available starts equal to total
            if (b.getPublishedYear() != null) ps.setInt(9, b.getPublishedYear()); else ps.setNull(9, Types.INTEGER);
            if (b.getPages() != null) ps.setInt(10, b.getPages()); else ps.setNull(10, Types.INTEGER);
            ps.setDouble(11, b.getRating());
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                return keys.next() ? keys.getLong(1) : -1L;
            }
        }
    }

    private static Book map(ResultSet rs) throws SQLException {
        Book b = new Book();
        b.setId(rs.getLong("id"));
        b.setTitle(rs.getString("title"));
        b.setAuthor(rs.getString("author"));
        b.setIsbn(rs.getString("isbn"));
        b.setDescription(rs.getString("description"));
        b.setCategory(rs.getString("category"));
        b.setCoverUrl(rs.getString("cover_url"));
        b.setTotalCopies(rs.getInt("total_copies"));
        b.setAvailableCopies(rs.getInt("available_copies"));
        int py = rs.getInt("published_year"); b.setPublishedYear(rs.wasNull() ? null : py);
        int pg = rs.getInt("pages"); b.setPages(rs.wasNull() ? null : pg);
        b.setRating(rs.getDouble("rating"));
        b.setCreatedAt(rs.getTimestamp("created_at"));
        return b;
    }
}
