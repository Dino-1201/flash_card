// --- MODE: TRẮC NGHIỆM ---
function renderQuiz(container) {
    if (currentIndex >= currentCards.length) {
        container.innerHTML = "<div class='test-results'><h2>🎉 Hoàn thành bài trắc nghiệm!</h2><button class='btn' onclick='startMode(\"quiz\")'>Làm lại</button></div>";
        return;
    }
    const correctCard = currentCards[currentIndex];
    let options = [correctCard.def];
    while (options.length < 4 && options.length <= currentCards.length) {
        let random = currentCards[Math.floor(Math.random() * currentCards.length)];
        if (!options.includes(random.def)) options.push(random.def);
    }
    shuffle(options);
    let html = `
        <div style="text-align: center; margin-bottom: 15px; color: var(--text-muted); font-size: 14px;">Câu ${currentIndex + 1} / ${currentCards.length}</div>
        <h3 class="quiz-question">📝 "${correctCard.term}" là gì?</h3>
        <div class="quiz-options">`;
    options.forEach(opt => { html += `<button class="quiz-btn" onclick="checkQuiz(this, '${opt === correctCard.def}')">${opt}</button>`; });
    html += `</div><div id="quiz-feedback" class="feedback"></div>`;
    html += `<div style="text-align:center; margin-top:20px"><button class="btn hidden" id="next-quiz-btn" onclick="nextCard('quiz')">Tiếp theo ➡</button></div>`;
    container.innerHTML = html;
}

function checkQuiz(btn, isCorrect) {
    const feedback = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('next-quiz-btn');
    if (isCorrect === 'true') {
        btn.style.background = 'rgba(16, 185, 129, 0.3)';
        btn.style.borderColor = '#10b981';
        feedback.innerHTML = "<span class='correct'>✅ Chính xác!</span>";
    } else {
        btn.style.background = 'rgba(239, 68, 68, 0.3)';
        btn.style.borderColor = '#ef4444';
        feedback.innerHTML = "<span class='wrong'>❌ Sai! Đáp án: " + currentCards[currentIndex].def + "</span>";
    }
    nextBtn.classList.remove('hidden');
}
