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
    button.addEventListener('click', () => makeChoice(card.choices[index].effect, card.choices[index].text, card.choices[index].description));
  });
}

function makeChoice(effect, choiceText, description) {
  applyEffect(effect);

  const resultText = document.createElement('p');
  resultText.innerHTML = `${choiceText}.<br><br>${description}`;  

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
    default:
      break;
  }
}

function updateTagsDisplay() {
  console.log(window.tagsConfig);
  const tagsDisplay = document.getElementById('tags-display');
  tagsDisplay.innerHTML = '';
  if (typeof window.tags === 'object' && window.tags !== null && typeof window.tagsConfig === 'object' && window.tagsConfig !== null) {
    const sortedPaths = Object.keys(window.tags).sort((a, b) => {
      const tagA = getConfig(window.tagsConfig, a);
      const tagB = getConfig(window.tagsConfig, b);
      return (tagB.priority || 0) - (tagA.priority || 0);
    });

    sortedPaths.forEach(path => {
      displayTag(tagsDisplay, path, window.tags, window.tagsConfig);
    });
  }
}

function getConfig(config, path) {
  const keys = path.split('.');
  let current = config;
  for (const key of keys) {
    if (!current[key]) return {};
    current = current[key];
  }
  return current;
}

function getValue(tags, path) {
  const keys = path.split('.');
  let current = tags;
  for (const key of keys) {
    if (!current[key]) return 0;
    current = current[key];
  }
  return current.value || 0;
}

function displayTag(container, path, tags, config) {
  const tagConfig = getConfig(config, path);
  const tagValue = getValue(tags, path);

  if (typeof tagConfig === 'object' && tagConfig.value === undefined) {
    for (const key in tagConfig) {
      displayTag(container, `${path}.${key}`, tags, config);
    }
  } else {
    if (tagConfig.hidden) return;
    if (tagValue === 0) return;
    
    const tagDiv = document.createElement('div');
    tagDiv.innerText = `${path}: ${tagValue}`;
    if (tagConfig.color) {
      tagDiv.style.color = tagConfig.color;
    }
    container.appendChild(tagDiv);
  }
}

document.getElementById('continue-button').onclick = startGame;