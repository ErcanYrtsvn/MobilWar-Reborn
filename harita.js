/* =========================================================
   MobilWar — Harita (final tek dosya)
   - Koordinat HUD + Git (X,Y)
   - Büyük modal
   - Sefer sistemi: gidiş → savaş → dönüş (🚩 işaretçisi)
   - Şehir tıklama (kendi kaleyi hariç)
   - Yaratık sistemi + fazlaca spawn
   - EnemyCastle panel (Saldır / Casusluk / Destek / Mesaj)
   - Hedef gizleme kuralı: 
        • enemyCastle ASLA gizlenmez
        • şehir/yaratık: varışta savaş, dönüşe BAŞLARKEN gizlenir
   - Koordinat toast & güvenlik yamaları
   - Idempotent (yeniden yüklense bile tek kez bağlar)
   ========================================================= */

(function(){
  if (window.__MW_FINAL_SINGLE__) return; 
  window.__MW_FINAL_SINGLE__ = true;

  /* ---------- CONFIG ---------- */
  const CFG = {
    WORLD_W: 120000,
    WORLD_H: 120000,
    SPEED_PX_PER_SEC: 800,          // sefer hızı
    MARCH_ICON: "🚩",
    CREATURE_SPAWN: 150,            // ekstra yaratık
    CITY_SPAWN: 80,                 // ekstra şehir
    CREATURES: [
      {type:'küçük', src:'monster_small.png', size:200, power: 20,  loot:{gold:60,  food:40}},
      {type:'orta',  src:'monster_mid.png',   size:280, power: 100, loot:{gold:200, food:140}},
      {type:'büyük', src:'monster_big.png',   size:360, power: 260, loot:{gold:520, food:360}},
    ],
    CART_CAP: 100,                  // Yük Arabası kapasite
    MAX_MARCHES: 30
  };

  /* ---------- DOM GET ---------- */
  const map = document.getElementById("mapContainer");
  const hud = document.getElementById("konumPanel");
  const coordDiv = document.getElementById("koordinatlar");
  const myCastle = document.getElementById("oyuncuKalesi");

  if (map) { map.style.width = CFG.WORLD_W + "px"; map.style.height = CFG.WORLD_H + "px"; }

  /* ---------- TOAST ---------- */
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
    setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity .35s'; setTimeout(()=>t.remove(),400); }, 2000);
  }

  /* ---------- HUD: Konum ve Git(X,Y) ---------- */
  function hudUpdate(){
    if (!coordDiv) return;
    const x = Math.max(0, Math.min(CFG.WORLD_W, window.scrollX + window.innerWidth / 2));
    const y = Math.max(0, Math.min(CFG.WORLD_H, window.scrollY + window.innerHeight / 2));
    coordDiv.textContent = `X: ${Math.floor(x)}, Y: ${Math.floor(y)}`;
  }
  window.addEventListener("scroll", hudUpdate);
  window.addEventListener("load", hudUpdate);

  if (hud && !document.getElementById("mwGotoBox")){
    const wrap = document.createElement("div");
    wrap.id = "mwGotoBox";
    wrap.style.cssText = "margin-top:10px; display:flex; gap:8px; flex-wrap:wrap; align-items:center; font-size:16px;";
    wrap.innerHTML = `
      <span style="opacity:.8">Git:</span>
      <input id="mwGX" type="number" placeholder="X" style="width:110px;padding:6px;border-radius:8px;border:1px solid #c9b07a;background:#1f1913;color:#ffe9b0">
      <input id="mwGY" type="number" placeholder="Y" style="width:110px;padding:6px;border-radius:8px;border:1px solid #c9b07a;background:#1f1913;color:#ffe9b0">
      <button id="mwGoBtn" style="padding:8px 12px;border-radius:10px;border:0;font-weight:900;background:#ffcc00;color:#352b17;cursor:pointer">Git</button>
    `;
    hud.appendChild(wrap);
    wrap.querySelector("#mwGoBtn").addEventListener("click", ()=>{
      const gx = parseInt(document.getElementById('mwGX').value||'0');
      const gy = parseInt(document.getElementById('mwGY').value||'0');
      if (isNaN(gx)||isNaN(gy)) return;
      window.scrollTo(Math.max(0, gx - window.innerWidth/2), Math.max(0, gy - window.innerHeight/2));
      toast(`📍 Gidildi: X:${gx} Y:${gy}`);
    });
  }

  /* ---------- Utils ---------- */
  const LS_KEY = "mw_marches_v3";
  function loadMarches(){ try{return JSON.parse(localStorage.getItem(LS_KEY)||"[]")}catch(_){return[]} }
  function saveMarches(a){ try{localStorage.setItem(LS_KEY, JSON.stringify(a.slice(-CFG.MAX_MARCHES)))}catch(_){ } }
  function px(v){ return parseFloat(String(v||'').replace('px',''))||0; }
  function centerOf(el){
    if (!el || !map) return {x:0,y:0};
    const l = px(el.style.left), t = px(el.style.top);
    if (l || t) return { x: l + el.offsetWidth/2, y: t + el.offsetHeight/2 };
    const mr = map.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x:(r.left-mr.left)+r.width/2, y:(r.top-mr.top)+r.height/2 };
  }
  function dist(a,b){ const dx=a.x-b.x, dy=a.y-b.y; return Math.sqrt(dx*dx+dy*dy); }

  /* ---------- March (sefer) sistemi ---------- */
  const marchDots = new Map();   // id -> element
  const targetsMap = new Map();  // id -> targetEl (güvence)

  function makeDot(){ const el = document.createElement("div"); el.className="mw-march"; el.textContent=CFG.MARCH_ICON; el.style.position="absolute"; el.style.zIndex="9998"; el.style.pointerEvents="none"; return el; }

  function addGold(n){ const e=document.getElementById("gold"); if (e){ e.textContent = String(parseInt(e.textContent||"0",10)+n); } }
  function addFood(n){ const e=document.getElementById("food"); if (e){ e.textContent = String(parseInt(e.textContent||"0",10)+n); } }
  function addStone(n){ const e=document.getElementById("stone"); if (e){ e.textContent = String(parseInt(e.textContent||"0",10)+n); } }
  window.addGold = window.addGold || addGold;
  window.addFood = window.addFood || addFood;
  window.addStone = window.addStone || addStone;

  // Enemy castle asla gizlenmez — watchdog
  setInterval(()=>{
    document.querySelectorAll('.enemyCastle').forEach(el=>{
      if (!el) return;
      if (el.style.display==='none' || el.hidden || el.__mwRemoved){ el.style.display=''; el.hidden=false; el.__mwRemoved=false; }
    });
  }, 500);

  // March başlat
  window.MW_startMarchTo = function(targetEl, cfg){
    try{
      if (!myCastle || !targetEl) return toast("Hedef/kale yok.");
      const A = centerOf(myCastle);
      const B = centerOf(targetEl);
      const d = dist(A,B);
      const travelSecs = Math.max(1, Math.round(d / CFG.SPEED_PX_PER_SEC));

      const id = "m"+Date.now()+Math.floor(Math.random()*1e5);
      const m = {
        id, title: (cfg && cfg.title)||"Hedef",
        power: cfg && cfg.power || 0,
        loot:  cfg && cfg.loot  || {gold:0,food:0,stone:0},
        from: A, to: B,
        phase: "going",
        startedAt: Date.now(),
        travelSecs,
        endsAt: Date.now() + travelSecs*1000
      };
      const list = loadMarches(); list.push(m); saveMarches(list);
      targetsMap.set(id, targetEl);

      // march icon
      const dot = makeDot(); map.appendChild(dot); marchDots.set(id, dot);
      dot.style.left = (A.x-8)+"px"; dot.style.top = (A.y-8)+"px";

      toast("🚩 Sefer başladı!");
      return m;
    }catch(e){ console.warn("MW_startMarchTo err", e); }
  };

  // March tick
  function lerp(a,b,t){ return a + (b-a)*t; }
  function tick(){
    const list = loadMarches(); if (!list.length) return;
    const now = Date.now();

    for (let m of list){
      if (m._done) continue;
      const dot = marchDots.get(m.id) || makeDot(); 
      if (!marchDots.has(m.id)){ map.appendChild(dot); marchDots.set(m.id, dot); }

      if (m.phase === "going"){
        const t = Math.max(0, Math.min(1, (now - m.startedAt) / (m.endsAt - m.startedAt)));
        const x = lerp(m.from.x, m.to.x, t), y = lerp(m.from.y, m.to.y, t);
        dot.style.left = (x-8)+"px"; dot.style.top = (y-8)+"px";

        if (now >= m.endsAt){
          // VARIŞ → SAVAŞ
          m.phase = "fighting";
          m.startedAt = now;
          // Güce göre savaş süresi (sn): 5..300
          const p = parseInt(m.power||0,10);
          m.battleSecs = Math.max(5, Math.min(300, Math.round((p||0)/2)));
          m.endsAt = now + (m.battleSecs*1000);
          // hedef üzerinde ⚔️
          placeSwordsAt(m);
        }
      }
      else if (m.phase === "fighting"){
        // dot hedefte bekler
        dot.style.left = (m.to.x-8)+"px"; dot.style.top = (m.to.y-8)+"px";
        if (now >= m.endsAt){
          // Savaş bitti → DÖNÜŞ
          removeSwords(m.id);
          m.phase = "returning";
          m.startedAt = now;
          m.endsAt = now + (m.travelSecs*1000);
          // DÖNÜŞ BAŞLARKEN hedefi gizle (kale hariç)
          try{
            const tEl = targetsMap.get(m.id);
            if (tEl && !tEl.classList.contains('enemyCastle')){
              tEl.style.display='none'; tEl.__mwRemoved=true;
            }
          }catch(_){}
        }
      }
      else if (m.phase === "returning"){
        const t = Math.max(0, Math.min(1, (now - m.startedAt) / (m.endsAt - m.startedAt)));
        const x = lerp(m.to.x, m.from.x, t), y = lerp(m.to.y, m.from.y, t);
        dot.style.left = (x-8)+"px"; dot.style.top = (y-8)+"px";
        if (now >= m.endsAt){
          // VARIŞ (geri)
          // LOOT ekle
          try{
            const L = m.loot || {}; 
            if (L.gold) addGold(L.gold);
            if (L.food) addFood(L.food);
            if (L.stone) addStone(L.stone);
          }catch(_){}
          // bitir
          dot.remove(); marchDots.delete(m.id);
          m._done = true;
        }
      }
    }

    saveMarches(list);
  }
  setInterval(tick, 200);

  /* ---------- ⚔️ kılıç göstergesi ---------- */
  const swords = new Map(); // id -> el
  function placeSwordsAt(m){
    const targetEl = targetsMap.get(m.id);
    const el = document.createElement('div');
    el.textContent = '⚔️';
    el.style.cssText = 'position:absolute; font-size:64px; filter:drop-shadow(0 3px 4px rgba(0,0,0,.6)); animation: mwPulse 1.2s infinite ease-in-out; pointer-events:none; z-index:9999;';
    const pos = targetEl ? centerOf(targetEl) : m.to;
    el.style.left = (pos.x - 32) + 'px';
    el.style.top  = (pos.y - 96) + 'px';
    map.appendChild(el);
    swords.set(m.id, el);
  }
  function removeSwords(id){ const el = swords.get(id); if (el){ el.remove(); swords.delete(id); } }

  /* ---------- Şehir bağlama (kendi kaleyi hariç) ---------- */
  (function bindCities(){
    const nodes = Array.from(document.querySelectorAll('.mapIcon')).filter(x=>x.id!=='oyuncuKalesi' && !x.classList.contains('enemyCastle'));
    if (!nodes.length) return;
    nodes.forEach((el, i)=>{
      if (el.__cityBound) return; el.__cityBound = true;
      el.style.cursor='pointer';
      // Ölçekli güç/loot
      const base = {gold: 600, food: 400, power: 280};
      const cfg = { power: base.power + i*60, loot:{gold: base.gold+i*120, food: base.food+i*90} };
      el.addEventListener('click', ()=> openBattleModal({title:'🏙️ Şehir', power:cfg.power, loot:cfg.loot, targetEl: el, info:'Şehri ele geçirirsen ganimet dönüşte kasana eklenecek.'}) );
    });
  })();

  /* ---------- Yaratık spawn (ekstra) ---------- */
  ;(function spawnExtraMonsters(){
    if (!map) return;
    function ri(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
    for(let i=0;i<CFG.CREATURE_SPAWN;i++){
      const d = CFG.CREATURES[Math.floor(Math.random()*CFG.CREATURES.length)];
      const el = document.createElement('img');
      el.src = d.src; el.alt = d.type + ' yaratık'; el.className='monster';
      el.style.position='absolute';
      el.style.left = ri(600, CFG.WORLD_W-600) + 'px';
      el.style.top  = ri(600, CFG.WORLD_H-600) + 'px';
      el.style.width = d.size + 'px'; el.style.height = d.size + 'px';
      el.addEventListener('click', ()=> openBattleModal({title:`👹 ${d.type.toUpperCase()} Yaratık`, power:d.power, loot:d.loot, targetEl: el}) );
      map.appendChild(el);
    }
  })();

  /* ---------- Ekstra şehir spawn ---------- */
  ;(function spawnExtraCities(){
    if (!map) return;
    function ri(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
    for(let i=0;i<CFG.CITY_SPAWN;i++){
      const el = document.createElement('img');
      el.src = 'sehir1.png'; el.alt='Küçük Şehir'; el.className='mapIcon autoCity';
      el.style.left = ri(600, CFG.WORLD_W-600) + 'px';
      el.style.top  = ri(600, CFG.WORLD_H-600) + 'px';
      map.appendChild(el);
    }
    // yeni eklenenler için bağlayıcı
    setTimeout(()=>{
      document.querySelectorAll('.mapIcon.autoCity').forEach((el, i)=>{
        if (el.__cityBound) return; el.__cityBound = true;
        el.style.cursor='pointer';
        const base = {gold: 600, food: 400, power: 280};
        const cfg = { power: base.power + i*50, loot:{gold: base.gold+i*90, food: base.food+i*70} };
        el.addEventListener('click', ()=> openBattleModal({title:'🏙️ Şehir', power:cfg.power, loot:cfg.loot, targetEl: el}) );
      });
    }, 0);
  })();

  /* ---------- EnemyCastle Panel ---------- */
  ;(function enemyCastleUI(){
    if (window.__ENEMY_CASTLE_UI__) return; window.__ENEMY_CASTLE_UI__=true;

    const css = `
      #ecOverlay{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:11000;display:none}
      #ecModal{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);width:min(92vw,880px);background:#2d261e;color:#ffe9b0;z-index:11001;border:6px solid #d4b15f;border-radius:22px;box-shadow:0 10px 30px rgba(0,0,0,.5);font-family:inherit;display:none}
      .ec-head{display:flex;justify-content:space-between;align-items:center;padding:22px 24px;border-bottom:1px solid rgba(212,177,95,.35);font-size:30px;font-weight:900}
      .ec-body{padding:22px 24px;font-size:20px;line-height:1.5}
      .ec-tabs{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
      .ec-tab{padding:10px 14px;border-radius:12px;background:#4a3b28;color:#ffe9b0;cursor:pointer;font-weight:800;border:0}
      .ec-tab.ec-on{background:#ffcc00;color:#352b17}
      .ec-actions{display:flex;gap:10px;margin-top:14px}
      .ec-actions button{flex:1;padding:14px 16px;font-size:20px;font-weight:900;border-radius:12px;border:0;cursor:pointer}
      .ec-primary{background:#ffcc00;color:#352b17}.ec-ghost{background:#3a2f1e;color:#ffe9b0}
      input.ec-num{width:110px;padding:6px;border-radius:8px;border:1px solid #c9b07a;background:#1f1913;color:#ffe9b0}
      table.ec-table{width:100%;border-collapse:collapse;margin-top:10px}
      table.ec-table th,table.ec-table td{border-bottom:1px solid rgba(212,177,95,.25);padding:6px 4px;text-align:left}
    `;
    const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

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
      </div>`;
    document.body.appendChild(overlay); document.body.appendChild(modal);
    const $ = s => modal.querySelector(s);
    function show(){ overlay.style.display='block'; modal.style.display='block'; }
    function hide(){ overlay.style.display='none'; modal.style.display='none'; }
    $('#ecClose').onclick = hide; $('#ecCancel').onclick = hide; overlay.onclick = hide;

    const birlikGucu = {"Casus Kuş":1,"Cüce":3,"Yük Arabası":0,"Elf":5,"Gnom":2,"Şaman":1,"Süvari":6,"Mancınık":4,"Pegasus":7,"Ogre":8,"Ejderha":10,"Kaos":12};
    function getKB(){ try{return JSON.parse(localStorage.getItem('kaleBirlikleri')||'{}')}catch(_){return{}} }
    function sumPower(sel){ let p=0; Object.keys(sel).forEach(k=>{ p+=(sel[k]||0)*(birlikGucu[k]||0) }); return p; }

    function renderAttack(targetEl){
      const kb=getKB();
      const rows = Object.keys(birlikGucu).map(n=>{
        const own=kb[n]||0;
        return `<tr><td>${n}</td><td>${own}</td><td><input class="ec-num" type="number" min="0" max="${own}" value="0" data-ec-unit="${n}"></td></tr>`;
      }).join('');
      $('#ecView').innerHTML = `<div>Göndereceğin birlikleri seç:</div>
        <table class="ec-table"><thead><tr><th>Birlik</th><th>Mevcut</th><th>Gönder</th></tr></thead><tbody>${rows}</tbody></table>`;
      $('#ecDo').onclick = ()=>{
        const sel={}; modal.querySelectorAll('input[data-ec-unit]').forEach(i=>{ const n=i.dataset.ecUnit; const v=parseInt(i.value||'0'); if(v>0) sel[n]=v; });
        if (!Object.keys(sel).length) return alert('Birlik seçmedin.');
        const power=sumPower(sel);
        MW_startMarchTo(targetEl,{title:'🏰 Oyuncu Kalesi', power, loot:{}}); hide();
      };
    }
    function renderSpy(targetEl){
      const own=(getKB()['Casus Kuş']||0);
      $('#ecView').innerHTML = `<div>Kaç <b>Casus Kuş</b> göndereceksin?</div>
        <input id="ecSpyCount" class="ec-num" type="number" min="1" max="${own}" value="${Math.min(1,own)}">
        <div style="opacity:.7">Mevcut: ${own}</div>`;
      $('#ecDo').onclick = ()=>{
        const adet=parseInt((modal.querySelector('#ecSpyCount').value||'0')); if(!(adet>0)) return alert('Geçerli sayı gir.');
        MW_startMarchTo(targetEl,{title:`🕵️ Casusluk (${adet})`, power:0, loot:{}}); hide();
      };
    }
    function renderSupport(targetEl){
      const carts=(getKB()['Yük Arabası']||0), cap=carts*CFG.CART_CAP;
      $('#ecView').innerHTML = `<div>Göndereceğin ganimeti seç (kapasite: <b>${cap}</b>)</div>
        <div>Altın: <input id="ecGold" class="ec-num" type="number" min="0" value="0"></div>
        <div>Yemek: <input id="ecFood" class="ec-num" type="number" min="0" value="0"></div>
        <div style="opacity:.7">Yük Arabası: ${carts} (kapasite/birim: ${CFG.CART_CAP})</div>`;
      $('#ecDo').onclick = ()=>{
        const g=parseInt((modal.querySelector('#ecGold').value||'0'));
        const f=parseInt((modal.querySelector('#ecFood').value||'0'));
        if (g+f<=0) return alert('Gönderilecek ganimet yok.');
        if (g+f>cap) return alert('Kapasite yetersiz.');
        MW_startMarchTo(targetEl,{title:'📦 Destek Konvoyu', power:0, loot:{}}); hide();
      };
    }
    function renderMessage(targetEl){
      $('#ecView').innerHTML = `<div>Mesaj (online gelince):</div>
        <textarea id="ecMsg" style="width:100%;min-height:120px;border-radius:12px;border:1px solid #c9b07a;background:#1f1913;color:#ffe9b0;padding:10px"></textarea>`;
      $('#ecDo').onclick = ()=>{
        const txt=(modal.querySelector('#ecMsg').value||'').trim(); if(!txt) return alert('Mesaj boş.');
        const logs=JSON.parse(localStorage.getItem('mw_messages')||'[]'); logs.push({t:Date.now(),to:'enemyCastle',msg:txt});
        localStorage.setItem('mw_messages', JSON.stringify(logs)); alert('Mesaj kaydedildi (offline).'); hide();
      };
    }
    function setTab(tab, targetEl){
      modal.querySelectorAll('.ec-tab').forEach(b=>b.classList.toggle('ec-on', b.dataset.ecTab===tab));
      if (tab==='attack') renderAttack(targetEl);
      else if (tab==='spy') renderSpy(targetEl);
      else if (tab==='support') renderSupport(targetEl);
      else renderMessage(targetEl);
    }
    window.__EC_openFor = function(targetEl){
      show(); setTab('attack', targetEl);
      modal.querySelectorAll('.ec-tab').forEach(btn=> btn.onclick=()=> setTab(btn.dataset.ecTab, targetEl) );
    };

    function bindEnemy(){
      document.querySelectorAll('.enemyCastle').forEach(el=>{
        if (el.__ecBound) return; el.__ecBound=true;
        el.style.cursor='pointer';
        el.addEventListener('click', (ev)=>{ ev.stopImmediatePropagation(); window.__EC_openFor(el); }, true);
      });
    }
    if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', bindEnemy); else bindEnemy();
    new MutationObserver(bindEnemy).observe(document.body,{childList:true,subtree:true});
  })();

  /* ---------- Battle modal (büyük) ---------- */
  function ensureMainModal(){
    if (document.getElementById('mwModal')) return;
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
      </div>`;
    document.body.appendChild(overlay); document.body.appendChild(modal);
    // basic styles (minimum)
    const st = document.createElement('style'); st.textContent = `
      #mwOverlay{ position:fixed; inset:0; background:rgba(0,0,0,.55); z-index:10000; display:none; }
      #mwModal{ position:fixed; left:50%; top:50%; transform:translate(-50%,-50%);
        width:min(92vw, 840px); background:#2d261e; color:#ffe9b0; z-index:10001;
        border:6px solid #d4b15f; border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,.5); font-family:inherit; display:none; }
      .mw-modal-header{ display:flex; justify-content:space-between; align-items:center; padding:22px 24px; border-bottom:1px solid rgba(212,177,95,.35); font-size:36px; font-weight:900; }
      .mw-modal-header button{ background:transparent; border:0; color:#ffe9b0; font-size:34px; cursor:pointer; }
      .mw-modal-body{ padding:22px 24px; font-size:28px; line-height:1.6; }
      .mw-modal-actions{ display:flex; gap:16px; padding:22px 24px; }
      .mw-modal-actions button{ flex:1; padding:18px 22px; font-size:28px; border-radius:16px; border:0; cursor:pointer; }
      #mwAttackBtn{ background:#ffcc00; color:#352b17; } #mwCancelBtn{ background:#4a3b28; color:#ffe9b0; }
      .mw-march{ position:absolute; width:72px; height:72px; font-size:48px; display:flex; align-items:center; justify-content:center; }
      @keyframes mwPulse{ 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }
    `; document.head.appendChild(st);

    // events
    const $ = (id)=>document.getElementById(id);
    $('mwCloseBtn').onclick = closeBattleModal;
    $('mwCancelBtn').onclick = closeBattleModal;
    overlay.onclick = closeBattleModal;

    document.addEventListener('click', function(e){
      const btn = e.target && e.target.closest && e.target.closest('#mwAttackBtn');
      if (!btn) return;
      const cfg = window.__MW_current;
      if (!cfg || !cfg.targetEl) return alert('Hedef yok.');
      MW_startMarchTo(cfg.targetEl, cfg);
      closeBattleModal();
    }, true);
  }
  function openBattleModal(cfg){
    ensureMainModal();
    window.__MW_current = cfg;
    const $ = (id)=>document.getElementById(id);
    $('mwTitle').textContent = cfg.title || 'Hedef';
    $('mwPower').textContent = 'Gerekli güç: ' + (cfg.power ?? '-');
    const L = cfg.loot || {}; $('mwLoot').textContent = 'Ganimet: +' + (L.gold||0) + ' altın, +' + (L.food||0) + ' yemek';
    const A = centerOf(myCastle), B = centerOf(cfg.targetEl);
    const eta = Math.max(1, Math.round( dist(A,B) / CFG.SPEED_PX_PER_SEC ));
    $('mwETA').textContent = 'Tahmini varış: ~' + eta + ' sn';
    $('mwInfo').textContent = cfg.info || '';
    document.getElementById('mwOverlay').style.display='block';
    document.getElementById('mwModal').style.display='block';
  }
  function closeBattleModal(){ 
    const ov = document.getElementById('mwOverlay'); const md = document.getElementById('mwModal');
    if (ov) ov.style.display='none'; if (md) md.style.display='none';
  }

  /* ---------- Koordinat toast (ikon/yaratık tıklamasında) ---------- */
  ;(function bindCoordHints(){
    function attach(el){
      if (el.__coordBound) return; el.__coordBound = true;
      el.addEventListener('click', ()=>{
        const p = centerOf(el);
        toast(`📍 X:${Math.round(p.x)} Y:${Math.round(p.y)}`);
      });
    }
    document.querySelectorAll('.mapIcon').forEach(attach);
    document.querySelectorAll('.monster').forEach(attach);
    new MutationObserver(muts=>{
      muts.forEach(m=> m.addedNodes && m.addedNodes.forEach(n=>{
        if (n.nodeType===1 && n.classList && (n.classList.contains('mapIcon') || n.classList.contains('monster'))) attach(n);
      }));
    }).observe(map || document.body, {childList:true, subtree:true});
  })();

  /* ---------- Kendi kaleye tıkla → menü ---------- */
  if (myCastle && !myCastle.__mwGoBack){
    myCastle.__mwGoBack = true;
    myCastle.style.cursor='pointer';
    myCastle.addEventListener('click', ()=>{ window.location.href='index.html'; });
  }

})();
