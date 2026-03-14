// ═══════════════════════════════════════
//  galaxy.js — galaxy + solar system map
// ═══════════════════════════════════════

let canvas, ctx;
let selSys=null, selPlanet=null, gxGal=0;
let traveling=false, travelProg=0;
let gxMode='galaxy'; // galaxy | system
let activeSystemId=null;
let travelTarget=null; // {type:'system'|'planet', sysId, planetIndex}
let starParticles=[];

function currentInv(){ return typeof currentAlienInvasion==='function' ? currentAlienInvasion() : (typeof alienInvasion!=='undefined' ? alienInvasion : null); }

function getPlanetIndex(sysId){
  if(!G.currentPlanetBySystem) G.currentPlanetBySystem={};
  if(!Number.isInteger(G.currentPlanetBySystem[sysId])) G.currentPlanetBySystem[sysId]=0;
  return G.currentPlanetBySystem[sysId];
}
function setPlanetIndex(sysId, idx){
  if(!G.currentPlanetBySystem) G.currentPlanetBySystem={};
  G.currentPlanetBySystem[sysId]=idx;
}
function getSystemById(id){ return SYSTEMS.find(s=>s.id===id); }
function getGalaxyTheme(idx){
  return [
    {a:'10,26,84', b:'71,147,255', c:'167,112,255'},
    {a:'39,14,84', b:'178,78,255', c:'78,221,255'},
    {a:'10,55,40', b:'58,255,176', c:'85,120,255'},
    {a:'76,10,24', b:'255,86,86', c:'255,160,64'},
  ][idx] || {a:'10,26,84', b:'71,147,255', c:'167,112,255'};
}
function planetName(emoji, idx){
  const byEmoji={
    '🌍':'Терра','🌕':'Луна','🔴':'Марс','⚫':'Нокс','🪐':'Сатурн','🟠':'Гелиос','🟤':'Феррум','🔵':'Аква','🟢':'Эдем',
    '💜':'Аметист','⚪':'Альба','🌟':'Сияние','💠':'Кристалл','🟣':'Вайолет','⚡':'Вольт','🔥':'Пирос','💀':'Мортус',
    '🖤':'Обливион','🌑':'Тень','🌪️':'Вихрь','🏯':'Санктум','⚙️':'Фордж','🌀':'Аркана','💚':'Виридис'
  };
  return byEmoji[emoji] || `Орбита-${idx+1}`;
}
function planetNodes(sys){
  const planets=(sys.planets&&sys.planets.length?sys.planets:[sys.emoji]);
  const W=canvas.width, H=canvas.height;
  const cx=W*0.52, cy=H*0.52;
  const maxR=Math.min(W,H)*0.34;
  return planets.map((emoji,idx)=>{
    const orbit=Math.max(54, maxR*(0.34 + idx*0.18));
    const angle=(-Math.PI/2)+(idx*Math.PI*0.82)+(Date.now()*0.00006*(idx%2?1:-1));
    const x=cx + Math.cos(angle)*orbit;
    const y=cy + Math.sin(angle)*orbit*0.66;
    return {emoji, idx, name:planetName(emoji,idx), orbit, angle, x, y, size: idx===0?15:12+Math.max(0,3-idx)};
  });
}
function planetTravelCost(sys, idx){
  const cur=getPlanetIndex(sys.id);
  const dist=Math.abs(cur-idx);
  return {fuel: idx===cur?0:Math.max(1, 2+dist), days: idx===cur?0:Math.max(0.2, 0.5+dist*0.7)};
}
function miningBonusForPlanet(sys, idx){
  const typeBase={home:6,mining:18,trade:7,science:10,danger:12,paradise:9};
  return (typeBase[sys.type]||8) + idx*4;
}

function initGalaxy(){
  canvas=document.getElementById('gx-c');
  const wrap=document.getElementById('gx-wrap');
  if(!canvas||!wrap) return;
  canvas.width=wrap.clientWidth;
  canvas.height=Math.max(wrap.clientHeight, 320);
  ctx=canvas.getContext('2d');
  const currentGalIdx=Math.max(0, GALAXIES.findIndex(g=>g.id===G.gal));
  if(currentGalIdx>=0) gxGal=currentGalIdx;
  updateGalaxyTopbar();
  genStarParticles();
  drawGalaxy();
  canvas.onclick=onGxClick;
}

function genStarParticles(){
  starParticles=[];
  const W=canvas.width, H=canvas.height;
  for(let i=0;i<90;i++){
    starParticles.push({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*1.8+0.2,
      a:Math.random()*0.9, da:(Math.random()-.5)*0.01,
      vx:(Math.random()-.5)*0.02, vy:(Math.random()-.5)*0.015,
      hue:180+Math.random()*100
    });
  }
}

function updateGalaxyTopbar(){
  const back=document.getElementById('gx-back-btn');
  const crumb=document.getElementById('gx-breadcrumb');
  if(back) back.classList.toggle('show', gxMode==='system');
  if(!crumb) return;
  if(gxMode==='galaxy') crumb.textContent=`🌌 ${GALAXIES[gxGal]?.name||'Галактика'} — карта систем`;
  else {
    const sys=getSystemById(activeSystemId);
    crumb.textContent=sys ? `${sys.emoji} ${sys.name} — солнечная система` : '🪐 Солнечная система';
  }
}

function setGalaxy(idx,btn){
  const gal=GALAXIES[idx];
  if(gal?.unlock && gal.unlock>G.lvl){ toast(`🔒 Нужен уровень ${gal.unlock}`,'bad'); return; }
  if(gal?.reqTech && !hasTech(gal.reqTech)){ toast(`🔒 Нужна технология: ${gal.reqTech}`,'bad'); return; }
  document.querySelectorAll('.gtab').forEach(b=>b.classList.remove('on'));
  btn?.classList.add('on');
  gxGal=idx; gxMode='galaxy'; activeSystemId=null; selSys=null; selPlanet=null; travelTarget=null;
  closePanel(false); updateGalaxyTopbar(); genStarParticles(); drawGalaxy();
}

function drawGalaxy(){
  if(!canvas||!ctx) return;
  const W=canvas.width, H=canvas.height;
  ctx.clearRect(0,0,W,H);
  drawSceneBackground(W,H);
  if(gxMode==='galaxy') drawGalaxyMap(W,H);
  else drawSystemMap(W,H);
  if(document.getElementById('sc-galaxy')?.classList.contains('active')) requestAnimationFrame(drawGalaxy);
}

function drawSceneBackground(W,H){
  const t=getGalaxyTheme(gxGal);
  const bg=ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0, '#050a16');
  bg.addColorStop(.45, '#081427');
  bg.addColorStop(1, '#02060f');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  const neb1=ctx.createRadialGradient(W*0.22,H*0.12,0,W*0.22,H*0.12,W*0.45);
  neb1.addColorStop(0,`rgba(${t.c},0.22)`); neb1.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=neb1; ctx.fillRect(0,0,W,H);
  const neb2=ctx.createRadialGradient(W*0.77,H*0.24,0,W*0.77,H*0.24,W*0.42);
  neb2.addColorStop(0,`rgba(${t.b},0.18)`); neb2.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=neb2; ctx.fillRect(0,0,W,H);
  const neb3=ctx.createRadialGradient(W*0.55,H*0.8,0,W*0.55,H*0.8,W*0.5);
  neb3.addColorStop(0,`rgba(${t.a},0.35)`); neb3.addColorStop(.7,`rgba(${t.a},0.12)`); neb3.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=neb3; ctx.fillRect(0,0,W,H);

  starParticles.forEach(s=>{
    s.a+=s.da; if(s.a<0.1||s.a>1) s.da*=-1;
    s.x+=s.vx; s.y+=s.vy;
    if(s.x<0) s.x=W; if(s.x>W) s.x=0; if(s.y<0) s.y=H; if(s.y>H) s.y=0;
    ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle=`hsla(${s.hue},90%,80%,${s.a*0.85})`; ctx.fill();
  });

  ctx.strokeStyle='rgba(120,170,255,.035)'; ctx.lineWidth=1;
  for(let i=0;i<=6;i++){
    ctx.beginPath(); ctx.moveTo(W*i/6,0); ctx.lineTo(W*i/6,H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,H*i/6); ctx.lineTo(W,H*i/6); ctx.stroke();
  }
}

function drawGalaxyMap(W,H){
  const galId=GALAXIES[gxGal].id;
  const sysList=SYSTEMS.filter(s=>s.gal===galId);
  for(let i=0;i<sysList.length;i++) for(let j=i+1;j<sysList.length;j++){
    const a=sysList[i], b=sysList[j];
    const dx=(a.x-b.x)*W, dy=(a.y-b.y)*H;
    const d=Math.sqrt(dx*dx+dy*dy);
    if(d<W*.42){
      const opa=Math.max(0.03,0.16*(1-d/(W*.42)));
      const grad=ctx.createLinearGradient(a.x*W,a.y*H,b.x*W,b.y*H);
      grad.addColorStop(0,`rgba(85,180,255,${opa})`);
      grad.addColorStop(.5,`rgba(170,120,255,${opa*1.2})`);
      grad.addColorStop(1,`rgba(85,255,220,${opa})`);
      ctx.strokeStyle=grad; ctx.lineWidth=1.2; ctx.setLineDash([4,10]);
      ctx.beginPath(); ctx.moveTo(a.x*W,a.y*H); ctx.lineTo(b.x*W,b.y*H); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  const typeColors={home:'#00ff88',mining:'#ffd700',trade:'#57d7ff',danger:'#ff5b6e',science:'#bc7dff',paradise:'#5dffcf'};
  sysList.forEach(sys=>{
    const x=sys.x*W, y=sys.y*H;
    const isCur=sys.id===G.sys, isSel=selSys===sys.id;
    const col=typeColors[sys.type]||'#9ab3d7';
    const glow=ctx.createRadialGradient(x,y,0,x,y,isCur?42:30);
    glow.addColorStop(0,isCur?'rgba(0,255,160,.32)':isSel?'rgba(110,190,255,.24)':`${hexToRgba(col,.16)}`);
    glow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(x,y,isCur?42:30,0,Math.PI*2); ctx.fill();

    if(sys.type==='danger'){
      const pulse=.3+.18*Math.sin(Date.now()*.003+sys.x*9);
      ctx.strokeStyle=`rgba(255,70,90,${pulse})`; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(x,y,18,0,Math.PI*2); ctx.stroke();
    }
    const inv=currentInv();
    if(inv&&inv.sysId===sys.id){
      const pulse=.5+.35*Math.sin(Date.now()*.006);
      ctx.strokeStyle=`rgba(255,45,120,${pulse})`; ctx.lineWidth=2.2;
      ctx.beginPath(); ctx.arc(x,y,22,0,Math.PI*2); ctx.stroke();
    }
    if(G.capturedSystems?.includes(sys.id)){
      ctx.strokeStyle='rgba(255,215,0,.5)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(x,y,20,0,Math.PI*2); ctx.stroke();
    }

    const r=isCur?14:11;
    const dotGrad=ctx.createRadialGradient(x-r*.35,y-r*.35,0,x,y,r);
    dotGrad.addColorStop(0,'rgba(255,255,255,.95)');
    dotGrad.addColorStop(.35,col); dotGrad.addColorStop(1,hexToRgba(col,.55));
    ctx.fillStyle=dotGrad; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    if(isSel){
      ctx.strokeStyle='rgba(255,255,255,.9)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(x,y,r+4,0,Math.PI*2); ctx.stroke();
    }

    const labelY=y-r-8;
    ctx.textAlign='center';
    ctx.fillStyle=isCur?'#7fffc7':'rgba(223,235,255,.9)';
    ctx.font=`700 ${isCur?13:11}px Inter`;
    ctx.fillText(sys.name,x,labelY);
    ctx.font='16px Inter';
    ctx.fillText(sys.emoji,x,y+5);
  });

  if(traveling&&travelTarget?.type==='system'&&selSys){
    const from=getSystemById(G.sys), to=getSystemById(selSys);
    if(from&&to) drawTravelShip(from.x*W,from.y*H,to.x*W,to.y*H,'🚀');
  }
}

function drawSystemMap(W,H){
  const sys=getSystemById(activeSystemId);
  if(!sys){ gxMode='galaxy'; updateGalaxyTopbar(); return; }
  const cx=W*0.52, cy=H*0.52;
  const starGlow=ctx.createRadialGradient(cx,cy,0,cx,cy,120);
  starGlow.addColorStop(0,'rgba(255,230,140,.42)'); starGlow.addColorStop(.45,'rgba(255,168,60,.18)'); starGlow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=starGlow; ctx.beginPath(); ctx.arc(cx,cy,120,0,Math.PI*2); ctx.fill();
  const starCore=ctx.createRadialGradient(cx-8,cy-8,6,cx,cy,34);
  starCore.addColorStop(0,'rgba(255,255,230,.95)'); starCore.addColorStop(.45,'rgba(255,214,90,.95)'); starCore.addColorStop(1,'rgba(255,116,30,.85)');
  ctx.fillStyle=starCore; ctx.beginPath(); ctx.arc(cx,cy,24,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle='rgba(255,220,120,.2)'; ctx.lineWidth=1;
  for(const p of planetNodes(sys)){
    ctx.beginPath(); ctx.ellipse(cx,cy,p.orbit,p.orbit*0.66,0,0,Math.PI*2); ctx.stroke();
  }

  const curPlanet=getPlanetIndex(sys.id);
  planetNodes(sys).forEach(p=>{
    const isCur=curPlanet===p.idx && sys.id===G.sys;
    const isSel=selPlanet===p.idx;
    const glow=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.size*2.8);
    glow.addColorStop(0,isCur?'rgba(0,255,160,.28)':isSel?'rgba(100,180,255,.2)':'rgba(90,140,255,.12)');
    glow.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(p.x,p.y,p.size*2.8,0,Math.PI*2); ctx.fill();

    ctx.fillStyle='rgba(255,255,255,.96)';
    ctx.font=`${p.size*1.7}px Inter`; ctx.textAlign='center';
    ctx.fillText(p.emoji,p.x,p.y+5);
    if(isSel||isCur){
      ctx.strokeStyle=isCur?'rgba(0,255,160,.85)':'rgba(255,255,255,.85)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.size+8,0,Math.PI*2); ctx.stroke();
    }
    ctx.fillStyle='rgba(222,233,255,.85)';
    ctx.font='600 11px Inter';
    ctx.fillText(p.name,p.x,p.y-p.size-12);
  });

  if(traveling&&travelTarget?.type==='planet'&&sys.id===activeSystemId){
    const nodes=planetNodes(sys);
    const from=nodes.find(n=>n.idx===getPlanetIndex(sys.id));
    const to=nodes.find(n=>n.idx===selPlanet);
    if(from&&to) drawTravelShip(from.x,from.y,to.x,to.y,'🛸');
  }
}

function drawTravelShip(x1,y1,x2,y2,icon){
  const px=x1+(x2-x1)*travelProg;
  const py=y1+(y2-y1)*travelProg;
  for(let t=1;t<=5;t++){
    const tp=Math.max(0,travelProg-t*0.045);
    const tx=x1+(x2-x1)*tp;
    const ty=y1+(y2-y1)*tp;
    ctx.beginPath(); ctx.arc(tx,ty,4.8-t*0.7,0,Math.PI*2);
    ctx.fillStyle=`rgba(103,214,255,${0.42-t*0.06})`; ctx.fill();
  }
  ctx.font='20px Inter'; ctx.textAlign='center'; ctx.fillText(icon,px,py+6);
}

function onGxClick(e){
  if(traveling) return;
  const rect=canvas.getBoundingClientRect();
  const mx=(e.clientX-rect.left)*(canvas.width/rect.width);
  const my=(e.clientY-rect.top)*(canvas.height/rect.height);
  if(gxMode==='galaxy'){
    const galId=GALAXIES[gxGal].id;
    let hit=null, minD=999;
    SYSTEMS.filter(s=>s.gal===galId).forEach(sys=>{
      const dx=sys.x*canvas.width-mx, dy=sys.y*canvas.height-my;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<36&&d<minD){ minD=d; hit=sys; }
    });
    if(hit){ selSys=hit.id; showSysPanel(hit); }
    else closePanel();
  } else {
    const sys=getSystemById(activeSystemId);
    if(!sys) return;
    let hit=null, minD=999;
    planetNodes(sys).forEach(p=>{
      const dx=p.x-mx, dy=p.y-my; const d=Math.sqrt(dx*dx+dy*dy);
      if(d<p.size+14&&d<minD){ minD=d; hit=p; }
    });
    if(hit){ selPlanet=hit.idx; showPlanetPanel(sys, hit); }
    else closePanel();
  }
}

function showSysPanel(sys){
  const isCur=sys.id===G.sys;
  const fc=calcFuelCost(sys);
  const days=isCur?0:travelDays(sys);
  const needWarp=sys.gal!==G.gal;
  const typeLabel={home:'🏠 База',mining:'⛏️ Добыча',trade:'🛒 Торговля',danger:'☠️ Опасно',science:'🔬 Наука',paradise:'🌿 Рай'}[sys.type]||'🌌 Система';
  document.getElementById('sp-nm').textContent=`${sys.emoji} ${sys.name}`;
  document.getElementById('sp-ds').innerHTML=
    `<span style="color:var(--muted2)">${typeLabel}</span> · ☠️ ${Math.round(sys.pc*100)}% · 🪐 ${(sys.planets||[sys.emoji]).length} планет`+
    (!isCur?` · ⚡ ${fc} топл. · 📅 ~${days} дн.`:' · вы уже в этой системе')+
    `<br><span style="color:#cfe6ff">${(sys.goods||[]).map(g=>GOODS[g]?.name||g).join(', ')}</span>`+
    (currentInv()?.sysId===sys.id?`<br><span style="color:#ff6f9f">⚠️ В системе идёт вторжение пришельцев</span>`:'');
  const fly=document.getElementById('fly-btn');
  const nav=document.getElementById('nav-btn');
  nav.textContent=isCur?'🪐 Открыть систему':'🔭 Просмотр системы';
  nav.disabled=false;
  if(isCur){ fly.textContent='✅ Вы в системе'; fly.disabled=true; }
  else if(needWarp&&!hasTech('warp')){ fly.textContent='🔒 Нужен варп'; fly.disabled=true; }
  else if(G.fuel<fc){ fly.textContent=`⚡ Нужно ${fc} топлива`; fly.disabled=true; }
  else { fly.textContent=`🚀 Лететь · -${fc}⚡`; fly.disabled=false; }
  travelTarget={type:'system', sysId:sys.id};
  document.getElementById('tv-bar').classList.remove('show');
  document.getElementById('sys-panel').classList.add('open');
}

function showPlanetPanel(sys, planet){
  const isInSystem=(sys.id===G.sys);
  const currentIdx=getPlanetIndex(sys.id);
  const tr=planetTravelCost(sys, planet.idx);
  const fly=document.getElementById('fly-btn');
  const nav=document.getElementById('nav-btn');
  const bonus=miningBonusForPlanet(sys, planet.idx);
  document.getElementById('sp-nm').textContent=`${planet.emoji} ${planet.name}`;
  document.getElementById('sp-ds').innerHTML=
    `<span style="color:var(--muted2)">Планета ${planet.idx+1} в системе ${sys.name}</span> · ⛏️ +${bonus}% добычи`+
    `<br><span style="color:#cfe6ff">Орбитальный маршрут: ${tr.fuel} топлива · ~${tr.days.toFixed(1)} дн.</span>`+
    (!isInSystem?`<br><span style="color:var(--gold)">Сначала доберитесь до системы ${sys.name}</span>`:'')+
    (currentIdx===planet.idx&&isInSystem?`<br><span style="color:var(--green)">Вы сейчас на орбите этой планеты</span>`:'');
  nav.textContent='🌌 К системам'; nav.disabled=false;
  if(!isInSystem){ fly.textContent='🚀 Сначала лететь в систему'; fly.disabled=true; }
  else if(currentIdx===planet.idx){ fly.textContent='✅ Орбита текущей планеты'; fly.disabled=true; }
  else if(G.fuel<tr.fuel){ fly.textContent=`⚡ Нужно ${tr.fuel} топлива`; fly.disabled=true; }
  else { fly.textContent=`🛸 Лететь · -${tr.fuel}⚡`; fly.disabled=false; }
  travelTarget={type:'planet', sysId:sys.id, planetIndex:planet.idx};
  document.getElementById('tv-bar').classList.remove('show');
  document.getElementById('sys-panel').classList.add('open');
}

function openSelectedSystem(){
  if(gxMode==='system'){ backToGalaxyView(); return; }
  if(!selSys) return;
  openSystemView(selSys);
}

function openSystemView(sysId){
  activeSystemId=sysId; gxMode='system'; selPlanet=getPlanetIndex(sysId); closePanel(false); updateGalaxyTopbar(); drawGalaxy();
  const sys=getSystemById(sysId);
  if(sys){
    const node=planetNodes(sys).find(n=>n.idx===selPlanet) || planetNodes(sys)[0];
    if(node) showPlanetPanel(sys,node);
  }
}

function backToGalaxyView(){
  gxMode='galaxy'; activeSystemId=null; selPlanet=null; travelTarget=null; closePanel(false); updateGalaxyTopbar(); drawGalaxy();
}

function closePanel(resetSelection=true){
  document.getElementById('sys-panel')?.classList.remove('open');
  if(resetSelection){ if(gxMode==='galaxy') selSys=null; else selPlanet=null; }
}

function doFly(){
  if(traveling||!travelTarget) return;
  if(travelTarget.type==='system') doFlyToSystem();
  else doFlyToPlanet();
}

function doFlyToSystem(){
  const sys=getSystemById(travelTarget.sysId||selSys);
  if(!sys) return;
  const fc=calcFuelCost(sys);
  if(hasTech('quantum')){
    G.sys=sys.id; G.gal=sys.gal; if(getPlanetIndex(sys.id)==null) setPlanetIndex(sys.id,0);
    afterArrive(sys); openSystemView(sys.id); return;
  }
  G.fuel=Math.max(0,G.fuel-fc);
  traveling=true; travelProg=0; selSys=sys.id;
  document.getElementById('fly-btn').disabled=true;
  document.getElementById('tv-bar').classList.add('show');
  const fill=document.getElementById('tv-f');
  const spd=hasTech('turbo')?0.055:0.035;
  const iv=setInterval(()=>{
    travelProg+=spd; fill.style.width=(travelProg*100)+'%';
    if(travelProg>=1){
      clearInterval(iv); traveling=false; travelProg=0;
      G.sys=sys.id; G.gal=sys.gal; if(getPlanetIndex(sys.id)==null) setPlanetIndex(sys.id,0);
      afterArrive(sys); openSystemView(sys.id);
    }
  },60);
}

function doFlyToPlanet(){
  const sys=getSystemById(travelTarget.sysId||activeSystemId);
  if(!sys) return;
  const idx=travelTarget.planetIndex ?? selPlanet;
  const tr=planetTravelCost(sys, idx);
  G.fuel=Math.max(0, G.fuel-tr.fuel);
  traveling=true; travelProg=0; selPlanet=idx;
  document.getElementById('fly-btn').disabled=true;
  document.getElementById('tv-bar').classList.add('show');
  const fill=document.getElementById('tv-f');
  const spd=0.06;
  const iv=setInterval(()=>{
    travelProg+=spd; fill.style.width=(travelProg*100)+'%';
    if(travelProg>=1){
      clearInterval(iv); traveling=false; travelProg=0;
      setPlanetIndex(sys.id, idx);
      if(sys.id===G.sys){
        G.day += Math.max(0, Math.floor(tr.days));
        while(G.day>30){ G.day-=30; G.month=(G.month||1)+1; if(G.month>12){ G.month=1; G.year=(G.year||2450)+1; } }
      }
      updateHUD(); renderMine();
      const node=planetNodes(sys).find(n=>n.idx===idx);
      if(node) showPlanetPanel(sys,node);
      toast(`🛸 Орбита: ${node?.name||'планета'}`,'good');
    }
  },60);
}

function afterArrive(sys){
  if(getPlanetIndex(sys.id)==null) setPlanetIndex(sys.id,0);
  updateHUD(); spawnDebris(); refreshQuests(); checkQuestProgress(); policeCheck(); renderMine();
  const galDanger=Math.max(0, GALAXIES.findIndex(g=>g.id===sys.gal));
  if(Math.random()<sys.pc+(galDanger*0.1)){
    const tier=Math.min(PIRATES.length-1,Math.floor(G.lvl/5)+galDanger);
    startCombat(tier);
    toast(`☠️ Перехват в ${sys.name}!`,'bad');
    goTo('more',null); setMoreTab('combat',null);
  } else {
    toast(`🚀 Прибыли: ${sys.name}`,'good');
  }
}

function hexToRgba(hex,a){
  const h=hex.replace('#','');
  const bigint=parseInt(h.length===3?h.split('').map(c=>c+c).join(''):h,16);
  const r=(bigint>>16)&255, g=(bigint>>8)&255, b=bigint&255;
  return `rgba(${r},${g},${b},${a})`;
}

window.addEventListener('resize',()=>{
  if(!canvas) return;
  const wrap=document.getElementById('gx-wrap');
  if(!wrap) return;
  canvas.width=wrap.clientWidth; canvas.height=Math.max(wrap.clientHeight,320);
  genStarParticles(); drawGalaxy();
});
