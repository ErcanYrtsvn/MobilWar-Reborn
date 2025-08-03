let tapinakSeviye = 1;
let tapinakGelistirmeDevamEdiyor = false;
let tapinakGelistirmeSure = 0;
let tapinakGelistirmeInterval;
let tapinakIptalButonu;

const tapinakMaliyetHesapla = () => {
    const altin = 1000 * tapinakSeviye;
    const tas = 800 * tapinakSeviye;
    const sure = 300 + (tapinakSeviye - 1) * 60;
    return { altin, tas, sure };
};

const tapinakBonusAciklama = (seviye) => {
    switch (seviye) {
        case 1: return "☀️ Moral artışı: Savaşlarda %5 güç bonusu";
        case 2: return "⏱️ Üretim süresi azalır: Baraka %3 daha hızlı";
        case 3: return "🛡️ Kutsal koruma: İlk saldırıda %10 hasar emilimi";
        case 4: return "⚡ Aura: Birlik gücüne +2 bonus";
        case 5: return "🔁 Yenilenme: Ölen birliklerin %10’u geri döner";
        default: return "✨ Gizemli güçler Tapınak'ta saklı...";
    }
};

const tapinakGelistir = () => {
    if (tapinakGelistirmeDevamEdiyor) return;

    const { altin, tas, sure } = tapinakMaliyetHesapla();
    if (kaynaklar.altin < altin || kaynaklar.tas < tas) {
        alert("Yetersiz kaynak!");
        return;
    }

    kaynaklar.altin -= altin;
    kaynaklar.tas -= tas;
    guncelleKaynakGosterimi();

    tapinakGelistirmeDevamEdiyor = true;
    tapinakGelistirmeSure = sure;

    const tapinakDiv = document.getElementById("tapinak");
    const bilgiDiv = tapinakDiv.querySelector(".bilgi");
    bilgiDiv.innerHTML = `⏳ Geliştiriliyor... Kalan süre: <span id="tapinakSure">${formatSure(tapinakGelistirmeSure)}</span>`;

    tapinakIptalButonu = document.createElement("button");
    tapinakIptalButonu.innerText = "İptal Et";
    tapinakIptalButonu.onclick = tapinakIptalEt;
    bilgiDiv.appendChild(tapinakIptalButonu);

    tapinakGelistirmeInterval = setInterval(() => {
        tapinakGelistirmeSure--;
        document.getElementById("tapinakSure").innerText = formatSure(tapinakGelistirmeSure);

        if (tapinakGelistirmeSure <= 0) {
            clearInterval(tapinakGelistirmeInterval);
            tapinakSeviye++;
            tapinakGelistirmeDevamEdiyor = false;
            bilgiDiv.innerHTML = `✅ Tapınak seviyesi arttı! Yeni seviye: ${tapinakSeviye}<br>${tapinakBonusAciklama(tapinakSeviye)}`;
        }
    }, 1000);
};

const tapinakIptalEt = () => {
    clearInterval(tapinakGelistirmeInterval);
    tapinakGelistirmeDevamEdiyor = false;

    const { altin, tas } = tapinakMaliyetHesapla();
    kaynaklar.altin += altin;
    kaynaklar.tas += tas;
    guncelleKaynakGosterimi();

    const tapinakDiv = document.getElementById("tapinak");
    const bilgiDiv = tapinakDiv.querySelector(".bilgi");
    bilgiDiv.innerHTML = `❌ Geliştirme iptal edildi. Tapınak seviyesi: ${tapinakSeviye}`;
};

const tapinakArayuzOlustur = () => {
    const { altin, tas, sure } = tapinakMaliyetHesapla();

    return `
        <div class="yapi-kutu" id="tapinak">
            <img src="img/tapinak.png" class="yapi-icon">
            <div class="yapi-isim">Tapınak (Seviye ${tapinakSeviye})</div>
            <div class="bilgi">${tapinakBonusAciklama(tapinakSeviye)}</div>
            <div class="maliyet">
                💰 ${altin} &nbsp; 🪨 ${tas} &nbsp; ⏳ ${formatSure(sure)}
            </div>
            <button onclick="tapinakGelistir()">Geliştir</button>
        </div>
    `;
};
