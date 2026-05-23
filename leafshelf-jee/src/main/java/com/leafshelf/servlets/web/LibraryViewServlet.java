package com.leafshelf.servlets.web;

import com.leafshelf.beans.Loan;
import com.leafshelf.beans.User;
import com.leafshelf.dao.LoanDAO;
import com.leafshelf.util.SessionHelper;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.sql.SQLException;
import java.util.List;

@WebServlet(urlPatterns = "/classic/library")
public class LibraryViewServlet extends HttpServlet {

    private final LoanDAO loanDAO = new LoanDAO();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        User user = requireUser(req, resp);
        if (user == null) return;
        showPage(req, resp, user, null, null);
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        User user = requireUser(req, resp);
        if (user == null) return;

        String action = req.getParameter("action");
        String notice = null;
        String error = null;

        if ("return".equals(action)) {
            try {
                long loanId = Long.parseLong(req.getParameter("loanId"));
                loanDAO.returnLoan(user.getId(), loanId);
                notice = "Returned. Thanks!";
            } catch (LoanDAO.LoanNotFoundException e) {
                error = "Loan not found.";
            } catch (LoanDAO.NotYourLoanException e) {
                error = "That's not your loan.";
            } catch (LoanDAO.AlreadyReturnedException e) {
                error = "Already returned.";
            } catch (NumberFormatException | NullPointerException e) {
                error = "Invalid loan id.";
            } catch (SQLException e) {
                throw new ServletException("Database error", e);
            }
        }
        showPage(req, resp, user, notice, error);
    }

    private void showPage(HttpServletRequest req, HttpServletResponse resp,
                          User user, String notice, String error)
            throws ServletException, IOException {
        try {
            List<Loan> loans = loanDAO.listByUser(user.getId());
            req.setAttribute("loans", loans);
            req.setAttribute("currentUser", user);
            req.setAttribute("notice", notice);
            req.setAttribute("error", error);
            req.getRequestDispatcher("/WEB-INF/jsp/library.jsp").forward(req, resp);
        } catch (SQLException e) {
            throw new ServletException("Database error", e);
        }
    }

    private User requireUser(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        User user = SessionHelper.currentUser(req);
        if (user == null) {
            resp.sendRedirect(req.getContextPath() + "/classic/login");
            return null;
        }
        return user;
    }
}
