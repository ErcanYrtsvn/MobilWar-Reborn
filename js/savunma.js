document.addEventListener("DOMContentLoaded", () => { const defensePanel = document.getElementById("savunmaPanel");

const defenses = [ { name: "Kale", cost: 100, duration: 10, level: 1 }, { name: "Okçu Kulesi", cost: 150, duration: 12, level: 1 }, { name: "Yağ Kazanı", cost: 120, duration: 14, level: 1 }, { name: "Surlar", cost: 180, duration: 16, level: 1 }, { name: "Demir Kapı", cost: 200, duration: 18, level: 1 } ];

let gold = window.gold || 1000;

function updateResources() { const goldEl = document.getElementById("gold"); if (goldEl) goldEl.innerText = gold; }

defenses.forEach((def, index) => { const div = document.createElement("div"); div.className = "structure";

const levelSpan = document.createElement("span");
levelSpan.id = `savunma${index}Level`;
levelSpan.innerText = def.level;

const timerSpan = document.createElement("span");
timerSpan.id = `savunma${index}Timer`;
timerSpan.className = "countdown";

const button = document.createElement("button");
button.innerText = `Geliştir (${def.cost} Altın, ${def.duration} sn)`;
button.onclick = () => {
  if (gold >= def.cost) {
    gold -= def.cost;
    updateResources();

    let timeLeft = def.duration;
    timerSpan.innerText = ` Geliştirme başlatıldı: ${timeLeft} sn`;

    const interval = setInterval(() => {
      timeLeft--;
      if (timeLeft > 0) {
        timerSpan.innerText = ` Kalan süre: ${timeLeft} sn`;
      } else {
        clearInterval(interval);
        def.level++;
        levelSpan.innerText = def.level;
        timerSpan.innerText = ` ✅ Geliştirildi!`;
      }
    }, 1000);
  } else {
    alert("Yetersiz altın!");
  }
};

div.innerHTML = `
  <b>${def.name}</b> (Seviye <span id="savunma${index}Level">${def.level}</span>)
`;
div.appendChild(button);
div.appendChild(timerSpan);

defensePanel.appendChild(div);

});

updateResources(); });

