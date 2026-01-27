function saveAllUsers() {
    localStorage.setItem('flashcard_users', JSON.stringify(users));
}

function saveCurrentSession() {
    localStorage.setItem('flashcard_current_user', JSON.stringify(currentUser));
}

// Wrapper lưu dữ liệu (Local Storage theo User)
async function saveData() {
    if (!currentUser) return;

    // 1. Cập nhật dữ liệu vào biến toàn cục của User
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex].decks = decks;
        saveAllUsers();
        console.log("Dữ liệu đã được lưu cho user:", currentUser.username);
    }
}

// Alias cho hàm cũ
function saveToLocal() {
    saveData();
}
