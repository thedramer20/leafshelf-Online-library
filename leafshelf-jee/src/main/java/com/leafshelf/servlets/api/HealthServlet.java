package com.leafshelf.servlets.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

@WebServlet("/api/health")
public class HealthServlet extends HttpServlet {
    private static final ObjectMapper OM = new ObjectMapper();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse res) throws IOException {
        res.setContentType("application/json;charset=UTF-8");
        OM.writeValue(res.getOutputStream(), Map.of(
            "ok", true,
            "service", "leafshelf-api",
            "time", Instant.now().toString()
        ));
    }
}
