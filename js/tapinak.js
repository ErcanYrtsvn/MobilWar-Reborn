
// 📁 tapinak.js

// Tapınak seviyesiyle birlikte açılan bonuslar tanımı
const bonuslar = [
  { seviye: 1, ad: "Tarla Verimi", etki: "%5 Üretim Hızı" },
  { seviye: 2, ad: "Altın Bereketi", etki: "%5 Altın Kazancı" },
  { seviye: 3, ad: "Savunma Ruhu", etki: "%10 Savunma Gücü" },
  { seviye: 4, ad: "Şifa Dalgası", etki: "%10 Şaman İyileştirmesi" },
  { seviye: 5, ad: "Asker Ruhu", etki: "%10 Birlik Gücü Artışı" },
  { seviye: 6, ad: "Ganimet Koruması", etki: "%15 Kaynak Koruması" },
  { seviye: 7, ad: "Kaos Gücü", etki: "%20 Tüm Güç Artışı" },
];

function guncelleTapinakBonusPanel() {
  const tapinakPanel = document.getElementById("tapinakPanel");
  if (!tapinakPanel) return;

  tapinakPanel.innerHTML = "";

  const baslik = document.createElement("h3");
  baslik.innerText = "🎁 Tapınak Bonusları";
  tapinakPanel.appendChild(baslik);

  const seviyeSpan = document.getElementById("tapinakLevel");
  const tapinakSeviye = parseInt(seviyeSpan?.innerText || "1");

  bonuslar.forEach((bonus) => {
    const bonusSatir = document.createElement("div");
    bonusSatir.style.marginBottom = "8px";
    bonusSatir.style.padding = "6px";
    bonusSatir.style.borderRadius = "6px";
    bonusSatir.style.background = bonus.seviye <= tapinakSeviye ? "#4caf50" : "#777";
    bonusSatir.style.color = "#fff";
    bonusSatir.innerText = `⛩️ ${bonus.ad}: ${bonus.etki}` +
      (bonus.seviye <= tapinakSeviye ? " (AKTİF)" : ` (Seviye ${bonus.seviye} gerekiyor)`);
    tapinakPanel.appendChild(bonusSatir);
  });
}

// Tapınak sekmesine geçince paneli güncelle
document.addEventListener("DOMContentLoaded", () => {
  const templeBtn = document.querySelector("button[onclick*='temple']");
  if (templeBtn) {
    templeBtn.addEventListener("click", () => {
      setTimeout(guncelleTapinakBonusPanel, 100);
    });
  }
});
