// app.js

let currentScreen = "menu"; let soldiers = 0; let academyLevel = 1; let gold = 100;

function goTo(screen) { document.querySelectorAll(".screen").forEach(s => s.classList.remove("active")); document.getElementById(screen).classList.add("active"); currentScreen = screen; if (screen === "city") updateCity(); }

function updateCity() { document.getElementById("barracks-info").innerText = Mevcut Asker: ${soldiers}; document.getElementById("academy-info").innerText = Akademi Seviyesi: ${academyLevel}; }

function trainSoldiers() { const input = document.getElementById("soldier-count"); const count = parseInt(input.value); if (isNaN(count) || count <= 0) { alert("Geçerli bir asker sayısı giriniz."); return; } const cost = count * 10; if (gold >= cost) { soldiers += count; gold -= cost; updateCity(); alert(${count} asker eğitildi!); } else { alert("Yeterli altın yok!"); } input.value = ""; }

function upgradeAcademy() { const cost = academyLevel * 100; if (gold >= cost) { academyLevel++; gold -= cost; updateCity(); alert("Akademi seviyesi yükseltildi!"); } else { alert("Yeterli altın yok!"); } }

function attackEnemy() { if (soldiers < 5) { document.getElementById("battle-result").innerText = "Saldırı için yeterli asker yok."; return; }

const success = Math.random() < (0.4 + academyLevel * 0.1); if (success) { const loot = 50 + Math.floor(Math.random() * 100); gold += loot; document.getElementById("battle-result").innerText = Zafer! ${loot} altın kazandınız.; } else { const loss = Math.floor(soldiers * 0.3); soldiers -= loss; document.getElementById("battle-result").innerText = Kaybettiniz. ${loss} asker öldü.; } updateCity(); }
