// ═══════════════════════════════════════
//  ui.js — render, HUD, navigation
// ═══════════════════════════════════════

// toast, haptic, hapticN, fmt → globals.js


// ── Shared Stage 2 helpers ──
function marketItem(id){
  return (typeof getMarketItem==='function' ? getMarketItem(id) : null) || (typeof GOODS!=='undefined' && GOODS[id] ? {
    id,
    name:GOODS[id].name,
    icon:GOODS[id].icon,
    basePrice:GOODS[id].base,
    category:'basic',
    rarity:'common',
    volume:1,
    illegal:false,
  } : null);
}
function marketName(id){ return marketItem(id)?.name || id; }
function marketIcon(id){ return marketItem(id)?.icon || '📦'; }
function marketBase(id){ const item=marketItem(id); return Number(item?.basePrice||item?.base||0); }
function systemMarketIds(sys){ return Array.isArray(sys?.goods) ? sys.goods.filter(gId=>!!marketItem(gId)) : []; }
function currentTradePlanetIdx(sys){ return typeof getCurrentPlanetIndex==='function' ? getCurrentPlanetIndex(sys.id) : 0; }
function currentTradePlanetLabel(sys){ return typeof getPlanetLabel==='function' ? getPlanetLabel(sys, currentTradePlanetIdx(sys)) : ((sys.planets||[])[0]||sys.emoji||'🪐'); }
let selectedTradeGood=null;
let tradeSort='profit';
let tradeCategory='all';
function isOwnedEquip(id){
  return !!(G.owned_equip?.includes(id) || Object.values(G.equip||{}).includes(id) || (EQUIPMENT||[]).find(e=>e.id===id && (e.cost||0)===0));
}

function tradeCategories(ids){
  const set=new Set();
  ids.forEach(id=>{ const item=marketItem(id); if(item?.category) set.add(item.category); });
  return ['all', ...Array.from(set)];
}

function setTradeSort(mode){ tradeSort=mode; renderTrade(); }
function setTradeCategory(cat){ tradeCategory=cat; renderTrade(); }
function selectTradeGood(gId){ selectedTradeGood=gId; renderTrade(); }

function tradeTrendMeta(hist=[]){
  if(hist.length<2) return {cls:'eq', label:'Стабильно'};
  const diff=hist[hist.length-1]-hist[0];
  if(diff>0) return {cls:'up', label:'Рост'};
  if(diff<0) return {cls:'dn', label:'Падение'};
  return {cls:'eq', label:'Стабильно'};
}

function sparkline(values=[]){
  if(!values.length) return '—';
  const chars='▁▂▃▄▅▆▇█';
  const min=Math.min(...values), max=Math.max(...values);
  if(min===max) return chars[3].repeat(values.length);
  return values.map(v=>chars[Math.max(0, Math.min(chars.length-1, Math.round(((v-min)/(max-min))*(chars.length-1))))]).join('');
}

function bestSaleLine(opp){
  if(!opp) return 'Нет выгодного маршрута';
  const toSys=SYSTEMS.find(s=>s.id===opp.toSysId);
  const pLabel=typeof getPlanetLabel==='function' ? getPlanetLabel(toSys, opp.toPlanetIdx) : toSys.name;
  return `${toSys.name} · ${pLabel} · чистыми ${fmt(opp.net)} кр`;
}
function normalizeEquipSection(item){
  const cat=item?.cat||'';
  if(cat==='hull') return 'hull';
  if(cat==='weapon') return 'weapon';
  if(cat==='engine') return 'engine';
  if(cat==='defense' || cat==='shield') return 'defense';
  if(cat==='support') return 'support';
  if(cat==='specmod') return 'specmod';
  return 'other';
}
const EQUIP_SECTION_META={
  hull:{label:'🚀 Корпуса'},
  weapon:{label:'⚔️ Оружие'},
  defense:{label:'🛡 Защита'},
  engine:{label:'🔥 Двигатели'},
  specmod:{label:'🧩 Спецмодули'},
  support:{label:'🤖 Дроны'},
  other:{label:'📦 Другое'},
};
function equipTierLabel(item){ return `T${item?.tier||1}`; }
function equipRarityColor(item){
  const map={common:'var(--muted2)',enhanced:'var(--green)',rare:'var(--cyan)',military:'var(--purple)',experimental:'var(--gold)',legendary:'var(--pink)'};
  return map[item?.rarity] || 'var(--muted2)';
}
function equipManufacturerLine(item){
  const m=(typeof MANUFACTURERS!=='undefined' && item?.manufacturer) ? MANUFACTURERS[item.manufacturer] : null;
  return m ? `${m.icon} ${m.name}` : '—';
}


// ── HUD ──
function updateHUD(){
  const rank=getRank();
  const sysName=SYSTEMS.find(s=>s.id===G.sys)?.name||'?';
  ['h-cred','g-cred','t-cred','q-cred','mo-cred'].forEach(id=>{
    const el=document.getElementById(id);if(el) el.textContent=fmt(G.cr);
  });
  ['h-fuel','g-fuel'].forEach(id=>{const el=document.getElementById(id);if(el) el.textContent=Math.floor(G.fuel);});
  ['g-loc','t-loc','q-loc'].forEach(id=>{const el=document.getElementById(id);if(el) el.textContent=sysName;});
  const hh=document.getElementById('h-hull');
  if(hh){hh.textContent=Math.floor(G.hull/G.maxHull*100)+'%';}
  const hr=document.getElementById('h-rank');
  if(hr){hr.textContent=rank.name;hr.style.color=rank.color;}
  G.cargoMax=calcCargoMax();
  const tc=document.getElementById('t-cargo');if(tc) tc.textContent=`${calcCargoUsed()}/${G.cargoMax}`;
  const ts=timeStr();
  ['gc-time','t-time','q-time'].forEach(id=>{const el=document.getElementById(id);if(el) el.textContent=ts;});
  const ge=document.getElementById('gc-era');if(ge) ge.textContent=`Эпоха: ${G.era}`;
  const mr=document.getElementById('mo-rp');if(mr) mr.textContent=fmt(Math.floor(G.rp));
  const mh=document.getElementById('mo-hull');if(mh) mh.textContent=Math.floor(G.hull/G.maxHull*100)+'%';
  const mm=document.getElementById('mo-mis');if(mm) mm.textContent=G.missiles;
  updateQuestBadge();
}

// curScreen declared in globals.js
function goTo(name,btn){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('sc-'+name).classList.add('active');
  curScreen=name;
  if(name==='galaxy') setTimeout(initGalaxy,50);
  if(name==='trade')  renderTrade();
  if(name==='quest')  {refreshQuests();renderQuests();}
  if(name==='more')   renderMoreTab();
  if(name==='mine')   renderMine();
  updateHUD();
}

// haptic/hapticN/tg → globals.js

// ── Mine screen ──
function renderMine(){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  G.maxHull=calcMaxHull();G.cargoMax=calcCargoMax();
  const cp=calcClickPower(),cps=calcCPS(),need=xpForLvl(G.lvl);
  document.getElementById('m-cred').textContent=fmt(G.cr);
  document.getElementById('m-cps').textContent=cps>0?`+${fmt(cps)}/сек`:'нет авто-добычи';
  document.getElementById('m-lvl').textContent=G.lvl;
  document.getElementById('m-sp').textContent=`+${calcRpMult().toFixed(1)}× НО/сек`;
  document.getElementById('xp-t').textContent=`${Math.floor(G.xp)}/${need}`;
  document.getElementById('xp-b').style.width=Math.min(100,G.xp/need*100)+'%';
  document.getElementById('en-t').textContent=`${Math.floor(G.energy)}/${G.maxEnergy}`;
  document.getElementById('en-b').style.width=(G.energy/G.maxEnergy*100)+'%';
  document.getElementById('hl-t').textContent=`${Math.floor(G.hull)}/${G.maxHull}`;
  document.getElementById('hl-b').style.width=(G.hull/G.maxHull*100)+'%';
  document.getElementById('planet-em').textContent=sys.emoji;
  document.getElementById('tap-lbl').textContent=
    `[ ТАП = +${fmt(cp)} · ⚡ +${(0.18+gSkill('engineering')*0.02).toFixed(2)}/сек ]`;
  const glows={home:'rgba(0,255,136,.4)',mining:'rgba(255,215,0,.4)',trade:'rgba(0,200,255,.4)',
    danger:'rgba(255,58,58,.4)',science:'rgba(168,85,247,.4)',paradise:'rgba(0,200,100,.4)'};
  document.getElementById('planet-glow').style.background=
    `radial-gradient(circle,${glows[sys.type]||'rgba(0,200,255,.4)'} 0%,transparent 70%)`;

  // helpers
  const hg=document.getElementById('helpers-grid');hg.innerHTML='';
  HELPERS.forEach(h=>{
    const owned=G.helpers[h.id]||0;
    const cost=Math.round(h.cost*Math.pow(h.costM,owned));
    const ok=G.cr>=cost;
    hg.innerHTML+=`<div class="card${ok?' glow-c':''}">
      <div style="font-size:24px;margin-bottom:4px">${h.icon}</div>
      <div style="font-size:12px;font-weight:700">${h.name}</div>
      <div style="font-size:10px;color:var(--muted2);margin-bottom:6px">+${h.cps}/сек</div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-family:var(--mono);font-size:16px;color:var(--purple)">${owned}</span>
        <button class="btn btn-sm ${ok?'btn-c':''}" ${ok?'':'disabled'} onclick="buyHelper('${h.id}')">💰${fmt(cost)}</button>
      </div></div>`;
  });

  // ship upgrades
  const sg=document.getElementById('ship-upg-grid');sg.innerHTML='';
  SHIP_UPGRADES.forEach(u=>{
    const lvl=gUpg(u.id),max=u.costs.length,isMax=lvl>=max;
    const cost=isMax?null:u.costs[lvl];const ok=!isMax&&G.cr>=cost;
    const dots=Array(max).fill(0).map((_,i)=>
      `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;margin-right:2px;
        background:${i<lvl?'var(--cyan)':'rgba(255,255,255,.08)'};
        ${i<lvl?'box-shadow:0 0 5px var(--cyan)':''}"></span>`).join('');
    sg.innerHTML+=`<div class="card${ok?' glow-c':''}${isMax?' glow-g':''}">
      <div style="font-size:22px;margin-bottom:3px">${u.icon}</div>
      <div style="font-size:12px;font-weight:700">${u.name}</div>
      <div style="font-size:10px;color:var(--muted2);margin-bottom:5px">${u.desc}</div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>${dots}</div>
        ${isMax?`<span style="font-size:10px;color:var(--green)">MAX</span>`:
          `<button class="btn btn-sm ${ok?'btn-c':''}" ${ok?'':'disabled'} onclick="buyShipUpg('${u.id}')">💰${fmt(cost)}</button>`}
      </div></div>`;
  });
}

// ── Trade screen ──



function renderTrade(){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  G.cargoMax=calcCargoMax();
  const used=calcCargoUsed();
  const goodsIds=systemMarketIds(sys);
  const pIdx=currentTradePlanetIdx(sys);
  const profile=typeof getPlanetProfile==='function' ? getPlanetProfile(sys, pIdx) : {name:'Обычная', tax:0, risk:0};
  const career=(typeof getCareerProfile==='function') ? getCareerProfile() : {name:'Торговец',icon:'💱'};
  const pLabel=currentTradePlanetLabel(sys);
  if(!selectedTradeGood || !goodsIds.includes(selectedTradeGood)) selectedTradeGood=goodsIds[0] || null;
  const selectedId=selectedTradeGood;
  const selectedItem=selectedId ? marketItem(selectedId) : null;
  const selectedBuy = selectedId && typeof getPlanetBuyPrice==='function' ? getPlanetBuyPrice(sys.id, pIdx, selectedId) : 0;
  const selectedAvg = selectedId ? (G.cargoCost?.[selectedId]||0) : 0;
  const bestBuyOpp = selectedId && typeof getBestTradeOpportunity==='function' ? getBestTradeOpportunity(selectedId, sys.id, pIdx, 'buy') : null;
  const bestCargoOpp = selectedId && (G.cargo?.[selectedId]||0) && typeof getBestTradeOpportunity==='function' ? getBestTradeOpportunity(selectedId, sys.id, pIdx, 'cargo') : null;
  const selectedHist=(G.planetPriceHistory?.[sys.id]?.[pIdx]?.[selectedId]) || G.priceHistory[sys.id]?.[selectedId] || [];
  const selectedTrend=tradeTrendMeta(selectedHist);
  const tradeRumors = typeof getMarketRumors==='function' ? getMarketRumors(sys.id) : [];
  const urgent=(typeof getUrgentWarnings==='function') ? getUrgentWarnings() : [];
  let h=`<div class="hero-panel trade-head">
    <div class="hero-top">
      <div>
        <div class="hero-kicker">рынок · ${sys.name}</div>
        <div class="hero-title">Планетарный рынок</div>
        <div class="hero-sub">Следите за ценами, трендами и маршрутами: лучшая прибыль теперь зависит от выбранной планеты, налога и расхода топлива.</div>
      </div>
      <div class="hero-icon">💱</div>
    </div>
    <div class="mini-grid">
      <div class="mini-stat"><div class="l">Планета</div><div class="v">${pLabel}</div></div>
      <div class="mini-stat"><div class="l">Тип</div><div class="v">${profile.name}</div></div>
      <div class="mini-stat"><div class="l">Налог</div><div class="v">${profile.tax||0}%</div></div>
      <div class="mini-stat"><div class="l">Риск</div><div class="v">${profile.risk||0}/5</div></div>
      <div class="mini-stat"><div class="l">Путь</div><div class="v">${career.icon||'💱'} ${career.name||'Торговец'}</div></div>
      <div class="mini-stat"><div class="l">Влияние</div><div class="v">${G.influence||0}</div></div>
      <div class="mini-stat"><div class="l">Честь</div><div class="v">${G.honor||0}</div></div>
      <div class="mini-stat"><div class="l">Лицензии</div><div class="v">${Object.keys(G.licenses||{}).length}</div></div>
    </div>
  </div>`;
  if(urgent.length){
    h+=`<div class="card" style="margin-top:10px"><div style="font-size:10px;color:var(--muted2);letter-spacing:1.6px;text-transform:uppercase;margin-bottom:8px">Что важно прямо сейчас</div><div style="display:flex;gap:6px;flex-wrap:wrap">${urgent.map(w=>uiStatusChip(`${w.icon||'•'} ${w.text}`, w.level==='high'?'danger':w.level==='medium'?'warning':'info')).join('')}</div></div>`;
  }
  h+=`<div class="section-shell"><div class="bar-row"><div class="bar-hd"><span>📦 Трюм</span><span>${used}/${G.cargoMax}</span></div>
  <div class="bar-tr"><div class="bar-f" style="width:${Math.min(100,(used/G.cargoMax*100)||0)}%;background:linear-gradient(90deg,var(--amber),var(--gold))"></div></div></div></div>`;

  if(selectedItem){
    h+=`<div class="card glow-c" style="margin-top:10px">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start">
        <div>
          <div style="font-size:10px;color:var(--muted2);letter-spacing:1.6px;text-transform:uppercase">Аналитика товара</div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:4px">
            <div style="font-size:28px">${marketIcon(selectedId)}</div>
            <div>
              <div style="font-size:16px;font-weight:700">${marketName(selectedId)}</div>
              <div style="font-size:11px;color:var(--muted2)">${selectedItem.category||'basic'} · ${selectedTrend.label} · ${sparkline(selectedHist.slice(-5))}</div>
            </div>
          </div>
        </div>
        <button class="btn btn-sm" onclick="selectTradeGood('${selectedId}')">Обновить</button>
      </div>
      <div class="mini-grid" style="margin-top:12px">
        <div class="mini-stat"><div class="l">Цена покупки</div><div class="v">${fmt(selectedBuy)}</div></div>
        <div class="mini-stat"><div class="l">Средняя закупка</div><div class="v">${selectedAvg?fmt(selectedAvg):'—'}</div></div>
        <div class="mini-stat"><div class="l">Лучшая продажа</div><div class="v">${bestBuyOpp?fmt(bestBuyOpp.salePrice):'—'}</div></div>
        <div class="mini-stat"><div class="l">Чистая прибыль</div><div class="v" style="color:${(bestBuyOpp?.net||0)>=0?'var(--green)':'var(--red)'}">${bestBuyOpp?fmt(bestBuyOpp.net):'—'}</div></div>
      </div>
      <div style="font-size:11px;color:var(--muted2);margin-top:10px">📍 Лучший маршрут для покупки сейчас: ${bestSaleLine(bestBuyOpp)}</div>
      ${bestCargoOpp?`<div style="font-size:11px;color:var(--muted2);margin-top:4px">📦 Для вашего груза: ${bestSaleLine(bestCargoOpp)}</div>`:''}
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        ${uiStatusChip(`Тренд: ${selectedTrend.label}`, selectedTrend.cls==='up'?'warning':selectedTrend.cls==='dn'?'positive':'neutral')}
        ${uiStatusChip(`Налог: ${profile.tax||0}%`, (profile.tax||0)>=8?'warning':'info')}
        ${uiStatusChip(`Риск: ${profile.risk||0}/5`, (profile.risk||0)>=4?'danger':(profile.risk||0)>=2?'warning':'info')}
        ${selectedItem?.licenseRequired && !(typeof hasLicense==='function' && hasLicense(selectedItem.licenseRequired)) ? uiStatusChip(`Нужна лицензия`, 'warning') : ''}
      </div>
      <div style="font-size:10px;color:var(--muted2);margin-top:8px">История: ${selectedHist.slice(-5).map(v=>fmt(v)).join(' · ') || '—'}</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="btn btn-sm btn-c" onclick="openModuleShortcut('trade')">Оставить на радаре</button>
        ${bestBuyOpp?`<button class="btn btn-sm btn-g" onclick="openModuleShortcut('galaxy')">Открыть маршрут</button>`:''}
      </div>
    </div>`;
  }

  if(tradeRumors.length){
    h+=`<div class="card" style="margin-top:10px"><div style="font-size:10px;color:var(--muted2);letter-spacing:1.6px;text-transform:uppercase;margin-bottom:8px">Слухи рынка</div>`;
    tradeRumors.forEach(line=>{
      h+=`<div style="font-size:11px;color:var(--text);margin-bottom:6px">${line}</div>`;
    });
    h+=`</div>`;
  }

  const availableLicenses=(typeof MARKET_LICENSES!=='undefined') ? Object.values(MARKET_LICENSES) : [];
  if(availableLicenses.length){
    h+=`<div class="card" style="margin-top:10px"><div style="font-size:10px;color:var(--muted2);letter-spacing:1.6px;text-transform:uppercase;margin-bottom:8px">Лицензии</div>`;
    availableLicenses.slice(0,4).forEach(def=>{
      const owned=!!G.licenses?.[def.id];
      const check=(typeof canBuyLicense==='function') ? canBuyLicense(def.id) : {ok:false, reason:'Недоступно'};
      h+=`<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:8px;padding-bottom:8px;border-bottom:1px solid var(--b1)">
        <div><div style="font-size:12px;font-weight:700">${def.icon} ${def.name}</div><div style="font-size:10px;color:var(--muted2)">${def.desc}</div></div>
        <div style="text-align:right">${owned?`<div style="font-size:10px;color:var(--green)">Куплена</div>`:`<button class="btn btn-sm ${check.ok?'btn-g':''}" onclick="buyLicense('${def.id}')" ${check.ok?'':'disabled'}>${fmt(def.cost)}</button><div style="font-size:9px;color:var(--muted2);margin-top:3px">${check.ok?'Готово':(check.reason||'')}</div>`}</div>
      </div>`;
    });
    h+=`<div style="font-size:10px;color:var(--muted2)">Полный список лицензий и выбор карьерного пути доступны во вкладке “Рейнджеры”.</div></div>`;
  }

  const planets=sys.planets||[sys.emoji||'🪐'];
  h+=`<div class="sh">Планеты системы</div><div style="display:flex;gap:6px;overflow:auto;margin-bottom:10px">`;
  planets.forEach((emoji,idx)=>{
    const pp=typeof getPlanetProfile==='function' ? getPlanetProfile(sys, idx) : profile;
    h+=`<button class="tc-btn ${idx===pIdx?'on':''}" onclick="selectTradePlanet(${idx})">${emoji} ${pp.name}</button>`;
  });
  h+=`</div>`;

  const categories=tradeCategories(goodsIds);
  h+=`<div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start;flex-wrap:wrap;margin-bottom:8px">
      <div style="display:flex;gap:6px;overflow:auto;max-width:100%">`;
  categories.forEach(cat=>{
    const meta=(typeof MARKET_CATEGORY_META!=='undefined' && MARKET_CATEGORY_META[cat]) || {name:cat};
    h+=`<button class="tc-btn ${tradeCategory===cat?'on':''}" onclick="setTradeCategory('${cat}')">${cat==='all'?'Все':(meta.name||cat)}</button>`;
  });
  h+=`</div>
      <div style="display:flex;gap:6px;overflow:auto">
        <button class="tc-btn ${tradeSort==='profit'?'on':''}" onclick="setTradeSort('profit')">Прибыль</button>
        <button class="tc-btn ${tradeSort==='price'?'on':''}" onclick="setTradeSort('price')">Цена</button>
        <button class="tc-btn ${tradeSort==='risk'?'on':''}" onclick="setTradeSort('risk')">Риск</button>
        <button class="tc-btn ${tradeSort==='name'?'on':''}" onclick="setTradeSort('name')">Имя</button>
      </div>
    </div>`;

  const inv=Object.entries(G.cargo||{}).filter(([,v])=>v>0);
  if(inv.length){
    h+=`<div class="sh">Ваш груз</div>`;
    inv.forEach(([gId,amt])=>{
      const item=marketItem(gId); if(!item) return;
      const price=typeof getPlanetSalePrice==='function' ? getPlanetSalePrice(sys.id, pIdx, gId) : (typeof getPlanetPrice==='function' ? getPlanetPrice(sys.id, pIdx, gId) : (G.prices[sys.id]?.[gId]||0));
      const avg=G.cargoCost?.[gId]||0;
      const delta=price && avg ? price-avg : 0;
      const cargoOpp=typeof getBestTradeOpportunity==='function' ? getBestTradeOpportunity(gId, sys.id, pIdx, 'cargo') : null;
      h+=`<div class="good-row ${selectedId===gId?'glow-c':''}" onclick="selectTradeGood('${gId}')"><div class="gi">${marketIcon(gId)}</div>
      <div class="ginfo">
        <div class="gname">${marketName(gId)} ×${amt}</div>
        <div class="gprice">Продать здесь: ${price?fmt(price):'—'} /шт</div>
        <div style="font-size:9px;color:var(--muted2)">Куплено: ${avg?fmt(avg)+' кр/ед':'—'} ${delta?`<span style="color:${delta>0?'var(--green)':'var(--red)'}">${delta>0?'▲':'▼'}${fmt(Math.abs(delta))}</span>`:''}</div>
        ${cargoOpp?`<div style="font-size:9px;color:var(--cyan)">Лучше: ${bestSaleLine(cargoOpp)}</div>`:''}
      </div><div class="gbtns">
        <button class="btn btn-sm btn-r" onclick="event.stopPropagation();sellGood('${gId}',1)" ${price?'':'disabled'}>×1</button>
        <button class="btn btn-sm btn-r" onclick="event.stopPropagation();sellGood('${gId}',${amt})" ${price?'':'disabled'}>Всё</button>
      </div></div>`;
    });
  }

  const filteredGoods=goodsIds.filter(gId=> tradeCategory==='all' || marketItem(gId)?.category===tradeCategory).map(gId=>{
    const item=marketItem(gId); if(!item) return null;
    const price=typeof getPlanetPrice==='function' ? getPlanetPrice(sys.id, pIdx, gId) : (G.prices[sys.id]?.[gId] || marketBase(gId));
    const buyP=typeof getPlanetBuyPrice==='function' ? getPlanetBuyPrice(sys.id, pIdx, gId) : Math.round(price*(1-gSkill('eloquence')*.02)*(1+((profile.tax||0)/100)));
    const st=typeof getPlanetMarketState==='function' ? getPlanetMarketState(sys.id, pIdx, gId) : {demand:1,supply:1};
    const hist=(G.planetPriceHistory?.[sys.id]?.[pIdx]?.[gId]) || G.priceHistory[sys.id]?.[gId] || [];
    const trend=tradeTrendMeta(hist);
    const canBuy=G.cr>=buyP && used<G.cargoMax;
    const owned=G.cargo[gId]||0;
    const opp=typeof getBestTradeOpportunity==='function' ? getBestTradeOpportunity(gId, sys.id, pIdx, 'buy') : null;
    return {gId,item,price,buyP,st,hist,trend,canBuy,owned,opp};
  }).filter(Boolean);

  filteredGoods.sort((a,b)=>{
    if(tradeSort==='price') return a.buyP-b.buyP;
    if(tradeSort==='risk') {
      const riskA=(SYSTEMS.find(s=>s.id===a.opp?.toSysId)?.pc||0)+(typeof getPlanetProfile==='function'&&a.opp?getPlanetProfile(SYSTEMS.find(s=>s.id===a.opp.toSysId), a.opp.toPlanetIdx).risk:0);
      const riskB=(SYSTEMS.find(s=>s.id===b.opp?.toSysId)?.pc||0)+(typeof getPlanetProfile==='function'&&b.opp?getPlanetProfile(SYSTEMS.find(s=>s.id===b.opp.toSysId), b.opp.toPlanetIdx).risk:0);
      return riskA-riskB;
    }
    if(tradeSort==='name') return marketName(a.gId).localeCompare(marketName(b.gId),'ru');
    return (b.opp?.net||-9999)-(a.opp?.net||-9999);
  });

  h+=`<div class="sh">${pLabel} — товары (${filteredGoods.length})</div>`;
  filteredGoods.forEach(({gId,item,buyP,st,hist,trend,canBuy,owned,opp})=>{
    const demandState=(st?.demand||1)>(st?.supply||1)+0.08 ? 'высокий спрос' : (st?.supply||1)>(st?.demand||1)+0.08 ? 'переизбыток' : 'баланс';
    const demandColor=demandState==='высокий спрос'?'var(--red)':demandState==='переизбыток'?'var(--green)':'var(--muted2)';
    const locked=!!item.licenseRequired && typeof hasLicense==='function' && !hasLicense(item.licenseRequired);
    const lockReason=locked && typeof getLicenseReason==='function' ? getLicenseReason(item) : '';
      const rowRisk=((opp?.risk||0)+(SYSTEMS.find(s=>s.id===opp?.toSysId)?.pc||0))||0;
    h+=`<div class="good-row ${selectedId===gId?'glow-c':''}" onclick="selectTradeGood('${gId}')"><div class="gi">${marketIcon(gId)}</div>
      <div class="ginfo">
        <div class="gname">${marketName(gId)}</div>
        <div class="gprice">💰 ${fmt(buyP)} <span style="color:var(--muted2)">база ${fmt(marketBase(gId))}</span></div>
        <div style="font-size:9px;color:${trend.cls==='up'?'var(--red)':trend.cls==='dn'?'var(--green)':'var(--muted2)'}">${trend.label} · ${item.category||'basic'} · ${sparkline(hist.slice(-5))}</div>
        <div style="font-size:9px;color:${demandColor}">${demandState} · D ${Number(st?.demand||1).toFixed(2)} / S ${Number(st?.supply||1).toFixed(2)}</div>
        ${locked?`<div style="font-size:9px;color:var(--gold)">🔒 ${lockReason}</div>`:''}
        ${opp?`<div style="font-size:9px;color:${(opp.net||0)>=0?'var(--green)':'var(--red)'}">Маршрут: ${bestSaleLine(opp)}</div>`:''}
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">
          ${opp && (opp.net||0)>0 ? uiStatusChip(`выгодно`, (opp.net||0)>=Math.max(80, marketBase(gId)*0.35)?'positive':'info') : ''}
          ${rowRisk>=3 ? uiStatusChip('опасный сектор','danger') : rowRisk>1.5 ? uiStatusChip('средний риск','warning') : ''}
          ${locked ? uiStatusChip('нужна лицензия','warning') : ''}
        </div>
        ${owned?`<div style="font-size:9px;color:var(--muted2)">В трюме: ${owned}</div>`:''}
      </div>
      <div class="gbtns">
        <button class="btn btn-sm btn-g" onclick="event.stopPropagation();buyGood('${gId}')" ${(canBuy && !locked)?'':'disabled'}>Купить 1</button>
        <button class="btn btn-sm btn-g" onclick="event.stopPropagation();buyGoodMax('${gId}')" ${(canBuy && !locked)?'':'disabled'}>Макс</button>
        <button class="btn btn-sm btn-r" onclick="event.stopPropagation();sellGood('${gId}',1)" ${owned?'':'disabled'}>Продать</button>
      </div></div>`;
  });
  document.getElementById('trade-scr').innerHTML=h;
  document.getElementById('t-cred').textContent=fmt(G.cr);
  document.getElementById('t-cargo').textContent=`${used}/${G.cargoMax}`;
  document.getElementById('t-loc').textContent=`${sys.name} · ${profile.name}`;
  document.getElementById('t-time').textContent=timeStr();
}

function selectTradePlanet(idx){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  if(typeof setCurrentPlanetIndex==='function') setCurrentPlanetIndex(idx, sys.id);
  renderTrade();
}

// ── Quest screen ──
function renderQuests(){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  let h=`<div class="sh">Мэры — ${sys.name}</div>`;
  const localMayors=MAYORS.filter(m=>m.sysId===G.sys);
  if(!localMayors.length){
    h+=`<div class="card" style="color:var(--muted2);font-size:12px">В этой системе нет мэра.</div>`;
  } else {
    localMayors.forEach(m=>{
      h+=`<div class="card" style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <span style="font-size:32px">${m.icon}</span>
        <div><div style="font-size:13px;font-weight:700">${m.name}</div>
        <div style="font-size:10px;color:var(--purple)">${m.title}</div></div></div>`;
    });
  }
  const active=G.quests.filter(q=>!q.done&&q.sysId===G.sys);
  const elsewhere=G.quests.filter(q=>!q.done&&q.sysId!==G.sys&&q.accepted);
  h+=`<div class="sh">Задания в этой системе (${active.length})</div>`;
  if(!active.length) h+=`<div class="card" style="color:var(--muted2);font-size:12px">Нет заданий. Летите в другие системы или подождите нового дня.</div>`;
  active.forEach(q=>{
    const prog=q.progress||0,total=q.need?.amt||q.need?.count||1;
    h+=`<div class="quest-card${q.accepted?' active':''}">
      <div class="qc-type" style="color:${q.color}">${q.icon} ${q.type==='deliver'?'ДОСТАВКА':q.type==='kill'?'УНИЧТОЖЕНИЕ':'СБОР'}</div>
      <div class="qc-name">${q.title}</div>
      <div class="quest-giver">${q.giverIcon} ${q.giver}</div>
      ${q.contractType?`<div style="font-size:10px;color:var(--gold);margin-bottom:6px">Контракт: ${q.contractType==='military'?'военный':q.contractType==='science'?'научный':'гражданский'} · +влияние и честь</div>`:''}
      <div class="qc-desc">${q.desc}</div>
      ${q.accepted?`<div class="qc-prog">Прогресс: ${prog}/${total}</div>
        <div class="bar-tr" style="margin-bottom:8px"><div class="bar-f bf-xp" style="width:${Math.min(100,prog/total*100)}%"></div></div>`:''}
      <div class="qc-reward">🏆 ${fmt(q.reward)} кр · +${q.xp} XP · +${q.rp} НО · +${q.type==='deliver'?6:4} влияния</div>
      <div style="margin-top:8px;display:flex;gap:6px">
        ${!q.accepted?`<button class="btn btn-sm btn-c" onclick="acceptCollect('${q.id}')">Принять</button>`:''}
        ${q.accepted&&q.type==='kill'?`<button class="btn btn-sm btn-g" onclick="claimKillQuest('${q.id}')" ${prog>=total?'':'disabled'}>Сдать</button>`:''}
        ${q.expires?`<span style="font-size:9px;color:var(--muted2)">Истекает: День ${q.expires}</span>`:''}
      </div></div>`;
  });
  if(elsewhere.length){
    h+=`<div class="sh">Активные задания</div>`;
    elsewhere.forEach(q=>{
      const prog=q.progress||0,total=q.need?.amt||q.need?.count||1;
      h+=`<div class="quest-card active">
        <div class="qc-type" style="color:${q.color}">${q.icon} ${q.title}</div>
        <div class="qc-desc">${q.desc}</div>
        <div class="qc-prog">${prog}/${total}</div></div>`;
    });
  }
  document.getElementById('quest-scr').innerHTML=h;
  document.getElementById('q-cred').textContent=fmt(G.cr);
  document.getElementById('q-loc').textContent=sys.name;
  document.getElementById('q-time').textContent=timeStr();
  updateQuestBadge();
}

// ── More screen sub-tabs ──
let moreTab='combat';
let activeTechCat='weapons';
let marketCat='hull';
let chronicleFilter='all';

function uiStatusChip(text, tone='neutral'){
  const map={
    positive:'background:rgba(0,255,136,.1);border-color:rgba(0,255,136,.35);color:var(--green)',
    danger:'background:rgba(255,58,58,.1);border-color:rgba(255,58,58,.35);color:var(--red)',
    warning:'background:rgba(255,215,0,.1);border-color:rgba(255,215,0,.35);color:var(--gold)',
    info:'background:rgba(0,200,255,.1);border-color:rgba(0,200,255,.35);color:var(--cyan)',
    neutral:'background:rgba(255,255,255,.04);border-color:var(--b1);color:var(--muted2)'
  };
  const style=map[tone]||map.neutral;
  return `<span style="display:inline-flex;align-items:center;gap:4px;padding:4px 8px;border:1px solid transparent;border-radius:999px;font-size:9px;line-height:1.2;letter-spacing:.3px;${style}">${text}</span>`;
}

function openModuleShortcut(screen, tab=null){
  const navBtn=document.querySelector(screen==='more' ? '.nb:last-child' : screen==='trade' ? '.nb:nth-child(3)' : screen==='galaxy' ? '.nb:nth-child(2)' : '.nb:first-child');
  goTo(screen, navBtn||null);
  if(screen==='more' && tab){
    setTimeout(()=>setMoreTab(tab, null), 0);
  }
}

function setChronicleFilter(kind){ chronicleFilter=kind; renderMoreTab(); }


function setMoreTab(t,btn){
  document.querySelectorAll('.sc-more .tc-btn, .sc-more .mnb').forEach(b=>b.classList.remove('on'));
  btn?.classList.add('on'); moreTab=t;
  renderMoreTab();
}
function setTechCat(c,btn){
  document.querySelectorAll('.tech-cats .tc-btn').forEach(b=>b.classList.remove('on'));
  btn?.classList.add('on'); activeTechCat=c; renderMoreTab();
}
function setMarketCat(c,btn){
  document.querySelectorAll('.mc-btn').forEach(b=>b.classList.remove('on'));
  btn?.classList.add('on'); marketCat=c; renderMoreTab();
}

function renderMoreTab(){
  const scr=document.getElementById('more-scr');
  if(!scr) return;
  if(moreTab==='combat')      scr.innerHTML=renderCombatHTML();
  else if(moreTab==='hangar') scr.innerHTML=renderHangarHTML();
  else if(moreTab==='catalog')scr.innerHTML=renderCatalogHTML();
  else if(moreTab==='market') scr.innerHTML=renderEquipmentShopHTML();
  else if(moreTab==='tech')   scr.innerHTML=renderTechHTML();
  else if(moreTab==='skills') scr.innerHTML=renderSkillsHTML();
  else if(moreTab==='rangers')scr.innerHTML=renderRangersHTML();
  else if(moreTab==='debris') scr.innerHTML=renderDebrisHTML();
  else if(moreTab==='online') { renderOnlineRangers(); return; }
  else if(moreTab==='police') scr.innerHTML=renderPoliceHTML();
  else if(moreTab==='land')   scr.innerHTML=renderLandHTML();
  else if(moreTab==='events') scr.innerHTML=renderEventsHTML();
  else if(moreTab==='story')  scr.innerHTML=renderStoryHTML();
  else if(moreTab==='chronicle') scr.innerHTML=renderChronicleHTML();
  else if(moreTab==='guide') scr.innerHTML=renderGuideHTML();
  else if(moreTab==='diagnostics') scr.innerHTML=renderDiagnosticsHTML();
  document.getElementById('mo-cred').textContent=fmt(G.cr);
  document.getElementById('mo-rp').textContent=fmt(Math.floor(G.rp));
  document.getElementById('mo-hull').textContent=Math.floor(G.hull/G.maxHull*100)+'%';
  document.getElementById('mo-mis').textContent=G.missiles;
}

function renderChronicleHTML(){
  const entries=(G.historyLog||[]);
  const filtered=chronicleFilter==='all' ? entries : entries.filter(e=>e.kind===chronicleFilter);
  let h=`<div class="card" style="margin-bottom:10px"><div style="font-size:13px;font-weight:700">Журнал рейнджера</div><div style="font-size:11px;color:var(--muted2);margin-top:4px">Хроника ключевых действий: сделки, перелёты, лицензии, долги, база и сюжет. Это помогает тестировать проект и понимать картину прогресса.</div></div>`;
  h+=`<div class="g2" style="margin-bottom:8px"><div class="mstat"><div class="msv" style="color:var(--cyan)">${entries.length}</div><div class="msl">записей</div></div><div class="mstat"><div class="msv" style="color:var(--gold)">${fmt(G.tradeStats?.profit||0)}</div><div class="msl">рыночная прибыль</div></div></div>`;
  const filters=[['all','Все'],['trade','Рынок'],['travel','Перелёты'],['license','Лицензии'],['debt','Долги'],['base','База'],['story','Сюжет']];
  h+=`<div style="display:flex;gap:6px;overflow:auto;margin-bottom:10px">${filters.map(([id,label])=>`<button class="tc-btn ${chronicleFilter===id?'on':''}" onclick="setChronicleFilter('${id}')">${label}</button>`).join('')}</div>`;
  if(!entries.length){
    h+=`<div class="card" style="text-align:center;color:var(--muted2);padding:24px">История пока пуста. Совершите сделку, перелёт или покупку лицензии — и запись появится здесь.</div>`;
    return h;
  }
  if(entries.length && !filtered.length){
    h+=`<div class="card" style="text-align:center;color:var(--muted2);padding:20px">Для выбранного фильтра записей пока нет.</div>`;
    return h;
  }
  filtered.forEach(e=>{
    const time=`${String(e.day||1).padStart(2,'0')}.${String(e.month||1).padStart(2,'0')}.${e.year||2450} · ${String(e.hour||0).padStart(2,'0')}:${String(e.minute||0).padStart(2,'0')}`;
    const loc=[SYSTEMS.find(s=>s.id===e.system)?.name, GALAXIES.find(g=>g.id===e.galaxy)?.name].filter(Boolean).join(' · ');
    h+=`<div class="card" style="margin-bottom:6px"><div style="display:flex;gap:10px;align-items:flex-start"><div style="font-size:24px;line-height:1">${e.icon||'•'}</div><div style="flex:1"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div style="font-size:12px;font-weight:700">${e.title||'Событие'}</div><div style="font-size:9px;color:var(--muted2);text-align:right">${time}</div></div><div style="font-size:10px;color:var(--muted2);margin-top:4px">${e.details||'—'}</div><div style="font-size:9px;color:var(--cyan);margin-top:6px">${loc||'Локация не указана'}</div></div></div></div>`;
  });
  return h;
}

function renderGuideHTML(){
  G.guideSeen=true;
  const next=(typeof getRecommendedNextStep==='function') ? getRecommendedNextStep() : null;
  const milestones=(typeof getPlayerMilestones==='function') ? getPlayerMilestones() : [];
  const firstHour=[
    {label:'Сделать первую сделку', done:(G.tradeStats?.marketDeals||0)>=1},
    {label:'Купить технику или лицензии', done:(G.owned_equip||[]).length>0 || Object.keys(G.licenses||{}).length>0},
    {label:'Перелететь в другую систему', done:(entries=>entries.some(e=>e.kind==='travel'))(G.historyLog||[])},
    {label:'Начать развивать базу', done:(G.base?.level||0)>=1},
  ];
  const sections=[
    ['⛏️ Майнинг','База ранней игры: энергия, кредиты, помощники и базовые улучшения.'],
    ['🌌 Галактика','Выбор маршрутов между системами и планетами, источник риска и доступа к новым рынкам.'],
    ['🛸 Рынок','Товары, планетарные цены, аналитика, лицензии и прибыль с маршрутов.'],
    ['⚙️ Ещё','Ангар, каталог, техника, база, полиция, сюжет, журнал и справка.'],
    ['🧭 Карьера','Путь рейнджера меняет торговлю, боевой стиль, репутацию и активную способность.'],
    ['🏗️ База / земля','Пассивное производство, защита, доход и поздняя игра.'],
    ['🩺 Диагностика','Сводка по балансу, долгам, прибыли, рискам и целостности сборки. Используйте перед релизом и после апдейтов.']
  ];
  let h=`<div class="card" style="margin-bottom:10px"><div style="font-size:13px;font-weight:700">Гид по проекту</div><div style="font-size:11px;color:var(--muted2);margin-top:4px">Живая памятка по связям модулей. Этот экран нужно обновлять при полировке и новых этапах.</div></div>`;
  if(next){
    h+=`<div class="card glow-c" style="margin-bottom:10px"><div style="font-size:10px;color:var(--muted2);letter-spacing:1.6px;text-transform:uppercase">Следующий лучший шаг</div><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-top:6px"><div><div style="font-size:13px;font-weight:700">${next.icon||'🧭'} ${next.title}</div><div style="font-size:10px;color:var(--muted2);margin-top:4px">${next.desc||''}</div></div><button class="btn btn-sm btn-c" onclick="openModuleShortcut('${next.screen||'trade'}'${next.tab?`, '${next.tab}'`:''})">Открыть</button></div></div>`;
  }
  h+=`<div class="card" style="margin-bottom:10px"><div style="font-size:12px;font-weight:700">Первый час — быстрый маршрут</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${firstHour.map(s=>uiStatusChip(`${s.done?'✅':'•'} ${s.label}`, s.done?'positive':'neutral')).join('')}</div></div>`;
  sections.forEach(([title,desc])=>{ h+=`<div class="card" style="margin-bottom:6px"><div style="font-size:12px;font-weight:700">${title}</div><div style="font-size:10px;color:var(--muted2);margin-top:4px">${desc}</div></div>`; });
  if(milestones.length){
    h+=`<div class="card" style="margin-top:10px"><div style="font-size:12px;font-weight:700">Ключевые milestones игрока</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${milestones.map(m=>uiStatusChip(`${m.icon} ${m.text}`,'info')).join('')}</div></div>`;
  }
  h+=`<div class="card" style="margin-top:10px"><div style="font-size:12px;font-weight:700">Быстрый чек после обновлений</div><div style="font-size:10px;color:var(--muted2);margin-top:6px;line-height:1.6">1. Купить и продать товар. 2. Перелететь в другую систему. 3. Купить лицензию. 4. Улучшить базу или землю. 5. Активировать способность. 6. Проверить новые записи в журнале. 7. Открыть Диагностику и убедиться, что нет красных рисков.</div></div>`;
  return h;
}

function renderDiagnosticsHTML(){
  G.diagnosticsSeen=true;
  const snap=(typeof getEconomySnapshot==='function') ? getEconomySnapshot() : {riskFlags:[]};
  const warnings=(typeof getUrgentWarnings==='function') ? getUrgentWarnings() : [];
  const next=(typeof getRecommendedNextStep==='function') ? getRecommendedNextStep() : null;
  const bestDeal=(typeof getBestDealToday==='function') ? getBestDealToday() : null;
  let h=`<div class="card" style="margin-bottom:10px"><div style="font-size:13px;font-weight:700">Диагностика сборки</div><div style="font-size:11px;color:var(--muted2);margin-top:4px">Предрелизная сводка проекта: экономика, долги, вторжения, честь, влияние и ключевые риски. Этот экран помогает не потерять баланс после новых этапов.</div></div>`;
  if(warnings.length){
    h+=`<div class="card" style="margin-bottom:8px"><div style="font-size:12px;font-weight:700">Срочные сигналы</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${warnings.map(w=>uiStatusChip(`${w.icon||'•'} ${w.text}`, w.level==='high'?'danger':w.level==='medium'?'warning':'info')).join('')}</div></div>`;
  }
  if(next || bestDeal){
    h+=`<div class="g2" style="margin-bottom:8px">`;
    if(next){
      h+=`<div class="card glow-c"><div style="font-size:10px;color:var(--muted2);letter-spacing:1.4px;text-transform:uppercase">Рекомендация</div><div style="font-size:12px;font-weight:700;margin-top:6px">${next.icon||'🧭'} ${next.title}</div><div style="font-size:10px;color:var(--muted2);margin-top:4px">${next.desc||''}</div><button class="btn btn-sm btn-c" style="margin-top:10px" onclick="openModuleShortcut('${next.screen||'trade'}'${next.tab?`, '${next.tab}'`:''})">Перейти</button></div>`;
    }
    if(bestDeal){
      h+=`<div class="card glow-g"><div style="font-size:10px;color:var(--muted2);letter-spacing:1.4px;text-transform:uppercase">Сделка дня</div><div style="font-size:12px;font-weight:700;margin-top:6px">${bestDeal.item?.icon||'💱'} ${bestDeal.item?.name||bestDeal.gId}</div><div style="font-size:10px;color:var(--muted2);margin-top:4px">${bestDeal.fromPlanetLabel||currentTradePlanetLabel(SYSTEMS.find(s=>s.id===G.sys))} → ${bestDeal.toSysName||'—'} · ${bestDeal.toPlanetLabel||'—'}</div><div style="font-size:10px;color:var(--green);margin-top:6px">Чистая прибыль: ${fmt(bestDeal.net||0)} / ед.</div><button class="btn btn-sm btn-g" style="margin-top:10px" onclick="openModuleShortcut('trade')">Открыть рынок</button></div>`;
    }
    h+=`</div>`;
  }
  h+=`<div class="g2" style="margin-bottom:8px">
    <div class="mstat"><div class="msv" style="color:var(--gold)">${fmt(snap.netWorth||0)}</div><div class="msl">капитал</div></div>
    <div class="mstat"><div class="msv" style="color:var(--cyan)">${fmt(snap.cargoValue||0)}</div><div class="msl">стоимость груза</div></div>
    <div class="mstat"><div class="msv" style="color:var(--green)">${fmt(snap.profit||0)}</div><div class="msl">прибыль рынка</div></div>
    <div class="mstat"><div class="msv" style="color:var(--red)">${fmt(snap.loss||0)}</div><div class="msl">потери рынка</div></div>
  </div>`;
  h+=`<div class="g2" style="margin-bottom:8px">
    <div class="mstat"><div class="msv" style="color:var(--purple)">${snap.deals||0}</div><div class="msl">сделок</div></div>
    <div class="mstat"><div class="msv" style="color:var(--cyan)">${fmt(snap.avgMargin||0)}</div><div class="msl">ср. маржа / ед.</div></div>
    <div class="mstat"><div class="msv" style="color:${(snap.honor||0)>=0?'var(--green)':'var(--red)'}">${snap.honor||0}</div><div class="msl">честь</div></div>
    <div class="mstat"><div class="msv" style="color:${(snap.influence||0)>=0?'var(--gold)':'var(--red)'}">${snap.influence||0}</div><div class="msl">влияние</div></div>
  </div>`;
  h+=`<div class="card" style="margin-bottom:8px"><div style="font-size:12px;font-weight:700">Финансовая устойчивость</div><div style="font-size:10px;color:var(--muted2);margin-top:6px;line-height:1.6">Долг: <b style="color:${(snap.debt||0)>0?'var(--red)':'var(--green)'}">${fmt(snap.debt||0)} кр</b>${(snap.debt||0)>0?` · до платежа ${snap.dueIn} дн.`:''}<br>Пассивный доход базы/земли: <b style="color:var(--green)">${fmt(snap.baseIncome||0)} кр/цикл</b><br>Вторжение: <b style="color:${String(snap.invasion||'нет')==='нет'?'var(--green)':'var(--red)'}">${snap.invasion||'нет'}</b></div></div>`;
  h+=`<div class="card" style="margin-bottom:8px"><div style="font-size:12px;font-weight:700">Риски и рекомендации</div>`;
  if(!(snap.riskFlags||[]).length){
    h+=`<div style="font-size:10px;color:var(--green);margin-top:6px">Серьёзных рисков не найдено. Сборка выглядит устойчиво.</div>`;
  } else {
    (snap.riskFlags||[]).forEach(flag=>{
      h+=`<div style="font-size:10px;color:var(--red);margin-top:6px">• ${flag}</div>`;
    });
  }
  h+=`<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">
    <button class="btn btn-sm btn-c" onclick="openModuleShortcut('trade')">🛸 Рынок</button>
    <button class="btn btn-sm btn-c" onclick="openModuleShortcut('more','events')">👾 События</button>
    <button class="btn btn-sm btn-c" onclick="openModuleShortcut('more','rangers')">🧭 Карьера</button>
    <button class="btn btn-sm btn-c" onclick="openModuleShortcut('more','land')">🏗️ База</button>
    <button class="btn btn-sm btn-c" onclick="openModuleShortcut('more','chronicle')">📚 Хроника</button>
  </div>
  <div style="font-size:10px;color:var(--muted2);margin-top:10px;line-height:1.6">Рекомендуемый чек перед релизом: рынок → перелёт → контракт → лицензия → способность → вторжение → база → хроника.</div></div>`;
  return h;
}


// ── Combat HTML ──
function renderCombatHTML(){
  let h='';
  if(!G.combat){
    const sys=SYSTEMS.find(s=>s.id===G.sys);
    h+=`<div class="card" style="text-align:center;padding:20px">
      <div style="font-size:48px;margin-bottom:8px">🛸</div>
      <div style="font-size:13px;color:var(--muted2);margin-bottom:12px">
        <b style="color:var(--cyan)">${sys.name}</b> — пиратская активность: ${Math.round(sys.pc*100)}%
      </div>
      <button class="btn btn-r btn-full" onclick="findEnemy()">🔍 Искать противника</button>
      ${alienInvasion?`<button class="btn btn-full" style="background:rgba(255,45,120,.15);border-color:#ff2d78;color:#ff2d78;margin-top:8px" onclick="fightAlien()">👽 Атаковать вторженцев!</button>`:''}
    </div>`;
    h+=`<div class="sh">Статистика</div>
    <div class="g2">
      <div class="mstat"><div class="msv" style="color:var(--red)">${G.killCount}</div><div class="msl">Убито</div></div>
      <div class="mstat"><div class="msv" style="color:var(--purple)">${G.alienKills||0}</div><div class="msl">Пришельцев</div></div>
      <div class="mstat"><div class="msv" style="color:var(--gold)">${fmt(G.totalKillReward||0)}</div><div class="msl">Заработано</div></div>
      <div class="mstat"><div class="msv" style="color:var(--cyan)">${calcAttack()}</div><div class="msl">Атака</div></div>
    </div>`;
    h+=`<div class="sh">Бестиарий</div><div class="g3">`;
    [{id:'zorg',label:'🟢 ЗORG',col:'#00ff88'},{id:'technoid',label:'🔵 ТЕХНOИДЫ',col:'#00c8ff'},{id:'psi',label:'🟣 ПСИ',col:'#a855f7'}]
    .forEach(r=>{
      const k=(G.alienKillsByRace||{})[r.id]||0;
      h+=`<div class="card" style="border-color:${r.col}33;text-align:center;padding:10px 6px">
        <div style="font-size:11px;font-weight:700;color:${r.col}">${r.label}</div>
        <div style="font-family:var(--mono);font-size:20px;color:${r.col};margin-top:6px">${k}</div>
        <div style="font-size:9px;color:var(--muted2)">убито</div>
      </div>`;
    });
    h+=`</div>`;
    h+=`<div class="sh">Снаряжение</div>`;
    ['hull','engine','weapon','shield'].forEach(cat=>{
      const e=EQUIPMENT.find(x=>x.id===G.equip[cat]);if(!e) return;
      const tc=['','eq-t1','eq-t2','eq-t3','eq-t4','eq-t5'][e.tier];
      h+=`<div class="card" style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <span style="font-size:26px">${e.icon}</span>
        <div><div class="${tc}" style="font-size:9px;letter-spacing:1px;text-transform:uppercase">
          ${['','Обычный','Редкий','Необычный','Эпический','Легендарный'][e.tier]}</div>
        <div style="font-size:13px;font-weight:700">${e.name}</div>
        <div style="font-size:10px;color:var(--muted2)">${e.desc}</div></div></div>`;
    });
    return h;
  }
  const e=G.combat;
  const isAlien=!!e.isAlien;
  const enemyColor=isAlien?(e.color||'var(--red)'):'var(--red)';
  const raceLabels={zorg:'🟢 ЗORG',technoid:'🔵 ТЕХНOИД',psi:'🟣 ПСИ-РАЗУМ'};
  const logHTML=G.combatLog.slice(-8).map(l=>{
    const cls=l.startsWith('🔵')||l.startsWith('🚀')||l.startsWith('🔧')?'cl-p'
      :l.startsWith('🔴')||l.startsWith('🟣')||l.startsWith('🟢 ')||l.startsWith('💢')||l.startsWith('🧿')?'cl-e'
      :l.startsWith('🏆')||l.startsWith('🪞')||l.startsWith('💨')?'cl-g':'cl-s';
    return `<div class="${cls}">${l}</div>`;
  }).join('');
  h+=`<div class="combat-arena"${isAlien?` style="border-color:${enemyColor}44;box-shadow:0 0 30px ${enemyColor}11"`:''}>`;
  if(isAlien){
    h+=`<div style="text-align:center;font-size:10px;letter-spacing:2px;color:${enemyColor};margin-bottom:6px;text-transform:uppercase">
      ${raceLabels[e.race]||'👽 ВТОРЖЕНИЕ'}
    </div>
    <div style="background:rgba(0,0,0,.3);border:1px solid ${enemyColor}33;border-radius:8px;padding:6px 10px;font-size:10px;color:${enemyColor};margin-bottom:8px">
      ⚡ ${e.desc||'Особая способность'}
    </div>`;
  }
  h+=`<div class="fighters">
    <div class="fighter">
      <div class="f-icon">🚀</div>
      <div class="f-name">Ваш корабль</div>
      <div class="hp-track"><div class="hp-f hp-player" style="width:${G.hull/G.maxHull*100}%"></div></div>
      <div class="f-hp">${Math.floor(G.hull)}/${G.maxHull} ХП</div>
      <div class="hp-track" style="margin-top:3px"><div class="bar-f bf-en" style="width:${G.energy/G.maxEnergy*100}%;height:100%"></div></div>
      <div class="f-hp">⚡ ${Math.floor(G.energy)}/${G.maxEnergy}</div>
    </div>
    <div class="vs">VS</div>
    <div class="fighter">
      <div class="f-icon" style="font-size:${isAlien?44:38}px${isAlien?`;filter:drop-shadow(0 0 10px ${enemyColor}88)`:''}">
        ${e.icon}</div>
      <div class="f-name" style="${isAlien?`color:${enemyColor}`:''}">${e.name}</div>
      <div class="hp-track"><div class="hp-f" style="width:${e.hp/e.maxHp*100}%;
        background:linear-gradient(90deg,${isAlien?enemyColor:'var(--red)'},${isAlien?enemyColor+'aa':'var(--amber)'})"></div></div>
      <div class="f-hp">${e.hp}/${e.maxHp} ХП</div>
    </div>
  </div>
  <div class="combat-log">${logHTML}</div>
  <div class="combat-actions">
    <button class="ca ca-atk" onclick="combatAction('attack')">⚡ Атака<br><small>${calcAttack()}</small></button>
    <button class="ca ca-mis" onclick="combatAction('missile')" ${G.missiles>0?'':'disabled'}>🚀 Ракета (${G.missiles})<br><small>${calcMissileDmg()}</small></button>
    <button class="ca ca-rep" onclick="combatAction('repair')" ${G.cr>=200&&G.hull<G.maxHull?'':'disabled'}>🔧 Ремонт<br><small>-200 кр</small></button>
    <button class="ca ca-fle" onclick="combatAction('flee')">💨 Бежать<br><small>-25% топл.</small></button>
  </div></div>`;
  return h;
}

// ── Tech HTML ──
function renderTechHTML(){
  const cats={weapons:'⚔️ Оружие',shields:'🛡 Защита',engines:'🚀 Двигатели',mining:'⛏️ Добыча'};
  let h=`<div class="tech-cats">`;
  Object.entries(cats).forEach(([k,v])=>{
    h+=`<button class="tc-btn${k===activeTechCat?' on':''}" onclick="setTechCat('${k}',this)">${v}</button>`;
  });
  h+=`</div><div class="g2">`;
  (TECH[activeTechCat]||[]).forEach(t=>{
    const done=hasTech(t.id),reqOk=!t.req||hasTech(t.req),afford=G.cr>=t.cost&&G.rp>=t.rp;
    h+=`<div class="tech-card${done?' res':reqOk&&afford?' avail':''}" onclick="researchTech('${t.id}')">
      <div class="ti">${t.icon}</div><div class="tn">${t.name}</div>
      <div class="te">${t.eff}</div>
      ${done?`<div class="td">✅ Исследовано</div>`:!reqOk?`<div class="tl">🔒 Нужна предыдущая</div>`:
      `<div class="tc">💰${fmt(t.cost)} · 🔬${t.rp} НО</div>`}
    </div>`;
  });
  h+=`</div>`;return h;
}

// ── Skills HTML ──
function renderSkillsHTML(){
  let h=`<div class="card" style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center">
    <div><div style="font-size:13px;font-weight:700">Очки навыков</div>
    <div style="font-size:10px;color:var(--muted2)">+1 за каждый уровень</div></div>
    <div style="font-family:var(--mono);font-size:28px;color:var(--gold)">${G.skillPts||0}</div></div>`;
  SKILLS_DEF.forEach(s=>{
    const lvl=gSkill(s.id);
    h+=`<div class="skill-card">
      <div class="sk-icon">${s.icon}</div>
      <div class="sk-info">
        <div class="sk-name">${s.name}</div>
        <div class="sk-desc">${s.desc} · <span style="color:var(--green)">${s.perLvl}</span></div>
        <div class="sk-bar-tr"><div class="sk-bar-f" style="width:${lvl/20*100}%"></div></div>
        <div class="sk-lvl">Уровень ${lvl}/20</div>
      </div>
      <div class="sk-right">
        ${lvl<20?`<button class="btn btn-sm btn-gold" onclick="upgradeSkill('${s.id}')" ${G.skillPts>0?'':'disabled'}>+1</button>`:
          `<div style="color:var(--gold);font-size:10px">MAX</div>`}
      </div></div>`;
  });
  return h;
}

// ── Market HTML ──
function renderMarketHTML(){
  const cats=['hull','engine','weapon','shield'];
  const catN={hull:'🚀 Корпус',engine:'⚡ Двиг.',weapon:'🔫 Оружие',shield:'🛡 Щит'};
  let h=`<div style="display:flex;gap:5px;margin-bottom:10px;overflow-x:auto">`;
  cats.forEach(c=>{h+=`<button class="tc-btn mc-btn${c===marketCat?' on':''}" onclick="setMarketCat('${c}',this)">${catN[c]}</button>`;});
  h+=`</div><div class="g2">`;
  EQUIPMENT.filter(e=>e.cat===marketCat).forEach(eq=>{
    const owned=G.owned_equip.includes(eq.id)||eq.cost===0;
    const equipped=G.equip[eq.cat]===eq.id;
    const tc=['','eq-t1','eq-t2','eq-t3','eq-t4','eq-t5'][eq.tier];
    const tn=['','Обычный','Редкий','Необычный','Эпический','Легендарный'][eq.tier];
    h+=`<div class="equip-card${equipped?' equipped':''}">
      <div class="${tc}" style="font-size:9px;letter-spacing:1px;text-transform:uppercase;margin-bottom:2px">${tn}${equipped?' ✅':''}</div>
      <div style="font-size:26px;margin-bottom:4px">${eq.icon}</div>
      <div style="font-size:12px;font-weight:700;margin-bottom:4px">${eq.name}</div>
      <div style="font-size:9px;color:var(--muted2);margin-bottom:6px">${eq.desc}</div>
      ${equipped?`<div style="font-size:10px;color:var(--green)">Установлено</div>`:
        owned?`<button class="btn btn-sm btn-g btn-full" onclick="equipItem('${eq.id}')">Установить</button>`:
        `<button class="btn btn-sm btn-gold btn-full" onclick="buyEquip('${eq.id}')" ${G.cr>=eq.cost?'':'disabled'}>💰${fmt(eq.cost)}</button>`}
    </div>`;
  });
  h+=`</div>`;return h;
}

// ── Rangers HTML ──
function renderRangersHTML(){
  const rank=getRank();
  const career=(typeof getCareerProfile==='function') ? getCareerProfile() : {name:'Торговец',icon:'💱',desc:'—'};
  const careerLevel=(typeof getCareerLevel==='function') ? getCareerLevel() : 1;
  const ability=(typeof getCareerAbility==='function') ? getCareerAbility() : null;
  const cooldown=(typeof getCareerCooldownLeft==='function') ? getCareerCooldownLeft() : 0;
  const rankIcons={Новичок:'🌟',Скаут:'⭐',Рейнджер:'🏅',Ветеран:'🥇',Мастер:'🏆',Легенда:'👑',Призрак:'👻'};
  let h=`<div class="card" style="margin-bottom:10px;background:linear-gradient(135deg,var(--card2),var(--card3));border-color:var(--b2)">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:9px;letter-spacing:2px;color:var(--muted2);text-transform:uppercase">Звание рейнджера</div>
        <div style="font-family:var(--mono);font-size:22px;margin-top:4px" style="color:${rank.color}">${rank.name}</div>
        <div style="font-size:10px;color:var(--muted2);margin-top:2px">⚔️ ${G.killCount} убийств · Ур.${G.lvl}</div>
      </div>
      <div style="font-size:44px">${rankIcons[rank.name]||'🌟'}</div>
    </div>
    ${RANKS.filter(r=>G.killCount<r.minKills||G.lvl<r.minLvl).slice(0,1).map(r=>
      `<div style="margin-top:8px;font-size:10px;color:var(--muted2)">Следующее: <b style="color:var(--cyan)">${r.name}</b> (убийств: ${r.minKills}, уровень: ${r.minLvl})</div>`
    ).join('')}</div>`;
  h+=`<div class="card" style="margin-bottom:10px"><div style="font-size:13px;font-weight:700">Карьера и репутация</div>
    <div class="mini-grid" style="margin-top:10px">
      <div class="mini-stat"><div class="l">Путь</div><div class="v">${career.icon} ${career.name}</div></div>
      <div class="mini-stat"><div class="l">Уровень пути</div><div class="v">${careerLevel}</div></div>
      <div class="mini-stat"><div class="l">XP пути</div><div class="v">${G.careerXP||0}</div></div>
      <div class="mini-stat"><div class="l">Влияние</div><div class="v">${G.influence||0}</div></div>
      <div class="mini-stat"><div class="l">Честь</div><div class="v">${G.honor||0}</div></div>
      <div class="mini-stat"><div class="l">Контракты</div><div class="v">${G.tradeStats?.completedContracts||0}</div></div>
    </div>
    <div style="font-size:11px;color:var(--muted2);margin-top:8px">${career.desc||''}</div>
  </div>`;
  if(ability){
    h+=`<div class="card" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><div style="font-size:13px;font-weight:700">${ability.icon} Активная способность</div><div style="font-size:11px;color:var(--muted2);margin-top:4px"><b>${ability.name}</b> · ${ability.desc}</div>${cooldown>0?`<div style="font-size:10px;color:var(--gold);margin-top:6px">Перезарядка: ${cooldown} дн.</div>`:`<div style="font-size:10px;color:var(--green);margin-top:6px">Готова к использованию</div>`}</div><button class="btn btn-sm ${cooldown===0?'btn-g':'btn-c'}" onclick="useCareerAbility()" ${cooldown===0?'':'disabled'}>${ability.icon} Активировать</button></div></div>`;
  }
  h+=`<div class="card" style="margin-bottom:10px"><div style="font-size:13px;font-weight:700">Банк и страхование</div><div class="mini-grid" style="margin-top:10px"><div class="mini-stat"><div class="l">Долг</div><div class="v">${fmt(Math.ceil(G.debt||0))}</div></div><div class="mini-stat"><div class="l">Срок</div><div class="v">${G.debt>0?Math.max(0,(G.debtDueDay||0)-((typeof getAbsDay==='function')?getAbsDay():0))+' дн.':'—'}</div></div><div class="mini-stat"><div class="l">Банкротства</div><div class="v">${G.bankruptcies||0}</div></div></div><div style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-sm btn-c" onclick="takeLoan()" ${G.debt>0?'disabled':''}>🏦 Взять кредит</button><button class="btn btn-sm btn-g" onclick="repayDebt()" ${(G.debt||0)>0?'':'disabled'}>💸 Погасить долг</button></div></div>`;
  const paths=(typeof CAREER_PATHS!=='undefined') ? Object.values(CAREER_PATHS) : [];
  if(paths.length){
    h+=`<div class="sh">Выбор пути</div><div class="g2">`;
    paths.forEach(path=>{
      const active=G.career===path.id;
      h+=`<div class="card${active?' glow-g':''}"><div style="font-size:28px;text-align:center">${path.icon}</div><div style="font-size:13px;font-weight:700;text-align:center">${path.name}</div><div style="font-size:10px;color:var(--muted2);text-align:center;margin-top:6px">${path.desc}</div><div style="display:flex;justify-content:center;margin-top:10px">${active?`<span style="font-size:10px;color:var(--green)">Активно</span>`:`<button class="btn btn-sm btn-c" onclick="chooseCareer('${path.id}')">Выбрать</button>`}</div></div>`;
    });
    h+=`</div>`;
  }
  const licenses=(typeof MARKET_LICENSES!=='undefined') ? Object.values(MARKET_LICENSES) : [];
  if(licenses.length){
    h+=`<div class="sh">Лицензии</div>`;
    licenses.forEach(def=>{
      const owned=!!G.licenses?.[def.id];
      const check=(typeof canBuyLicense==='function') ? canBuyLicense(def.id) : {ok:false, reason:'Недоступно'};
      h+=`<div class="card" style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start"><div><div style="font-size:12px;font-weight:700">${def.icon} ${def.name}</div><div style="font-size:10px;color:var(--muted2);margin-top:4px">${def.desc}</div><div style="font-size:9px;color:var(--muted2);margin-top:4px">Требования: ур.${def.minLvl||1} · честь ${def.minHonor||0} · влияние ${def.minInfluence||0}</div></div><div style="text-align:right">${owned?`<div style="font-size:10px;color:var(--green)">Куплена</div>`:`<button class="btn btn-sm ${check.ok?'btn-g':''}" onclick="buyLicense('${def.id}')" ${check.ok?'':'disabled'}>Купить · ${fmt(def.cost||0)}</button><div style="font-size:9px;color:var(--muted2);margin-top:4px">${check.ok?'Доступно':(check.reason||'')}</div>`}</div></div></div>`;
    });
  }
  h+=`<div class="sh">Рейнджеры-боты</div>`;
  RANGER_BOTS.forEach(r=>{
    const owned=G.rangers[r.id]||0;
    const cost=Math.round(r.cost*Math.pow(r.costM,owned));
    const ok=G.cr>=cost;
    h+=`<div class="ranger-card">
      <div class="rg-icon">${r.icon}</div>
      <div class="rg-info">
        <div class="rg-name">${r.name}</div>
        <div class="rg-action">${r.desc}</div>
        <button class="btn btn-sm${ok?' btn-p':''}" style="margin-top:6px" ${ok?'':'disabled'} onclick="buyRanger('${r.id}')">Нанять · 💰${fmt(cost)}</button>
      </div>
      <div class="rg-owned">${owned}</div></div>`;
  });
  if(G.botActions.length){
    h+=`<div class="sh">Отчёты ботов</div>
    <div class="card"><div style="font-family:var(--mono);font-size:10px;line-height:1.8;color:var(--muted2)">
      ${G.botActions.slice(0,8).join('<br>')}
    </div></div>`;
  }
  return h;
}

// ── Debris HTML ──
function renderDebrisHTML(){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  const now=Date.now();
  let h=`<div class="card" style="margin-bottom:10px;font-size:11px;color:var(--muted2)">
    Обломки в <b style="color:var(--cyan)">${sys.name}</b>. Обновляются каждые 24 игровых часа.
  </div>`;
  const local=G.debrisActive.filter(d=>!d.collected);
  if(!local.length){
    h+=`<div class="card" style="text-align:center;padding:20px;color:var(--muted2)">
      <div style="font-size:40px;margin-bottom:8px">🌌</div>
      Нет обломков.
      <br><button class="btn btn-sm btn-c" style="margin-top:10px" onclick="spawnDebris();renderMoreTab()">🔍 Сканировать</button>
    </div>`;
    return h;
  }
  local.forEach(db=>{
    const dt=DEBRIS_TYPES.find(d=>d.id===db.typeId);if(!dt) return;
    const ready=now>=db.endTime;
    const progress=Math.min(1,(now-(db.endTime-dt.time*1000))/(dt.time*1000));
    const inSys=db.sysId===G.sys;
    const sysDet=SYSTEMS.find(s=>s.id===db.sysId);
    h+=`<div class="debris-card${ready&&inSys?' glow-g':''}" onclick="collectDebris('${db.id}')">
      <div class="db-icon">${dt.icon}</div>
      <div class="db-info">
        <div class="db-name">${dt.name}</div>
        <div class="db-desc">${sysDet?.name||'?'}</div>
        <div class="db-reward">📦 ${Object.entries(dt.reward).map(([k,v])=>`${GOODS[k]?.icon||k}×${v}`).join(' ')} · +${dt.rp} НО</div>
        ${ready&&inSys?`<div style="font-size:11px;color:var(--green);margin-top:3px">✅ Готово!</div>`:
          !inSys?`<div style="font-size:10px;color:var(--muted);margin-top:3px">→ ${sysDet?.name}</div>`:
          `<div class="db-time">${Math.ceil((db.endTime-now)/1000)}с</div>`}
        <div class="db-bar"><div class="db-bar-f" style="width:${Math.min(100,progress*100)}%"></div></div>
      </div></div>`;
  });
  return h;
}

// ── Police HTML ──
function renderPoliceHTML(){
  let h=`<div class="sh">Репутация в галактиках</div>`;
  Object.entries(POLICE_FACTIONS).forEach(([galId,pol])=>{
    const rep=getPoliceRep(galId);
    const repColor=rep>30?'var(--green)':rep>0?'var(--cyan)':rep>-30?'var(--gold)':'var(--red)';
    const repLabel=rep>50?'Герой':rep>20?'Союзник':rep>0?'Нейтральный':rep>-30?'Подозреваемый':rep>-60?'Разыскивается':'Враг';
    const pct=(rep+100)/200*100;
    h+=`<div class="card" style="border-color:${pol.color}22;margin-bottom:8px">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:11px;color:${pol.color};letter-spacing:1px;text-transform:uppercase">${pol.icon} ${pol.name}</div>
          <div style="font-family:var(--mono);font-size:18px;color:${repColor};margin-top:3px">${repLabel}</div>
          <div style="font-size:10px;color:var(--muted2);margin-top:2px">Штраф: ${fmt(pol.fine)} · Сила: ${pol.power}</div>
        </div>
        <div style="text-align:right">
          <div style="font-family:var(--mono);font-size:24px;color:${repColor}">${rep}</div>
          <button class="btn btn-sm" style="margin-top:6px;border-color:var(--b2);color:var(--cyan);font-size:9px" onclick="bribePolice('${galId}')">💰 Взятка</button>
        </div>
      </div>
      <div style="margin-top:8px;height:3px;background:var(--b1);border-radius:2px">
        <div style="height:100%;border-radius:2px;width:${pct}%;background:linear-gradient(90deg,var(--red),var(--gold),var(--green));opacity:.7"></div>
      </div>
    </div>`;
  });
  // Refuel button
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  const canRefuel=sys&&['trade','paradise','home'].includes(sys.type);
  const fuelNeeded=Math.max(0,G.maxFuel-G.fuel);
  const fuelPrice=canRefuel?Math.round((G.prices[G.sys]?.fuel||80)*0.6):0;
  const refuelCost=canRefuel?Math.round(fuelPrice*fuelNeeded/10):0;
  h+=`<div class="sh">⛽ Дозаправка</div>
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:13px;font-weight:700">Топливный склад</div>
        <div style="font-size:10px;color:var(--muted2)">Топливо: ${Math.floor(G.fuel)}/${G.maxFuel}</div>
        ${canRefuel?`<div style="font-size:10px;color:var(--cyan)">Цена: ${fmt(refuelCost)} кр (${fmt(fuelNeeded)} ед.)</div>`:
          `<div style="font-size:10px;color:var(--red)">Заправка только в торговых, райских и домашних системах</div>`}
      </div>
      <button class="btn btn-sm btn-c" onclick="refuel()" ${canRefuel&&fuelNeeded>0?'':'disabled'}>
        ⛽ Заправить
      </button>
    </div>
  </div>`;
  h+=`<div style="font-size:10px;color:var(--muted2);padding:8px">
    +2 репутации за пирата · +5 за задание · +20 за пришельца<br>
    -30 за захват системы · Взятка: +25 репутации
  </div>`;
  return h;
}



function renderEventsHTML(){
  const events=(typeof RANDOM_EVENTS!=='undefined' && Array.isArray(RANDOM_EVENTS)) ? RANDOM_EVENTS : [];
  const anomalies=(typeof ANOMALIES!=='undefined' && Array.isArray(ANOMALIES)) ? ANOMALIES : [];
  let h=`<div class="card" style="margin-bottom:10px"><div style="font-size:13px;font-weight:700">События и аномалии</div><div style="font-size:11px;color:var(--muted2);margin-top:4px">Справочный экран: здесь видно, какие случайные события и аномалии уже определены в игре.</div></div>`;
  if(G.alienInvasion){
    const sys=SYSTEMS.find(s=>s.id===G.alienInvasion.sysId);
    h+=`<div class="card glow-p" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;gap:10px"><div><div style="font-size:13px;font-weight:700">${G.alienInvasion.raceIcon||'👾'} Вторжение: ${G.alienInvasion.raceName}</div><div style="font-size:11px;color:var(--muted2);margin-top:4px">Система: <b style="color:var(--cyan)">${sys?.name||G.alienInvasion.sysId}</b> · Волна ${G.alienInvasion.wave||1}/${G.alienInvasion.maxWave||3} · Сила ${G.alienInvasion.strength||1}</div></div><button class="btn btn-sm btn-r" onclick="resolveAlienInvasion()">Отбить волну</button></div></div>`;
  }
  h+=`<div class="sh">Случайные события (${events.length})</div>`;
  events.forEach(ev=>{ h+=`<div class="card" style="margin-bottom:6px"><div style="font-size:12px;font-weight:700">${ev.icon||'✨'} ${ev.name}</div><div style="font-size:10px;color:var(--muted2);margin-top:4px">${ev.desc||''}</div></div>`; });
  h+=`<div class="sh">Аномалии (${anomalies.length})</div>`;
  anomalies.forEach(an=>{ h+=`<div class="card" style="margin-bottom:6px"><div style="font-size:12px;font-weight:700">${an.icon||'🌀'} ${an.name}</div><div style="font-size:10px;color:var(--muted2);margin-top:4px">${an.desc||''}</div></div>`; });
  return h;
}

function renderHangarHTML(){
  const equippedSections=['hull','weapon','defense','engine'];
  let h=`<div class="card" style="margin-bottom:10px"><div style="font-size:13px;font-weight:700">Ангар</div><div style="font-size:11px;color:var(--muted2);margin-top:4px">Здесь устанавливается уже купленная техника. Магазин и каталог не ставят модули автоматически.</div></div>`;
  h+=`<div class="g2">`;
  equippedSections.forEach(sec=>{
    const currentId=(sec==='defense' ? (G.equip?.defense||G.equip?.shield) : G.equip?.[sec]);
    const item=(EQUIPMENT||[]).find(e=>e.id===currentId);
    h+=`<div class="card glow-c"><div style="font-size:10px;color:var(--muted2);text-transform:uppercase">${EQUIP_SECTION_META[sec].label}</div>`+
      (item?`<div style="display:flex;align-items:center;gap:10px;margin-top:8px"><div style="font-size:28px">${item.icon||'🧩'}</div><div><div style="font-size:13px;font-weight:700">${item.name}</div><div style="font-size:10px;color:${equipRarityColor(item)}">${item.rarity||'common'} · ${equipTierLabel(item)}</div><div style="font-size:10px;color:var(--muted2)">${equipManufacturerLine(item)}</div></div></div>`:`<div style="font-size:11px;color:var(--muted2);margin-top:8px">Слот пуст</div>`)
      +`</div>`;
  });
  h+=`</div>`;
  Object.keys(EQUIP_SECTION_META).forEach(sec=>{
    const items=(EQUIPMENT||[]).filter(it=>normalizeEquipSection(it)===sec && isOwnedEquip(it.id));
    if(!items.length) return;
    h+=`<div class="sh">${EQUIP_SECTION_META[sec].label}</div>`;
    items.sort((a,b)=>(a.tier||0)-(b.tier||0)||String(a.name).localeCompare(String(b.name),'ru')).forEach(item=>{
      const equipped=Object.values(G.equip||{}).includes(item.id);
      h+=`<div class="card${equipped?' glow-g':''}" style="margin-bottom:6px"><div style="display:flex;align-items:center;gap:10px"><div style="font-size:28px">${item.icon||'🧩'}</div><div style="flex:1"><div style="font-size:13px;font-weight:700">${item.name}</div><div style="font-size:10px;color:${equipRarityColor(item)}">${item.rarity||'common'} · ${equipTierLabel(item)}</div><div style="font-size:10px;color:var(--muted2)">${equipManufacturerLine(item)}</div></div><div style="display:flex;flex-direction:column;gap:5px">${equipped?`<span style="font-size:10px;color:var(--green)">Установлено</span>`:`<button class="btn btn-sm btn-c" onclick="equipItem('${item.id}')">Надеть</button>`}</div></div></div>`;
    });
  });
  return h;
}

function renderCatalogHTML(){
  const sections=['hull','weapon','defense','engine','specmod','support'];
  let h=`<div class="card" style="margin-bottom:10px"><div style="font-size:13px;font-weight:700">Каталог техники</div><div style="font-size:11px;color:var(--muted2);margin-top:4px">Полный список техники по категориям. Здесь можно купить модуль, но установка производится только через Ангар.</div></div>`;
  h+=`<div class="tech-cats">`;
  sections.forEach(sec=>{ h+=`<button class="tc-btn${marketCat===sec?' on':''}" onclick="setMarketCat('${sec}',this)">${EQUIP_SECTION_META[sec].label}</button>`; });
  h+=`</div>`;
  const items=(EQUIPMENT||[]).filter(it=>normalizeEquipSection(it)===marketCat).sort((a,b)=>(a.tier||0)-(b.tier||0)||String(a.name).localeCompare(String(b.name),'ru'));
  h+=`<div class="g2">`;
  items.forEach(item=>{
    const owned=isOwnedEquip(item.id);
    const unlocked=(typeof getEquipUnlocked==='function') ? getEquipUnlocked(item, G) : true;
    const lockReason=(typeof getEquipLockReason==='function' && !unlocked) ? getEquipLockReason(item, G) : '';
    h+=`<div class="card${owned?' glow-g':''}" style="padding:12px"><div style="font-size:34px;text-align:center">${item.icon||'🧩'}</div><div style="font-size:13px;font-weight:700;text-align:center">${item.name}</div><div style="font-size:10px;text-align:center;color:${equipRarityColor(item)}">${item.rarity||'common'} · ${equipTierLabel(item)}</div><div style="font-size:10px;color:var(--muted2);text-align:center;margin-top:3px">${equipManufacturerLine(item)}</div><div style="font-size:10px;color:var(--muted2);text-align:center;margin-top:5px">${item.desc||item.role||'Без описания'}</div><div style="display:flex;justify-content:center;margin-top:8px">${owned?`<span style="font-size:10px;color:var(--green)">✅ Куплено</span>`:!unlocked?`<span style="font-size:10px;color:var(--gold)">🔒 ${lockReason||'Закрыто'}</span>`:`<button class="btn btn-sm btn-g" onclick="buyEquip('${item.id}')" ${G.cr>=(item.cost||0)?'':'disabled'}>Купить · ${fmt(item.cost||0)}</button>`}</div></div>`;
  });
  h+=`</div>`;
  return h;
}

function renderEquipmentShopHTML(){
  let h=`<div class="card" style="margin-bottom:10px"><div style="font-size:13px;font-weight:700">Магазин техники</div><div style="font-size:11px;color:var(--muted2);margin-top:4px">Короткая витрина техники. Покупка здесь не устанавливает модуль автоматически — после покупки зайдите в Ангар.</div></div>`;
  h+=renderCatalogHTML();
  return h;
}

// ── Land Plots ──
function renderLandHTML(){
  let h=`<div class="sh">🌱 Земельные участки</div>`;
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  const plot=G.landPlots[G.sys];
  const level=plot?plot.level:0;
  const costs=[50000,200000,500000,1500000,5000000];
  const goods=sys.goods||[];
  h+=`<div class="card">
    <div style="font-size:13px;font-weight:700;margin-bottom:6px">📍 ${sys.name}</div>
    <div style="font-size:10px;color:var(--muted2);margin-bottom:8px">
      Участки производят товары каждый игровой день и дают пассивный доход (+${(level||0)*5}/сек CPS)
    </div>`;
  if(level>0){
    h+=`<div style="display:flex;gap:4px;margin-bottom:8px">
      ${Array(5).fill(0).map((_,i)=>`<span style="width:16px;height:16px;border-radius:50%;display:inline-block;
        background:${i<level?'var(--green)':'rgba(255,255,255,.08)'};border:1px solid ${i<level?'var(--green)':'var(--b2)'}"></span>`).join('')}
      <span style="font-size:11px;color:var(--green);margin-left:6px">Уровень ${level}/5</span>
    </div>
    <div style="font-size:10px;color:var(--cyan);margin-bottom:8px">
      Производит: ${plot.good?marketName(plot.good):'?'} — ${level*2}/день · +${level*5}/сек
    </div>`;
  }
  if(level<5){
    const cost=costs[level];
    h+=`<div style="margin-bottom:8px">
      ${goods.map(gId=>`<button class="btn btn-sm ${G.cr>=cost?'btn-g':''}" style="margin-right:4px;margin-bottom:4px"
        onclick="buyLandPlot('${G.sys}','${gId}')" ${G.cr>=cost?'':'disabled'}>
        ${marketIcon(gId)} ${marketName(gId)}
      </button>`).join('')}
    </div>
    <div style="font-size:10px;color:var(--gold)">💰 Цена ур.${level+1}: ${fmt(cost)} кр</div>`;
  } else {
    h+=`<div style="font-size:11px;color:var(--green)">✅ Максимальный уровень!</div>`;
  }
  h+=`</div>`;
  // Show all plots
  const allPlots=Object.entries(G.landPlots||{}).filter(([,p])=>p&&p.level>0);
  if(allPlots.length){
    h+=`<div class="sh">Все участки (${allPlots.length})</div>`;
    allPlots.forEach(([sysId,p])=>{
      const s=SYSTEMS.find(x=>x.id===sysId);
      h+=`<div class="card" style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <div style="font-size:12px;font-weight:700">${s?.emoji} ${s?.name}</div>
          <div style="font-size:10px;color:var(--muted2)">${marketIcon(p.good)} ${marketName(p.good)} · Ур.${p.level} · +${p.level*2}/день</div>
        </div>
        <div style="font-family:var(--mono);font-size:14px;color:var(--green)">+${p.level*5}/сек</div>
      </div>`;
    });
  }
  h+=`<div class="sh">🏗️ База рейнджера</div><div class="card" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><div style="font-size:13px;font-weight:700">Уровень базы: ${G.base?.level||0}</div><div style="font-size:11px;color:var(--muted2);margin-top:4px">База даёт пассивный доход, науку, защиту от вторжений и дополнительное место для грузов.</div></div><div style="font-family:var(--mono);font-size:20px;color:var(--cyan)">${fmt(calcCPS())}/с</div></div></div>`;
  const upgrades=(typeof BASE_UPGRADES!=='undefined')?Object.values(BASE_UPGRADES):[];
  upgrades.forEach(def=>{
    const lvl=(typeof getBaseModuleLevel==='function')?getBaseModuleLevel(def.id):(G.base?.modules?.[def.id]||0);
    const maxed=lvl>=(def.maxLevel||5);
    const cost=(typeof getBaseUpgradeCost==='function')?getBaseUpgradeCost(def.id):(def.cost||0);
    h+=`<div class="card" style="margin-bottom:6px"><div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px"><div><div style="font-size:12px;font-weight:700">${def.icon} ${def.name}</div><div style="font-size:10px;color:var(--muted2);margin-top:4px">${def.desc}</div><div style="font-size:10px;color:var(--cyan);margin-top:4px">Уровень ${lvl}/${def.maxLevel||5}</div></div><div>${maxed?`<span style="font-size:10px;color:var(--green)">Макс</span>`:`<button class="btn btn-sm btn-c" onclick="buyBaseUpgrade('${def.id}')" ${G.cr>=cost?'':'disabled'}>⬆️ ${fmt(cost)}</button>`}</div></div></div>`;
  });
  return h;
}

function renderStoryHTML(){
  const missions=(typeof STORY_MISSIONS!=='undefined') ? STORY_MISSIONS : [];
  let h=`<div class="card" style="margin-bottom:10px"><div style="font-size:13px;font-weight:700">Сюжетные цепочки</div><div style="font-size:11px;color:var(--muted2);margin-top:4px">Короткие цели, которые знакомят с рынком, лицензиями, вторжениями и базой.</div></div>`;
  missions.forEach(m=>{
    const progress=(typeof getStoryMetric==='function')?getStoryMetric(m):0;
    const claimed=!!(G.storyProgress?.[m.id]?.claimed);
    const ready=(typeof canClaimStoryMission==='function')?canClaimStoryMission(m.id):false;
    h+=`<div class="card" style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;gap:10px"><div><div style="font-size:13px;font-weight:700">${m.icon} ${m.title}</div><div style="font-size:10px;color:var(--muted2);margin-top:4px">${m.desc}</div><div style="font-size:10px;color:var(--cyan);margin-top:6px">Прогресс: ${progress}/${m.target||1}</div><div style="font-size:10px;color:var(--gold);margin-top:4px">Награда: ${m.reward?.cr?fmt(m.reward.cr)+' кр ':''}${m.reward?.rp?`· ${m.reward.rp} НО `:''}${m.reward?.influence?`· +${m.reward.influence} влияние`:''}${m.reward?.honor?` · +${m.reward.honor} честь`:''}</div></div><div>${claimed?`<span style="font-size:10px;color:var(--green)">Получено</span>`:ready?`<button class="btn btn-sm btn-g" onclick="claimStoryMission('${m.id}')">Забрать</button>`:`<span style="font-size:10px;color:var(--muted2)">В пути</span>`}</div></div></div>`;
  });
  return h;
}

// ── Trade actions ──
function _updateCargoCost(gId, price, qty){
  // weighted average cost tracking
  if(!G.cargoCost) G.cargoCost={};
  const have=G.cargo[gId]||0;
  const avgOld=G.cargoCost[gId]||price;
  G.cargoCost[gId]=Math.round((avgOld*have+price*qty)/(have+qty));
}
function buyGood(gId){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  const pIdx=currentTradePlanetIdx(sys);
  const item=marketItem(gId);
  if(item?.licenseRequired && typeof hasLicense==='function' && !hasLicense(item.licenseRequired)){
    toast(`🔒 Нужна лицензия: ${typeof getLicenseReason==='function'?getLicenseReason(item):item.licenseRequired}`,'warn');
    return;
  }
  const realP=typeof getPlanetBuyPrice==='function' ? getPlanetBuyPrice(sys.id, pIdx, gId) : (G.prices[sys.id]?.[gId]||0);
  if(!realP){toast('Нет товара','bad');return;}
  if(G.cr<realP){toast('💸 Мало кредитов','bad');return;}
  G.cargoMax=calcCargoMax();
  if(calcCargoUsed()>=G.cargoMax){toast('📦 Трюм полон!','bad');return;}
  _updateCargoCost(gId,realP,1);
  G.cr-=realP; G.cargo[gId]=(G.cargo[gId]||0)+1;
  if(typeof getPlanetMarketState==='function'){ const st=getPlanetMarketState(sys.id,pIdx,gId); st.demand=Math.max(0.7,st.demand-0.02); st.supply=Math.max(0.7,st.supply-0.04); if(typeof updatePlanetPrice==='function') updatePlanetPrice(sys.id,pIdx,gId); }
  G.tradeStats.marketDeals=(G.tradeStats.marketDeals||0)+1;
  if(typeof pushHistory==='function') pushHistory('trade','Покупка товара',`${marketName(gId)} · 1 ед. · ${fmt(realP)} кр · ${sys.name}`);
  haptic('light');renderTrade();updateHUD();
}
function buyGoodMax(gId){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  const pIdx=currentTradePlanetIdx(sys);
  const item=marketItem(gId);
  if(item?.licenseRequired && typeof hasLicense==='function' && !hasLicense(item.licenseRequired)){
    toast(`🔒 Нужна лицензия: ${typeof getLicenseReason==='function'?getLicenseReason(item):item.licenseRequired}`,'warn');
    return;
  }
  const realP=typeof getPlanetBuyPrice==='function' ? getPlanetBuyPrice(sys.id, pIdx, gId) : (G.prices[sys.id]?.[gId]||0); if(!realP) return;
  let bought=0;G.cargoMax=calcCargoMax();
  while(G.cr>=realP&&calcCargoUsed()<G.cargoMax){
    _updateCargoCost(gId,realP,1);
    G.cr-=realP;G.cargo[gId]=(G.cargo[gId]||0)+1;bought++;
  }
  if(bought && typeof getPlanetMarketState==='function'){ const st=getPlanetMarketState(sys.id,pIdx,gId); st.demand=Math.max(0.7,st.demand-0.02*bought); st.supply=Math.max(0.7,st.supply-0.04*bought); if(typeof updatePlanetPrice==='function') updatePlanetPrice(sys.id,pIdx,gId); }
  if(bought) {
    G.tradeStats.marketDeals=(G.tradeStats.marketDeals||0)+1;
    if(typeof pushHistory==='function') pushHistory('trade','Крупная закупка',`${marketName(gId)} · ${bought} ед. · ${fmt(realP*bought)} кр · ${sys.name}`);
    toast(`📦 ×${bought}`,'good');
  }
  haptic('medium');renderTrade();updateHUD();
}
function sellGood(gId,amt){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  const pIdx=currentTradePlanetIdx(sys);
  const price=typeof getPlanetSalePrice==='function' ? getPlanetSalePrice(sys.id, pIdx, gId) : (G.prices[sys.id]?.[gId]||0);if(!price){toast('Нет спроса','bad');return;}
  const toSell=Math.min(amt,G.cargo[gId]||0);if(!toSell) return;
  const earn=Math.round(price*toSell);
  const avgCost=(G.cargoCost?.[gId]||0)*toSell;
  const profit=earn-avgCost;
  const item=marketItem(gId);
  const betterRoute=typeof getBestTradeOpportunity==='function' ? getBestTradeOpportunity(gId, sys.id, pIdx, 'cargo') : null;
  G.cr+=earn;G.totalCr+=earn;
  G.cargo[gId]=(G.cargo[gId]||0)-toSell;
  if(typeof getPlanetMarketState==='function'){ const st=getPlanetMarketState(sys.id,pIdx,gId); st.demand=Math.min(1.45,st.demand+0.05*toSell); st.supply=Math.min(1.45,st.supply+0.03*toSell); if(typeof updatePlanetPrice==='function') updatePlanetPrice(sys.id,pIdx,gId); }
  if((G.cargo[gId]||0)<=0) { delete G.cargo[gId]; if(G.cargoCost) delete G.cargoCost[gId]; }
  if(typeof addTradeReputation==='function') addTradeReputation(profit, item, toSell);
  // deliver quest: selling goods at destination completes it
  G.quests.forEach(q=>{
    if(!q.done&&q.accepted&&q.type==='deliver'&&q.need.good===gId&&q.need.destSys===G.sys){
      q.progress=(q.progress||0)+toSell;
      if(q.progress>=q.need.amt) completeQuest(q);
    }
  });
  const profitStr=avgCost>0?(profit>=0?` (+${fmt(profit)})`:(` (${fmt(profit)})`)): '';
  if(typeof pushHistory==='function') pushHistory('sale','Продажа товара',`${marketName(gId)} · ${toSell} ед. · ${fmt(earn)} кр${profitStr}`);
  toast(`💰 +${fmt(earn)} кр${profitStr}`,'good');
  if(profit<0){
    const bestMsg=betterRoute && betterRoute.net>profit ? ` Лучше продать на ${SYSTEMS.find(s=>s.id===betterRoute.toSysId)?.name}: ${fmt(betterRoute.net)} кр/ед.` : '';
    toast(`⚠️ Продажа в убыток.${bestMsg}`,'warn');
  }
  haptic('medium');renderTrade();updateHUD();
}

function chooseCareer(id){
  if(!CAREER_PATHS?.[id]) return;
  G.career=id;
  if(typeof pushHistory==='function') pushHistory('career','Смена карьерного пути',CAREER_PATHS[id].name);
  toast(`🧭 Путь изменён: ${CAREER_PATHS[id].name}`,'good');
  renderMoreTab(); if(curScreen==='trade') renderTrade(); updateHUD();
}

function buyLicense(id){
  const check=typeof canBuyLicense==='function' ? canBuyLicense(id) : {ok:false, reason:'Недоступно'};
  if(!check.ok){ toast(check.reason||'Недоступно','bad'); return; }
  const def=(typeof getLicenseDef==='function') ? getLicenseDef(id) : MARKET_LICENSES?.[id];
  if(!def) return;
  G.cr-=def.cost||0;
  if(!G.licenses) G.licenses={};
  G.licenses[id]={ boughtDay:G.day, boughtYear:G.year, price:def.cost||0 };
  addInfluence?.(2);
  addHonor?.(1);
  if(typeof pushHistory==='function') pushHistory('license','Покупка лицензии',`${def.name} · ${fmt(def.cost||0)} кр`);
  toast(`📜 Лицензия куплена: ${def.name}`,'good');
  renderMoreTab(); if(curScreen==='trade') renderTrade(); updateHUD();
}

// ── Tech/Skills/Market/Rangers ──
function researchTech(id){
  const t=Object.values(TECH).flat().find(x=>x.id===id);
  if(!t||hasTech(id)) return;
  if(t.req&&!hasTech(t.req)){toast('🔒 Нужна предыдущая','bad');return;}
  if(G.cr<t.cost){toast('💸 Мало кредитов','bad');return;}
  if(G.rp<t.rp){toast('🔬 Мало НО','bad');return;}
  G.cr-=t.cost;G.rp-=t.rp;G.researched[id]=true;
  G.maxHull=calcMaxHull();
  toast(`🔬 ${t.name} исследовано!`,'good');hapticN('success');
  renderMoreTab();updateHUD();
}
function upgradeSkill(id){
  if((G.skillPts||0)<=0){toast('Нет очков навыков','bad');return;}
  if(gSkill(id)>=20){toast('Максимум','warn');return;}
  G.skillPts--;G.skills[id]=(G.skills[id]||0)+1;
  toast(`${SKILLS_DEF.find(s=>s.id===id).name} → ${gSkill(id)}`,'good');
  haptic('medium');renderMoreTab();
}
function buyEquip(id){
  const eq=EQUIPMENT.find(e=>e.id===id);if(!eq) return;
  if(isOwnedEquip(id)){toast('Уже есть','warn');return;}
  if(G.cr<eq.cost){toast('💸 Мало кредитов','bad');return;}
  G.cr-=eq.cost;G.owned_equip.push(id);
  toast(`🛒 ${eq.name}`,'good');hapticN('success');renderMoreTab();updateHUD();
}
function equipItem(id){
  const eq=EQUIPMENT.find(e=>e.id===id);if(!eq) return;
  if(!isOwnedEquip(id)){toast('Сначала купите модуль в Каталоге или Магазине','warn');return;}
  const section=normalizeEquipSection(eq);
  if(section==='hull') G.equip.hull=id;
  else if(section==='weapon') G.equip.weapon=id;
  else if(section==='engine') G.equip.engine=id;
  else if(section==='defense') G.equip.shield=id;
  else { toast('Этот тип модулей будет подключён на следующем этапе','warn'); return; }
  G.maxHull=calcMaxHull();
  if(G.hull>G.maxHull) G.hull=G.maxHull;
  toast(`✅ ${eq.name} установлено`,'good');haptic('medium');renderMoreTab();updateHUD();
}
function buyRanger(id){
  const r=RANGER_BOTS.find(x=>x.id===id);
  const owned=G.rangers[id]||0;
  const cost=Math.round(r.cost*Math.pow(r.costM,owned));
  if(G.cr<cost){toast('💸 Мало кредитов','bad');return;}
  G.cr-=cost;G.rangers[id]=(G.rangers[id]||0)+1;
  toast(`🤖 ${r.name} нанят`,'good');hapticN('success');renderMoreTab();updateHUD();
}
function bribePolice(gal){
  const pol=POLICE_FACTIONS[gal];
  const cost=Math.abs(getPoliceRep(gal))*50+500;
  if(G.cr<cost){toast(`💸 Нужно ${fmt(cost)} кр`,'bad');return;}
  G.cr-=cost;addPoliceRep(gal,25);
  toast('💰 Взятка уплачена','good');renderMoreTab();
}

// ── Name screen ──
const USED_NAMES_KEY='sr_names_v1';
function showNameScreen(){
  document.getElementById('app-wrap').style.display='none';
  document.getElementById('name-screen').style.display='flex';
}
function validateName(val){
  val=val.trim();
  const err=document.getElementById('name-err');
  if(val.length<2){err.textContent='Минимум 2 символа';return null;}
  if(val.length>16){err.textContent='Максимум 16 символов';return null;}
  if(!/^[a-zA-Zа-яА-ЯёЁ0-9_\-]+$/.test(val)){err.textContent='Только буквы, цифры, _ и -';return null;}
  err.textContent='';return val;
}
async function submitName(){
  const val=document.getElementById('name-input').value;
  const name=validateName(val);if(!name) return;
  const btn=document.getElementById('name-btn');
  btn.disabled=true;btn.textContent='Сохранение...';
  // check shared storage for taken names
  try{
    const existing=await window.storage?.get(`name:${name.toLowerCase()}`,true);
    if(existing?.value){
      document.getElementById('name-err').textContent='Имя занято, выберите другое';
      btn.disabled=false;btn.textContent='Начать игру';return;
    }
    await window.storage?.set(`name:${name.toLowerCase()}`,name,true);
  }catch(e){}
  G.playerName=name;saveG();
  document.getElementById('name-screen').style.display='none';
  document.getElementById('app-wrap').style.display='';
  heartbeat();
  toast(`Добро пожаловать, ${name}!`,'good');
}

// ── Stars background ──
(()=>{
  const sf=document.getElementById('sf');
  for(let i=0;i<140;i++){
    const s=document.createElement('div');s.className='st';
    const sz=Math.random()*1.8+.2;
    s.style.cssText=`width:${sz}px;height:${sz}px;left:${Math.random()*100}%;top:${Math.random()*100}%;--d:${2+Math.random()*6}s;--dl:-${Math.random()*5}s`;
    sf.appendChild(s);
  }
})();

// ── Startup ──
initPrices();
_uiReady = true;
if(!G.playerName) showNameScreen();
else { updateHUD(); renderMine(); refreshQuests(); }
