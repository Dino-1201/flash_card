// --- UTILS ---
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// --- 3. CHẾ ĐỘ HỌC ---
function startMode(mode) {
    const area = document.getElementById('game-area');
    if (!area) return;
    area.innerHTML = '';
    currentIndex = 0;
    if (matchInterval) { clearInterval(matchInterval); matchInterval = null; }

    activeStudyMode = mode;

    // UI Visibility logic
    const modeControls = document.getElementById('mode-controls');
    const activeHeader = document.getElementById('active-mode-header');
    const progressContainer = document.getElementById('progress-container');

    if (['quiz', 'write', 'truefalse', 'flashcard', 'random', 'match'].includes(mode)) {
        if (modeControls) modeControls.classList.add('hidden');
        if (progressContainer) progressContainer.classList.add('hidden');
        if (activeHeader) activeHeader.classList.remove('hidden');
    }



    // Reset cards base
    let baseCards = shuffle([...currentDeck.cards]);

    if (mode === 'flashcard') {
        currentCards = baseCards;
        renderFlashcard(area);
    }
    else if (mode === 'quiz') {
        currentCards = baseCards.slice(0, Math.min(settingQuizCount, baseCards.length));
        renderQuiz(area);
    }
    else if (mode === 'write') {
        currentCards = baseCards.slice(0, Math.min(settingWriteCount, baseCards.length));
        renderWrite(area);
    }
    else if (mode === 'truefalse') {
        currentCards = baseCards.slice(0, Math.min(settingTFCount, baseCards.length));
        renderTrueFalse(area);
    }
    else if (mode === 'match') {
        matchRoundCurrent = 1;
        renderMatch(area);
    }
    else if (mode === 'random') {
        startRandomTest(area);
    }
}


function nextCard(mode) {
    currentIndex++;
    const area = document.getElementById('game-area');
    if (mode === 'flashcard') renderFlashcard(area);
    else if (mode === 'quiz') renderQuiz(area);
    else if (mode === 'write') renderWrite(area);
    else if (mode === 'truefalse') renderTrueFalse(area);
}

function nextRandomQuestion() {
    currentIndex++;
    renderRandomQuestion(document.getElementById('game-area'));
}

// Init
window.onload = function () {
    if (typeof addCardInput === 'function') addCardInput();
    initAuthListener();
}
