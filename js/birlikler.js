
document.addEventListener("DOMContentLoaded", () => {
  const birlikListesi = document.getElementById("birlikListesi");
  const toplamAskerElem = document.getElementById("toplamAskerSayisi");
  const toplamGucElem = document.getElementById("toplamGuc");

  const birlikGucu = {
    "Casus Kuş": 1,
    "Cüce": 3,
    "Yük Arabası": 0,
    "Elf": 5,
    "Gnom": 2,
    "Şaman": 1,
    "Süvari": 6,
    "Mancınık": 4,
    "Pegasus": 7,
    "Ogre": 8,
    "Ejderha": 10,
    "Kaos": 12
  };

  const birlikIkonlari = {
    "Casus Kuş": "🕊️",
    "Cüce": "🪓",
    "Yük Arabası": "🛒",
    "Elf": "🏹",
    "Gnom": "🧪",
    "Şaman": "🔮",
    "Süvari": "🐎",
    "Mancınık": "🎯",
    "Pegasus": "🪽",
    "Ogre": "👹",
    "Ejderha": "🐉",
    "Kaos": "☠️"
  };

  function guncelleBirlikListesi() {
    const kaleBirlikleri = JSON.parse(localStorage.getItem("kaleBirlikleri")) || {};
    birlikListesi.innerHTML = "";
    let toplam = 0;
    let guc = 0;

    Object.keys(birlikGucu).forEach(birlik => {
      const adet = kaleBirlikleri[birlik] || 0;
      toplam += adet;
      guc += adet * birlikGucu[birlik];

      const div = document.createElement("div");
      div.className = "birlik-kutu";
      div.style = "display: flex; align-items: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;";
      div.innerHTML = `
        <span style="min-width: 130px;"><strong>${birlikIkonlari[birlik]} ${birlik}</strong>: ${adet} adet</span>
        <input type="number" min="1" max="${adet}" placeholder="Adet yaz" style="width: 80px; padding: 3px;">
        <button onclick="magarayaGonder('${birlik}', this)" style="background: gold; padding: 4px 10px; border: none; border-radius: 5px;">Mağaraya Gönder</button>
      `;
      birlikListesi.appendChild(div);
    });

    toplamAskerElem.textContent = toplam;
    toplamGucElem.textContent = guc;
  }

  window.birliklerGuncelle = guncelleBirlikListesi;
  guncelleBirlikListesi();
});

function magarayaGonder(birlikAdi, btn) {
  const input = btn.previousElementSibling;
  const gonderilecek = parseInt(input.value);
  if (isNaN(gonderilecek) || gonderilecek <= 0) return;

  const kaleBirlikleri = JSON.parse(localStorage.getItem("kaleBirlikleri")) || {};
  const mevcut = kaleBirlikleri[birlikAdi] || 0;
  if (gonderilecek > mevcut) return;

  kaleBirlikleri[birlikAdi] -= gonderilecek;
  localStorage.setItem("kaleBirlikleri", JSON.stringify(kaleBirlikleri));

  const magara = JSON.parse(localStorage.getItem("magaraBirlikleri")) || {};
  magara[birlikAdi] = (magara[birlikAdi] || 0) + gonderilecek;
  localStorage.setItem("magaraBirlikleri", JSON.stringify(magara));

  window.birliklerGuncelle();
}
