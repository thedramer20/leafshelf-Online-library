package com.leafshelf.filters;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.util.Set;

/**
 * Permits the Vite dev server (http://localhost:5173) to call the API with credentials.
 * In production both apps are same-origin (served from the WAR), so CORS is a no-op there.
 */
@WebFilter(urlPatterns = {"/api/*"})
public class CorsFilter implements Filter {

    private static final Set<String> ALLOWED_ORIGINS = Set.of(
            "http://localhost:5173",
            "http://127.0.0.1:5173"
    );

    @Override
    public void doFilter(ServletRequest req, ServletResponse resp, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest http = (HttpServletRequest) req;
        HttpServletResponse out = (HttpServletResponse) resp;

        String origin = http.getHeader("Origin");
        if (origin != null && ALLOWED_ORIGINS.contains(origin)) {
            out.setHeader("Access-Control-Allow-Origin", origin);
            out.setHeader("Vary", "Origin");
            out.setHeader("Access-Control-Allow-Credentials", "true");
            out.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            out.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, Accept");
            out.setHeader("Access-Control-Max-Age", "3600");
        }

        if ("OPTIONS".equalsIgnoreCase(http.getMethod())) {
            out.setStatus(HttpServletResponse.SC_NO_CONTENT);
            return;
        }
        chain.doFilter(req, resp);
    }
}
