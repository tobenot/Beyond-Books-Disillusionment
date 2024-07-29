const placeholderHandlers = {
	tagValue: (path) => getValue(path),
	otherType: (path) => handleOtherType(path),
	exam100: (path) => exam100(getValue(path)),
	exam150: (path) => exam150(getValue(path)),
    examAll: (path) => examAll(),
};

function replacePlaceholders(template) {
    return template.replace(/\{\{(.*?)\}\}/g, (_, placeholder) => {
        const [type, path] = placeholder.split(":");
        const handler = placeholderHandlers[type];
        return handler ? handler(path) : `{{${placeholder}}}`;
    });
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
    console.log("path = :", path);
	const keys = path.split(".");
	let current = window.tags;
	for (const key of keys) {
		if (!current[key]) return 0;
		current = current[key];
	}
	return current.value || 0;
}

function examTest(value, maxScore) {
    const a = 10000;
    const b = 400;
    let shiftValue = value - 800;
    if (shiftValue < 0) shiftValue = 0;

    // 更精确的 score 计算，避免过早的舍入
    let score =
        maxScore *
        (1 - Math.exp(-shiftValue / a) * (1 - shiftValue / (shiftValue + b)));

    // 确保最终结果在合理范围内，并四舍五入
    return Math.round(Math.min(score, maxScore));
}

function exam100(value) {
    const result = examTest(value, 100);
    console.log(`Value: ${value}, Return Value: ${result}`);
    return result;
}

function exam150(value) {
    const result = examTest(value, 150);
    console.log(`Value: ${value}, Return Value: ${result}`);
    return result;
}

function examAll() {
    const chinese = exam150(getValue("技能.语文"));
    console.log("语文分数: ", chinese);

    const math = exam150(getValue("技能.数学"));
    console.log("数学分数: ", math);

    const english = exam150(getValue("技能.英语"));
    console.log("英语分数: ", english);
    console.log("技能.英语: ", getValue("技能.英语"));
    
    const physics = exam100(getValue("技能.物理"));
    console.log("物理分数: ", physics);

    const chemistry = exam100(getValue("技能.化学"));
    console.log("化学分数: ", chemistry);

    const biology = exam100(getValue("技能.生物"));
    console.log("生物分数: ", biology);

    const total_score = chinese + math + english + physics + chemistry + biology;
    
    console.log("总分: ", total_score);
    
    return total_score;
}


function inverseExamTest(finalScore, maxScore, initialValue = 800, tolerance = 1e-7, maxIterations = 1000) {
    let value = initialValue;
    for (let i = 0; i < maxIterations; i++) {
        let score = examTest(value, maxScore);
        let derivative = examTestDerivative(value, maxScore);
        let newValue = value - (score - finalScore) / derivative;
        if (Math.abs(newValue - value) < tolerance) {
            return newValue;
        }
        value = newValue;
    }
    throw new Error("Failed to converge");
}

function inverseExam100(finalScore) {
    return inverseExamTest(finalScore, 100);
}

function inverseExam150(finalScore) {
    return inverseExamTest(finalScore, 150);
}

function getEffect(effect) {
	const [tagPath, valueWithDot] = effect.split(/(\.\-?\d+$)/); // 修改正则表达式，允许负号
	const value = valueWithDot.slice(1); // 去掉前面的点
	const numericValue = parseInt(value, 10); // 将值转换为整数
	return { tagPath, numericValue };
}

async function gaokao() {
    const continueButton = document.getElementById("continue-button");
    continueButton.style.display = "none";

    const totalScore = examAll();
    const rank = await queryRank(totalScore);
    const resultText = `
        <div>
            高考成绩：<br>
            语文{{exam150:技能.语文}}，数学{{exam150:技能.数学}}，英语{{exam150:技能.英语}}，物理{{exam100:技能.物理}}，化学{{exam100:技能.化学}}，生物{{exam100:技能.生物}}。<br>
            总分：<b>${totalScore}</b><br>
            排名：<b>${rank}</b><br>
            ${totalScore >= 524 ? '达到高分优先投档批' : totalScore >= 410 ? '达到本科批' : '未达到本科批'}
        </div>
    `;

    const resultTextStr = window.specialMechanism.replacePlaceholders(resultText);
    document.getElementById("card-display").innerHTML = resultTextStr;

    window.endGame("gaokao");
}

window.specialMechanism = {
    replacePlaceholders,
    gaokao,
}