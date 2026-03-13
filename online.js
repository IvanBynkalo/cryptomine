// simple deterministic hash for stable fake names
function _fakeSeed(str,mod){
  let h=5381;
  for(let i=0;i<String(str).length;i++) h=((h<<5)+h)+String(str).charCodeAt(i)|0;
  return Math.abs(h)%(mod||1000);
}

// ═══════════════════════════════════════
//  online.js — league + online rangers
// ═══════════════════════════════════════

const STORAGE_KEY_ONLINE  = 'sr_online_v1';
const STORAGE_KEY_LEAGUE  = 'sr_league_v1';
const ONLINE_TTL_MS       = 5 * 60 * 1000; // 5 min = "online"

const FAKE_NAMES=['StarWolf','NovaCat','IronAxe','DarkMatter','CosmicRay',
  'VoidHunter','NebulaPilot','GalaxyStar','QuantumSword','ShadowDrift',
  'StarlightX','PhantomFleet','OmegaPilot','CrystalVoid','SolarWind',
  'NeonRaider','PulsarKing','CosmoClaw','StarReaper','VortexBane'];

let onlineRangers=[];
let leagueData=[];   // [{name,score,rank,lvl,kills,ts}]

// ── Heartbeat: write current player to shared storage ──
async function heartbeat(){
  if(!G.playerName) return;
  const entry={
    name:G.playerName, lvl:G.lvl, kills:G.killCount,
    rank:getRank().name, score:G.leagueScore||0,
    sys:G.sys, gal:G.gal,
    ts:Date.now()
  };
  try{
    await window.storage?.set(`online:${G.playerName}`, JSON.stringify(entry), true);
  }catch(e){}
}

// ── Fetch all online players ──
async function fetchOnline(){
  let players=[];
  try{
    const keys=await window.storage?.list('online:', true);
    if(keys?.keys){
      for(const k of keys.keys){
        try{
          const r=await window.storage.get(k,true);
          if(r?.value){
            const p=JSON.parse(r.value);
            if(Date.now()-p.ts < ONLINE_TTL_MS) players.push({...p,isMe:p.name===G.playerName});
          }
        }catch(e){}
      }
    }
  }catch(e){}

  // add fake rangers if too few — stable, update only every 5min
  const realCount=players.length;
  if(realCount<6){
    const needed=6+Math.floor(_fakeSeed(G.playerName||'x',1)*5|0)-realCount;
    const used=new Set(players.map(p=>p.name));
    // use deterministic seeded fakes per session (change every 5 min)
    const timeSeed=Math.floor(Date.now()/300000); // changes every 5 min
    for(let i=0;i<Math.max(0,needed);i++){
      const idx=(_fakeSeed(G.playerName+i+timeSeed,FAKE_NAMES.length))|0;
      const n=FAKE_NAMES[idx%FAKE_NAMES.length];
      if(used.has(n)) continue;
      used.add(n);
      const seed=_fakeSeed(n,100);
      const lvl=Math.max(1,Math.min(50,Math.floor(seed*0.5+G.lvl*0.3+1)));
      players.push({
        name:n, lvl, kills:Math.floor(seed*2),
        rank:getRankByLvl(lvl), score:Math.floor(seed*5+G.leagueScore*0.3),
        sys:SYSTEMS[Math.floor(seed*0.19*SYSTEMS.length)%SYSTEMS.length].id,
        gal:GALAXIES[Math.floor(seed*0.04)%GALAXIES.length].id,
        ts:Date.now()-Math.floor(seed*30000),
        isFake:true
      });
    }
  }

  onlineRangers=players.sort((a,b)=>b.score-a.score);
  return onlineRangers;
}

// ── League: fetch + merge into leaderboard ──
async function fetchLeague(){
  let board=[];
  try{
    const keys=await window.storage?.list('online:',true);
    if(keys?.keys){
      for(const k of keys.keys){
        try{
          const r=await window.storage.get(k,true);
          if(r?.value){ const p=JSON.parse(r.value); board.push(p); }
        }catch(e){}
      }
    }
  }catch(e){}

  // pad with fakes
  if(board.length<15){
    const used=new Set(board.map(p=>p.name));
    for(let i=board.length;i<15;i++){
      const n=FAKE_NAMES.filter(x=>!used.has(x))[i%FAKE_NAMES.length]||`Ranger${i}`;
      used.add(n);
      const lvl=1+Math.floor(Math.random()*40);
      board.push({name:n,lvl,kills:Math.floor(Math.random()*300),
        rank:getRankByLvl(lvl),score:Math.floor(Math.random()*2000+100),isFake:true});
    }
  }

  // always include real player
  const meIdx=board.findIndex(p=>p.name===G.playerName);
  const me={name:G.playerName||'Вы',lvl:G.lvl,kills:G.killCount,
    rank:getRank().name,score:G.leagueScore||0,isMe:true};
  if(meIdx>=0) board[meIdx]=me; else board.push(me);

  leagueData=board.sort((a,b)=>b.score-a.score);
  return leagueData;
}

// ── Add score on game events ──
function addLeagueScore(pts){
  if(!G.leagueScore) G.leagueScore=0;
  G.leagueScore+=pts;
}

function leagueSeasonTick(){
  if(!G.seasonStart) G.seasonStart=Date.now();
  const daysPassed=(G.day-1);
  if(daysPassed>0&&daysPassed%LEAGUE_SEASON_DAYS===0){
    // season end
    const prevBest=G.leagueBestSeason||0;
    if(G.leagueScore>prevBest) G.leagueBestSeason=G.leagueScore;
    G.leagueSeason=(G.leagueSeason||1)+1;
    toast(`🏆 Сезон ${G.leagueSeason-1} завершён! Лучший счёт: ${fmt(G.leagueBestSeason)}`,'gold');
    G.leagueScore=0; // reset for new season
  }
}

function getLeagueTier(score){
  let tier=LEAGUE_TIERS[0];
  for(const t of LEAGUE_TIERS) if(score>=t.min) tier=t;
  return tier;
}

// ── Render online tab ──
async function renderOnlineRangers(){
  const scr=document.getElementById('more-scr');
  scr.innerHTML=`<div style="text-align:center;padding:30px;color:var(--muted2)">
    <div style="font-size:24px;margin-bottom:8px">🔄</div>Загрузка...
  </div>`;

  await heartbeat();
  await fetchOnline();
  await fetchLeague();

  const myTier=getLeagueTier(G.leagueScore||0);
  const myPos=(leagueData.findIndex(p=>p.isMe||p.name===G.playerName))+1||'?';
  const sys=SYSTEMS.find(s=>s.id===G.sys);

  let h=`
  <!-- ── Season header ── -->
  <div style="background:linear-gradient(135deg,var(--card2),var(--card3));border:1px solid var(--b2);border-radius:12px;padding:14px;margin-bottom:10px">
    <div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <div style="font-size:9px;letter-spacing:2px;color:var(--muted2);text-transform:uppercase">Сезон ${G.leagueSeason||1}</div>
        <div style="font-family:var(--mono);font-size:22px;color:${myTier.color}">${myTier.icon} ${myTier.name}</div>
        <div style="font-size:11px;color:var(--muted2);margin-top:2px">${fmt(G.leagueScore||0)} очков  ·  #${myPos} в лиге</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:28px">${myTier.icon}</div>
        <div style="font-size:9px;color:var(--muted2)">Дней до конца:</div>
        <div style="font-family:var(--mono);font-size:14px;color:var(--gold)">${LEAGUE_SEASON_DAYS - ((G.day-1)%LEAGUE_SEASON_DAYS)}</div>
      </div>
    </div>
    <div style="margin-top:10px">
      <div style="display:flex;justify-content:space-between;font-size:9px;color:var(--muted2);margin-bottom:4px">
        ${LEAGUE_TIERS.map(t=>`<span style="color:${t.color}">${t.icon}</span>`).join('')}
      </div>
      <div style="height:4px;background:var(--b1);border-radius:2px">
        <div style="height:100%;border-radius:2px;background:linear-gradient(90deg,${myTier.color},${myTier.color}aa);
          width:${Math.min(100,((G.leagueScore||0)/2500)*100)}%;transition:width .5s"></div>
      </div>
    </div>
  </div>

  <!-- ── League table ── -->
  <div class="sh">🏆 Таблица лиги</div>
  <div style="background:var(--card);border:1px solid var(--b1);border-radius:10px;overflow:hidden;margin-bottom:10px">`;

  leagueData.slice(0,20).forEach((p,i)=>{
    const isMe=p.isMe||p.name===G.playerName;
    const tier=getLeagueTier(p.score||0);
    const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':`${i+1}`;
    h+=`<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;
      border-bottom:1px solid var(--b1);
      ${isMe?'background:rgba(0,200,255,.07);border-left:3px solid var(--cyan)':''}">
      <div style="font-family:var(--mono);font-size:13px;width:24px;text-align:center;color:var(--muted2)">${medal}</div>
      <div style="font-size:18px">${tier.icon}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:700;${isMe?'color:var(--cyan)':''}">
          ${p.name}${isMe?' ⬅ Вы':''}${p.isFake?'':' 🔴'}
        </div>
        <div style="font-size:10px;color:var(--muted2)">${p.rank} · Ур.${p.lvl} · ⚔️${p.kills||0}</div>
      </div>
      <div style="text-align:right">
        <div style="font-family:var(--mono);font-size:13px;color:${tier.color}">${fmt(p.score||0)}</div>
        <div style="font-size:9px;color:var(--muted2)">очков</div>
      </div>
    </div>`;
  });
  h+=`</div>

  <!-- ── Online now ── -->
  <div class="sh">🟢 Онлайн сейчас (${onlineRangers.length})</div>`;

  onlineRangers.forEach(p=>{
    const isMe=p.isMe||p.name===G.playerName;
    const ago=p.isFake?'только что':`${Math.floor((Date.now()-p.ts)/60000)||'<1'} мин назад`;
    const pSys=SYSTEMS.find(s=>s.id===p.sys);
    h+=`<div style="display:flex;align-items:center;gap:10px;padding:9px 12px;margin-bottom:4px;
      background:var(--card);border:1px solid var(--b1);border-radius:8px;
      ${isMe?'border-color:var(--cyan)':''}">
      <div style="width:8px;height:8px;border-radius:50%;
        background:${p.isFake||isMe?'#00ff88':'#00c8ff'};
        box-shadow:0 0 6px ${p.isFake||isMe?'#00ff88':'#00c8ff'}"></div>
      <div style="flex:1">
        <div style="font-size:12px;font-weight:700;${isMe?'color:var(--cyan)':''}">${p.name}</div>
        <div style="font-size:10px;color:var(--muted2)">${p.rank} · ${pSys?.name||'?'} · ${ago}</div>
      </div>
      <div style="text-align:right">
        <div style="font-size:11px;color:var(--purple)">Ур.${p.lvl}</div>
        ${!isMe&&currentAlienInvasion()?`<button class="btn btn-sm btn-g" onclick="coopRaid()" style="margin-top:2px">Коопереция</button>`:''}
      </div>
    </div>`;
  });

  const inv=currentAlienInvasion();
  if(inv){
    const target=ALIEN_TYPES.find(a=>a.id===inv.alienId||((inv.bossUnlocked&&!inv.bossDefeated)?inv.bossId:null));
    const alSys=SYSTEMS.find(s=>s.id===inv.sysId);
    h+=`<div style="margin-top:10px;background:rgba(255,45,120,.08);border:1px solid rgba(255,45,120,.3);border-radius:10px;padding:14px"><div style="color:#ff2d78;font-weight:700;margin-bottom:6px">⚠️ АКТИВНОЕ ВТОРЖЕНИЕ</div><div style="font-size:12px;color:var(--muted2)">${target?.icon||'👽'} ${target?.name||'Пришелец'} в системе ${alSys?.name||'?'} · ${inv.bossUnlocked&&!inv.bossDefeated?'Босс доступен':`Осталось целей: ${(inv.alienIds||[]).length}`}</div><div style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-r btn-full" onclick="fightAlien('${target?.id||''}')">⚔️ Атаковать</button><button class="btn btn-g btn-full" onclick="coopRaid('${target?.id||''}')">🤝 Коопреция</button></div></div>`;
  }

  // scoring guide
  h+=`<div class="sh" style="margin-top:8px">📊 Начисление очков</div>
  <div style="background:var(--card);border:1px solid var(--b1);border-radius:8px;padding:12px;font-size:11px;color:var(--muted2);line-height:1.9">
    ⛏️ Добыча: +1 за клик &nbsp;·&nbsp; 📋 Задание: +20 &nbsp;·&nbsp; ☠️ Пират: +5<br>
    👽 Пришелец: +30 &nbsp;·&nbsp; 🎉 Уровень: +50 &nbsp;·&nbsp; Сезон длится ${LEAGUE_SEASON_DAYS} дней
  </div>`;

  scr.innerHTML=h;
}

// ── Capture system ──
function startPlanetCapture(){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  if(!sys) return;
  if(sys.type==='home'){toast('Нельзя захватить базу','bad');return;}
  if(G.capturedSystems?.includes(G.sys)){toast('Уже захвачена','warn');return;}
  if(G.cr<50000){toast('💸 Нужно 50,000 кр','bad');return;}
  G.cr-=50000;
  if(!G.capturedSystems) G.capturedSystems=[];
  G.capturedSystems.push(G.sys);
  addPoliceRep(G.gal,-30);
  addLeagueScore(100);
  toast(`🏴 ${sys.name} захвачена! +${fmt(10*G.lvl)}/5сек`,'gold');
  hapticN('success');
}

// start heartbeat loop
setInterval(heartbeat, 60000); // write own presence every 60s
setTimeout(heartbeat, 2000);
