// --- SIDEBAR TOGGLE ---
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const hamburger = document.getElementById('hamburger-btn');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    hamburger.classList.toggle('active');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const hamburger = document.getElementById('hamburger-btn');
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    hamburger.classList.remove('active');
}

// --- ĐIỀU HƯỚNG ---
function showSection(id) {
    if (id === 'create') {
        if (!checkAuthForFeature()) return;
    }

    document.querySelectorAll('.section').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(id);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

    // Reset study mode UI if entering study section
    if (id === 'study') {
        exitStudyMode();
    }

    if (id === 'library') renderLibrary();
}

function exitStudyMode() {
    activeStudyMode = null;
    const modeControls = document.getElementById('mode-controls');
    const activeHeader = document.getElementById('active-mode-header');
    const gameArea = document.getElementById('game-area');
    const progressContainer = document.getElementById('progress-container');

    if (modeControls) modeControls.classList.remove('hidden');
    if (progressContainer) progressContainer.classList.remove('hidden');
    if (activeHeader) activeHeader.classList.add('hidden');
    if (gameArea) gameArea.innerHTML = '';


    if (matchInterval) {
        clearInterval(matchInterval);
        matchInterval = null;
    }
}



function updateProgress() {
    if (!currentDeck) return;
    const total = currentDeck.cards.length;
    const known = knownCards.length;
    const unknown = unknownCards.length;
    document.getElementById('known-count').textContent = known;
    document.getElementById('unknown-count').textContent = unknown;
    document.getElementById('total-count').textContent = total;
    const progress = total > 0 ? (known / total) * 100 : 0;
    document.getElementById('progress-fill').style.width = progress + '%';
}

function openSettings() {
    const modal = document.getElementById('settings-modal');
    if (!modal) return;
    modal.classList.add('active');

    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val;
    };

    setVal('set-random-count', settingRandomCount);
    setVal('set-match-count', settingMatchCount);
    setVal('set-match-rounds', settingMatchRounds);
    setVal('set-quiz-count', settingQuizCount);
    setVal('set-write-count', settingWriteCount);
    setVal('set-tf-count', settingTFCount);

    // Populate shortcuts
    document.getElementById('sc-fc-known').innerText = shortcuts.flashcard.known === ' ' ? 'Space' : shortcuts.flashcard.known;
    document.getElementById('sc-fc-unknown').innerText = shortcuts.flashcard.unknown === ' ' ? 'Space' : shortcuts.flashcard.unknown;
    document.getElementById('sc-fc-flip').innerText = shortcuts.flashcard.flip === ' ' ? 'Space' : shortcuts.flashcard.flip;

    document.getElementById('sc-tf-true').innerText = shortcuts.truefalse.true === ' ' ? 'Space' : shortcuts.truefalse.true;
    document.getElementById('sc-tf-false').innerText = shortcuts.truefalse.false === ' ' ? 'Space' : shortcuts.truefalse.false;
    document.getElementById('sc-tf-next').innerText = shortcuts.truefalse.next === ' ' ? 'Space' : shortcuts.truefalse.next;

    document.getElementById('sc-w-next').innerText = shortcuts.write.next === ' ' ? 'Space' : shortcuts.write.next;
}

function closeSettings() {
    const modal = document.getElementById('settings-modal');
    if (modal) modal.classList.remove('active');
}
