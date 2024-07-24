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
    button.addEventListener('click', () => makeChoice(card.choices[index].effects, card.choices[index].text, card.choices[index].description));
  });
}

function makeChoice(effects, choiceText, description) {
  const changes = effects.map(effect => applyEffect(effect)); // 收集每个变化

  const resultText = document.createElement('div'); // 使用 <div> 代替 <p> 以便包含多个 <p>
  resultText.innerHTML = `<br>${choiceText}`
  const descriptionText = document.createElement('p');
  descriptionText.innerHTML = `${description}`
  resultText.appendChild(descriptionText);

  // 显示具体的 tag 变化
  changes.forEach(change => {
    const tagConfig = getConfig(change.tagPath);
    if (!tagConfig.hidden) { // 仅显示未隐藏的 tag
      const changeText = document.createElement('p');
      changeText.innerHTML = `${change.tagPath}: ${change.numericValue > 0 ? '+' : ''}${change.numericValue}`;
      resultText.appendChild(changeText);
    }
  });

  const cardDisplay = document.getElementById('card-display');
  cardDisplay.innerHTML = '';
  cardDisplay.appendChild(resultText);

  document.getElementById('continue-button').style.display = 'block';

  updateTagsDisplay();
}

function applyEffect(effect) {
  const [tagPath, valueWithDot] = effect.split(/(\.\-?\d+$)/); // 修改正则表达式，允许负号
  const value = valueWithDot.slice(1); // 去掉前面的点
  const numericValue = parseInt(value, 10); // 将值转换为整数
  const tag = window.updateTag(tagPath, numericValue);
  return { tagPath, numericValue };
}

function updateTagsDisplay() {
  console.log(window.tagsConfig);
  const tagsDisplay = document.getElementById('tags-display');
  tagsDisplay.innerHTML = '';
  if (typeof window.tags === 'object' && window.tags !== null && typeof window.tagsConfig === 'object' && window.tagsConfig !== null) {
    const allTags = [];

    collectTags(window.tags, '', allTags);

    allTags.sort((a, b) => b.priority - a.priority);

    allTags.forEach(tag => {
      displayTag(tagsDisplay, tag.path, window.tags, window.tagsConfig);
    });
  }
}

function collectTags(tags, currentPath, allTags) {
  for (const key in tags) {
    console.log('currentPath' + currentPath);
    const newPath = currentPath ? `${currentPath}.${key}` : key;
    const tagConfig = getConfig(newPath);
    if (typeof tags[key] === 'object' && tags[key] !== null && tagConfig.value === undefined) {
      collectTags(tags[key], newPath, allTags);
    } else {
      console.log(tags);
      console.log(newPath);
      console.log(getValue(newPath));
      const tagValue = getValue(newPath);
      if (!tagConfig.hidden && tagValue !== 0) {
        allTags.push({
          path: newPath,
          priority: tagConfig.priority || 0,
          value: tagValue,
        });
      }
    }
  }
}

function getConfig(path) {
  const keys = path.split('.');
  let current = window.tagsConfig;
  for (const key of keys) {
    if (!current[key]) return {};
    current = current[key];
  }
  return current;
}

function getValue(path) {
  const keys = path.split('.');
  let current = window.tags;
  for (const key of keys) {
    if (!current[key]) return 0;
    current = current[key];
  }
  return current.value || 0;
}

function displayTag(container, path) {
  const tagConfig = getConfig(path);
  const tagValue = getValue(path);

  const tagDiv = document.createElement('div');
  tagDiv.innerText = `${path}: ${tagValue}`;
  if (tagConfig.color) {
    tagDiv.style.color = tagConfig.color;
  }
  container.appendChild(tagDiv);
}

document.getElementById('continue-button').onclick = startGame;