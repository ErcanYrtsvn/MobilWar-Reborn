
// === MobilWar Modal + Sefer Patch (runtime, append-only) ===
// Bu dosyayı harita.js'den SONRA ekle: <script src="mw_modal_runtime_patch.js"></script>
(function(){
  if (window.__MW_PATCHED__) return;
  window.__MW_PATCHED__ = true;

  // ---------- CSS ENJEKSİYONU ----------
  const css = `
  #mwOverlay{ position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:10000; display:none; }
  #mwModal{
    position:fixed; left:50%; top:50%; transform:translate(-50%,-50%);
    width:min(92vw, 560px); background:#2d261e; color:#ffe9b0; z-index:10001;
    border:3px solid #d4b15f; border-radius:16px; box-shadow:0 10px 30px rgba(0,0,0,.5);
    font-family:inherit; display:none;
  }
  .mw-modal-header{
    display:flex; justify-content:space-between; align-items:center;
    padding:14px 16px; border-bottom:1px solid rgba(212,177,95,.35);
    font-size:22px; font-weight:900;
  }
  .mw-modal-header button{ background:transparent; border:0; color:#ffe9b0; font-size:22px; cursor:pointer; }
  .mw-modal-body{ padding:14px 16px; font-size:18px; line-height:1.5; }
  .mw-row{ margin:6px 0; }
  .mw-modal-actions{ display:flex; gap:10px; padding:14px 16px; border-top:1px solid rgba(212,177,95,.35); }
  .mw-modal-actions button{
    flex:1; padding:12px 14px; font-size:18px; font-weight:800; border:0; border-radius:10px; cursor:pointer;
  }
  #mwAttackBtn{ background:#ffcc00; color:#352b17; }
  #mwCancelBtn{ background:#4a3b28; color:#ffe9b0; }

  .mw-march{
    position:absolute; width:56px; height:56px; z-index:9998;
    display:flex; align-items:center; justify-content:center;
    font-size:36px; line-height:1; filter: drop-shadow(0 2px 4px rgba(0,0,0,.45));
    animation: mwPulse 1.2s infinite ease-in-out; pointer-events:none;
  }
  @keyframes mwPulse{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  // ---------- MODAL DOM OLUŞTURMA ----------
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
  const KEY = "mw_marches_v2";
  const map = document.getElementById('mapContainer');
  const castleEl = document.getElementById('oyuncuKalesi');
  const num = v => parseFloat(String(v).replace('px',''))||0;
  const centerPos = el => ({ x: num(el.style.left)+el.offsetWidth/2, y: num(el.style.top)+el.offsetHeight/2 });
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

  // Haritada yürüyen birlik bayrağı
  const markers = new Map(); // id -> {el}
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
      mk.el.style.left = (p.x - 28) + 'px';
      mk.el.style.top  = (p.y - 28) + 'px';

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

  // Dışa aç: sefer başlat
  window.MW_startMarchTo = function(targetEl, cfg){
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

  // ---------- PATCH: yaratık tıklaması (attackMonster override) ----------
  window.attackMonster = function(m){
    MW_openBattleModal({
      title: `👹 ${m.data.type.toUpperCase()} Yaratık`,
      power: m.data.power,
      loot: m.data.loot,
      targetEl: m.el,
      info: 'Yenersen ganimet dönüşte kasana eklenecek.'
    });
  };

  // ---------- PATCH: şehir tıklamaları (eski alert'leri temizle) ----------
  function rebindCities(){
    const cities = Array.from(document.querySelectorAll('.mapIcon'));
    cities.forEach((el, i) => {
      // Eski event'leri sıfırla
      const clone = el.cloneNode(true);
      el.parentNode.replaceChild(clone, el);

      // Base değerleri yakala (mevcut kodla aynı mantık)
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

  if (document.readyState === 'complete' || document.readyState === 'interactive'){
    setTimeout(rebindCities, 0);
  } else {
    window.addEventListener('DOMContentLoaded', rebindCities);
  }
})();
