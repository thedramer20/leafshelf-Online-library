package com.leafshelf.util;

public final class BookCoverUrls {
    private static final String OPEN_LIBRARY_ISBN_URL = "https://covers.openlibrary.org/b/isbn/%s-L.jpg";

    private BookCoverUrls() {}

    public static String resolve(String existingCoverUrl, String isbn) {
        // Always prefer a proxy URL keyed by ISBN so images load through the backend
        String normalizedIsbn = normalizeIsbn(isbn);
        if (!normalizedIsbn.isEmpty()) {
            return "/api/covers/proxy?isbn=" + normalizedIsbn;
        }
        if (existingCoverUrl != null && !existingCoverUrl.isBlank()) {
            return existingCoverUrl;
        }
        return "";
    }

    private static String normalizeIsbn(String isbn) {
        if (isbn == null) return "";
        return isbn.replaceAll("[^0-9Xx]", "");
    }
}
