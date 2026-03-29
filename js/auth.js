// --- AUTHENTICATION LOGIC (LOCAL) ---

function initAuthListener() {
    const userBtn = document.getElementById('user-login-btn');
    const userIcon = document.getElementById('user-btn-icon');

    if (currentUser) {
        // Đã đăng nhập
        console.log("Logged In:", currentUser.username);
        document.getElementById('auth-overlay').classList.add('hidden');

        // Update User Button
        userIcon.style.display = 'block';
        userIcon.innerText = (currentUser.name && currentUser.name[0] || currentUser.username[0]).toUpperCase();
        userBtn.title = `Đang đăng nhập: ${currentUser.name || currentUser.username}. Nhấn để đăng xuất.`;

        // Load Data của User
        const user = users.find(u => u.username === currentUser.username);
        if (user) {
            decks = user.decks || [];
        }

        // Ưu tiên load từ Firestore (Database) nếu có
        if (typeof db !== 'undefined' && currentUser.uid) {
            db.collection("users").doc(currentUser.uid).get().then(doc => {
                if (doc.exists) {
                    decks = doc.data().decks || [];
                    console.log("Đã tải dữ liệu từ Database Firestore!");
                    renderLibrary(); // Update UI sau khi load database
                }
            }).catch(e => console.error("Lỗi lấy dữ liệu DB: ", e));
        }

        updateSidebarUser(currentUser);
        renderLibrary();
    } else {
        // Chưa đăng nhập
        console.log("No User Session");
        userIcon.style.display = 'block';
        userIcon.innerText = '👤';
        userBtn.title = "Đăng nhập";
        document.getElementById('auth-overlay').classList.add('hidden');
        renderLibrary();
    }
}

function handleUserBtnClick() {
    if (currentUser) {
        if (confirm(`Chào ${currentUser.username}! Bạn có muốn đăng xuất?`)) {
            logout();
        }
    } else {
        document.getElementById('auth-overlay').classList.remove('hidden');
    }
}

function checkAuthForFeature() {
    if (!currentUser) {
        document.getElementById('auth-overlay').classList.remove('hidden');
        showAuthError("Vui lòng đăng nhập để sử dụng tính năng này!");
        return false;
    }
    return true;
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.username === username);

    if (user && user.password === password) {
        currentUser = { username: user.username };
        saveCurrentSession();
        location.reload();
    } else {
        showAuthError("Tên đăng nhập hoặc mật khẩu không chính xác.");
    }
}

function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm = document.getElementById('reg-confirm-password').value;

    if (password !== confirm) {
        return showAuthError("Mật khẩu nhập lại không khớp!");
    }

    if (username.length < 3) {
        return showAuthError("Tên đăng nhập phải có ít nhất 3 ký tự!");
    }

    if (users.find(u => u.username === username)) {
        return showAuthError("Tên đăng nhập này đã tồn tại.");
    }

    const newUser = {
        name: name,
        username: username,
        password: password, // Trong thực tế, KHÔNG BAO GIỜ lưu mật khẩu plain text. Cần phải hash!
        decks: []
    };

    users.push(newUser);
    saveAllUsers();

    currentUser = { username: newUser.username, name: newUser.name };
    saveCurrentSession();
    location.reload();
}

// --- SOCIAL LOGIN (MÔ PHỎNG NẾU CHƯA CÓ FIREBASE) ---
function loginWithGoogle() {
    if (typeof auth !== 'undefined') {
        // Thực thi Firebase Google Login
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).then((result) => {
            const user = result.user;
            currentUser = { username: user.email, name: user.displayName, isFirebase: true, uid: user.uid };
            // Tạo tài khoản local nếu chưa có
            if (!users.find(u => u.username === user.email)) {
                users.push({...currentUser, decks: []});
                saveAllUsers();
            }
            saveCurrentSession();
            location.reload();
        }).catch((error) => {
            showAuthError("Lỗi đăng nhập Google: " + error.message);
        });
    } else {
        // Mô phỏng đăng nhập
        const fakeEmail = prompt("Nhập email Google mô phỏng:");
        if (fakeEmail) {
            currentUser = { username: fakeEmail, name: "Google User" };
            if (!users.find(u => u.username === fakeEmail)) {
                users.push({ username: fakeEmail, name: "Google User", decks: [] });
                saveAllUsers();
            }
            saveCurrentSession();
            location.reload();
        }
    }
}

function loginWithFacebook() {
    if (typeof auth !== 'undefined') {
        // Thực thi Firebase Facebook Login
        const provider = new firebase.auth.FacebookAuthProvider();
        auth.signInWithPopup(provider).then((result) => {
            const user = result.user;
            currentUser = { username: user.email || user.uid, name: user.displayName, isFirebase: true, uid: user.uid };
            if (!users.find(u => u.username === currentUser.username)) {
                users.push({...currentUser, decks: []});
                saveAllUsers();
            }
            saveCurrentSession();
            location.reload();
        }).catch((error) => {
            showAuthError("Lỗi đăng nhập Facebook: " + error.message);
        });
    } else {
         // Mô phỏng đăng nhập
         const fakeName = prompt("Nhập tên tài khoản Facebook mô phỏng:");
         if (fakeName) {
             currentUser = { username: fakeName.replace(/\s/g,'').toLowerCase(), name: fakeName };
             if (!users.find(u => u.username === currentUser.username)) {
                 users.push({ username: currentUser.username, name: currentUser.name, decks: [] });
                 saveAllUsers();
             }
             saveCurrentSession();
             location.reload();
         }
    }
}

function logout() {
    currentUser = null;
    saveCurrentSession();
    location.reload();
}

function showAuthError(msg) {
    const el = document.getElementById('auth-error');
    el.innerText = msg;
    el.classList.remove('hidden');
}

function toggleAuthMode() {
    document.getElementById('login-section').classList.toggle('hidden');
    document.getElementById('register-section').classList.toggle('hidden');
    document.getElementById('auth-error').classList.add('hidden');
}

function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        icon.innerText = '🙈';
    } else {
        input.type = 'password';
        icon.innerText = '👁️';
    }
}

function updateSidebarUser(user) {
    const header = document.querySelector('.sidebar-header');
    if (document.getElementById('user-profile-section')) return;

    const displayName = user.name || user.username;
    const avatarLetter = displayName[0].toUpperCase();

    const userHtml = `
        <div id="user-profile-section" class="user-info" style="margin-top: -1px; background: rgba(0,0,0,0.1); border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div class="user-avatar">${avatarLetter}</div>
            <div class="user-details">
                <div class="user-name">${displayName}</div>
                <div class="user-email">${user.isFirebase ? 'Tài khoản mxh' : 'Tài khoản cục bộ'}</div>
            </div>
            <button onclick="logout()" style="background:none; border:none; color: #ef4444; cursor:pointer;" title="Đăng xuất">↪️</button>
        </div>
    `;
    header.insertAdjacentHTML('afterend', userHtml);
}
