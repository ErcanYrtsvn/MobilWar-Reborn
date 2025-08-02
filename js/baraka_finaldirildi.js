
document.addEventListener("DOMContentLoaded", () => {
  const birlikler = [
    { ad: "🕊️ Casus Kuş", altin: 100, yemek: 200, sure: 30 },
    { ad: "⛏️ Cüce", altin: 200, yemek: 450, sure: 90 },
    { ad: "🚛 Yük Arabası", altin: 1000, yemek: 1000, sure: 110 },
    { ad: "🏹 Elf", altin: 400, yemek: 600, sure: 120 },
    { ad: "🧝‍♂️ Gnom", altin: 1600, yemek: 1600, sure: 140 },
    { ad: "🧙‍♂️ Şaman", altin: 2000, yemek: 2000, sure: 160 },
    { ad: "🐎 Süvari", altin: 1200, yemek: 2400, sure: 170 },
    { ad: "🎯 Mancınık", altin: 6000, yemek: 12000, sure: 270 },
    { ad: "🦄 Pegasus", altin: 4000, yemek: 3200, sure: 240 },
    { ad: "👹 Ogre", altin: 18000, yemek: 18000, sure: 320 },
    { ad: "🐉 Ejderha", altin: 40000, yemek: 24000, sure: 420 },
    { ad: "🧟‍♂️ Kaos", altin: 100000, yemek: 100000, sure: 7200 }
  ];

  const panel = document.getElementById("barakaPanel");
  let gold = parseInt(document.getElementById("gold").innerText);
  let food = parseInt(document.getElementById("food").innerText);

  function updateResources() {
    document.getElementById("gold").innerText = gold;
    document.getElementById("food").innerText = food;
  }

  birlikler.forEach((birlik, index) => {
    const div = document.createElement("div");
    div.className = "structure";

    const adetInput = document.createElement("input");
    adetInput.type = "number";
    adetInput.min = "1";
    adetInput.placeholder = "Adet";
    adetInput.className = "adetInput";

    const timerSpan = document.createElement("span");
    timerSpan.id = `timer-${index}`;
    timerSpan.className = "countdown";

    const button = document.createElement("button");
    button.innerText = `Üret (${birlik.altin} 💰, ${birlik.yemek} 🍖, ⏳ ${Math.floor(birlik.sure / 60)}dk ${birlik.sure % 60}sn)`;
    button.onclick = () => {
      const adet = parseInt(adetInput.value);
      if (!adet || adet < 1) return alert("Geçerli bir adet gir.");

      const toplamAltin = birlik.altin * adet;
      const toplamYemek = birlik.yemek * adet;

      if (gold < toplamAltin || food < toplamYemek) return alert("Kaynak yetersiz!");

      gold -= toplamAltin;
      food -= toplamYemek;
      updateResources();

      let kalan = birlik.sure * adet;
      timerSpan.innerText = `⏳ ${Math.floor(kalan / 60)}dk ${kalan % 60}sn kaldı`;

      const iptalBtn = document.createElement("button");
      iptalBtn.innerText = "❌ İptal Et";
      iptalBtn.style.marginTop = "5px";

      let interval = setInterval(() => {
        kalan--;
        if (kalan <= 0) {
          clearInterval(interval);
          timerSpan.innerText = `✅ ${adet}x ${birlik.ad} üretildi!`;
          iptalBtn.remove();
        } else {
          timerSpan.innerText = `⏳ ${Math.floor(kalan / 60)}dk ${kalan % 60}sn kaldı`;
        }
      }, 1000);

      iptalBtn.onclick = () => {
        clearInterval(interval);
        gold += toplamAltin;
        food += toplamYemek;
        updateResources();
        timerSpan.innerText = "❌ Üretim iptal edildi.";
        iptalBtn.remove();
      };

      timerSpan.appendChild(iptalBtn);
    };

    div.innerHTML = `<b>${birlik.ad}</b><br>`;
    div.appendChild(adetInput);
    div.appendChild(button);
    div.appendChild(timerSpan);
    panel.appendChild(div);
  });

  updateResources();
});
