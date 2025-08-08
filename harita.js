
// === BASE: Harita temel fonksiyonları (koordinat, konumaGit) ===
const mapContainer = document.getElementById("mapContainer");
const koordinatDiv = document.getElementById("koordinatlar");

window.onload = function () {
    window.scrollTo(5000 - window.innerWidth / 2, 5000 - window.innerHeight / 2);
    guncelleKonum();
};

if (mapContainer && koordinatDiv){
  mapContainer.addEventListener("mousemove", function (e) {
      const x = e.pageX;
      const y = e.pageY;
      koordinatDiv.textContent = `X: ${x}, Y: ${y}`;
  });
}

function konumaGit() {
    window.scrollTo(5000 - window.innerWidth / 2, 5000 - window.innerHeight / 2);
}

function guncelleKonum() {
    if (!koordinatDiv) return;
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

  // otomatik spawn
  if (document.readyState === "complete") spawnMonsters();
  else window.addEventListener("load", spawnMonsters);
})();

// ---- Şehir ganimeti & savunma (mevcut .mapIcon'lara tıklama) ----
(function(){
  const cities = Array.from(document.querySelectorAll('.mapIcon'));
  if (!cities.length) return;

  const base = {gold: 600, food: 400, power: 280};
  function scaled(i){
    return {
      gold: base.gold + i*120,
      food: base.food + i*90,
      power: base.power + i*60
    };
  }

  cities.forEach((el, i) => {
    el.style.cursor = 'pointer';
    el.addEventListener('click', () => {
      const cfg = scaled(i);
      // Eski basit akış: direkt uyarı (modali patch override edecektir)
      const myPower = window.getArmyPower ? window.getArmyPower() : 9999;
      if (myPower >= cfg.power){
        // not: loot patch tarafında dönüşte yazılıyor olacak
        alert(`🏙️ Şehir hedefi\nGüç: ${cfg.power}\nGanimet: +${cfg.gold} altın, +${cfg.food} yemek`);
      } else {
        alert(`🛡️ Şehir savunması güçlü (Senin güç: ${myPower}, Gereken: ${cfg.power})`);
      }
    });
  });
})();

// === MobilWar Modal + Sefer Patch (INLINE, FULL, BIG UI, v3) ===
(function(){
  if (window.__MW_PATCHED_V3__) return;
  window.__MW_PATCHED_V3__ = true;

  // ---------- CSS (BÜYÜK) ----------
  const css = `
  #mwOverlay{ position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:10000; display:none; }
  #mwModal{
    position:fixed; left:50%; top:50%; transform:translate(-50%,-50%);
    width:min(92vw, 840px); background:#2d261e; color:#ffe9b0; z-index:10001;
    border:6px solid #d4b15f; border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,.5);
    font-family:inherit; display:none;
  }
  .mw-modal-header{
    display:flex; justify-content:space-between; align-items:center;
    padding:22px 24px; border-bottom:1px solid rgba(212,177,95,.35);
    font-size:36px; font-weight:900;
  }
  .mw-modal-header button{ background:transparent; border:0; color:#ffe9b0; font-size:34px; cursor:pointer; }
  .mw-modal-body{ padding:22px 24px; font-size:28px; line-height:1.6; }
  .mw-row{ margin:10px 0; }
  .mw-modal-actions{ display:flex; gap:16px; padding:22px 24px; border-top:1px solid rgba(212,177,95,.35); }
  .mw-modal-actions button{
    flex:1; padding:18px 22px; font-size:28px; font-weight:800; border:0; border-radius:16px; cursor:pointer;
  }
  #mwAttackBtn{ background:#ffcc00; color:#352b17; }
  #mwCancelBtn{ background:#4a3b28; color:#ffe9b0; }

  .mw-march{
    position:absolute; width:72px; height:72px; z-index:9998;
    display:flex; align-items:center; justify-content:center;
    font-size:48px; line-height:1; filter: drop-shadow(0 2px 4px rgba(0,0,0,.45));
    animation: mwPulse 1.2s infinite ease-in-out; pointer-events:none;
  }
  @keyframes mwPulse{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ---------- MODAL DOM ----------
  const overlay = document.createElement('div'); overlay.id='mwOverlay';
  const modal   = document.createElement('div'); modal.id='mwModal';
  modal.innerHTML = `
    <div class="mw-modal-header">
      <div id="mwTitle">Hedef</div>
      <button id="mwCloseBtn" aria-label="Kapat">✖</button>
    </div>
    <div class="mw-modal-body">
      <div class="mw-row" id="mwPower">Gerekli güç: -</div>
      <div class="mw-row" id="mwLoot">Ganimet: -</div>
      <div class="mw-row" id="mwETA">Tahmini varış: - sn</div>
      <div class="mw-row" id="mwInfo"></div>
    </div>
    <div class="mw-modal-actions">
      <button id="mwAttackBtn">Saldır</button>
      <button id="mwCancelBtn">Kapat</button>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.appendChild(modal);

  // ---------- Modal Ref'leri ----------
  const tEl = modal.querySelector('#mwTitle');
  const pEl = modal.querySelector('#mwPower');
  const lEl = modal.querySelector('#mwLoot');
  const etaEl = modal.querySelector('#mwETA');
  const iEl = modal.querySelector('#mwInfo');
  const attackBtn = modal.querySelector('#mwAttackBtn');
  const closeBtn  = modal.querySelector('#mwCloseBtn');
  const cancelBtn = modal.querySelector('#mwCancelBtn');
  let current = null;

  function show(el){ el && (el.style.display='block'); }
  function hide(el){ el && (el.style.display='none'); }
  function openModal(cfg){
    current = cfg;
    tEl.textContent = cfg.title || 'Hedef';
    pEl.textContent = 'Gerekli güç: ' + (cfg.power ?? '-');
    const loot = cfg.loot || {};
    const lootStr = [
      loot.gold ? (loot.gold+' altın') : null,
      loot.food ? (loot.food+' yemek') : null,
      loot.stone? (loot.stone+' taş')  : null
    ].filter(Boolean).join(', ');
    lEl.textContent = 'Ganimet: ' + (lootStr || '-');
    etaEl.textContent = 'Tahmini varış: ' + (cfg.etaSecs ?? '-') + ' sn';
    iEl.textContent = cfg.info || '';
    show(overlay); show(modal);
  }
  function closeModal(){ hide(modal); hide(overlay); current = null; }
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  // ---------- Sefer Sistemi ----------
  const PX_PER_SEC = 350; // yaklaşık hız
  const KEY = "mw_marches_v3";
  const map = document.getElementById('mapContainer');
  const castleEl = document.getElementById('oyuncuKalesi');

  const num = v => parseFloat(String(v).replace('px',''))||0;
  function centerPos(el){
    if (!el) return {x:0,y:0};
    const left = num(el.style.left);
    const top  = num(el.style.top);
    if (!isNaN(left) && !isNaN(top) && (left || top)){
      return { x: left + el.offsetWidth/2, y: top + el.offsetHeight/2 };
    }
    // Fallback: hesaplamayı mapContainer'a göre yap
    const mapRect = map.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: (r.left - mapRect.left) + r.width/2, y: (r.top - mapRect.top) + r.height/2 };
  }
  const dist = (a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const lerp = (a,b,t)=>a+(b-a)*t;
  const clamp01 = v=>Math.max(0,Math.min(1,v));
  const secsFor = d => Math.max(3, Math.round(d / PX_PER_SEC));

  const load = ()=> JSON.parse(localStorage.getItem(KEY)||"[]");
  const save = a => localStorage.setItem(KEY, JSON.stringify(a));

  // HUD sayaç
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

  // Haritada yürüyen bayrak
  const markers = new Map();
  function ensureMarker(m){
    if (markers.has(m.id)) return markers.get(m.id);
    const el = document.createElement('div');
    el.className = 'mw-march';
    el.textContent = '🚩';
    map.appendChild(el);
    const o = { el }; markers.set(m.id, o); return o;
  }
  function removeMarker(id){ const o = markers.get(id); if(o){ o.el.remove(); markers.delete(id); } }
  function positionFor(m, tNorm){
    const from = m.from, to = m.to;
    const t = (m.phase==='going') ? tNorm : 1 - tNorm;
    return { x: lerp(from.x, to.x, t), y: lerp(from.y, to.y, t) };
  }

  function tick(){
    const now = Date.now();
    let ms = load(); let changed=false;

    ms.forEach(m=>{
      const total = m.travelSecs*1000;
      const elapsed = total - Math.max(0, m.endsAt - now);
      const tNorm = clamp01(elapsed / total);

      const mk = ensureMarker(m);
      const p = positionFor(m, tNorm);
      mk.el.style.left = (p.x - 36) + 'px';
      mk.el.style.top  = (p.y - 36) + 'px';

      if (now >= m.endsAt){
        if (m.phase==='going'){
          // Varışta savaş sonucu
          const myPower = (typeof getArmyPower==='function') ? getArmyPower() : 9999;
          m.win = (myPower >= (m.power||0));
          m.phase = 'returning';
          m.startedAt = now;
          m.endsAt = now + m.travelSecs*1000;
          changed = true;
        } else if (m.phase==='returning'){
          // Dönüşte loot yaz
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

  // Dışa aç: sefer başlat
  window.MW_startMarchTo = function(targetEl, cfg){
    if (!map || !castleEl || !targetEl){
      alert('Sefer başlatılamadı (eksik eleman).'); return;
    }
    const from = centerPos(castleEl);
    const to   = centerPos(targetEl);
    const d = dist(from,to);
    const travelSecs = secsFor(d);
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

  // Dışa aç: modalı ETA ile aç
  window.MW_openBattleModal = function(cfg){
    try{
      const from = centerPos(castleEl);
      const to   = centerPos(cfg.targetEl);
      const d = dist(from,to);
      const eta = Math.max(3, Math.round(d / PX_PER_SEC));
      cfg.etaSecs = eta;
    }catch(e){ cfg.etaSecs = '-'; }
    openModal(cfg);
  };

  // ---------- PATCH: yaratık tıklaması ----------
  window.attackMonster = function(m){
    MW_openBattleModal({
      title: `👹 ${m.data.type.toUpperCase()} Yaratık`,
      power: m.data.power,
      loot: m.data.loot,
      targetEl: m.el,
      info: 'Yenersen ganimet dönüşte kasana eklenecek.'
    });
  };

  // ---------- PATCH: şehir tıklamaları (kendi kaleyi hariç) ----------
  function rebindCities(){
    const cities = Array.from(document.querySelectorAll('.mapIcon')).filter(el => el.id !== 'oyuncuKalesi');
    cities.forEach((el, i) => {
      const clone = el.cloneNode(true);
      el.parentNode.replaceChild(clone, el);

      const base = {gold: 600, food: 400, power: 280};
      const cfg = {
        gold: base.gold + i*120,
        food: base.food + i*90,
        power: base.power + i*60
      };
      clone.style.cursor = 'pointer';
      clone.addEventListener('click', () => {
        MW_openBattleModal({
          title: '🏙️ Şehir',
          power: cfg.power,
          loot: { gold: cfg.gold, food: cfg.food },
          targetEl: clone,
          info: 'Şehri ele geçirirsen ganimet dönüşte kasana eklenecek.'
        });
      });
    });
  }

  // ---------- Kendi kalen: menüye dön ----------
  (function bindOwnCastle(){
    const myCastle = document.getElementById('oyuncuKalesi');
    if (myCastle && !myCastle.__mwBound__) {
      myCastle.__mwBound__ = true;
      myCastle.style.cursor = 'pointer';
      myCastle.addEventListener('click', () => {
        if (document.referrer && document.referrer.includes('index.html')) {
          history.back();
        } else {
          window.location.href = 'index.html';
        }
      });
    }
  })();

  if (document.readyState === 'complete' || document.readyState === 'interactive'){
    setTimeout(rebindCities, 0);
  } else {
    window.addEventListener('DOMContentLoaded', rebindCities);
  }
})();

// ==== SALDIR ÇALIŞTIRICI - RESCUE (bozmadan ek) ====
(function(){
  if (window.__MW_ATTACK_RESCUE__) return; window.__MW_ATTACK_RESCUE__=true;

  // 1) Saldır butonuna delegasyon (modal içinden yakala)
  document.addEventListener('click', function(e){
    if (!e.target) return;
    const btn = e.target.closest && e.target.closest('#mwAttackBtn');
    if (!btn) return;

    // Modal açılırken kaydedilen hedef/config
    const cfg = window.MW__lastCfg || window.__MW_current;
    if (!cfg || !cfg.targetEl){
      alert('Hedef bulunamadı.'); 
      return;
    }

    // Sefer fonksiyonu varsa tetikle
    if (typeof window.MW_startMarchTo === 'function'){
      window.MW_startMarchTo(cfg.targetEl, {
        title: cfg.title,
        power: cfg.power,
        loot:  cfg.loot
      });
      // Modali kapat
      const ov = document.getElementById('mwOverlay'); 
      const md = document.getElementById('mwModal');
      if (ov) ov.style.display='none';
      if (md) md.style.display='none';
      // İstersen geçici bildirim
      // alert('Sefer başlatıldı!');
    } else {
      alert('Sefer sistemi yüklenmemiş (MW_startMarchTo yok).');
    }
  }, true);

  // 2) Modal açma fonksiyonunu sar: cfg'yi global sakla
  const oldOpen = window.MW_openBattleModal;
  window.MW_openBattleModal = function(cfg){
    try { window.MW__lastCfg = cfg; } catch(e){}
    if (typeof oldOpen === 'function') return oldOpen(cfg);
  };
})();
