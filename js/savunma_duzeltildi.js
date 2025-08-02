// Savunma sistemine ait güncel JS

let totalDefensePoints = 0; const defenseUnits = [ { name: "Kale", icon: "🏰", cost: 500, time: 300, // 5 dk point: 200, level: 1, upgrading: false }, { name: "Okçu Kulesi", icon: "🌀", cost: 300, time: 360, // 6 dk point: 120, level: 1, upgrading: false }, { name: "Yağ Kazanı", icon: "🔥", cost: 400, time: 420, // 7 dk point: 150, level: 1, upgrading: false }, { name: "Surlar", icon: "🛡️", cost: 350, time: 480, // 8 dk point: 180, level: 1, upgrading: false }, { name: "Demir Kapı", icon: "🛋️", cost: 450, time: 540, // 9 dk point: 160, level: 1, upgrading: false } ];

function formatTime(seconds) { const m = String(Math.floor(seconds / 60)).padStart(2, '0'); const s = String(seconds % 60).padStart(2, '0'); return `${m}:${s}`; }

function renderDefense() { const panel = document.getElementById("savunmaPanel"); panel.innerHTML = <h3 style="color: gold">Toplam Savunma Puanı: ${totalDefensePoints}</h3>;

defenseUnits.forEach((unit, index) => { const box = document.createElement("div"); box.className = "defense-box"; const id = unit-${index};

box.innerHTML = `
  <h4>${unit.icon} ${unit.name} (Seviye ${unit.level})</h4>
  <button id="${id}" ${unit.upgrading ? "disabled" : ""}>
    Geliştir (${unit.cost} Altın, ${formatTime(unit.time)})
  </button>
  <div id="time-${index}" style="margin-top:5px;"></div>
`;

panel.appendChild(box);

const btn = document.getElementById(id);
const timeDiv = document.getElementById(`time-${index}`);

btn.onclick = () => {
  if (unit.upgrading) return;
  unit.upgrading = true;
  let remaining = unit.time;
  btn.disabled = true;
  const interval = setInterval(() => {
    remaining--;
    timeDiv.innerText = `Kalan süre: ${formatTime(remaining)}`;
    if (remaining <= 0) {
      clearInterval(interval);
      unit.upgrading = false;
      unit.level++;
      totalDefensePoints += unit.point;
      renderDefense();
    }
  }, 1000);
};

}); }

document.addEventListener("DOMContentLoaded", () => { renderDefense(); });

