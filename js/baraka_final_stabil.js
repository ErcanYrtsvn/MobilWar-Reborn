
const units = [
    { name: "🕊️ Casus Kuş", cost: 100, food: 200, duration: 30 },
    { name: "⛏️ Cüce", cost: 200, food: 450, duration: 90 },
    { name: "🚛 Yük Arabası", cost: 1000, food: 1000, duration: 110 },
    { name: "🏹 Elf", cost: 400, food: 600, duration: 120 },
    { name: "👣 Gnom", cost: 1600, food: 1600, duration: 140 },
    { name: "🔮 Şaman", cost: 2000, food: 2000, duration: 160 },
    { name: "🐎 Süvari", cost: 1200, food: 2400, duration: 170 },
    { name: "🎯 Mancınık", cost: 6000, food: 12000, duration: 270 },
    { name: "🦄 Pegasus", cost: 4000, food: 3200, duration: 240 },
    { name: "👹 Ogre", cost: 18000, food: 18000, duration: 320 },
    { name: "🐉 Ejderha", cost: 40000, food: 24000, duration: 420 },
    { name: "☠️ Kaos", cost: 100000, food: 100000, duration: 7200 }
];

let currentUnit = null;
let countdownInterval = null;

function updateResourcesDisplay() {
    document.getElementById("gold").textContent = gold;
    document.getElementById("food").textContent = food;
}

function createUnitUI(unit) {
    const container = document.createElement("div");
    container.className = "unit";

    const title = document.createElement("h3");
    title.textContent = `${unit.name}`;
    container.appendChild(title);

    const input = document.createElement("input");
    input.type = "number";
    input.placeholder = "Adet";
    input.min = "1";
    input.value = "";
    container.appendChild(input);

    const produceButton = document.createElement("button");
    produceButton.textContent = `Üret (${unit.cost} 💰, ${unit.food} 🍖, ⏳ ${formatDuration(unit.duration)})`;
    produceButton.className = "produce-btn";
    container.appendChild(produceButton);

    const status = document.createElement("div");
    status.className = "status";
    container.appendChild(status);

    produceButton.addEventListener("click", () => {
        const amount = parseInt(input.value);
        if (!amount || amount <= 0) return;

        const totalGold = unit.cost * amount;
        const totalFood = unit.food * amount;
        const totalDuration = unit.duration * amount;

        if (gold < totalGold || food < totalFood || currentUnit) return;

        gold -= totalGold;
        food -= totalFood;
        updateResourcesDisplay();

        currentUnit = {
            unit,
            amount,
            remaining: totalDuration,
            container,
            status,
            cancelButton: null
        };

        startCountdown(currentUnit);
    });

    return container;
}

function startCountdown(task) {
    task.status.innerHTML = `⏳ ${task.unit.name} (${task.amount}x) kalan süre: ${formatDuration(task.remaining)}`;

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "İptal";
    cancelButton.className = "cancel-btn";
    task.status.appendChild(cancelButton);

    cancelButton.addEventListener("click", () => {
        gold += task.unit.cost * task.amount;
        food += task.unit.food * task.amount;
        updateResourcesDisplay();
        clearInterval(countdownInterval);
        task.status.innerHTML = "";
        task.container.querySelector("input").value = "";
        currentUnit = null;
    });

    countdownInterval = setInterval(() => {
        task.remaining--;
        if (task.remaining <= 0) {
            clearInterval(countdownInterval);
            task.status.textContent = `${task.unit.name} (${task.amount}x) üretildi!`;
            currentUnit = null;
        } else {
            task.status.childNodes[0].textContent = `⏳ ${task.unit.name} (${task.amount}x) kalan süre: ${formatDuration(task.remaining)}`;
        }
    }, 1000);
}

function formatDuration(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}dk ${s}sn`;
}

document.addEventListener("DOMContentLoaded", () => {
    window.gold = 1000;
    window.food = 1000;
    updateResourcesDisplay();

    const barakaContainer = document.getElementById("baraka");
    units.forEach(unit => {
        barakaContainer.appendChild(createUnitUI(unit));
    });
});
