document.addEventListener("DOMContentLoaded", () => {
  const defensePanel = document.getElementById("savunmaPanel");

  const defenses = [
    {
      name: "🏰 Kale",
      cost: 300,
      stone: 200,
      duration: 300,
      level: 1,
      power: 200
    },
    {
      name: "🏹 Okçu Kulesi",
      cost: 400,
      stone: 250,
      duration: 360,
      level: 1,
      power: 150
    },
    {
      name: "🔥 Yağ Kazanı",
      cost: 500,
      stone: 150,
      duration: 420,
      level: 1,
      power: 180
    },
    {
      name: "🛡️ Surlar",
      cost: 600,
      stone: 300,
      duration: 480,
      level: 1,
      power: 220
    },
    {
      name: "🚪 Demir Kapı",
      cost: 700,
      stone: 400,
      duration: 540,
      level: 1,
      power: 250
    }
  ];

  let gold = parseInt(document.getElementById("gold").innerText);
  let stone = parseInt(document.getElementById("stone").innerText);
  let totalDefensePower = 0;

  function updateResources() {
    document.getElementById("gold").innerText = gold;
    document.getElementById("stone").innerText = stone;
  }

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}dk ${s}sn`;
  }

  defensePanel.innerHTML = `<h3 style="color: gold;">Toplam Savunma Puanı: <span id="totalPower">0</span></h3>`;

  defenses.forEach((unit, index) => {
    const div = document.createElement("div");
    div.className = "structure";

    const levelSpan = document.createElement("span");
    levelSpan.id = `defense${index}Level`;
    levelSpan.innerText = unit.level;

    const timerSpan = document.createElement("span");
    timerSpan.id = `defense${index}Timer`;
    timerSpan.className = "countdown";

    const button = document.createElement("button");
    button.innerText = `Geliştir (💰${unit.cost}, 🪨${unit.stone}, ⏳${formatTime(unit.duration)})`;
    button.onclick = () => {
      if (gold >= unit.cost && stone >= unit.stone) {
        gold -= unit.cost;
        stone -= unit.stone;
        updateResources();

        let timeLeft = unit.duration;
        timerSpan.innerText = `⏳ ${formatTime(timeLeft)}`;
        button.disabled = true;

        const interval = setInterval(() => {
          timeLeft--;
          timerSpan.innerText = `⏳ ${formatTime(timeLeft)}`;
          if (timeLeft <= 0) {
            clearInterval(interval);
            unit.level++;
            totalDefensePower += unit.power;
            levelSpan.innerText = unit.level;
            document.getElementById("totalPower").innerText = totalDefensePower;
            timerSpan.innerText = `✅ Geliştirildi!`;
            button.disabled = false;
          }
        }, 1000);
      } else {
        alert("Yetersiz kaynak!");
      }
    };

    div.innerHTML = `<b>${unit.name}</b> (Seviye `;
    div.appendChild(levelSpan);
    div.innerHTML += `)`;
    div.appendChild(button);
    div.appendChild(timerSpan);

    defensePanel.appendChild(div);
  });

  updateResources();
});
