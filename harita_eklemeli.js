const mapContainer = document.getElementById("mapContainer");
const koordinatDiv = document.getElementById("koordinatlar");

window.onload = function () {
      try{ spawnMonsters(); }catch(e){}; window.scrollTo(5000 - window.innerWidth / 2, 5000 - window.innerHeight / 2);
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


// ---- Yaratık sistemi (küçük/orta/büyük) — mevcut koda ek ----
const CREATURES = [
  {type:'küçük', src:'monster_small.png', power: 20, loot:{gold:50, food:30}, size: 36},
  {type:'orta',  src:'monster_mid.png',   power: 80, loot:{gold:150, food:100}, size: 44},
  {type:'büyük', src:'monster_big.png',   power:200, loot:{gold:400, food:300}, size: 54},
];
const SPAWN_COUNT = 16;

function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }

function spawnMonsters(){
  if(!mapContainer) return;
  for(let i=0; i<SPAWN_COUNT; i++){
    const data = CREATURES[Math.floor(Math.random()*CREATURES.length)];
    const x = randInt(200, 19800);
    const y = randInt(200, 19800);
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

function attackMonster(m){
  // Oyun kaynak sistemine bağlamak istersen addGold/addFood fonksiyonlarını çağırabiliriz.
  alert(`✅ ${m.data.type.toUpperCase()} yaratık yenildi! +${m.data.loot.gold} altın, +${m.data.loot.food} yemek`);
  m.el.remove();
}

