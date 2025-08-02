document.addEventListener("DOMContentLoaded", function () {
  const savunmaYapilari = [
    {
      isim: "🏰 Kale",
      maliyet: { altin: 100, et: 200, tas: 300 },
      sure: 300, // saniye cinsinden
      puan: 200
    },
    {
      isim: "🏹 Okçu Kulesi",
      maliyet: { altin: 150, et: 100, tas: 250 },
      sure: 360,
      puan: 150
    },
    {
      isim: "🔥 Yağ Kazanı",
      maliyet: { altin: 200, et: 150, tas: 100 },
      sure: 420,
      puan: 180
    },
    {
      isim: "🛡️ Surlar",
      maliyet: { altin: 300, et: 100, tas: 200 },
      sure: 480,
      puan: 220
    },
    {
      isim: "🚪 Demir Kapı",
      maliyet: { altin: 450, et: 200, tas: 200 },
      sure: 540,
      puan: 250
    }
  ];

  let altin = 1000, et = 1000, tas = 1000;
  let toplamSavunmaPuani = 0;
  let aktifGelistirme = false;

  const panel = document.getElementById("savunmaPanel");

  function saniyeyiDakikayaCevir(sn) {
    const dk = Math.floor(sn / 60);
    const saniye = sn % 60;
    return `${dk}dk ${saniye}sn`;
  }

  function render() {
    panel.innerHTML = `<h3 style="color: gold;">Toplam Savunma Puanı: ${toplamSavunmaPuani}</h3>`;
    savunmaYapilari.forEach((yapi, index) => {
      const mevcutSeviye = yapi.seviye || 1;
      const yeniPuan = mevcutSeviye * yapi.puan;
      const id = `savunma-${index}`;
      const butonId = `gelistirBtn-${index}`;

      const div = document.createElement("div");
      div.className = "savunma-item";
      div.innerHTML = `
        <h4>${yapi.isim} (Seviye ${mevcutSeviye})</h4>
        <button id="${butonId}" class="button" ${
        aktifGelistirme ? "disabled" : ""
      }>
          Geliştir (💰${yapi.maliyet.altin} 🥩${yapi.maliyet.et} 🪨${yapi.maliyet.tas}, ⏳${saniyeyiDakikayaCevir(yapi.sure)})
        </button>
        <div id="${id}-sure"></div>
      `;
      panel.appendChild(div);

      document.getElementById(butonId).addEventListener("click", () => {
        if (aktifGelistirme) return;
        if (
          altin >= yapi.maliyet.altin &&
          et >= yapi.maliyet.et &&
          tas >= yapi.maliyet.tas
        ) {
          altin -= yapi.maliyet.altin;
          et -= yapi.maliyet.et;
          tas -= yapi.maliyet.tas;
          aktifGelistirme = true;

          let kalanSure = yapi.sure;
          const sureDiv = document.getElementById(`${id}-sure`);
          sureDiv.textContent = `⏳ Kalan süre: ${saniyeyiDakikayaCevir(
            kalanSure
          )}`;
          const interval = setInterval(() => {
            kalanSure--;
            sureDiv.textContent = `⏳ Kalan süre: ${saniyeyiDakikayaCevir(
              kalanSure
            )}`;
            if (kalanSure <= 0) {
              clearInterval(interval);
              yapi.seviye = mevcutSeviye + 1;
              toplamSavunmaPuani += yapi.puan;
              aktifGelistirme = false;
              render();
            }
          }, 1000);

          render();
        } else {
          alert("Kaynak yetersiz!");
        }
      });
    });

    // Altın güncellemesi — buradaki hatayı düzelttik
    const goldSpan = document.querySelector(".gold-amount");
    if (goldSpan) goldSpan.textContent = altin;
  }

  render();
});
