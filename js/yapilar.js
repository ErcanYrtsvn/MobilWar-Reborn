
document.addEventListener("DOMContentLoaded", () => {
  const structures = [
    { id: "baraka", name: "🏹 Baraka", baseCost: 1000, baseDuration: 600 },
    { id: "savunma", name: "🛡️ Savunma", baseCost: 1200, baseDuration: 720 },
    { id: "akademi", name: "📘 Akademi", baseCost: 1400, baseDuration: 840 },
    { id: "tapinak", name: "⛩️ Tapınak", baseCost: 1600, baseDuration: 960 },
    { id: "ciftlik", name: "🍖 Çiftlik", baseCost: 1100, baseDuration: 660 },
    { id: "tas", name: "🪨 Taş Ocağı", baseCost: 1150, baseDuration: 690 },
    { id: "maden", name: "💰 Maden", baseCost: 1250, baseDuration: 750 },
    { id: "magara", name: "🏔️ Mağara", baseCost: 1300, baseDuration: 780 }
  ];

  let currentUpgrade = null;

  structures.forEach(({ id, baseCost, baseDuration }) => {
    const levelSpan = document.getElementById(id + "Level");
    const timerSpan = document.getElementById(id + "Timer");
    const button = timerSpan?.previousElementSibling;

    if (!levelSpan || !timerSpan || !button) return;

    let level = parseInt(levelSpan.innerText);
    const cost = Math.floor(baseCost * Math.pow(1.4, level - 1));
    const duration = Math.floor(baseDuration * Math.pow(1.2, level - 1)); // saniye
    button.innerText = `Geliştir (💰 ${cost}, ⏳ ${Math.floor(duration / 60)}dk)`;

    button.addEventListener("click", () => {
      if (currentUpgrade) {
        alert("Zaten bir yapı geliştiriliyor!");
        return;
      }

      level = parseInt(levelSpan.innerText);
      let gold = parseInt(document.getElementById("gold").innerText);
      const finalCost = Math.floor(baseCost * Math.pow(1.4, level - 1));
      const finalDuration = Math.floor(baseDuration * Math.pow(1.2, level - 1));

      if (gold < finalCost) {
        alert("Yetersiz altın!");
        return;
      }

      gold -= finalCost;
      document.getElementById("gold").innerText = gold;

      currentUpgrade = id;
      let timeLeft = finalDuration;

      timerSpan.innerHTML = `⏳ Kalan süre: ${formatTime(timeLeft)}`;

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "❌ İptal";
      cancelBtn.style.marginLeft = "8px";
      timerSpan.appendChild(cancelBtn);

      const interval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
          clearInterval(interval);
          levelSpan.innerText = parseInt(levelSpan.innerText) + 1;
          timerSpan.innerHTML = `✅ Geliştirildi!`;
          currentUpgrade = null;
          // Buton güncelle
          const nextCost = Math.floor(baseCost * Math.pow(1.4, parseInt(levelSpan.innerText) - 1));
          const nextDuration = Math.floor(baseDuration * Math.pow(1.2, parseInt(levelSpan.innerText) - 1));
          button.innerText = `Geliştir (💰 ${nextCost}, ⏳ ${Math.floor(nextDuration / 60)}dk)`;
        } else {
          timerSpan.childNodes[0].textContent = `⏳ Kalan süre: ${formatTime(timeLeft)}`;
        }
      }, 1000);

      cancelBtn.addEventListener("click", () => {
        clearInterval(interval);
        document.getElementById("gold").innerText = gold + finalCost;
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
