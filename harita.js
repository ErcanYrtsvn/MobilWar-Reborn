const mapContainer = document.getElementById("mapContainer");
const koordinatDiv = document.getElementById("koordinatlar");

window.onload = function () {
    window.scrollTo(5000 - window.innerWidth / 2, 5000 - window.innerHeight / 2);
    guncelleKonum();
};

mapContainer.addEventListener("mousemove", function (e) {
    const x = e.pageX;
    const y = e.pageY;
    koordinatDiv.textContent = `X: ${x}, Y: ${y}`;
});

function konumaGit() {
    window.scrollTo(5000 - window.innerWidth / 2, 5000 - window.innerHeight / 2);
}

function guncelleKonum() {
    const x = window.scrollX + window.innerWidth / 2;
    const y = window.scrollY + window.innerHeight / 2;
    koordinatDiv.textContent = `X: ${Math.floor(x)}, Y: ${Math.floor(y)}`;
}

window.addEventListener("scroll", guncelleKonum);


// ---- Harita genişletme & HUD koordinat güncelleme hook ----
(function(){
  const mapContainer = document.getElementById("mapContainer");
  const koordinatDiv = document.getElementById("koordinatlar");
  function guncelleKonum(){
    if(!koordinatDiv) return;
    const WORLD_W = mapContainer ? mapContainer.scrollWidth : window.innerWidth;
    const WORLD_H = mapContainer ? mapContainer.scrollHeight : window.innerHeight;
    const x = Math.max(0, Math.min(WORLD_W, window.scrollX + window.innerWidth / 2));
    const y = Math.max(0, Math.min(WORLD_H, window.scrollY + window.innerHeight / 2));
    koordinatDiv.textContent = `X: ${Math.floor(x)}, Y: ${Math.floor(y)}`;
  }
  window.addEventListener("scroll", guncelleKonum);
  window.addEventListener("load", guncelleKonum);
})();

// ---- Yaratık sistemi (küçük/orta/büyük) ----
(function(){
  if (window.__monsters_injected__) return; // idempotent
  window.__monsters_injected__ = true;

  const mapContainer = document.getElementById("mapContainer");
  if(!mapContainer) return;

  const CREATURES = [
    {type:'küçük', src:'monster_small.png', power: 20, loot:{gold: 60, food: 40}, size: 200},
    {type:'orta',  src:'monster_mid.png',   power: 100, loot:{gold:200, food:140}, size: 280},
    {type:'büyük', src:'monster_big.png',   power: 260, loot:{gold:520, food:360}, size: 360},
  ];
  const SPAWN_COUNT = 24;

  function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

  function spawnMonsters(){
    for(let i=0;i<SPAWN_COUNT;i++){
      const data = CREATURES[Math.floor(Math.random()*CREATURES.length)];
      const x = randInt(300, (mapContainer.scrollWidth||22000)-300);
      const y = randInt(300, (mapContainer.scrollHeight||22000)-300);
      const el = document.createElement('img');
      el.src = data.src;
      el.alt = data.type + ' yaratık';
      el.className = 'monster';
      el.style.left = x + 'px';
      el.style.top  = y + 'px';
      el.style.width = data.size + 'px';
      el.style.height = data.size + 'px';
      el.addEventListener('click', () => attackMonster({el, data}));
      mapContainer.appendChild(el);
    }
  }

  function grantLoot(gold, food){
    if (typeof addGold === "function") addGold(gold);
    if (typeof addFood === "function") addFood(food);
  }

  window.attackMonster = function(m){
    const myPower = window.getArmyPower ? window.getArmyPower() : 9999;
    if(myPower >= m.data.power){
      grantLoot(m.data.loot.gold, m.data.loot.food);
      alert(`✅ ${m.data.type.toUpperCase()} yaratık yenildi! +${m.data.loot.gold} altın, +${m.data.loot.food} yemek`);
      m.el.remove();
    }else{
      alert(`❌ Gücün yetersiz (Gücün: ${myPower} < Gereken: ${m.data.power})`);
    }
  };

  // otomatik spawn
  if (document.readyState === "complete") spawnMonsters();
  else window.addEventListener("load", spawnMonsters);
})();

// ---- Şehir ganimeti & savunma (mevcut .mapIcon'lara tıklama) ----
(function(){
  const cities = Array.from(document.querySelectorAll('.mapIcon'));
  if (!cities.length) return;

  // Temsili yüksek ganimet + savunma değerleri (indexe göre ölçek)
  const base = {gold: 600, food: 400, power: 280};
  function scaled(i){
    return {
      gold: base.gold + i*120,
      food: base.food + i*90,
      power: base.power + i*60
    };
  }

  function grantLoot(gold, food){
    if (typeof addGold === "function") addGold(gold);
    if (typeof addFood === "function") addFood(food);
  }

  cities.forEach((el, i) => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const cfg = scaled(i);
      const myPower = window.getArmyPower ? window.getArmyPower() : 9999;
      if (myPower >= cfg.power){
        grantLoot(cfg.gold, cfg.food);
        alert(`🏙️ Şehir ele geçirildi!
+${cfg.gold} altın, +${cfg.food} yemek (Gerekli güç: ${cfg.power})`);
      } else {
        alert(`🛡️ Şehir savunması çok güçlü! (Senin güç: ${myPower}, Gereken: ${cfg.power})`);
      }
    });
  });
})();
