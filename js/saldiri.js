
document.addEventListener("DOMContentLoaded", function () {
  const saldiriContainer = document.getElementById("saldiri-container");
  if (!saldiriContainer) return;

  // Yeni Saldırı Gönder Formu
  const formHTML = `
    <div class="saldiri-panel">
      <h2>📤 Yeni Saldırı Gönder</h2>
      <label>Hedef Koordinat: </label>
      <input type="number" id="hedefX" placeholder="X" />
      <input type="number" id="hedefY" placeholder="Y" />
      <br/>
      <label>Birlik (örnek): </label>
      <input type="number" id="birlikAdet" placeholder="Elf Sayısı" />
      <br/>
      <button id="saldiriBaslatBtn">Saldırı Başlat</button>
    </div>
    <div id="yoldakiBirlikler" class="saldiri-bolum">
      <h3>⏳ Yolda Olan Birlikler</h3>
      <ul id="birlikListesi"></ul>
    </div>
    <div id="savasRaporlari" class="saldiri-bolum">
      <h3>📜 Savaş Raporları</h3>
      <ul id="raporListesi"></ul>
    </div>
  `;

  saldiriContainer.innerHTML = formHTML;

  document.getElementById("saldiriBaslatBtn").addEventListener("click", function () {
    const x = parseInt(document.getElementById("hedefX").value);
    const y = parseInt(document.getElementById("hedefY").value);
    const adet = parseInt(document.getElementById("birlikAdet").value);

    if (isNaN(x) || isNaN(y) || isNaN(adet) || adet <= 0) {
      alert("Tüm alanları doğru doldurun!");
      return;
    }

    const hedef = `X:${x}, Y:${y}`;
    const sure = 180; // saniye
    let kalan = sure;

    const li = document.createElement("li");
    li.textContent = `🛡️ ${adet} Elf birliği ${hedef} hedefine yolda. Kalan süre: ${formatSure(kalan)}`;
    document.getElementById("birlikListesi").appendChild(li);

    const interval = setInterval(() => {
      kalan--;
      if (kalan <= 0) {
        clearInterval(interval);
        li.textContent = `✅ ${adet} Elf birliği ${hedef} hedefine ulaştı!`;
        const rapor = document.createElement("li");
        rapor.textContent = `📜 ${adet} Elf ${hedef} hedefine ulaştı. (Savaş sonucu henüz eklenmedi)`;
        document.getElementById("raporListesi").appendChild(rapor);
      } else {
        li.textContent = `🛡️ ${adet} Elf birliği ${hedef} hedefine yolda. Kalan süre: ${formatSure(kalan)}`;
      }
    }, 1000);
  });

  function formatSure(seconds) {
    const d = new Date(null);
    d.setSeconds(seconds);
    return d.toISOString().substr(14, 5);
  }
});
