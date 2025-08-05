
document.addEventListener("DOMContentLoaded", function () {
    const birliklerListesi = [
        { ad: "Casus Kuş", ikon: "🕊️" },
        { ad: "Cüce", ikon: "🪓" },
        { ad: "Yük Arabası", ikon: "🛒" },
        { ad: "Elf", ikon: "🏹" },
        { ad: "Gnom", ikon: "🧪" },
        { ad: "Şaman", ikon: "🔮" },
        { ad: "Süvari", ikon: "🐎" },
        { ad: "Mancınık", ikon: "🎯" },
        { ad: "Pegasus", ikon: "🪽" },
        { ad: "Ogre", ikon: "👹" },
        { ad: "Ejderha", ikon: "🐉" },
        { ad: "Kaos", ikon: "💀" }
    ];

    const birliklerDiv = document.getElementById("birliklerListesi");

    birliklerListesi.forEach(birlik => {
        const birlikContainer = document.createElement("div");
        birlikContainer.style.display = "flex";
        birlikContainer.style.flexDirection = "column";
        birlikContainer.style.marginBottom = "15px";

        const satir = document.createElement("div");
        satir.style.display = "flex";
        satir.style.alignItems = "center";
        satir.style.justifyContent = "space-between";
        satir.style.gap = "10px";

        const birlikLabel = document.createElement("label");
        birlikLabel.style.flex = "1";
        birlikLabel.innerHTML = `<strong style="font-size: 16px;">${birlik.ikon} ${birlik.ad}:</strong> <span id="${birlik.ad.replace(/ /g, "_")}_adet">0 adet</span>`;

        const input = document.createElement("input");
        input.type = "number";
        input.placeholder = "Adet Yaz";
        input.min = "1";
        input.style.padding = "5px";
        input.style.width = "100px";
        input.style.borderRadius = "5px";
        input.style.border = "1px solid #ccc";
        input.style.textAlign = "center";

        satir.appendChild(birlikLabel);
        satir.appendChild(input);

        const buton = document.createElement("button");
        buton.textContent = "Mağaraya Gönder";
        buton.style.marginTop = "5px";
        buton.style.padding = "10px";
        buton.style.backgroundColor = "#FFD700";
        buton.style.border = "none";
        buton.style.cursor = "pointer";

        birlikContainer.appendChild(satir);
        birlikContainer.appendChild(buton);
        birliklerDiv.appendChild(birlikContainer);
    });
});
