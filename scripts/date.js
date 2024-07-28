// Initialize date
let currentDate = new Date(2019, 7, 12); // August 12, 2019
const endDate = new Date(2020, 6, 7); // July 7, 2020

// Default card time consumption in days
const defaultTimeConsumption = 3;

function updateDate(days) {
	// Calculate the new date
	const newDate = new Date(currentDate);
	newDate.setDate(newDate.getDate() + days);

	// Ensure the date doesn't exceed the end date
	if (newDate > endDate) {
		newDate = new Date(endDate);
	}

	currentDate = newDate;

	// Update the display
	updateDateDisplay();
}

function updateDateDisplay() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const formattedDate = `${year}年${month}月${day}日`;
    document.getElementById("dateDisplay").innerText = `日历: ${formattedDate}`;
    updateCountdowns();
}

let countdowns = [];

function updateCountdowns() {
	const countdownDisplay = document.getElementById("countdownDisplay");
	countdownDisplay.innerHTML = "";

	countdowns.forEach((countdown) => {
		const daysLeft = Math.ceil(
			(countdown.date - currentDate) / (1000 * 60 * 60 * 24)
		);
		const countdownText = `${countdown.name} Countdown: ${daysLeft} days`;
		countdownDisplay.innerHTML += `<div>${countdownText}</div>`;
	});
}

function addCountdown(name, date) {
	countdowns.push({ name, date: new Date(date) });
	updateCountdowns();
}

function removeCountdown(name) {
	countdowns = countdowns.filter((countdown) => countdown.name !== name);
	updateCountdowns();
}

function getCardTimeConsumption(card) {
	return card.timeConsumption || defaultTimeConsumption;
}

window.date = {
	updateDate,
	addCountdown,
	removeCountdown,
	getCardTimeConsumption,
};