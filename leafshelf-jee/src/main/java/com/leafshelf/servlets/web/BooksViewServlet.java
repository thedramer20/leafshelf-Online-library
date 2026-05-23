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
 * Serves the classic JSP-rendered catalog at /classic/books.
 * Uses the same JavaBeans and JDBC DAOs that the React/REST API uses.
 */
@WebServlet(urlPatterns = "/classic/books")
public class BooksViewServlet extends HttpServlet {

    private final BookDAO bookDAO = new BookDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try {
            String search = req.getParameter("search");
            String category = req.getParameter("category");
            List<Book> books = bookDAO.list(search, category);
            List<String> categories = bookDAO.listCategories();

            // Make beans available to the JSP via request attributes.
            req.setAttribute("books", books);
            req.setAttribute("categories", categories);
            req.setAttribute("search", search == null ? "" : search);
            req.setAttribute("activeCategory", category == null ? "" : category);

            User user = SessionHelper.currentUser(req);
            req.setAttribute("currentUser", user);

            RequestDispatcher rd = req.getRequestDispatcher("/WEB-INF/jsp/books.jsp");
            rd.forward(req, resp);
        } catch (SQLException e) {
            throw new ServletException("Database error", e);
        }
    }
}
