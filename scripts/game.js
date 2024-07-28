function startGame() {
	const currentCard = window.drawCard();
	displayCard(currentCard);

	// Hide the continue button after drawing the card
	document.getElementById("continue-button").style.display = "none";
}

function canShowChoice(choice) {
	const requireTags = choice.requireTags;
	if (!requireTags) {
		return true;
	}

	for (const [tag, condition] of Object.entries(requireTags)) {
		const tagValue = getTagValue(tag);
		console.log(tagValue);
		if (!evaluateCondition(tagValue, condition)) {
			return false;
		}
	}
	return true;
}

function evaluateCondition(value, condition) {
	const operator = condition.charAt(0);
	const threshold = parseFloat(condition.slice(1));
	switch (operator) {
		case ">":
			return value > threshold;
		case "<":
			return value < threshold;
		case "=":
			return value === threshold;
		default:
			return false;
	}
}

function displayCard(card) {
	const cardDisplay = document.getElementById("card-display");
	const choicesHtml = card.choices
		.map((choice, index) => ({ ...choice, originalIndex: index }))
		.filter((choice) => canShowChoice(choice))
		.map(
			(choice) =>
				`<button class="choice-button" data-index="${choice.originalIndex}">${choice.text}</button>`
		)
		.join("");

	cardDisplay.innerHTML = `
    <div class="card">
      <h2>${card.name}</h2>
      <p>${card.description}</p>
      <div class="choices">${choicesHtml}</div>
    </div>
  `;

	const buttons = cardDisplay.querySelectorAll(".choice-button");
	buttons.forEach((button) => {
		button.addEventListener("click", (event) => {
			const originalIndex = event.target.getAttribute("data-index");
			makeChoice(card.choices[originalIndex], card);
		});
	});
}

function makeChoice(choice, card) {
	const changes = choice.effects.map((effect) => applyEffect(effect)); // 收集每个变化

	const resultText = document.createElement("div"); // 使用 <div> 代替 <p> 以便包含多个 <p>
	resultText.innerHTML = `<br><i>${choice.text}</i>`;
	const descriptionText = document.createElement("p");
	descriptionText.innerHTML = `${choice.description}`;
	resultText.appendChild(descriptionText);

	// 显示具体的 tag 变化
	changes.forEach((change) => {
		const tagConfig = getConfig(change.tagPath);
		if (!tagConfig.hidden) {
			// 仅显示未隐藏的 tag
			const changeText = document.createElement("p");
			changeText.innerHTML = `${change.tagPath}: ${
				change.numericValue > 0 ? "+" : ""
			}${change.numericValue}`;
			resultText.appendChild(changeText);
		}
	});

	const cardDisplay = document.getElementById("card-display");
	cardDisplay.innerHTML = "";
	cardDisplay.appendChild(resultText);

	// 获取卡牌的时间消耗
	const timeConsumption = window.date.getCardTimeConsumption(card);

	// 更新按钮文本
	const continueButton = document.getElementById("continue-button");
	if (timeConsumption > 0) {
		continueButton.innerText = `过了${timeConsumption}天`;
	} else {
		continueButton.innerText = "继续";
	}
	continueButton.style.display = "block";

	// 按下按钮后更新日期
	continueButton.onclick = () => {
		window.date.updateDate(timeConsumption);
		startGame();
	};

	updateTagsDisplay();

	if (choice.consumeCard) {
		window.consumeCard(card);
	}
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
	const tagsDisplay = document.getElementById("tags-display");
	tagsDisplay.innerHTML = "";
	if (
		typeof window.tags === "object" &&
		window.tags !== null &&
		typeof window.tagsConfig === "object" &&
		window.tagsConfig !== null
	) {
		const allTags = [];
		collectTags(window.tags, "", allTags);
		allTags.sort((a, b) => b.priority - a.priority);
		allTags.forEach((tag) => {
			displayTag(tagsDisplay, tag.path, window.tags, window.tagsConfig);
		});
	}

	// Check for bad ending conditions
	const happiness = getValue("状态.快乐");
	const energy = getValue("状态.精力");
	if (happiness <= 0) {
		endGame("bad_happiness");
	} else if (energy <= 0) {
		endGame("bad_energy");
	}

	// Check for winning conditions
	const academics = getValue("技能.英语");
	const social = getValue("技能.语文");
	const math = getValue("技能.数学");
	if (academics >= 1200 && social >= 1200 && math >= 1200) {
		endGame("good");
	}
}

function endGame(result) {
	const cardDisplay = document.getElementById("card-display");
	if (result === "bad_happiness") {
		// Bad ending message for happiness zero
		cardDisplay.innerHTML = `
          <h2>你失败了！</h2>
          <br><p>快乐归零，道心破碎</p>
      `;
	} else if (result === "bad_energy") {
		// Bad ending message for energy zero
		cardDisplay.innerHTML = `
          <h2>你失败了！</h2>
          <br><p>精力耗尽，疲惫不堪</p>
      `;
	} else if (result === "good") {
		// Good ending message
		cardDisplay.innerHTML = `
          <h2>你赢了！</h2>
          <p>在英语、语文和数学三大科目中都取得了高分。这比现实简单多了吧。</p>
      `;
	}
	document.getElementById("continue-button").style.display = "none";
	document.getElementById("main-menu-button").style.display = "block";
	document.getElementById("main-menu-button").onclick = function () {
		window.location.reload();
	};
}

function collectTags(tags, currentPath, allTags) {
	for (const key in tags) {
		const newPath = currentPath ? `${currentPath}.${key}` : key;
		const tagConfig = getConfig(newPath);
		if (
			typeof tags[key] === "object" &&
			tags[key] !== null &&
			tagConfig.value === undefined
		) {
			collectTags(tags[key], newPath, allTags);
		} else {
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
	const keys = path.split(".");
	let current = window.tagsConfig;
	for (const key of keys) {
		if (!current[key]) return {};
		current = current[key];
	}
	return current;
}

function getValue(path) {
	const keys = path.split(".");
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

	const tagDiv = document.createElement("div");
	tagDiv.innerText = `${path}: ${tagValue}`;
	if (tagConfig.color) {
		tagDiv.style.color = tagConfig.color;
	}
	container.appendChild(tagDiv);
}

function getTagValue(path) {
	const keys = path.split(".");
	let current = window.tags;
	for (const key of keys) {
		if (!current[key]) return 0;
		current = current[key];
	}
	return current.value || 0;
}

document.getElementById("continue-button").onclick = startGame;