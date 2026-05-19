/**
 * MIGRATION SCRIPT
 * Chạy lệnh: node migrate.js
 * Mục đích: Thêm các cột mới vào bảng cards (note, img, known)
 */
require('dotenv').config();
const db = require('./db');

async function migrate() {
    console.log('🔄 Bắt đầu migration database...\n');
    const migrations = [
        {
            name: 'Thêm cột note vào cards',
            sql: 'ALTER TABLE cards ADD COLUMN IF NOT EXISTS note TEXT DEFAULT NULL'
        },
        {
            name: 'Thêm cột img vào cards',
            sql: 'ALTER TABLE cards ADD COLUMN IF NOT EXISTS img MEDIUMTEXT DEFAULT NULL'
        },
        {
            name: 'Thêm cột known vào cards',
            sql: 'ALTER TABLE cards ADD COLUMN IF NOT EXISTS known TINYINT(1) DEFAULT 0'
        }
    ];

    let success = 0;
    for (const m of migrations) {
        try {
            await db.query(m.sql);
            console.log(`✅ ${m.name}`);
            success++;
        } catch (e) {
            // Nếu cột đã tồn tại sẽ có lỗi Duplicate, bỏ qua
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log(`⏭️  ${m.name} (đã tồn tại, bỏ qua)`);
                success++;
            } else {
                console.error(`❌ ${m.name}: ${e.message}`);
            }
        }
    }

    console.log(`\n✅ Migration hoàn tất! (${success}/${migrations.length})`);
    console.log('👉 Bây giờ restart server: node server.js\n');
    process.exit(0);
}

migrate().catch(e => {
    console.error('❌ Lỗi nghiêm trọng:', e.message);
    process.exit(1);
});
