// ═══════════════════════════════════════
//  globals.js — early utilities
//  Loaded FIRST so all modules can use them
// ═══════════════════════════════════════

const tg = window.Telegram?.WebApp;

function haptic(t='light'){
  if(tg?.HapticFeedback) tg.HapticFeedback.impactOccurred(t);
}
function hapticN(t='success'){
  if(tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred(t);
}

let _tt;
function toast(msg, type=''){
  const t=document.getElementById('toast');
  if(!t) return;
  t.className='toast show '+(type||'');
  t.textContent=msg;
  clearTimeout(_tt);
  _tt=setTimeout(()=>t.classList.remove('show'), 3000);
}

function fmt(n){
  n=Math.floor(n||0);
  if(n>=1e9) return (n/1e9).toFixed(1)+'B';
  if(n>=1e6) return (n/1e6).toFixed(1)+'M';
  if(n>=1e3) return (n/1e3).toFixed(1)+'K';
  return n.toString();
}

// Safe deferred calls — engine/combat call these but UI loads later.
// They queue until UI is ready (or call immediately if already loaded).
let _uiReady = false;
// curScreen declared here so engine.js can read it before ui.js loads
var curScreen = 'mine';
