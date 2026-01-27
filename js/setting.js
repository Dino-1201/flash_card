let capturingMode = null;

function captureHotkey(target) {
    capturingMode = target;
    const btn = document.getElementById('sc-' + target);
    if (!btn) return;

    // Reset all buttons
    document.querySelectorAll('.shortcut-btn').forEach(b => {
        b.classList.remove('capturing');
        const t = b.id.replace('sc-', '');
        const [mode, action] = getShortcutKey(t);
        b.innerText = shortcuts[mode][action] === ' ' ? 'Space' : shortcuts[mode][action];
    });

    btn.classList.add('capturing');
    btn.innerText = 'Nhấn phím...';

    const handler = (e) => {
        e.preventDefault();
        e.stopPropagation();

        let key = e.key;
        if (key === ' ') key = ' ';

        const [mode, action] = getShortcutKey(capturingMode);
        shortcuts[mode][action] = key;

        btn.innerText = key === ' ' ? 'Space' : key;
        btn.classList.remove('capturing');

        capturingMode = null;
        window.removeEventListener('keydown', handler, true);
    };

    window.addEventListener('keydown', handler, true);
}

function getShortcutKey(target) {
    if (target.startsWith('fc-')) return ['flashcard', target.replace('fc-', '')];
    if (target.startsWith('tf-')) return ['truefalse', target.replace('tf-', '')];
    if (target.startsWith('w-')) return ['write', target.replace('w-', '')];
    return [null, null];
}

function saveSettings() {
    const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? parseInt(el.value) : null;
    };

    const matchVal = getVal('set-match-count');
    if (matchVal && matchVal > 0) settingMatchCount = Math.min(matchVal, 6);

    const roundsVal = getVal('set-match-rounds');
    if (roundsVal && roundsVal > 0) settingMatchRounds = roundsVal;

    const rndVal = getVal('set-random-count');
    if (rndVal && rndVal > 0) settingRandomCount = rndVal;

    const quizVal = getVal('set-quiz-count');
    if (quizVal && quizVal > 0) settingQuizCount = quizVal;

    const writeVal = getVal('set-write-count');
    if (writeVal && writeVal > 0) settingWriteCount = writeVal;

    const tfVal = getVal('set-tf-count');
    if (tfVal && tfVal > 0) settingTFCount = tfVal;

    // Persist settings
    const settings = {
        matchCount: settingMatchCount,
        matchRounds: settingMatchRounds,
        randomCount: settingRandomCount,
        quizCount: settingQuizCount,
        writeCount: settingWriteCount,
        tfCount: settingTFCount,
        shortcuts: shortcuts
    };
    localStorage.setItem('flashcards_settings', JSON.stringify(settings));

    closeSettings();
}

