package com.leafshelf.beans;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.io.Serializable;
import java.time.Instant;

public class Loan implements Serializable {
    private long id;

    @JsonProperty("user_id")
    private long userId;

    @JsonProperty("book_id")
    private long bookId;

    @JsonProperty("borrowed_at")
    private Instant borrowedAt;

    @JsonProperty("due_at")
    private Instant dueAt;

    @JsonProperty("returned_at")
    private Instant returnedAt;

    private String status;

    // Book info joined for display
    private String title;
    private String author;

    @JsonProperty("cover_url")
    private String coverUrl;

    public Loan() {}

    public boolean isActive() { return "active".equals(status); }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public long getUserId() { return userId; }
    public void setUserId(long userId) { this.userId = userId; }

    public long getBookId() { return bookId; }
    public void setBookId(long bookId) { this.bookId = bookId; }

    public Instant getBorrowedAt() { return borrowedAt; }
    public void setBorrowedAt(Instant borrowedAt) { this.borrowedAt = borrowedAt; }

    public Instant getDueAt() { return dueAt; }
    public void setDueAt(Instant dueAt) { this.dueAt = dueAt; }

    public Instant getReturnedAt() { return returnedAt; }
    public void setReturnedAt(Instant returnedAt) { this.returnedAt = returnedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getCoverUrl() { return coverUrl; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }
}
