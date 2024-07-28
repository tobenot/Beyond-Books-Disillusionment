let cardPool = [];

// 示例卡牌配置
/*
{
      "id": "1",
      "name": "英语课",
      "type": "event",
      "cardSet": "基础",
      "description": "英语……老天赏饭吃。",
      "requireTags":{ // 条件不满足的不进卡池 缺省表示无条件
        "状态.精力": ">1",
        "状态.快乐": ">1"
      }
      "baseWeight": 1.0, // 基础权重
      "weightMultipliers": {
        "状态.快乐": 1.2 // 标签乘这个数再乘到权重上
      },
      "mustDraw": true, // 是否必然抽到 可缺省 常用于开局事件或者连续事件
      "priority": 0, // 必然抽到的优先级（数字越高，优先级越高） 可缺省
      "timeConsumption": 0, // 消耗多少天 可缺省
      "dateRestrictions": { // 日期限制 可任意缺省，after是>=
        "after": "2019-08-15",
        "before": "2020-06-01",
        "between": ["2019-09-01", "2020-05-01"]
      },
      "choices": [
        {
          "text": "自学数学",
          "conditions": { // 显示选项的条件 可缺省
            "状态.精力": ">2",
            "状态.快乐": ">2" 
          },
		  "specialMechanism": "selfLearning", // 选了这个选项后触发特殊函数名，可缺省
          "effects": [
            "技能.数学.10",
            "状态.精力.-1",
            "状态.快乐.-1"
          ],
          "consumeCard": true, // 选择此选项时消耗该卡片 可缺省
          "description": "什么课学什么科说着好听，但我要集中精力。"
        },
        {
          "text": "玩",
          "effects": [
            "状态.快乐.2"
          ],
          "description": "乐。"
        }
      ]
    },
*/

async function loadCardData() {
	// Load card configuration from cards.json
	const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
	fetch(`config/cards.json?v=${timestamp}`)
		.then((response) => response.json())
		.then((data) => {
			console.warn("Card pool loaded.");
			cardPool = data;
			if (cardPool.length === 0) {
				console.warn("Warning: Card pool is empty.");
			}
		})
		.catch((error) => {
			console.error("Error loading cards:", error);
		});
}

function canDrawCard(card, tags) {
	const requireTags = card.requireTags;
	const dateRestrictions = card.dateRestrictions;
	if (!requireTags && !dateRestrictions) {
		return true;
	}

	// 检查日期限制
	if (dateRestrictions) {
		const currentDate = window.dateTime.getCurrentDate();
		if (
			dateRestrictions.after &&
			new Date(dateRestrictions.after) > currentDate
		) {
			console.log("时间限制不满足",new Date(dateRestrictions.after)," sdasda",currentDate);
			return false;
		}
		if (
			dateRestrictions.before &&
			new Date(dateRestrictions.before) < currentDate
		) {
			return false;
		}
		if (dateRestrictions.between) {
			const startDate = new Date(dateRestrictions.between[0]);
			const endDate = new Date(dateRestrictions.between[1]);
			if (currentDate < startDate || currentDate > endDate) {
				return false;
			}
		}
	}

	// 检查标签限制
	if (requireTags) {
		for (const [tag, condition] of Object.entries(requireTags)) {
			const tagValue = getTagValue(tag);
			if (!evaluateCondition(tagValue, condition)) {
				return false;
			}
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

// 记录最近抽到的三张卡的ID
const recentDrawnCards = [];

// 更新drawCard函数
function drawCard() {
	const tags = window.tags;
	const weightedCards = cardPool
		.filter((card) => canDrawCard(card, tags))
		.map((card) => {
			let weight = card.baseWeight;
			for (const [tag, multiplier] of Object.entries(
				card.tagMultipliers || {}
			)) {
				weight *= Math.pow(multiplier, getTagValue(tag));
			}
			if (recentDrawnCards.includes(card.id)) {
				weight *= 0.2;
			}
			return { card, weight };
		});

	if (true) {
		console.log("Card drawing probability table:", weightedCards);
	}

	weightedCards.sort((a, b) => b.weight - a.weight);

	const mustDrawCards = weightedCards
		.filter(({ card }) => card.mustDraw)
		.sort((a, b) => b.card.priority - a.card.priority);
	if (mustDrawCards.length > 0) {
		return mustDrawCards[0].card;
	}

	const totalWeight = weightedCards.reduce(
		(sum, { weight }) => sum + weight,
		0
	);
	let random = Math.random() * totalWeight;

	for (const { card, weight } of weightedCards) {
		if (random < weight) {
			updateRecentDrawnCards(card.id);
			return card;
		}
		random -= weight;
	}
}

// 更新最近抽到的三张卡的记录
function updateRecentDrawnCards(cardId) {
	if (recentDrawnCards.length >= 3) {
		recentDrawnCards.shift(); // 移除最早的一张卡
	}
	recentDrawnCards.push(cardId); // 添加新抽到的卡
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

function consumeCard(card) {
	const cardIndex = cardPool.indexOf(card);
	if (cardIndex > -1) {
		cardPool.splice(cardIndex, 1);
		console.log(
			`Card ${card.name} has been consumed and removed from the pool.`
		);
	} else {
		console.log(`Card ${card.name} is not found in the pool.`);
	}
}

window.drawCard = drawCard;
window.consumeCard = consumeCard;
window.startup_loadCardData = loadCardData;