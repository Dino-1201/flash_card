// --- MODE: GHÉP THẺ ---
function renderMatch(container) {
    if (currentDeck.cards.length < 2) {
        container.innerHTML = "<p style='text-align:center;'>Cần ít nhất 2 thẻ để chơi ghép thẻ!</p>";
        return;
    }

    const maxPairs = Math.min(6, settingMatchCount);
    const roundCards = shuffle([...currentDeck.cards]).slice(0, Math.min(maxPairs, currentDeck.cards.length));

    matchCards = [];
    roundCards.forEach(card => {
        matchCards.push({ id: card.term + '_term', text: card.term, pairId: card.term, type: 'term' });
        matchCards.push({ id: card.term + '_def', text: card.def, pairId: card.term, type: 'def' });
    });
    shuffle(matchCards);
    matchedPairs = 0;
    selectedCard = null;

    let html = `
        <div style="display:flex; justify-content:space-between; margin-bottom:15px; align-items:center;">
             <div class="match-stats">🎮 Vòng: ${matchRoundCurrent}/${settingMatchRounds}</div>
             <div class="match-stats">🎯 Đã ghép: <span id="match-count">0</span>/${roundCards.length}</div>
        </div>
    `;
    html += `<div class="match-container">`;
    matchCards.forEach((card, idx) => { html += `<div class="match-card" data-index="${idx}" onclick="selectMatchCard(${idx})">${card.text}</div>`; });
    html += `</div>`;
    container.innerHTML = html;
}

function selectMatchCard(index) {
    const card = matchCards[index];
    const cardEl = document.querySelector(`.match-card[data-index="${index}"]`);
    if (cardEl.classList.contains('matched')) return;
    if (selectedCard === null) {
        selectedCard = { index, card };
        cardEl.classList.add('selected');
    } else {
        if (selectedCard.index === index) {
            cardEl.classList.remove('selected');
            selectedCard = null;
            return;
        }
        const prevCardEl = document.querySelector(`.match-card[data-index="${selectedCard.index}"]`);
        if (selectedCard.card.pairId === card.pairId && selectedCard.card.type !== card.type) {
            cardEl.classList.add('matched');
            prevCardEl.classList.add('matched');
            prevCardEl.classList.remove('selected');
            matchedPairs++;
            document.getElementById('match-count').textContent = matchedPairs;

            if (matchedPairs === matchCards.length / 2) {
                setTimeout(() => {
                    if (matchRoundCurrent < settingMatchRounds) {
                        matchRoundCurrent++;
                        renderMatch(document.getElementById('game-area'));
                    } else {
                        document.getElementById('game-area').innerHTML = `
                            <div class="test-results">
                                <h2>🎉 Hoàn thành tất cả vòng chơi!</h2>
                                <p>Bạn đã hoàn thành ${settingMatchRounds} vòng ghép thẻ.</p>
                                <button class="btn" style="margin-top: 20px;" onclick="startMode('match')">🔄 Chơi lại</button>
                            </div>`;
                    }
                }, 500);
            }
        } else {
            cardEl.classList.add('wrong-match');
            prevCardEl.classList.add('wrong-match');
            setTimeout(() => {
                cardEl.classList.remove('wrong-match', 'selected');
                prevCardEl.classList.remove('wrong-match', 'selected');
            }, 500);
        }
        selectedCard = null;
    }
}
