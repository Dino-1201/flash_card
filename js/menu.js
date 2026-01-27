// --- 4. MENU & ACTIONS ---
function toggleMenu() {
    const menu = document.getElementById('study-menu');
    if (menu) menu.classList.toggle('show');
}

function editDeckAction() {
    toggleMenu();
    if (!currentDeck) return;

    window.editingDeckId = currentDeck.id;

    showSection('create');
    document.getElementById('deck-title').value = currentDeck.title;
    document.getElementById('card-list-builder').innerHTML = '';
    document.getElementById('save-deck-btn').innerText = "Hoàn tất";

    currentDeck.cards.forEach(card => {
        addCardInput(card.term, card.def, card.note || '');
        if (card.img) {
            const inputs = document.querySelectorAll('#card-list-builder .input-group');
            const lastInput = inputs[inputs.length - 1];
            const imgData = lastInput.querySelector('.inp-img-data');
            const preview = lastInput.querySelector('.img-preview');
            imgData.value = card.img;
            preview.src = card.img;
            preview.style.display = 'inline-block';
        }
    });
}

function duplicateDeckAction() {
    toggleMenu();
    if (!currentDeck) return;
    const newDeck = {
        ...currentDeck,
        id: Date.now(),
        title: currentDeck.title + ' (Copy)',
        createdAt: Date.now()
    };
    decks.push(newDeck);
    saveToLocal();
    alert('Đã tạo bản sao thành công!');
    renderLibrary();
}

function printDeckAction() {
    toggleMenu();
    window.print();
}

function deleteDeckAction() {
    toggleMenu();
    if (!confirm("Bạn có chắc chắn muốn xóa học phần này không?")) return;
    decks = decks.filter(d => d.id !== currentDeck.id);
    saveToLocal();
    showSection('library');
}

function exportDeckAction() {
    toggleMenu();
    if (!currentDeck) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentDeck));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", currentDeck.title + "_deck.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function embedDeckAction() {
    toggleMenu();
    const code = `<iframe src="${window.location.href}?deck=${currentDeck.id}" width="600" height="400"></iframe>`;
    prompt("Copy mã nhúng dưới đây:", code);
}

function mergeDeckAction() {
    toggleMenu();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    let html = `<div class="modal-content">
        <h3>Chọn bài để ghép vào "${currentDeck.title}"</h3>
        <div style="margin-top: 15px;">`;

    decks.forEach((d, idx) => {
        if (d.id !== currentDeck.id) {
            html += `<div class="list-item" onclick="confirmMerge(${idx})">
                <strong>${d.title}</strong> (${d.cards.length} thẻ)
            </div>`;
        }
    });

    html += `</div>
        <button class="btn btn-secondary" style="margin-top: 20px; width: 100%;" onclick="document.querySelector('.modal-overlay').remove()">Hủy</button>
    </div>`;

    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    window.confirmMerge = function (idx) {
        document.querySelector('.modal-overlay').remove();
        const deckToMerge = decks[idx];
        if (!deckToMerge) return;

        if (confirm(`Bạn muốn ghép thẻ của "${deckToMerge.title}" vào "${currentDeck.title}"?`)) {
            currentDeck.cards = currentDeck.cards.concat(deckToMerge.cards);
            saveToLocal();
            startMode('flashcard');
            alert("Ghép thành công!");
        }
    };
}
