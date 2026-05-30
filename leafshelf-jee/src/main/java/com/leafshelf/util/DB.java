package com.leafshelf.util;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;
import java.io.InputStream;
import java.util.Properties;

public class DB {
    private static HikariDataSource ds;

    public static void init() throws Exception {
        close();

        Properties p = new Properties();
        try (InputStream in = DB.class.getClassLoader().getResourceAsStream("db.properties")) {
            if (in == null) throw new RuntimeException("db.properties not found on classpath");
            p.load(in);
        }
        HikariConfig cfg = new HikariConfig();
        cfg.setDriverClassName(p.getProperty("db.driver"));
        cfg.setJdbcUrl(p.getProperty("db.url"));
        cfg.setUsername(p.getProperty("db.username", "sa"));
        cfg.setPassword(p.getProperty("db.password", ""));
        cfg.setMaximumPoolSize(Integer.parseInt(p.getProperty("db.pool.max", "10")));
        cfg.setMinimumIdle(Integer.parseInt(p.getProperty("db.pool.min", "2")));
        cfg.setConnectionTestQuery("SELECT 1");
        ds = new HikariDataSource(cfg);
    }

    public static DataSource get() { return ds; }

    public static void close() {
        if (ds != null && !ds.isClosed()) ds.close();
    }
}
