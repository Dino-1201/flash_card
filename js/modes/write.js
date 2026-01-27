// --- MODE: VIẾT ---
function renderWrite(container) {
    if (currentIndex >= currentCards.length) return container.innerHTML = "<div class='test-results'><h2>🎉 Hoàn thành!</h2><button class='btn' onclick='startMode(\"write\")'>Làm lại</button></div>";
    const card = currentCards[currentIndex];
    container.innerHTML = `
        <div style="text-align: center;">
            <div style="margin-bottom: 15px; color: var(--text-muted); font-size: 14px;">Câu ${currentIndex + 1} / ${currentCards.length}</div>
            <h3 class="quiz-question">✍️ Định nghĩa: ${card.def}</h3>
            <input type="text" id="write-input" placeholder="Nhập thuật ngữ..." style="max-width: 400px; padding: 18px; font-size: 18px;" autocomplete="off">
            <div style="margin-top: 15px;"><button class="btn" id="check-write-btn" onclick="checkWrite()">Kiểm tra</button></div>
            <div id="write-feedback" class="feedback"></div>
            <button class="btn hidden" id="next-write-btn" style="margin-top:15px" onclick="nextCard('write')">Tiếp theo ➡</button>
        </div>`;

    // Focus the input
    setTimeout(() => {
        const input = document.getElementById('write-input');
        if (input) input.focus();
    }, 10);
}

function checkWrite() {
    const feedback = document.getElementById('write-feedback');
    const nextBtn = document.getElementById('next-write-btn');
    if (!feedback || (nextBtn && !nextBtn.classList.contains('hidden'))) return;

    const input = document.getElementById('write-input').value.trim().toLowerCase();
    const correct = currentCards[currentIndex].term.trim().toLowerCase();

    if (input === correct) {
        feedback.innerHTML = "<span class='correct'>✅ Chính xác!</span>";
    } else {
        feedback.innerHTML = `<span class='wrong'>❌ Sai! Đáp án: ${currentCards[currentIndex].term}</span>`;
    }
    nextBtn.classList.remove('hidden');

    const checkBtn = document.getElementById('check-write-btn');
    if (checkBtn) checkBtn.disabled = true;
}

