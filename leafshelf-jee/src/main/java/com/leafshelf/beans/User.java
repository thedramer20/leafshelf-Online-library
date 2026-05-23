package com.leafshelf.beans;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.io.Serializable;
import java.sql.Timestamp;

/**
 * User JavaBean. Plain POJO with no-arg constructor and getters/setters.
 * Used by JSP via &lt;jsp:useBean&gt; and by servlets as a JSON DTO.
 */
public class User implements Serializable {

    private long id;
    private String name;
    private String email;
    private String passwordHash;     // never serialized to JSON
    private boolean isAdmin;
    private Timestamp createdAt;

    public User() { }

    public User(long id, String name, String email, String passwordHash, Timestamp createdAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.createdAt = createdAt;
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    @JsonIgnore
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public boolean getIsAdmin() { return isAdmin; }
    public void setIsAdmin(boolean isAdmin) { this.isAdmin = isAdmin; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }
}
