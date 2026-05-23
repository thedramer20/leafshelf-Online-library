package com.leafshelf.servlets.web;

import com.leafshelf.beans.User;
import com.leafshelf.dao.UserDAO;
import com.leafshelf.util.Passwords;
import com.leafshelf.util.SessionHelper;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;

@WebServlet(urlPatterns = {"/classic/login", "/classic/register", "/classic/logout"})
public class AuthViewServlet extends HttpServlet {

    private final UserDAO userDAO = new UserDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String path = req.getServletPath();
        switch (path) {
            case "/classic/login"   -> req.getRequestDispatcher("/WEB-INF/jsp/login.jsp").forward(req, resp);
            case "/classic/register"-> req.getRequestDispatcher("/WEB-INF/jsp/register.jsp").forward(req, resp);
            case "/classic/logout"  -> {
                SessionHelper.clear(req);
                resp.sendRedirect(req.getContextPath() + "/classic");
            }
            default -> resp.sendError(HttpServletResponse.SC_NOT_FOUND);
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String path = req.getServletPath();
        try {
            if ("/classic/login".equals(path)) {
                handleLogin(req, resp);
            } else if ("/classic/register".equals(path)) {
                handleRegister(req, resp);
            } else {
                resp.sendError(HttpServletResponse.SC_METHOD_NOT_ALLOWED);
            }
        } catch (SQLException e) {
            throw new ServletException("Database error", e);
        }
    }

    private void handleLogin(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException, SQLException {
        String email = trim(req.getParameter("email"));
        String password = req.getParameter("password");

        if (email == null || email.isEmpty() || password == null || password.isEmpty()) {
            req.setAttribute("error", "Email and password are required");
            req.setAttribute("email", email);
            req.getRequestDispatcher("/WEB-INF/jsp/login.jsp").forward(req, resp);
            return;
        }

        User u = userDAO.findByEmail(email.toLowerCase());
        if (u == null || !Passwords.verify(password, u.getPasswordHash())) {
            req.setAttribute("error", "Invalid email or password");
            req.setAttribute("email", email);
            req.getRequestDispatcher("/WEB-INF/jsp/login.jsp").forward(req, resp);
            return;
        }

        SessionHelper.setUser(req, u);
        resp.sendRedirect(req.getContextPath() + "/classic/library");
    }

    private void handleRegister(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException, SQLException {
        String name = trim(req.getParameter("name"));
        String email = trim(req.getParameter("email"));
        String password = req.getParameter("password");

        String err = null;
        if (name == null || name.length() < 2) err = "Name must be at least 2 characters";
        else if (email == null || !email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) err = "Invalid email";
        else if (password == null || password.length() < 6) err = "Password must be at least 6 characters";
        else if (userDAO.findByEmail(email.toLowerCase()) != null) err = "An account with that email already exists";

        if (err != null) {
            req.setAttribute("error", err);
            req.setAttribute("name", name);
            req.setAttribute("email", email);
            req.getRequestDispatcher("/WEB-INF/jsp/register.jsp").forward(req, resp);
            return;
        }

        User u = userDAO.create(name, email.toLowerCase(), Passwords.hash(password));
        SessionHelper.setUser(req, u);
        resp.sendRedirect(req.getContextPath() + "/classic/library");
    }

    private static String trim(String s) { return s == null ? null : s.trim(); }
}
