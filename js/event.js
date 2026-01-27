// --- EVENT LISTENERS ---

// Close menu when clicking outside
document.addEventListener('click', function (e) {
    const menu = document.getElementById('study-menu');
    const menuBtns = document.querySelectorAll('.menu-btn');
    let isClickOnButton = false;
    menuBtns.forEach(btn => {
        if (btn.contains(e.target)) isClickOnButton = true;
    });

    if (menu && menu.classList.contains('show') && !menu.contains(e.target) && !isClickOnButton) {
        menu.classList.remove('show');
    }
});

// --- ENTER KEY HANDLER ---
document.addEventListener('keydown', function (event) {
    // If user is currently typing in an input, don't trigger global shortcuts
    if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        // Exception: Enter in Write Mode input
        if (event.key === 'Enter' && (document.activeElement.id === 'write-input' || document.activeElement.id === 'random-write-input')) {
            // Let it fall through to logic below
        } else {
            return;
        }
    }

    const key = event.key;

    // --- FLASHCARD MODE SHORTCUTS ---
    if (activeStudyMode === 'flashcard') {
        if (key === shortcuts.flashcard.known) {
            markKnown();
            return;
        }
        if (key === shortcuts.flashcard.unknown) {
            markUnknown();
            return;
        }
        if (key === shortcuts.flashcard.flip) {
            event.preventDefault(); // Prevent scroll on space
            toggleFlip();
            return;
        }

    }

    // --- TRUE/FALSE MODE SHORTCUTS ---
    if (activeStudyMode === 'truefalse') {
        const nextBtn = document.getElementById('next-tf-btn');
        if (nextBtn && !nextBtn.classList.contains('hidden')) {
            if (key === shortcuts.truefalse.next) {
                nextCard('truefalse');
                return;
            }
        } else {
            if (key === shortcuts.truefalse.true) {
                checkTF(window.currentTFState, true);
                return;
            }
            if (key === shortcuts.truefalse.false) {
                checkTF(window.currentTFState, false);
                return;
            }
        }
    }

    // --- WRITE MODE SHORTCUTS ---
    if (activeStudyMode === 'write') {
        const nextBtn = document.getElementById('next-write-btn');
        if (nextBtn && !nextBtn.classList.contains('hidden')) {
            if (key === shortcuts.write.next) {
                nextCard('write');
                return;
            }
        } else if (key === 'Enter') {
            checkWrite();
            return;
        }
    }

    // --- RANDOM MODE NEXT ---
    if (activeStudyMode === 'random') {
        const nextBtn = document.getElementById('next-random-btn');
        if (nextBtn && !nextBtn.classList.contains('hidden')) {
            if (key === 'Enter') {
                nextRandomQuestion();
                return;
            }
        }
    }

    // Generic Enter for buttons and results
    if (key === "Enter") {
        // Quiz Mode Next (if feedback is visible)
        const quizNext = document.getElementById('next-quiz-btn');
        if (quizNext && !quizNext.classList.contains('hidden')) {
            nextCard('quiz');
            return;
        }
    }
});

