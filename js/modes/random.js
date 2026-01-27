// --- MODE: KIỂM TRA NGẪU NHIÊN ---
function startRandomTest(container) {
    randomTestScore = 0;
    randomTestTotal = Math.min(settingRandomCount, currentDeck.cards.length);
    currentCards = shuffle([...currentDeck.cards]).slice(0, randomTestTotal);
    currentIndex = 0;
    renderRandomQuestion(container);
}

function renderRandomQuestion(container) {
    if (currentIndex >= currentCards.length) {
        const percent = Math.round((randomTestScore / randomTestTotal) * 100);
        container.innerHTML = `
            <div class="test-results">
                <h2>🎲 Kết quả Kiểm tra Ngẫu nhiên</h2>
                <div class="score-display">${percent}%</div>
                <div class="result-details">
                    <div class="result-item"><div class="value" style="color: #10b981;">${randomTestScore}</div><div class="label">Đã biết</div></div>
                    <div class="result-item"><div class="value" style="color: #ef4444;">${randomTestTotal - randomTestScore}</div><div class="label">Sai</div></div>
                </div>
                <button class="btn" onclick="startMode('random')">🔄 Làm lại</button>
            </div>`;
        return;
    }
    const modes = ['quiz', 'write', 'truefalse'];
    randomTestMode = modes[Math.floor(Math.random() * modes.length)];
    container.innerHTML = `<p style="text-align:center; margin-bottom: 20px; color: var(--text-muted);">Câu ${currentIndex + 1}/${randomTestTotal}</p>`;
    const questionArea = document.createElement('div');
    container.appendChild(questionArea);
    if (randomTestMode === 'quiz') renderRandomQuiz(questionArea);
    else if (randomTestMode === 'write') renderRandomWrite(questionArea);
    else renderRandomTF(questionArea);
}

function renderRandomQuiz(container) {
    const correctCard = currentCards[currentIndex];
    let options = [correctCard.def];
    const allCards = currentDeck.cards;
    while (options.length < 4 && options.length <= allCards.length) {
        let random = allCards[Math.floor(Math.random() * allCards.length)];
        if (!options.includes(random.def)) options.push(random.def);
    }
    shuffle(options);
    let html = `<h3 class="quiz-question">📝 "${correctCard.term}" là gì?</h3><div class="quiz-options">`;
    options.forEach(opt => { html += `<button class="quiz-btn" onclick="checkRandomQuiz(this, ${opt === correctCard.def})">${opt}</button>`; });
    html += `</div><div id="random-feedback" class="feedback"></div>`;
    html += `<div style="text-align:center; margin-top:20px"><button class="btn hidden" id="next-random-btn" onclick="nextRandomQuestion()">Tiếp theo ➡</button></div>`;
    container.innerHTML = html;
}

function checkRandomQuiz(btn, isCorrect) {
    document.querySelectorAll('.quiz-btn').forEach(b => b.disabled = true);
    if (isCorrect) {
        btn.style.background = 'rgba(16, 185, 129, 0.3)';
        btn.style.borderColor = '#10b981';
        document.getElementById('random-feedback').innerHTML = "<span class='correct'>✅ Chính xác!</span>";
        randomTestScore++;
    } else {
        btn.style.background = 'rgba(239, 68, 68, 0.3)';
        btn.style.borderColor = '#ef4444';
        document.getElementById('random-feedback').innerHTML = "<span class='wrong'>❌ Sai! Đáp án: " + currentCards[currentIndex].def + "</span>";
    }
    document.getElementById('next-random-btn').classList.remove('hidden');
}

function renderRandomWrite(container) {
    const card = currentCards[currentIndex];
    container.innerHTML = `
        <div style="text-align: center;">
            <h3 class="quiz-question">✍️ Định nghĩa: ${card.def}</h3>
            <input type="text" id="random-write-input" placeholder="Nhập thuật ngữ..." style="max-width: 400px; padding: 18px; font-size: 18px;">
            <div style="margin-top: 15px;"><button class="btn" onclick="checkRandomWrite()">Kiểm tra</button></div>
            <div id="random-feedback" class="feedback"></div>
            <button class="btn hidden" id="next-random-btn" style="margin-top:15px" onclick="nextRandomQuestion()">Tiếp theo ➡</button>
        </div>`;
}

function checkRandomWrite() {
    const input = document.getElementById('random-write-input').value.trim().toLowerCase();
    const correct = currentCards[currentIndex].term.trim().toLowerCase();
    if (input === correct) {
        document.getElementById('random-feedback').innerHTML = "<span class='correct'>✅ Chính xác!</span>";
        randomTestScore++;
    } else {
        document.getElementById('random-feedback').innerHTML = `<span class='wrong'>❌ Sai! Đáp án: ${currentCards[currentIndex].term}</span>`;
    }
    document.getElementById('next-random-btn').classList.remove('hidden');
}

function renderRandomTF(container) {
    const realCard = currentCards[currentIndex];
    const isShowCorrect = Math.random() > 0.5;
    let displayDef = realCard.def;
    if (!isShowCorrect && currentDeck.cards.length > 1) {
        let other;
        do { other = currentDeck.cards[Math.floor(Math.random() * currentDeck.cards.length)]; } while (other.term === realCard.term);
        displayDef = other.def;
    }
    container.innerHTML = `
        <div style="text-align: center;">
            <h3 class="quiz-question">✔️ "${realCard.term}" có nghĩa là:</h3>
            <div style="background: var(--bg-card); padding: 25px; margin: 20px auto; border-radius: 12px; max-width: 500px; border: 1px solid var(--border);"><p style="font-size: 20px;">${displayDef}</p></div>
            <div style="margin-top: 20px;">
                <button class="btn btn-known" style="margin-right: 15px" onclick="checkRandomTF(${isShowCorrect}, true)">✅ Đúng</button>
                <button class="btn btn-unknown" onclick="checkRandomTF(${isShowCorrect}, false)">❌ Sai</button>
            </div>
            <div id="random-feedback" class="feedback"></div>
            <button class="btn hidden" id="next-random-btn" style="margin-top:15px" onclick="nextRandomQuestion()">Tiếp theo ➡</button>
        </div>`;
}

function checkRandomTF(isActuallyCorrect, userChoice) {
    document.querySelectorAll('.btn-known, .btn-unknown').forEach(b => b.disabled = true);
    const realCard = currentCards[currentIndex];
    if (isActuallyCorrect === userChoice) {
        document.getElementById('random-feedback').innerHTML = "<span class='correct'>✅ Giỏi lắm!</span>";
        randomTestScore++;
    } else {
        document.getElementById('random-feedback').innerHTML = `<span class='wrong'>❌ Không chính xác.<br>${realCard.term} nghĩa là: <strong>${realCard.def}</strong></span>`;
    }
    document.getElementById('next-random-btn').classList.remove('hidden');
}
