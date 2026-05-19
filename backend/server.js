const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'flashcard_secret';

// ============================================================
// MIDDLEWARE
// ============================================================
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500', 'null'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Log mỗi request
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString('vi-VN')}] ${req.method} ${req.path}`);
    next();
});

// ============================================================
// MIDDLEWARE XÁC THỰC TOKEN
// ============================================================
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ success: false, message: 'Cần đăng nhập!' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn!' });
        }
        req.user = user;
        next();
    });
}

// ============================================================
// ROUTE: KIỂM TRA SERVER
// ============================================================
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🚀 FlashCard API Server đang chạy!',
        version: '1.0.0',
        endpoints: {
            register: 'POST /api/auth/register',
            login:    'POST /api/auth/login',
            me:       'GET  /api/auth/me',
            decks:    'GET  /api/decks',
            saveDecks:'PUT  /api/decks'
        }
    });
});

// ============================================================
// ROUTE: ĐĂNG KÝ TÀI KHOẢN
// ============================================================
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, username, password, email } = req.body;

        // Validate đầu vào
        if (!name || !username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng điền đầy đủ Tên, Tên đăng nhập và Mật khẩu!'
            });
        }
        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Tên đăng nhập phải có ít nhất 3 ký tự!'
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Mật khẩu phải có ít nhất 6 ký tự!'
            });
        }

        // Kiểm tra username đã tồn tại chưa
        const [existing] = await db.query(
            'SELECT id FROM users WHERE username = ?',
            [username.trim()]
        );
        if (existing.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Tên đăng nhập này đã tồn tại!'
            });
        }

        // Kiểm tra email (nếu có)
        if (email) {
            const [existingEmail] = await db.query(
                'SELECT id FROM users WHERE email = ?',
                [email.trim()]
            );
            if (existingEmail.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Email này đã được sử dụng!'
                });
            }
        }

        // Hash mật khẩu (KHÔNG bao giờ lưu plain text!)
        const hashedPassword = await bcrypt.hash(password, 12);

        // Lưu vào MySQL
        const [result] = await db.query(
            `INSERT INTO users (name, username, email, password, auth_type)
             VALUES (?, ?, ?, ?, 'local')`,
            [name.trim(), username.trim(), email?.trim() || null, hashedPassword]
        );

        // Tạo JWT token
        const token = jwt.sign(
            { id: result.insertId, username: username.trim(), name: name.trim() },
            JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        console.log(`✅ Tài khoản mới: ${username} (ID: ${result.insertId})`);

        res.status(201).json({
            success: true,
            message: 'Đăng ký thành công!',
            token,
            user: {
                id: result.insertId,
                name: name.trim(),
                username: username.trim(),
                email: email?.trim() || null
            }
        });

    } catch (err) {
        console.error('Lỗi đăng ký:', err);
        res.status(500).json({ success: false, message: 'Lỗi server! Vui lòng thử lại.' });
    }
});

// ============================================================
// ROUTE: ĐĂNG NHẬP
// ============================================================
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Vui lòng nhập tên đăng nhập và mật khẩu!'
            });
        }

        // Tìm user trong DB
        const [rows] = await db.query(
            'SELECT * FROM users WHERE username = ? AND is_active = 1',
            [username.trim()]
        );

        if (rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không chính xác!'
            });
        }

        const user = rows[0];

        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Tên đăng nhập hoặc mật khẩu không chính xác!'
            });
        }

        // Cập nhật last_login
        await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

        // Tạo JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, name: user.name },
            JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        console.log(`✅ Đăng nhập: ${user.username}`);

        res.json({
            success: true,
            message: 'Đăng nhập thành công!',
            token,
            user: {
                id: user.id,
                name: user.name,
                username: user.username,
                email: user.email,
                auth_type: user.auth_type
            }
        });

    } catch (err) {
        console.error('Lỗi đăng nhập:', err);
        res.status(500).json({ success: false, message: 'Lỗi server!' });
    }
});

// ============================================================
// ROUTE: LẤY THÔNG TIN USER HIỆN TẠI (cần token)
// ============================================================
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, name, username, email, auth_type, created_at, last_login FROM users WHERE id = ?',
            [req.user.id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy user!' });
        }

        res.json({ success: true, user: rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server!' });
    }
});

// ============================================================
// ROUTE: LẤY DANH SÁCH DECKS của user (cần token)
// ============================================================
app.get('/api/decks', authenticateToken, async (req, res) => {
    try {
        const [decks] = await db.query(
            'SELECT * FROM decks WHERE user_id = ? ORDER BY updated_at DESC',
            [req.user.id]
        );

        // Lấy cards cho từng deck
        for (let deck of decks) {
            const [cards] = await db.query(
                'SELECT * FROM cards WHERE deck_id = ? ORDER BY position',
                [deck.id]
            );
            deck.cards = cards;
        }

        res.json({ success: true, decks });
    } catch (err) {
        console.error('Lỗi lấy decks:', err);
        res.status(500).json({ success: false, message: 'Lỗi server!' });
    }
});

// ============================================================
// ROUTE: LƯU/ĐỒNG BỘ TOÀN BỘ DECKS (cần token)
// ============================================================
app.put('/api/decks', authenticateToken, async (req, res) => {
    const conn = await db.getConnection();
    try {
        const { decks } = req.body;
        if (!Array.isArray(decks)) {
            return res.status(400).json({ success: false, message: 'Dữ liệu không hợp lệ!' });
        }

        await conn.beginTransaction();

        // Xoá decks cũ và tạo lại (đơn giản nhất)
        await conn.query('DELETE FROM decks WHERE user_id = ?', [req.user.id]);

        for (const deck of decks) {
            const [deckResult] = await conn.query(
                'INSERT INTO decks (user_id, title, description) VALUES (?, ?, ?)',
                [req.user.id, deck.title || 'Untitled', deck.description || '']
            );
            const deckId = deckResult.insertId;

            if (Array.isArray(deck.cards)) {
                for (let i = 0; i < deck.cards.length; i++) {
                    const card = deck.cards[i];
                    await conn.query(
                        'INSERT INTO cards (deck_id, front, back, position) VALUES (?, ?, ?, ?)',
                        [deckId, card.front || '', card.back || '', i]
                    );
                }
            }
        }

        await conn.commit();
        console.log(`✅ Đã lưu ${decks.length} decks cho user ${req.user.username}`);

        res.json({ success: true, message: `Đã lưu ${decks.length} bộ thẻ vào database!` });

    } catch (err) {
        await conn.rollback();
        console.error('Lỗi lưu decks:', err);
        res.status(500).json({ success: false, message: 'Lỗi lưu dữ liệu!' });
    } finally {
        conn.release();
    }
});

// ============================================================
// ROUTE: XEM DANH SÁCH TẤT CẢ USERS (chỉ dùng để debug)
// ============================================================
app.get('/api/admin/users', async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id, name, username, email, auth_type, is_active, created_at, last_login FROM users ORDER BY created_at DESC'
        );
        res.json({ success: true, total: users.length, users });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Lỗi server!' });
    }
});

// ============================================================
// KHỞI ĐỘNG SERVER
// ============================================================
app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║     🚀 FlashCard API Server Started     ║');
    console.log('╠════════════════════════════════════════╣');
    console.log(`║  URL:  http://localhost:${PORT}           ║`);
    console.log('║  API:  /api/auth/register               ║');
    console.log('║        /api/auth/login                  ║');
    console.log('║        /api/decks                       ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
});
