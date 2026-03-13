// ═══════════════════════════════════════
//  engine.js — game loop, time, quests, mining, bots
// ═══════════════════════════════════════

function initPrices(){
  SYSTEMS.forEach(sys=>{
    if(!G.prices[sys.id]) G.prices[sys.id]={};
    if(!G.priceHistory[sys.id]) G.priceHistory[sys.id]={};
    (sys.goods||[]).forEach(gId=>{
      if(!G.prices[sys.id][gId])
        G.prices[sys.id][gId]=Math.round(GOODS[gId].base*(0.65+Math.random()*0.7));
      if(!G.priceHistory[sys.id][gId]) G.priceHistory[sys.id][gId]=[];
    });
  });
}
initPrices(); // run immediately before tick starts

function fluctuatePrices(bigEvent=false){
  SYSTEMS.forEach(sys=>{
    if(!G.prices[sys.id]) G.prices[sys.id]={};
    if(!G.priceHistory[sys.id]) G.priceHistory[sys.id]={};
    (sys.goods||[]).forEach(gId=>{
      const base=GOODS[gId].base, cur=G.prices[sys.id][gId]||base;
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
      const good=sys.goods?.[Math.floor(Math.random()*sys.goods.length)];
      if(!good||!G.prices[sys.id]) continue;
      const base=GOODS[good].base, cur=G.prices[sys.id][good]||base;
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
    if(G.day>30){ G.day=1; G.month++; }
    if(G.month>12){ G.month=1; G.year++; }
    G.era=ERAS[Math.floor(((G.year-2450)*12+(G.month-1))/6)%ERAS.length];
    checkAlienInvasion();
    leagueSeasonTick();
    harvestLandPlots();
    dailyUpkeep();
    processQuestFailures();
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

function smoothEnemyTier(baseTier=1){
  const allowed=Math.maxLicensedTier();
  const p=calcRangerPower();
  let soft=1;
  if(p>=80) soft=2;
  if(p>=180) soft=3;
  if(p>=320) soft=4;
  if(p>=520) soft=5;
  return Math.max(1, Math.min(Math.min(allowed,soft), baseTier));
}

function absDay(){ return G.day+(G.month-1)*30+(G.year-2450)*360; }
function getDebtLimit(){ return 5000 + G.lvl*2500 + (G.completedQ||0)*3000; }
function pushFinanceLog(msg){
  if(!G.financeLog) G.financeLog=[];
  G.financeLog.unshift(msg);
  if(G.financeLog.length>8) G.financeLog=G.financeLog.slice(0,8);
}
function chargeExpense(amount, reason='расход'){
  amount=Math.max(0,Math.round(amount||0));
  if(!amount) return 0;
  if(G.cr>=amount){ G.cr-=amount; pushFinanceLog(`💸 ${reason}: -${fmt(amount)} кр`); return 0; }
  const debtAdd=amount-G.cr;
  if(G.cr>0) pushFinanceLog(`💸 ${reason}: -${fmt(G.cr)} кр`);
  G.cr=0;
  G.debt=(G.debt||0)+debtAdd;
  pushFinanceLog(`🏦 Долг: +${fmt(debtAdd)} кр (${reason})`);
  toast(`🏦 Не хватило ${fmt(debtAdd)} кр — оформлен долг`,`warn`);
  checkBankruptcy();
  return debtAdd;
}
function repayDebt(amount){
  amount=Math.max(0,Math.round(amount||0));
  if(!amount||!(G.debt>0)||G.cr<=0) return 0;
  const pay=Math.min(amount,G.debt,G.cr);
  G.cr-=pay; G.debt-=pay;
  pushFinanceLog(`🏦 Погашение долга: ${fmt(pay)} кр`);
  if(G.debt<=0){ G.debt=0; toast('✅ Долг погашен','good'); }
  return pay;
}
function autoDebtPayment(){
  if(!(G.debt>0)||G.cr<2000) return;
  const pay=Math.max(50,Math.floor(Math.min(G.debt, G.cr*0.12)));
  repayDebt(pay);
}
function dailyUpkeep(){
  const helperCount=Object.values(G.helpers||{}).reduce((a,b)=>a+(b||0),0);
  const rangerCount=Object.values(G.rangers||{}).reduce((a,b)=>a+(b||0),0);
  const plots=Object.values(G.landPlots||{}).reduce((a,p)=>a+((p&&p.level)||0),0);
  const upkeep=helperCount*12 + rangerCount*22 + plots*35 + Math.max(0,G.lvl-1)*3;
  if(upkeep>0) chargeExpense(upkeep,'обслуживание флота');
}
function processQuestFailures(){
  const nowDay=absDay();
  (G.quests||[]).forEach(q=>{
    if(q.done||q.failed||!q.accepted) return;
    if(q.expires && q.expires<=nowDay){
      q.failed=true; q.failedDay=nowDay;
      G.failedQ=(G.failedQ||0)+1;
      const fine=Math.max(250, Math.round((q.reward||500)*0.35));
      chargeExpense(fine,`штраф за провал задания`);
      addPoliceRep(G.gal,-6);
      addHonor(-8);
      addInfluence(q.sysId ? (SYSTEMS.find(s=>s.id===q.sysId)?.gal||G.gal) : G.gal, -10);
      addLeagueScore(-10);
      toast(`📉 Задание провалено: ${q.title}`,'bad');
    }
  });
}
function seizeForBankruptcy(){
  let seized=[];
  const cargoKeys=Object.keys(G.cargo||{}).filter(k=>(G.cargo[k]||0)>0);
  if(cargoKeys.length){
    const key=cargoKeys.sort((a,b)=>(GOODS[b]?.base||0)-(GOODS[a]?.base||0))[0];
    const qty=Math.max(1,Math.ceil((G.cargo[key]||0)*0.5));
    G.cargo[key]=Math.max(0,(G.cargo[key]||0)-qty);
    if(G.cargo[key]<=0){ delete G.cargo[key]; if(G.cargoCost) delete G.cargoCost[key]; }
    seized.push(`${GOODS[key]?.name||key} ×${qty}`);
  }
  const helperKeys=Object.keys(G.helpers||{}).filter(k=>(G.helpers[k]||0)>0);
  if(helperKeys.length){
    const hk=helperKeys[0]; G.helpers[hk]--; if(G.helpers[hk]<=0) delete G.helpers[hk];
    seized.push(`помощник ${HELPERS.find(h=>h.id===hk)?.name||hk}`);
  }
  const rangerKeys=Object.keys(G.rangers||{}).filter(k=>(G.rangers[k]||0)>0);
  if(rangerKeys.length){
    const rk=rangerKeys[0]; G.rangers[rk]--; if(G.rangers[rk]<=0) delete G.rangers[rk];
    seized.push(`рейнджер ${RANGER_BOTS.find(r=>r.id===rk)?.name||rk}`);
  }
  return seized;
}
function checkBankruptcy(){
  const lim=getDebtLimit();
  if((G.debt||0) < lim) return false;
  const seized=seizeForBankruptcy();
  G.bankruptcies=(G.bankruptcies||0)+1;
  G.debt=Math.round(lim*0.45);
  G.fuel=Math.max(12,Math.round(G.maxFuel*0.25));
  G.hull=Math.max(15,Math.round(G.maxHull*0.35));
  addPoliceRep(G.gal,-12); addHonor(-15); addInfluence(G.gal,-18);
  pushFinanceLog(`⚠️ Процедура разорения #${G.bankruptcies}`);
  toast(`💥 Разорение! Имущество изъято${seized.length?': '+seized.join(', '):''}`,'bad');
  return true;
}
function payDebtAll(){
  const paid=repayDebt(G.debt||0);
  if(curScreen==='more') renderMoreTab();
  if(curScreen==='mine') renderMine();
  updateHUD();
  return paid;
}

// ── Quests ──
const QUEST_GEN=[
  {type:'deliver',weight:4},{type:'kill',weight:3},{type:'collect',weight:3},
];
function refreshQuests(){
  G.quests=G.quests.filter(q=>!q.done&&!q.failed&&(!q.expires||q.expires>absDay()));
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
      const goods=Object.keys(GOODS);
      const good=goods[Math.floor(Math.random()*goods.length)];
      const dest=SYSTEMS.filter(s=>s.id!==m.sysId)[Math.floor(Math.random()*18)];
      const amt=2+Math.floor(Math.random()*5);
      q.need={good,amt,destSys:dest.id};
      q.title=`Доставить ${GOODS[good].name} → ${dest.name}`;
      q.desc=`Возьмите ${amt}× ${GOODS[good].name} и доставьте в систему ${dest.name}. Сдача выполняется вручную в журнале заданий.`;
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
  G.completedQ++; addHonor(3); addInfluence(SYSTEMS.find(s=>s.id===q.sysId)?.gal||G.gal, 6); addClassXP('quest', Math.max(20, Math.round((q.reward||0)/40))); unlockEligibleLicenses();
  if(Math.random()<0.25){ G.cargo.xeno=(G.cargo.xeno||0)+1; pushFinanceLog('🧪 Получен ксенокристалл за контракт'); }
  if(q.type==='deliver'&&q.need?.good){
    const have=G.cargo[q.need.good]||0;
    const remove=Math.min(have,q.need.amt||0);
    if(remove>0){
      G.cargo[q.need.good]-=remove;
      if(G.cargo[q.need.good]<=0){ delete G.cargo[q.need.good]; if(G.cargoCost) delete G.cargoCost[q.need.good]; }
    }
  }
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
function acceptCollect(qId){ return acceptQuest(qId); }
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

function claimDeliverQuest(qId){
  const q=G.quests.find(q=>q.id===qId);
  if(!q||q.done||q.type!=='deliver') return;
  if(G.sys!==q.need.destSys){toast('Сдать груз можно только в системе назначения','bad');return;}
  const have=G.cargo[q.need.good]||0;
  const delivered=Math.min(have,q.need.amt||0);
  if(delivered<(q.need.amt||0)){toast('Недостаточно груза для сдачи','bad');return;}
  q.progress=q.need.amt;
  completeQuest(q);renderQuests();updateHUD();
}
function updateQuestBadge(){
  const completable=G.quests.filter(q=>q.accepted&&!q.done&&(
    (q.type==='kill'&&(q.progress||0)>=q.need.count)||
    (q.type==='collect'&&(q.progress||0)>=q.need.count)||
    (q.type==='deliver'&&G.sys===q.need.destSys&&(G.cargo[q.need.good]||0)>=(q.need.amt||0))
  )).length;
  const nb=document.getElementById('nb-quest');
  if(!nb) return;
  nb.querySelector('.ni').textContent=completable>0?'🔔':'📋';
}

// ── Debris ──
function spawnDebris(){
  if(G.debrisActive.length>=3) return;
  if(Math.random()>0.3) return;
  const d=DEBRIS_TYPES[Math.floor(Math.random()*DEBRIS_TYPES.length)];
  G.debrisActive.push({id:`db_${Date.now()}`,type:d.id,name:d.name,icon:d.icon,
    reward:d.reward,rp:d.rp,expires:Date.now()+d.time*1000});
}
function collectDebris(dbId){
  const i=G.debrisActive.findIndex(d=>d.id===dbId);
  if(i<0) return;
  const d=G.debrisActive[i];
  if(Date.now()>d.expires){G.debrisActive.splice(i,1);renderMoreTab();return;}
  G.debrisActive.splice(i,1);
  G.cr+=d.reward;G.totalCr+=d.reward;G.rp+=d.rp;
  // collect quests progress
  G.quests.forEach(q=>{
    if(!q.done&&q.accepted&&q.type==='collect'&&q.need.debrisType===d.type){
      q.progress=Math.min(q.need.count,(q.progress||0)+1);
    }
  });
  toast(`${d.icon} +${fmt(d.reward)} кр`,'good');haptic('medium');renderMoreTab();
}

// ── Bot rangers ──
function tickBotRangers(){
  const numMiners=G.rangers['miner_b']||0;
  const numTraders=G.rangers['trader']||0;
  const numHunters=G.rangers['hunter']||0;
  const numScouts=G.rangers['scout']||0;
  if(numMiners>0){
    const earn=numMiners*5;G.cr+=earn;G.totalCr+=earn;
    G.botActions.unshift(`⛏️ Майнеры добыли +${fmt(earn)} кр`);
  }
  if(numHunters>0){
    const kills=numHunters;G.killCount+=kills;
    addLeagueScore(kills*2);
    G.botActions.unshift(`🎯 Охотники убили ${kills} пиратов`);
  }
  if(numScouts>0){
    G.rp+=numScouts*0.5;
    G.botActions.unshift(`🔭 Разведчики +${(numScouts*0.5).toFixed(1)} НО`);
  }
  if(G.botActions.length>10) G.botActions=G.botActions.slice(0,10);
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
  const map={zorg:{icon:'🟢',name:'ЗORG'},technoid:{icon:'🔵',name:'Техноиды'},psi:{icon:'🟣',name:'Пси-разум'}};
  return map[raceId]||{icon:'👽',name:'Пришельцы'};
}
function buildAlienWave(sys,raceId){
  const pool=ALIEN_TYPES.filter(a=>a.race===raceId && a.id!=='mothership');
  const count=8+Math.floor(Math.random()*3);
  const galFactor=Math.max(0, GALAXIES.findIndex(g=>g.id===sys.gal));
  const maxThreat=Math.min(4, 2+Math.floor(G.lvl/18)+Math.floor(galFactor/2));
  const wave=[];
  for(let i=0;i<count;i++) {
    const filtered=pool.filter(a=>(a.threat||1)<=maxThreat + (i>count-3?1:0));
    const choice=(filtered.length?filtered:pool)[Math.floor(Math.random()*(filtered.length?filtered:pool).length)];
    wave.push(choice.id);
  }
  if(count>=9 && Math.random()<0.45) wave[count-1]='mothership';
  return wave;
}
function normalizeAlienInvasion(inv){
  if(!inv) return null;
  if(!inv.race){
    const base=ALIEN_TYPES.find(a=>a.id===inv.alienId)||ALIEN_TYPES.find(a=>a.id===inv.alienIds?.[0]);
    inv.race=base?.race||'zorg';
  }
  const raceDef=getAlienRaceDef(inv.race);
  inv.raceIcon=inv.raceIcon||raceDef.icon;
  inv.raceName=inv.raceName||raceDef.name;
  if(!Array.isArray(inv.alienIds) || !inv.alienIds.length){
    inv.alienIds=[inv.alienId||ALIEN_TYPES.find(a=>a.race===inv.race)?.id||'zorg_scout'];
  }
  inv.alienId=inv.alienId||inv.alienIds[0];
  return inv;
}
function checkAlienInvasion(){
  G.alienInvasion=normalizeAlienInvasion(G.alienInvasion);
  SYSTEMS.filter(s=>s.type==='danger'||s.gal==='gamma'||s.gal==='chaos'||s.gal==='delta'||s.gal==='omega').forEach(sys=>{
    if(Math.random()<0.04&&!G.alienInvasion){
      const raceId=['zorg','technoid','psi'][Math.floor(Math.random()*3)];
      const race=getAlienRaceDef(raceId);
      const alienIds=buildAlienWave(sys,raceId);
      G.alienInvasion={sysId:sys.id,race:raceId,raceIcon:race.icon,raceName:race.name,spawnDay:G.day,alienIds,alienId:alienIds[0]};
      toast(`👾 Вторжение! ${race.icon}${race.name} в ${sys.name}!`,'bad');
    }
  });
}

// ── Mining ──
function onMine(e){
  if(G.energy<=0){toast('⚡ Нет энергии!','bad');hapticN('error');return;}
  const cp=calcClickPower();
  G.energy=Math.max(0,G.energy-1);
  G.cr+=cp;G.totalCr+=cp;G.xp+=cp*.1;G.rp+=calcRpMult()*.1;
  addClassXP('science',1);
  addLeagueScore(1);
  spawnFloat(e,`+${fmt(cp)}`);
  haptic('light');
  renderMine();updateHUD();
}
function lvlCheck(){
  const need=xpForLvl(G.lvl);
  if(G.xp>=need&&G.lvl<100){
    G.lvl++;G.xp-=need;G.skillPts=(G.skillPts||0)+1;
    G.maxHull=calcMaxHull();G.hull=G.maxHull; unlockEligibleLicenses();
    toast(`🎉 Уровень ${G.lvl}! +1 очко навыка`,'good');hapticN('success');
    addLeagueScore(50);
  }
}
function buyHelper(id){
  const h=HELPERS.find(x=>x.id===id);
  const owned=G.helpers[id]||0;
  const cost=Math.round(h.cost*Math.pow(h.costM,owned));
  const crystalNeed=id==='miner' ? (2+owned) : 0;
  if(G.cr<cost){toast('💸 Мало кредитов','bad');return;}
  if(crystalNeed>0 && (G.cargo.xeno||0)<crystalNeed){toast(`Нужно ${crystalNeed} ксенокристаллов`,'bad');return;}
  G.cr-=cost;
  if(crystalNeed>0){ G.cargo.xeno=(G.cargo.xeno||0)-crystalNeed; if(G.cargo.xeno<=0) delete G.cargo.xeno; }
  G.helpers[id]=(G.helpers[id]||0)+1; addClassXP('science', Math.max(8, owned+4));
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
  G.maxHull=calcMaxHull(); addClassXP('science', 6+lvl*2);
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

function getNearestRescueSystem(){
  const cur=SYSTEMS.find(s=>s.id===G.sys);
  const sameGalSafe=SYSTEMS.filter(s=>s.gal===G.gal && ['home','trade','paradise','science'].includes(s.type));
  if(sameGalSafe.length) return sameGalSafe[0];
  return SYSTEMS.find(s=>s.type==='home')||cur||SYSTEMS[0];
}
function handleShipDestroyed(){
  G.shipLosses=(G.shipLosses||0)+1;
  addHonor(-4);
  addInfluence(G.gal,-5);
  const rescue=getNearestRescueSystem();
  const penalty=Math.max(700,Math.floor((G.cr+((G.debt||0)*0.15))*0.22));
  chargeExpense(penalty,'страховой ремонт после уничтожения');
  const cargoEntries=Object.entries(G.cargo||{}).filter(([,amt])=>amt>0);
  let cargoMsg='';
  if(cargoEntries.length){
    const [gId,amt]=cargoEntries[Math.floor(Math.random()*cargoEntries.length)];
    const lost=Math.max(1,Math.ceil(amt*0.5));
    G.cargo[gId]=Math.max(0,amt-lost);
    if(G.cargo[gId]<=0) delete G.cargo[gId];
    if(G.cargoCost && !G.cargo[gId]) delete G.cargoCost[gId];
    cargoMsg=` Потеряно ${lost} ед. ${GOODS[gId]?.name||gId}.`;
  }
  G.sys=rescue.id;
  G.gal=rescue.gal;
  G.hull=Math.max(1,Math.round(G.maxHull*0.2));
  G.energy=Math.max(5,Math.round(G.maxEnergy*0.35));
  G.fuel=Math.max(10,Math.round(G.maxFuel*0.15));
  G.combat=null;
  G.combatLog=[`🚑 Спасательная капсула доставила вас на ${rescue.name}.`,`🔧 Аварийный ремонт завершён.`,`💸 Страховые удержания: ${fmt(penalty)} кр.${cargoMsg}`];
  toast(`💀 Корабль уничтожен. Эвакуация на ${rescue.name}`,'bad');
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
function tick(){
  const now=Date.now();
  const dt=(now-lastTick)/1000;lastTick=now;
  const cps=calcCPS();
  if(cps>0){ G.cr+=cps*dt;G.totalCr+=cps*dt;G.xp+=cps*dt*.04;G.rp+=calcRpMult()*dt*.03; }
  G.maxEnergy=Math.floor(50+G.lvl*5);
  const eRegen=0.18+(gSkill('engineering')*0.02);
  G.energy=Math.min(G.maxEnergy,G.energy+dt*eRegen);
  G.fuel=Math.min(G.maxFuel,G.fuel+dt*0.05);
  if(hasTech('regen'))   G.hull=Math.min(G.maxHull,G.hull+dt*5);
  if(hasTech('fortress'))G.hull=Math.min(G.maxHull,G.hull+dt*3);
  advanceTime();autoDebtPayment();lvlCheck();
  if(!_uiReady) return;
  if(curScreen==='mine') renderMine();
  updateHUD();
}
setInterval(tick,250);
setInterval(()=>{
  if(!_uiReady) return;
  spawnDebris();tickBotRangers();
  if(curScreen==='trade') renderTrade();
  if(curScreen==='more')  renderMoreTab();
  if(curScreen==='quest') {checkQuestProgress();renderQuests();}
},1000);
setInterval(()=>{ G.lastSave=Date.now();saveG(); },10000);
setInterval(capturedIncome,5000);
