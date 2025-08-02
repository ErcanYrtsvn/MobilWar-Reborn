document.addEventListener("DOMContentLoaded", function () {
  const defenses = [
    { name: "🏰 Kale", cost: 300, stone: 200, duration: 300, level: 1, power: 200 },
    { name: "🏹 Okçu Kulesi", cost: 400, stone: 250, duration: 360, level: 1, power: 150 },
    { name: "🔥 Yağ Kazanı", cost: 500, stone: 150, duration: 420, level: 1, power: 180 },
    { name: "🛡️ Surlar", cost: 600, stone: 300, duration: 480, level: 1, power: 220 },
    { name: "🧱 Demir Kapı", cost: 700, stone: 400, duration: 540, level: 1, power: 250 },
  ];

  let gold = parseInt(document.getElementById("gold").innerText);
  let stone = parseInt(document.getElementById("stone").innerText);
  let savunmaPanel = document.getElementById("savunmaPanel");
  let totalPower = 0;
  let isUpgrading = false;
  let cancelButton;
  let activeInterval;

  function updateResources() {
    document.getElementById("gold").innerText = gold;
    document.getElementById("stone").innerText = stone;
  }

  function updateTotalPower() {
    document.getElementById("savunmaPanel").insertAdjacentHTML("afterbegin",
      `<h3 style="color: gold; font-weight: bold;">Toplam Savunma Puanı: ${totalPower}</h3>`);
  }

  function renderDefenses() {
    savunmaPanel.innerHTML = "";
    updateTotalPower();
    defenses.forEach((defense, index) => {
      const defenseDiv = document.createElement("div");
      defenseDiv.classList.add("structure");
      defenseDiv.innerHTML = `
        <h3>${defense.name} (Seviye ${defense.level})</h3>
        <button id="upgrade-${index}" ${isUpgrading ? "disabled" : ""}>
          Geliştir (${defense.cost} Altın, ${defense.duration / 60} dk)
        </button>
        <div id="timer-${index}" style="margin-top:5px;"></div>
      `;
      savunmaPanel.appendChild(defenseDiv);

      document.getElementById(`upgrade-${index}`).addEventListener("click", () => {
        if (isUpgrading) return;
        if (gold >= defense.cost && stone >= defense.stone) {
          isUpgrading = true;
          gold -= defense.cost;
          stone -= defense.stone;
          updateResources();
          disableAllButtons();
          startCountdown(index, defense);
        } else {
          alert("Yetersiz kaynak!");
        }
      });
    });
  }

  function disableAllButtons() {
    defenses.forEach((_, i) => {
      const btn = document.getElementById(`upgrade-${i}`);
      if (btn) btn.disabled = true;
    });
  }

  function enableAllButtons() {
    defenses.forEach((_, i) => {
      const btn = document.getElementById(`upgrade-${i}`);
      if (btn) btn.disabled = false;
    });
  }

  function startCountdown(index, defense) {
    const timerElement = document.getElementById(`timer-${index}`);
    let remaining = defense.duration;
    timerElement.innerHTML = `⏳ Kalan süre: ${Math.floor(remaining / 60)} dk ${remaining % 60} sn`;

    // İptal butonu oluştur
    cancelButton = document.createElement("button");
    cancelButton.innerText = "❌ İptal Et";
    cancelButton.style.marginTop = "5px";
    timerElement.appendChild(cancelButton);

    cancelButton.addEventListener("click", () => {
      clearInterval(activeInterval);
      gold += defense.cost;
      stone += defense.stone;
      updateResources();
      isUpgrading = false;
      cancelButton.remove();
      timerElement.innerHTML = "";
      renderDefenses();
    });

    activeInterval = setInterval(() => {
      remaining--;
      timerElement.innerHTML = `⏳ Kalan süre: ${Math.floor(remaining / 60)} dk ${remaining % 60} sn`;
      timerElement.appendChild(cancelButton);
      if (remaining <= 0) {
        clearInterval(activeInterval);
        defense.level += 1;
        totalPower += defense.power;
        isUpgrading = false;
        cancelButton.remove();
        renderDefenses();
      }
    }, 1000);
  }

  renderDefenses();
});
