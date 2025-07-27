function startGame() {
    const area = document.getElementById('gameArea');
    area.innerHTML = '<p>Oyun başladı! Birimler hazırlanıyor...</p>';
    document.getElementById('mainMenu').style.display = 'block';
}

function goToBarracks() {
    const area = document.getElementById('gameArea');
    area.innerHTML = `
        <h2>🏹 Baraka</h2>
        <p>Üreteceğiniz asker sayısını girin:</p>
        <input type="number" id="unitCount" value="1" min="1" max="100">
        <button onclick="trainUnits()">Eğit</button>
        <p id="resultMsg"></p>
        <br>
        <button onclick="startGame()">🔙 Ana Menüye Dön</button>
    `;
}

let totalUnits = 0;

function trainUnits() {
    const count = parseInt(document.getElementById('unitCount').value);
    if (isNaN(count) || count < 1) {
        document.getElementById('resultMsg').innerText = "Geçerli bir sayı girin.";
        return;
    }

    totalUnits += count;
    document.getElementById('resultMsg').innerText = `${count} asker eğitildi. Toplam asker: ${totalUnits}`;
}
