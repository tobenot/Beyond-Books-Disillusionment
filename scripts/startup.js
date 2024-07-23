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
  }
  
  function isCarrotTest() {
    return new URLSearchParams(window.location.search).has('carrot');
  }
  
  initializeApp();
  
  export { initializeApp };  