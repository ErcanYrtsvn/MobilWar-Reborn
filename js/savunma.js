document.addEventListener("DOMContentLoaded", () => {
    const defensePanel = document.getElementById("savunmaPanel");

    if (!defensePanel) {
        console.error("❌ HATA: savunmaPanel bulunamadı!");
        return;
    }

    const defenses = [
        {
            name: "🏰 Kale",
            gold: 100,
            food: 200,
            stone: 300,
            duration: 60
        },
        {
            name: "🏹 Okçu Kulesi",
            gold: 150,
            food: 100,
            stone: 250,
            duration: 90
        },
        {
            name: "🔥 Yağ Kazanı",
            gold: 200,
            food: 150,
            stone: 100,
            duration: 75
        },
        {
            name: "🛡️ Surlar",
            gold: 300,
            food: 100,
            stone: 200,
            duration: 120
        },
        {
            name: "🚪 Demir Kapı",
            gold: 250,
            food: 200,
            stone: 150,
            duration: 105
        }
    ];

    defenses.forEach(defense => {
        const container = document.createElement("div");
        container.className = "defense-item";
        container.style.border = "1px solid #ccc";
        container.style.padding = "10px";
        container.style.marginBottom = "10px";
        container.style.background = "#3e2b1c";
        container.style.borderRadius = "8px";

        const title = document.createElement("h3");
        title.textContent = `${defense.name}`;
        title.style.marginBottom = "5px";

        const info = document.createElement("p");
        info.innerHTML = `
            💰 ${defense.gold} 
            🍖 ${defense.food} 
            🪨 ${defense.stone} 
            ⏳ ${formatTime(defense.duration)}
        `;

        const btn = document.createElement("button");
        btn.textContent = "Geliştir";
        btn.style.marginTop = "5px";
        btn.onclick = () => {
            alert(`${defense.name} geliştirme başladı!`);
            // Geliştirme animasyonu/süreci buraya entegre edilebilir
        };

        container.appendChild(title);
        container.appendChild(info);
        container.appendChild(btn);
        defensePanel.appendChild(container);
    });

    function formatTime(seconds) {
        const mins = String(Math.floor(seconds / 60)).padStart(2, "0");
        const secs = String(seconds % 60).padStart(2, "0");
        return `${mins}:${secs}`;
    }
});
