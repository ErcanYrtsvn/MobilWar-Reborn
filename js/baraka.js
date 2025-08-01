
let kaynaklar = {
  altin: 100000,
  et: 100000
};

let barakaSeviye = 12;

const birlikler = [
  { id: "casusKus", ad: "Casus Kuş", ikon: "🕊️", altin: 100, et: 200, sure: "00:00:30", seviye: 1 },
  { id: "cuce", ad: "Cüce", ikon: "⛏️", altin: 200, et: 450, sure: "00:01:30", seviye: 2 },
  { id: "yukArabasi", ad: "Yük Arabası", ikon: "🚛", altin: 1000, et: 1000, sure: "00:01:50", seviye: 3 },
  { id: "elf", ad: "Elf", ikon: "🏹", altin: 400, et: 600, sure: "00:02:00", seviye: 4 },
  { id: "gnom", ad: "Gnom", ikon: "🧙", altin: 1600, et: 1600, sure: "00:02:20", seviye: 5 },
  { id: "saman", ad: "Şaman", ikon: "🪄", altin: 2000, et: 2000, sure: "00:02:40", seviye: 6 },
  { id: "suvari", ad: "Süvari", ikon: "🐎", altin: 1200, et: 2400, sure: "00:02:50", seviye: 7 },
  { id: "mancinak", ad: "Mancınık", ikon: "🎯", altin: 6000, et: 12000, sure: "00:04:30", seviye: 8 },
  { id: "pegasus", ad: "Pegasus", ikon: "🦄", altin: 4000, et: 3200, sure: "00:04:00", seviye: 9 },
  { id: "ogre", ad: "Ogre", ikon: "👹", altin: 18000, et: 18000, sure: "00:05:20", seviye: 10 },
  { id: "ejderha", ad: "Ejderha", ikon: "🐉", altin: 40000, et: 24000, sure: "00:07:00", seviye: 11 },
  { id: "kaos", ad: "Kaos", ikon: "☠️", altin: 100000, et: 100000, sure: "02:00:00", seviye: 12 }
];

function timeToMs(sure) {
  const [saat, dakika, saniye] = sure.split(":").map(Number);
  return ((saat * 3600) + (dakika * 60) + saniye) * 1000;
}

function guncelleKaynakGosterimi() {
  const el = document.getElementById("kaynakDurumu");
  if (el) el.innerText = `Altın: ${kaynaklar.altin.toLocaleString()} | Et: ${kaynaklar.et.toLocaleString()}`;
}

function olusturBarakaPaneli() {
  const panel = document.getElementById("barakaPanel");
  if (!panel) return;
  panel.innerHTML = "";
  guncelleKaynakGosterimi();

  birlikler.forEach((birlik) => {
    const birlikDiv = document.createElement("div");
    birlikDiv.style.marginBottom = "1rem";
    birlikDiv.style.padding = "1rem";
    birlikDiv.style.border = "1px solid #555";
    birlikDiv.style.borderRadius = "6px";
    birlikDiv.style.backgroundColor = "#2a1b0a";

    const header = document.createElement("div");
    header.innerHTML = `<strong>${birlik.ikon} ${birlik.ad}</strong> | Altın: ${birlik.altin}, Et: ${birlik.et}, Süre: ${birlik.sure}`;
    birlikDiv.appendChild(header);

    if (barakaSeviye >= birlik.seviye) {
      const input = document.createElement("input");
      input.type = "number";
      input.min = 1;
      input.value = 1;
      input.style.width = "60px";
      input.style.marginRight = "10px";

      const buton = document.createElement("button");
      buton.textContent = "Üret";
      buton.style.marginRight = "10px";

      const durum = document.createElement("div");
      durum.style.marginTop = "8px";
      durum.style.fontSize = "0.9rem";

      buton.onclick = () => {
        const adet = parseInt(input.value);
        const toplamAltin = birlik.altin * adet;
        const toplamEt = birlik.et * adet;
        const sureMs = timeToMs(birlik.sure);

        if (kaynaklar.altin >= toplamAltin && kaynaklar.et >= toplamEt) {
          kaynaklar.altin -= toplamAltin;
          kaynaklar.et -= toplamEt;
          guncelleKaynakGosterimi();

          const satir = document.createElement("div");
          let kalan = adet;
          const span = document.createElement("span");
          const iptal = document.createElement("button");
          iptal.textContent = "İptal";
          iptal.style.marginLeft = "10px";
          iptal.style.backgroundColor = "#800";
          iptal.style.color = "#fff";
          iptal.style.border = "none";
          iptal.style.padding = "4px 8px";
          iptal.style.cursor = "pointer";
          iptal.style.borderRadius = "4px";

          satir.appendChild(span);
          satir.appendChild(iptal);
          durum.appendChild(satir);

          let queue = kalan;
          span.innerText = `⏳ ${birlik.ad} (${adet}x) kalan: ${queue}`;

          const interval = setInterval(() => {
            queue--;
            if (queue > 0) {
              span.innerText = `⏳ ${birlik.ad} (${adet}x) kalan: ${queue}`;
            } else {
              clearInterval(interval);
              span.innerText = `✅ ${birlik.ad} üretildi (${adet}x)`;
              iptal.remove();
            }
          }, sureMs);

          iptal.onclick = () => {
            clearInterval(interval);
            satir.remove();
          };

        } else {
          alert("Yetersiz kaynak!");
        }
      };

      birlikDiv.appendChild(input);
      birlikDiv.appendChild(buton);
      birlikDiv.appendChild(durum);
    } else {
      const kilit = document.createElement("div");
      kilit.textContent = "🔒 Seviye yetersiz";
      birlikDiv.appendChild(kilit);
    }

    panel.appendChild(birlikDiv);
  });
}

document.addEventListener("DOMContentLoaded", olusturBarakaPaneli);
