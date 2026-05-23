package com.leafshelf.servlets.api;

import com.leafshelf.util.DB;
import com.leafshelf.util.Json;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.*;
import java.util.*;

/**
 * GET /api/admin/stats — aggregate dashboard data.
 * Protected by AdminFilter.
 */
@WebServlet("/api/admin/stats")
public class AdminStatsServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        try (Connection c = DB.getConnection()) {
            Map<String, Object> result = new LinkedHashMap<>();

            result.put("totalBooks",    scalar(c, "SELECT COUNT(*) FROM books"));
            result.put("totalUsers",    scalar(c, "SELECT COUNT(*) FROM users"));
            result.put("issuedBooks",   scalar(c, "SELECT COUNT(*) FROM loans WHERE status = 'active'"));
            result.put("overdueBooks",  scalar(c, "SELECT COUNT(*) FROM loans WHERE status = 'active' AND due_at < CURRENT_TIMESTAMP"));
            result.put("totalLoans",    scalar(c, "SELECT COUNT(*) FROM loans"));

            // Category distribution
            List<Map<String, Object>> catDist = new ArrayList<>();
            try (Statement s = c.createStatement();
                 ResultSet rs = s.executeQuery(
                     "SELECT category, COUNT(*) AS cnt FROM books GROUP BY category ORDER BY cnt DESC")) {
                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("name",  rs.getString("category"));
                    row.put("count", rs.getLong("cnt"));
                    catDist.add(row);
                }
            }
            result.put("categoryDistribution", catDist);

            // Recent 10 loans
            List<Map<String, Object>> recentLoans = new ArrayList<>();
            String loanSql =
                "SELECT l.id, u.name AS user_name, b.title AS book_title, " +
                "       l.borrowed_at, l.due_at, l.status " +
                "FROM loans l " +
                "JOIN users u ON l.user_id = u.id " +
                "JOIN books b ON l.book_id = b.id " +
                "ORDER BY l.borrowed_at DESC LIMIT 10";
            try (Statement s = c.createStatement(); ResultSet rs = s.executeQuery(loanSql)) {
                while (rs.next()) {
                    Map<String, Object> row = new LinkedHashMap<>();
                    row.put("id",         rs.getLong("id"));
                    row.put("userName",   rs.getString("user_name"));
                    row.put("bookTitle",  rs.getString("book_title"));
                    row.put("borrowedAt", rs.getString("borrowed_at"));
                    row.put("dueAt",      rs.getString("due_at"));
                    row.put("status",     rs.getString("status"));
                    recentLoans.add(row);
                }
            }
            result.put("recentLoans", recentLoans);

            Json.write(resp, 200, result);
        } catch (SQLException e) {
            getServletContext().log("Admin stats error", e);
            Json.writeError(resp, 500, "Database error");
        }
    }

    private static long scalar(Connection c, String sql) throws SQLException {
        try (Statement s = c.createStatement(); ResultSet rs = s.executeQuery(sql)) {
            return rs.next() ? rs.getLong(1) : 0L;
        }
    }
}
