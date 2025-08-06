// magara.js

// Mağarada saklanan birlikler
let magaradakiBirlikler = {}; // {"Ejderha": 10, "Cüce": 20} gibi

// Mağara kapasitesi: seviye * 100
function getMagaraKapasite() {
    const levelText = document.getElementById("magaraLevel").innerText;
    const level = parseInt(levelText);
    return level * 100;
}

// Toplam saklanan birlik
function getToplamSaklananBirlik() {
    return Object.values(magaradakiBirlikler).reduce((a, b) => a + b, 0);
}

// Paneli güncelle
function guncelleMagaraPanel() {
    const panel = document.getElementById("magaraPanel");
    if (!panel) return;

    panel.innerHTML = "";

    const kapasite = getMagaraKapasite();
    const toplam = getToplamSaklananBirlik();

    const kapasiteDiv = document.createElement("div");
    kapasiteDiv.innerHTML = `<strong>Kapasite:</strong> ${toplam} / ${kapasite}`;
    panel.appendChild(kapasiteDiv);

    // Mevcut birlikleri göster
    for (const [birlik, adet] of Object.entries(magaradakiBirlikler)) {
        const div = document.createElement("div");
        div.innerText = `${birlik}: ${adet} 🛡️`;
        panel.appendChild(div);
    }

    // Yeni birlik ekleme arayüzü
    const ekleDiv = document.createElement("div");
    ekleDiv.innerHTML = `
        <br><strong>Birlik Sakla:</strong><br>
        <input type="text" id="birlikAdi" placeholder="Birlik Adı (örn: Ejderha)"><br>
        <input type="number" id="birlikAdet" placeholder="Adet"><br>
        <button onclick="birlikMagarayaEkle()">Mağaraya Gönder</button>
    `;
    panel.appendChild(ekleDiv);
}

// Birlik ekle
function birlikMagarayaEkle() {
    const birlik = document.getElementById("birlikAdi").value.trim();
    const adet = parseInt(document.getElementById("birlikAdet").value);

    if (!birlik || isNaN(adet) || adet <= 0) {
        alert("Geçerli birlik adı ve adet girin!");
        return;
    }

    const kapasite = getMagaraKapasite();
    const mevcut = getToplamSaklananBirlik();

    if (mevcut + adet > kapasite) {
        alert("Mağara kapasitesi yetersiz!");
        return;
    }

    if (!magaradakiBirlikler[birlik]) magaradakiBirlikler[birlik] = 0;
    magaradakiBirlikler[birlik] += adet;

    guncelleMagaraPanel();
}

// Sayfa açıldığında güncelle
document.addEventListener("DOMContentLoaded", () => {
    const magaraPanel = document.getElementById("magaraPanel");
    if (magaraPanel) {
        guncelleMagaraPanel();
    }
});
