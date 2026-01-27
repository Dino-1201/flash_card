// --- 1. TẠO THẺ ---
let tempCards = [];

function addCardInput(term = '', def = '', note = '') {
    const container = document.getElementById('card-list-builder');
    if (!container) return;
    const div = document.createElement('div');
    div.className = 'input-group';
    div.innerHTML = `
        <div style="display: flex; gap: 10px;">
            <input type="text" class="inp-term" placeholder="Thuật ngữ" value="${term}" style="flex: 1;">
            <input type="text" class="inp-def" placeholder="Định nghĩa" value="${def}" style="flex: 1;">
        </div>
        <input type="text" class="inp-note" placeholder="Ghi chú (tùy chọn)" value="${note}" style="margin-top: 5px; font-style: italic;">
        
        <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
            <label class="file-upload-label">
                📷 Chọn ảnh
                <input type="file" accept="image/*" onchange="handleImageUpload(this)">
            </label>
            <input type="hidden" class="inp-img-data" value="">
            <img class="img-preview" style="display:none">
        </div>

        <button class="btn btn-danger" onclick="this.parentElement.remove()" style="margin-top:10px">🗑️ Xóa</button>
    `;
    container.appendChild(div);
}

function handleImageUpload(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const container = input.parentElement.parentElement;
            const imgPreview = container.querySelector('.img-preview');
            const hiddenInput = container.querySelector('.inp-img-data');

            imgPreview.src = e.target.result;
            imgPreview.style.display = 'inline-block';
            hiddenInput.value = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function importText() {
    const text = document.getElementById('import-text').value;
    if (!text) return;
    const lines = text.split('\n');
    lines.forEach(line => {
        if (line.includes('-')) {
            const parts = line.split('-');
            addCardInput(parts[0].trim(), parts[1].trim());
        }
    });
    document.getElementById('import-text').value = '';
}

function saveDeck() {
    if (!checkAuthForFeature()) return;

    const title = document.getElementById('deck-title').value;
    if (!title) return alert("Vui lòng nhập tiêu đề!");
    const inputs = document.querySelectorAll('#card-list-builder .input-group');
    const newCards = [];
    inputs.forEach(div => {
        const term = div.querySelector('.inp-term').value;
        const def = div.querySelector('.inp-def').value;
        const note = div.querySelector('.inp-note').value;
        const img = div.querySelector('.inp-img-data').value;
        if (term && def) newCards.push({ term, def, note, img, known: false });
    });
    if (newCards.length === 0) return alert("Cần ít nhất 1 thẻ!");

    if (window.editingDeckId) {
        const index = decks.findIndex(d => d.id === window.editingDeckId);
        if (index !== -1) {
            const oldCards = decks[index].cards;
            newCards.forEach(nc => {
                const exist = oldCards.find(oc => oc.term === nc.term);
                if (exist && exist.known) nc.known = true;
            });
            decks[index] = { ...decks[index], title, cards: newCards };
        }
        window.editingDeckId = null;
        document.getElementById('save-deck-btn').innerText = "Tạo học phần";
    } else {
        decks.push({ id: Date.now(), title, cards: newCards, createdAt: Date.now() });
    }

    saveToLocal();
    document.getElementById('deck-title').value = '';
    const builder = document.getElementById('card-list-builder');
    if (builder) builder.innerHTML = '';
    addCardInput();
    showSection('library');
}
