package com.leafshelf.servlets.web;

import com.leafshelf.beans.Book;
import com.leafshelf.beans.Loan;
import com.leafshelf.beans.User;
import com.leafshelf.dao.BookDAO;
import com.leafshelf.dao.LoanDAO;
import com.leafshelf.util.SessionHelper;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;

/**
 * Classic JSP book detail page at /classic/book?id={id}.
 * GET shows the page, POST handles the "Borrow" form submission.
 */
@WebServlet(urlPatterns = "/classic/book")
public class BookDetailViewServlet extends HttpServlet {

    private final BookDAO bookDAO = new BookDAO();
    private final LoanDAO loanDAO = new LoanDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        showPage(req, resp, null, null);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        User user = SessionHelper.currentUser(req);
        if (user == null) {
            resp.sendRedirect(req.getContextPath() + "/?msg=login_required");
            return;
        }

        String error = null;
        String success = null;
        long bookId;
        try {
            bookId = Long.parseLong(req.getParameter("bookId"));
        } catch (NumberFormatException | NullPointerException e) {
            resp.sendRedirect(req.getContextPath() + "/classic/books");
            return;
        }

        try {
            loanDAO.borrow(user.getId(), bookId);
            success = "Added to your shelf. You have 14 days.";
        } catch (LoanDAO.BookNotFoundException e) {
            error = "Book not found.";
        } catch (LoanDAO.NoCopiesException e) {
            error = "No copies available right now.";
        } catch (LoanDAO.AlreadyBorrowedException e) {
            error = "You already have this book on your shelf.";
        } catch (SQLException e) {
            error = "Database error.";
        }

        // Reload the book and re-render the same JSP with a notice.
        req.setAttribute("bookIdOverride", String.valueOf(bookId));
        showPage(req, resp, error, success);
    }

    private void showPage(HttpServletRequest req, HttpServletResponse resp,
                          String error, String success) throws ServletException, IOException {
        String idStr = (String) req.getAttribute("bookIdOverride");
        if (idStr == null) idStr = req.getParameter("id");
        long id;
        try {
            id = Long.parseLong(idStr);
        } catch (NumberFormatException | NullPointerException e) {
            resp.sendRedirect(req.getContextPath() + "/classic/books");
            return;
        }
        try {
            Book book = bookDAO.findById(id);
            if (book == null) {
                resp.sendError(HttpServletResponse.SC_NOT_FOUND, "Book not found");
                return;
            }
            User user = SessionHelper.currentUser(req);
            Loan activeLoan = null;
            if (user != null) {
                activeLoan = loanDAO.findActiveLoan(user.getId(), id);
            }

            req.setAttribute("book", book);
            req.setAttribute("currentUser", user);
            req.setAttribute("activeLoan", activeLoan);
            req.setAttribute("error", error);
            req.setAttribute("success", success);

            RequestDispatcher rd = req.getRequestDispatcher("/WEB-INF/jsp/book-detail.jsp");
            rd.forward(req, resp);
        } catch (SQLException e) {
            throw new ServletException("Database error", e);
        }
    }
}
