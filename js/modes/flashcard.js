// --- MODE: FLASHCARD ---
function renderFlashcard(container) {
    if (currentIndex >= currentCards.length) {
        container.innerHTML = `
            <div class="test-results">
                <h2>🎉 Hoàn thành!</h2>
                <div class="result-details">
                    <div class="result-item"><div class="value" style="color: #10b981;">${knownCards.length}</div><div class="label">Đã biết</div></div>
                    <div class="result-item"><div class="value" style="color: #ef4444;">${unknownCards.length}</div><div class="label">Chưa biết</div></div>
                </div>
                <button class="btn" onclick="resetFlashcard()">📖 Học lại tất cả</button>
                <button class="btn btn-danger" style="margin-left: 10px;" onclick="reviewUnknown()">🔄 Ôn lại từ chưa biết</button>
            </div>`;
        return;
    }
    const card = currentCards[currentIndex];
    const imgHtml = card.img ? `<img src="${card.img}" class="card-img">` : '';
    const noteHtml = card.note ? `<div style="margin-top: 10px; color: #fbbf24; font-style: italic; font-size: 18px;">📝 ${card.note}</div>` : '';
    container.innerHTML = `
        <div class="flashcard-container" onclick="toggleFlip()">
            <div class="flashcard">
                <div class="card-face card-front">
                    <div>${card.term}</div>
                    ${noteHtml}
                    ${imgHtml}
                    <small class="card-hint">(Nhấn để lật)</small>
                </div>
                <div class="card-face card-back">
                    <div>${card.def}</div>
                </div>
            </div>
        </div>
        <div class="flashcard-actions">
            <button class="btn btn-unknown" onclick="markUnknown()">❌ Chưa biết</button>
            <button class="btn btn-known" onclick="markKnown()">✅ Đã biết</button>
        </div>
        <p style="text-align: center; margin-top: 15px; color: var(--text-muted);">Thẻ ${currentIndex + 1} / ${currentCards.length}</p>`;
}

function toggleFlip() {
    const card = document.querySelector('.flashcard');
    if (card) card.classList.toggle('is-flipped');
}


function markKnown() {
    const card = currentCards[currentIndex];
    card.known = true;
    saveToLocal();

    if (!knownCards.find(c => c.term === card.term)) {
        knownCards.push(card);
        unknownCards = unknownCards.filter(c => c.term !== card.term);
    }
    updateProgress();
    nextCard('flashcard');
}

function markUnknown() {
    const card = currentCards[currentIndex];
    card.known = false;
    saveToLocal();

    if (!unknownCards.find(c => c.term === card.term)) {
        unknownCards.push(card);
        knownCards = knownCards.filter(c => c.term !== card.term);
    }
    updateProgress();
    nextCard('flashcard');
}

function resetFlashcard() {
    knownCards = [];
    unknownCards = [];
    currentCards = [...currentDeck.cards];
    updateProgress();
    startMode('flashcard');
}

function reviewUnknown() {
    if (unknownCards.length === 0) {
        alert("Không có từ nào chưa biết!");
        return;
    }
    currentCards = [...unknownCards];
    unknownCards = [];
    updateProgress();
    startMode('flashcard');
}
