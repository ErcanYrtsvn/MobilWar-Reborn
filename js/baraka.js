const kaynaklar = {
  altin: 100000,
  et: 100000
};

const birlikler = [
  { ad: "Casus Kuş", ikon: "🕊️", altin: 100, et: 200, sure: "00:00:30", seviye: 1 },
  { ad: "Cüce", ikon: "⛏️", altin: 200, et: 450, sure: "00:01:30", seviye: 2 },
  { ad: "Yük Arabası", ikon: "🚛", altin: 1000, et: 1000, sure: "00:01:50", seviye: 3 },
  { ad: "Elf", ikon: "🏹", altin: 400, et: 600, sure: "00:02:00", seviye: 4 },
  { ad: "Gnom", ikon: "🧙", altin: 1600, et: 1600, sure: "00:02:20", seviye: 5 },
  { ad: "Şaman", ikon: "🪄", altin: 2000, et: 2000, sure: "00:02:40", seviye: 6 },
  { ad: "Süvari", ikon: "🐎", altin: 1200, et: 2400, sure: "00:02:50", seviye: 7 },
  { ad: "Mancınık", ikon: "🎯", altin: 6000, et: 12000, sure: "00:04:30", seviye: 8 },
  { ad: "Pegasus", ikon: "🦄", altin: 4000, et: 3200, sure: "00:04:00", seviye: 9 },
  { ad: "Ogre", ikon: "👹", altin: 18000, et: 18000, sure: "00:05:20", seviye: 10 },
  { ad: "Ejderha", ikon: "🐉", altin: 40000, et: 24000, sure: "00:07:00", seviye: 11 },
  { ad: "Kaos", ikon: "☠️", altin: 100000, et: 100000, sure: "02:00:00", seviye: 12 }
];

const barakaSeviye = 12;

function timeToMs(sure) {
  const [saat, dakika, saniye] = sure.split(":").map(Number);
  return ((saat * 3600) + (dakika * 60) + saniye) * 1000;
}

function guncelleKaynakGosterimi() {
  document.getElementById("kaynakDurumu").innerText =
    `Altın: ${kaynaklar.altin.toLocaleString()} | Et: ${kaynaklar.et.toLocaleString()}`;
}

function olusturBarakaPaneli() {
  const panel = document.getElementById("barakaPanel");
  panel.innerHTML = "";
  guncelleKaynakGosterimi();

  birlikler.forEach((birlik) => {
    const birlikDiv = document.createElement("div");
    birlikDiv.style.border = "1px solid #555";
    birlikDiv.style.padding = "0.8rem";
    birlikDiv.style.marginBottom = "1rem";
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
      input.style.marginTop = "0.5rem";
      input.style.padding = "0.4rem";
      input.style.width = "60px";

      const buton = document.createElement("button");
      buton.innerText = "Üret";
      buton.style.display = "block";
      buton.style.marginTop = "0.5rem";
      buton.style.backgroundColor = "#ffcc00";
      buton.style.color = "#000";
      buton.style.border = "none";
      buton.style.padding = "0.5rem 1rem";
      buton.style.cursor = "pointer";
      buton.style.fontWeight = "bold";
      buton.style.borderRadius = "5px";

      const durum = document.createElement("div");
      durum.style.marginTop = "0.5rem";
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
          durum.innerHTML = `Üretim başladı (${adet}x ${birlik.ad})<br>`;

          for (let i = 0; i < adet; i++) {
            const kalanSpan = document.createElement("span");
            kalanSpan.innerText = `⏳ ${birlik.ad} kalan süre: ${birlik.sure}`;
            durum.appendChild(kalanSpan);
            durum.appendChild(document.createElement("br"));

            let kalan = sureMs / 1000;
            const interval = setInterval(() => {
              kalan--;
              if (kalan > 0) {
                const dk = String(Math.floor(kalan / 60)).padStart(2, "0");
                const sn = String(kalan % 60).padStart(2, "0");
                kalanSpan.innerText = `⏳ ${birlik.ad} kalan süre: 00:${dk}:${sn}`;
              } else {
                clearInterval(interval);
                kalanSpan.innerText = `✅ ${birlik.ad} üretildi!`;
              }
            }, 1000);
          }
        } else {
          alert("Yetersiz kaynak!");
        }
      };

      birlikDiv.appendChild(input);
      birlikDiv.appendChild(buton);
      birlikDiv.appendChild(durum);
    } else {
      const kilitli = document.createElement("div");
      kilitli.innerHTML = "🔒 Seviye yetersiz";
      kilitli.style.marginTop = "0.5rem";
      birlikDiv.appendChild(kilitli);
    }

    panel.appendChild(birlikDiv);
  });
}

document.addEventListener("DOMContentLoaded", olusturBarakaPaneli);
