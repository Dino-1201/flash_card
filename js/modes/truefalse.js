// --- MODE: ĐÚNG/SAI ---
function renderTrueFalse(container) {
    if (currentIndex >= currentCards.length) return container.innerHTML = "<div class='test-results'><h2>🎉 Hoàn thành!</h2><button class='btn' onclick='startMode(\"truefalse\")'>Làm lại</button></div>";
    const realCard = currentCards[currentIndex];
    const isShowCorrect = Math.random() > 0.5;
    window.currentTFState = isShowCorrect; // Store for shortcuts
    let displayDef = realCard.def;
    if (!isShowCorrect && currentCards.length > 1) {
        let other;
        do { other = currentCards[Math.floor(Math.random() * currentCards.length)]; } while (other === realCard);
        displayDef = other.def;
    }
    container.innerHTML = `
        <div style="text-align: center;">
            <div style="margin-bottom: 15px; color: var(--text-muted); font-size: 14px;">Câu ${currentIndex + 1} / ${currentCards.length}</div>
            <h3 class="quiz-question">✔️ "${realCard.term}" có nghĩa là:</h3>
            <div style="background: var(--bg-card); padding: 25px; margin: 20px auto; border-radius: 12px; max-width: 500px; border: 1px solid var(--border);"><p style="font-size: 20px;">${displayDef}</p></div>
            <div style="margin-top: 20px;">
                <button class="btn btn-known" id="tf-true-btn" style="margin-right: 15px" onclick="checkTF(${isShowCorrect}, true)">✅ Đúng</button>
                <button class="btn btn-unknown" id="tf-false-btn" onclick="checkTF(${isShowCorrect}, false)">❌ Sai</button>
            </div>
            <div id="tf-feedback" class="feedback"></div>
            <button class="btn hidden" id="next-tf-btn" style="margin-top:15px" onclick="nextCard('truefalse')">Tiếp theo ➡</button>
        </div>`;
}

function checkTF(isActuallyCorrect, userChoice) {
    const feedback = document.getElementById('tf-feedback');
    const nextBtn = document.getElementById('next-tf-btn');
    if (!feedback || (nextBtn && !nextBtn.classList.contains('hidden'))) return; // Don't check if already answered

    const realCard = currentCards[currentIndex];
    if (isActuallyCorrect === userChoice) { feedback.innerHTML = "<span class='correct'>✅ Giỏi lắm!</span>"; }
    else {
        feedback.innerHTML = `<span class='wrong'>❌ Không chính xác! <br> ${realCard.term} có nghĩa là: <strong>${realCard.def}</strong></span>`;
    }
    nextBtn.classList.remove('hidden');

    // Highlight choice
    const trueBtn = document.getElementById('tf-true-btn');
    const falseBtn = document.getElementById('tf-false-btn');
    if (userChoice) {
        trueBtn.style.opacity = '1';
        falseBtn.style.opacity = '0.5';
    } else {
        trueBtn.style.opacity = '0.5';
        falseBtn.style.opacity = '1';
    }
}

