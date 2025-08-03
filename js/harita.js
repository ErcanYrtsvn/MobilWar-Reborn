// harita.js

const haritaBoyutu = 20;
let sehirler = [];

function guncelleHarita() {
  const haritaContainer = document.getElementById("haritaContainer");
  haritaContainer.innerHTML = "";

  // Rastgele küçük şehirleri oluştur (bir kere)
  if (sehirler.length === 0) {
    for (let i = 0; i < 15; i++) {
      const x = Math.floor(Math.random() * haritaBoyutu);
      const y = Math.floor(Math.random() * haritaBoyutu);
      sehirler.push(`${x},${y}`);
    }
  }

  for (let y = 0; y < haritaBoyutu; y++) {
    for (let x = 0; x < haritaBoyutu; x++) {
      const kare = document.createElement("div");
      kare.classList.add("kare");
      kare.dataset.x = x;
      kare.dataset.y = y;

      const koordinat = `${x},${y}`;

      if (x === 10 && y === 10) {
        kare.classList.add("kale");
        kare.innerHTML = "🏰";
      } else if (sehirler.includes(koordinat)) {
        kare.classList.add("sehir");
        kare.innerHTML = "🌆";
      } else {
        kare.innerText = `${x},${y}`;
      }

      kare.addEventListener("click", () => {
        const popup = document.createElement("div");
        popup.className = "popup";
        popup.style.position = "absolute";
        popup.style.top = "42px";
        popup.style.left = "0";

        if (kare.classList.contains("kale")) {
          popup.innerHTML = `Oyuncu Kalesi<br>(${x},${y})<br>
            <button onclick="alert('Saldırılıyor!')">⚔️ Saldırı</button>
            <button onclick="alert('Destek gönderiliyor!')">🛡️ Destek</button>
            <button onclick="alert('Casus gönderildi!')">🕵️ Casusluk</button>
            <button onclick="alert('Mesaj paneli açılıyor!')">💬 Mesaj</button>`;
        } else if (kare.classList.contains("sehir")) {
          popup.innerHTML = `Küçük Şehir<br>(${x},${y})<br>
            <button onclick="alert('Yük arabası gönderildi!')">🐘 Yük Arabası Gönder</button>
            <button onclick="alert('Birliklerle saldırılıyor!')">⚔️ Saldır</button>`;
        } else {
          popup.innerText = `Boş Arazi\n(${x},${y})`;
        }

        kare.appendChild(popup);
        setTimeout(() => popup.remove(), 2500);
      });

      haritaContainer.appendChild(kare);
    }
  }
}

function openMap() {
  gizleTumPaneller();
  document.getElementById("haritaContainer").style.display = "grid";
  guncelleHarita();
}
