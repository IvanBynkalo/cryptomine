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
    alienInvasion:null,
    rareMatter:0,
    questHistory:[],
    currentPlanetBySystem:{sol:0},
    playerName:null,
    leagueSeason:1,leagueScore:0,leagueBestSeason:0,
    seasonStart:Date.now(),
    saveVersion:5,
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
    G.lastSave=Date.now();
    G.saveVersion=5;
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
function normalizeAlienInvasion(inv){
  if(!inv) return null;
  const alienId=inv.alienId||inv.race||'zorg_scout';
  const al=typeof ALIEN_TYPES!=='undefined' ? (ALIEN_TYPES.find(a=>a.id===alienId)||ALIEN_TYPES[0]) : null;
  return {
    ...inv,
    alienId,
    race: inv.race || al?.race,
    raceIcon: inv.raceIcon || al?.icon || '👽',
    raceName: inv.raceName || al?.name || 'Пришельцы',
  };
}
function migrateState(s){
  const n={...freshState(), ...(s||{})};
  if(!n.month) n.month=1;
  if(!n.year) n.year=2450;
  if(!n.cargoCost) n.cargoCost={};
  if(!n.landPlots) n.landPlots={};
  if(!n.questHistory) n.questHistory=[];
  if(!n.currentPlanetBySystem) n.currentPlanetBySystem={sol:0};
  if(typeof n.rareMatter!=='number') n.rareMatter=0;
  n.alienInvasion=normalizeAlienInvasion(n.alienInvasion);
  n.quests=(n.quests||[]).map(q=>({
    ...q,
    progress:q.progress||0,
    accepted:!!q.accepted,
    done:!!q.done,
  }));
  n.saveVersion=5;
  return n;
}
function getPlanetIndex(sysId){
  if(!G.currentPlanetBySystem) G.currentPlanetBySystem={};
  return G.currentPlanetBySystem[sysId]||0;
}
function getPlanetEmoji(sysId){
  const sys=(typeof SYSTEMS!=='undefined'?SYSTEMS.find(s=>s.id===sysId):null);
  const planets=sys?.planets||[sys?.emoji||'🪐'];
  return planets[Math.min(planets.length-1, getPlanetIndex(sysId))]||planets[0]||'🪐';
}

// ── Init ──
G = migrateState(loadG()||freshState());

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
