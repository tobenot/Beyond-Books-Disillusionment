// 解析 CSV 文件的函数
const parseCSV = (csv) => {
    const lines = csv.trim().split('\n');
    const result = [];

    for (let i = 1; i < lines.length; i++) { // 从1开始跳过表头
        const line = lines[i].split(',');
        result.push({
            score: parseInt(line[0]),
            count: parseInt(line[1]),
            cumulative: parseInt(line[2])
        });
    }
    return result;
};

// 根据成绩计算排名的函数
const getRank = (score, scoreData) => {
    for (let i = 0; i < scoreData.length; i++) {
        if (scoreData[i].score === score) {
            return scoreData[i].cumulative;
        }
    }
    // 如果成绩不在表中，返回-1
    return -1;
};

// 异步加载 CSV 文件并处理数据
async function loadScoreData() {
    try {
        const response = await fetch(`config/2020.csv`);
        const csv = await response.text();
        const scoreData = parseCSV(csv);

        return scoreData;
    } catch (error) {
        console.error("Error loading score data:", error);
        return null;
    }
}

async function queryRank(score){
    const scoreData = await loadScoreData();
    if (scoreData) {
        const rank = getRank(score, scoreData);
        console.log(`成绩 ${score} 的排名是 ${rank}`);
        return rank;
    }
    return -1;
}

window.queryRank = queryRank;