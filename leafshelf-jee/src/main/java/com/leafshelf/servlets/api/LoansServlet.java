package com.leafshelf.servlets.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.leafshelf.beans.Loan;
import com.leafshelf.dao.LoanDAO;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@WebServlet("/api/loans/*")
public class LoansServlet extends HttpServlet {
    private static final ObjectMapper OM = new ObjectMapper()
            .registerModule(new JavaTimeModule())
            .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

    private static final String SESSION_KEY = "userId";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json;charset=UTF-8");
        String pathInfo = req.getPathInfo();

        if (!"/my-loans".equals(pathInfo)) {
            res.setStatus(404);
            return;
        }

        Long uid = userId(req);
        if (uid == null) {
            res.setStatus(401);
            OM.writeValue(res.getOutputStream(), Map.of("error", "Not authenticated"));
            return;
        }

        try {
            List<Loan> loans = new LoanDAO().findByUser(uid);
            OM.writeValue(res.getOutputStream(), Map.of("loans", loans));
        } catch (Exception e) {
            res.setStatus(500);
            OM.writeValue(res.getOutputStream(), Map.of("error", e.getMessage()));
        }
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json;charset=UTF-8");
        String pathInfo = req.getPathInfo(); // /borrow/{bookId}  or /return/{loanId}

        Long uid = userId(req);
        if (uid == null) {
            res.setStatus(401);
            OM.writeValue(res.getOutputStream(), Map.of("error", "Not authenticated"));
            return;
        }

        try {
            LoanDAO dao = new LoanDAO();
            if (pathInfo != null && pathInfo.startsWith("/borrow/")) {
                long bookId = Long.parseLong(pathInfo.substring("/borrow/".length()));

                if (dao.hasActiveLoan(uid, bookId)) {
                    res.setStatus(409);
                    OM.writeValue(res.getOutputStream(), Map.of("error", "You already have this book borrowed"));
                    return;
                }

                Loan loan = dao.borrow(uid, bookId);
                if (loan == null) {
                    res.setStatus(409);
                    OM.writeValue(res.getOutputStream(), Map.of("error", "No copies available"));
                    return;
                }
                res.setStatus(201);
                OM.writeValue(res.getOutputStream(), Map.of("loan", loan));

            } else if (pathInfo != null && pathInfo.startsWith("/return/")) {
                long loanId = Long.parseLong(pathInfo.substring("/return/".length()));
                boolean ok = dao.returnLoan(loanId, uid);
                if (!ok) {
                    res.setStatus(404);
                    OM.writeValue(res.getOutputStream(), Map.of("error", "Loan not found or already returned"));
                    return;
                }
                OM.writeValue(res.getOutputStream(), Map.of("ok", true));

            } else {
                res.setStatus(404);
            }
        } catch (NumberFormatException e) {
            res.setStatus(400);
            OM.writeValue(res.getOutputStream(), Map.of("error", "Invalid id"));
        } catch (Exception e) {
            res.setStatus(500);
            OM.writeValue(res.getOutputStream(), Map.of("error", e.getMessage()));
        }
    }

    private Long userId(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null) return null;
        Object uid = session.getAttribute(SESSION_KEY);
        return uid instanceof Long ? (Long) uid : null;
    }
}
