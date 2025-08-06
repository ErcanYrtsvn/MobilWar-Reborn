// magara.js

// Mağara bilgileri let magaradakiBirlikler = {}; // {"Ejderha": 10, "Cüce": 20} gibi

// Kapasite formülü: seviye * 100 function getMagaraKapasite() { const levelText = document.getElementById("magaraLevel").innerText; const level = parseInt(levelText); return level * 100; }

function getToplamSaklananBirlik() { return Object.values(magaradakiBirlikler).reduce((a, b) => a + b, 0); }

function guncelleMagaraPanel() { const panel = document.getElementById("magaraPanel"); panel.innerHTML = "";

const kapasite = getMagaraKapasite();
const toplam = getToplamSaklananBirlik();

const kapasiteDiv = document.createElement("div");
kapasiteDiv.innerHTML = `<strong>Kapasite:</strong> ${toplam} / ${kapasite}`;
panel.appendChild(kapasiteDiv);

// Mevcut birlik listesini göster
for (const [birlik, adet] of Object.entries(magaradakiBirlikler)) {
    const div = document.createElement("div");
    div.innerText = `${birlik}: ${adet} 🛡️`;
    panel.appendChild(div);
}

// Yeni birlik ekleme arayüzü
const ekleDiv = document.createElement("div");
ekleDiv.innerHTML = `<br><strong>Birlik Sakla:</strong><br>
<input type="text" id="birlikAdi" placeholder="Birlik Adı (örn: Ejderha)"><br>
<input type="number" id="birlikAdet" placeholder="Adet"><br>
<button onclick="birlikMagarayaEkle()">Mağaraya Gönder</button>`;
panel.appendChild(ekleDiv);

}

function birlikMagarayaEkle() { const birlik = document.getElementById("birlikAdi").value.trim(); const adet = parseInt(document.getElementById("birlikAdet").value);

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

// Mağara sekmesi açıldığında paneli güncelle if (document.getElementById("magaraPanel")) { guncelleMagaraPanel(); }

