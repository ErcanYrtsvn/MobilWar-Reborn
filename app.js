let resources = {
  gold: 100,
  wood: 50
};

let buildings = [
  { id: 1, name: "Maden", level: 1, goldCost: 50, woodCost: 20, icon: "⛏" },
  { id: 2, name: "Kereste Fabrikası", level: 1, goldCost: 40, woodCost: 30, icon: "🪓" },
  { id: 3, name: "Kışla", level: 1, goldCost: 100, woodCost: 50, icon: "🏹" },
  { id: 4, name: "Surlar", level: 1, goldCost: 80, woodCost: 60, icon: "🛡" }
];

function updateResourcesUI() {
  document.getElementById("gold").textContent = resources.gold;
  document.getElementById("wood").textContent = resources.wood;
}

function upgradeBuilding(id) {
  const building = buildings.find(b => b.id === id);
  if (
    resources.gold >= building.goldCost &&
    resources.wood >= building.woodCost
  ) {
    resources.gold -= building.goldCost;
    resources.wood -= building.woodCost;
    building.level++;
    building.goldCost = Math.floor(building.goldCost * 1.5);
    building.woodCost = Math.floor(building.woodCost * 1.5);
    renderBuildings();
    updateResourcesUI();
  } else {
    alert("Yetersiz kaynak!");
  }
}

function renderBuildings() {
  const container = document.getElementById("buildings");
  container.innerHTML = "";
  buildings.forEach(building => {
    const card = document.createElement("div");
    card.className = "building-card";
    card.innerHTML = `
      <div class="building-icon">${building.icon}</div>
      <h3>${building.name}</h3>
      <p>Seviye: ${building.level}</p>
      <p>Maliyet: ${building.goldCost} Altın, ${building.woodCost} Odun</p>
      <button onclick="upgradeBuilding(${building.id})">Geliştir</button>
    `;
    container.appendChild(card);
  });
}

// Otomatik kaynak üretimi (her 5 saniyede bir artış)
setInterval(() => {
  resources.gold += 10;
  resources.wood += 5;
  updateResourcesUI();
}, 5000);

window.onload = () => {
  updateResourcesUI();
  renderBuildings();
};
