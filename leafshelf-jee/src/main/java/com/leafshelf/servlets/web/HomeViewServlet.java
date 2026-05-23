package com.leafshelf.servlets.web;

import com.leafshelf.beans.Book;
import com.leafshelf.beans.User;
import com.leafshelf.dao.BookDAO;
import com.leafshelf.util.SessionHelper;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

/**
 * Serves the classic JSP-rendered home page at /classic.
 */
@WebServlet(urlPatterns = "/classic")
public class HomeViewServlet extends HttpServlet {

    private final BookDAO bookDAO = new BookDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            List<Book> all = bookDAO.list(null, null);
            List<Book> featured = all.subList(0, Math.min(8, all.size()));
            req.setAttribute("featured", featured);

            User user = SessionHelper.currentUser(req);
            req.setAttribute("currentUser", user);

            RequestDispatcher rd = req.getRequestDispatcher("/WEB-INF/jsp/home.jsp");
            rd.forward(req, resp);
        } catch (SQLException e) {
            throw new ServletException("Database error", e);
        }
    }
}
