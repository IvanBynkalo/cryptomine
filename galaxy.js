// ═══════════════════════════════════════
//  galaxy.js — canvas star map
// ═══════════════════════════════════════

let canvas, ctx, selSys=null, gxGal=0, traveling=false, travelProg=0;
let starParticles=[]; // animated bg stars per galaxy

function initGalaxy(){
  canvas=document.getElementById('gx-c');
  const wrap=document.getElementById('gx-wrap');
  canvas.width=wrap.clientWidth;
  canvas.height=Math.max(wrap.clientHeight, 320);
  ctx=canvas.getContext('2d');
  genStarParticles();
  drawGalaxy();
  canvas.onclick=onGxClick;
}

function genStarParticles(){
  starParticles=[];
  const W=canvas.width, H=canvas.height;
  for(let i=0;i<60;i++){
    starParticles.push({
      x:Math.random()*W, y:Math.random()*H,
      r:Math.random()*1.2+0.2,
      a:Math.random(), da:(Math.random()-.5)*0.015,
      col:`hsl(${180+Math.random()*80},80%,80%)`
    });
  }
}

function setGalaxy(idx,btn){
  document.querySelectorAll('.gtab').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  gxGal=idx; selSys=null; closePanel();
  genStarParticles();
  drawGalaxy();
}

function drawGalaxy(){
  if(!canvas||!ctx) return;
  const W=canvas.width, H=canvas.height;
  ctx.clearRect(0,0,W,H);
  const galId=GALAXIES[gxGal].id;
  const sysList=SYSTEMS.filter(s=>s.gal===galId);

  // ── Background nebula ──
  const nebulaColors=[
    ['5,25,60','0,160,255'],   // alpha — blue
    ['40,10,50','180,0,255'],  // beta — purple
    ['10,40,20','0,255,120'],  // gamma — green
    ['60,5,5','255,40,0'],     // chaos — red
  ][gxGal];
  const bg=ctx.createRadialGradient(W*.5,H*.45,0,W*.5,H*.45,W*.85);
  bg.addColorStop(0,`rgba(${nebulaColors[0]},0.7)`);
  bg.addColorStop(0.5,`rgba(${nebulaColors[0]},0.3)`);
  bg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  // Second nebula blob offset
  const bg2=ctx.createRadialGradient(W*.75,H*.3,0,W*.75,H*.3,W*.5);
  bg2.addColorStop(0,`rgba(${nebulaColors[1]},0.12)`);
  bg2.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=bg2; ctx.fillRect(0,0,W,H);

  // ── Animated bg stars ──
  starParticles.forEach(s=>{
    s.a+=s.da;
    if(s.a<0) s.a=0, s.da*=-1;
    if(s.a>1) s.a=1, s.da*=-1;
    ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
    ctx.fillStyle=s.col.replace(')',`,${s.a})`).replace('hsl','hsla');
    ctx.fill();
  });

  // ── Grid lines (subtle hex feel) ──
  ctx.strokeStyle='rgba(0,150,220,.04)'; ctx.lineWidth=1;
  for(let i=0;i<=6;i++){
    ctx.beginPath(); ctx.moveTo(W*i/6,0); ctx.lineTo(W*i/6,H); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,H*i/6); ctx.lineTo(W,H*i/6); ctx.stroke();
  }

  // ── Connection lines ──
  for(let i=0;i<sysList.length;i++) for(let j=i+1;j<sysList.length;j++){
    const a=sysList[i], b=sysList[j];
    const dx=(a.x-b.x)*W, dy=(a.y-b.y)*H;
    const d=Math.sqrt(dx*dx+dy*dy);
    if(d<W*.42){
      const opa=Math.max(0.03,0.18*(1-d/(W*.42)));
      ctx.strokeStyle=`rgba(0,180,255,${opa})`; ctx.lineWidth=1;
      ctx.setLineDash([4,8]);
      ctx.beginPath(); ctx.moveTo(a.x*W,a.y*H); ctx.lineTo(b.x*W,b.y*H); ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // ── Systems ──
  const typeColors={
    home:'#00ff88', mining:'#ffd700', trade:'#00c8ff',
    danger:'#ff3a3a', science:'#a855f7', paradise:'#00ffcc'
  };
  sysList.forEach(sys=>{
    const x=sys.x*W, y=sys.y*H;
    const isCur=sys.id===G.sys;
    const isSel=selSys===sys.id;
    const col=typeColors[sys.type]||'#888';

    // outer glow
    if(isCur||isSel){
      const glow=ctx.createRadialGradient(x,y,0,x,y,34);
      glow.addColorStop(0,isCur?'rgba(0,255,136,.45)':'rgba(0,200,255,.35)');
      glow.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(x,y,34,0,Math.PI*2); ctx.fill();
    }

    // danger system pulse ring
    if(sys.type==='danger'){
      const pulse=.3+.2*Math.sin(Date.now()*.003+sys.x*10);
      ctx.strokeStyle=`rgba(255,58,58,${pulse})`; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(x,y,18,0,Math.PI*2); ctx.stroke();
    }

    // alien invasion marker
    const invasion=normalizeAlienInvasion(G.alienInvasion||alienInvasion);
    if(invasion&&invasion.sysId===sys.id){
      const pulse=.4+.4*Math.sin(Date.now()*.006);
      ctx.strokeStyle=`rgba(255,45,120,${pulse})`; ctx.lineWidth=2.5;
      ctx.beginPath(); ctx.arc(x,y,22,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle=`rgba(255,45,120,.15)`;
      ctx.beginPath(); ctx.arc(x,y,22,0,Math.PI*2); ctx.fill();
    }

    // captured marker
    if(G.capturedSystems&&G.capturedSystems.includes(sys.id)){
      ctx.fillStyle='rgba(255,215,0,.15)';
      ctx.beginPath(); ctx.arc(x,y,20,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='rgba(255,215,0,.5)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.arc(x,y,20,0,Math.PI*2); ctx.stroke();
    }

    // main dot
    const r=isCur?14:10;
    const dotGrad=ctx.createRadialGradient(x-r*.3,y-r*.3,0,x,y,r);
    dotGrad.addColorStop(0,'rgba(255,255,255,.9)');
    dotGrad.addColorStop(0.4,col);
    dotGrad.addColorStop(1,col+'88');
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle=dotGrad; ctx.fill();

    if(isSel){
      ctx.strokeStyle='rgba(255,255,255,.9)'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.arc(x,y,r+3,0,Math.PI*2); ctx.stroke();
    }

    // label
    ctx.fillStyle=isCur?'#00ff88':'rgba(180,220,255,.85)';
    ctx.font=`bold ${isCur?12:10}px 'Share Tech Mono'`; ctx.textAlign='center';
    ctx.fillText(sys.name,x,y-r-5);
    ctx.font='13px serif'; ctx.fillText(sys.emoji,x,y+4);
  });

  // ── Travelling ship ──
  if(traveling&&selSys){
    const from=SYSTEMS.find(s=>s.id===G.sys);
    const to=SYSTEMS.find(s=>s.id===selSys);
    if(from&&to){
      const px=(from.x+(to.x-from.x)*travelProg)*W;
      const py=(from.y+(to.y-from.y)*travelProg)*H;
      // engine trail
      for(let t=1;t<=4;t++){
        const tp=Math.max(0,travelProg-t*.04);
        const tx=(from.x+(to.x-from.x)*tp)*W;
        const ty=(from.y+(to.y-from.y)*tp)*H;
        ctx.beginPath(); ctx.arc(tx,ty,4-t*.7,0,Math.PI*2);
        ctx.fillStyle=`rgba(0,200,255,${0.5-t*.1})`; ctx.fill();
      }
      ctx.font='18px serif'; ctx.textAlign='center'; ctx.fillText('🚀',px,py);
    }
  }

  // schedule redraw for animations
  if(document.getElementById('sc-galaxy')?.classList.contains('active')){
    requestAnimationFrame(drawGalaxy);
  }
}

function onGxClick(e){
  if(traveling) return;
  const rect=canvas.getBoundingClientRect();
  const mx=(e.clientX-rect.left)*(canvas.width/rect.width);
  const my=(e.clientY-rect.top)*(canvas.height/rect.height);
  const galId=GALAXIES[gxGal].id;
  let hit=null, minD=999;
  SYSTEMS.filter(s=>s.gal===galId).forEach(sys=>{
    const dx=sys.x*canvas.width-mx, dy=sys.y*canvas.height-my;
    const d=Math.sqrt(dx*dx+dy*dy);
    if(d<34&&d<minD){minD=d;hit=sys;}
  });
  if(hit){selSys=hit.id;showSysPanel(hit);}
  else closePanel();
}

function showSysPanel(sys){
  const isCur=sys.id===G.sys;
  const fc=calcFuelCost(sys);
  const days=isCur?0:travelDays(sys);
  const needWarp=sys.gal!==G.gal;
  const typeLabel={home:'🏠 База',mining:'⛏️ Добыча',trade:'🛒 Торговля',danger:'☠️ Опасно',science:'🔬 Наука',paradise:'🌿 Рай'}[sys.type]||'';
  const canRefuelHere=['trade','paradise','home'].includes(sys.type);
  const planets=sys.planets||[sys.emoji];
  const currentPlanet=getPlanetIndex(sys.id);
  document.getElementById('sp-nm').textContent=`${sys.emoji} ${sys.name}`;
  document.getElementById('sp-ds').innerHTML=
    `<span style="color:var(--muted2)">${typeLabel}</span> &nbsp;·&nbsp; ☠️ ${Math.round(sys.pc*100)}% &nbsp;·&nbsp; ⚡ ${isCur?0:fc} топл.`+
    (!isCur?` &nbsp;·&nbsp; 📅 ~${days} дн.`:'')+
    (canRefuelHere?' &nbsp;<span style="color:var(--cyan)">⛽</span>':'')+
    `<br><span style="font-size:13px;letter-spacing:2px" title="Планеты системы">${planets.map((p,i)=> i===currentPlanet?`<b>${p}</b>`:p).join(' ')}</span>`+
    `<br><span style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">${planets.map((p,i)=>`<button class=\"btn btn-sm ${i===currentPlanet?'btn-c':''}\" onclick=\"event.stopPropagation();selectPlanet('${sys.id}',${i})\">${p} Планета ${i+1}</button>`).join('')}</span>`+
    (normalizeAlienInvasion(G.alienInvasion||alienInvasion)?.sysId===sys.id?`<br><span style="color:#ff2d78">⚠️ ВТОРЖЕНИЕ ПРИШЕЛЬЦЕВ!</span>`:'')+
    (sys.goods?`<br><span style="font-size:9px;color:var(--muted2)">Товары: ${sys.goods.map(g=>GOODS[g]?.name||g).join(', ')}</span>`:'');
  const btn=document.getElementById('fly-btn');
  if(isCur){btn.textContent='✅ Вы здесь';btn.disabled=true;}
  else if(needWarp&&!hasTech('warp')){btn.textContent='🔒 Нужен варп-ядро';btn.disabled=true;}
  else if(G.fuel<fc){btn.textContent=`⚡ Мало топлива (нужно ${fc})`;btn.disabled=true;}
  else{btn.textContent=`🚀 Лететь  -${fc}⚡ (~${days} дн.)`;btn.disabled=false;}
  document.getElementById('tv-bar').classList.remove('show');
  document.getElementById('sys-panel').classList.add('open');
}

function closePanel(){
  document.getElementById('sys-panel').classList.remove('open');
  selSys=null;
}

function selectPlanet(sysId, idx){
  if(!G.currentPlanetBySystem) G.currentPlanetBySystem={};
  const sys=SYSTEMS.find(s=>s.id===sysId);
  const planets=sys?.planets||[];
  G.currentPlanetBySystem[sysId]=Math.max(0,Math.min(planets.length-1,idx));
  if(selSys===sysId&&sys) showSysPanel(sys);
  updateHUD();
}

function doFly(){
  if(!selSys||traveling) return;
  const sys=SYSTEMS.find(s=>s.id===selSys);
  const fc=calcFuelCost(sys);
  if(hasTech('quantum')){
    G.sys=selSys; G.gal=sys.gal;
    if(!G.currentPlanetBySystem) G.currentPlanetBySystem={};
    if(G.currentPlanetBySystem[selSys]===undefined) G.currentPlanetBySystem[selSys]=0;
    afterArrive(sys); closePanel(); return;
  }
  G.fuel=Math.max(0,G.fuel-fc);
  traveling=true; travelProg=0;
  document.getElementById('fly-btn').disabled=true;
  document.getElementById('tv-bar').classList.add('show');
  const fill=document.getElementById('tv-f');
  const spd=hasTech('turbo')?0.055:0.035;
  const iv=setInterval(()=>{
    travelProg+=spd;
    fill.style.width=(travelProg*100)+'%';
    if(travelProg>=1){
      clearInterval(iv); traveling=false;
      G.sys=selSys; G.gal=sys.gal;
    if(!G.currentPlanetBySystem) G.currentPlanetBySystem={};
    if(G.currentPlanetBySystem[selSys]===undefined) G.currentPlanetBySystem[selSys]=0;
      afterArrive(sys); closePanel();
    }
  },60);
}

function afterArrive(sys){
  updateHUD(); spawnDebris(); refreshQuests(); checkQuestProgress(); policeCheck();
  if(Math.random()<sys.pc+(GALAXIES.findIndex(g=>g.id===sys.gal)*0.1)){
    const tier=Math.min(PIRATES.length-1,Math.floor(G.lvl/5)+GALAXIES.findIndex(g=>g.id===sys.gal));
    startCombat(tier);
    toast(`☠️ Перехват в ${sys.name}!`,'bad');
    goTo('more',null); setMoreTab('combat',null);
  } else {
    toast(`🚀 Прибыли: ${sys.name}`,'good');
  }
}

// resize handler
window.addEventListener('resize',()=>{
  if(!canvas) return;
  const wrap=document.getElementById('gx-wrap');
  canvas.width=wrap.clientWidth;
  canvas.height=Math.max(wrap.clientHeight,320);
  genStarParticles(); drawGalaxy();
});
