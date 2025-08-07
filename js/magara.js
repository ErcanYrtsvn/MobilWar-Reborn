// magara.js  — localStorage entegre + çıkarınca kaleye iade

// Başlangıçta localStorage'tan yükle
let magaradakiBirlikler = JSON.parse(localStorage.getItem("magaraBirlikleri")) || {};

function getMagaraKapasite() {
    const levelText = document.getElementById("magaraLevel");
    const level = levelText ? parseInt(levelText.innerText) : 1;
    return (isNaN(level) ? 1 : level) * 100;
}

function getToplamSaklananBirlik() {
    return Object.values(magaradakiBirlikler).reduce((a, b) => a + b, 0);
}

function guncelleMagaraPanel() {
    // Her güncellemede localStorage'tan tekrar oku (birlikler.js ile senkron kalmak için)
    magaradakiBirlikler = JSON.parse(localStorage.getItem("magaraBirlikleri")) || {};

    const panel = document.getElementById("magaraPanel");
    if (!panel) return;

    panel.innerHTML = "";

    const kapasite = getMagaraKapasite();
    const toplam = getToplamSaklananBirlik();

    const kapasiteDiv = document.createElement("div");
    kapasiteDiv.innerHTML = `<strong>Kapasite:</strong> ${toplam} / ${kapasite}`;
    kapasiteDiv.style.marginBottom = "8px";
    panel.appendChild(kapasiteDiv);

    // Hiç birlik yoksa bilgi ver
    const keys = Object.keys(magaradakiBirlikler);
    if (keys.length === 0) {
        const bos = document.createElement("div");
        bos.textContent = "Mağarada birlik yok.";
        panel.appendChild(bos);
        return;
    }

    // Mevcut birlikleri göster + çıkartma alanı
    keys.forEach(birlik => {
        const adet = magaradakiBirlikler[birlik] || 0;
        const satir = document.createElement("div");
        satir.style = "display:flex; align-items:center; gap:8px; margin:6px 0; flex-wrap:wrap;";
        satir.innerHTML = `
            <strong style="min-width:160px">${birlik}</strong>
            <span style="width:80px">${adet} adet</span>
            <input type="number" id="cikart_${birlik}" placeholder="Adet" min="1" max="${adet}" style="width:80px; padding:3px;">
            <button onclick="birlikMagaradanCikart('${birlik}')" style="padding:4px 10px; border:none; border-radius:5px; background:#ffcc00; font-weight:bold;">Çıkart</button>
        `;
        panel.appendChild(satir);
    });
}

function birlikMagaradanCikart(birlik) {
    const input = document.getElementById(`cikart_${birlik}`);
    const adet = parseInt(input && input.value);

    if (isNaN(adet) || adet <= 0) {
        alert("Geçerli bir adet girin!");
        return;
    }

    // Güncel veriyi al
    magaradakiBirlikler = JSON.parse(localStorage.getItem("magaraBirlikleri")) || {};
    const mevcutMagara = magaradakiBirlikler[birlik] || 0;

    if (adet > mevcutMagara) {
        alert("Bu kadar birlik yok!");
        return;
    }

    // Mağaradan düş
    magaradakiBirlikler[birlik] = mevcutMagara - adet;
    if (magaradakiBirlikler[birlik] <= 0) {
        delete magaradakiBirlikler[birlik];
    }
    localStorage.setItem("magaraBirlikleri", JSON.stringify(magaradakiBirlikler));

    // Kaleye geri ekle
    const kaleKey = "kaleBirlikleri";
    const kaleBirlikleri = JSON.parse(localStorage.getItem(kaleKey)) || {};
    kaleBirlikleri[birlik] = (kaleBirlikleri[birlik] || 0) + adet;
    localStorage.setItem(kaleKey, JSON.stringify(kaleBirlikleri));

    // Panelleri güncelle
    if (typeof window.birliklerGuncelle === "function") {
        try { window.birliklerGuncelle(); } catch (e) { console.warn(e); }
    }
    guncelleMagaraPanel();
}

// Mağara sekmesi gösterildiğinde de paneli tazeleyelim
document.addEventListener("DOMContentLoaded", () => {
    guncelleMagaraPanel();
    // showSection override etmeye gerek yok; kullanıcı sekmeye tıklayınca manuel de çağırabiliriz.
    // const magaraBtn = document.querySelector(\"button[onclick=\\\"showSection('magara')\\\"]\");
    // if (magaraBtn) magaraBtn.addEventListener('click', guncelleMagaraPanel);
});
