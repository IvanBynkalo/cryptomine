// ═══════════════════════════════════════
//  ui.js — render, HUD, navigation
// ═══════════════════════════════════════

// toast, haptic, hapticN, fmt → globals.js

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
  // Event banner
  const evBanner=document.getElementById('event-banner');
  if(evBanner){
    if(G.activeEvent){
      evBanner.style.display='block';
      evBanner.innerHTML=`<span style="font-size:15px">${G.activeEvent.icon}</span> <b>${G.activeEvent.name}</b> <span style="font-size:10px;opacity:.8">${G.activeEvent.desc}</span>`;
    } else { evBanner.style.display='none'; }
  }
  // Anomaly badges on mine screen
  const anom=document.getElementById('anomaly-badges');
  if(anom&&G.anomaliesActive?.length){
    anom.style.display='block';
    anom.innerHTML=(G.anomaliesActive||[]).filter(a=>a.sysId===G.sys).map(a=>
      `<button class="btn btn-sm" style="background:rgba(168,85,247,.2);border-color:var(--purple);font-size:11px"
        onclick="exploreAnomaly('${a.id}')">${a.icon} ${a.name}</button>`).join('');
  } else if(anom) anom.style.display='none';
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
    hg.innerHTML+=`<div class="card${ok?' glow-c':''}" style="position:relative">
      <div class="helper-card-accent"></div>
      <div style="font-size:24px;margin-bottom:6px">${h.icon}</div>
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
  const invValue=Object.entries(G.cargo).reduce((s,[gId,amt])=>s+((G.cargoCost?.[gId]||0)*amt),0);
  let h=`<div class="hero-panel trade-head">
    <div class="hero-top">
      <div>
        <div class="hero-kicker">торговый терминал · ${sys.name}</div>
        <div class="hero-title">Рынок системы ${sys.emoji}</div>
        <div class="hero-sub">Покупай ниже рынка, вези в дефицитные зоны и контролируй среднюю цену груза прямо из трюма.</div>
      </div>
      <div class="hero-icon">💱</div>
    </div>
    <div class="mini-grid">
      <div class="mini-stat"><div class="l">Кредиты</div><div class="v">${fmt(G.cr)}</div></div>
      <div class="mini-stat"><div class="l">Трюм</div><div class="v">${used}/${G.cargoMax}</div></div>
      <div class="mini-stat"><div class="l">Закуплено</div><div class="v">${fmt(invValue)}</div></div>
      <div class="mini-stat"><div class="l">Спрос</div><div class="v">${sys.goods.length} поз.</div></div>
    </div>
  </div>
  <div class="section-shell"><div class="bar-row"><div class="bar-hd"><span>📦 Трюм</span><span>${used}/${G.cargoMax}</span></div>
    <div class="bar-tr"><div class="bar-f" style="width:${used/G.cargoMax*100}%;background:linear-gradient(90deg,var(--amber),var(--gold))"></div></div></div></div>`;
  const inv=Object.entries(G.cargo).filter(([,v])=>v>0);
  if(inv.length){
    h+=`<div class="sh">Ваш груз</div>`;
    inv.forEach(([gId,amt])=>{
      const def=GOODS[gId],price=G.prices[sys.id]?.[gId];
      const sell=price?Math.round(price*.9*(1+gSkill('trade')*.03)):null;
      h+=`<div class="good-row"><div class="gi">${def.icon}</div>
        <div class="ginfo"><div class="gname">${def.name} ×${amt}</div>
          ${sell?`<div class="gprice">Продать: ${fmt(sell)}/шт</div>`:`<div style="font-size:10px;color:var(--muted)">Нет спроса</div>`}
        </div><div class="gbtns">
          ${sell?`
            <div style="font-size:9px;color:var(--muted2);margin-bottom:3px">
              Куплено: ${G.cargoCost?.[gId]?fmt(G.cargoCost[gId])+'кр/ед':'—'}
              ${G.cargoCost?.[gId]&&price?(()=>{const p=price-(G.cargoCost[gId]||0);return p>0?'<span style="color:var(--green)">▲'+fmt(p)+'</span>':'<span style="color:var(--red)">▼'+fmt(Math.abs(p))+'</span>';})():''}
            </div>
            <button class="btn btn-sm btn-r" onclick="sellGood('${gId}',1)">×1</button>
            <button class="btn btn-sm btn-r" onclick="sellGood('${gId}',${amt})">Всё</button>`:''}
        </div></div>`;
    });
  }
  h+=`<div class="sh">${sys.emoji} ${sys.name} — Рынок</div>`;
  sys.goods.forEach(gId=>{
    const def=GOODS[gId],price=G.prices[sys.id]?.[gId]||def.base;
    const hist=G.priceHistory[sys.id]?.[gId]||[];
    const trend=hist.length>1?(hist[hist.length-1]>hist[0]?'up':'dn'):'eq';
    const trendIcon=trend==='up'?'▲':trend==='dn'?'▼':'—';
    const trendCol=trend==='up'?'var(--red)':trend==='dn'?'var(--green)':'var(--muted2)';
    const buyP=Math.round(price*(1-gSkill('eloquence')*.02));
    const canBuy=G.cr>=buyP&&used<G.cargoMax;
    const owned=G.cargo[gId]||0;
    h+=`<div class="good-row"><div class="gi">${def.icon}</div>
      <div class="ginfo">
        <div class="gname">${def.name}</div>
        <div class="gprice">💰 ${fmt(price)}${buyP<price?` <span style="color:var(--green)">(${fmt(buyP)})</span>`:''}</div>
        <div style="font-size:9px;color:${trendCol}">${trendIcon} ${trend==='up'?'Растёт':trend==='dn'?'Падает':'Стабильно'}</div>
        ${owned?`<div style="font-size:9px;color:var(--muted2)">Имеется: ${owned}</div>`:''}
      </div><div class="gbtns">
        <button class="btn btn-sm btn-g" onclick="buyGood('${gId}')" ${canBuy?'':'disabled'}>×1</button>
        <button class="btn btn-sm btn-g" onclick="buyGoodMax('${gId}')" ${canBuy?'':'disabled'}>Макс</button>
        ${owned?`<button class="btn btn-sm btn-r" onclick="sellGood('${gId}',1)">Прод</button>`:''}
      </div></div>`;
  });
  document.getElementById('trade-scr').innerHTML=h;
  document.getElementById('t-cred').textContent=fmt(G.cr);
  document.getElementById('t-cargo').textContent=`${used}/${G.cargoMax}`;
  document.getElementById('t-loc').textContent=sys.name;
  document.getElementById('t-time').textContent=timeStr();
}

// ── Quest screen ──
function renderQuests(){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  const readyCount=G.quests.filter(q=>q.accepted&&!q.done&&((q.type==='deliver'&&G.sys===q.need.destSys&&(G.cargo?.[q.need.good]||0)>=q.need.amt)||(q.type==='kill'&&(q.progress||0)>=(q.need?.count||1)&&G.sys===q.sysId)||(q.type==='collect'&&(q.progress||0)>=(q.need?.count||1)&&G.sys===q.sysId))).length;
  let h=`<div class="hero-panel quest-head">
    <div class="hero-top">
      <div>
        <div class="hero-kicker">контрактный центр · ${sys.name}</div>
        <div class="hero-title">Задания и поручения</div>
        <div class="hero-sub">Бери контракты у мэров, отслеживай прогресс и сдавай миссии без лишнего поиска по интерфейсу.</div>
      </div>
      <div class="hero-icon">📡</div>
    </div>
    <div class="banner-line">
      <span class="pill">📍 Текущая система: ${sys.name}</span>
      <span class="pill">✅ Готово к сдаче: ${readyCount}</span>
      <span class="pill">🗂 Активных: ${G.quests.filter(q=>q.accepted&&!q.done).length}</span>
    </div>
  </div><div class="sh">Мэры — ${sys.name}</div>`;
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
    const total=q.need?.amt||q.need?.count||1;
    const prog=q.type==='deliver'?(G.sys===q.need.destSys?Math.min(total,G.cargo?.[q.need.good]||0):(q.progress||0)):(q.progress||0);
    const canClaimDeliver=q.accepted&&q.type==='deliver'&&G.sys===q.need.destSys&&(G.cargo?.[q.need.good]||0)>=q.need.amt;
    const canClaimKill=q.accepted&&q.type==='kill'&&prog>=total;
    const canClaimCollect=q.accepted&&q.type==='collect'&&prog>=total;
    h+=`<div class="quest-card${q.accepted?' active':''}">
      <div class="qc-type" style="color:${q.color}">${q.icon} ${q.type==='deliver'?'ДОСТАВКА':q.type==='kill'?'УНИЧТОЖЕНИЕ':'СБОР'}</div>
      <div class="qc-name">${q.title}</div>
      <div class="quest-giver">${q.giverIcon} ${q.giver}</div>
      <div class="qc-desc">${q.desc}</div>
      ${q.accepted?`<div class="qc-prog">Прогресс: ${prog}/${total}${q.type==='deliver'&&G.sys===q.need.destSys?` · В трюме: ${G.cargo?.[q.need.good]||0}`:''}</div>
        <div class="bar-tr" style="margin-bottom:8px"><div class="bar-f bf-xp" style="width:${Math.min(100,prog/total*100)}%"></div></div>`:''}
      <div class="qc-reward">🏆 ${fmt(q.reward)} кр · +${q.xp} XP · +${q.rp} НО</div>
      <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
        ${!q.accepted?`<button class="btn btn-sm btn-c" onclick="acceptQuest('${q.id}')">Принять</button>`:''}
        ${canClaimDeliver?`<button class="btn btn-sm btn-g" onclick="claimDeliverQuest('${q.id}')">Сдать груз</button>`:''}
        ${q.accepted&&q.type==='deliver'&&!canClaimDeliver&&G.sys===q.need.destSys?`<span style="font-size:10px;color:var(--muted2)">Нужно ${q.need.amt}× ${GOODS[q.need.good].name} в трюме</span>`:''}
        ${q.accepted&&q.type==='deliver'&&G.sys!==q.need.destSys?`<span style="font-size:10px;color:var(--muted2)">Пункт назначения: ${SYSTEMS.find(s=>s.id===q.need.destSys)?.name||q.need.destSys}</span>`:''}
        ${canClaimKill?`<button class="btn btn-sm btn-g" onclick="claimKillQuest('${q.id}')">Сдать</button>`:''}
        ${canClaimCollect?`<button class="btn btn-sm btn-g" onclick="claimCollectQuest('${q.id}')">Сдать</button>`:''}
        ${q.expires?`<span style="font-size:9px;color:var(--muted2)">Истекает: День ${q.expires}</span>`:''}
      </div></div>`;
  });
  if(elsewhere.length){
    h+=`<div class="sh">Активные задания</div>`;
    elsewhere.forEach(q=>{
      const total=q.need?.amt||q.need?.count||1;
      const prog=q.type==='deliver'?(G.sys===q.need.destSys?Math.min(total,G.cargo?.[q.need.good]||0):(q.progress||0)):(q.progress||0);
      const canClaimDeliver=q.accepted&&q.type==='deliver'&&G.sys===q.need.destSys&&(G.cargo?.[q.need.good]||0)>=q.need.amt;
      const canClaimKill=q.accepted&&q.type==='kill'&&prog>=total&&G.sys===q.sysId;
      const canClaimCollect=q.accepted&&q.type==='collect'&&prog>=total&&G.sys===q.sysId;
      h+=`<div class="quest-card active">
        <div class="qc-type" style="color:${q.color}">${q.icon} ${q.title}</div>
        <div class="qc-desc">${q.desc}</div>
        <div class="qc-prog">${prog}/${total} · Выдано в: ${SYSTEMS.find(s=>s.id===q.sysId)?.name||q.sysId}</div>
        <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
          ${canClaimDeliver?`<button class="btn btn-sm btn-g" onclick="claimDeliverQuest('${q.id}')">Сдать груз</button>`:''}
          ${canClaimKill?`<button class="btn btn-sm btn-g" onclick="claimKillQuest('${q.id}')">Сдать</button>`:''}
          ${canClaimCollect?`<button class="btn btn-sm btn-g" onclick="claimCollectQuest('${q.id}')">Сдать</button>`:''}
          ${q.type==='deliver'&&G.sys===q.need.destSys&&!canClaimDeliver?`<span style="font-size:10px;color:var(--muted2)">Нужно ${q.need.amt}× ${GOODS[q.need.good].name} в трюме</span>`:''}
          ${q.type!=='deliver'&&prog>=total&&G.sys!==q.sysId?`<span style="font-size:10px;color:var(--muted2)">Вернитесь в систему выдачи для сдачи</span>`:''}
        </div></div>`;
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

function setMoreTab(t,btn){
  // Highlight correct bottom nav button
  document.querySelectorAll('.mnb').forEach(b=>b.classList.remove('on'));
  const nb=document.getElementById('mnb-'+t);
  if(nb) nb.classList.add('on');
  // Hide extra row if clicking main item
  const extraIds=['police','land','story','debris'];
  if(!extraIds.includes(t)){
    const ex=document.getElementById('more-extra');
    if(ex) ex.style.display='none';
  }
  moreTab=t;
  renderMoreTab();
}

function toggleMoreSubnav(){
  const ex=document.getElementById('more-extra');
  if(!ex) return;
  const visible=ex.style.display==='grid';
  ex.style.display=visible?'none':'grid';
  // highlight ••• button
  const btn=document.getElementById('mnb-more2');
  if(btn) btn.classList.toggle('on',!visible);
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
  if(moreTab==='combat')  { scr.innerHTML=renderCombatHTML(); }
  else if(moreTab==='tech')    { scr.innerHTML=renderTechHTML(); }
  else if(moreTab==='skills')  { scr.innerHTML=renderSkillsHTML(); }
  else if(moreTab==='market')  { scr.innerHTML=renderMarketHTML(); }
  else if(moreTab==='rangers') { scr.innerHTML=renderRangersHTML(); }
  else if(moreTab==='debris')  { scr.innerHTML=renderDebrisHTML(); }
  else if(moreTab==='online')  { renderOnlineRangers(); return; } // async
  else if(moreTab==='police')  { scr.innerHTML=renderPoliceHTML(); }
  else if(moreTab==='land')    { scr.innerHTML=renderLandHTML(); }
  else if(moreTab==='story')   { scr.innerHTML=renderStoryHTML(); }
  else if(moreTab==='events')  { scr.innerHTML=renderEventsHTML(); }
  else if(moreTab==='hangar')  { scr.innerHTML=renderHangarHTML(); }
  else if(moreTab==='catalog') { scr.innerHTML=renderCatalogHTML(); }
  document.getElementById('mo-cred').textContent=fmt(G.cr);
  document.getElementById('mo-rp').textContent=fmt(Math.floor(G.rp));
  document.getElementById('mo-hull').textContent=Math.floor(G.hull/G.maxHull*100)+'%';
  document.getElementById('mo-mis').textContent=G.missiles;
}

// ── Combat HTML ──
function renderCombatHTML(){
  let h='';
  if(!G.combat){
    const sys=SYSTEMS.find(s=>s.id===G.sys);
    h+=`<div class="hero-panel more-head">
      <div class="hero-top">
        <div>
          <div class="hero-kicker">боевой контур · ${sys.name}</div>
          <div class="hero-title">Сектор напряжённости</div>
          <div class="hero-sub">Оцени пиратскую активность, состояние корабля и вступай в бой только когда готов.</div>
        </div>
        <div class="hero-icon">⚔️</div>
      </div>
      <div class="banner-line">
        <span class="pill">☠️ Пираты: ${Math.round(sys.pc*100)}%</span>
        <span class="pill">🛡 Корпус: ${Math.floor(G.hull/G.maxHull*100)}%</span>
        <span class="pill">🚀 Ракеты: ${G.missiles}</span>
      </div>
    </div><div class="card" style="text-align:center;padding:20px">
      <div style="font-size:48px;margin-bottom:8px">🛸</div>
      <div style="font-size:13px;color:var(--muted2);margin-bottom:12px">
        <b style="color:var(--cyan)">${sys.name}</b> — пиратская активность: ${Math.round(sys.pc*100)}%
      </div>
      <button class="btn btn-r btn-full" onclick="findEnemy()">🔍 Искать противника</button>
      ${currentAlienInvasion()?(()=>{ const inv=currentAlienInvasion(); const wave=(inv.alienIds||[]).map(id=>ALIEN_TYPES.find(a=>a.id===id)).filter(Boolean); const scouts=wave.filter(a=>(a.threat||1)<=1); const elites=wave.filter(a=>(a.threat||1)===2); const commanders=wave.filter(a=>(a.threat||1)>=3); const boss=ALIEN_TYPES.find(a=>a.id===inv.bossId); const progress=Math.round(((inv.progress||0)/Math.max(1,inv.totalTargets||1))*100); const grp=(arr,title,col)=>arr.length?`<div style="margin-top:8px"><div style="font-size:10px;font-weight:800;color:${col};margin-bottom:4px">${title} · ${arr.length}</div>${arr.map((a,i)=>`<div class="card" style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:5px;border-color:${a.color||'#ff2d78'}33;background:rgba(255,255,255,.03)"><div style="display:flex;align-items:center;gap:10px"><div style="font-size:24px;filter:drop-shadow(0 0 8px ${a.color||'#ff2d78'}88)">${a.icon}</div><div><div style="font-size:12px;font-weight:700;color:${a.color||'#ff2d78'}">${a.name}</div><div style="font-size:10px;color:var(--muted2)">Угроза ${a.threat||1} · ХП ${a.maxHp} · Награда ${fmt(a.reward)}</div></div></div><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="btn btn-sm" style="background:rgba(255,45,120,.15);border-color:#ff2d78;color:#ff2d78" onclick="fightAlien('${a.id}')">Бой</button>${i===0?`<button class="btn btn-sm btn-c" onclick="coopRaid('${a.id}')">Кооп</button>`:''}</div></div>`).join('')}</div>`:''; return `<div class="card" style="margin-top:8px;border-color:#ff2d7833;background:linear-gradient(180deg,rgba(255,45,120,.14),rgba(9,12,24,.65))"><div style="font-size:12px;font-weight:800;color:#ff73ac">⚠️ Вторжение в ${SYSTEMS.find(s=>s.id===inv.sysId)?.name||'неизвестной системе'}</div><div style="font-size:10px;color:var(--muted2);margin:4px 0 6px">Зачистка: ${inv.progress||0}/${inv.totalTargets||1} · ${progress}%</div><div style="height:8px;border-radius:999px;background:rgba(255,255,255,.06);overflow:hidden"><div style="width:${progress}%;height:100%;background:linear-gradient(90deg,#ff2d78,#ffd166)"></div></div>${grp(scouts,'АВАНГАРД','#7dd3fc')}${grp(elites,'ЭЛИТА','#f59e0b')}${grp(commanders,'КОМАНДИРЫ','#fb7185')}${inv.bossUnlocked&&!inv.bossDefeated&&boss?`<div class="card" style="margin-top:8px;border-color:${boss.color||'#ff2d78'}66;background:rgba(255,45,120,.15)"><div style="font-size:11px;font-weight:800;color:#ffd166;margin-bottom:4px">👑 ФИНАЛЬНЫЙ БОСС ДОСТУПЕН</div><div style="display:flex;align-items:center;justify-content:space-between;gap:10px"><div><div style="font-size:13px;font-weight:700;color:${boss.color||'#ff2d78'}">${boss.icon} ${boss.name}</div><div style="font-size:10px;color:var(--muted2)">Угроза ${boss.threat||5} · ХП ${boss.maxHp} · Награда ${fmt(boss.reward)}</div></div><div style="display:flex;gap:6px"><button class="btn btn-r btn-sm" onclick="fightAlien('${boss.id}')">Босс</button><button class="btn btn-g btn-sm" onclick="coopRaid('${boss.id}')">Кооп</button></div></div></div>`:`<div style="font-size:10px;color:#ffd166;margin-top:8px">👑 Босс откроется после полной зачистки волны</div>`}</div>`; })():''}
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
  // Полный каталог техники — заменяет старый рынок
  const catMap={hull:'hull',engine:'engine',weapon:'weapon',shield:'defense'};
  catalogFilter=catMap[marketCat]||marketCat;
  if(typeof renderCatalogHTML==='function') return renderCatalogHTML();
  // Fallback если каталог не загружен
  return `<div class="card" style="text-align:center;padding:20px;color:var(--muted2)">
    ⚠️ Каталог загружается... Обновите страницу или перейдите в таб 📋 Каталог
    <br><br><button class="btn btn-sm btn-c" onclick="setMoreTab('catalog',null)">📋 Открыть Каталог</button>
  </div>`;
}

// ── Rangers HTML ──
function renderRangersHTML(){
  const rank=getRank();
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
      Производит: ${plot.good?GOODS[plot.good]?.name:'?'} — ${level*2}/день · +${level*5}/сек
    </div>`;
  }
  if(level<5){
    const cost=costs[level];
    h+=`<div style="margin-bottom:8px">
      ${goods.map(gId=>`<button class="btn btn-sm ${G.cr>=cost?'btn-g':''}" style="margin-right:4px;margin-bottom:4px"
        onclick="buyLandPlot('${G.sys}','${gId}')" ${G.cr>=cost?'':'disabled'}>
        ${GOODS[gId]?.icon} ${GOODS[gId]?.name}
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
          <div style="font-size:10px;color:var(--muted2)">${GOODS[p.good]?.icon} ${GOODS[p.good]?.name} · Ур.${p.level} · +${p.level*2}/день</div>
        </div>
        <div style="font-family:var(--mono);font-size:14px;color:var(--green)">+${p.level*5}/сек</div>
      </div>`;
    });
  }
  return h;
}

// ── Story Chains HTML ──
function renderStoryHTML(){
  let h=`<div class="sh">📖 Сюжетные цепочки</div>`;
  STORY_CHAINS.forEach(chain=>{
    const prog=G.storyProgress[chain.id]||{step:0,done:false};
    const started=prog.step>0;
    const done=prog.done;
    const stepIdx=Math.max(0,prog.step-1);
    const curStep=chain.steps[stepIdx];
    const pct=done?100:Math.round((stepIdx/chain.steps.length)*100);
    h+=`<div class="card" style="margin-bottom:10px;border-color:${done?'var(--green)':started?'var(--cyan)':'var(--b1)'}">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
        <div style="font-size:28px">${chain.icon}</div>
        <div style="flex:1">
          <div style="font-size:13px;font-weight:700">${chain.title}</div>
          <div style="font-size:10px;color:var(--muted2)">${chain.desc}</div>
        </div>
        <div style="text-align:right;font-family:var(--mono);font-size:11px;color:${done?'var(--green)':'var(--muted2)'}">
          ${done?'✅ Завершено':`${stepIdx}/${chain.steps.length}`}
        </div>
      </div>
      <div style="height:3px;background:var(--b1);border-radius:2px;margin-bottom:8px">
        <div style="height:100%;background:linear-gradient(90deg,var(--cyan),var(--purple));width:${pct}%;border-radius:2px;transition:width .3s"></div>
      </div>`;
    if(!done&&curStep){
      const canClaim=(curStep.type==='arrive'&&G.sys===curStep.sys)||
        (curStep.type==='deliver'&&G.sys===curStep.sys&&(G.cargo[curStep.good]||0)>=curStep.amt)||
        (curStep.type==='kill'&&(prog.killCount||0)>=curStep.count);
      h+=`<div style="font-size:11px;color:var(--cyan);margin-bottom:4px">
          ${started?`Шаг ${prog.step}/${chain.steps.length}:`:'Следующий шаг:'} <b>${curStep.title}</b>
        </div>
        <div style="font-size:10px;color:var(--muted2);margin-bottom:8px">${curStep.desc}</div>`;
      if(curStep.type==='deliver') h+=`<div style="font-size:10px;color:var(--gold);margin-bottom:6px">
          📦 Нужно: ${curStep.amt}× ${GOODS[curStep.good]?.name} → система ${SYSTEMS.find(s=>s.id===curStep.sys)?.name}
          (в трюме: ${G.cargo[curStep.good]||0})
        </div>`;
      if(curStep.type==='arrive') h+=`<div style="font-size:10px;color:var(--gold);margin-bottom:6px">
          ✈️ Долетите до: ${SYSTEMS.find(s=>s.id===curStep.sys)?.name}
          ${G.sys===curStep.sys?'<span style="color:var(--green)">✅ Вы здесь!</span>':''}
        </div>`;
      if(curStep.type==='kill') h+=`<div style="font-size:10px;color:var(--gold);margin-bottom:6px">
          ⚔️ Убито: ${prog.killCount||0}/${curStep.count}
        </div>`;
      h+=`<div style="display:flex;gap:6px">
        ${!started?`<button class="btn btn-sm btn-c" onclick="startStoryChain('${chain.id}')">▶ Начать</button>`:''}
        ${started&&canClaim?`<button class="btn btn-sm btn-g" onclick="claimStoryStep('${chain.id}')">✅ Сдать шаг</button>`:''}
        <span style="font-size:10px;color:var(--gold);align-self:center">🏆 +${fmt(curStep.reward)} кр</span>
      </div>`;
    }
    h+=`</div>`;
  });
  return h;
}

// ── Random Events HTML ──
function renderEventsHTML(){
  let h=`<div class="sh">🌪️ События</div>`;
  if(G.activeEvent){
    const e=G.activeEvent;
    const absDay=G.day+(G.month-1)*30+(G.year-2450)*360;
    const rem=Math.max(0,e.endsDay-absDay);
    h+=`<div class="card" style="border-color:var(--gold);background:rgba(255,215,0,.06)">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="font-size:32px">${e.icon}</div>
        <div>
          <div style="font-size:13px;font-weight:700;color:var(--gold)">${e.name}</div>
          <div style="font-size:11px;color:var(--muted2);margin-top:3px">${e.desc}</div>
          <div style="font-size:10px;color:var(--cyan);margin-top:4px">⏳ Осталось: ${rem} д.</div>
        </div>
      </div>
    </div>`;
  } else {
    h+=`<div class="card" style="color:var(--muted2);font-size:12px;text-align:center;padding:20px">Нет активных событий</div>`;
  }
  h+=`<div class="sh">📋 Все события</div>`;
  RANDOM_EVENTS.forEach(e=>{
    const wasActive=G.eventHistory?.some(h=>h.id===e.id);
    h+=`<div style="display:flex;align-items:center;gap:10px;padding:8px 12px;margin-bottom:4px;
      background:var(--card);border:1px solid var(--b1);border-radius:8px;opacity:${wasActive?1:.6}">
      <div style="font-size:20px">${e.icon}</div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:700">${e.name}</div>
        <div style="font-size:10px;color:var(--muted2)">${e.desc}</div>
      </div>
      <div style="font-size:10px;color:var(--muted2)">${e.duration?`${e.duration}д`:'Разово'}</div>
    </div>`;
  });
  // Anomalies section
  h+=`<div class="sh">🔮 Аномалии ${G.anomaliesFound?`(найдено: ${G.anomaliesFound})`:''}</div>`;
  const active=(G.anomaliesActive||[]).filter(a=>a.sysId===G.sys);
  if(active.length){
    active.forEach(a=>{
      h+=`<div class="card" style="border-color:var(--purple)">
        <div style="display:flex;align-items:center;gap:10px;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:10px">
            <div style="font-size:28px">${a.icon}</div>
            <div>
              <div style="font-size:13px;font-weight:700">${a.name}</div>
              <div style="font-size:10px;color:var(--muted2)">${a.desc}</div>
              <div style="font-size:10px;color:var(--red)">⚠️ Опасность: ${Math.round(a.danger*100)}%</div>
            </div>
          </div>
          <button class="btn btn-sm btn-c" onclick="exploreAnomaly('${a.id}')">🔍 Исследовать</button>
        </div>
      </div>`;
    });
  } else {
    h+=`<div style="font-size:11px;color:var(--muted2);padding:8px">Нет аномалий в текущей системе. Исследуйте опасные и научные системы.</div>`;
  }
  if(G.anomalyLog?.length){
    h+=`<div class="sh">История аномалий</div>`;
    G.anomalyLog.slice(0,5).forEach(a=>{
      const rStr=Object.entries(a.reward||{}).filter(([k])=>k!=='teleport').map(([k,v])=>`+${v} ${k}`).join(', ');
      h+=`<div style="font-size:11px;color:var(--muted2);padding:4px 8px">${a.icon} ${a.name} — ${rStr}</div>`;
    });
  }
  ANOMALIES.forEach(a=>{
    h+=`<div style="display:flex;align-items:center;gap:8px;padding:6px 10px;margin-bottom:3px;
      background:rgba(168,85,247,.06);border:1px solid rgba(168,85,247,.15);border-radius:8px">
      <div style="font-size:18px">${a.icon}</div>
      <div style="flex:1">
        <div style="font-size:11px;font-weight:700">${a.name}</div>
        <div style="font-size:9px;color:var(--muted2)">${a.desc} · Опасность ${Math.round(a.danger*100)}%</div>
      </div>
    </div>`;
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
  const price=G.prices[sys.id]?.[gId];
  if(!price){toast('Нет товара','bad');return;}
  const realP=Math.round(price*(1-gSkill('eloquence')*.02));
  if(G.cr<realP){toast('💸 Мало кредитов','bad');return;}
  G.cargoMax=calcCargoMax();
  if(calcCargoUsed()>=G.cargoMax){toast('📦 Трюм полон!','bad');return;}
  _updateCargoCost(gId,realP,1);
  G.cr-=realP; G.cargo[gId]=(G.cargo[gId]||0)+1;
  haptic('light');renderTrade();updateHUD();
}
function buyGoodMax(gId){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  const price=G.prices[sys.id]?.[gId];if(!price) return;
  const realP=Math.round(price*(1-gSkill('eloquence')*.02));
  let bought=0;G.cargoMax=calcCargoMax();
  while(G.cr>=realP&&calcCargoUsed()<G.cargoMax){
    _updateCargoCost(gId,realP,1);
    G.cr-=realP;G.cargo[gId]=(G.cargo[gId]||0)+1;bought++;
  }
  if(bought) toast(`📦 ×${bought}`,'good');
  haptic('medium');renderTrade();updateHUD();
}
function sellGood(gId,amt){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  const price=G.prices[sys.id]?.[gId];if(!price){toast('Нет спроса','bad');return;}
  const toSell=Math.min(amt,G.cargo[gId]||0);if(!toSell) return;
  const earn=Math.round(price*toSell*(1+gSkill('trade')*.03));
  const avgCost=(G.cargoCost?.[gId]||0)*toSell;
  const profit=earn-avgCost;
  G.cr+=earn;G.totalCr+=earn;
  G.cargo[gId]=(G.cargo[gId]||0)-toSell;
  if((G.cargo[gId]||0)<=0) { delete G.cargo[gId]; if(G.cargoCost) delete G.cargoCost[gId]; }
  const profitStr=avgCost>0?(profit>=0?` (+${fmt(profit)})`:(` (${fmt(profit)})`)): '';
  toast(`💰 +${fmt(earn)} кр${profitStr}`,'good');haptic('medium');renderTrade();updateHUD();
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
  if(G.owned_equip.includes(id)){toast('Уже есть','warn');return;}
  if(G.cr<eq.cost){toast('💸 Мало кредитов','bad');return;}
  G.cr-=eq.cost;G.owned_equip.push(id);
  toast(`🛒 ${eq.name}`,'good');hapticN('success');renderMoreTab();updateHUD();
}
function equipItem(id){
  const eq=EQUIPMENT.find(e=>e.id===id);if(!eq) return;
  if(!G.owned_equip.includes(id)&&eq.cost>0){buyEquip(id);return;}
  G.equip[eq.cat]=id;G.maxHull=calcMaxHull();
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

// ════════════════════════════════════
//  АНГАР — текущее снаряжение + слоты
// ════════════════════════════════════
let hangarCompareSlot=null;
function renderHangarHTML(){
  const hull=HULLS_CATALOG.find(h=>h.id===G.equip.hull)||HULLS_CATALOG[0];
  const slots=hull?.stats?.slots||{wpn:2,def:1,eng:1,spec:2,sup:1};
  const eq=getEquipStats();
  let h=`<div class="sh">🚀 Ангар — ${hull?.name||'Без корпуса'}</div>`;
  // Ship summary card
  h+=`<div class="card" style="border-color:${RARITY_COLOR[hull?.rarity||'common']}55;margin-bottom:10px">
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
      <div style="font-size:42px">${hull?.icon||'🚀'}</div>
      <div>
        <div style="font-size:14px;font-weight:700">${hull?.name}</div>
        <div style="font-size:10px;color:${RARITY_COLOR[hull?.rarity||'common']}">${hull?.rarity?.toUpperCase()||'COMMON'} · T${hull?.tier||1} · ${hull?.mfr||'—'}</div>
        <div style="font-size:10px;color:var(--muted2)">${hull?.role||''} · ${hull?.desc||''}</div>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;font-size:11px">
      <div style="background:rgba(0,0,0,.3);border-radius:6px;padding:6px;text-align:center">
        <div style="color:var(--muted2)">⚔️ Атака</div><div style="font-family:var(--mono);color:var(--gold)">${calcAttack()}</div>
      </div>
      <div style="background:rgba(0,0,0,.3);border-radius:6px;padding:6px;text-align:center">
        <div style="color:var(--muted2)">🛡️ Защита</div><div style="font-family:var(--mono);color:var(--cyan)">${calcDefense()}</div>
      </div>
      <div style="background:rgba(0,0,0,.3);border-radius:6px;padding:6px;text-align:center">
        <div style="color:var(--muted2)">❤️ ХП</div><div style="font-family:var(--mono);color:var(--green)">${calcMaxHull()}</div>
      </div>
      <div style="background:rgba(0,0,0,.3);border-radius:6px;padding:6px;text-align:center">
        <div style="color:var(--muted2)">📦 Трюм</div><div style="font-family:var(--mono);color:var(--amber)">${calcCargoMax()}</div>
      </div>
      <div style="background:rgba(0,0,0,.3);border-radius:6px;padding:6px;text-align:center">
        <div style="color:var(--muted2)">⚡ Топл.</div><div style="font-family:var(--mono);color:var(--purple)">${G.maxFuel}</div>
      </div>
      <div style="background:rgba(0,0,0,.3);border-radius:6px;padding:6px;text-align:center">
        <div style="color:var(--muted2)">🏃 Уклон</div><div style="font-family:var(--mono);color:var(--cyan)">${Math.round((eq.dodge||0)*100)}%</div>
      </div>
    </div>
  </div>`;

  // Slots
  const slotDefs=[
    {key:'hull',  label:'Корпус',    cat:'hull',    icon:'🚀'},
    {key:'weapon',label:'Оружие 1',  cat:'weapon',  icon:'⚔️'},
    {key:'defense',label:'Защита',   cat:'defense', icon:'🛡️'},
    {key:'engine',label:'Двигатель', cat:'engine',  icon:'🔥'},
    {key:'specmod1',label:'Спецмод 1',cat:'specmod',icon:'🔬'},
    {key:'support',label:'Поддержка',cat:'support', icon:'🤖'},
  ];
  h+=`<div class="sh">Слоты</div>`;
  slotDefs.forEach(sl=>{
    const installedId=G.equip[sl.key]||G.equip[sl.key.replace(/\d/,'')];
    // search in full catalog
    const installed=EQUIPMENT_CATALOG.find(e=>e.id===installedId);
    const rarColor=installed?RARITY_COLOR[installed.rarity||'common']:'#333';
    h+=`<div class="card" style="display:flex;align-items:center;gap:10px;border-color:${rarColor}44;margin-bottom:6px"
        onclick="setMoreTab('catalog',null);catalogFilter='${sl.cat}';renderMoreTab()">
      <div style="font-size:24px">${installed?.icon||sl.icon}</div>
      <div style="flex:1">
        <div style="font-size:10px;color:var(--muted2)">${sl.label}</div>
        <div style="font-size:12px;font-weight:700;color:${rarColor}">${installed?.name||'— Пусто —'}</div>
        ${installed?`<div style="font-size:9px;color:var(--muted2)">${installed.rarity?.toUpperCase()} · T${installed.tier}</div>`:''}
      </div>
      <div style="font-size:10px;color:var(--cyan)">Сменить ›</div>
    </div>`;
  });

  // Maintenance cost
  const installedItems=Object.values(G.equip).map(id=>EQUIPMENT_CATALOG.find(e=>e.id===id)).filter(Boolean);
  const totalUpkeep=installedItems.reduce((s,e)=>s+(e.upkeep||0),0);
  if(totalUpkeep>0){
    h+=`<div style="font-size:11px;color:var(--muted2);padding:8px;background:rgba(0,0,0,.2);border-radius:6px;margin-top:6px">
      ⚙️ Обслуживание: <span style="color:var(--gold)">${fmt(totalUpkeep)} кр/день</span>
    </div>`;
  }
  return h;
}

// ════════════════════════════════════
//  КАТАЛОГ — весь ассортимент с фильтрами
// ════════════════════════════════════
let catalogFilter='hull';
let catalogTier=0; // 0=all
let catalogAvailOnly=false;
let catalogSearch='';
let catalogCompareId=null;

function renderCatalogHTML(){
  const cats=[
    {id:'hull',   label:'Корпуса',     icon:'🚀', count:HULLS_CATALOG.length},
    {id:'weapon', label:'Оружие',      icon:'⚔️', count:WEAPONS_CATALOG.length},
    {id:'defense',label:'Защита',      icon:'🛡️', count:SHIELDS_CATALOG.length},
    {id:'engine', label:'Двигатели',   icon:'🔥', count:ENGINES_CATALOG.length},
    {id:'specmod',label:'Спецмодули',  icon:'🔬', count:SPECMODS_CATALOG.length},
    {id:'support',label:'Дроны',       icon:'🤖', count:DRONES_CATALOG.length},
  ];

  let h=`<div class="sh">📋 Каталог техники (${EQUIPMENT_CATALOG.length} ед.)</div>`;

  // Category tabs
  h+=`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:10px">`;
  cats.forEach(c=>{
    const on=catalogFilter===c.id;
    h+=`<button class="btn btn-sm ${on?'btn-c':''}" style="font-size:10px" onclick="catalogFilter='${c.id}';renderMoreTab()">
      ${c.icon} ${c.label} <span style="opacity:.6">${c.count}</span>
    </button>`;
  });
  h+=`</div>`;

  // Tier filter
  h+=`<div style="display:flex;gap:4px;margin-bottom:8px;flex-wrap:wrap">
    ${[0,1,2,3,4,5,6].map(t=>`<button class="btn btn-sm ${catalogTier===t?'btn-c':''}" style="font-size:10px;min-width:36px"
      onclick="catalogTier=${t};renderMoreTab()">${t===0?'Все':'T'+t}</button>`).join('')}
    <button class="btn btn-sm ${catalogAvailOnly?'btn-g':''}" style="font-size:10px;margin-left:auto"
      onclick="catalogAvailOnly=!catalogAvailOnly;renderMoreTab()">✅ Только доступные</button>
  </div>`;

  // Items list
  let items=EQUIPMENT_CATALOG.filter(e=>e.cat===catalogFilter);
  if(catalogTier>0) items=items.filter(e=>e.tier===catalogTier);
  if(catalogAvailOnly) items=items.filter(e=>getEquipUnlocked(e,G));
  if(catalogSearch) items=items.filter(e=>e.name.toLowerCase().includes(catalogSearch));

  const installed=G.equip;
  h+=`<div style="font-size:10px;color:var(--muted2);margin-bottom:6px">${items.length} предметов</div>`;

  items.forEach(item=>{
    const unlocked=getEquipUnlocked(item,G);
    const lockReason=unlocked?'':getEquipLockReason(item,G);
    const rarColor=RARITY_COLOR[item.rarity||'common'];
    const isEquipped=Object.values(G.equip).includes(item.id);
    const isOwned=G.owned_equip?.includes(item.id)||isEquipped;

    // Comparison delta if comparing
    let compareBlock='';
    if(catalogCompareId&&catalogCompareId!==item.id){
      const base=EQUIPMENT_CATALOG.find(e=>e.id===catalogCompareId);
      if(base&&base.cat===item.cat){
        const dAtk=(item.stats?.atk||0)-(base.stats?.atk||0);
        const dDef=(item.stats?.def||0)-(base.stats?.def||0);
        const dHull=(item.stats?.maxHull||0)-(base.stats?.maxHull||0);
        const dCargo=(item.stats?.cargo||0)-(base.stats?.cargo||0);
        const statParts=[];
        if(dAtk) statParts.push(`<span style="color:${dAtk>0?'var(--green)':'var(--red)'}">Урон ${dAtk>0?'+':''}${dAtk}</span>`);
        if(dDef) statParts.push(`<span style="color:${dDef>0?'var(--green)':'var(--red)'}">Броня ${dDef>0?'+':''}${dDef}</span>`);
        if(dHull) statParts.push(`<span style="color:${dHull>0?'var(--green)':'var(--red)'}">ХП ${dHull>0?'+':''}${dHull}</span>`);
        if(dCargo) statParts.push(`<span style="color:${dCargo>0?'var(--green)':'var(--red)'}">Трюм ${dCargo>0?'+':''}${dCargo}</span>`);
        if(statParts.length) compareBlock=`<div style="font-size:9px;margin-top:4px;display:flex;gap:6px;flex-wrap:wrap">${statParts.join('')}</div>`;
      }
    }

    h+=`<div class="card" style="margin-bottom:6px;opacity:${unlocked?1:.6};
      border-color:${isEquipped?'var(--green)':rarColor}44;
      ${isEquipped?'background:rgba(0,255,136,.04)':''}">
      <div style="display:flex;align-items:center;gap:10px">
        <div style="font-size:26px;filter:${unlocked?'none':'grayscale(1)'}">${item.icon||'📦'}</div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:12px;font-weight:700">${item.name}</span>
            <span style="font-size:9px;color:${rarColor};text-transform:uppercase">${item.rarity}</span>
            <span style="font-size:9px;color:var(--muted2)">T${item.tier}</span>
            ${isEquipped?'<span style="font-size:9px;color:var(--green)">✅ Установлено</span>':''}
          </div>
          <div style="font-size:9px;color:var(--muted2)">${MANUFACTURERS[item.mfr]?.icon||'⚙️'} ${item.mfr||''} · ${item.role||item.subcat}</div>
          <div style="font-size:10px;color:var(--muted2);margin-top:2px">${item.desc}</div>
          ${unlocked?'':'<div style="font-size:9px;color:var(--red);margin-top:2px">🔒 '+lockReason+'</div>'}
          <div style="font-size:9px;color:var(--muted2);margin-top:2px">
            ${Object.entries(item.stats||{}).filter(([k])=>!['slots'].includes(k)).slice(0,4).map(([k,v])=>`${k}:${typeof v==='number'?Math.round(v*100)/100:v}`).join(' · ')}
          </div>
          ${compareBlock}
        </div>
        <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">
          <div style="font-family:var(--mono);font-size:12px;color:var(--gold)">${item.price?fmt(item.price)+' кр':'Старт'}</div>
          ${unlocked&&!isEquipped?`<button class="btn btn-sm btn-c" style="font-size:9px" onclick="equipCatalogItem('${item.id}')">Надеть</button>`:''}
          ${!isEquipped?`<button class="btn btn-sm" style="font-size:9px;border-color:var(--b2);color:var(--cyan)"
            onclick="catalogCompareId='${item.id}';renderMoreTab()">Сравнить</button>`:''}
        </div>
      </div>
    </div>`;
  });
  return h;
}

function equipCatalogItem(itemId){
  const item=EQUIPMENT_CATALOG.find(e=>e.id===itemId);
  if(!item) return;
  if(!getEquipUnlocked(item,G)){toast('🔒 Заблокировано: '+getEquipLockReason(item,G),'bad');return;}
  if(item.price>0&&!G.owned_equip?.includes(itemId)){
    if(G.cr<item.price){toast(`💸 Нужно ${fmt(item.price)} кр`,'bad');return;}
    G.cr-=item.price;
    if(!G.owned_equip) G.owned_equip=[];
    G.owned_equip.push(itemId);
  }
  // Determine slot
  const slotMap={hull:'hull',weapon:'weapon',defense:'defense',engine:'engine',specmod:'specmod1',support:'support'};
  const slot=slotMap[item.cat];
  if(slot) G.equip[slot]=itemId;
  G.maxHull=calcMaxHull();
  toast(`✅ ${item.name} установлен!`,'good');hapticN('success');
  renderMoreTab();updateHUD();
}
