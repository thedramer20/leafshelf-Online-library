package com.leafshelf.servlets.api;

import com.leafshelf.beans.User;
import com.leafshelf.dao.UserDAO;
import com.leafshelf.util.Json;
import com.leafshelf.util.Passwords;
import com.leafshelf.util.SessionHelper;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.Map;

/**
 * /api/auth/register   POST  { name, email, password }
 * /api/auth/login      POST  { email, password }
 * /api/auth/logout     POST
 * /api/auth/me         GET                                  (protected by AuthFilter)
 */
@WebServlet(urlPatterns = {"/api/auth/register", "/api/auth/login", "/api/auth/logout", "/api/auth/me"})
public class AuthServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        if (req.getServletPath().equals("/api/auth/me")) {
            User u = SessionHelper.currentUser(req);
            if (u == null) {
                Json.writeError(resp, HttpServletResponse.SC_UNAUTHORIZED, "Not signed in");
                return;
            }
            Json.write(resp, 200, Map.of("user", u));
            return;
        }
        Json.writeError(resp, HttpServletResponse.SC_METHOD_NOT_ALLOWED, "GET not allowed");
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String path = req.getServletPath();
        try {
            switch (path) {
                case "/api/auth/register" -> handleRegister(req, resp);
                case "/api/auth/login"    -> handleLogin(req, resp);
                case "/api/auth/logout"   -> handleLogout(req, resp);
                default -> Json.writeError(resp, HttpServletResponse.SC_NOT_FOUND, "Unknown route");
            }
        } catch (SQLException e) {
            getServletContext().log("DB error", e);
            Json.writeError(resp, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Database error");
        }
    }

    private void handleRegister(HttpServletRequest req, HttpServletResponse resp)
            throws IOException, SQLException {
        Map<String, Object> body = Json.readBodyMap(req);
        String name = str(body.get("name"));
        String email = lower(str(body.get("email")));
        String password = str(body.get("password"));

        if (name == null || name.length() < 2 || name.length() > 60) {
            Json.writeError(resp, 400, "Name must be between 2 and 60 characters");
            return;
        }
        if (email == null || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            Json.writeError(resp, 400, "Invalid email address");
            return;
        }
        if (password == null || password.length() < 6 || password.length() > 120) {
            Json.writeError(resp, 400, "Password must be at least 6 characters");
            return;
        }

        if (userDAO.findByEmail(email) != null) {
            Json.writeError(resp, 409, "An account with that email already exists");
            return;
        }

        boolean firstUser = userDAO.countUsers() == 0;
        User u = userDAO.create(name, email, Passwords.hash(password));
        if (firstUser) {
            userDAO.makeAdmin(u.getId());
            u.setIsAdmin(true);
        }
        SessionHelper.setUser(req, u);
        Json.write(resp, 201, Map.of("user", u));
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse resp)
            throws IOException, SQLException {
        Map<String, Object> body = Json.readBodyMap(req);
        String email = lower(str(body.get("email")));
        String password = str(body.get("password"));
        if (email == null || password == null) {
            Json.writeError(resp, 400, "Email and password are required");
            return;
        }

        User u = userDAO.findByEmail(email);
        if (u == null || !Passwords.verify(password, u.getPasswordHash())) {
            Json.writeError(resp, 401, "Invalid email or password");
            return;
        }

        SessionHelper.setUser(req, u);
        Json.write(resp, 200, Map.of("user", u));
    }

    private void handleLogout(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        SessionHelper.clear(req);
        Json.write(resp, 200, Map.of("ok", true));
    }

    private static String str(Object o) { return o == null ? null : o.toString().trim(); }
    private static String lower(String s) { return s == null ? null : s.toLowerCase(); }
}
