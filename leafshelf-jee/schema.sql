-- LeafShelf Online Library — MySQL schema
-- Run once before first launch:
--   mysql -u root -p < schema.sql
--
-- The application will auto-seed books on first start if the books table is empty.

CREATE DATABASE IF NOT EXISTS leafshelf
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE leafshelf;

CREATE TABLE IF NOT EXISTS users (
  id             BIGINT       NOT NULL AUTO_INCREMENT,
  name           VARCHAR(80)  NOT NULL,
  email          VARCHAR(160) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS books (
  id               BIGINT       NOT NULL AUTO_INCREMENT,
  title            VARCHAR(255) NOT NULL,
  author           VARCHAR(160) NOT NULL,
  isbn             VARCHAR(20),
  description      TEXT         NOT NULL,
  category         VARCHAR(60)  NOT NULL DEFAULT 'General',
  cover_url        VARCHAR(500) NOT NULL DEFAULT '',
  total_copies     INT          NOT NULL DEFAULT 1,
  available_copies INT          NOT NULL DEFAULT 1,
  published_year   INT,
  pages            INT,
  rating           DOUBLE       NOT NULL DEFAULT 0,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_books_category (category)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS loans (
  id           BIGINT      NOT NULL AUTO_INCREMENT,
  user_id      BIGINT      NOT NULL,
  book_id      BIGINT      NOT NULL,
  borrowed_at  TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  due_at       TIMESTAMP   NOT NULL,
  returned_at  TIMESTAMP   NULL DEFAULT NULL,
  status       VARCHAR(16) NOT NULL DEFAULT 'active',
  PRIMARY KEY (id),
  INDEX idx_loans_user (user_id),
  INDEX idx_loans_book (book_id),
  CONSTRAINT fk_loans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_loans_book FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  CONSTRAINT chk_loans_status CHECK (status IN ('active','returned'))
) ENGINE=InnoDB;
