package com.leafshelf.servlets.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.leafshelf.beans.User;
import com.leafshelf.dao.UserDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.util.Map;

@WebServlet("/api/auth/*")
public class AuthServlet extends HttpServlet {
    private static final ObjectMapper OM = new ObjectMapper();
    private static final String SESSION_KEY = "userId";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json;charset=UTF-8");
        String path = req.getPathInfo();

        if ("/me".equals(path)) {
            HttpSession session = req.getSession(false);
            if (session == null || session.getAttribute(SESSION_KEY) == null) {
                res.setStatus(401);
                OM.writeValue(res.getOutputStream(), Map.of("error", "Not authenticated"));
                return;
            }
            try {
                long uid = (long) session.getAttribute(SESSION_KEY);
                User user = new UserDAO().findById(uid);
                if (user == null) {
                    res.setStatus(401);
                    OM.writeValue(res.getOutputStream(), Map.of("error", "User not found"));
                    return;
                }
                OM.writeValue(res.getOutputStream(), Map.of("user", user));
            } catch (Exception e) {
                res.setStatus(500);
                OM.writeValue(res.getOutputStream(), Map.of("error", e.getMessage()));
            }
            return;
        }

        res.setStatus(404);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json;charset=UTF-8");
        String path = req.getPathInfo();

        if ("/register".equals(path)) {
            handleRegister(req, res);
        } else if ("/login".equals(path)) {
            handleLogin(req, res);
        } else if ("/logout".equals(path)) {
            handleLogout(req, res);
        } else {
            res.setStatus(404);
        }
    }

    private void handleRegister(HttpServletRequest req, HttpServletResponse res) throws IOException {
        try {
            @SuppressWarnings("unchecked")
            Map<String, String> body = OM.readValue(req.getInputStream(), Map.class);
            String name     = trim(body.get("name"));
            String email    = trim(body.get("email"));
            String password = body.get("password");

            if (name.isEmpty() || email.isEmpty() || password == null || password.isBlank()) {
                res.setStatus(400);
                OM.writeValue(res.getOutputStream(), Map.of("error", "Name, email and password are required"));
                return;
            }

            UserDAO dao = new UserDAO();
            if (dao.findByEmail(email) != null) {
                res.setStatus(409);
                OM.writeValue(res.getOutputStream(), Map.of("error", "Email already registered"));
                return;
            }

            User user = dao.create(name, email, password);
            HttpSession session = req.getSession(true);
            session.setAttribute(SESSION_KEY, user.getId());

            res.setStatus(201);
            OM.writeValue(res.getOutputStream(), Map.of("user", user));
        } catch (Exception e) {
            res.setStatus(500);
            OM.writeValue(res.getOutputStream(), Map.of("error", e.getMessage()));
        }
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse res) throws IOException {
        try {
            @SuppressWarnings("unchecked")
            Map<String, String> body = OM.readValue(req.getInputStream(), Map.class);
            String email    = trim(body.get("email"));
            String password = body.get("password");

            if (email.isEmpty() || password == null || password.isBlank()) {
                res.setStatus(400);
                OM.writeValue(res.getOutputStream(), Map.of("error", "Email and password are required"));
                return;
            }

            UserDAO dao  = new UserDAO();
            User   user  = dao.findByEmail(email);
            if (user == null || !dao.checkPassword(user, password)) {
                res.setStatus(401);
                OM.writeValue(res.getOutputStream(), Map.of("error", "Invalid email or password"));
                return;
            }

            HttpSession session = req.getSession(true);
            session.setAttribute(SESSION_KEY, user.getId());
            OM.writeValue(res.getOutputStream(), Map.of("user", user));
        } catch (Exception e) {
            res.setStatus(500);
            OM.writeValue(res.getOutputStream(), Map.of("error", e.getMessage()));
        }
    }

    private void handleLogout(HttpServletRequest req, HttpServletResponse res) throws IOException {
        HttpSession session = req.getSession(false);
        if (session != null) session.invalidate();
        OM.writeValue(res.getOutputStream(), Map.of("ok", true));
    }

    private String trim(String s) { return s == null ? "" : s.trim(); }
}
