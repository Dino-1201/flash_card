-- ============================================================
-- SCRIPT TẠO DATABASE CHO ỨNG DỤNG FLASHCARD
-- Chạy script này trong MySQL Workbench hoặc phpMyAdmin
-- ============================================================

-- Tạo database
CREATE DATABASE IF NOT EXISTS flashcard_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE flashcard_db;

-- ============================================================
-- BẢNG USERS: Lưu thông tin tài khoản đăng ký
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100)        NOT NULL COMMENT 'Tên hiển thị',
    username    VARCHAR(50)         NOT NULL UNIQUE COMMENT 'Tên đăng nhập (duy nhất)',
    email       VARCHAR(150)        DEFAULT NULL UNIQUE COMMENT 'Email (tuỳ chọn)',
    password    VARCHAR(255)        NOT NULL COMMENT 'Mật khẩu đã hash (bcrypt)',
    avatar_url  TEXT                DEFAULT NULL COMMENT 'Ảnh đại diện',
    auth_type   ENUM('local','google','facebook') DEFAULT 'local' COMMENT 'Kiểu đăng nhập',
    firebase_uid VARCHAR(128)       DEFAULT NULL UNIQUE COMMENT 'UID từ Firebase (nếu dùng social login)',
    is_active   TINYINT(1)          DEFAULT 1 COMMENT '1=Hoạt động, 0=Bị khoá',
    created_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP           DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login  TIMESTAMP           DEFAULT NULL COMMENT 'Lần đăng nhập cuối'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- BẢNG DECKS: Lưu bộ thẻ học của từng user
-- ============================================================
CREATE TABLE IF NOT EXISTS decks (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT             NOT NULL,
    title       VARCHAR(200)    NOT NULL COMMENT 'Tên bộ thẻ',
    description TEXT            DEFAULT NULL,
    is_public   TINYINT(1)      DEFAULT 0 COMMENT '1=Công khai, 0=Riêng tư',
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- BẢNG CARDS: Lưu từng thẻ học trong bộ thẻ
-- ============================================================
CREATE TABLE IF NOT EXISTS cards (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    deck_id     INT             NOT NULL,
    front       TEXT            NOT NULL COMMENT 'Mặt trước thẻ (term)',
    back        TEXT            NOT NULL COMMENT 'Mặt sau thẻ (def)',
    note        TEXT            DEFAULT NULL COMMENT 'Ghi chú thêm',
    img         MEDIUMTEXT      DEFAULT NULL COMMENT 'Ảnh base64 (tuỳ chọn)',
    known       TINYINT(1)      DEFAULT 0 COMMENT '1=Đã biết, 0=Chưa biết',
    position    INT             DEFAULT 0 COMMENT 'Thứ tự trong bộ thẻ',
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- MIGRATION: Thêm cột mới nếu database đã tồn tại từ trước
-- (Bỏ qua nếu cột đã có)
-- ============================================================
ALTER TABLE cards ADD COLUMN IF NOT EXISTS note  TEXT         DEFAULT NULL;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS img   MEDIUMTEXT   DEFAULT NULL;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS known TINYINT(1)   DEFAULT 0;

-- ============================================================
-- BẢNG USER_SESSIONS: Lưu phiên đăng nhập (tuỳ chọn)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_sessions (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    user_id     INT             NOT NULL,
    token       VARCHAR(500)    NOT NULL,
    ip_address  VARCHAR(45)     DEFAULT NULL,
    user_agent  TEXT            DEFAULT NULL,
    created_at  TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    expires_at  TIMESTAMP       NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- INDEX để tăng tốc tìm kiếm
-- ============================================================
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_cards_deck_id ON cards(deck_id);

-- Xem kết quả
SELECT 'Database flashcard_db đã được tạo thành công!' AS message;
SHOW TABLES;
