// 🔰 Baraka Birlik Üretim Sistemi

// Kaynaklar
let altin = 100000;
let et = 100000;
let barakaSeviye = 1; // Bu seviye arttıkça yeni birlikler açılacak

// Süre formatı "hh:mm:ss" → Görseldeki süreler baz alınarak
const birlikler = [
  { seviye: 1,  ad: "Casus Kuş", altin: 100, et: 200, sure: "00:00:30", ikon: "🕊️" },
  { seviye: 2,  ad: "Cüce", altin: 200, et: 450, sure: "00:01:30", ikon: "🔨" },
  { seviye: 3,  ad: "Yük Arabası", altin: 1000, et: 1000, sure: "00:01:50", ikon: "🛺" },
  { seviye: 4,  ad: "Elf", altin: 400, et: 600, sure: "00:02:00", ikon: "🏹" },
  { seviye: 5,  ad: "Gnom", altin: 1600, et: 1600, sure: "00:02:20", ikon: "🧙" },
  { seviye: 6,  ad: "Şaman", altin: 2000, et: 2000, sure: "00:02:40", ikon: "🪄" },
  { seviye: 7,  ad: "Süvari", altin: 1200, et: 2400, sure: "00:02:50", ikon: "🐎" },
  { seviye: 8,  ad: "Mancınık", altin: 6000, et: 12000, sure: "00:04:30", ikon: "🛠️" },
  { seviye: 9,  ad: "Pegasus", altin: 4000, et: 3200, sure: "00:04:00", ikon: "🦄" },
  { seviye: 10, ad: "Ogre", altin: 18000, et: 18000, sure: "00:05:20", ikon: "👹" },
  { seviye: 11, ad: "Ejderha", altin: 40000, et: 24000, sure: "00:07:00", ikon: "🐉" },
  { seviye: 12, ad: "Kaos", altin: 100000, et: 100000, sure: "02:00:00", ikon: "☠️" },
];

// Sayfa yüklendiğinde
window.addEventListener("DOMContentLoaded", () => {
  const panel = document.getElementById("barakaPanel");
  const kaynakGoster = document.getElementById("kaynakDurumu");

  function guncelleKaynak() {
    kaynakGoster.textContent = `Altın: ${altin} | Et: ${et}`;
  }

  function timeToMs(t) {
    const [hh, mm, ss] = t.split(":").map(Number);
    return ((hh * 60 * 60) + (mm * 60) + ss) * 1000;
  }

  function birligiUret(birlik, adet, durumAlani) {
    const toplamAltin = birlik.altin * adet;
    const toplamEt = birlik.et * adet;

    if (altin >= toplamAltin && et >= toplamEt) {
      altin -= toplamAltin;
      et -= toplamEt;
      guncelleKaynak();
      durumAlani.textContent = `Üretim başladı (${adet}x ${birlik.ad})`;

      for (let i = 0; i < adet; i++) {
        setTimeout(() => {
          const span = document.createElement("div");
          span.textContent = `✅ ${birlik.ad} üretildi!`;
          durumAlani.appendChild(span);
        }, timeToMs(birlik.sure));
      }

    } else {
      durumAlani.textContent = "❌ Kaynak yetersiz!";
    }
  }

  birlikler.forEach(b => {
    const kutu = document.createElement("div");
    kutu.style.border = "1px solid #444";
    kutu.style.padding = "10px";
    kutu.style.marginBottom = "8px";

    const kilitli = barakaSeviye < b.seviye;
    const ikon = document.createElement("span");
    ikon.textContent = b.ikon + " ";

    const ad = document.createElement("strong");
    ad.textContent = b.ad;

    const adetInput = document.createElement("input");
    adetInput.type = "number";
    adetInput.min = 1;
    adetInput.value = 1;
    adetInput.style.margin = "0 8px";

    const buton = document.createElement("button");
    buton.textContent = "Üret";
    buton.disabled = kilitli;

    const durum = document.createElement("div");
    durum.style.fontSize = "12px";
    durum.style.marginTop = "4px";

    buton.addEventListener("click", () => {
      birligiUret(b, parseInt(adetInput.value), durum);
    });

    kutu.appendChild(ikon);
    kutu.appendChild(ad);
    kutu.appendChild(document.createTextNode(` | Altın: ${b.altin}, Et: ${b.et}, Süre: ${b.sure}`));
    kutu.appendChild(adetInput);
    kutu.appendChild(buton);
    kutu.appendChild(durum);

    if (kilitli) {
      const kilit = document.createElement("span");
      kilit.textContent = " 🔒 Seviye yetersiz";
      kutu.appendChild(kilit);
    }

    panel.appendChild(kutu);
  });

  guncelleKaynak();
});
