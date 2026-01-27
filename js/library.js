// --- 2. THƯ VIỆN ---
function renderLibrary() {
    const list = document.getElementById('deck-list');
    if (!list) return;
    list.innerHTML = '';
    const emptyMsg = document.getElementById('empty-msg');

    if (decks.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }
    if (emptyMsg) emptyMsg.style.display = 'none';

    decks.forEach((deck, index) => {
        const div = document.createElement('div');
        div.className = 'deck-card';
        const dateStr = new Date(deck.createdAt || deck.id).toLocaleDateString();
        div.innerHTML = `<h3>${deck.title}</h3><p>📚 ${deck.cards.length} thẻ</p><p class="deck-date">🕒 Tạo ngày: ${dateStr}</p>`;
        div.onclick = () => openDeck(index);
        list.appendChild(div);
    });
}

function openDeck(index) {
    currentDeck = decks[index];
    currentCards = [...currentDeck.cards];
    knownCards = currentCards.filter(c => c.known);
    unknownCards = currentCards.filter(c => !c.known);

    const studyTitle = document.getElementById('study-title');
    if (studyTitle) studyTitle.innerText = currentDeck.title;

    updateProgress();
    showSection('study');
}

