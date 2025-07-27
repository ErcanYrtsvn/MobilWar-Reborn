let gold = 100;
let soldiers = 0;
let academyLevel = 1;

function updateUI() {
  document.getElementById("gold").textContent = gold;
  document.getElementById("soldiers").textContent = soldiers;
  document.getElementById("academyLevel").textContent = academyLevel;
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => screen.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function startGame() {
  showScreen("cityView");
  updateUI();
}

function goToMenu() {
  showScreen("mainMenu");
}

function trainSoldier() {
  if (gold >= 10) {
    gold -= 10;
    soldiers += 1;
    updateUI();
    showMessage("Bir asker eğitildi!");
  } else {
    showMessage("Yeterli altın yok.");
  }
}

function upgradeAcademy() {
  if (gold >= 50) {
    gold -= 50;
    academyLevel += 1;
    updateUI();
    showMessage("Akademi seviyesi arttı!");
  } else {
    showMessage("Yeterli altın yok.");
  }
}

function attack() {
  if (soldiers > 0) {
    const chance = Math.random() < 0.5 + academyLevel * 0.05;
    if (chance) {
      const loot = Math.floor(Math.random() * 50 + 20);
      gold += loot;
      showMessage(`Saldırı başarılı! ${loot} altın kazandın.`);
    } else {
      const loss = Math.min(soldiers, Math.floor(Math.random() * 5 + 1));
      soldiers -= loss;
      showMessage(`Saldırı başarısız! ${loss} asker kaybettin.`);
    }
    updateUI();
  } else {
    showMessage("Askerin yok.");
  }
}

function showMessage(msg) {
  document.getElementById("message").textContent = msg;
}
