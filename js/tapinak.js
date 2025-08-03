
function tapinakBonusPanelRender() {
  const panel = document.getElementById("tapinakPanel");
  if (!panel) return;

  const bonuslar = [
    { seviye: 1, text: "☀️ Moral artışı: Savaşlarda %5 güç bonusu" },
    { seviye: 2, text: "⏱️ Baraka %3 daha hızlı üretim" },
    { seviye: 3, text: "🛡️ İlk saldırıda %10 hasar emilimi" },
    { seviye: 4, text: "⚡ Birlik gücüne +2 bonus" },
    { seviye: 5, text: "🔁 Ölen birliklerin %10’u geri döner" }
  ];

  let html = `<h2>🎁 Tapınak Bonusları</h2><ul style="list-style:none; padding:0;">`;
  bonuslar.forEach(bonus => {
    if (typeof tapinakSeviye === "undefined") return;
    if (tapinakSeviye >= bonus.seviye) {
      html += `<li style="margin: 0.5rem 0;">✅ ${bonus.text}</li>`;
    } else {
      html += `<li style="margin: 0.5rem 0; color: gray;">🔒 ${bonus.text} (Seviye ${bonus.seviye})</li>`;
    }
  });
  html += `</ul>`;

  panel.innerHTML = html;
}

// Sayfa yüklendiğinde paneli oluştur
document.addEventListener("DOMContentLoaded", () => {
  tapinakBonusPanelRender();
});
