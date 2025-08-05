
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

  let kaleBirlikleri = JSON.parse(localStorage.getItem("kaleBirlikleri")) || {};
  let magaraBirlikleri = JSON.parse(localStorage.getItem("magaraBirlikleri")) || {};

  function guncelleBirlikListesi() {
    birlikListesi.innerHTML = "";
    let toplam = 0;
    let guc = 0;

    Object.keys(birlikGucu).forEach(birlik => {
      const adet = kaleBirlikleri[birlik] || 0;
      const gucDegeri = birlikGucu[birlik] || 1;
      toplam += adet;
      guc += adet * gucDegeri;

      const li = document.createElement("li");
      li.innerHTML = \`\${birlik}: \${adet} adet<br>
        <input type="number" min="1" placeholder="Adet" id="input-\${birlik}" style="width: 60px;" />
        <button onclick="magarayaGonder('\${birlik}')">Mağaraya Gönder</button>\`;
      birlikListesi.appendChild(li);
    });

    toplamAskerElem.textContent = toplam;
    toplamGucElem.textContent = guc;
  }

  window.magarayaGonder = function (birlikAdi) {
    const input = document.getElementById("input-" + birlikAdi);
    const adet = parseInt(input.value);

    if (!adet || adet <= 0) {
      alert("Geçerli bir adet gir.");
      return;
    }

    if (!kaleBirlikleri[birlikAdi] || kaleBirlikleri[birlikAdi] < adet) {
      alert("Yeterli birlik yok.");
      return;
    }

    // Kaleden düş
    kaleBirlikleri[birlikAdi] -= adet;

    // Mağaraya ekle
    if (!magaraBirlikleri[birlikAdi]) {
      magaraBirlikleri[birlikAdi] = 0;
    }
    magaraBirlikleri[birlikAdi] += adet;

    // Kaydet
    localStorage.setItem("kaleBirlikleri", JSON.stringify(kaleBirlikleri));
    localStorage.setItem("magaraBirlikleri", JSON.stringify(magaraBirlikleri));

    // Güncelle
    guncelleBirlikListesi();
    alert(adet + " " + birlikAdi + " mağaraya gönderildi.");
  };

  window.birliklerGuncelle = guncelleBirlikListesi;
  guncelleBirlikListesi();
});
