package com.leafshelf.dao;

import com.leafshelf.beans.Loan;
import com.leafshelf.util.BookCoverUrls;
import com.leafshelf.util.DB;

import java.sql.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class LoanDAO {
    private static final int LOAN_DAYS = 14;

    public List<Loan> findByUser(long userId) throws SQLException {
        String sql = """
                SELECT l.id, l.user_id, l.book_id, l.borrowed_at, l.due_at, l.returned_at, l.status,
                       b.title, b.author, b.isbn, b.cover_url
                FROM loans l
                JOIN books b ON b.id = l.book_id
                WHERE l.user_id = ?
                ORDER BY l.borrowed_at DESC
                """;
        List<Loan> loans = new ArrayList<>();
        try (Connection c = DB.get().getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setLong(1, userId);
            try (ResultSet rs = ps.executeQuery()) {
                while (rs.next()) loans.add(map(rs));
            }
        }
        return loans;
    }

    public boolean hasActiveLoan(long userId, long bookId) throws SQLException {
        String sql = "SELECT COUNT(*) FROM loans WHERE user_id=? AND book_id=? AND status='active'";
        try (Connection c = DB.get().getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setLong(1, userId);
            ps.setLong(2, bookId);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next() && rs.getLong(1) > 0;
            }
        }
    }

    /**
     * Atomically decrements available_copies and inserts a loan record.
     * Returns the new loan, or null if no copies are available.
     */
    public Loan borrow(long userId, long bookId) throws SQLException {
        Connection c = DB.get().getConnection();
        c.setAutoCommit(false);
        try {
            // Lock the book row
            PreparedStatement lock = c.prepareStatement(
                "SELECT available_copies FROM books WHERE id = ? FOR UPDATE");
            lock.setLong(1, bookId);
            ResultSet rs = lock.executeQuery();
            if (!rs.next() || rs.getInt(1) < 1) {
                c.rollback();
                return null;
            }
            rs.close(); lock.close();

            // Decrement
            PreparedStatement dec = c.prepareStatement(
                "UPDATE books SET available_copies = available_copies - 1 WHERE id = ?");
            dec.setLong(1, bookId);
            dec.executeUpdate();
            dec.close();

            // Insert loan
            Instant now = Instant.now();
            Instant due = now.plus(LOAN_DAYS, ChronoUnit.DAYS);
            PreparedStatement ins = c.prepareStatement(
                "INSERT INTO loans (user_id, book_id, borrowed_at, due_at) VALUES (?, ?, ?, ?)",
                Statement.RETURN_GENERATED_KEYS);
            ins.setLong(1, userId);
            ins.setLong(2, bookId);
            ins.setTimestamp(3, Timestamp.from(now));
            ins.setTimestamp(4, Timestamp.from(due));
            ins.executeUpdate();

            long loanId;
            try (ResultSet keys = ins.getGeneratedKeys()) {
                keys.next();
                loanId = keys.getLong(1);
            }
            ins.close();
            c.commit();

            return findById(loanId, c);
        } catch (SQLException e) {
            c.rollback();
            throw e;
        } finally {
            c.setAutoCommit(true);
            c.close();
        }
    }

    /**
     * Marks a loan as returned and increments available_copies atomically.
     * Returns true on success.
     */
    public boolean returnLoan(long loanId, long userId) throws SQLException {
        Connection c = DB.get().getConnection();
        c.setAutoCommit(false);
        try {
            // Verify ownership and status
            PreparedStatement check = c.prepareStatement(
                "SELECT book_id FROM loans WHERE id=? AND user_id=? AND status='active' FOR UPDATE");
            check.setLong(1, loanId);
            check.setLong(2, userId);
            ResultSet rs = check.executeQuery();
            if (!rs.next()) {
                c.rollback();
                return false;
            }
            long bookId = rs.getLong("book_id");
            rs.close(); check.close();

            // Mark returned
            PreparedStatement upd = c.prepareStatement(
                "UPDATE loans SET status='returned', returned_at=? WHERE id=?");
            upd.setTimestamp(1, Timestamp.from(Instant.now()));
            upd.setLong(2, loanId);
            upd.executeUpdate();
            upd.close();

            // Increment available_copies
            PreparedStatement inc = c.prepareStatement(
                "UPDATE books SET available_copies = available_copies + 1 WHERE id=?");
            inc.setLong(1, bookId);
            inc.executeUpdate();
            inc.close();

            c.commit();
            return true;
        } catch (SQLException e) {
            c.rollback();
            throw e;
        } finally {
            c.setAutoCommit(true);
            c.close();
        }
    }

    public List<Map<String, Object>> findAllAdmin() throws SQLException {
        String sql = """
                SELECT l.id, u.name AS userName, b.title AS bookTitle,
                       l.borrowed_at, l.due_at, l.returned_at, l.status
                FROM loans l
                JOIN users u ON u.id = l.user_id
                JOIN books b ON b.id = l.book_id
                ORDER BY l.borrowed_at DESC
                """;
        List<Map<String, Object>> loans = new ArrayList<>();
        try (Connection c = DB.get().getConnection();
             Statement s = c.createStatement();
             ResultSet rs = s.executeQuery(sql)) {
            while (rs.next()) {
                Map<String, Object> loan = new LinkedHashMap<>();
                loan.put("id", rs.getLong("id"));
                loan.put("userName", rs.getString("userName"));
                loan.put("bookTitle", rs.getString("bookTitle"));
                Timestamp ba = rs.getTimestamp("borrowed_at");
                loan.put("borrowedAt", ba != null ? ba.toInstant().toString() : null);
                Timestamp da = rs.getTimestamp("due_at");
                loan.put("dueAt", da != null ? da.toInstant().toString() : null);
                Timestamp ra = rs.getTimestamp("returned_at");
                loan.put("returnedAt", ra != null ? ra.toInstant().toString() : null);
                loan.put("status", rs.getString("status"));
                loans.add(loan);
            }
        }
        return loans;
    }

    public boolean adminReturnLoan(long loanId) throws SQLException {
        Connection c = DB.get().getConnection();
        c.setAutoCommit(false);
        try {
            PreparedStatement check = c.prepareStatement(
                "SELECT book_id FROM loans WHERE id=? AND status='active' FOR UPDATE");
            check.setLong(1, loanId);
            ResultSet rs = check.executeQuery();
            if (!rs.next()) { c.rollback(); return false; }
            long bookId = rs.getLong("book_id");
            rs.close(); check.close();

            PreparedStatement upd = c.prepareStatement(
                "UPDATE loans SET status='returned', returned_at=? WHERE id=?");
            upd.setTimestamp(1, Timestamp.from(Instant.now()));
            upd.setLong(2, loanId);
            upd.executeUpdate(); upd.close();

            PreparedStatement inc = c.prepareStatement(
                "UPDATE books SET available_copies = available_copies + 1 WHERE id=?");
            inc.setLong(1, bookId);
            inc.executeUpdate(); inc.close();

            c.commit();
            return true;
        } catch (SQLException e) {
            c.rollback(); throw e;
        } finally {
            c.setAutoCommit(true); c.close();
        }
    }

    public long countActive() throws SQLException {
        try (Connection c = DB.get().getConnection();
             Statement s = c.createStatement();
             ResultSet rs = s.executeQuery("SELECT COUNT(*) FROM loans WHERE status='active'")) {
            return rs.next() ? rs.getLong(1) : 0;
        }
    }

    private Loan findById(long id, Connection c) throws SQLException {
        String sql = """
                SELECT l.id, l.user_id, l.book_id, l.borrowed_at, l.due_at, l.returned_at, l.status,
                       b.title, b.author, b.isbn, b.cover_url
                FROM loans l JOIN books b ON b.id = l.book_id
                WHERE l.id = ?
                """;
        try (PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return map(rs);
            }
        }
        return null;
    }

    private Loan map(ResultSet rs) throws SQLException {
        Loan l = new Loan();
        l.setId(rs.getLong("id"));
        l.setUserId(rs.getLong("user_id"));
        l.setBookId(rs.getLong("book_id"));
        Timestamp ba = rs.getTimestamp("borrowed_at");
        if (ba != null) l.setBorrowedAt(ba.toInstant());
        Timestamp da = rs.getTimestamp("due_at");
        if (da != null) l.setDueAt(da.toInstant());
        Timestamp ra = rs.getTimestamp("returned_at");
        if (ra != null) l.setReturnedAt(ra.toInstant());
        l.setStatus(rs.getString("status"));
        l.setTitle(rs.getString("title"));
        l.setAuthor(rs.getString("author"));
        l.setCoverUrl(BookCoverUrls.resolve(rs.getString("cover_url"), rs.getString("isbn")));
        return l;
    }
}
