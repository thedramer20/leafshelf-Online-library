package com.leafshelf.beans;

import java.io.Serializable;
import java.sql.Timestamp;

/**
 * Loan JavaBean — includes joined book fields when read by LoanDAO.listByUser().
 */
public class Loan implements Serializable {

    private long id;
    private long userId;
    private long bookId;
    private Timestamp borrowedAt;
    private Timestamp dueAt;
    private Timestamp returnedAt;
    private String status;            // 'active' or 'returned'

    // joined book fields (only populated by LoanDAO.listByUser)
    private String title;
    private String author;
    private String coverUrl;
    private String category;
    private Integer pages;

    public Loan() { }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public long getUserId() { return userId; }
    public void setUserId(long userId) { this.userId = userId; }

    public long getBookId() { return bookId; }
    public void setBookId(long bookId) { this.bookId = bookId; }

    public Timestamp getBorrowedAt() { return borrowedAt; }
    public void setBorrowedAt(Timestamp borrowedAt) { this.borrowedAt = borrowedAt; }

    public Timestamp getDueAt() { return dueAt; }
    public void setDueAt(Timestamp dueAt) { this.dueAt = dueAt; }

    public Timestamp getReturnedAt() { return returnedAt; }
    public void setReturnedAt(Timestamp returnedAt) { this.returnedAt = returnedAt; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getAuthor() { return author; }
    public void setAuthor(String author) { this.author = author; }

    public String getCoverUrl() { return coverUrl; }
    public void setCoverUrl(String coverUrl) { this.coverUrl = coverUrl; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Integer getPages() { return pages; }
    public void setPages(Integer pages) { this.pages = pages; }

    public boolean isActive() { return "active".equals(status); }
}
