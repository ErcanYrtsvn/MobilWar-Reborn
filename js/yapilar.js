
document.addEventListener("DOMContentLoaded", () => {
  const structures = [
    { id: "baraka", name: "🏹 Baraka", baseCost: 200, baseDuration: 600 },
    { id: "savunma", name: "🛡️ Savunma", baseCost: 300, baseDuration: 700 },
    { id: "akademi", name: "📘 Akademi", baseCost: 400, baseDuration: 800 },
    { id: "tapinak", name: "⛩️ Tapınak", baseCost: 500, baseDuration: 900 },
    { id: "ciftlik", name: "🍖 Çiftlik", baseCost: 350, baseDuration: 750 },
    { id: "tas", name: "🪨 Taş Ocağı", baseCost: 450, baseDuration: 850 },
    { id: "maden", name: "💰 Maden", baseCost: 550, baseDuration: 950 },
    { id: "magara", name: "🏔️ Mağara", baseCost: 600, baseDuration: 1000 }
  ];

  let currentUpgrade = null;

  structures.forEach(({ id, baseCost, baseDuration }) => {
    const levelSpan = document.getElementById(id + "Level");
    const timerSpan = document.getElementById(id + "Timer");
    const button = timerSpan?.previousElementSibling;

    if (!levelSpan || !timerSpan || !button) return;

    button.addEventListener("click", () => {
      if (currentUpgrade) {
        alert("Zaten bir yapı geliştiriliyor!");
        return;
      }

      let level = parseInt(levelSpan.innerText);
      let gold = parseInt(document.getElementById("gold").innerText);
      const cost = Math.floor(baseCost * Math.pow(1.4, level - 1));
      const duration = Math.floor(baseDuration * Math.pow(1.2, level - 1)); // saniye

      if (gold < cost) {
        alert("Yetersiz altın!");
        return;
      }

      gold -= cost;
      document.getElementById("gold").innerText = gold;

      currentUpgrade = id;
      let timeLeft = duration;

      timerSpan.innerHTML = `⏳ Kalan süre: ${formatTime(timeLeft)}`;

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "❌ İptal";
      cancelBtn.style.marginLeft = "8px";
      timerSpan.appendChild(cancelBtn);

      const interval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
          clearInterval(interval);
          levelSpan.innerText = level + 1;
          timerSpan.innerHTML = `✅ Geliştirildi!`;
          currentUpgrade = null;
        } else {
          timerSpan.childNodes[0].textContent = `⏳ Kalan süre: ${formatTime(timeLeft)}`;
        }
      }, 1000);

      cancelBtn.addEventListener("click", () => {
        clearInterval(interval);
        document.getElementById("gold").innerText = gold + cost;
        timerSpan.innerHTML = "❌ Geliştirme iptal edildi.";
        currentUpgrade = null;
      });
    });
  });

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}dk ${s < 10 ? "0" : ""}${s}sn`;
  }
});
