// ═══════════════════════════════════════
//  engine.js — game loop, time, quests, mining, bots
// ═══════════════════════════════════════

// ── Prices ──
function initPrices(){
  SYSTEMS.forEach(sys=>{
    if(!G.prices[sys.id]) G.prices[sys.id]={};
    if(!G.priceHistory[sys.id]) G.priceHistory[sys.id]={};
    (sys.goods||[]).forEach(gId=>{
      if(!G.prices[sys.id][gId]){
        G.prices[sys.id][gId]=Math.round(GOODS[gId].base*(0.65+Math.random()*0.7));
      }
      if(!G.priceHistory[sys.id][gId]) G.priceHistory[sys.id][gId]=[];
    });
  });
}

function fluctuatePrices(bigEvent=false){
  SYSTEMS.forEach(sys=>{
    (sys.goods||[]).forEach(gId=>{
      const base=GOODS[gId].base, cur=G.prices[sys.id]?.[gId]||base;
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
      const good=sys.goods[Math.floor(Math.random()*sys.goods.length)];
      if(!good) continue;
      const base=GOODS[good].base, cur=G.prices[sys.id][good]||base;
      G.prices[sys.id][good]=Math.max(Math.round(base*.3),Math.min(Math.round(base*3),Math.round(cur*(1+(Math.random()-.5)*0.08))));
    }
    G.botActions.unshift(`🤝 Торговцы изменили цены в ${numTraders*2} системах`);
    if(G.botActions.length>10) G.botActions.pop();
  }
}

// ── Time ──
let gameTimeTick=0;
function advanceTime(){
  G.minute+=MINS_PER_TICK;
  if(G.minute>=60){G.minute-=60;G.hour++;}
  if(G.hour>=24){
    G.hour=0;G.day++;
    fluctuatePrices(G.day%7===0);
    if(G.day%7===0) toast('📅 Новая неделя! Цены изменились','warn');
    spawnDebris();tickBotRangers();refreshQuests();checkAlienInvasion();
    G.era=ERAS[Math.floor(G.day/30)%ERAS.length];
    // league score decay / season reset
    leagueSeasonTick();
  }
  gameTimeTick++;
}
function timeStr(){
  return `День ${G.day}, ${String(G.hour).padStart(2,'0')}:${String(G.minute).padStart(2,'0')}`;
}

// ── Quests ──
const QUEST_GEN=[
  {type:'deliver',weight:4},{type:'kill',weight:3},{type:'collect',weight:3},
];
function refreshQuests(){
  G.quests=G.quests.filter(q=>!q.done&&(!q.expires||q.expires>G.day));
  const perSys=2;
  MAYORS.forEach(m=>{
    const existing=G.quests.filter(q=>q.sysId===m.sysId).length;
    if(existing>=perSys) return;
    const roll=Math.random()*10;
    let acc=0,type='deliver';
    for(const t of QUEST_GEN){ acc+=t.weight; if(roll<acc){type=t.type;break;} }
    const reward=Math.round((500+G.day*80+Math.random()*500)*(1+gSkill('charm')*0.05));
    const xp=Math.floor(reward/10);const rp=Math.floor(reward/50);
    let q={id:`q_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      type,sysId:m.sysId,giver:m.name,giverIcon:m.icon,
      reward,xp,rp,expires:G.day+5,progress:0,accepted:false,done:false};
    if(type==='deliver'){
      const goods=Object.keys(GOODS);
      const good=goods[Math.floor(Math.random()*goods.length)];
      const dest=SYSTEMS.filter(s=>s.id!==m.sysId)[Math.floor(Math.random()*18)];
      const amt=2+Math.floor(Math.random()*5);
      q.need={good,amt,destSys:dest.id};
      q.title=`Доставить ${GOODS[good].name} в ${dest.name}`;
      q.desc=`Доставьте ${amt}× ${GOODS[good].name} в систему ${dest.name}`;
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
    if(q.type==='deliver'&&q.progress>=(q.need?.amt||1)&&G.sys===q.need?.destSys) completeQuest(q);
  });
}
function completeQuest(q){
  q.done=true;q.doneDay=G.day;
  G.cr+=q.reward;G.totalCr+=q.reward;G.xp+=q.xp||20;G.rp+=q.rp||5;
  G.completedQ++;
  addPoliceRep(G.gal,5);
  addLeagueScore(20);
  toast(`🎉 Задание выполнено! +${fmt(q.reward)} кр`,'good');
  hapticN('success');updateQuestBadge();
}
function acceptCollect(qId){
  const q=G.quests.find(q=>q.id===qId);
  if(!q||q.accepted||q.done) return;
  q.accepted=true;toast('📋 Задание принято!');renderQuests();
}
function claimKillQuest(qId){
  const q=G.quests.find(q=>q.id===qId);
  if(!q||q.done||q.type!=='kill') return;
  if((q.progress||0)<q.need.count){toast('Ещё не выполнено','bad');return;}
  completeQuest(q);renderQuests();
}
function updateQuestBadge(){
  const completable=G.quests.filter(q=>q.accepted&&!q.done&&(
    (q.type==='kill'&&(q.progress||0)>=q.need.count)||
    (q.type==='deliver'&&(q.progress||0)>=q.need.amt&&G.sys===q.need.destSys)
  )).length;
  document.querySelectorAll('[id^="nb-quest"]').forEach(el=>{
    el.querySelector('.ni').textContent=completable>0?'📋✅':'📋';
  });
}

// ── Debris ──
function spawnDebris(){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  const count=2+Math.floor(Math.random()*3);
  for(let i=0;i<count;i++){
    const type=DEBRIS_TYPES[Math.floor(Math.random()*DEBRIS_TYPES.length)];
    const now=Math.floor(Date.now()/1000);
    G.debrisActive.push({id:`db_${now}_${i}`,typeId:type.id,sysId:G.sys,endTime:now+type.time});
  }
}
function collectDebris(dbId){
  const db=G.debrisActive.find(d=>d.id===dbId);
  if(!db||db.sysId!==G.sys){toast('Недоступно','bad');return;}
  const now=Math.floor(Date.now()/1000);
  if(now<db.endTime){toast(`⏳ Ещё ${db.endTime-now}с`,'warn');return;}
  const type=DEBRIS_TYPES.find(t=>t.id===db.typeId);
  G.debrisActive=G.debrisActive.filter(d=>d.id!==dbId);
  Object.entries(type.reward||{}).forEach(([gId,amt])=>{
    G.cargo[gId]=(G.cargo[gId]||0)+amt;
  });
  G.rp+=(type.rp||0)*calcRpMult();
  G.quests.forEach(q=>{
    if(!q.done&&q.accepted&&q.type==='collect'&&q.need.debrisType===db.typeId){
      q.progress=(q.progress||0)+1;
      if(q.progress>=q.need.count) completeQuest(q);
    }
  });
  toast(`💫 Собрано: ${type.name}! +${type.rp} НО`,'good');
  haptic('medium');renderMoreTab();
}

// ── Bot rangers tick ──
function tickBotRangers(){
  const numHunters=G.rangers['pirate_h']||0;
  const numScouts=G.rangers['scout_b']||0;
  if(numHunters>0){
    const kills=Math.floor(numHunters*(0.5+Math.random()));
    G.killCount+=kills;
    G.quests.forEach(q=>{
      if(!q.done&&q.accepted&&q.type==='kill'){
        q.progress=Math.min(q.need.count,(q.progress||0)+kills);
        if(q.progress>=q.need.count) completeQuest(q);
      }
    });
    const earn=kills*300;G.cr+=earn;G.totalCr+=earn;
    addLeagueScore(kills*2);
    G.botActions.unshift(`💀 Охотники убили ${kills} пиратов (+${fmt(earn)} кр)`);
  }
  if(numScouts>0){
    const rp=numScouts*5;G.rp+=rp;
    G.botActions.unshift(`📡 Скауты нашли ${rp} НО`);
  }
  if(G.botActions.length>12) G.botActions=G.botActions.slice(0,12);
}

// ── Mining ──
function onMine(e){
  if(G.energy<=0){toast('⚡ Нет энергии!','bad');return;}
  const cp=calcClickPower();
  G.energy=Math.max(0,G.energy-1);
  G.cr+=cp;G.totalCr+=cp;G.xp+=cp*.1;G.rp+=calcRpMult()*.1;
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
  el.style.top=(rect.top+Math.random()*40-20)+'px';
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),900);
}

// ── Police ──
function getPoliceRep(gal){ return G.policeRep?.[gal]??0; }
function addPoliceRep(gal,amt){
  if(!G.policeRep) G.policeRep={};
  G.policeRep[gal]=Math.max(-100,Math.min(100,(G.policeRep[gal]??0)+amt));
}
function policeCheck(){
  const pol=POLICE_FACTIONS[G.gal];
  if(!pol) return;
  const rep=getPoliceRep(G.gal);
  if(rep<-20){
    const weaponsCargo=G.cargo['weapons']||0;
    if((weaponsCargo>0||rep<-50)&&Math.random()<0.35){
      const fine=Math.round(pol.fine*(1+Math.abs(rep)/100));
      G.cr=Math.max(0,G.cr-fine);
      if(weaponsCargo>0) G.cargo['weapons']=0;
      toast(`👮 ${pol.name} конфисковала груз! -${fmt(fine)} кр`,'bad');
      hapticN('error');
    }
  }
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
  advanceTime();lvlCheck();
  if(curScreen==='mine') renderMine();
  updateHUD();
}
setInterval(tick,250);
setInterval(()=>{
  if(curScreen==='trade') renderTrade();
  if(curScreen==='more')  renderMoreTab();
  if(curScreen==='quest') {checkQuestProgress();renderQuests();}
},1000);
setInterval(()=>{ G.lastSave=Date.now();saveG(); },10000);
setInterval(capturedIncome,5000);
function capturedIncome(){
  if(!G.capturedSystems||!G.capturedSystems.length) return;
  G.capturedSystems.forEach(()=>{ const inc=Math.floor(10*G.lvl);G.cr+=inc;G.totalCr+=inc; });
}
