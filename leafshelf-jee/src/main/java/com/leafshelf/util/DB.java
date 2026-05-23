package com.leafshelf.util;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;
import java.io.IOException;
import java.io.InputStream;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Properties;

/**
 * Central JDBC connection helper. Reads {@code /db.properties} from the classpath
 * and exposes a singleton {@link DataSource}.
 */
public final class DB {

    private static volatile HikariDataSource dataSource;

    private DB() { }

    public static synchronized DataSource getDataSource() {
        if (dataSource == null) {
            init();
        }
        return dataSource;
    }

    public static Connection getConnection() throws SQLException {
        return getDataSource().getConnection();
    }

    public static synchronized void shutdown() {
        if (dataSource != null) {
            dataSource.close();
            dataSource = null;
        }
    }

    /**
     * @return true if the configured driver URL looks like H2, used to pick H2-flavoured DDL.
     */
    public static boolean isH2() {
        HikariDataSource ds = (HikariDataSource) getDataSource();
        String url = ds.getJdbcUrl();
        return url != null && url.toLowerCase().startsWith("jdbc:h2:");
    }

    private static void init() {
        Properties props = new Properties();
        try (InputStream in = DB.class.getResourceAsStream("/db.properties")) {
            if (in == null) {
                throw new IllegalStateException("db.properties not found on classpath");
            }
            props.load(in);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to load db.properties", e);
        }

        HikariConfig cfg = new HikariConfig();
        cfg.setDriverClassName(props.getProperty("db.driver", "com.mysql.cj.jdbc.Driver"));
        cfg.setJdbcUrl(props.getProperty("db.url"));
        cfg.setUsername(props.getProperty("db.username", ""));
        cfg.setPassword(props.getProperty("db.password", ""));
        cfg.setMaximumPoolSize(parseInt(props.getProperty("db.pool.maxSize"), 10));
        cfg.setMinimumIdle(parseInt(props.getProperty("db.pool.minIdle"), 2));
        cfg.setPoolName("LeafShelfPool");
        cfg.setConnectionTestQuery("SELECT 1");
        // Fail fast if DB is unreachable on startup; helpful error in dev.
        cfg.setInitializationFailTimeout(5_000);

        dataSource = new HikariDataSource(cfg);
    }

    private static int parseInt(String s, int defaultVal) {
        if (s == null || s.isBlank()) return defaultVal;
        try { return Integer.parseInt(s.trim()); } catch (NumberFormatException e) { return defaultVal; }
    }
}
