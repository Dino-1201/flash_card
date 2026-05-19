// --- AUTHENTICATION LOGIC (MySQL Backend API) ---
// API URL tự động nhận diện:
//   - Mở trên máy chủ (localhost/127.0.0.1) → dùng localhost:3001
//   - Mở từ thiết bị khác qua IP/domain      → dùng cùng hostname, cổng 3001
//
// ⚠️  Thiết bị B phải truy cập file qua HTTP (Live Server hoặc địa chỉ IP),
//     KHÔNG mở file:// trực tiếp từ ổ đĩa của thiết bị B.

const _hostname = window.location.hostname;
const _serverPort = 3001;
const _isLocal = (_hostname === 'localhost' || _hostname === '127.0.0.1' || _hostname === '');
const API_URL = _isLocal
    ? `http://localhost:${_serverPort}/api`
    : `http://${_hostname}:${_serverPort}/api`;

console.log('[Auth] API_URL =', API_URL);

// ============================================================
// HELPER: Gọi API
// ============================================================
async function apiCall(endpoint, method = 'GET', body = null) {
    const token = localStorage.getItem('fc_token');
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    if (body) options.body = JSON.stringify(body);

    try {
        const res = await fetch(`${API_URL}${endpoint}`, options);
        const data = await res.json();
        return { ok: res.ok, status: res.status, ...data };
    } catch (err) {
        console.error('API Error:', err);
        return { ok: false, message: '❌ Không kết nối được server! Hãy chắc chắn backend đang chạy.' };
    }
}

// ============================================================
// KHỞI TẠO AUTH (hỗ trợ multi-device qua JWT token)
// ============================================================
async function initAuthListener() {
    const userBtn = document.getElementById('user-login-btn');
    const userIcon = document.getElementById('user-btn-icon');

    const token = localStorage.getItem('fc_token');

    if (token) {
        // Xác thực token với server → hoạt động trên MỌI thiết bị
        const result = await apiCall('/auth/me');

        if (result.ok && result.user) {
            // Token hợp lệ → khôi phục phiên đăng nhập
            currentUser = result.user;
            saveCurrentSession(); // cache lại cho lần sau

            console.log("✅ Đã khôi phục phiên đăng nhập:", currentUser.username);
            document.getElementById('auth-overlay').classList.add('hidden');

            userIcon.style.display = 'block';
            userIcon.innerText = (currentUser.name && currentUser.name[0] || currentUser.username[0]).toUpperCase();
            userBtn.title = `Đang đăng nhập: ${currentUser.name || currentUser.username}. Nhấn để đăng xuất.`;

            // Load decks từ MySQL
            await loadDecksFromDB();
            updateSidebarUser(currentUser);
            renderLibrary();
            return;

        } else {
            // Token hết hạn hoặc không hợp lệ → xoá và yêu cầu đăng nhập lại
            console.warn("⚠️ Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.");
            localStorage.removeItem('fc_token');
            localStorage.removeItem('flashcard_current_user');
            currentUser = null;
        }
    }

    // Chưa có token (hoặc token lỗi) → trạng thái chưa đăng nhập
    console.log("No User Session");
    userIcon.style.display = 'block';
    userIcon.innerText = '👤';
    userBtn.title = "Đăng nhập";
    document.getElementById('auth-overlay').classList.add('hidden');
    renderLibrary();
}

// ============================================================
// LOAD DECKS TỪ DATABASE
// ============================================================
async function loadDecksFromDB() {
    const result = await apiCall('/decks');
    if (result.ok && result.decks) {
        // ✅ Normalize: server trả về front/back, frontend dùng term/def
        decks = result.decks.map(deck => ({
            ...deck,
            cards: (deck.cards || []).map(card => ({
                id:    card.id,
                term:  card.front || card.term || '',
                def:   card.back  || card.def  || '',
                note:  card.note  || '',
                img:   card.img   || '',
                known: card.known || false,
                position: card.position || 0
            }))
        }));
        console.log(`✅ Đã tải ${decks.length} bộ thẻ từ MySQL!`);
        renderLibrary();
    }
}

// ============================================================
// LƯU DECKS LÊN DATABASE (gọi sau mỗi thay đổi)
// ============================================================
async function saveDecksToDb() {
    if (!currentUser) return;

    // ✅ Normalize: frontend dùng term/def, server cần front/back
    const decksToSend = decks.map(deck => ({
        ...deck,
        cards: (deck.cards || []).map(card => ({
            front: card.term || card.front || '',
            back:  card.def  || card.back  || '',
            note:  card.note || '',
            img:   card.img  || '',
            known: card.known || false
        }))
    }));

    const result = await apiCall('/decks', 'PUT', { decks: decksToSend });
    if (result.ok) {
        console.log('✅ Đã lưu decks lên MySQL!');
    } else {
        console.warn('⚠️ Lưu DB thất bại, fallback localStorage:', result.message);
        saveAllUsers(); // fallback
    }
}

// ============================================================
// XỬ LÝ NÚT USER
// ============================================================
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

// ============================================================
// ĐĂNG NHẬP
// ============================================================
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    showAuthError('');
    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerText = 'Đang đăng nhập...'; }

    const result = await apiCall('/auth/login', 'POST', { username, password });

    if (btn) { btn.disabled = false; btn.innerText = 'Đăng nhập'; }

    if (result.ok) {
        // Lưu token và thông tin user
        localStorage.setItem('fc_token', result.token);
        currentUser = result.user;
        saveCurrentSession();
        location.reload();
    } else {
        showAuthError(result.message || 'Đăng nhập thất bại!');
    }
}

// ============================================================
// ĐĂNG KÝ
// ============================================================
async function handleRegister(e) {
    e.preventDefault();
    const name     = document.getElementById('reg-name').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const password = document.getElementById('reg-password').value;
    const confirm  = document.getElementById('reg-confirm-password').value;

    // Validate phía client
    if (password !== confirm) {
        return showAuthError("Mật khẩu nhập lại không khớp!");
    }
    if (username.length < 3) {
        return showAuthError("Tên đăng nhập phải có ít nhất 3 ký tự!");
    }
    if (password.length < 6) {
        return showAuthError("Mật khẩu phải có ít nhất 6 ký tự!");
    }

    showAuthError('');
    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.innerText = 'Đang đăng ký...'; }

    const result = await apiCall('/auth/register', 'POST', { name, username, password });

    if (btn) { btn.disabled = false; btn.innerText = 'Đăng ký'; }

    if (result.ok) {
        // Lưu token và tự động đăng nhập
        localStorage.setItem('fc_token', result.token);
        currentUser = result.user;
        saveCurrentSession();
        alert(`🎉 Chào mừng ${name}! Tài khoản đã được tạo thành công!`);
        location.reload();
    } else {
        showAuthError(result.message || 'Đăng ký thất bại!');
    }
}

// ============================================================
// SOCIAL LOGIN (Firebase - giữ nguyên logic cũ)
// ============================================================
function loginWithGoogle() {
    if (typeof auth !== 'undefined') {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider).then((result) => {
            const user = result.user;
            currentUser = { username: user.email, name: user.displayName, isFirebase: true, uid: user.uid };
            localStorage.setItem('fc_token', '');
            saveCurrentSession();
            location.reload();
        }).catch((error) => {
            showAuthError("Lỗi đăng nhập Google: " + error.message);
        });
    } else {
        const fakeEmail = prompt("Nhập email Google mô phỏng:");
        if (fakeEmail) {
            currentUser = { username: fakeEmail, name: "Google User" };
            saveCurrentSession();
            location.reload();
        }
    }
}

function loginWithFacebook() {
    if (typeof auth !== 'undefined') {
        const provider = new firebase.auth.FacebookAuthProvider();
        auth.signInWithPopup(provider).then((result) => {
            const user = result.user;
            currentUser = { username: user.email || user.uid, name: user.displayName, isFirebase: true, uid: user.uid };
            saveCurrentSession();
            location.reload();
        }).catch((error) => {
            showAuthError("Lỗi đăng nhập Facebook: " + error.message);
        });
    } else {
        const fakeName = prompt("Nhập tên tài khoản Facebook mô phỏng:");
        if (fakeName) {
            currentUser = { username: fakeName.replace(/\s/g,'').toLowerCase(), name: fakeName };
            saveCurrentSession();
            location.reload();
        }
    }
}

// ============================================================
// ĐĂNG XUẤT
// ============================================================
function logout() {
    localStorage.removeItem('fc_token');
    currentUser = null;
    saveCurrentSession();
    location.reload();
}

// ============================================================
// UI HELPERS
// ============================================================
function showAuthError(msg) {
    const el = document.getElementById('auth-error');
    if (!msg) {
        el.classList.add('hidden');
        return;
    }
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
                <div class="user-email">${user.auth_type === 'local' ? '📧 Tài khoản cục bộ' : '🌐 Tài khoản mxh'}</div>
            </div>
            <button onclick="logout()" style="background:none; border:none; color: #ef4444; cursor:pointer;" title="Đăng xuất">↪️</button>
        </div>
    `;
    header.insertAdjacentHTML('afterend', userHtml);
}
