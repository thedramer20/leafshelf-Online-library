package com.leafshelf.filters;

import com.leafshelf.beans.User;
import com.leafshelf.util.Json;
import com.leafshelf.util.SessionHelper;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;

/**
 * Requires an authenticated session on protected API endpoints.
 * Maps to /api/loans/* and /api/auth/me.
 */
@WebFilter(urlPatterns = {"/api/loans/*", "/api/auth/me"})
public class AuthFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest http = (HttpServletRequest) req;
        HttpServletResponse out = (HttpServletResponse) resp;

        if ("OPTIONS".equalsIgnoreCase(http.getMethod())) {
            chain.doFilter(req, resp);
            return;
        }

        User user = SessionHelper.currentUser(http);
        if (user == null) {
            Json.writeError(out, HttpServletResponse.SC_UNAUTHORIZED, "Authentication required");
            return;
        }
        chain.doFilter(req, resp);
    }
}
