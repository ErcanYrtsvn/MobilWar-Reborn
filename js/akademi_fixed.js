const akademiSeviyesi = 1;
  const akademiPanel = document.getElementById("akademiPanel");

  const arastirmalar = [
    { id: "uretim", ad: "⚙️ Üretim Hızlandırma", seviye: 1, maliyet: 2500, sure: 1200, gerekliSeviye: 1 },
    { id: "casusluk", ad: "🕵️ Casusluk Geliştirme", seviye: 1, maliyet: 3000, sure: 1500, gerekliSeviye: 1 },
    { id: "saldiri", ad: "⚔️ Saldırı Gücü Artışı", seviye: 1, maliyet: 3500, sure: 1800, gerekliSeviye: 2 },
    { id: "savunma", ad: "🛡️ Savunma Gücü Artışı", seviye: 1, maliyet: 3500, sure: 1800, gerekliSeviye: 2 },
    { id: "buyu", ad: "🌀 Şaman Büyüsü", seviye: 1, maliyet: 4000, sure: 2000, gerekliSeviye: 3 },
    { id: "hiz", ad: "🐎 Birlik Hızı Artışı", seviye: 1, maliyet: 3000, sure: 1600, gerekliSeviye: 3 },
    { id: "insaat", ad: "🧱 İnşa Süresi Azaltma", seviye: 1, maliyet: 4500, sure: 2200, gerekliSeviye: 4 }
  ];

  let aktifArastirma = null;

  if (!akademiPanel) return;

  arastirmalar.forEach(a => {
    const div = document.createElement("div");
    div.classList.add("arastirma");

    const seviyesi = document.createElement("span");
    seviyesi.id = `${a.id}Seviye`;
    seviyesi.textContent = `Seviye ${a.seviye}`;

    const buton = document.createElement("button");
    buton.textContent = `Geliştir (💰 ${a.maliyet}, ⏳ ${Math.floor(a.sure / 60)}dk)`;
    buton.disabled = akademiSeviyesi < a.gerekliSeviye;

    const sayac = document.createElement("span");
    sayac.id = `${a.id}Timer`;
    sayac.className = "countdown";
    sayac.style.marginLeft = "10px";

    div.innerHTML = `<strong>${a.ad}</strong> `;
    div.appendChild(seviyesi);
    div.appendChild(document.createElement("br"));
    div.appendChild(buton);
    div.appendChild(sayac);
    akademiPanel.appendChild(div);

    buton.addEventListener("click", () => {
      if (aktifArastirma) {
        alert("Zaten bir araştırma yapılıyor!");
        return;
      }

      let altin = parseInt(document.getElementById("gold").innerText);
      if (altin < a.maliyet) {
        alert("Yetersiz altın!");
        return;
      }

      aktifArastirma = a.id;
      altin -= a.maliyet;
      document.getElementById("gold").innerText = altin;

      let kalanSure = a.sure;
      sayac.innerHTML = `⏳ Kalan süre: ${formatTime(kalanSure)}`;

      const iptal = document.createElement("button");
      iptal.textContent = "❌ İptal";
      iptal.style.marginLeft = "10px";
      sayac.appendChild(iptal);

      const interval = setInterval(() => {
        kalanSure--;
        if (kalanSure <= 0) {
          clearInterval(interval);
          a.seviye++;
          seviyesi.textContent = `Seviye ${a.seviye}`;
          sayac.innerHTML = "✅ Araştırma tamamlandı!";
          aktifArastirma = null;
          buton.textContent = `Geliştir (💰 ${a.maliyet}, ⏳ ${Math.floor(a.sure / 60)}dk)`;
        } else {
          sayac.childNodes[0].textContent = `⏳ Kalan süre: ${formatTime(kalanSure)}`;
        }
      }, 1000);

      iptal.addEventListener("click", () => {
        clearInterval(interval);
        document.getElementById("gold").innerText = altin + a.maliyet;
        sayac.innerHTML = "❌ Araştırma iptal edildi.";
        aktifArastirma = null;
      });
    });
  });

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}dk ${s < 10 ? "0" : ""}${s}sn`;
  }