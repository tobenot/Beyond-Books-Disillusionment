function startGame() {
  const currentCard = window.drawCard();
  displayCard(currentCard);

  // Hide the continue button after drawing the card
  document.getElementById('continue-button').style.display = 'none';
}

function displayCard(card) {
  const cardDisplay = document.getElementById('card-display');
  cardDisplay.innerHTML = `
    <div class="card">
      <h2>${card.name}</h2>
      <p>${card.description}</p>
      <div class="choices">
        ${card.choices.map(choice => `
          <button class="choice-button">${choice.text}</button>
        `).join('')}
      </div>
    </div>
  `;

  const buttons = cardDisplay.querySelectorAll('.choice-button');
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => makeChoice(card.choices[index].effect, card.choices[index].text));
  });
}

function makeChoice(effect, choiceText) {
  applyEffect(effect);

  const resultText = document.createElement('p');
  resultText.textContent = `你选择了: ${choiceText}. 影响: ${effect}`;

  // Hide the card details and only show the result text and "下一天" button
  const cardDisplay = document.getElementById('card-display');
  cardDisplay.innerHTML = '';
  cardDisplay.appendChild(resultText);

  document.getElementById('continue-button').style.display = 'block';

  updateTagsDisplay();
}

function applyEffect(effect) {
  const parts = effect.split('.');
  const action = parts[0];
  const value = parts.pop();
  const path = parts.slice(1).join('.');

  switch (action) {
    case 'increment':
      window.updateTag(path, parseInt(value));
      break;
    case 'decrement':
      window.updateTag(path, -parseInt(value));
      break;
    case 'changeScene':
      loadScene(path);
      break;
    default:
      break;
  }
}

function loadScene(scene) {
  // Implementation for loading new scene cards
}

function updateTagsDisplay() {
  const tagsDisplay = document.getElementById('tags-display');
  tagsDisplay.innerHTML = '';
  if (typeof window.tags === 'object' && window.tags !== null) {
    for (const key in window.tags) {
      if (typeof window.tags[key] === 'object') {
        displayTag(tagsDisplay, key, window.tags[key]);
      }
    }
  }
}

function displayTag(container, path, tag) {
  if (typeof tag === 'object') {
    for (const key in tag) {
      displayTag(container, `${path}.${key}`, tag[key]);
    }
  } else {
    const tagDiv = document.createElement('div');
    tagDiv.innerText = `${path}: ${tag}`;
    container.appendChild(tagDiv);
  }
}

document.getElementById('continue-button').onclick = startGame;