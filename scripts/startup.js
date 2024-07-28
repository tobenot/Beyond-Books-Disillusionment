// startup.js
const scripts = [
	{ url: "scripts/cardPool.js", alias: "卡池(这里卡住就是网炸了，刷新)" },
	{ url: "scripts/tagManager.js", alias: "标签管理器" },
  	{ url: "scripts/date.js", alias: "日期系统" },
	{ url: "scripts/specialMechanism.js", alias: "特殊机制" },
	{ url: "scripts/rank.js", alias: "计算模块" },
	{ url: "scripts/game.js", alias: "游戏主程序，卡牌配置" },
];

let loadedScriptsCount = 0;

async function loadScript(url, alias) {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		script.type = "module";
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
	document.getElementById("progress").style.width = `${progress}%`;
	document.getElementById(
		"progressText"
	).innerText = `正在加载${alias}... (${loadedScriptsCount}/${totalScripts})`;
}

async function initializeApp() {
	console.log("startup.js initializeApp start");

	try {
		const loadingIndicator = document.getElementById("loadingIndicator");

		localStorage.removeItem("tags"); // Clear tags on reload

		for (const script of scripts) {
			await loadScript(script.url, script.alias);
		}

    await window.startup_loadTagsConfig();
    await window.startup_loadCardData();

		loadingIndicator.style.display = "none";
	} catch (error) {
		console.error("Error loading scripts: ", error);
	}

	console.log("startup.js initializeApp finished");
  document.getElementById('main-menu').style.display = 'flex';

	document.addEventListener(
		"touchmove",
		function (event) {
			let targetElement = event.target;

			if (
				targetElement !== document.body &&
				targetElement !== document.documentElement
			) {
				return;
			}

			event.preventDefault();
		},
		{ passive: false }
	);

	initModal();
	initMainMenu();
}

function initModal() {
	const mainMenuButtons = {
		creatorButton: `
        <p>一直想详细解释心灵世界相关的内容和概念，让大家了解一下心界的伟岸一角。<strong>《不止于纸上的故事：幻灭篇》</strong>就是一次尝试。“幻灭”意味着希望之火虚妄，即便如此，圣人，也即战士们，也会一直向前，一直战斗。</p>
        <p>本作是一个抽卡做选择的游戏，需要构筑各种方法论来尽可能在最终的高考取得更好的成绩。也许像Rougelike。</p>
        <p>我会尽力把游戏性做的好玩。同时本作偏向于严肃游戏类型，也力求对于高三生有用。</p>
        <p><strong>鸣谢与我交流本作的玩家们：</strong>诗学者 半夏 shangui</p>
        <p><strong>致谢与我交流心界的朋友们：</strong>Cecilia 共鸣者 诗学者 段</p>
        <p><strong>敬谢大自然：</strong>心界三角海 无垠草地 银色星空</p>
        <p><strong>作者：</strong>苏敬峰/tobenot</p>
    `,
		changelogButton:  `
        <p>只有比较大的更新在这里展示</p>
        <p><strong>2024年7月28日</strong> 做了主菜单，基本做好了基础机制，做了基础卡包里面的上课部分。你可以靠着一路崩溃考过去。</p>
        <p><strong>2024年7月25日</strong> 抽卡和数值框架搭好</p>
        <p><strong>2024年7月23日</strong> 开坑！</p>
    `,
	};

	const popupModal = document.getElementById("popup-modal");
	const popupText = document.getElementById("popup-text");
	const closePopup = document.getElementById("close-popup");

	Object.keys(mainMenuButtons).forEach((buttonId) => {
		console.log(buttonId);
		document.getElementById(buttonId).addEventListener("click", () => {
			popupText.innerHTML = mainMenuButtons[buttonId];
			popupModal.style.display = "block";
		});
	});

	closePopup.addEventListener("click", () => {
		popupModal.style.display = "none";
	});
}

function initMainMenu() {
	document.getElementById("startGameButton").addEventListener("click", () => {
		document.getElementById("main-menu").style.display = "none";
    window.newGame();
		document.getElementById("game-container").style.display = "flex";
	});

	document.getElementById("cardlistButton").addEventListener("click", () => {
		document.getElementById("main-menu").style.display = "none";
		document.getElementById("card-list-menu").style.display = "flex";
		loadCardList();
	});

	document.getElementById("backButton").addEventListener("click", () => {
		document.getElementById("card-list-menu").style.display = "none";
		document.getElementById("main-menu").style.display = "flex";
	});
}

function loadCardList() {
	const cardListContent = document.getElementById("card-list-content");
	const cards = [
		{ name: "基础卡包（完善中）", description: "所有人的高三都是这样的……<br><br>含开局介绍卡，日常的所有课程，基本的可决策的时机，在几个特定的时间点会有大考验，最终以高考结束游戏。" },
    { name: "方法论中毒卡包（制作中）", description: "有很多人会热衷于寻找方法论，就好像玩文明5的时候先点科技再出兵。<br><br>解锁学乎APP，里面有一大堆各种各样的方法论，可以在实践中慢慢养成。" },
		{ name: "自学卡包（制作中）", description: "如果你问我为什么，我只会说，我需要更多的时间……<br><br>初始解锁自学方法论，如果有‘方法论中毒’卡包，可以解锁学乎APP中自学相关的方法论。" },
    { name: "心界开拓卡包（制作中）", description: "生而为神，自诩圣人。<br><br>需要‘方法论中毒’卡包，有‘记忆宫殿’方法论之后可以在学乎APP上刷到‘漫游想象世界’，以开启心灵世界事件链。<br><br>包含心界开拓初期到心棱域军队时期之前的全部历史事件。" },
		{ name: "飞雁一中的同学卡包（制作中）", description: "小心情伤。<br><br>包含同桌克里琴思、前桌艾琳，前斜桌雷思丽三位同学的日常和感情线。<br><br><i>至于为什么他们的名字是英文译名，请期待《不止于纸上的故事：童年篇》。</i>" },
	];

	cardListContent.innerHTML = ""; // Clear existing content

	cards.forEach((card) => {
		const cardButton = document.createElement("button");
		cardButton.textContent = card.name;
		cardButton.addEventListener("click", () => {
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
	return new URLSearchParams(window.location.search).has("carrot");
}

initializeApp()