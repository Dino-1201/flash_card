const mysql2 = require('mysql2');
require('dotenv').config();

// Tạo pool kết nối MySQL (hiệu quả hơn single connection)
const pool = mysql2.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'flashcard_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

// Dùng promise API cho async/await
const promisePool = pool.promise();

// Kiểm tra kết nối khi khởi động
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Lỗi kết nối MySQL:', err.message);
        if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.error('   → Sai username/password MySQL trong file .env');
        } else if (err.code === 'ECONNREFUSED') {
            console.error('   → MySQL chưa chạy. Hãy khởi động MySQL Server!');
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.error('   → Database chưa tồn tại. Chạy script SQL để tạo!');
        }
        return;
    }
    console.log('✅ Kết nối MySQL thành công!');
    connection.release();
});

module.exports = promisePool;
