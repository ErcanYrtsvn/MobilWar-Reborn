
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
// ==== HARİTA FİNAL PATCH v4 (bozmadan ek) ====
(function(){
  if (window.__MW_FINAL_V4__) return; window.__MW_FINAL_V4__ = true;

  // ----- 0) Mini toast -----
  function toast(msg){
    let box = document.getElementById('mwToastBox');
    if(!box){
      box = document.createElement('div');
      box.id='mwToastBox';
      box.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:10050;pointer-events:none;';
      document.body.appendChild(box);
    }
    const t = document.createElement('div');
    t.style.cssText = 'margin-top:8px;background:#2d261e;color:#ffe9b0;border:2px solid #d4b15f;border-radius:12px;padding:10px 14px;font-weight:800;font-size:18px;box-shadow:0 6px 16px rgba(0,0,0,.45)';
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity .35s'; setTimeout(()=>t.remove(), 400); }, 2000);
  }

  // ----- 1) Hedef kilidi (ikinci saldırıyı engelle) -----
  const busyTargets = new WeakSet();

  // ----- 2) Rescue: Saldır butonu her koşulda tetiklesin -----
  document.addEventListener('click', function(e){
    const btn = e.target && e.target.closest && e.target.closest('#mwAttackBtn');
    if (!btn) return;
    const cfg = window.MW__lastCfg || window.__MW_current;
    if (!cfg || !cfg.targetEl){ alert('Hedef bulunamadı.'); return; }
    if (typeof window.MW_startMarchTo === 'function'){
      window.MW_startMarchTo(cfg.targetEl, { title: cfg.title, power: cfg.power, loot: cfg.loot });
      // modalı kapat
      const ov = document.getElementById('mwOverlay'); const md = document.getElementById('mwModal');
      if (ov) ov.style.display='none'; if (md) md.style.display='none';
    } else {
      alert('Sefer sistemi yüklenmemiş (MW_startMarchTo yok).');
    }
  }, true);

  // Modal açılırken hedef meşgulse engelle + cfg’yi sakla
  if (typeof window.MW_openBattleModal === 'function'){
    const oldOpen = window.MW_openBattleModal;
    window.MW_openBattleModal = function(cfg){
      try { window.MW__lastCfg = cfg; } catch(e){}
      if (cfg?.targetEl && busyTargets.has(cfg.targetEl)){
        toast('❗ Bu hedefe zaten sefer var.');
        return;
      }
      return oldOpen(cfg);
    };
  }

  // ----- 3) Sefer başlat: hedefi hemen kaldır, respawn planla -----
  const RESPAWN_MONSTERS = true;
  const RESPAWN_CITIES   = false; // şehirler tekrar belirmesin istiyorsan false kalsın
  const RESPAWN_DELAY = { small: 10*60*1000, mid: 20*60*1000, big: 30*60*1000 }; // 10/20/30 dk

  function scheduleMonsterRespawn(meta){
    if (!RESPAWN_MONSTERS) return;
    const delay = (meta.kindSize==='küçük') ? RESPAWN_DELAY.small :
                  (meta.kindSize==='orta')  ? RESPAWN_DELAY.mid   :
                  RESPAWN_DELAY.big;
    setTimeout(()=> {
      const map = document.getElementById('mapContainer');
      if (!map) return;
      const el = document.createElement('img');
      el.src = meta.src;
      el.alt = meta.kindSize + ' yaratık';
      el.className = 'monster';
      el.style.left  = meta.left;
      el.style.top   = meta.top;
      el.style.width = meta.width;
      el.style.height= meta.height;
      // attackMonster için data oluştur
      const data = { type: meta.kindSize, power: meta.power, loot: {gold: meta.gold, food: meta.food} };
      el.addEventListener('click', () => window.attackMonster && window.attackMonster({el, data}));
      map.appendChild(el);
    }, delay);
  }

  function scheduleCityRespawn(meta){
    if (!RESPAWN_CITIES) return;
    setTimeout(()=> {
      const map = document.getElementById('mapContainer');
      if (!map) return;
      const el = document.createElement('img');
      el.src = meta.src; el.className='mapIcon'; el.alt='Küçük Şehir';
      el.style.left= meta.left; el.style.top = meta.top; el.style.width= meta.width; el.style.height= meta.height;
      map.appendChild(el);
    }, 15*60*1000); // örnek 15 dk
  }

  if (typeof window.MW_startMarchTo === 'function'){
    const oldStart = window.MW_startMarchTo;
    window.MW_startMarchTo = function(targetEl, cfg){
      if (!targetEl){ toast('Hedef bulunamadı.'); return; }
      if (busyTargets.has(targetEl)){ toast('❗ Bu hedefe zaten sefer var.'); return; }
      busyTargets.add(targetEl);

      // Meta bilgileri çıkar (respawn için)
      const meta = {
        left: targetEl.style.left, top: targetEl.style.top,
        width: targetEl.style.width, height: targetEl.style.height,
        src: targetEl.getAttribute('src') || '',
        isMonster: targetEl.classList.contains('monster'),
        isCity:     targetEl.classList.contains('mapIcon') && targetEl.id !== 'oyuncuKalesi',
        // modal cfg’den tip/ganimet gücünü yakala
        kindSize: (cfg.title||'').toLowerCase().includes('küçük') ? 'küçük' :
                  (cfg.title||'').toLowerCase().includes('orta')   ? 'orta'   :
                  (cfg.title||'').toLowerCase().includes('büyük')  ? 'büyük'  : 'büyük',
        power: cfg.power||0,
        gold:  (cfg.loot&&cfg.loot.gold)||0,
        food:  (cfg.loot&&cfg.loot.food)||0
      };

      // Hedefi görünmez yap (kayıtlı kalsın)
      if (targetEl.parentNode){
        targetEl.style.display='none';
        targetEl.__mwRemoved = true;
      }

      // Respawn planı (isteğe bağlı)
      if (meta.isMonster) scheduleMonsterRespawn(meta);
      else if (meta.isCity) scheduleCityRespawn(meta);

      // Gerçek seferi başlat
      const r = oldStart(targetEl, cfg);
      toast('🚩 Sefer başladı!');
      return r;
    };
  } else {
    console.warn('MW_startMarchTo yok – sefer sistemi yüklenmeli.');
  }

  // ----- 4) Geri dönüşte loot bildirimi (addGold/food/stone sar) -----
  (function(){
    const wrap = (name, text) => {
      const orig = window[name];
      window[name] = function(n){
        try{ if (typeof orig === 'function') orig(n); }catch(e){}
        if (n && n > 0) toast(`+${n} ${text} kasana eklendi`);
      };
    };
    wrap('addGold','altın'); wrap('addFood','yemek'); wrap('addStone','taş');
  })();

  // ----- 5) Kendi kale: menüye dönüş (güvence) -----
  (function(){
    const myCastle = document.getElementById('oyuncuKalesi');
    if (myCastle && !myCastle.__mwGoBack){
      myCastle.__mwGoBack = true;
      myCastle.style.cursor='pointer';
      myCastle.addEventListener('click', ()=>{ window.location.href='index.html'; });
    }
  })();

  // ----- 6) Güvenli: şehir/yaratık mevcut click’leri bozmadan çalıştır -----
  // (mevcut attackMonster ve şehir click’leri durur; biz sadece üzerine katman ekledik)
})();
// === ENEMY CASTLE PANEL (append-only, no break) ===
(function(){
  if (window.__ENEMY_CASTLE_UI__) return; window.__ENEMY_CASTLE_UI__=true;

  // ---- Basit CSS ----
  const css = `
  #ecOverlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:11000;display:none;}
  #ecModal{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);
    width:min(92vw,880px);background:#2d261e;color:#ffe9b0;z-index:11001;
    border:6px solid #d4b15f;border-radius:22px;box-shadow:0 10px 30px rgba(0,0,0,.5);font-family:inherit;display:none;}
  .ec-head{display:flex;justify-content:space-between;align-items:center;padding:22px 24px;border-bottom:1px solid rgba(212,177,95,.35);font-size:30px;font-weight:900;}
  .ec-body{padding:22px 24px;font-size:20px;line-height:1.5;}
  .ec-tabs{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
  .ec-tab{padding:10px 14px;border-radius:12px;background:#4a3b28;color:#ffe9b0;cursor:pointer;font-weight:800;border:0}
  .ec-tab.ec-on{background:#ffcc00;color:#352b17}
  .ec-row{margin:8px 0}
  .ec-actions{display:flex;gap:10px;margin-top:14px}
  .ec-actions button{flex:1;padding:14px 16px;font-size:20px;font-weight:900;border-radius:12px;border:0;cursor:pointer}
  .ec-primary{background:#ffcc00;color:#352b17}
  .ec-ghost{background:#3a2f1e;color:#ffe9b0}
  input.ec-num{width:110px;padding:6px;border-radius:8px;border:1px solid #c9b07a;background:#1f1913;color:#ffe9b0}
  table.ec-table{width:100%;border-collapse:collapse;margin-top:10px}
  table.ec-table th,table.ec-table td{border-bottom:1px solid rgba(212,177,95,.25);padding:6px 4px;text-align:left}
  `;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  // ---- DOM ----
  const overlay=document.createElement('div'); overlay.id='ecOverlay';
  const modal=document.createElement('div'); modal.id='ecModal';
  modal.innerHTML = `
    <div class="ec-head">
      <div>🏰 Oyuncu Kalesi</div>
      <button id="ecClose" style="background:transparent;border:0;color:#ffe9b0;font-size:28px;cursor:pointer">✖</button>
    </div>
    <div class="ec-body">
      <div class="ec-tabs">
        <button class="ec-tab ec-on" data-ec-tab="attack">Saldır</button>
        <button class="ec-tab" data-ec-tab="spy">Casusluk</button>
        <button class="ec-tab" data-ec-tab="support">Destek</button>
        <button class="ec-tab" data-ec-tab="message">Mesaj</button>
      </div>
      <div id="ecView"></div>
      <div class="ec-actions">
        <button id="ecDo" class="ec-primary">Gönder</button>
        <button id="ecCancel" class="ec-ghost">Kapat</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay); document.body.appendChild(modal);

  const $ = s => modal.querySelector(s);
  function show(){ overlay.style.display='block'; modal.style.display='block'; }
  function hide(){ overlay.style.display='none'; modal.style.display='none'; }
  $('#ecClose').onclick = hide; $('#ecCancel').onclick = hide; overlay.onclick = hide;

  // ---- Data helpers ----
  const birlikGucu = {
    "Casus Kuş": 1,"Cüce": 3,"Yük Arabası": 0,"Elf": 5,"Gnom": 2,"Şaman": 1,
    "Süvari": 6,"Mancınık": 4,"Pegasus": 7,"Ogre": 8,"Ejderha": 10,"Kaos": 12
  };
  const CART_CAP = 100; // Yük Arabası taşıma kapasitesi (adet başına)
  function getKaleBirlik(){ try{return JSON.parse(localStorage.getItem('kaleBirlikleri')||'{}');}catch(_){return{}} }
  function sumPower(sel){ let p=0; Object.keys(sel).forEach(k=>{ const adet=+sel[k]||0; p+=adet*(birlikGucu[k]||0) }); return p; }

  // ---- UI renderers ----
  function renderAttack(targetEl){
    const kb=getKaleBirlik();
    const rows = Object.keys(birlikGucu).map(n=>{
      const own=kb[n]||0;
      return `<tr>
        <td>${n}</td>
        <td>${own}</td>
        <td><input class="ec-num" type="number" min="0" max="${own}" value="0" data-ec-unit="${n}"></td>
      </tr>`;
    }).join('');
    $('#ecView').innerHTML = `
      <div class="ec-row">Saldırmak istediğin birlikleri seç:</div>
      <table class="ec-table">
        <thead><tr><th>Birlik</th><th>Mevcut</th><th>Gönder</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    $('#ecDo').onclick = function(){
      const inputs = modal.querySelectorAll('input[data-ec-unit]');
      const sel={}; inputs.forEach(i=>{ const n=i.getAttribute('data-ec-unit'); const v=Math.max(0,parseInt(i.value||'0')); if(v>0) sel[n]=v; });
      if (!Object.keys(sel).length) { alert('Birlik seçmedin.'); return; }
      const power = sumPower(sel);
      // (İleri aşamada seçilen birlikleri gerçekten düşürmek istiyorsan burada localStorage azaltılabilir)
      if (typeof MW_startMarchTo==='function'){
        MW_startMarchTo(targetEl, { title:'🏰 Oyuncu Kalesi', power, loot:{gold:0,food:0} });
        hide();
      } else alert('Sefer sistemi yok (MW_startMarchTo).');
    };
  }

  function renderSpy(targetEl){
    const kb=getKaleBirlik(); const own=kb['Casus Kuş']||0;
    $('#ecView').innerHTML = `
      <div class="ec-row">Kaç <b>Casus Kuş</b> göndermek istiyorsun?</div>
      <input class="ec-num" id="ecSpyCount" type="number" min="1" max="${own}" value="${Math.min(1,own)}">
      <div class="ec-row" style="opacity:.8">Mevcut: ${own}</div>
    `;
    $('#ecDo').onclick = function(){
      const adet = parseInt($('#ecSpyCount').value||'0');
      if (isNaN(adet) || adet<1){ alert('Geçerli bir sayı gir.'); return; }
      if (typeof MW_startMarchTo==='function'){
        MW_startMarchTo(targetEl, { title:`🕵️ Casusluk (${adet})`, power:0, loot:{} });
        hide();
      } else alert('Sefer sistemi yok (MW_startMarchTo).');
    };
  }

  function renderSupport(targetEl){
    const kb=getKaleBirlik(); const carts = kb['Yük Arabası']||0; const cap = carts*CART_CAP;
    $('#ecView').innerHTML = `
      <div class="ec-row">Göndereceğin ganimeti seç (max kapasite: <b>${cap}</b>)</div>
      <div class="ec-row">Altın: <input class="ec-num" id="ecGold" type="number" min="0" value="0"></div>
      <div class="ec-row">Yemek: <input class="ec-num" id="ecFood" type="number" min="0" value="0"></div>
      <div class="ec-row" style="opacity:.8">Yük Arabası: ${carts} (kapasite/birim: ${CART_CAP})</div>
    `;
    $('#ecDo').onclick = function(){
      const g = parseInt($('#ecGold').value||'0');
      const f = parseInt($('#ecFood').value||'0');
      const need = (g+f);
      if (need<=0){ alert('Gönderilecek ganimet yok.'); return; }
      if (need>cap){ alert('Kapasite yetersiz.'); return; }
      // Not: Gerçekten kasadan düşmek için burada resource sistemine bağlanmamız gerekir.
      if (typeof MW_startMarchTo==='function'){
        MW_startMarchTo(targetEl, { title:'📦 Destek Konvoyu', power:0, loot:{} });
        hide();
      } else alert('Sefer sistemi yok (MW_startMarchTo).');
    };
  }

  function renderMessage(targetEl){
    $('#ecView').innerHTML = `
      <div class="ec-row">Mesaj (yakında online sistemle):</div>
      <textarea id="ecMsg" style="width:100%;min-height:120px;border-radius:12px;border:1px solid #c9b07a;background:#1f1913;color:#ffe9b0;padding:10px"></textarea>
      <div class="ec-row" style="opacity:.7">Şimdilik localStorage’da logluyoruz; online aktif olunca buradan gidecek.</div>
    `;
    $('#ecDo').onclick = function(){
      const txt = (modal.querySelector('#ecMsg').value||'').trim();
      if (!txt){ alert('Mesaj boş.'); return; }
      const logs = JSON.parse(localStorage.getItem('mw_messages')||'[]');
      logs.push({ t:Date.now(), to:'enemyCastle', msg:txt });
      localStorage.setItem('mw_messages', JSON.stringify(logs));
      alert('Mesaj kaydedildi (online gelince gönderilecek).');
      hide();
    };
  }

  function setTab(tab, targetEl){
    modal.querySelectorAll('.ec-tab').forEach(b=>b.classList.toggle('ec-on', b.getAttribute('data-ec-tab')===tab));
    if      (tab==='attack')  renderAttack(targetEl);
    else if (tab==='spy')     renderSpy(targetEl);
    else if (tab==='support') renderSupport(targetEl);
    else                      renderMessage(targetEl);
  }

  function openFor(targetEl){
    show(); setTab('attack', targetEl);
    modal.querySelectorAll('.ec-tab').forEach(btn=>{
      btn.onclick = ()=> setTab(btn.getAttribute('data-ec-tab'), targetEl);
    });
  }

  // ---- Bağlama: enemyCastle'a tıklandığında paneli aç ----
  function bindEnemyCastles(){
    document.querySelectorAll('.enemyCastle').forEach(el=>{
      if (el.__ecBound) return; el.__ecBound = true;
      el.style.cursor='pointer';
      el.addEventListener('click', ()=> openFor(el));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bindEnemyCastles);
  else bindEnemyCastles();
})();
// === HARİTA GENİŞLETME PATCH (append-only, bozmaz) ===
(function(){
  if (window.__MW_EXPAND_V1__) return; window.__MW_EXPAND_V1__ = true;

  const map = document.getElementById('mapContainer');
  const my = document.getElementById('oyuncuKalesi');

  // ---- 1) Düşman kalesini kendi kalenin yanına yerleştir ----
  (function placeEnemyNearMine(){
    if (!map || !my) return;
    const enemy = document.querySelector('.enemyCastle');
    if (!enemy) return;
    // Kendi kalenin sol-üst koordinatını oku
    const n = v => parseFloat(String(v).replace('px',''))||0;
    const mx = n(my.style.left), myTop = n(my.style.top);
    // Biraz yanına (ofset) koy
    const offX = 480, offY = -120;  // yakın ama üstünü kapatmasın
    enemy.style.left = (mx + offX) + 'px';
    enemy.style.top  = (myTop + offY) + 'px';
    // Boyutunu kendi kaleyle hizala (zaten CSS’te !important ama garanti)
    enemy.style.width = my.offsetWidth + 'px';
    enemy.style.height = my.offsetHeight + 'px';
  })();

  // ---- Mini toast (koordinat + bilgi için) ----
  function toast(msg){
    let box = document.getElementById('mwToastBox');
    if(!box){
      box = document.createElement('div');
      box.id='mwToastBox';
      box.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:10050;pointer-events:none;';
      document.body.appendChild(box);
    }
    const t = document.createElement('div');
    t.style.cssText = 'margin-top:8px;background:#2d261e;color:#ffe9b0;border:2px solid #d4b15f;border-radius:12px;padding:10px 14px;font-weight:800;font-size:18px;box-shadow:0 6px 16px rgba(0,0,0,.45)';
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity .35s'; setTimeout(()=>t.remove(), 400); }, 2000);
  }

  // ---- 2) Koordinata Git alanı (X,Y) ----
  (function addGotoXY(){
    const hud = document.getElementById('konumPanel');
    if (!hud || document.getElementById('mwGotoBox')) return;
    const wrap = document.createElement('div');
    wrap.id = 'mwGotoBox';
    wrap.style.cssText = 'margin-top:10px; display:flex; gap:8px; flex-wrap:wrap; align-items:center; font-size:16px;';
    wrap.innerHTML = `
      <span style="opacity:.8">Git:</span>
      <input id="mwGX" type="number" placeholder="X" style="width:110px;padding:6px;border-radius:8px;border:1px solid #c9b07a;background:#1f1913;color:#ffe9b0">
      <input id="mwGY" type="number" placeholder="Y" style="width:110px;padding:6px;border-radius:8px;border:1px solid #c9b07a;background:#1f1913;color:#ffe9b0">
      <button id="mwGoBtn" style="padding:8px 12px;border-radius:10px;border:0;font-weight:900;background:#ffcc00;color:#352b17;cursor:pointer">Git</button>
    `;
    hud.appendChild(wrap);
    document.getElementById('mwGoBtn').addEventListener('click', ()=>{
      const gx = parseInt(document.getElementById('mwGX').value||'0');
      const gy = parseInt(document.getElementById('mwGY').value||'0');
      if (isNaN(gx)||isNaN(gy)) return;
      // Ekran merkezini bu koordinata getir
      window.scrollTo(Math.max(0, gx - window.innerWidth/2), Math.max(0, gy - window.innerHeight/2));
      toast(`📍 Gidildi: X:${gx} Y:${gy}`);
    });
  })();

  // ---- 3) Yaratık sayısını artır (mevcuta ek spawn) ----
  (function extraMonsters(){
    if (!map) return;
    // Haritanın büyük kısmına yay
    const W = map.scrollWidth || 120000, H = map.scrollHeight || 120000;
    const CREATURES = [
      {type:'küçük', src:'monster_small.png', size:200, power: 20,  loot:{gold:60,  food:40}},
      {type:'orta',  src:'monster_mid.png',   size:280, power: 100, loot:{gold:200, food:140}},
      {type:'büyük', src:'monster_big.png',   size:360, power: 260, loot:{gold:520, food:360}},
    ];
    const COUNT = 150; // ekstra 150 canavar
    function ri(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
    for(let i=0;i<COUNT;i++){
      const d = CREATURES[Math.floor(Math.random()*CREATURES.length)];
      const el = document.createElement('img');
      el.src = d.src; el.alt = d.type + ' yaratık'; el.className='monster';
      el.style.left = ri(600, W-600) + 'px';
      el.style.top  = ri(600, H-600) + 'px';
      el.style.width = d.size + 'px'; el.style.height = d.size + 'px';
      // Tık davranışı: mevcut attackMonster'ı kullan (sefer/loot modalı)
      el.addEventListener('click', ()=> window.attackMonster && window.attackMonster({ el, data:{type:d.type, power:d.power, loot:d.loot} }));
      map.appendChild(el);
    }
  })();

  // ---- 4) Şehir sayısını artır (otomatik şehirler) ----
  (function extraCities(){
    if (!map) return;
    const W = map.scrollWidth || 120000, H = map.scrollHeight || 120000;
    const COUNT = 80; // ekstra 80 şehir
    function ri(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
    for(let i=0;i<COUNT;i++){
      const el = document.createElement('img');
      el.src = 'sehir1.png';
      el.alt = 'Küçük Şehir';
      el.className = 'mapIcon autoCity';
      el.style.left = ri(600, W-600) + 'px';
      el.style.top  = ri(600, H-600) + 'px';
      map.appendChild(el);
    }
    // Mevcut şehir click mantığını yeniden bağla (bozmadan)
    setTimeout(()=>{
      const cities = Array.from(document.querySelectorAll('.mapIcon')).filter(x=>x.id!=='oyuncuKalesi');
      cities.forEach((el, i) => {
        if (el.__cityBound) return; el.__cityBound = true;
        el.style.cursor='pointer';
        const base = {gold: 600, food: 400, power: 280};
        const cfg = { gold: base.gold + i*120, food: base.food + i*90, power: base.power + i*60 };
        el.addEventListener('click', ()=>{
          // Eğer düşman kale paneli varsa onu açmak için enemyCastle sınıfını kontrol ediyoruz.
          if (el.classList.contains('enemyCastle') && typeof window.__ENEMY_CASTLE_UI__ !== 'undefined'){
            // enemyCastle panel JS bloğu zaten click ekliyor; burada dokunma
            return;
          }
          if (typeof MW_openBattleModal === 'function'){
            MW_openBattleModal({
              title:'🏙️ Şehir', power: cfg.power, loot: { gold: cfg.gold, food: cfg.food }, targetEl: el,
              info:'Şehri ele geçirirsen ganimet dönüşte kasana eklenecek.'
            });
          }else{
            alert(`🏙️ Şehir\nGüç:${cfg.power}\nGanimet:+${cfg.gold} altın, +${cfg.food} yemek`);
          }
        });
      });
    }, 0);
  })();

  // ---- 5) İkon/yaratık tıklayınca koordinat göster (bilgi amaçlı) ----
  (function bindCoordHints(){
    function center(el){
      const n = v => parseFloat(String(v).replace('px',''))||0;
      const mapRect = map.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      // map’e göre merkez
      return { x: (r.left - mapRect.left) + r.width/2, y: (r.top - mapRect.top) + r.height/2 };
    }
    function attach(el){
      if (el.__coordBound) return; el.__coordBound = true;
      el.addEventListener('click', (ev)=>{
        const p = center(el);
        toast(`📍 X:${Math.round(p.x)} Y:${Math.round(p.y)}`);
      });
    }
    document.querySelectorAll('.mapIcon').forEach(attach);
    document.querySelectorAll('.monster').forEach(attach);
    // sonradan eklenenler için basit observer (opsiyonel)
    const obs = new MutationObserver(muts=>{
      muts.forEach(m=>{
        m.addedNodes && m.addedNodes.forEach(n=>{
          if (n && n.nodeType===1){
            if (n.classList && (n.classList.contains('mapIcon') || n.classList.contains('monster'))) attach(n);
          }
        });
      });
    });
    obs.observe(map || document.body, {childList:true, subtree:true});
  })();

})();
