// --- STATE MANAGEMENT ---
let users = JSON.parse(localStorage.getItem('flashcard_users')) || [];
let currentUser = JSON.parse(localStorage.getItem('flashcard_current_user')) || null;
let decks = []; // Sẽ load khi login
let currentDeck = null;
let currentCards = [];
let currentIndex = 0;

// Tracking known/unknown
let knownCards = [];
let unknownCards = [];

// Match game state
let matchCards = [];
let selectedCard = null;
let matchedPairs = 0;
let matchTimer = 0;
let matchInterval = null;

// Random test state
let randomTestMode = null;
let randomTestScore = 0;
let randomTestTotal = 0;

// Settings
const savedSettings = JSON.parse(localStorage.getItem('flashcards_settings')) || {};
let settingMatchCount = savedSettings.matchCount || 6;
let settingMatchRounds = savedSettings.matchRounds || 1;
let settingRandomCount = savedSettings.randomCount || 10;
let settingQuizCount = savedSettings.quizCount || 10;
let settingWriteCount = savedSettings.writeCount || 10;
let settingTFCount = savedSettings.tfCount || 10;

// Keyboard Shortcuts (Defaults)
let shortcuts = savedSettings.shortcuts || {
    flashcard: {
        known: 'ArrowRight',
        unknown: 'ArrowLeft',
        flip: ' '
    },
    truefalse: {
        true: 'ArrowLeft',
        false: 'ArrowRight',
        next: 'Enter'
    },
    write: {
        next: 'Enter'
    }
};

// Match Game Internal State
let matchRoundCurrent = 0;
let activeStudyMode = null; // To track active mode
