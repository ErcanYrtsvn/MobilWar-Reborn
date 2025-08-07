
// Harita 2.0 ayarları
const WORLD_W = 20000;
const WORLD_H = 20000;
const CENTER_X = WORLD_W/2;
const CENTER_Y = WORLD_H/2;

const mapContainer = document.getElementById("mapContainer");
const koordinatDiv = document.getElementById("koordinatlar");

window.onload = function () {
    // merkeze git
    window.scrollTo(CENTER_X - window.innerWidth / 2, CENTER_Y - window.innerHeight / 2);
    guncelleKonum();
    spawnMonsters();
};

mapContainer.addEventListener("mousemove", function (e) {
    const x = e.pageX;
    const y = e.pageY;
    koordinatDiv.textContent = `X: ${x}, Y: ${y}`;
});

function konumaGit() {
    window.scrollTo(CENTER_X - window.innerWidth / 2, CENTER_Y - window.innerHeight / 2);
}

function guncelleKonum() {
    const x = Math.max(0, Math.min(WORLD_W, window.scrollX + window.innerWidth / 2));
    const y = Math.max(0, Math.min(WORLD_H, window.scrollY + window.innerHeight / 2));
    koordinatDiv.textContent = `X: ${Math.floor(x)}, Y: ${Math.floor(y)}`;
}

window.addEventListener("scroll", guncelleKonum);

// Basit yaratık sistemi: küçük/orta/büyük
const CREATURES = [
  {type:'küçük', icon:'monster_small.png', power: 20, loot:{gold: 50, food: 30}, size: 36},
  {type:'orta',  icon:'monster_mid.png',   power: 80, loot:{gold:150, food:100}, size: 44},
  {type:'büyük', icon:'monster_big.png',   power:200, loot:{gold:400, food:300}, size: 54},
];
const SPAWN_COUNT = 18;
const monsters = [];

function spawnMonsters(){
  if(!mapContainer) return;
  for(let i=0;i<SPAWN_COUNT;i++){
    const data = CREATURES[Math.floor(Math.random()*CREATURES.length)];
    const x = randInt(200, WORLD_W-200), y = randInt(200, WORLD_H-200);
    const el = document.createElement('img');
    el.src = data.icon;
    el.alt = data.type + ' yaratık';
    el.className = 'monster';
    el.style.position = 'absolute';
    el.style.left = x + 'px';
    el.style.top  = y + 'px';
    el.style.width = data.size + 'px';
    el.style.height = data.size + 'px';
    el.addEventListener('click', ()=> attackMonster({el,x,y,data}));
    mapContainer.appendChild(el);
    monsters.push({el,x,y,data});
  }
}

function attackMonster(m){
  // Basit demo: army power bilinmiyorsa her zaman kazan/uyar
  const myPower = window.getArmyPower ? window.getArmyPower() : 9999;
  if(myPower >= m.data.power){
    alert(`✅ ${m.data.type.toUpperCase()} yaratık yenildi! +${m.data.loot.gold} altın, +${m.data.loot.food} yemek`);
    m.el.remove();
  }else{
    alert(`❌ Gücün yetersiz (${myPower} < ${m.data.power})`);
  }
}

function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
