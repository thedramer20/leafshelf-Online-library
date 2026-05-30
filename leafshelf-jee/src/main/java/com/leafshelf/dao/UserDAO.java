package com.leafshelf.dao;

import com.leafshelf.beans.User;
import com.leafshelf.util.DB;
import org.mindrot.jbcrypt.BCrypt;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserDAO {

    public User findByEmail(String email) throws SQLException {
        String sql = "SELECT id, name, email, password_hash, created_at, is_admin FROM users WHERE email = ?";
        try (Connection c = DB.get().getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return map(rs);
            }
        }
        return null;
    }

    public User findById(long id) throws SQLException {
        String sql = "SELECT id, name, email, password_hash, created_at, is_admin FROM users WHERE id = ?";
        try (Connection c = DB.get().getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setLong(1, id);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) return map(rs);
            }
        }
        return null;
    }

    public User create(String name, String email, String plainPassword) throws SQLException {
        String hash = BCrypt.hashpw(plainPassword, BCrypt.gensalt());
        String sql = "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)";
        try (Connection c = DB.get().getConnection();
             PreparedStatement ps = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, hash);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return findById(keys.getLong(1));
            }
        }
        throw new SQLException("User creation failed");
    }

    public void setAdminById(long id, boolean isAdmin) throws SQLException {
        String sql = "UPDATE users SET is_admin = ? WHERE id = ?";
        try (Connection c = DB.get().getConnection();
             PreparedStatement ps = c.prepareStatement(sql)) {
            ps.setBoolean(1, isAdmin);
            ps.setLong(2, id);
            ps.executeUpdate();
        }
    }

    public long countUsers() throws SQLException {
        String sql = "SELECT COUNT(*) FROM users";
        try (Connection c = DB.get().getConnection();
             PreparedStatement ps = c.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            return rs.next() ? rs.getLong(1) : 0;
        }
    }

    public List<User> findAll() throws SQLException {
        String sql = "SELECT id, name, email, password_hash, created_at, is_admin FROM users ORDER BY id";
        List<User> users = new ArrayList<>();
        try (Connection c = DB.get().getConnection();
             PreparedStatement ps = c.prepareStatement(sql);
             ResultSet rs = ps.executeQuery()) {
            while (rs.next()) users.add(map(rs));
        }
        return users;
    }

    public User createUser(String name, String email, String plainPassword, boolean isAdmin) throws SQLException {
        String hash = BCrypt.hashpw(plainPassword, BCrypt.gensalt());
        String sql = "INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, ?)";
        try (Connection c = DB.get().getConnection();
             PreparedStatement ps = c.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, name);
            ps.setString(2, email);
            ps.setString(3, hash);
            ps.setBoolean(4, isAdmin);
            ps.executeUpdate();
            try (ResultSet keys = ps.getGeneratedKeys()) {
                if (keys.next()) return findById(keys.getLong(1));
            }
        }
        throw new SQLException("User creation failed");
    }

    public boolean checkPassword(User user, String plainPassword) {
        return BCrypt.checkpw(plainPassword, user.getPasswordHash());
    }

    private User map(ResultSet rs) throws SQLException {
        User u = new User();
        u.setId(rs.getLong("id"));
        u.setName(rs.getString("name"));
        u.setEmail(rs.getString("email"));
        u.setPasswordHash(rs.getString("password_hash"));
        Timestamp ts = rs.getTimestamp("created_at");
        if (ts != null) u.setCreatedAt(ts.toInstant());
        u.setAdmin(rs.getBoolean("is_admin"));
        return u;
    }
}
