
let currentUpgrade = null;

function upgrade(name) {
  if (currentUpgrade) {
    alert("Zaten bir yapı geliştiriliyor!");
    return;
  }

  const levelSpan = document.getElementById(name + "Level");
  const timerSpan = document.getElementById(name + "Timer");

  const level = parseInt(levelSpan.innerText);
  const baseCost = 200;
  const baseDuration = 600;

  const cost = Math.floor(baseCost * Math.pow(1.4, level - 1));
  const duration = Math.floor(baseDuration * Math.pow(1.2, level - 1)); // saniye

  let gold = parseInt(document.getElementById("gold").innerText);
  if (gold < cost) {
    alert("Yetersiz altın!");
    return;
  }

  gold -= cost;
  document.getElementById("gold").innerText = gold;

  currentUpgrade = name;
  let timeLeft = duration;

  timerSpan.innerHTML = `⏳ Kalan süre: ${formatDuration(timeLeft)}`;

  const cancelButton = document.createElement("button");
  cancelButton.textContent = "❌ İptal";
  cancelButton.style.marginLeft = "10px";
  timerSpan.appendChild(cancelButton);

  const interval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(interval);
      levelSpan.innerText = level + 1;
      timerSpan.innerHTML = "✅ Geliştirildi!";
      currentUpgrade = null;
    } else {
      timerSpan.childNodes[0].textContent = `⏳ Kalan süre: ${formatDuration(timeLeft)}`;
    }
  }, 1000);

  cancelButton.addEventListener("click", () => {
    clearInterval(interval);
    document.getElementById("gold").innerText = gold + cost;
    timerSpan.innerHTML = "❌ Geliştirme iptal edildi.";
    currentUpgrade = null;
  });
}

function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}dk ${s < 10 ? "0" : ""}${s}sn`;
}
