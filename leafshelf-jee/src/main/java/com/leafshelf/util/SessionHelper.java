package com.leafshelf.util;

import com.leafshelf.beans.User;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;

public final class SessionHelper {

    public static final String USER_ATTR = "currentUser";

    private SessionHelper() { }

    /** Returns the currently-authenticated user, or {@code null}. Does not create a new session. */
    public static User currentUser(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session == null) return null;
        Object u = session.getAttribute(USER_ATTR);
        return (u instanceof User) ? (User) u : null;
    }

    public static void setUser(HttpServletRequest req, User user) {
        HttpSession session = req.getSession(true);
        session.setAttribute(USER_ATTR, user);
    }

    public static void clear(HttpServletRequest req) {
        HttpSession session = req.getSession(false);
        if (session != null) session.invalidate();
    }
}
