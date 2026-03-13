// ═══════════════════════════════════════
//  ui.js — render, HUD, navigation
// ═══════════════════════════════════════

// ── Toast ──
let _tt;
function toast(msg,type=''){
  const t=document.getElementById('toast');
  t.className='toast show '+(type||'');t.textContent=msg;
  clearTimeout(_tt);_tt=setTimeout(()=>t.classList.remove('show'),3000);
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

// ── Screen nav ──
let curScreen='mine';
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

// ── Haptics ──
const tg=window.Telegram?.WebApp;
function haptic(t='light'){if(tg?.HapticFeedback)tg.HapticFeedback.impactOccurred(t);}
function hapticN(t='success'){if(tg?.HapticFeedback)tg.HapticFeedback.notificationOccurred(t);}

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
  let h=`<div class="bar-row"><div class="bar-hd"><span>📦 Трюм</span><span>${used}/${G.cargoMax}</span></div>
    <div class="bar-tr"><div class="bar-f" style="width:${used/G.cargoMax*100}%;background:linear-gradient(90deg,var(--amber),var(--gold))"></div></div></div>`;
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
          ${sell?`<button class="btn btn-sm btn-r" onclick="sellGood('${gId}',1)">×1</button>
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
      <div class="qc-desc">${q.desc}</div>
      ${q.accepted?`<div class="qc-prog">Прогресс: ${prog}/${total}</div>
        <div class="bar-tr" style="margin-bottom:8px"><div class="bar-f bf-xp" style="width:${Math.min(100,prog/total*100)}%"></div></div>`:''}
      <div class="qc-reward">🏆 ${fmt(q.reward)} кр · +${q.xp} XP · +${q.rp} НО</div>
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

function setMoreTab(t,btn){
  document.querySelectorAll('.sc-more .tc-btn').forEach(b=>b.classList.remove('on'));
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
  if(moreTab==='combat')  { scr.innerHTML=renderCombatHTML(); }
  else if(moreTab==='tech')    { scr.innerHTML=renderTechHTML(); }
  else if(moreTab==='skills')  { scr.innerHTML=renderSkillsHTML(); }
  else if(moreTab==='market')  { scr.innerHTML=renderMarketHTML(); }
  else if(moreTab==='rangers') { scr.innerHTML=renderRangersHTML(); }
  else if(moreTab==='debris')  { scr.innerHTML=renderDebrisHTML(); }
  else if(moreTab==='online')  { renderOnlineRangers(); return; } // async
  else if(moreTab==='police')  { scr.innerHTML=renderPoliceHTML(); }
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
  h+=`<div style="font-size:10px;color:var(--muted2);padding:8px">
    +2 репутации за пирата · +5 за задание · +20 за пришельца<br>
    -30 за захват системы · Взятка: +25 репутации
  </div>`;
  return h;
}

// ── Trade actions ──
function buyGood(gId){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  const price=G.prices[sys.id]?.[gId];
  if(!price){toast('Нет товара','bad');return;}
  const realP=Math.round(price*(1-gSkill('eloquence')*.02));
  if(G.cr<realP){toast('💸 Мало кредитов','bad');return;}
  G.cargoMax=calcCargoMax();
  if(calcCargoUsed()>=G.cargoMax){toast('📦 Трюм полон!','bad');return;}
  G.cr-=realP; G.cargo[gId]=(G.cargo[gId]||0)+1;
  haptic('light');renderTrade();updateHUD();
}
function buyGoodMax(gId){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  const price=G.prices[sys.id]?.[gId];if(!price) return;
  const realP=Math.round(price*(1-gSkill('eloquence')*.02));
  let bought=0;G.cargoMax=calcCargoMax();
  while(G.cr>=realP&&calcCargoUsed()<G.cargoMax){G.cr-=realP;G.cargo[gId]=(G.cargo[gId]||0)+1;bought++;}
  if(bought) toast(`📦 ×${bought}`,'good');
  haptic('medium');renderTrade();updateHUD();
}
function sellGood(gId,amt){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  const price=G.prices[sys.id]?.[gId];if(!price){toast('Нет спроса','bad');return;}
  const toSell=Math.min(amt,G.cargo[gId]||0);if(!toSell) return;
  const earn=Math.round(price*.9*toSell*(1+gSkill('trade')*.03));
  G.cr+=earn;G.totalCr+=earn;
  G.cargo[gId]=(G.cargo[gId]||0)-toSell;
  G.quests.forEach(q=>{
    if(!q.done&&q.accepted&&q.type==='deliver'&&q.need.good===gId&&q.need.destSys===G.sys){
      q.progress=(q.progress||0)+toSell;
      if(q.progress>=q.need.amt) completeQuest(q);
    }
  });
  toast(`💰 +${fmt(earn)} кр`,'good');haptic('medium');renderTrade();updateHUD();
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
if(!G.playerName) showNameScreen();
else {updateHUD();renderMine();refreshQuests();}
