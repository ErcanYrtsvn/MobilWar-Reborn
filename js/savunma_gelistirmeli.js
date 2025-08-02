
document.addEventListener("DOMContentLoaded", () => {
    const defensePanel = document.getElementById("savunmaPanel");
    const totalDefenseText = document.createElement("h3");
    totalDefenseText.id = "toplamSavunma";
    totalDefenseText.style.color = "#ffcc00";
    totalDefenseText.innerText = "Toplam Savunma Puanı: 0";
    defensePanel.appendChild(totalDefenseText);

    const defenses = [
        { name: "🏰 Kale", baseCost: 500, baseTime: 120, level: 1, power: 50 },
        { name: "🏹 Okçu Kulesi", baseCost: 300, baseTime: 90, level: 1, power: 30 },
        { name: "🔥 Yağ Kazanı", baseCost: 400, baseTime: 100, level: 1, power: 40 },
        { name: "🛡️ Surlar", baseCost: 350, baseTime: 110, level: 1, power: 35 },
        { name: "🚪 Demir Kapı", baseCost: 450, baseTime: 105, level: 1, power: 45 }
    ];

    let gold = window.gold || 1000;
    let defenseTimers = {};
    let totalPower = 0;

    function updateResources() {
        if (document.getElementById("gold")) {
            document.getElementById("gold").innerText = gold;
        }
    }

    function updateDefensePower() {
        totalPower = defenses.reduce((sum, d) => sum + d.level * d.power, 0);
        totalDefenseText.innerText = "Toplam Savunma Puanı: " + totalPower;
    }

    defenses.forEach((def, index) => {
        const item = document.createElement("div");
        item.className = "defense-item";
        item.style.background = "#3e2b1c";
        item.style.padding = "10px";
        item.style.margin = "10px 0";
        item.style.borderRadius = "6px";

        const title = document.createElement("h4");
        title.innerText = `${def.name} (Seviye ${def.level})`;
        item.appendChild(title);

        const status = document.createElement("span");
        status.style.color = "#ffcc00";

        const upgradeBtn = document.createElement("button");
        upgradeBtn.innerText = `Geliştir (${def.baseCost} Altın, ${def.baseTime} sn)`;
        upgradeBtn.onclick = () => {
            if (defenseTimers[index]) return alert("Zaten geliştiriliyor!");
            if (gold < def.baseCost) return alert("Yetersiz altın!");

            gold -= def.baseCost;
            updateResources();

            let kalanSure = def.baseTime;
            status.innerText = `⏳ Kalan Süre: ${kalanSure} sn`;
            upgradeBtn.disabled = true;

            const interval = setInterval(() => {
                kalanSure--;
                if (kalanSure > 0) {
                    status.innerText = `⏳ Kalan Süre: ${kalanSure} sn`;
                } else {
                    clearInterval(interval);
                    def.level++;
                    title.innerText = `${def.name} (Seviye ${def.level})`;
                    def.baseCost = Math.floor(def.baseCost * 1.2);
                    def.baseTime = Math.floor(def.baseTime * 1.15);
                    upgradeBtn.innerText = `Geliştir (${def.baseCost} Altın, ${def.baseTime} sn)`;
                    upgradeBtn.disabled = false;
                    status.innerText = "✅ Geliştirildi!";
                    delete defenseTimers[index];
                    updateDefensePower();
                }
            }, 1000);
            defenseTimers[index] = interval;
        };

        item.appendChild(upgradeBtn);
        item.appendChild(status);
        defensePanel.appendChild(item);
    });

    updateDefensePower();
});
