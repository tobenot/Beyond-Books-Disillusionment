// game.js
import { drawCard } from './cardPool.js';
import { updateTag,tags } from './tagManager.js';

function startGame() {
  const currentCard = drawCard();
  displayCard(currentCard);
}

function displayCard(card) {
  const cardDisplay = document.getElementById('card-display');
  cardDisplay.innerHTML = `
    <h2>${card.name}</h2>
    <p>${card.description}</p>
  `;

  card.choices.forEach(choice => {
    const button = document.createElement('button');
    button.textContent = choice.text;
    button.addEventListener('click', () => makeChoice(choice.effect));
    cardDisplay.appendChild(button);
  });
}

function makeChoice(effect) {
  applyEffect(effect);
  const nextCard = drawCard();
  displayCard(nextCard);
}

function applyEffect(effect) {
    // 分割effect字符串并处理各个部分
    const parts = effect.split('.');
    const action = parts[0]; // 第一个部分是action
    const value = parts.pop(); // 最后一个部分是value
    const path = parts.slice(1).join('.'); // 剩余的部分组成path
  
    // 执行相应的操作
    switch (action) {
      case 'increment':
        updateTag(path, parseInt(value));
        break;
      case 'decrement':
        updateTag(path, -parseInt(value));
        break;
      case 'changeScene':
        loadScene(path);
        break;
      default:
        break;
    }
    
    // 更新标签显示
    updateTagsDisplay();
  }  

function loadScene(scene) {
  // Implementation for loading new scene cards
}

function updateTagsDisplay() {
    console.log('updateTagsDisplay');
  const tagsDisplay = document.getElementById('tags-display');
  tagsDisplay.innerHTML = '';
  console.log('updateTagsDisplay tags = ', tags);
  if (typeof tags === 'object' && tags !== null) {
    console.log('updateTagsDisplay', tags);
    for (const key in tags) {
        console.log('updateTagsDisplay', key);
      if (typeof tags[key] === 'object') {
        displayTag(tagsDisplay, key, tags[key]);
      }
    }
  }  
}

function displayTag(container, path, tag) {
    console.log('displayTag', path, tag);
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

startGame();