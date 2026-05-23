package com.leafshelf.servlets.api;

import com.leafshelf.beans.Loan;
import com.leafshelf.beans.User;
import com.leafshelf.dao.LoanDAO;
import com.leafshelf.util.Json;
import com.leafshelf.util.SessionHelper;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

/**
 * /api/loans/my-loans       GET   (auth)
 * /api/loans/borrow/{id}    POST  (auth)
 * /api/loans/return/{id}    POST  (auth)
 */
@WebServlet(urlPatterns = "/api/loans/*")
public class LoanServlet extends HttpServlet {

    private final LoanDAO loanDAO = new LoanDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = nullToEmpty(req.getPathInfo());
        if (!"/my-loans".equals(pathInfo)) {
            Json.writeError(resp, 404, "Not found");
            return;
        }
        User user = SessionHelper.currentUser(req); // AuthFilter guarantees non-null
        try {
            List<Loan> loans = loanDAO.listByUser(user.getId());
            Json.write(resp, 200, Map.of("loans", loans));
        } catch (SQLException e) {
            getServletContext().log("DB error", e);
            Json.writeError(resp, 500, "Database error");
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String pathInfo = nullToEmpty(req.getPathInfo());
        User user = SessionHelper.currentUser(req);

        try {
            if (pathInfo.startsWith("/borrow/")) {
                long bookId = parseId(pathInfo.substring("/borrow/".length()));
                long loanId = loanDAO.borrow(user.getId(), bookId);
                Json.write(resp, 201, Map.of("loan", Map.of("id", loanId)));
                return;
            }
            if (pathInfo.startsWith("/return/")) {
                long loanId = parseId(pathInfo.substring("/return/".length()));
                loanDAO.returnLoan(user.getId(), loanId);
                Json.write(resp, 200, Map.of("ok", true));
                return;
            }
            Json.writeError(resp, 404, "Not found");
        } catch (LoanDAO.BookNotFoundException e) {
            Json.writeError(resp, 404, "Book not found");
        } catch (LoanDAO.NoCopiesException e) {
            Json.writeError(resp, 409, "No copies available right now");
        } catch (LoanDAO.AlreadyBorrowedException e) {
            Json.writeError(resp, 409, "You have already borrowed this book");
        } catch (LoanDAO.LoanNotFoundException e) {
            Json.writeError(resp, 404, "Loan not found");
        } catch (LoanDAO.NotYourLoanException e) {
            Json.writeError(resp, 403, "Not your loan");
        } catch (LoanDAO.AlreadyReturnedException e) {
            Json.writeError(resp, 409, "Already returned");
        } catch (NumberFormatException e) {
            Json.writeError(resp, 400, "Invalid id");
        } catch (SQLException e) {
            getServletContext().log("DB error", e);
            Json.writeError(resp, 500, "Database error");
        }
    }

    private static long parseId(String s) {
        return Long.parseLong(s);
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }
}
