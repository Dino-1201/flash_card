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
        userIcon.innerText = currentUser.username[0].toUpperCase();
        userBtn.title = `Đang đăng nhập: ${currentUser.username}. Nhấn để đăng xuất.`;

        // Load Data của User
        const user = users.find(u => u.username === currentUser.username);
        if (user) {
            decks = user.decks || [];
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
        username: username,
        password: password,
        decks: []
    };

    users.push(newUser);
    saveAllUsers();

    currentUser = { username: newUser.username };
    saveCurrentSession();
    location.reload();
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

    const userHtml = `
        <div id="user-profile-section" class="user-info" style="margin-top: -1px; background: rgba(0,0,0,0.1); border-bottom: 1px solid rgba(255,255,255,0.1);">
            <div class="user-avatar">${user.username[0].toUpperCase()}</div>
            <div class="user-details">
                <div class="user-name">${user.username}</div>
                <div class="user-email">Tài khoản cục bộ</div>
            </div>
            <button onclick="logout()" style="background:none; border:none; color: #ef4444; cursor:pointer;" title="Đăng xuất">↪️</button>
        </div>
    `;
    header.insertAdjacentHTML('afterend', userHtml);
}
