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
  MW_openBattleModal({
    title: `👹 ${m.data.type.toUpperCase()} Yaratık`,
    power: m.data.power,
    loot: m.data.loot,
    targetEl: m.el,
    info: 'Yenersen ganimet dönüşte kasana eklenecek.'
  });
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
    MW_openBattleModal({
      title: '🏙️ Şehir',
      power: cfg.power,
      loot: { gold: cfg.gold, food: cfg.food },
      targetEl: el,
      info: 'Şehri ele geçirirsen ganimet dönüşte kasana eklenecek.'
    });
  });
});
})();


// ====== Modal + Sefer Sistemi (non-breaking, append only) ======
(function(){
  // ----- Modal -----
  const overlay = document.getElementById('mwOverlay');
  const modal   = document.getElementById('mwModal');
  const tEl = document.getElementById('mwTitle');
  const pEl = document.getElementById('mwPower');
  const lEl = document.getElementById('mwLoot');
  const etaEl = document.getElementById('mwETA');
  const iEl = document.getElementById('mwInfo');
  const attackBtn = document.getElementById('mwAttackBtn');
  const closeBtn  = document.getElementById('mwCloseBtn');
  const cancelBtn = document.getElementById('mwCancelBtn');

  let current = null; // { title, power, loot, targetEl, info, etaSecs }

  function show(el){ el && (el.style.display='block'); }
  function hide(el){ el && (el.style.display='none'); }

  function openModal(cfg){
    current = cfg;
    tEl.textContent = cfg.title || 'Hedef';
    pEl.textContent = 'Gerekli güç: ' + (cfg.power ?? '-');
    const loot = cfg.loot || {};
    const lootStr = [
      loot.gold ? (loot.gold + ' altın') : null,
      loot.food ? (loot.food + ' yemek') : null,
      loot.stone? (loot.stone+ ' taş')   : null
    ].filter(Boolean).join(', ');
    lEl.textContent = 'Ganimet: ' + (lootStr || '-');
    etaEl.textContent = 'Tahmini varış: ' + (cfg.etaSecs ?? '-') + ' sn';
    iEl.textContent = cfg.info || '';
    show(overlay); show(modal);
  }
  function closeModal(){ hide(modal); hide(overlay); current = null; }

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);
  overlay?.addEventListener('click', closeModal);

  // ----- Sefer Sistemi -----
  const PX_PER_SEC = 350; // hız (yaklaşık)
  const KEY = "mw_marches_v2";
  const map = document.getElementById('mapContainer');
  const castleEl = document.getElementById('oyuncuKalesi');

  const num = v => parseFloat(String(v).replace('px',''))||0;
  const centerPos = el => ({ x: num(el.style.left)+el.offsetWidth/2, y: num(el.style.top)+el.offsetHeight/2 });
  const dist = (a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const lerp = (a,b,t)=>a+(b-a)*t;
  const clamp01 = v=>Math.max(0,Math.min(1,v));

  function secsForDistance(d){ return Math.max(3, Math.round(d / PX_PER_SEC)); }

  function load(){ return JSON.parse(localStorage.getItem(KEY)||"[]"); }
  function save(arr){ localStorage.setItem(KEY, JSON.stringify(arr)); }

  // HUD içine kısa sayaç
  const hud = document.getElementById('konumPanel');
  const listId = 'mwMarchList';
  if (hud && !document.getElementById(listId)){
    const box = document.createElement('div');
    box.id = listId; box.style.marginTop='10px'; box.style.fontSize='16px';
    hud.appendChild(box);
  }
  function renderHud(){
    const box = document.getElementById(listId); if(!box) return;
    const ms = load(); const now=Date.now();
    box.innerHTML = ms.map(m=>{
      const remain = Math.max(0, Math.ceil((m.endsAt - now)/1000));
      const phaseTxt = (m.phase==='going'?'Gidiş':'Dönüş');
      return `<div>🚩 ${m.title} — ${phaseTxt} ⏳ ${remain}s</div>`;
    }).join('');
  }

  // Haritada yürüyen birlik işareti
  const markers = new Map(); // id -> {el}
  function ensureMarker(m){
    if (markers.has(m.id)) return markers.get(m.id);
    const el = document.createElement('div');
    el.className = 'mw-march';
    el.textContent = '🚩'; // dilersen PNG koyabilirsin
    map.appendChild(el);
    const obj = { el };
    markers.set(m.id, obj);
    return obj;
  }
  function removeMarker(id){ const o=markers.get(id); if(o){ o.el.remove(); markers.delete(id);} }

  function positionFor(m, tNorm){
    const from = m.from, to = m.to;
    const t = (m.phase==='going') ? tNorm : 1 - tNorm;
    return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) };
  }

  function tick(){
    const now = Date.now();
    let ms = load(); let changed=false;

    ms.forEach(m=>{
      // ilerleme
      const total = m.travelSecs*1000;
      const elapsed = total - Math.max(0, m.endsAt - now);
      const tNorm = clamp01(elapsed / total);

      // marker
      const mk = ensureMarker(m);
      const p = positionFor(m, tNorm);
      mk.el.style.left = (p.x - 28) + 'px';
      mk.el.style.top  = (p.y - 28) + 'px';

      // faz bitişleri
      if (now >= m.endsAt){
        if (m.phase==='going'){
          const myPower = (typeof getArmyPower==='function') ? getArmyPower() : 9999;
          m.win = (myPower >= (m.power||0));
          m.phase = 'returning';
          m.startedAt = now;
          m.endsAt = now + m.travelSecs*1000;
          changed = true;
        } else if (m.phase==='returning'){
          if (m.win && m.loot){
            if (typeof addGold === "function" && m.loot.gold) addGold(m.loot.gold);
            if (typeof addFood === "function" && m.loot.food) addFood(m.loot.food);
            if (typeof addStone === "function" && m.loot.stone) addStone(m.loot.stone);
          }
          removeMarker(m.id);
          m._done = true;
          changed = true;
        }
      }
    });

    const before = ms.length;
    ms = ms.filter(m=>!m._done);
    if (changed || ms.length!==before){ save(ms); renderHud(); }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  setInterval(renderHud, 1000);

  // dışa aç
  window.MW_startMarchTo = function(targetEl, cfg){
    const from = centerPos(castleEl);
    const to   = centerPos(targetEl);
    const d = dist(from,to);
    const travelSecs = secsForDistance(d);
    const now = Date.now();

    const m = {
      id: 'm'+Math.random().toString(36).slice(2),
      title: cfg.title||'Hedef',
      power: cfg.power||0,
      loot:  cfg.loot || {gold:0, food:0, stone:0},
      from, to, travelSecs,
      phase: 'going',
      startedAt: now,
      endsAt: now + travelSecs*1000,
      win: false
    };

    const ms = load(); ms.push(m); save(ms); renderHud();
  };

  // Modal saldır butonu
  attackBtn?.addEventListener('click', () => {
    if(!current) return;
    MW_startMarchTo(current.targetEl, {
      title: current.title,
      power: current.power,
      loot:  current.loot
    });
    closeModal();
  });

  // Dışarı aç: modalı hesaplanmış ETA ile aç
  window.MW_openBattleModal = function(cfg){
    try{
      const castle = document.getElementById('oyuncuKalesi');
      const num = v => parseFloat(String(v).replace('px',''))||0;
      const centerPos = el => ({ x: num(el.style.left)+el.offsetWidth/2, y: num(el.style.top)+el.offsetHeight/2 });
      const dist = (a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
      const from = centerPos(castle);
      const to   = centerPos(cfg.targetEl);
      const d = dist(from,to);
      const eta = Math.max(3, Math.round(d / 350));
      cfg.etaSecs = eta;
    }catch(e){ cfg.etaSecs = '-'; }
    openModal(cfg);
  };
})();
