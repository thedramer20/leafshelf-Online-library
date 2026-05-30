package com.leafshelf.servlets.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.leafshelf.beans.Book;
import com.leafshelf.dao.BookDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet("/api/books/*")
public class BooksServlet extends HttpServlet {
    private static final ObjectMapper OM = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json;charset=UTF-8");
        String pathInfo = req.getPathInfo(); // null, "", "/categories", "/{id}"

        try {
            BookDAO dao = new BookDAO();

            if (pathInfo == null || pathInfo.equals("/") || pathInfo.isEmpty()) {
                // GET /api/books?search=&category=
                String search   = req.getParameter("search");
                String category = req.getParameter("category");
                List<Book> books = dao.findAll(search, category);
                OM.writeValue(res.getOutputStream(), Map.of("books", books));

            } else if ("/categories".equals(pathInfo)) {
                // GET /api/books/categories
                List<String> cats = dao.findCategories();
                OM.writeValue(res.getOutputStream(), Map.of("categories", cats));

            } else {
                // GET /api/books/{id}
                String idStr = pathInfo.substring(1);
                try {
                    long id   = Long.parseLong(idStr);
                    Book book = dao.findById(id);
                    if (book == null) {
                        res.setStatus(404);
                        OM.writeValue(res.getOutputStream(), Map.of("error", "Book not found"));
                    } else {
                        OM.writeValue(res.getOutputStream(), Map.of("book", book));
                    }
                } catch (NumberFormatException e) {
                    res.setStatus(400);
                    OM.writeValue(res.getOutputStream(), Map.of("error", "Invalid book id"));
                }
            }
        } catch (Exception e) {
            res.setStatus(500);
            OM.writeValue(res.getOutputStream(), Map.of("error", e.getMessage()));
        }
    }
}
