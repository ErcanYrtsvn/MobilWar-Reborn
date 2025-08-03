
// js/tapinak.js

let tapinakTimer = null;
let duaAktif = false;
let duaKalanSure = 0;
let tapinakVergi = {
  gold: 0,
  food: 0,
  stone: 0
};

function getTapinakSeviyeBonus() {
  const seviye = levels["tapinak"];
  if (seviye === 1) return 0.05;
  if (seviye === 2) return 0.1;
  if (seviye === 3) return 0.15;
  if (seviye === 4) return 0.2;
  if (seviye >= 5) return 0.25;
  return 0;
}

function tapinakDuaBaslat() {
  if (duaAktif) {
    alert("Zaten aktif bir dua var!");
    return;
  }

  duaAktif = true;
  const bonus = getTapinakSeviyeBonus();
  const sureDakika = 10;
  duaKalanSure = sureDakika * 60;

  document.getElementById("duaDurumu").innerHTML = 
    `Dua aktif! Üretim +${Math.floor(bonus * 100)}% <br><span id="duaSure"></span> <button onclick="tapinakDuaIptal()">❌ İptal Et</button>`;

  tapinakTimer = setInterval(() => {
    duaKalanSure--;
    const dakika = Math.floor(duaKalanSure / 60);
    const saniye = duaKalanSure % 60;
    document.getElementById("duaSure").innerText = `Kalan: ${dakika}dk ${saniye}s`;
    if (duaKalanSure <= 0) {
      clearInterval(tapinakTimer);
      document.getElementById("duaDurumu").innerText = "Dua süresi sona erdi.";
      duaAktif = false;
    }
  }, 1000);
}

function tapinakDuaIptal() {
  clearInterval(tapinakTimer);
  duaAktif = false;
  document.getElementById("duaDurumu").innerText = "Dua iptal edildi.";
}

function vergiGonder(goldMiktar, foodMiktar, stoneMiktar) {
  if (gold >= goldMiktar && food >= foodMiktar && stone >= stoneMiktar) {
    gold -= goldMiktar;
    food -= foodMiktar;
    stone -= stoneMiktar;

    tapinakVergi.gold += goldMiktar;
    tapinakVergi.food += foodMiktar;
    tapinakVergi.stone += stoneMiktar;

    updateResources();
    document.getElementById("vergiDurumu").innerText = `Vergide biriken kaynaklar: 💰 ${tapinakVergi.gold} | 🍖 ${tapinakVergi.food} | 🪨 ${tapinakVergi.stone}`;
  } else {
    alert("Yeterli kaynağın yok!");
  }
}

function vergiTahsilEt() {
  gold += tapinakVergi.gold;
  food += tapinakVergi.food;
  stone += tapinakVergi.stone;

  tapinakVergi = { gold: 0, food: 0, stone: 0 };

  updateResources();
  document.getElementById("vergiDurumu").innerText = "Vergi kaynakları tahsil edildi.";
}
