// startup.js
const scripts = [
    { url: 'scripts/cardPool.js', alias: '卡池(这里卡住就是网炸了，刷新)' },
    { url: 'scripts/tagManager.js', alias: '标签管理器' },
    { url: 'scripts/game.js', alias: '游戏主程序' }
  ];
  
  let loadedScriptsCount = 0;
  
  async function loadScript(url, alias) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.type = 'module';
      script.src = `${url}?v=${new Date().getTime()}`;
      script.defer = true;
      script.onload = () => {
        loadedScriptsCount++;
        updateProgress(alias, scripts.length);
        resolve(url);
      };
      script.onerror = () => {
        loadedScriptsCount++;
        updateProgress(alias, scripts.length);
        reject(url);
      };
      document.body.appendChild(script);
    });
  }
  
  function updateProgress(alias, totalScripts) {
    const progress = (loadedScriptsCount / totalScripts) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
    document.getElementById('progressText').innerText = `正在加载${alias}... (${loadedScriptsCount}/${totalScripts})`;
  }
  
  async function initializeApp() {
    console.log('startup.js initializeApp start');
  
    try {
      const loadingIndicator = document.getElementById('loadingIndicator');
      
      localStorage.removeItem('tags'); // Clear tags on reload
  
      for (const script of scripts) {
        await loadScript(script.url, script.alias);
      }
  
      loadingIndicator.style.display = 'none';
      //document.getElementById('menu').style.display = 'flex';
  
    } catch (error) {
      console.error("Error loading scripts: ", error);
    }
  
    console.log('startup.js initializeApp finished');
  
    document.addEventListener('touchmove', function (event) {
      let targetElement = event.target;
  
      if (targetElement !== document.body && targetElement !== document.documentElement) {
        return;
      }
  
      event.preventDefault();
    }, { passive: false });

    initModal();
    initMainMenu();
  }

function initModal() {
  const mainMenuButtons = {
      creatorButton: "制作者的话内容...",
      changelogButton: "更新日志内容...",
  };

  const popupModal = document.getElementById("popup-modal");
  const popupText = document.getElementById("popup-text");
  const closePopup = document.getElementById("close-popup");

  Object.keys(mainMenuButtons).forEach(buttonId => {
      console.log(buttonId);
      document.getElementById(buttonId).addEventListener("click", () => {
          popupText.innerHTML = mainMenuButtons[buttonId];
          popupModal.style.display = "block";
      });
  });

  closePopup.addEventListener("click", () => {
      popupModal.style.display = "none";
  });

  window.addEventListener("click", event => {
      if (event.target == popupModal) {
          popupModal.style.display = "none";
      }
  });
}

function initMainMenu() {
  document.getElementById('startGameButton').addEventListener('click', () => {
      document.getElementById('main-menu').style.display = 'none';
      document.getElementById('game-container').style.display = 'flex';
  });

  document.getElementById('cardlistButton').addEventListener('click', () => {
      document.getElementById('main-menu').style.display = 'none';
      document.getElementById('card-list-menu').style.display = 'block';
      loadCardList();
  });

  document.getElementById('backButton').addEventListener('click', () => {
      document.getElementById('card-list-menu').style.display = 'none';
      document.getElementById('main-menu').style.display = 'flex';
  });
}

function loadCardList() {
  const cardListContent = document.getElementById('card-list-content');
  const cards = [
      { name: "卡包1", description: "这是卡包1的内容..." },
      { name: "卡包2", description: "这是卡包2的内容..." },
      { name: "卡包3", description: "这是卡包3的内容..." }
  ];

  cardListContent.innerHTML = ""; // Clear existing content

  cards.forEach(card => {
      const cardButton = document.createElement('button');
      cardButton.textContent = card.name;
      cardButton.addEventListener('click', () => {
          showCardPopup(card.description);
      });
      cardListContent.appendChild(cardButton);
  });
}

function showCardPopup(description) {
  const popupModal = document.getElementById("popup-modal");
  const popupText = document.getElementById("popup-text");

  popupText.innerHTML = description;
  popupModal.style.display = "block";
}

function isCarrotTest() {
  return new URLSearchParams(window.location.search).has('carrot');
}
  
initializeApp();

export { initializeApp };  