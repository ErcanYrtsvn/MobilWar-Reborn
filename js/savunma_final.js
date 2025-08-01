
const savunmaYapilari = [
  { ad: "kale", ikon: "🏰", adLabel: "Kale", tabanMaliyet: 200, tabanSure: 600 },
  { ad: "okcukulesi", ikon: "🏹", adLabel: "Okçu Kulesi", tabanMaliyet: 180, tabanSure: 480 },
  { ad: "siper", ikon: "🧱", adLabel: "Siper", tabanMaliyet: 150, tabanSure: 360 },
  { ad: "tuzak", ikon: "🪤", adLabel: "Tuzak", tabanMaliyet: 160, tabanSure: 420 },
  { ad: "katran", ikon: "🔥", adLabel: "Katran Kazanı", tabanMaliyet: 170, tabanSure: 540 }
];

let savunmaSeviyeleri = {};
let savunmaSayaçlar = {};
let suanGelistirilen = null;

savunmaYapilari.forEach(yapi => {
  savunmaSeviyeleri[yapi.ad] = 1;
});

function guncelleToplamSavunmaGucu() {
  const toplamGuc = savunmaYapilari.reduce((toplam, yapi) => {
    return toplam + savunmaSeviyeleri[yapi.ad] * 100;
  }, 0);
  const bar = document.getElementById("toplamSavunmaGucu");
  if (bar) bar.innerText = `🛡️ Toplam Savunma Gücü: ${toplamGuc}`;
}

function olusturSavunmaPaneli() {
  const panel = document.getElementById("savunmaPanel");
  panel.innerHTML = "";

  const gucDiv = document.createElement("div");
  gucDiv.id = "toplamSavunmaGucu";
  gucDiv.style.fontWeight = "bold";
  gucDiv.style.marginBottom = "1rem";
  panel.appendChild(gucDiv);

  guncelleToplamSavunmaGucu();

  savunmaYapilari.forEach(yapi => {
    const div = document.createElement("div");
    div.className = "structure";
    const seviye = savunmaSeviyeleri[yapi.ad];
    const maliyet = Math.floor(yapi.tabanMaliyet * (1 + seviye * 0.5));
    const sure = yapi.tabanSure + (seviye * 60);

    div.innerHTML = `${yapi.ikon} ${yapi.adLabel} (Seviye <span id="${yapi.ad}Level">${seviye}</span>) 
      <button onclick="gelistirSavunma('${yapi.ad}')" ${suanGelistirilen ? 'disabled' : ''}>
        Geliştir (${maliyet} Altın, ${(sure / 60).toFixed(0)} dk)
      </button> 
      <button onclick="iptalEt('${yapi.ad}')" id="${yapi.ad}Cancel" style="display:none;">İptal</button>
      <span id="${yapi.ad}Timer" class="countdown"></span>`;
    panel.appendChild(div);
  });
}

function gelistirSavunma(ad) {
  if (suanGelistirilen) return alert("Şu anda başka bir savunma geliştiriliyor!");
  const yapi = savunmaYapilari.find(y => y.ad === ad);
  const seviye = savunmaSeviyeleri[ad];
  const maliyet = Math.floor(yapi.tabanMaliyet * (1 + seviye * 0.5));
  const sure = yapi.tabanSure + (seviye * 60);

  if (gold < maliyet) return alert("Yetersiz altın!");
  gold -= maliyet;
  updateResources();

  suanGelistirilen = ad;
  const cancelBtn = document.getElementById(ad + "Cancel");
  const timerSpan = document.getElementById(ad + "Timer");
  cancelBtn.style.display = "inline";
  let kalan = sure;
  timerSpan.innerText = ` ⏱️ ${Math.floor(kalan / 60)} dk`;

  savunmaSayaçlar[ad] = setInterval(() => {
    kalan--;
    timerSpan.innerText = ` ⏱️ ${Math.floor(kalan / 60)} dk ${kalan % 60} sn`;
    if (kalan <= 0) {
      clearInterval(savunmaSayaçlar[ad]);
      savunmaSeviyeleri[ad]++;
      suanGelistirilen = null;
      olusturSavunmaPaneli();
    }
  }, 1000);
}

function iptalEt(ad) {
  clearInterval(savunmaSayaçlar[ad]);
  suanGelistirilen = null;
  olusturSavunmaPaneli();
}


window.onload = olusturSavunmaPanel;