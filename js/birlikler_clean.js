
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

  function guncelleBirlikListesi() {
    const kaleBirlikleri = JSON.parse(localStorage.getItem("kaleBirlikleri")) || {};
    birlikListesi.innerHTML = "";
    let toplam = 0;
    let guc = 0;

    Object.keys(birlikGucu).forEach(birlik => {
      const adet = kaleBirlikleri[birlik] || 0;
      toplam += adet;
      guc += adet * birlikGucu[birlik];

      const li = document.createElement("li");
      li.textContent = `${birlik}: ${adet} adet`;
      birlikListesi.appendChild(li);
    });

    toplamAskerElem.textContent = toplam;
    toplamGucElem.textContent = guc;
  }

  // dışarıdan çağırmak için
  window.birliklerGuncelle = guncelleBirlikListesi;
  guncelleBirlikListesi();
});
