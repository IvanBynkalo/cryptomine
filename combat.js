// ═══════════════════════════════════════
//  combat.js — pirates + aliens
// ═══════════════════════════════════════

let alienInvasion=null;

function startCombat(tier){
  const p={...PIRATES[Math.min(PIRATES.length-1,tier)]};
  G.combat={...p,tier};
  G.combatLog=[`⚠️ Перехват: ${p.icon} ${p.name}`];
  renderMoreTab();
}

function findEnemy(){
  const sys=SYSTEMS.find(s=>s.id===G.sys);
  const galIdx=GALAXIES.findIndex(g=>g.id===G.gal);
  if(Math.random()<sys.pc+(galIdx*0.15)){
    const tier=Math.min(PIRATES.length-1,Math.floor(G.lvl/5)+galIdx);
    startCombat(tier);
    toast(`☠️ Пираты в ${sys.name}!`,'bad');
  } else {
    toast('🌌 Сектор чист','good');
  }
  renderMoreTab();
}

// checkAlienInvasion -> engine.js

function fightAlien(){
  if(!alienInvasion){toast('Нет вторжения','bad');return;}
  const al=ALIEN_TYPES.find(a=>a.id===alienInvasion.alienId)||ALIEN_TYPES[0];
  G.combat={...al,hp:al.maxHp,tier:6+al.threat,isAlien:true};
  G.combatLog=[`⚠️ Боевой контакт: ${al.icon} ${al.name}`,`💬 ${al.desc}`];
  toast(`${al.icon} Бой с ${al.name}!`,'bad');
  goTo('more',document.querySelector('.nb'));
  setMoreTab('combat',document.querySelector('.tc-btn'));
  renderMoreTab();
}

function coopRaid(){
  if(!alienInvasion){toast('Нет вторжения','bad');return;}
  const al=ALIEN_TYPES.find(a=>a.id===alienInvasion.alienId)||ALIEN_TYPES[0];
  const buddies=onlineRangers.filter(r=>!r.isMe).slice(0,2);
  G.combat={...al,hp:Math.round(al.maxHp*.4),maxHp:al.maxHp,tier:6+al.threat,isAlien:true,coop:true};
  G.combatLog=[`🤝 Кооп с: ${buddies.map(r=>r.name).join(', ')}`,`⚠️ ${al.name} ослаблен союзниками на 60%!`];
  toast(`🤝 Кооп бой начат!`,'good');
  setMoreTab('combat',null);renderMoreTab();
}

function combatAction(act){
  if(!G.combat){toast('Нет врага','bad');return;}
  const e=G.combat;
  const def=calcDefense();
  const eq=getEquipStats();

  // ── Player action ──
  let playerLog='';
  if(act==='attack'){
    let dmg=calcAttack()+Math.floor(Math.random()*8)-3;
    if(hasTech('singularity')&&Math.random()<.3){dmg*=3;playerLog=`🔵 КРИТ! ${e.name} -${dmg} ХП`;}
    else playerLog=`🔵 Атака → ${e.name} -${dmg} ХП`;
    e.hp=Math.max(0,e.hp-dmg);
  } else if(act==='missile'){
    if(G.missiles<=0){toast('Нет ракет!','bad');return;}
    G.missiles--;
    const dmg=calcMissileDmg()+Math.floor(Math.random()*15);
    playerLog=`🚀 Ракета → ${e.name} -${dmg} ХП`;
    e.hp=Math.max(0,e.hp-dmg);
  } else if(act==='repair'){
    if(G.cr<200){toast('💸 Нет 200 кр','bad');return;}
    if(G.hull>=G.maxHull){toast('Корпус цел','warn');return;}
    G.cr-=200;
    const rep=Math.round(25*(1+gSkill('engineering')*0.05));
    G.hull=Math.min(G.maxHull,G.hull+rep);
    playerLog=`🔧 Ремонт +${rep} ХП (-200 кр)`;
  } else if(act==='flee'){
    G.fuel=Math.max(0,G.fuel-Math.round(G.maxFuel*.25));
    G.combat=null;G.combatLog=[];
    toast('💨 Вы сбежали!');renderMoreTab();updateHUD();return;
  }
  if(playerLog) G.combatLog.push(playerLog);

  // ── Check win ──
  if(e.hp<=0){
    const loot=e.reward+Math.floor(G.lvl*30);
    G.cr+=loot;G.totalCr+=loot;
    G.rp+=e.xp*calcRpMult();G.xp+=e.xp;G.killCount++;
    G.totalKillReward=(G.totalKillReward||0)+loot;
    if(e.isAlien){
      alienInvasion=null;
      G.alienKills=(G.alienKills||0)+1;
      if(e.race){if(!G.alienKillsByRace)G.alienKillsByRace={};G.alienKillsByRace[e.race]=(G.alienKillsByRace[e.race]||0)+1;}
      addPoliceRep(G.gal,20);
      addLeagueScore(30);
      toast(`👽 Вторжение отражено! +${fmt(loot)} кр`,'good');
    } else {
      addPoliceRep(G.gal,2);
      addLeagueScore(5);
      toast(`🏆 Победа! +${fmt(loot)} кр`,'good');
    }
    G.quests.forEach(q=>{
      if(!q.done&&q.accepted&&q.type==='kill'&&e.tier>=(q.need?.tier||1)){
        q.progress=(q.progress||0)+1;
        if(q.progress>=q.need.count) completeQuest(q);
      }
    });
    G.combatLog.push(`🏆 Победа! +${fmt(loot)} кр, +${e.xp} НО`);
    G.combat=null;hapticN('success');lvlCheck();
    renderMoreTab();updateHUD();return;
  }

  // ── Enemy action ──
  let eDmg=Math.max(1,e.dmg+Math.floor(Math.random()*8)-3-def);
  if(e.special==='psi') eDmg=Math.max(1,e.dmg+Math.floor(Math.random()*8)-3-Math.floor(def*0.5));
  if(e.special==='berserk'&&e.hp<e.maxHp*0.3){ eDmg=Math.round(eDmg*2); G.combatLog.push(`💢 БЕРСЕРК!`); }

  e._turnCount=(e._turnCount||0)+1;
  if(e.special==='psi'&&e._turnCount%3===0){
    G.hull=Math.max(0,G.hull-Math.round(eDmg*0.5));
    G.combatLog.push(`🧿 Контроль разума! -${Math.round(eDmg*0.5)} ХП`);
    haptic('heavy');
  } else {
    const reflect=eq.reflect||0;
    if(hasTech('mirror')&&Math.random()<reflect){
      e.hp=Math.max(0,e.hp-Math.floor(eDmg*.5));
      G.combatLog.push(`🪞 Отражение! ${e.name} получил урон`);
    } else if(Math.random()<gSkill('piloting')*0.03){
      G.combatLog.push(`💨 Уклонение!`);
    } else {
      G.hull=Math.max(0,G.hull-eDmg);
      G.combatLog.push(`${e.isAlien?'🟣':'🔴'} ${e.name}: -${eDmg} ХП`);
    }
  }

  // Special abilities
  if(e.special==='split'&&!e._split&&e.hp<=e.maxHp*0.5){
    e._split=true; e.hp+=Math.round(e.hp*0.5);
    G.combatLog.push(`🟢 ДЕЛЕНИЕ! Клон появился — ХП восстановлено`);
  }
  if(e.special==='shield'&&e.hp>0){
    if(e._shieldStack===undefined) e._shieldStack=0;
    const regen=15+e._shieldStack; e._shieldStack+=2;
    e.hp=Math.min(e.maxHp,e.hp+regen);
    G.combatLog.push(`🔵 Щит +${regen} ХП (адапт.)`);
  }
  if(e.special==='drain'&&G.energy>0){
    const d=Math.min(G.energy,8); G.energy=Math.max(0,G.energy-d);
    G.combatLog.push(`⚡ ${e.name} высосал ${d} энергии`);
  }
  if(hasTech('regen'))   G.hull=Math.min(G.maxHull,G.hull+5);
  if(hasTech('fortress'))G.hull=Math.min(G.maxHull,G.hull+3);
  if(G.combatLog.length>12) G.combatLog=G.combatLog.slice(-12);

  // ── Check death ──
  if(G.hull<=0){
    G.hull=Math.max(1,Math.round(G.maxHull*.08));
    const penalty=Math.floor(G.cr*.25);
    G.cr=Math.max(0,G.cr-penalty);
    G.combat=null;G.combatLog=[];
    toast(`💀 Уничтожен! -${fmt(penalty)} кр`,'bad');
    hapticN('error');renderMoreTab();updateHUD();return;
  }
  haptic('medium');renderMoreTab();updateHUD();
}
