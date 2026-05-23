package com.leafshelf.servlets.api;

import com.leafshelf.util.Json;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

@WebServlet(urlPatterns = "/api/health")
public class HealthServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        Json.write(resp, 200, Map.of(
                "ok", true,
                "service", "leafshelf-api",
                "time", Instant.now().toString()
        ));
    }
}
