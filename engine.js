// ═══════════════════════════════════════
//  engine.js — game loop, time, quests, mining, bots
// ═══════════════════════════════════════
// ── Goods helpers — work for both GOODS (legacy) and MARKET_CATALOG ──
function _goodBase(gId){
  if(globalThis.GOODS && GOODS[gId]) return GOODS[gId].base || 0;
  const it=globalThis.MARKET_BY_ID?.[gId] || (globalThis.MARKET_CATALOG||[]).find(x=>x.id===gId);
  return it?.basePrice || it?.base || 0;
}
function _goodName(gId){
  if(globalThis.GOODS && GOODS[gId]) return GOODS[gId].name || gId;
  const it=globalThis.MARKET_BY_ID?.[gId] || (globalThis.MARKET_CATALOG||[]).find(x=>x.id===gId);
  return it?.name || gId;
}
function _goodIcon(gId){
  if(globalThis.GOODS && GOODS[gId]) return GOODS[gId].icon || '📦';
  const it=globalThis.MARKET_BY_ID?.[gId] || (globalThis.MARKET_CATALOG||[]).find(x=>x.id===gId);
  return it?.icon || '📦';
}

// ── Per-system market goods (seeded deterministic per system + MARKET_CATALOG) ──
const _CAT_MAP_SYS={
  home:    ['basic','industrial','contract'],
  trade:   ['basic','industrial','luxury','contract'],
  paradise:['basic','luxury','science','contract'],
  mining:  ['basic','industrial','regional'],
  science: ['science','industrial','regional','unique'],
  danger:  ['military','regional','unique','contract']
};
const _CAT_TAKE_SYS={basic:8,industrial:6,military:5,science:5,regional:5,unique:3,luxury:4,contract:4};
function _sysHash(str){ let h=0; for(let i=0;i<str.length;i++) h=((h<<5)-h)+str.charCodeAt(i); return Math.abs(h); }
function getSystemMarketGoods(sys){
  if(!sys) return [];
  if(Array.isArray(sys._marketGoods)&&sys._marketGoods.length) return sys._marketGoods;
  const out=[];
  const add=id=>{ if(id&&!out.includes(id)) out.push(id); };
  (sys.goods||[]).forEach(add);
  const cats=_CAT_MAP_SYS[sys.type]||['basic','industrial','regional'];
  const allCat=globalThis.MARKET_CATALOG||[];
  const seed=_sysHash(sys.id);
  cats.forEach((cat,idx)=>{
    const arr=allCat.filter(x=>x.category===cat);
    if(!arr.length) return;
    const count=Math.min(_CAT_TAKE_SYS[cat]||4,arr.length);
    const start=(seed+idx*7)%arr.length;
    for(let i=0;i<count;i++) add(arr[(start+i)%arr.length].id);
  });
  sys._marketGoods=out;
  return out;
}
function _sysGoods(sys){
  if(!sys) return [];
  try{ const r=getSystemMarketGoods(sys); if(r&&r.length) return r; }catch(e){}
  return sys.goods||[];
}


function initPrices(){
  SYSTEMS.forEach(sys=>{
    if(!G.prices[sys.id]) G.prices[sys.id]={};
    if(!G.priceHistory[sys.id]) G.priceHistory[sys.id]={};
    _sysGoods(sys).forEach(gId=>{
      const base=_goodBase(gId);
      if(!G.prices[sys.id][gId])
        G.prices[sys.id][gId]=base>0?Math.round(base*(0.65+Math.random()*0.7)):10;
      if(!G.priceHistory[sys.id][gId]) G.priceHistory[sys.id][gId]=[];
    });
  });
}
// initPrices() called once from ui.js after all scripts loaded

function fluctuatePrices(bigEvent=false){
  SYSTEMS.forEach(sys=>{
    if(!G.prices[sys.id]) G.prices[sys.id]={};
    if(!G.priceHistory[sys.id]) G.priceHistory[sys.id]={};
    _sysGoods(sys).forEach(gId=>{
      const base=_goodBase(gId)||0, cur=G.prices[sys.id][gId]||base;
      if(!base) return;
      let change=(Math.random()-.5)*(bigEvent?0.35:0.12);
      if(sys.type==='mining'&&(gId==='ore'||gId==='minerals')) change-=0.05;
      if(sys.type==='trade'&&(gId==='tech'||gId==='food')) change-=0.04;
      if(sys.type==='danger'&&gId==='weapons') change-=0.06;
      const newP=Math.max(Math.round(base*.3),Math.min(Math.round(base*3),Math.round(cur*(1+change))));
      G.prices[sys.id][gId]=newP;
      if(!G.priceHistory[sys.id][gId]) G.priceHistory[sys.id][gId]=[];
      G.priceHistory[sys.id][gId].push(newP);
      if(G.priceHistory[sys.id][gId].length>5) G.priceHistory[sys.id][gId].shift();
    });
  });
  const numTraders=G.rangers['trader']||0;
  if(numTraders>0){
    for(let i=0;i<numTraders*2;i++){
      const sys=SYSTEMS[Math.floor(Math.random()*SYSTEMS.length)];
      const goods=_sysGoods(sys);
      const good=goods[Math.floor(Math.random()*goods.length)];
      if(!good||!G.prices[sys.id]) continue;
      const base=_goodBase(good)||0, cur=G.prices[sys.id][good]||base;
      if(!base) continue;
      G.prices[sys.id][good]=Math.max(Math.round(base*.3),Math.min(Math.round(base*3),Math.round(cur*(1+(Math.random()-.5)*0.08))));
    }
    G.botActions.unshift(`🤝 Торговцы изменили цены в ${numTraders*2} системах`);
    if(G.botActions.length>10) G.botActions.pop();
  }
}

// ── Calendar Time ──
// 1 tick = 250ms realtime = 2 game minutes
// 30 days/month, 12 months/year
const MONTHS_RU=['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
let gameTimeTick=0;
function advanceTime(){
  gameTimeTick++;
  G.minute+=2;
  if(G.minute>=60){G.minute-=60;G.hour++;}
  if(G.hour>=24){
    G.hour=0;G.day++;
    fluctuatePrices(G.day%7===0);
    if(G.day%7===0) toast('📅 Новая неделя! Цены изменились','warn');
    if(G.day%7===0){ spawnDebris(); } // weekly debris spawn across all systems
    if(G.day%7===0 && typeof fluctuateEquipPrices==='function') fluctuateEquipPrices(); // weekly equip market prices
    if(G.day>30){ G.day=1; G.month++; }
    if(G.month>12){ G.month=1; G.year++; }
    G.era=ERAS[Math.floor(((G.year-2450)*12+(G.month-1))/6)%ERAS.length];
    checkAlienInvasion();
    leagueSeasonTick();
    harvestLandPlots();
  }
}
function timeStr(){
  const mo=MONTHS_RU[(G.month||1)-1]||'Янв';
  return `${G.day} ${mo} ${G.year}, ${String(G.hour).padStart(2,'0')}:${String(G.minute).padStart(2,'0')}`;
}
// Travel time in days for display
function travelDays(sys){
  const cost=calcFuelCost(sys);
  return Math.ceil(cost/8); // ~8 fuel per game-day of travel
}

// ── Quests ──
const QUEST_GEN=[
  {type:'deliver',weight:4},{type:'kill',weight:3},{type:'collect',weight:3},
];
function refreshQuests(){
  G.quests=G.quests.filter(q=>!q.done&&(!q.expires||q.expires>G.day+(G.month-1)*30+(G.year-2450)*360));
  const perSys=2;
  MAYORS.forEach(m=>{
    const existing=G.quests.filter(q=>q.sysId===m.sysId).length;
    if(existing>=perSys) return;
    const roll=Math.random()*10;
    let acc=0,type='deliver';
    for(const t of QUEST_GEN){ acc+=t.weight; if(roll<acc){type=t.type;break;} }
    const reward=Math.round((500+G.lvl*80+Math.random()*500)*(1+gSkill('charm')*0.05));
    const xp=Math.floor(reward/10);const rp=Math.floor(reward/50);
    const absDay=G.day+(G.month-1)*30+(G.year-2450)*360;
    let q={id:`q_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      type,sysId:m.sysId,giver:m.name,giverIcon:m.icon,
      reward,xp,rp,expires:absDay+5,progress:0,accepted:false,done:false};
    if(type==='deliver'){
      const allGoodIds=[...Object.keys(GOODS||{}), ...(globalThis.MARKET_CATALOG||[]).filter(x=>x.questUse!==false).map(x=>x.id)];
      const good=allGoodIds[Math.floor(Math.random()*allGoodIds.length)];
      const dest=SYSTEMS.filter(s=>s.id!==m.sysId)[Math.floor(Math.random()*18)];
      const amt=2+Math.floor(Math.random()*5);
      q.need={good,amt,destSys:dest.id};
      q.title=`Доставить ${_goodName(good)} → ${dest.name}`;
      q.desc=`Возьмите ${amt}× ${_goodName(good)} и доставьте в систему ${dest.name}. Товар нужно продать там.`;
      q.icon='📦';q.color='#00c8ff';
    } else if(type==='kill'){
      const tier=Math.min(PIRATES.length-1,Math.floor(G.lvl/5)+1);
      const count=2+Math.floor(Math.random()*4);
      q.need={tier,count};
      q.title=`Уничтожить ${count} пиратов`;
      q.desc=`Уничтожьте ${count} пиратов уровня ${tier}+`;
      q.icon='⚔️';q.color='#ff3a3a';
    } else {
      const dType=DEBRIS_TYPES[Math.floor(Math.random()*DEBRIS_TYPES.length)];
      q.need={debrisType:dType.id,count:1+Math.floor(Math.random()*3)};
      q.title=`Собрать: ${dType.name}`;
      q.desc=`Соберите ${q.need.count}× ${dType.name} в любой системе`;
      q.icon='💫';q.color='#a855f7';
    }
    G.quests.push(q);
  });
}
function checkQuestProgress(){
  G.quests.forEach(q=>{
    if(q.done||!q.accepted) return;
    // deliver quests complete when you SELL the goods at destination (handled in sellGood)
    // kill/collect quests have manual claim button or auto-complete
  });
}
function completeQuest(q){
  if(q.done) return;
  q.done=true;q.doneDay=G.day;
  G.cr+=q.reward;G.totalCr+=q.reward;G.xp+=q.xp||20;G.rp+=q.rp||5;
  G.completedQ++;
  G.history=G.history||[];
  G.history.unshift({type:'quest',id:q.id,title:q.title,day:G.day,month:G.month,year:G.year,reward:q.reward});
  G.history=G.history.slice(0,100);
  if(Math.random()<0.35){ G.xeno=(G.xeno||0)+1; toast('💎 Найден ксенокристалл','good'); }
  addPoliceRep(G.gal,5);
  addLeagueScore(20);
  toast(`🎉 Задание выполнено! +${fmt(q.reward)} кр`,'good');
  hapticN('success');updateQuestBadge();
}
function acceptQuest(qId){
  const q=G.quests.find(q=>q.id===qId);
  if(!q||q.accepted||q.done) return;
  q.accepted=true;toast('📋 Задание принято!');renderQuests();
}
function claimDeliverQuest(qId){
  const q=G.quests.find(q=>q.id===qId);
  if(!q||q.done||q.type!=='deliver'||!q.accepted) return;
  if(G.sys!==q.need.destSys){toast('Нужно прибыть в систему назначения','bad');return;}
  const have=G.cargo?.[q.need.good]||0;
  if(have<q.need.amt){toast('Недостаточно товара в трюме','bad');return;}
  G.cargo[q.need.good]-=q.need.amt;
  if((G.cargo[q.need.good]||0)<=0){ delete G.cargo[q.need.good]; if(G.cargoCost) delete G.cargoCost[q.need.good]; }
  q.progress=q.need.amt;
  completeQuest(q);
  toast(`📦 Груз сдан: ${_goodName(q.need.good)}`,'good');
  renderQuests(); if(typeof renderTrade==='function' && curScreen==='trade') renderTrade();
}
function claimKillQuest(qId){
  const q=G.quests.find(q=>q.id===qId);
  if(!q||q.done||q.type!=='kill') return;
  if((q.progress||0)<q.need.count){toast('Ещё не выполнено','bad');return;}
  completeQuest(q);renderQuests();
}
function claimCollectQuest(qId){
  const q=G.quests.find(q=>q.id===qId);
  if(!q||q.done||q.type!=='collect') return;
  if((q.progress||0)<q.need.count){toast('Ещё не выполнено','bad');return;}
  completeQuest(q);renderQuests();
}
function updateQuestBadge(){
  const completable=G.quests.filter(q=>q.accepted&&!q.done&&(
    (q.type==='kill'&&(q.progress||0)>=q.need.count)||
    (q.type==='collect'&&(q.progress||0)>=q.need.count)
  )).length;
  const nb=document.getElementById('nb-quest');
  if(!nb) return;
  nb.querySelector('.ni').textContent=completable>0?'🔔':'📋';
}

// ── Debris ──
// Debris is per-system, spawns once per game week, persists until collected or cleared by event
// Structure: {id, sysId, type, name, icon, reward(cr), rp, spawnDay(absDay)}
function _absDay(){ return G.day+(G.month-1)*30+(G.year-2450)*360; }

function spawnDebrisForSystem(sysId){
  if(!G.debrisActive) G.debrisActive=[];
  // Max 2 debris per system
  const sysDebris=G.debrisActive.filter(d=>d.sysId===sysId);
  if(sysDebris.length>=2) return;
  if(Math.random()>0.4) return;
  const d=DEBRIS_TYPES[Math.floor(Math.random()*DEBRIS_TYPES.length)];
  G.debrisActive.push({
    id:`db_${Date.now()}_${Math.random().toString(36).slice(2,5)}`,
    sysId, type:d.id, name:d.name, icon:d.icon,
    reward:d.reward, rp:d.rp,
    spawnDay:_absDay()
  });
}

function spawnDebris(){
  // Called from weekly tick in advanceTime — spawns for ALL systems, not just current
  SYSTEMS.forEach(sys=>{
    spawnDebrisForSystem(sys.id);
  });
}

function forceSpawnDebris(){
  // Instant spawn in current system (for events)
  const d=DEBRIS_TYPES[Math.floor(Math.random()*DEBRIS_TYPES.length)];
  if(!G.debrisActive) G.debrisActive=[];
  G.debrisActive.push({
    id:`db_${Date.now()}_${Math.random().toString(36).slice(2,5)}`,
    sysId:G.sys, type:d.id, name:d.name, icon:d.icon,
    reward:d.reward, rp:d.rp,
    spawnDay:_absDay()
  });
}

function clearDebrisForEvent(reason){
  // Called on war/invasion events — clears some debris
  if(!G.debrisActive) return;
  const before=G.debrisActive.length;
  G.debrisActive=G.debrisActive.filter(()=>Math.random()>0.5);
  if(before>G.debrisActive.length)
    toast(`💥 ${reason} уничтожил часть обломков в секторе`,'warn');
}

function collectDebris(dbId){
  if(!G.debrisActive) return;
  const i=G.debrisActive.findIndex(d=>d.id===dbId);
  if(i<0) return;
  const d=G.debrisActive[i];
  if(d.sysId!==G.sys){toast('✈️ Нужно лететь в эту систему','bad');return;}
  G.debrisActive.splice(i,1);
  G.cr+=d.reward;G.totalCr+=d.reward;G.rp+=d.rp;
  // collect quests progress
  G.quests.forEach(q=>{
    if(!q.done&&q.accepted&&q.type==='collect'&&q.need.debrisType===d.type){
      q.progress=(q.progress||0)+1;
    }
  });
  toast(`${d.icon} +${fmt(d.reward)} кр · +${d.rp} НО`,'good');haptic('medium');renderMoreTab();
}

// ── Bot rangers ──
function tickBotRangers(){
  // Боты не дают прямых кредитов — только НО и прогресс убийств
  // Майнеры дают очень мало (+1 кр/тик за 1 бота — почти ничего)
  const numMiners=G.rangers['miner_b']||0;
  const numHunters=G.rangers['hunter']||0;
  const numScouts=G.rangers['scout']||0;
  const numTraders=G.rangers['trader']||0;
  if(numMiners>0){
    // Очень мало — 1 кр/тик за бота (раньше было 5), смысл — не доход, а дебаффер
    const earn=numMiners*1;G.cr+=earn;G.totalCr+=earn;
    if(Math.random()<0.1) G.botActions.unshift(`⛏️ Боты-майнеры: +${fmt(earn)} кр/тик`);
  }
  if(numHunters>0){
    // Охотники убивают — прогресс заданий, но без наград кредитами
    G.killCount+=numHunters;
    addLeagueScore(numHunters);
    if(Math.random()<0.1) G.botActions.unshift(`🎯 Охотники: +${numHunters} убийств`);
  }
  if(numScouts>0){
    // Разведчики дают НО — это ценно но не ломает экономику
    const rp=numScouts*0.2;G.rp+=rp;
    if(Math.random()<0.1) G.botActions.unshift(`🔭 Разведчики: +${rp.toFixed(1)} НО`);
  }
  if(numTraders>0){
    if(Math.random()<0.05) G.botActions.unshift(`🤝 Торговцы: цены колеблются`);
  }
  if(G.botActions.length>8) G.botActions=G.botActions.slice(0,8);
}

// ── Land Plots ──
function buyLandPlot(sysId,good){
  const sys=SYSTEMS.find(s=>s.id===sysId);
  if(!sys) return;
  const existing=G.landPlots[sysId];
  const level=existing?existing.level:0;
  if(level>=5){toast('Максимальный уровень участка','warn');return;}
  const costs=[50000,200000,500000,1500000,5000000];
  const cost=costs[level];
  if(G.cr<cost){toast(`💸 Нужно ${fmt(cost)} кр`,'bad');return;}
  G.cr-=cost;
  G.landPlots[sysId]={good,level:level+1,lastHarvestDay:G.day+(G.month-1)*30+(G.year-2450)*360};
  addLeagueScore(100);
  toast(`🌱 Участок куплен в ${sys.name} (ур.${level+1})!`,'good');hapticN('success');
  renderMoreTab();updateHUD();
}
function harvestLandPlots(){
  // called once per game-day; plots produce goods passively
  Object.entries(G.landPlots||{}).forEach(([sysId,plot])=>{
    if(!plot) return;
    const produce=plot.level*2; // units per day
    G.cargo[plot.good]=(G.cargo[plot.good]||0)+produce;
    const cargoMax=calcCargoMax();
    if(calcCargoUsed()>cargoMax) G.cargo[plot.good]=Math.max(0,G.cargo[plot.good]-produce);
  });
}

// ── Police ──
function getPoliceRep(gal){ return G.policeRep?.[gal]??0; }
function addPoliceRep(gal,amt){
  if(!G.policeRep) G.policeRep={};
  G.policeRep[gal]=Math.max(-100,Math.min(100,(G.policeRep[gal]||0)+amt));
}

// ── Alien invasions ──
function getAlienRaceDef(raceId){
  return {zorg:{id:'zorg',icon:'🟢',name:'ЗORG'},technoid:{id:'technoid',icon:'🔵',name:'Техноиды'},psi:{id:'psi',icon:'🟣',name:'Пси-разум'}}[raceId]||{id:'zorg',icon:'👽',name:'Пришельцы'};
}
function getAlienBossId(raceId){
  return {zorg:'zorg_behemoth',technoid:'tech_dreadnought',psi:'psi_overmind'}[raceId]||'mothership';
}
function buildAlienWave(sys,raceId){
  const pool=ALIEN_TYPES.filter(a=>a.race===raceId && (a.threat||1)<5 && !['zorg_behemoth','tech_dreadnought','psi_overmind','mothership'].includes(a.id));
  const scouts=pool.filter(a=>(a.threat||1)<=1);
  const elites=pool.filter(a=>(a.threat||1)===2);
  const commanders=pool.filter(a=>(a.threat||1)>=3);
  const pick=arr=>{ const src=arr.length?arr:pool; return src[Math.floor(Math.random()*src.length)].id; };
  const ids=[];
  for(let i=0;i<5+Math.floor(Math.random()*2);i++) ids.push(pick(scouts));
  for(let i=0;i<3;i++) ids.push(pick(elites));
  ids.push(pick(commanders));
  if(Math.random()<0.45) ids.push(pick(commanders));
  return { alienIds:ids, bossId:getAlienBossId(raceId) };
}
function checkAlienInvasion(){
  G.alienInvasion=normalizeAlienInvasion(G.alienInvasion||alienInvasion);
  alienInvasion=G.alienInvasion;
  SYSTEMS.filter(s=>s.type==='danger'||s.gal==='gamma'||s.gal==='chaos'||s.gal==='delta'||s.gal==='omega').forEach(sys=>{
    if(Math.random()<0.04&&!G.alienInvasion){
      const raceId=['zorg','technoid','psi'][Math.floor(Math.random()*3)];
      const race=getAlienRaceDef(raceId);
      const wave=buildAlienWave(sys,raceId);
      G.alienInvasion={sysId:sys.id,race:race.id,raceIcon:race.icon,raceName:race.name,spawnDay:G.day,alienIds:wave.alienIds,bossId:wave.bossId,bossUnlocked:false,bossDefeated:false,progress:0,totalTargets:wave.alienIds.length+1,alienId:wave.alienIds[0]};
      alienInvasion=G.alienInvasion;
      clearDebrisForEvent('Вторжение пришельцев');
      toast(`👾 Вторжение! ${race.icon}${race.name} в ${sys.name}!`,'bad');
    }
  });
}

// ── Mining ──
function onMine(e){
  if(G.energy<=0){toast('⚡ Нет энергии!','bad');hapticN('error');return;}
  const cp=calcClickPower();
  G.energy=Math.max(0,G.energy-1);
  G.cr+=cp;G.totalCr+=cp;G.xp+=cp*.3;G.rp+=calcRpMult()*.03; // тап = прогресс
  addLeagueScore(1);
  spawnFloat(e,`+${fmt(cp)}`);
  haptic('light');
  renderMine();updateHUD();
}
function lvlCheck(){
  const need=xpForLvl(G.lvl);
  if(G.xp>=need&&G.lvl<100){
    G.lvl++;G.xp-=need;G.skillPts=(G.skillPts||0)+1;
    G.maxHull=calcMaxHull();G.hull=G.maxHull;
    toast(`🎉 Уровень ${G.lvl}! +1 очко навыка`,'good');hapticN('success');
    addLeagueScore(50);
  }
}
function buyHelper(id){
  const h=HELPERS.find(x=>x.id===id);
  const owned=G.helpers[id]||0;
  const cost=Math.round(h.cost*Math.pow(h.costM,owned));
  if(G.cr<cost){toast('💸 Мало кредитов','bad');return;}
  G.cr-=cost;G.helpers[id]=(G.helpers[id]||0)+1;
  toast(`${h.icon} Нанят: ${h.name}`,'good');hapticN('success');
  renderMine();updateHUD();
}
function buyShipUpg(id){
  const u=SHIP_UPGRADES.find(x=>x.id===id);
  const lvl=gUpg(id);
  if(lvl>=u.costs.length){toast('Максимальный уровень','warn');return;}
  const cost=u.costs[lvl];
  if(G.cr<cost){toast('💸 Мало кредитов','bad');return;}
  G.cr-=cost;G.upgrades[id]=(G.upgrades[id]||0)+1;
  G.maxHull=calcMaxHull();
  toast(`${u.icon} Улучшено: ${u.name} Ур.${lvl+1}`,'good');hapticN('success');
  renderMine();updateHUD();
}
function spawnFloat(e,text){
  const el=document.createElement('div');el.className='float-num';
  el.textContent=text;
  const rect=document.getElementById('planet-btn').getBoundingClientRect();
  el.style.left=(rect.left+rect.width/2+Math.random()*60-30)+'px';
  el.style.top=(rect.top+Math.random()*40)+'px';
  document.getElementById('sf').appendChild(el);
  setTimeout(()=>el.remove(),900);
}

// ── Captured system income ──
function capturedIncome(){
  if(!G.capturedSystems||!G.capturedSystems.length) return;
  G.capturedSystems.forEach(()=>{ const inc=Math.floor(10*G.lvl);G.cr+=inc;G.totalCr+=inc; });
}

// ── Refueling ──
// Fuel stations available in trade/paradise systems
function refuel(){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  if(!sys||!['trade','paradise','home'].includes(sys.type)){
    toast('⛽ Заправка недоступна здесь','bad');return;
  }
  const needed=Math.max(0,G.maxFuel-G.fuel);
  if(needed<=0){toast('⛽ Бак полон!','warn');return;}
  const fuelPrice=Math.round((G.prices[G.sys]?.fuel||80)*0.6); // 60% of market price
  const totalCost=Math.round(fuelPrice*needed/10); // per 10 units
  if(G.cr<totalCost){toast(`💸 Нужно ${fmt(totalCost)} кр на заправку`,'bad');return;}
  G.cr-=totalCost;G.fuel=G.maxFuel;
  toast(`⛽ Заправлен! -${fmt(totalCost)} кр`,'good');haptic('medium');
  renderMoreTab();updateHUD();
}

// ── Game loop ──
let lastTick=Date.now();
// Migrate missing fields for older saves
if(!G.eventHistory)    G.eventHistory=[];
if(!G.anomalyLog)      G.anomalyLog=[];
if(!G.storyProgress)   G.storyProgress={};
if(!G.anomaliesActive) G.anomaliesActive=[];
if(!G.anomaliesFound)  G.anomaliesFound=0;
if(!G.history)         G.history=[];
if(!G.debrisActive)    G.debrisActive=[];
if(!G.equipPrices)     G.equipPrices={};
function tick(){
  const now=Date.now();
  const dt=(now-lastTick)/1000;lastTick=now;
  // Guard: if G.cr became NaN (e.g. from bad save), reset to 0
  if(!isFinite(G.cr)||isNaN(G.cr)) G.cr=0;
  if(!isFinite(G.totalCr)||isNaN(G.totalCr)) G.totalCr=G.cr;
  const cps=calcCPS();
  if(cps>0&&isFinite(cps)){ 
    G.cr+=cps*dt;G.totalCr+=cps*dt;
    G.xp+=cps*dt*.08;
    G.rp+=calcRpMult()*dt*.005;
  }
  G.maxEnergy=Math.floor(150+G.lvl*3);
  const eRegen=0.5+(gSkill('engineering')*0.05); // faster regen = more fun tapping
  G.energy=Math.min(G.maxEnergy,G.energy+dt*eRegen);
  G.fuel=Math.min(G.maxFuel,G.fuel+dt*0.05);
  if(hasTech('regen'))   G.hull=Math.min(G.maxHull,G.hull+dt*5);
  if(hasTech('fortress'))G.hull=Math.min(G.maxHull,G.hull+dt*3);
  advanceTime();lvlCheck();
  if(!_uiReady) return;
  if(curScreen==='mine') renderMine();
  updateHUD();
}
setInterval(tick,250);
setInterval(()=>{
  if(!_uiReady) return;
  tickBotRangers();
  if(curScreen==='trade') renderTrade();
  if(curScreen==='more')  renderMoreTab();
  if(curScreen==='quest') {checkQuestProgress();renderQuests();}
},1000);
setInterval(()=>{ G.lastSave=Date.now();saveG(); },10000);
setInterval(capturedIncome,5000);

// ═══════════════════════════════════════
//  RANDOM EVENTS
// ═══════════════════════════════════════
function tickRandomEvents(){
  const absDay=G.day+(G.month-1)*30+(G.year-2450)*360;
  // expire old event
  if(G.activeEvent&&G.activeEvent.endsDay<=absDay){
    toast(`📰 Событие завершено: ${G.activeEvent.name}`,'warn');
    G.activeEvent=null;
    if(_uiReady) renderMine();
  }
  // spawn new event (chance per day)
  if(!G.activeEvent&&Math.random()<0.18){
    if(typeof RANDOM_EVENTS==='undefined' || !Array.isArray(RANDOM_EVENTS) || !RANDOM_EVENTS.length) return;
    const ev=RANDOM_EVENTS[Math.floor(Math.random()*RANDOM_EVENTS.length)];
    G.activeEvent={...ev, startDay:absDay, endsDay:absDay+(ev.duration||1)};
    G.eventHistory.unshift({id:ev.id,name:ev.name,day:absDay});
    if(G.eventHistory.length>20) G.eventHistory.pop();
    // instant effects
    if(ev.effect==='teleport'){
      const galSys=SYSTEMS.filter(s=>s.gal===G.gal&&s.id!==G.sys);
      if(galSys.length){ G.sys=galSys[Math.floor(Math.random()*galSys.length)].id; }
      G.activeEvent=null;
    } else if(ev.effect==='spawn_debris'){
      for(let i=0;i<3;i++) forceSpawnDebris();
    } else if(ev.effect==='price_crash'){
      fluctuatePrices(true);
      clearDebrisForEvent('Экономический кризис');
    }
    toast(`${ev.icon} Событие: ${ev.name} — ${ev.desc}`,'warn');
    hapticN('warning');
  }
}

function forceSpawnDebris(){
  const d=DEBRIS_TYPES[Math.floor(Math.random()*DEBRIS_TYPES.length)];
  G.debrisActive.push({id:`db_${Date.now()}_${Math.random()}`,type:d.id,name:d.name,
    icon:d.icon,reward:d.reward,rp:d.rp,expires:Date.now()+d.time*1000});
}

// Get current event effect multiplier
function getEventMult(effect){
  if(!G.activeEvent) return 1;
  const e=G.activeEvent;
  if(e.effect===effect) return e.id==='gold_rush'?3:e.id==='energy_x3'?3:e.id==='fuel_x2'?2:e.id==='police_x2'?2:2;
  return 1;
}
function isEventActive(effect){
  return !!(G.activeEvent&&G.activeEvent.effect===effect);
}

// ═══════════════════════════════════════
//  ANOMALIES
// ═══════════════════════════════════════
let anomalySpawnTimer=0;
function tickAnomalies(){
  anomalySpawnTimer++;
  if(anomalySpawnTimer<120) return; // every 30s
  anomalySpawnTimer=0;
  if((G.anomaliesActive||[]).length>=2) return;
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  if(!sys) return;
  // higher chance in dangerous/science systems
  const baseChance=sys.type==='danger'?0.25:sys.type==='science'?0.2:0.1;
  if(Math.random()>baseChance) return;
  // pick anomaly by rarity
  const roll=Math.random();
  let acc=0;
  if(typeof ANOMALIES==='undefined' || !Array.isArray(ANOMALIES) || !ANOMALIES.length) return;
  for(const a of ANOMALIES){
    acc+=a.rarity;
    if(roll<acc){
      if(!G.anomaliesActive) G.anomaliesActive=[];
      const existing=G.anomaliesActive.find(x=>x.id===a.id);
      if(existing) return;
      G.anomaliesActive.push({...a, sysId:G.sys, foundAt:Date.now()});
      toast(`${a.icon} Аномалия: ${a.name} — ${a.desc}`,'good');
      break;
    }
  }
}

function exploreAnomaly(anomalyId){
  if(!G.anomaliesActive) return;
  const idx=G.anomaliesActive.findIndex(a=>a.id===anomalyId);
  if(idx<0) return;
  const a=G.anomaliesActive[idx];
  if(a.sysId!==G.sys){toast('Аномалия в другой системе','bad');return;}
  // danger check
  if(Math.random()<a.danger){
    const dmg=Math.round(G.maxHull*0.3);
    G.hull=Math.max(1,G.hull-dmg);
    toast(`${a.icon} Опасно! -${dmg} ХП корпуса`,'bad');
    hapticN('error');
  } else {
    // apply rewards
    const r=a.reward||{};
    if(r.cr){G.cr+=r.cr;G.totalCr+=r.cr;}
    if(r.rp) G.rp+=r.rp;
    if(r.energy) G.energy=Math.min(G.maxEnergy,G.energy+r.energy);
    if(r.minerals){G.cargo.minerals=(G.cargo.minerals||0)+r.minerals;}
    if(r.tech){G.cargo.tech=(G.cargo.tech||0)+r.tech;}
    if(r.teleport){
      const galSys=SYSTEMS.filter(s=>s.gal!==G.gal);
      if(galSys.length){ const dest=galSys[Math.floor(Math.random()*galSys.length)]; G.sys=dest.id;G.gal=dest.gal; }
    }
    G.anomaliesFound=(G.anomaliesFound||0)+1;
    addLeagueScore(15);
    const rewardStr=Object.entries(r).filter(([k])=>k!=='teleport').map(([k,v])=>`+${v} ${k}`).join(', ');
    toast(`${a.icon} ${a.name} исследована! ${rewardStr}`,'good');
    hapticN('success');
    G.anomalyLog.unshift({id:a.id,name:a.name,icon:a.icon,reward:r,day:G.day});
    if(G.anomalyLog.length>15) G.anomalyLog.pop();
  }
  G.anomaliesActive.splice(idx,1);
  if(_uiReady) renderMine();
  updateHUD();
}

// ═══════════════════════════════════════
//  STORY CHAINS
// ═══════════════════════════════════════
function getStoryChain(chainId){ return STORY_CHAINS.find(c=>c.id===chainId); }
function getChainProgress(chainId){ return G.storyProgress[chainId]||{step:0,done:false}; }

function startStoryChain(chainId){
  const chain=getStoryChain(chainId);
  if(!chain) return;
  if(G.storyProgress[chainId]?.step>0){toast('Цепочка уже начата','warn');return;}
  G.storyProgress[chainId]={step:1,done:false};
  toast(`📖 Начата цепочка: ${chain.title}`,'good');
  hapticN('success');
  if(_uiReady) renderMoreTab();
}

function claimStoryStep(chainId){
  const chain=getStoryChain(chainId);
  const prog=getChainProgress(chainId);
  if(!chain||prog.done) return;
  const stepIdx=prog.step-1;
  const step=chain.steps[stepIdx];
  if(!step) return;

  // Check completion condition
  let complete=false;
  if(step.type==='arrive'){ complete=(G.sys===step.sys); }
  else if(step.type==='deliver'){
    complete=(G.sys===step.sys&&(G.cargo[step.good]||0)>=step.amt);
    if(complete){ G.cargo[step.good]=Math.max(0,(G.cargo[step.good]||0)-step.amt); }
  } else if(step.type==='kill'){
    complete=(prog.killCount||0)>=step.count;
  }

  if(!complete){ toast(`Условие не выполнено: ${step.desc}`,'bad'); return; }

  // Give reward
  G.cr+=step.reward; G.totalCr+=step.reward; G.xp+=step.xp;
  addLeagueScore(Math.floor(step.xp/5));
  toast(`✅ ${step.title} — +${fmt(step.reward)} кр`,'good');
  hapticN('success');

  // Final step?
  if(step.final){
    prog.done=true;
    G.storyProgress[chainId]=prog;
    // apply final reward
    if(step.finalReward){
      const [type,val]=step.finalReward.split(':');
      if(type==='equip'){
        if(!G.owned_equip.includes(val)) G.owned_equip.push(val);
        toast(`🎁 Получено снаряжение: ${EQUIPMENT.find(e=>e.id===val)?.name||val}`,'gold');
      } else if(type==='credits'){
        const cr=parseInt(val);G.cr+=cr;G.totalCr+=cr;
        toast(`🎁 Финальная награда: +${fmt(cr)} кр`,'gold');
      }
    }
    toast(`🏆 Цепочка завершена: ${chain.title}!`,'gold');
  } else {
    prog.step++;
    prog.killCount=0;
    G.storyProgress[chainId]=prog;
    toast(`📖 Шаг ${prog.step}/${chain.steps.length}: ${chain.steps[prog.step-1]?.title}`,'good');
  }
  if(_uiReady) renderMoreTab();
}

// Track kills for story step
function trackStoryKills(){
  Object.entries(G.storyProgress||{}).forEach(([chainId,prog])=>{
    if(prog.done) return;
    const chain=getStoryChain(chainId);
    const step=chain?.steps[prog.step-1];
    if(step?.type==='kill'){ prog.killCount=(prog.killCount||0)+1; }
  });
}

// ── Plug into advanceTime ──
const _origAdvanceTime=advanceTime;
// patch: call new systems each day
const _patchedTick=tick;

// Inject into daily tick
setInterval(()=>{
  tickAnomalies();
  if(G.day%3===0) tickRandomEvents();
},5000);

// ── Dev: Reset All Progress ──
function resetAllProgress(){
  try{
    localStorage.removeItem('srw_v4');
    localStorage.removeItem('srw_v4_bak');
    localStorage.removeItem('srw_v3');
  }catch(e){}
  location.reload();
}
