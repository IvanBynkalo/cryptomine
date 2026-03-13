// ═══════════════════════════════════════
//  state.js — game state, accessors, calcs
// ═══════════════════════════════════════

function freshState(){
  return{
    cr:0,totalCr:0,xp:0,lvl:1,energy:100,maxEnergy:100,
    hull:100,maxHull:100,fuel:100,maxFuel:100,
    missiles:3,maxMissiles:3,rp:0,skillPts:0,
    // calendar
    day:1,hour:6,minute:0,month:1,year:2450,era:'Заря',
    sys:'sol',gal:'alpha',
    upgrades:{},researched:{},skills:{},
    equip:{hull:'hull_scout',engine:'eng_basic',weapon:'wpn_laser',shield:'shld_basic'},
    owned_equip:[],
    helpers:{},rangers:{},
    cargo:{},cargoCost:{}, // weighted avg buy price per good
    cargoMax:20,
    quests:[],completedQ:0,
    combat:null,combatLog:[],
    killCount:0,totalKillReward:0,alienKills:0,alienKillsByRace:{},
    prices:{},priceHistory:{},
    debrisActive:[],botActions:[],
    policeRep:{},capturedSystems:[],
    landPlots:{}, // sysId -> {good, level, lastHarvestDay}
    debt:0,bankruptcies:0,failedQ:0,shipLosses:0,saveVersion:7,
    financeLog:[],
    playerName:null,
    rangerClass:'freelancer',classXP:{freelancer:0,trader:0,hunter:0,explorer:0,commander:0},
    honor:0,influence:{alpha:0,beta:0,gamma:0,chaos:0,delta:0,omega:0},licenses:{1:true},
    leagueSeason:1,leagueScore:0,leagueBestSeason:0,
    seasonStart:Date.now(),
    lastSave:Date.now(),
  };
}

// hoisted var
var G;
function gUpg(id)    { return (G&&G.upgrades  ? G.upgrades[id]   : 0)||0; }
function gHelper(id) { return (G&&G.helpers   ? G.helpers[id]    : 0)||0; }
function gSkill(id)  { return (G&&G.skills    ? G.skills[id]     : 0)||0; }
function hasTech(id) { return !!(G&&G.researched ? G.researched[id] : false); }

function saveG(){
  try{
    // keep previous save as backup slot _bak
    const prev=localStorage.getItem('srw_v4');
    if(prev) localStorage.setItem('srw_v4_bak',prev);
    localStorage.setItem('srw_v4',JSON.stringify(G));
  }catch(e){}
}
function loadG(){
  try{
    const s=localStorage.getItem('srw_v4')||localStorage.getItem('srw_v3');
    return s ? JSON.parse(s) : null;
  }catch(e){ return null; }
}

// ── Init ──
G = loadG()||freshState();
// migrate missing fields
if(!G.month)      G.month=1;
if(!G.year)       G.year=2450;
if(!G.cargoCost)  G.cargoCost={};
if(!G.landPlots)  G.landPlots={};
if(G.debt===undefined) G.debt=0;
if(G.bankruptcies===undefined) G.bankruptcies=0;
if(G.failedQ===undefined) G.failedQ=0;
if(!G.financeLog) G.financeLog=[];
if(!G.saveVersion) G.saveVersion=7;
if(G.shipLosses===undefined) G.shipLosses=0;
if(!G.rangerClass) G.rangerClass='freelancer';
if(!G.classXP) G.classXP={freelancer:0,trader:0,hunter:0,explorer:0,commander:0};
if(G.honor===undefined) G.honor=0;
if(!G.influence) G.influence={alpha:0,beta:0,gamma:0,chaos:0,delta:0,omega:0};
if(!G.licenses) G.licenses={1:true};
if(G.alienInvasion && !G.alienInvasion.alienIds){
  const baseId=G.alienInvasion.alienId||G.alienInvasion.race||'zorg_scout';
  G.alienInvasion.alienIds=[baseId];
}

// offline earnings
(()=>{
  if(!G.lastSave) return;
  const dt=Math.min((Date.now()-G.lastSave)/1000,7200);
  const cps=calcCPS();
  if(dt>10&&cps>0){
    const earn=Math.floor(dt*cps);
    G.cr+=earn; G.totalCr+=earn;
    setTimeout(()=>typeof toast==='function'&&toast(`⏰ Оффлайн +${fmt(earn)} кр`,'good'),1500);
  }
})();

// ── Calculations ──
function getEquipStats(){
  const stats={atk:0,def:0,reflect:0,fuelMod:0,cargo:0,maxHull:0};
  ['hull','engine','weapon','shield'].forEach(cat=>{
    const eq=EQUIPMENT.find(e=>e.id===G.equip[cat]);
    if(!eq) return;
    Object.entries(eq.stats||{}).forEach(([k,v])=>{ stats[k]=(stats[k]||0)+v; });
  });
  return stats;
}
function calcClickPower(){
  let base=1+gUpg('drill')*2+(hasTech('nanodrill')?5:0);
  if(hasTech('orbital')) base+=20;
  if(Math.random()<gSkill('luck')*0.02) base*=2;
  return Math.ceil(base*(1+gSkill('attack')*0.02));
}
function calcCPS(){
  let cps=0;
  HELPERS.forEach(h=>{ cps+=h.cps*(G.helpers[h.id]||0); });
  if(hasTech('orbital'))  cps+=20;
  if(hasTech('stellar'))  cps+=100;
  if(hasTech('galactic')) cps+=500;
  cps+=(G.rangers['miner_b']||0)*20;
  // land plot passive income
  if(G.landPlots) Object.values(G.landPlots).forEach(p=>{
    if(p&&p.level) cps+=p.level*5;
  });
  return cps;
}
function calcAttack(){
  let a=10+gUpg('laser')*4+(getEquipStats().atk||0);
  if(hasTech('plasma'))    a+=8;
  if(hasTech('ionbeam'))   a+=15;
  if(hasTech('antimatter'))a+=20;
  return Math.round(a*(1+gSkill('attack')*0.05));
}
function calcDefense(){
  let d=(getEquipStats().def||0)+gSkill('defense')*4;
  if(hasTech('nullfield')) d+=15;
  return d;
}
function calcMissileDmg(){
  let d=35;
  if(hasTech('torpedo'))   d+=20;
  if(hasTech('antimatter'))d*=2;
  return d;
}
function calcMaxHull(){
  let h=100+gUpg('shield')*30+(getEquipStats().maxHull||0);
  if(hasTech('armor'))    h+=50;
  if(hasTech('nullfield'))h+=30;
  return h;
}
function calcFuelCost(sys){
  if(hasTech('omega')) return 0;
  let c=sys.fuelCost*(1-gUpg('engine')*0.25)*(1+(getEquipStats().fuelMod||0));
  if(hasTech('turbo')) c*=.7;
  return Math.max(2,Math.round(c));
}
function calcCargoMax(){
  return 20+gUpg('cargo')*10+(getEquipStats().cargo||0);
}
function calcCargoUsed(){
  return Object.values(G.cargo).reduce((a,b)=>a+b,0);
}
function calcRpMult(){
  return 1+(gUpg('scanner')*0.5)+(gSkill('intellect')*0.08);
}
function getRank(){
  let rank=RANKS[0];
  for(const r of RANKS) if(G.killCount>=r.minKills&&G.lvl>=r.minLvl) rank=r;
  return rank;
}
function getRankByLvl(lvl){
  let r=RANKS[0];
  for(const rk of RANKS) if(lvl>=rk.minLvl) r=rk;
  return r.name;
}
function xpForLvl(l){ return Math.floor(100*Math.pow(1.85,l-1)); }

// fmt -> globals.js


function currentClassDef(){ return RANGER_CLASSES.find(c=>c.id===G.rangerClass)||RANGER_CLASSES[0]; }
function classLevel(id){
  const xp=(G.classXP?.[id]||0);
  return Math.min(20, 1+Math.floor(xp/120));
}
function addClassXP(track, amount){
  if(!G.classXP) G.classXP={freelancer:0,trader:0,hunter:0,explorer:0,commander:0};
  amount=Math.max(0, amount||0);
  if(!amount) return;
  const cur=currentClassDef();
  const bonus=(cur.bonuses?.[track]||0)+(cur.id==='freelancer'?0.02:0);
  const gain=Math.round(amount*(1+bonus));
  G.classXP[G.rangerClass]=(G.classXP[G.rangerClass]||0)+gain;
  if(track==='combat'||track==='alien') addHonor(1);
}
function addHonor(v){ G.honor=Math.max(-100, Math.min(500,(G.honor||0)+(v||0))); }
function getInfluence(gal){ return G.influence?.[gal]||0; }
function addInfluence(gal,v){
  if(!G.influence) G.influence={};
  G.influence[gal]=Math.max(-100, Math.min(500,(G.influence[gal]||0)+(v||0)));
}
function calcRangerPower(){
  const cls=currentClassDef();
  const clsLvl=classLevel(G.rangerClass);
  const eq=getEquipStats();
  const shipTier=(EQUIPMENT.find(e=>e.id===G.equip.hull)?.tier||1)+(EQUIPMENT.find(e=>e.id===G.equip.weapon)?.tier||1)+(EQUIPMENT.find(e=>e.id===G.equip.shield)?.tier||1);
  const raw=G.lvl*8 + G.killCount*1.7 + (G.completedQ||0)*3 + clsLvl*12 + (eq.atk||0)*1.2 + (eq.def||0)*1.1 + shipTier*10 + Math.max(0,G.honor||0)*0.8;
  return Math.round(raw*(1+(cls.bonuses?.power||0)));
}
function unlockEligibleLicenses(){
  if(!G.licenses) G.licenses={1:true};
if(G.alienInvasion && !G.alienInvasion.alienIds){
  const baseId=G.alienInvasion.alienId||G.alienInvasion.race||'zorg_scout';
  G.alienInvasion.alienIds=[baseId];
}
  const p=calcRangerPower();
  LICENSE_TIERS.forEach(l=>{
    if(G.licenses[l.tier]) return;
    if(p>=l.power && (G.honor||0)>=l.honor && (G.completedQ||0)>=l.completedQ){
      G.licenses[l.tier]=true;
      if(typeof toast==='function') toast(`📜 Получена ${l.name}`,'good');
    }
  });
}
function maxLicensedTier(){
  unlockEligibleLicenses();
  const arr=Object.keys(G.licenses||{}).map(Number).filter(Boolean);
  return arr.length?Math.max(...arr):1;
}
