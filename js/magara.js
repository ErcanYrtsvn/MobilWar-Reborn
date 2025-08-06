
// magara.js

let magaradakiBirlikler = {}; // {"Ejderha": 10, "Cüce": 20}

function getMagaraKapasite() {
    const levelText = document.getElementById("magaraLevel");
    const level = levelText ? parseInt(levelText.innerText) : 1;
    return level * 100;
}

function getToplamSaklananBirlik() {
    return Object.values(magaradakiBirlikler).reduce((a, b) => a + b, 0);
}

function guncelleMagaraPanel() {
    const panel = document.getElementById("magaraPanel");
    if (!panel) return;

    panel.innerHTML = "";

    const kapasite = getMagaraKapasite();
    const toplam = getToplamSaklananBirlik();

    const kapasiteDiv = document.createElement("div");
    kapasiteDiv.innerHTML = `<strong>Kapasite:</strong> ${toplam} / ${kapasite}`;
    panel.appendChild(kapasiteDiv);

    for (const [birlik, adet] of Object.entries(magaradakiBirlikler)) {
        const div = document.createElement("div");
        div.innerHTML = `
            <strong>${birlik}</strong>: ${adet} 🛡️<br>
            <input type="number" id="cikart_${birlik}" placeholder="Adet" min="1" max="${adet}" style="width: 60px;">
            <button onclick="birlikMagaradanCikart('${birlik}')">Çıkart</button>
        `;
        panel.appendChild(div);
    }
}

function birlikMagaradanCikart(birlik) {
    const input = document.getElementById(`cikart_${birlik}`);
    const adet = parseInt(input.value);

    if (isNaN(adet) || adet <= 0) {
        alert("Geçerli bir adet girin!");
        return;
    }

    if (adet > magaradakiBirlikler[birlik]) {
        alert("Bu kadar birlik yok!");
        return;
    }

    magaradakiBirlikler[birlik] -= adet;
    if (magaradakiBirlikler[birlik] <= 0) delete magaradakiBirlikler[birlik];

    guncelleMagaraPanel();
}

function sayfaHazirlaMagara() {
    const magaraPanel = document.getElementById("magaraPanel");
    if (magaraPanel) {
        guncelleMagaraPanel();
    }
}

document.addEventListener("DOMContentLoaded", sayfaHazirlaMagara);
