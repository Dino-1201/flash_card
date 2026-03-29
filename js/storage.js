function saveAllUsers() {
    localStorage.setItem('flashcard_users', JSON.stringify(users));
}

function saveCurrentSession() {
    localStorage.setItem('flashcard_current_user', JSON.stringify(currentUser));
}

async function saveData() {
    if (!currentUser) return;

    // 1. Cập nhật dữ liệu vào biến toàn cục của User
    const userIndex = users.findIndex(u => u.username === currentUser.username);
    if (userIndex !== -1) {
        users[userIndex].decks = decks;
        saveAllUsers();
        console.log("Dữ liệu đã được lưu cho user (Local):", currentUser.username);

        // 2. Lưu lên Database (Firebase Firestore) nếu có
        if (typeof db !== 'undefined' && currentUser.uid) {
            try {
                await db.collection("users").doc(currentUser.uid).set({
                    username: currentUser.username,
                    name: currentUser.name || currentUser.username,
                    decks: decks,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
                console.log("Dữ liệu đã lưu thành công lên Database (Firestore).");
            } catch (error) {
                console.error("Lỗi khi lưu lên Database: ", error);
            }
        }
    }
}

// Alias cho hàm cũ
function saveToLocal() {
    saveData();
}
