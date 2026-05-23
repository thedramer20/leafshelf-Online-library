package com.leafshelf.dao;

import com.leafshelf.beans.Loan;
import com.leafshelf.util.DB;

import java.sql.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

public class LoanDAO {

    public static final int LOAN_DAYS = 14;

    /** Exceptions thrown with these messages so servlets can map to user-facing errors. */
    public static class BookNotFoundException extends RuntimeException {}
    public static class NoCopiesException extends RuntimeException {}
    public static class AlreadyBorrowedException extends RuntimeException {}
    public static class LoanNotFoundException extends RuntimeException {}
    public static class NotYourLoanException extends RuntimeException {}
    public static class AlreadyReturnedException extends RuntimeException {}

    public List<Loan> listByUser(long userId) throws SQLException {
        String sql = "SELECT l.id, l.user_id, l.book_id, l.borrowed_at, l.due_at, l.returned_at, l.status, " +
                     "       b.title, b.author, b.cover_url, b.category, b.pages " +
                     "FROM loans l JOIN books b ON b.id = l.book_id " +
                     "WHERE l.user_id = ? " +
                     "ORDER BY (CASE WHEN l.status = 'active' THEN 0 ELSE 1 END), l.borrowed_at DESC";
        try (Connection c = DB.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setLong(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                List<Loan> out = new ArrayList<>();
                while (rs.next()) out.add(map(rs, true));
                return out;
            }
        }
    }

    /**
     * Transactionally borrow a book: checks availability, prevents double-borrow,
     * decrements available_copies, inserts loan row. Returns the created loan id.
     */
    public long borrow(long userId, long bookId) throws SQLException {
        try (Connection c = DB.getConnection()) {
            c.setAutoCommit(false);
            try {
                // 1. Lock the book row to read available_copies.
                int available;
                try (PreparedStatement ps = c.prepareStatement(
                        "SELECT available_copies FROM books WHERE id = ? FOR UPDATE")) {
                    ps.setLong(1, bookId);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) throw new BookNotFoundException();
                        available = rs.getInt(1);
                    }
                }
                if (available <= 0) throw new NoCopiesException();

                // 2. Check the user doesn't already have this book on loan.
                try (PreparedStatement ps = c.prepareStatement(
                        "SELECT 1 FROM loans WHERE user_id = ? AND book_id = ? AND status = 'active'")) {
                    ps.setLong(1, userId);
                    ps.setLong(2, bookId);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (rs.next()) throw new AlreadyBorrowedException();
                    }
                }

                // 3. Insert loan with due date 14 days out.
                Timestamp due = Timestamp.from(Instant.now().plus(LOAN_DAYS, ChronoUnit.DAYS));
                long loanId;
                try (PreparedStatement ps = c.prepareStatement(
                        "INSERT INTO loans (user_id, book_id, due_at) VALUES (?, ?, ?)",
                        Statement.RETURN_GENERATED_KEYS)) {
                    ps.setLong(1, userId);
                    ps.setLong(2, bookId);
                    ps.setTimestamp(3, due);
                    ps.executeUpdate();
                    try (ResultSet keys = ps.getGeneratedKeys()) {
                        if (!keys.next()) throw new SQLException("No generated key");
                        loanId = keys.getLong(1);
                    }
                }

                // 4. Decrement available_copies.
                try (PreparedStatement ps = c.prepareStatement(
                        "UPDATE books SET available_copies = available_copies - 1 WHERE id = ?")) {
                    ps.setLong(1, bookId);
                    ps.executeUpdate();
                }

                c.commit();
                return loanId;
            } catch (RuntimeException | SQLException e) {
                c.rollback();
                throw e;
            } finally {
                c.setAutoCommit(true);
            }
        }
    }

    /** Transactionally return a loan: marks it returned, increments book's available_copies. */
    public void returnLoan(long userId, long loanId) throws SQLException {
        try (Connection c = DB.getConnection()) {
            c.setAutoCommit(false);
            try {
                long bookId;
                try (PreparedStatement ps = c.prepareStatement(
                        "SELECT user_id, book_id, status FROM loans WHERE id = ? FOR UPDATE")) {
                    ps.setLong(1, loanId);
                    try (ResultSet rs = ps.executeQuery()) {
                        if (!rs.next()) throw new LoanNotFoundException();
                        long ownerId = rs.getLong("user_id");
                        bookId = rs.getLong("book_id");
                        String status = rs.getString("status");
                        if (ownerId != userId) throw new NotYourLoanException();
                        if (!"active".equals(status)) throw new AlreadyReturnedException();
                    }
                }

                try (PreparedStatement ps = c.prepareStatement(
                        "UPDATE loans SET status = 'returned', returned_at = CURRENT_TIMESTAMP WHERE id = ?")) {
                    ps.setLong(1, loanId);
                    ps.executeUpdate();
                }

                try (PreparedStatement ps = c.prepareStatement(
                        "UPDATE books SET available_copies = available_copies + 1 WHERE id = ?")) {
                    ps.setLong(1, bookId);
                    ps.executeUpdate();
                }

                c.commit();
            } catch (RuntimeException | SQLException e) {
                c.rollback();
                throw e;
            } finally {
                c.setAutoCommit(true);
            }
        }
    }

    /** Find a user's active loan for the given book, or null. */
    public Loan findActiveLoan(long userId, long bookId) throws SQLException {
        String sql = "SELECT id, user_id, book_id, borrowed_at, due_at, returned_at, status " +
                     "FROM loans WHERE user_id = ? AND book_id = ? AND status = 'active'";
        try (Connection c = DB.getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setLong(1, userId);
            ps.setLong(2, bookId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() ? map(rs, false) : null;
            }
        }
    }

    private static Loan map(ResultSet rs, boolean withBookFields) throws SQLException {
        Loan l = new Loan();
        l.setId(rs.getLong("id"));
        l.setUserId(rs.getLong("user_id"));
        l.setBookId(rs.getLong("book_id"));
        l.setBorrowedAt(rs.getTimestamp("borrowed_at"));
        l.setDueAt(rs.getTimestamp("due_at"));
        l.setReturnedAt(rs.getTimestamp("returned_at"));
        l.setStatus(rs.getString("status"));
        if (withBookFields) {
            l.setTitle(rs.getString("title"));
            l.setAuthor(rs.getString("author"));
            l.setCoverUrl(rs.getString("cover_url"));
            l.setCategory(rs.getString("category"));
            int pg = rs.getInt("pages"); l.setPages(rs.wasNull() ? null : pg);
        }
        return l;
    }
}
