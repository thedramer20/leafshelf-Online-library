package com.leafshelf.filters;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;

import java.io.IOException;
import java.util.Set;

@WebFilter("/*")
public class SpaFilter implements Filter {

    private static final Set<String> ASSET_EXTENSIONS = Set.of(
        "js", "css", "html", "htm", "svg", "ico", "png", "jpg", "jpeg",
        "gif", "webp", "woff", "woff2", "ttf", "eot", "otf", "map", "json"
    );

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        String path = req.getServletPath();

        // API requests and Classic JSP pass through untouched
        if (path.startsWith("/api/") || path.startsWith("/classic")) {
            chain.doFilter(request, response);
            return;
        }

        // Static assets (have a file extension) pass through
        int dot = path.lastIndexOf('.');
        if (dot > 0 && ASSET_EXTENSIONS.contains(path.substring(dot + 1).toLowerCase())) {
            chain.doFilter(request, response);
            return;
        }

        // Everything else is an SPA route → serve index.html
        req.getRequestDispatcher("/index.html").forward(request, response);
    }
}
