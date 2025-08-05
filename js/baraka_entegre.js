
document.addEventListener("DOMContentLoaded", () => {
  const units = [
    { name: "🕊️ Casus Kuş", gold: 100, food: 200, duration: 30 },
    { name: "⛏️ Cüce", gold: 200, food: 450, duration: 90 },
    { name: "🚛 Yük Arabası", gold: 1000, food: 1000, duration: 110 },
    { name: "🏹 Elf", gold: 400, food: 600, duration: 120 },
    { name: "🧙‍♂️ Gnom", gold: 1600, food: 1600, duration: 140 },
    { name: "🔮 Şaman", gold: 2000, food: 2000, duration: 160 },
    { name: "🐎 Süvari", gold: 1200, food: 2400, duration: 170 },
    { name: "🎯 Mancınık", gold: 6000, food: 12000, duration: 270 },
    { name: "🦄 Pegasus", gold: 4000, food: 3200, duration: 240 },
    { name: "👹 Ogre", gold: 18000, food: 18000, duration: 320 },
    { name: "🐉 Ejderha", gold: 40000, food: 24000, duration: 420 },
    { name: "☠️ Kaos", gold: 100000, food: 100000, duration: 7200 }
  ];

  let barakaLevel = 3;
  const panel = document.getElementById("barakaPanel");

  units.forEach((unit, index) => {
    const div = document.createElement("div");
    div.className = "structure";

    const input = document.createElement("input");
    input.type = "number";
    input.min = "1";
    input.placeholder = "Adet";

    const timerSpan = document.createElement("span");
    timerSpan.id = `timer-${index}`;
    timerSpan.className = "countdown";

    const button = document.createElement("button");
    button.innerText = `Üret (${unit.gold} 💰, ${unit.food} 🍖, ⏳ ${Math.floor(unit.duration / 60)}dk ${unit.duration % 60}sn)`;

    div.innerHTML = `<b>${unit.name}</b><br>`;
    div.appendChild(input);
    div.appendChild(button);
    div.appendChild(timerSpan);
    panel.appendChild(div);

    button.addEventListener("click", () => {
      const adet = parseInt(input.value);
      if (!adet || adet <= 0) return alert("Geçerli bir adet giriniz.");
      if (index + 1 > barakaLevel) return alert("Bu birlik henüz Baraka seviyeniz için kilitli!");

      const totalGold = unit.gold * adet;
      const totalFood = unit.food * adet;

      let gold = parseInt(document.getElementById("gold").innerText);
      let food = parseInt(document.getElementById("food").innerText);

      if (gold < totalGold || food < totalFood) {
        alert("Kaynak yetersiz!");
        return;
      }

      gold -= totalGold;
      food -= totalFood;

      document.getElementById("gold").innerText = gold;
      document.getElementById("food").innerText = food;

      let kalanSure = unit.duration * adet;
      timerSpan.innerText = `⏳ ${Math.floor(kalanSure / 60)}dk ${kalanSure % 60}sn kaldı`;

      const iptalBtn = document.createElement("button");
      iptalBtn.textContent = "❌ İptal";
      iptalBtn.style.marginLeft = "8px";
      timerSpan.appendChild(iptalBtn);

      const interval = setInterval(() => {
        kalanSure--;
        if (kalanSure > 0) {
          timerSpan.childNodes[0].textContent = `⏳ ${Math.floor(kalanSure / 60)}dk ${kalanSure % 60}sn kaldı`;
        } else {
          clearInterval(interval);
          timerSpan.innerText = `✅ ${adet}x ${unit.name} üretildi!`;
          // birlikler güncelle
          if (window.birliklerGuncelle) {
            const birlikAdi = unit.name.replace(/^.*?\s/, "").trim();
            let kaleBirlikleri = JSON.parse(localStorage.getItem("kaleBirlikleri")) || {};
            kaleBirlikleri[birlikAdi] = (kaleBirlikleri[birlikAdi] || 0) + adet;
            localStorage.setItem("kaleBirlikleri", JSON.stringify(kaleBirlikleri));
            window.birliklerGuncelle();
          }
        }
      }, 1000);

      iptalBtn.addEventListener("click", () => {
        clearInterval(interval);
        gold += totalGold;
        food += totalFood;
        document.getElementById("gold").innerText = gold;
        document.getElementById("food").innerText = food;
        timerSpan.innerText = "❌ Üretim iptal edildi.";
      });
    });
  });
});
