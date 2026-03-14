// ═══════════════════════════════════════
//  engine.js — game loop, time, quests, mining, bots
// ═══════════════════════════════════════


// ── Market helpers (Stage 2) ─────────────────────────────────────────────
function getAllMarketGoods(){
  if(typeof MARKET_CATALOG!=='undefined' && Array.isArray(MARKET_CATALOG) && MARKET_CATALOG.length){
    return MARKET_CATALOG;
  }
  return Object.entries(typeof GOODS!=='undefined' ? GOODS : {}).map(([id,def])=>({
    id,
    name:def.name,
    basePrice:def.base,
    category:'basic',
    rarity:'common',
    volume:1,
    illegal:false,
    icon:def.icon,
  }));
}

function getMarketItem(id){
  if(typeof MARKET_BY_ID!=='undefined' && MARKET_BY_ID && MARKET_BY_ID[id]) return MARKET_BY_ID[id];
  if(typeof GOODS!=='undefined' && GOODS[id]){
    return {
      id,
      name:GOODS[id].name,
      basePrice:GOODS[id].base,
      category:'basic',
      rarity:'common',
      volume:1,
      illegal:false,
      icon:GOODS[id].icon,
    };
  }
  return null;
}

function getGoodBasePrice(id){
  const item=getMarketItem(id);
  return item ? Number(item.basePrice||item.base||0) : 0;
}
function getGoodName(id){ return getMarketItem(id)?.name || id; }
function getGoodIcon(id){ return getMarketItem(id)?.icon || (typeof GOODS!=='undefined'&&GOODS[id]?GOODS[id].icon:'📦'); }

function getCareerProfile(){
  return (typeof CAREER_PATHS!=='undefined' && CAREER_PATHS[G.career]) ? CAREER_PATHS[G.career] : (CAREER_PATHS?.trader || {id:'trader',name:'Торговец'});
}
function getCareerLevel(){ return Math.max(1, 1 + Math.floor((G.careerXP||0)/120)); }
function addCareerXP(amount){ G.careerXP=(G.careerXP||0)+Math.max(0, amount|0); }
function addInfluence(amount){ G.influence=Math.max(-50, (G.influence||0)+(amount||0)); }
function addHonor(amount){ G.honor=Math.max(-50, (G.honor||0)+(amount||0)); }
function hasLicense(id){ return !!(G.licenses && G.licenses[id]); }
function getLicenseDef(id){ return (typeof MARKET_LICENSES!=='undefined' && MARKET_LICENSES[id]) || null; }
function canBuyLicense(id){
  const def=getLicenseDef(id); if(!def) return {ok:false, reason:'Нет лицензии'};
  if(hasLicense(id)) return {ok:false, reason:'Уже есть'};
  if((G.lvl||1) < (def.minLvl||1)) return {ok:false, reason:`Нужен ур. ${def.minLvl}`};
  if((G.honor||0) < (def.minHonor||0)) return {ok:false, reason:`Нужна честь ${def.minHonor}`};
  if((G.influence||0) < (def.minInfluence||0)) return {ok:false, reason:`Нужно влияние ${def.minInfluence}`};
  if((def.requires||[]).some(req=>!hasLicense(req))) return {ok:false, reason:`Нужна ${(def.requires||[]).filter(req=>!hasLicense(req)).join(', ')}`};
  if((G.cr||0) < (def.cost||0)) return {ok:false, reason:'Недостаточно кредитов'};
  return {ok:true, reason:''};
}
function getLicenseReason(item){
  if(!item?.licenseRequired) return '';
  if(hasLicense(item.licenseRequired)) return '';
  const def=getLicenseDef(item.licenseRequired);
  return def ? `${def.icon} ${def.name}` : `Лицензия ${item.licenseRequired}`;
}
function getAbsDay(){ return (G.day||1) + ((G.month||1)-1)*30 + ((G.year||2450)-2450)*360; }
function pushHistory(kind, title, details=''){
  if(!Array.isArray(G.historyLog)) G.historyLog=[];
  const iconMap={
    trade:'💱', sale:'🛒', travel:'🛰️', quest:'📋', debt:'🏦', bankruptcy:'⚠️',
    license:'📜', career:'🧭', ability:'✨', base:'🏗️', invasion:'🛡️', story:'📖'
  };
  G.historyLog.unshift({
    id:`hist_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
    kind, icon:iconMap[kind]||'•', title, details,
    day:G.day, month:G.month, year:G.year, hour:G.hour, minute:G.minute,
    system:G.sys, galaxy:G.gal,
  });
  G.historyLog = G.historyLog.slice(0, 120);
}
function getCareerAbility(){ return getCareerProfile()?.ability || null; }
function getCareerCooldownLeft(){
  const ab=getCareerAbility(); if(!ab) return 0;
  const readyDay=(G.careerCooldowns||{})[ab.id]||0;
  return Math.max(0, readyDay - getAbsDay());
}
function useCareerAbility(){
  const ab=getCareerAbility();
  if(!ab){ toast('Способность недоступна','bad'); return; }
  const left=getCareerCooldownLeft();
  if(left>0){ toast(`Перезарядка: ${left} дн.`, 'warn'); return; }
  const nowDay=getAbsDay();
  if(!G.careerCooldowns) G.careerCooldowns={};
  G.careerCooldowns[ab.id]=nowDay+(ab.cooldownDays||3);
  if(!G.tempBuffs) G.tempBuffs={};
  if(G.career==='trader'){
    G.tempBuffs.marketBoostUntil=nowDay+2;
    toast('📈 Рынок на вашей стороне 2 дня','good');
    pushHistory('ability','Активирована способность торговца','На 2 дня улучшены цены покупки и продажи.');
  }else if(G.career==='hunter'){
    G.tempBuffs.battleBoostUntil=nowDay+2;
    G.missiles=Math.min((G.maxMissiles||3)+2, (G.missiles||0)+2);
    toast('🎯 Боевой протокол активен','good');
    pushHistory('ability','Активирована способность охотника','Выданы ракеты и боевой буст на 2 дня.');
  }else if(G.career==='scientist'){
    const rp=40+getCareerLevel()*8;
    G.rp+=rp;
    G.tempBuffs.scanBoostUntil=nowDay+2;
    toast(`🧪 Глубокое сканирование: +${fmt(rp)} НО`,'good');
    pushHistory('ability','Активирована способность исследователя',`Получено ${fmt(rp)} НО и бафф сканирования.`);
  }else if(G.career==='commander'){
    addInfluence(8+getCareerLevel());
    addHonor(3);
    G.tempBuffs.commandBoostUntil=nowDay+2;
    toast('🛰️ Союзники получили приказ и усилили сектор','good');
    pushHistory('ability','Активирована способность командора','Усилено влияние и командный отклик.');
  }
  renderMoreTab?.(); updateHUD?.();
}

function calcCargoMarketValue(){
  const sys=getSystemById(G.sys);
  const pIdx=getCurrentPlanetIndex(G.sys);
  return Object.entries(G.cargo||{}).reduce((sum,[gId,qty])=>sum + getPlanetSalePrice(sys.id, pIdx, gId) * (qty||0), 0);
}

function calcNetWorth(){
  const credits=G.cr||0;
  const cargo=calcCargoMarketValue();
  const baseLevel=getBaseLevel?.()||0;
  const baseModules=(G.base && G.base.modules) ? Object.values(G.base.modules).reduce((a,b)=>a+(b||0),0) : 0;
  const baseValue=(baseLevel*2500)+(baseModules*1800);
  const equipValue=(Array.isArray(G.owned_equip)?G.owned_equip:[]).reduce((sum,id)=>{
    const item=(typeof getEquipCatalog==='function'?getEquipCatalog().find(x=>x.id===id):null);
    return sum + Number(item?.cost||0);
  },0);
  const debt=Math.ceil(G.debt||0);
  return Math.max(0, Math.round(credits + cargo + baseValue + equipValue - debt));
}

function getEconomySnapshot(){
  const deals=G.tradeStats?.marketDeals||0;
  const profit=G.tradeStats?.profit||0;
  const loss=G.tradeStats?.loss||0;
  const soldUnits=G.tradeStats?.soldUnits||0;
  const avgMargin = soldUnits>0 ? Math.round((profit-loss)/soldUnits) : 0;
  const debt=Math.ceil(G.debt||0);
  const dueIn=debt>0 ? Math.max(0,(G.debtDueDay||0)-getAbsDay()) : 0;
  const invasion=G.alienInvasion ? `${G.alienInvasion.systemId||G.sys} · волна ${G.alienInvasion.wave}/${G.alienInvasion.maxWave}` : 'нет';
  const riskFlags=[];
  if(debt>0 && dueIn<=3) riskFlags.push('Скоро платёж по долгу');
  if((G.honor||0)<0) riskFlags.push('Низкая честь ухудшает рынок');
  if((G.influence||0)<0) riskFlags.push('Отрицательное влияние режет контракты');
  if(G.alienInvasion) riskFlags.push('Идёт вторжение');
  if((calcCargoUsed?.()||0) >= (calcCargoMax?.()||0)) riskFlags.push('Трюм заполнен');
  return {
    netWorth: calcNetWorth(),
    cargoValue: calcCargoMarketValue(),
    deals, profit, loss, soldUnits, avgMargin,
    debt, dueIn,
    influence:G.influence||0,
    honor:G.honor||0,
    baseIncome:(getBaseLevel?.()||0)*15 + ((G.landPlots&&Object.values(G.landPlots).reduce((a,p)=>a+((p?.level||0)*5),0))||0),
    invasion,
    riskFlags,
  };
}

function getTempBuffMult(kind){
  const nowDay=getAbsDay();
  if(kind==='buy' && (G.tempBuffs?.marketBoostUntil||0) >= nowDay) return 0.94;
  if(kind==='sell' && (G.tempBuffs?.marketBoostUntil||0) >= nowDay) return 1.08;
  if(kind==='combatAtk' && (G.tempBuffs?.battleBoostUntil||0) >= nowDay) return 1.18;
  if(kind==='combatDef' && (G.tempBuffs?.battleBoostUntil||0) >= nowDay) return 1.12;
  if(kind==='rp' && (G.tempBuffs?.scanBoostUntil||0) >= nowDay) return 1.25;
  if(kind==='influence' && (G.tempBuffs?.commandBoostUntil||0) >= nowDay) return 1.35;
  return 1;
}
function getBaseLevel(){ return Math.max(0, G.base?.level||0); }
function getBaseModuleLevel(id){ return Math.max(0, G.base?.modules?.[id]||0); }
function getBaseUpgradeCost(id){
  const def=BASE_UPGRADES?.[id]; if(!def) return 0;
  const lvl=getBaseModuleLevel(id);
  return Math.round((def.cost||0) * Math.pow(1.8, lvl));
}
function buyBaseUpgrade(id){
  const def=BASE_UPGRADES?.[id]; if(!def) return;
  const lvl=getBaseModuleLevel(id);
  if(lvl>=(def.maxLevel||5)){ toast('Макс. уровень', 'warn'); return; }
  const cost=getBaseUpgradeCost(id);
  if((G.cr||0)<cost){ toast('Недостаточно кредитов','bad'); return; }
  G.cr-=cost;
  if(!G.base) G.base={level:0,modules:{},storage:0};
  if(!G.base.modules) G.base.modules={};
  G.base.modules[id]=lvl+1;
  G.base.level=Math.max(G.base.level||0, ...Object.values(G.base.modules));
  pushHistory('base',`Улучшение базы: ${def.name}`,`Достигнут уровень ${lvl+1}.`);
  toast(`${def.icon} ${def.name} ур.${lvl+1}`,'good');
  updateHUD?.(); renderMoreTab?.();
}
function takeLoan(){
  if((G.debt||0)>0){ toast('Сначала погасите текущий долг','warn'); return; }
  const amount=5000 + getCareerLevel()*3000 + (G.influence||0)*50;
  G.debt=amount;
  G.debtDueDay=getAbsDay()+12;
  G.debtRate=0.08;
  G.cr+=amount;
  pushHistory('debt','Получен кредит',`Сумма ${fmt(amount)} кр, срок 12 дней.`);
  toast(`🏦 Кредит получен: ${fmt(amount)} кр`,'good');
  updateHUD?.(); renderMoreTab?.();
}
function repayDebt(){
  const debt=Math.ceil(G.debt||0);
  if(debt<=0){ toast('Долга нет','warn'); return; }
  if((G.cr||0)<debt){ toast('Недостаточно кредитов для погашения','bad'); return; }
  G.cr-=debt;
  G.debt=0; G.debtDueDay=0;
  addHonor(2); addInfluence(2);
  pushHistory('debt','Долг погашен',`Выплачено ${fmt(debt)} кр.`);
  toast('🏦 Долг погашен','good');
  updateHUD?.(); renderMoreTab?.();
}
function applyDebtDaily(){
  if(!(G.debt>0)) return;
  G.debt=Math.ceil(G.debt * (1 + (G.debtRate||0)/12));
  if(getAbsDay() > (G.debtDueDay||0)){
    addHonor(-2); addInfluence(-2);
    if((G.cr||0) < G.debt*0.2) triggerBankruptcy();
  }
}
function triggerBankruptcy(){
  G.bankruptcies=(G.bankruptcies||0)+1;
  const loss=Math.min(G.cr||0, Math.ceil((G.debt||0)*0.35));
  G.cr=Math.max(0, (G.cr||0)-loss);
  G.debt=Math.ceil((G.debt||0)*0.55);
  addHonor(-8); addInfluence(-6);
  if(G.cargo){
    Object.keys(G.cargo).slice(0,3).forEach(k=>delete G.cargo[k]);
  }
  pushHistory('bankruptcy','Банкротство',`Потеряно ${fmt(loss)} кр и часть груза. Остаток долга: ${fmt(G.debt)} кр.`);
  toast('💥 Банкротство! Часть груза и кредитов потеряна.','bad');
}
function getStoryMissionState(id){ return G.storyProgress?.[id] || {claimed:false}; }
function getStoryMetric(m){
  if(m.check==='sell_units') return G.tradeStats?.soldUnits||0;
  if(m.check==='license_count') return Object.keys(G.licenses||{}).length;
  if(m.check==='invasion_wins') return G.storyStats?.invasionWins||0;
  if(m.check==='base_level') return G.base?.level||0;
  return 0;
}
function canClaimStoryMission(id){
  const m=(STORY_MISSIONS||[]).find(x=>x.id===id); if(!m) return false;
  const st=getStoryMissionState(id); if(st.claimed) return false;
  return getStoryMetric(m) >= (m.target||1);
}
function claimStoryMission(id){
  const m=(STORY_MISSIONS||[]).find(x=>x.id===id); if(!m) return;
  if(!canClaimStoryMission(id)){ toast('Цель ещё не выполнена','warn'); return; }
  if(!G.storyProgress) G.storyProgress={};
  G.storyProgress[id]={claimed:true, day:getAbsDay()};
  const r=m.reward||{};
  if(r.cr) G.cr+=r.cr;
  if(r.rp) G.rp+=r.rp;
  if(r.influence) addInfluence(r.influence);
  if(r.honor) addHonor(r.honor);
  if(r.item){
    G.cargo[r.item]=(G.cargo[r.item]||0)+1;
  }
  pushHistory('story','Сюжетная цель выполнена',m.title);
  toast(`📖 Сюжет: ${m.title}`,'good');
  renderMoreTab?.(); updateHUD?.();
}
function resolveAlienInvasion(){
  if(!G.alienInvasion){ toast('Вторжений нет','warn'); return; }
  const inv=G.alienInvasion;
  const power=calcAttack()+calcDefense()+G.lvl*6+(getBaseModuleLevel('defense')*20);
  const target=90 + inv.wave*55 + inv.strength*25;
  if(power >= target){
    const reward=2500 + inv.wave*1200 + inv.strength*800;
    G.cr+=reward; G.totalCr+=reward; G.rp+=20+inv.wave*8;
    addHonor(4); addInfluence(5);
    G.storyStats.invasionWins=(G.storyStats.invasionWins||0)+1;
    if(inv.wave>=inv.maxWave){
      toast(`👾 Вторжение отражено! +${fmt(reward)} кр`,'good');
      G.alienInvasion=null;
    }else{
      inv.wave+=1;
      toast(`⚔️ Волна ${inv.wave-1} отбита. Следующая приближается.`,`good`);
    }
  }else{
    G.hull=Math.max(1, G.hull - Math.max(10, inv.wave*8));
    addHonor(-2);
    toast('👾 Враг отброшен не был. Корпус повреждён.','bad');
  }
  renderMoreTab?.(); updateHUD?.();
}
function addTradeReputation(profit, item, qty=1){
  const units=Math.max(1, qty|0);
  if(profit>=0){
    addInfluence(Math.max(1, Math.min(5, Math.round(profit/400)+1)));
    if(item?.category==='military' || item?.category==='science') addHonor(1);
    addCareerXP(8+Math.min(18, units*2));
    G.tradeStats.profit=(G.tradeStats.profit||0)+profit;
  }else{
    addInfluence(-Math.min(3, Math.ceil(Math.abs(profit)/500)));
    addHonor(-1);
    G.tradeStats.loss=(G.tradeStats.loss||0)+Math.abs(profit);
  }
  G.tradeStats.soldUnits=(G.tradeStats.soldUnits||0)+units;
  G.tradeStats.marketDeals=(G.tradeStats.marketDeals||0)+1;
}

function getSystemGoods(sys){ return (sys?.goods||[]).map(getMarketItem).filter(Boolean); }
function getSystemById(sysId){ return SYSTEMS.find(s=>s.id===sysId) || SYSTEMS[0]; }
function getPlanetCount(sys){ return Math.max(1, (sys?.planets||[]).length || 1); }
function getCurrentPlanetIndex(sysId=G.sys){
  if(!G.currentPlanetBySystem) G.currentPlanetBySystem={};
  if(!Number.isInteger(G.currentPlanetBySystem[sysId])) G.currentPlanetBySystem[sysId]=0;
  return G.currentPlanetBySystem[sysId];
}
function setCurrentPlanetIndex(idx, sysId=G.sys){
  const sys=getSystemById(sysId);
  const max=getPlanetCount(sys)-1;
  if(!G.currentPlanetBySystem) G.currentPlanetBySystem={};
  G.currentPlanetBySystem[sysId]=Math.max(0, Math.min(max, idx|0));
}
function getPlanetType(sys, idx){
  const rotation=(typeof SYSTEM_PLANET_ROTATION!=='undefined' && SYSTEM_PLANET_ROTATION[sys?.type]) || ['urban'];
  return rotation[idx % rotation.length] || rotation[0] || 'urban';
}
function getPlanetProfile(sys, idx){
  const type=getPlanetType(sys, idx);
  const profile=(typeof PLANET_TYPE_PROFILES!=='undefined' && PLANET_TYPE_PROFILES[type]) || PLANET_TYPE_PROFILES?.urban || {name:'Обычная',tax:3,risk:1,mods:{}};
  return {type, ...profile};
}
function getPlanetLabel(sys, idx){
  const emoji=(sys?.planets||[])[idx] || sys?.emoji || '🪐';
  const profile=getPlanetProfile(sys, idx);
  return `${emoji} ${profile.name}`;
}
function ensurePlanetEconomy(sysId){
  const sys=getSystemById(sysId);
  if(!G.planetMarket) G.planetMarket={};
  if(!G.planetPrices) G.planetPrices={};
  if(!G.planetPriceHistory) G.planetPriceHistory={};
  if(!G.planetMarket[sysId]) G.planetMarket[sysId]={};
  if(!G.planetPrices[sysId]) G.planetPrices[sysId]={};
  if(!G.planetPriceHistory[sysId]) G.planetPriceHistory[sysId]={};
  for(let idx=0; idx<getPlanetCount(sys); idx++){
    if(!G.planetMarket[sysId][idx]) G.planetMarket[sysId][idx]={};
    if(!G.planetPrices[sysId][idx]) G.planetPrices[sysId][idx]={};
    if(!G.planetPriceHistory[sysId][idx]) G.planetPriceHistory[sysId][idx]={};
    const profile=getPlanetProfile(sys, idx);
    (sys.goods||[]).forEach(gId=>{
      if(!G.planetMarket[sysId][idx][gId]){
        G.planetMarket[sysId][idx][gId]={
          demand: +(0.9+Math.random()*0.25).toFixed(2),
          supply: +(0.9+Math.random()*0.25).toFixed(2),
          variance: +(0.94+Math.random()*0.12).toFixed(2),
          type: profile.type,
        };
      }
      if(!G.planetPrices[sysId][idx][gId]){
        G.planetPrices[sysId][idx][gId]=computePlanetPrice(sysId, idx, gId);
      }
      if(!G.planetPriceHistory[sysId][idx][gId]) G.planetPriceHistory[sysId][idx][gId]=[];
    });
  }
}
function computePlanetPrice(sysId, idx, gId){
  const sys=getSystemById(sysId);
  const profile=getPlanetProfile(sys, idx);
  const state=G.planetMarket?.[sysId]?.[idx]?.[gId] || {demand:1,supply:1,variance:1};
  const base=getGoodBasePrice(gId)||1;
  const mod=(profile.mods && profile.mods[gId]) || 1;
  const demandFactor=Math.max(0.78, Math.min(1.35, (state.demand||1)/(state.supply||1)));
  const galaxyDanger=(GALAXIES.find(g=>g.id===sys.gal)?.danger||1);
  const systemFactor=1 + ((sys.pc||0) * 0.18) + ((galaxyDanger-1)*0.03);
  return Math.max(5, Math.round(base * mod * demandFactor * systemFactor * (state.variance||1)));
}
function getPlanetPrice(sysId, idx, gId){
  ensurePlanetEconomy(sysId);
  const p=G.planetPrices?.[sysId]?.[idx]?.[gId];
  return p || computePlanetPrice(sysId, idx, gId);
}
function updatePlanetPrice(sysId, idx, gId){
  ensurePlanetEconomy(sysId);
  const price=computePlanetPrice(sysId, idx, gId);
  G.planetPrices[sysId][idx][gId]=price;
  const hist=G.planetPriceHistory[sysId][idx][gId] || (G.planetPriceHistory[sysId][idx][gId]=[]);
  hist.push(price);
  if(hist.length>8) hist.shift();
  return price;
}
function getPlanetMarketState(sysId, idx, gId){
  ensurePlanetEconomy(sysId);
  return G.planetMarket[sysId][idx][gId];
}

function getPlanetSalePrice(sysId, idx, gId){
  const sys=getSystemById(sysId);
  const profile=getPlanetProfile(sys, idx);
  const price=getPlanetPrice(sysId, idx, gId);
  const taxMul=1-((profile.tax||0)/100);
  const item=getMarketItem(gId);
  const career=getCareerProfile();
  let mul=1+gSkill('trade')*0.03;
  if(career.sellMul) mul*=career.sellMul;
  if(career.id==='hunter' && item?.category==='military') mul*=1.05;
  if(career.id==='scientist' && item?.category==='science') mul*=1.04;
  if(career.id==='commander' && career.influenceMul) mul*=1.01;
  mul*=1+Math.max(-0.05, Math.min(0.12, (G.influence||0)*0.002));
  mul*=1+Math.max(-0.05, Math.min(0.08, (G.honor||0)*0.0015));
  mul*=getTempBuffMult('sell');
  return Math.max(0, Math.round(price*mul*taxMul));
}

function getPlanetBuyPrice(sysId, idx, gId){
  const sys=getSystemById(sysId);
  const profile=getPlanetProfile(sys, idx);
  const price=getPlanetPrice(sysId, idx, gId);
  const item=getMarketItem(gId);
  const career=getCareerProfile();
  let mul=(1-gSkill('eloquence')*0.02)*(1+((profile.tax||0)/100));
  if(career.buyMul) mul*=career.buyMul;
  if(career.id==='hunter' && item?.category==='military' && career.militaryBuyMul) mul*=career.militaryBuyMul;
  if(career.id==='scientist' && item?.category==='science' && career.scienceBuyMul) mul*=career.scienceBuyMul;
  mul*=1-Math.max(-0.02, Math.min(0.1, (G.influence||0)*0.0015));
  mul*=1-Math.max(-0.02, Math.min(0.06, (G.honor||0)*0.001));
  mul*=getTempBuffMult('buy');
  return Math.max(0, Math.round(price*mul));
}

function getNearbySystems(sysId=G.sys, limit=5){
  const from=getSystemById(sysId);
  return SYSTEMS.filter(s=>s.id!==from.id && s.gal===from.gal)
    .map(s=>({sys:s, dist:Math.hypot((s.x||0)-(from.x||0),(s.y||0)-(from.y||0))}))
    .sort((a,b)=>a.dist-b.dist)
    .slice(0, limit)
    .map(p=>p.sys);
}

function calculateProfit(gId, fromSysId=G.sys, fromPlanetIdx=getCurrentPlanetIndex(fromSysId), toSysId, toPlanetIdx=0, basis='buy'){
  const fromSys=getSystemById(fromSysId);
  const toSys=getSystemById(toSysId||fromSysId);
  const buyPrice=basis==='cargo' && G.cargoCost?.[gId] ? Number(G.cargoCost[gId]) : getPlanetBuyPrice(fromSys.id, fromPlanetIdx, gId);
  const salePrice=getPlanetSalePrice(toSys.id, toPlanetIdx, gId);
  const fuelCost=calcFuelCost(toSys);
  const net=Math.round(salePrice - buyPrice - fuelCost);
  return { goodId:gId, fromSysId:fromSys.id, fromPlanetIdx, toSysId:toSys.id, toPlanetIdx, buyPrice, salePrice, fuelCost, net };
}

function getBestTradeOpportunity(gId, fromSysId=G.sys, fromPlanetIdx=getCurrentPlanetIndex(fromSysId), basis='buy'){
  const fromSys=getSystemById(fromSysId);
  const options=[];
  SYSTEMS.filter(s=>s.id!==fromSys.id).forEach(sys=>{
    for(let idx=0; idx<getPlanetCount(sys); idx++) options.push(calculateProfit(gId, fromSys.id, fromPlanetIdx, sys.id, idx, basis));
  });
  options.sort((a,b)=>b.net-a.net);
  return options[0] || null;
}

function getMarketRumors(sysId=G.sys){
  const sys=getSystemById(sysId);
  const goods=(sys.goods||[]).map(gId=>({
    gId,
    best:getBestTradeOpportunity(gId, sys.id, getCurrentPlanetIndex(sys.id), 'buy'),
    state:getPlanetMarketState(sys.id, getCurrentPlanetIndex(sys.id), gId),
  }));
  const rumors=[];
  goods.sort((a,b)=>(b.best?.net||-9999)-(a.best?.net||-9999));
  const top=goods[0];
  if(top?.best && top.best.net>0){
    const targetSys=getSystemById(top.best.toSysId);
    rumors.push(`💡 ${getGoodName(top.gId)} выгодно везти на ${targetSys.name}: до ${fmt(top.best.net)} кр чистыми за единицу.`);
  }
  const shortage=goods
    .filter(x=>(x.state?.demand||1)>(x.state?.supply||1)+0.08)
    .sort((a,b)=>((b.state?.demand||1)-(b.state?.supply||1))-((a.state?.demand||1)-(a.state?.supply||1)))[0];
  if(shortage) rumors.push(`📈 На ${getPlanetLabel(sys, getCurrentPlanetIndex(sys.id))} растёт спрос на ${getGoodName(shortage.gId)}.`);
  const glut=goods
    .filter(x=>(x.state?.supply||1)>(x.state?.demand||1)+0.08)
    .sort((a,b)=>((b.state?.supply||1)-(b.state?.demand||1))-((a.state?.supply||1)-(a.state?.demand||1)))[0];
  if(glut) rumors.push(`📉 На рынке избыток товара ${getGoodName(glut.gId)} — цена может просесть.`);
  if(typeof RANDOM_EVENTS!=='undefined' && Array.isArray(RANDOM_EVENTS) && RANDOM_EVENTS.length){
    const ev=RANDOM_EVENTS[(G.day + G.hour + sys.id.length) % RANDOM_EVENTS.length];
    rumors.push(`${ev.icon} Слух дня: ${ev.name.toLowerCase()} — ${ev.desc}`);
  }
  return rumors.slice(0,3);
}


function initPrices(){
  SYSTEMS.forEach(sys=>{
    if(!G.prices[sys.id]) G.prices[sys.id]={};
    if(!G.priceHistory[sys.id]) G.priceHistory[sys.id]={};
    ensurePlanetEconomy(sys.id);
    const curIdx=getCurrentPlanetIndex(sys.id);
    (sys.goods||[]).forEach(gId=>{
      G.prices[sys.id][gId]=getPlanetPrice(sys.id, curIdx, gId);
      if(!G.priceHistory[sys.id][gId]) G.priceHistory[sys.id][gId]=[];
      G.priceHistory[sys.id][gId]=[G.prices[sys.id][gId]];
    });
  });
}
initPrices(); // run immediately before tick starts


function fluctuatePrices(bigEvent=false){
  SYSTEMS.forEach(sys=>{
    ensurePlanetEconomy(sys.id);
    for(let idx=0; idx<getPlanetCount(sys); idx++){
      (sys.goods||[]).forEach(gId=>{
        const state=getPlanetMarketState(sys.id, idx, gId);
        if(!state) return;
        state.demand=Math.max(0.7, Math.min(1.35, state.demand + ((Math.random()-.5)*(bigEvent?0.18:0.08))));
        state.supply=Math.max(0.7, Math.min(1.35, state.supply + ((Math.random()-.5)*(bigEvent?0.2:0.1))));
        if(sys.type==='mining' && (gId==='ore' || gId==='minerals')) state.supply=Math.min(1.45, state.supply+0.04);
        if(sys.type==='trade' && (gId==='food' || gId==='tech')) state.supply=Math.min(1.45, state.supply+0.03);
        if(sys.type==='science' && gId==='tech') state.supply=Math.min(1.45, state.supply+0.04);
        if(sys.type==='danger' && gId==='weapons') state.demand=Math.min(1.45, state.demand+0.05);
        updatePlanetPrice(sys.id, idx, gId);
      });
    }
    const curIdx=getCurrentPlanetIndex(sys.id);
    (sys.goods||[]).forEach(gId=>{
      G.prices[sys.id][gId]=getPlanetPrice(sys.id, curIdx, gId);
      const hist=G.priceHistory[sys.id][gId] || (G.priceHistory[sys.id][gId]=[]);
      hist.push(G.prices[sys.id][gId]);
      if(hist.length>8) hist.shift();
    });
  });
  const numTraders=G.rangers['trader']||0;
  if(numTraders>0){
    for(let i=0;i<numTraders*2;i++){
      const sys=SYSTEMS[Math.floor(Math.random()*SYSTEMS.length)];
      ensurePlanetEconomy(sys.id);
      const idx=Math.floor(Math.random()*getPlanetCount(sys));
      const good=sys.goods?.[Math.floor(Math.random()*sys.goods.length)];
      if(!good) continue;
      const state=getPlanetMarketState(sys.id, idx, good);
      state.demand=Math.max(0.7, Math.min(1.4, state.demand + (Math.random()-.5)*0.1));
      state.supply=Math.max(0.7, Math.min(1.4, state.supply + (Math.random()-.5)*0.1));
      updatePlanetPrice(sys.id, idx, good);
    }
    G.botActions.unshift(`🤝 Торговцы качнули спрос в ${numTraders*2} планетарных рынках`);
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
    applyDebtDaily();
    G.rp += (BASE_UPGRADES?.lab?.rpPerLevel||0) * (G.base?.modules?.lab||0);
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
      const allGoods=getAllMarketGoods().filter(item=>item.questUse!==false && !item.unique);
      const sourcePool=allGoods.filter(item=>!item.licenseRequired || hasLicense(item.licenseRequired));
      const pool=sourcePool.length?sourcePool:allGoods;
      const picked=pool[Math.floor(Math.random()*pool.length)] || {id:'ore', category:'basic'};
      const good=picked.id;
      const dest=SYSTEMS.filter(s=>s.id!==m.sysId)[Math.floor(Math.random()*18)];
      const amt=2+Math.floor(Math.random()*5);
      q.need={good,amt,destSys:dest.id};
      q.contractType=(picked.category==='military'?'military':picked.category==='science'?'science':'civil');
      q.title=`Доставить ${getGoodName(good)} → ${dest.name}`;
      q.desc=`Возьмите ${amt}× ${getGoodName(good)} и доставьте в систему ${dest.name}. Контракт: ${q.contractType==='military'?'военный':q.contractType==='science'?'научный':'гражданский'}.`;
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
  const career=getCareerProfile();
  const reward=Math.round((q.reward||0)*(career.questMul||1));
  const rpReward=Math.round((q.rp||5)*(career.rpMul||1));
  G.cr+=reward;G.totalCr+=reward;G.xp+=q.xp||20;G.rp+=rpReward;
  G.completedQ++;
  if(q.type==='deliver') G.tradeStats.completedContracts=(G.tradeStats.completedContracts||0)+1;
  addInfluence(q.type==='deliver'?6:4);
  addHonor(q.type==='deliver'?2:1);
  addCareerXP(q.type==='deliver'?25:12);
  addPoliceRep(G.gal,5);
  addLeagueScore(20);
  pushHistory('quest','Задание выполнено',`${q.title} · +${fmt(reward)} кр`);
  toast(`🎉 Задание выполнено! +${fmt(reward)} кр`,'good');
  hapticN('success');updateQuestBadge();
}
function acceptCollect(qId){
  const q=G.quests.find(q=>q.id===qId);
  if(!q||q.accepted||q.done) return;
  pushHistory('quest','Задание принято',q.title);
  q.accepted=true;toast('📋 Задание принято!');renderQuests();
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
      q.progress=(q.progress||0)+1;
      if(q.progress>=q.need.count) completeQuest(q);
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
  pushHistory('base','Покупка участка',`${sys.name} · ${getGoodName(good)} · ур.${level+1}`);
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
function checkAlienInvasion(){
  if(G.alienInvasion){
    const inv=G.alienInvasion;
    const age=getAbsDay() - (inv.spawnAbsDay||getAbsDay());
    if(age>0 && age%2===0 && inv.wave < inv.maxWave){
      inv.wave += 1;
      inv.strength += 1;
      toast(`👾 Вторжение усиливается: волна ${inv.wave}/${inv.maxWave}`,'bad');
    }
    if(age>=6 && inv.wave>=inv.maxWave){
      if(!G.capturedSystems.includes(inv.sysId)) G.capturedSystems.push(inv.sysId);
      addHonor(-5);
      toast('⚠️ Система частично потеряна из-за вторжения','bad');
      G.alienInvasion=null;
    }
    return;
  }
  SYSTEMS.filter(s=>s.type==='danger'||s.gal==='gamma'||s.gal==='chaos').forEach(sys=>{
    const baseChance=0.04 - Math.min(0.02, (getBaseModuleLevel('defense')||0)*0.003);
    if(Math.random()<baseChance && !G.alienInvasion){
      const race=ALIEN_TYPES[Math.floor(Math.random()*Math.min(ALIEN_TYPES.length, 3))];
      G.alienInvasion={sysId:sys.id,race:race.id,raceIcon:race.icon,raceName:race.name,spawnDay:G.day,spawnAbsDay:getAbsDay(),wave:1,maxWave:3,strength:(GALAXIES.find(g=>g.id===sys.gal)?.danger||1)};
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
