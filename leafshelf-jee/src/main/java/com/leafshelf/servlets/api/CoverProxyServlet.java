package com.leafshelf.servlets.api;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;

@WebServlet("/api/covers/proxy")
public class CoverProxyServlet extends HttpServlet {

    private static final String OPEN_LIBRARY = "https://covers.openlibrary.org/b/isbn/%s-L.jpg";

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        String isbn = req.getParameter("isbn");
        if (isbn == null || isbn.isBlank()) {
            res.sendError(404, "ISBN required");
            return;
        }

        String imageUrl = OPEN_LIBRARY.formatted(isbn.trim());

        try {
            HttpURLConnection conn = (HttpURLConnection) new URL(imageUrl).openConnection();
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(10000);
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (compatible; LeafShelf/1.0)");
            conn.setInstanceFollowRedirects(true);

            int status = conn.getResponseCode();
            if (status == 200) {
                String ct = conn.getContentType();
                res.setContentType(ct != null ? ct : "image/jpeg");
                res.setHeader("Cache-Control", "public, max-age=86400");
                try (InputStream is = conn.getInputStream()) {
                    is.transferTo(res.getOutputStream());
                }
            } else {
                res.sendError(404, "Cover not found");
            }
        } catch (Exception e) {
            res.sendError(502, "Could not fetch cover");
        }
    }
}
