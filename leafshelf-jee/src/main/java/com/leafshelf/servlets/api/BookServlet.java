package com.leafshelf.servlets.api;

import com.leafshelf.beans.Book;
import com.leafshelf.dao.BookDAO;
import com.leafshelf.util.Json;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

/**
 * /api/books              GET ?search=&category=
 * /api/books/categories   GET
 * /api/books/{id}         GET
 *
 * Routed via servlet path (/api/books) and pathInfo (/{id} or /categories).
 */
@WebServlet(urlPatterns = {"/api/books", "/api/books/*"})
public class BookServlet extends HttpServlet {

    private final BookDAO bookDAO = new BookDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = req.getPathInfo();  // null, "/", "/123", "/categories"
        try {
            if (pathInfo == null || pathInfo.equals("/") || pathInfo.isEmpty()) {
                String search = req.getParameter("search");
                String category = req.getParameter("category");
                List<Book> books = bookDAO.list(search, category);
                Json.write(resp, 200, Map.of("books", books));
                return;
            }

            String segment = pathInfo.substring(1); // strip leading slash
            if ("categories".equals(segment)) {
                Json.write(resp, 200, Map.of("categories", bookDAO.listCategories()));
                return;
            }

            long id;
            try {
                id = Long.parseLong(segment);
            } catch (NumberFormatException e) {
                Json.writeError(resp, 400, "Invalid book id");
                return;
            }
            Book b = bookDAO.findById(id);
            if (b == null) {
                Json.writeError(resp, 404, "Book not found");
                return;
            }
            Json.write(resp, 200, Map.of("book", b));
        } catch (SQLException e) {
            getServletContext().log("DB error", e);
            Json.writeError(resp, 500, "Database error");
        }
    }
}
