# 📚 Hướng dẫn cài đặt MySQL Database cho FlashCard App

## Bước 1 — Cài MySQL (nếu chưa có)

Tải MySQL Community Server tại:  
👉 https://dev.mysql.com/downloads/mysql/

Hoặc dùng **XAMPP** (dễ hơn, tích hợp phpMyAdmin):  
👉 https://www.apachefriends.org/

---

## Bước 2 — Tạo Database

### Cách A: Dùng phpMyAdmin (XAMPP)
1. Mở XAMPP → Start **MySQL**
2. Mở trình duyệt vào `http://localhost/phpmyadmin`
3. Click **SQL** → Copy & Paste nội dung file `backend/database.sql` → **Go**

### Cách B: Dùng MySQL Command Line
```bash
mysql -u root -p < backend/database.sql
```

---

## Bước 3 — Cấu hình file `.env`

Mở file `backend/.env` và điền thông tin MySQL của bạn:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password_here   ← đổi thành mật khẩu MySQL của bạn
DB_NAME=flashcard_db
PORT=3001
JWT_SECRET=flashcard_super_secret_key_2024
```

> Nếu dùng XAMPP, mặc định: `DB_USER=root`, `DB_PASSWORD=` (để trống)

---

## Bước 4 — Chạy Backend Server

```bash
cd backend
npm start
```

Thấy thông báo này là thành công:
```
╔════════════════════════════════════════╗
║     🚀 FlashCard API Server Started     ║
╠════════════════════════════════════════╣
║  URL:  http://localhost:3001           ║
╚════════════════════════════════════════╝
✅ Kết nối MySQL thành công!
```

---

## Bước 5 — Mở Web App

Mở file `index.html` trên trình duyệt (dùng Live Server của VSCode hoặc XAMPP).

---

## Kiểm tra Database

Xem danh sách users đã đăng ký:
```
http://localhost:3001/api/admin/users
```

---

## Cấu trúc Database

| Bảng | Mô tả |
|------|-------|
| `users` | Thông tin tài khoản (name, username, email, password hash) |
| `decks` | Bộ thẻ học của từng user |
| `cards` | Từng thẻ học trong bộ thẻ |
| `user_sessions` | Phiên đăng nhập (tuỳ chọn) |

---

## Luồng hoạt động

```
Người dùng đăng ký
    → Frontend gọi POST /api/auth/register
    → Backend hash mật khẩu (bcrypt)
    → Lưu vào bảng users trong MySQL
    → Trả về JWT token
    → Frontend lưu token vào localStorage
    → Tự động đăng nhập!
```
