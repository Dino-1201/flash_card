function saveAllUsers() {
    localStorage.setItem('flashcard_users', JSON.stringify(users));
}

function saveCurrentSession() {
    localStorage.setItem('flashcard_current_user', JSON.stringify(currentUser));
}

// ============================================================
// HÀM LƯU CHÍNH - Đồng bộ lên MySQL (multi-device)
// ============================================================
async function saveData() {
    if (!currentUser) {
        // Chưa đăng nhập: chỉ lưu localStorage
        saveAllUsers();
        return;
    }

    // Lưu localStorage như cache tạm thời
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex].decks = decks;
        saveAllUsers();
    }

    // ✅ Đồng bộ lên MySQL server (hỗ trợ multi-device)
    if (typeof saveDecksToDb === 'function') {
        await saveDecksToDb();
    }
}

// Alias - tất cả nơi gọi saveToLocal() sẽ tự động đồng bộ server
function saveToLocal() {
    saveData();
}
