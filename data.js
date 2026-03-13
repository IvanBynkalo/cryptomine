// ═══════════════════════════════════════
//  SPACE RANGERS: IDLE WARS — data.js
// ═══════════════════════════════════════

const RANKS=[
  {name:'Новичок', minKills:0,  minLvl:1,  color:'#5a7590'},
  {name:'Скаут',   minKills:3,  minLvl:3,  color:'#00c8ff'},
  {name:'Рейнджер',minKills:8,  minLvl:6,  color:'#00ff88'},
  {name:'Ветеран', minKills:20, minLvl:10, color:'#ffd700'},
  {name:'Мастер',  minKills:50, minLvl:15, color:'#a855f7'},
  {name:'Легенда', minKills:120,minLvl:25, color:'#ff2d78'},
  {name:'Призрак', minKills:300,minLvl:40, color:'#00ffe5'},
];

// ── 14 галактик (4 базовых + 10 новых) ──
// unlock: минимальный уровень игрока
const GALAXIES=[
  {id:'alpha', name:'Альфа',    label:'🌌 Альфа',   danger:1, unlock:1,  color:'#00c8ff'},
  {id:'beta',  name:'Бета',     label:'💫 Бета',    danger:2, unlock:5,  color:'#a855f7'},
  {id:'gamma', name:'Гамма',    label:'⭐ Гамма',   danger:3, unlock:10, color:'#00ff88'},
  {id:'chaos', name:'Хаос',     label:'🔴 Хаос',    danger:4, unlock:18, color:'#ff3a3a'},
  // Новые галактики — требуют варп-ядро + уровень
  {id:'nebula',  name:'Туманность', label:'🌸 Туманность', danger:2, unlock:8,  color:'#ff9de2', reqTech:'warp'},
  {id:'iron',    name:'Железный Пояс',label:'⚙️ Железный Пояс',danger:3,unlock:12,color:'#aaa',reqTech:'warp'},
  {id:'void',    name:'Пустота',    label:'🕳️ Пустота',    danger:5, unlock:20, color:'#555', reqTech:'warp'},
  {id:'crystal', name:'Кристаллия', label:'💎 Кристаллия', danger:2, unlock:15, color:'#7df9ff',reqTech:'warp'},
  {id:'inferno', name:'Инферно',    label:'🔥 Инферно',    danger:5, unlock:22, color:'#ff6600',reqTech:'warp'},
  {id:'eden2',   name:'Новый Эден', label:'🌿 Новый Эден', danger:1, unlock:25, color:'#90ee90',reqTech:'quantum'},
  {id:'shadow',  name:'Тень',       label:'🌑 Тень',       danger:4, unlock:28, color:'#8888cc',reqTech:'warp'},
  {id:'storm',   name:'Шторм',      label:'⚡ Шторм',      danger:4, unlock:30, color:'#ffee00',reqTech:'warp'},
  {id:'ancient', name:'Древняя',    label:'🏛️ Древняя',    danger:3, unlock:35, color:'#d4a017',reqTech:'quantum'},
  {id:'omega',   name:'Омега',      label:'♾️ Омега',      danger:6, unlock:45, color:'#ff00ff',reqTech:'omega'},
];

const SYSTEMS=[
  // ── ALPHA ──
  {id:'sol',   gal:'alpha',name:'Солнечная',x:.5, y:.45,type:'home',   emoji:'🌍',fuelCost:0, pc:.05,goods:['ore','food','tech'],     planets:['🌍','🌕','🔴','⚫']},
  {id:'kep',   gal:'alpha',name:'Кеплер',   x:.2, y:.3, type:'mining', emoji:'🪐',fuelCost:10,pc:.18,goods:['ore','minerals','fuel'],  planets:['🪐','🟠','⚫']},
  {id:'vega',  gal:'alpha',name:'Вега',     x:.78,y:.22,type:'trade',  emoji:'🌟',fuelCost:14,pc:.1, goods:['tech','food','medicine'], planets:['🔵','🟢','🌕']},
  {id:'nova',  gal:'alpha',name:'Нова Кор', x:.3, y:.72,type:'science',emoji:'💜',fuelCost:18,pc:.12,goods:['tech','medicine','food'], planets:['💜','🔵','⚪']},
  {id:'icarus',gal:'alpha',name:'Икар',     x:.65,y:.15,type:'mining', emoji:'🟠',fuelCost:22,pc:.22,goods:['fuel','minerals','ore'],  planets:['🟠','⚫','🟤']},
  // ── BETA ──
  {id:'dragon',gal:'beta', name:'Дракон',  x:.85,y:.6, type:'danger', emoji:'🔴',fuelCost:16,pc:.5, goods:['minerals','weapons','ore'],  planets:['🔴','⚫','💀']},
  {id:'eden',  gal:'beta', name:'Эден',    x:.45,y:.8, type:'paradise',emoji:'🟢',fuelCost:25,pc:.08,goods:['food','medicine','fuel'],   planets:['🟢','💚','🌕','🔵']},
  {id:'ares',  gal:'beta', name:'Арес',    x:.2, y:.5, type:'danger', emoji:'🔥',fuelCost:20,pc:.45,goods:['weapons','minerals','ore'],  planets:['🔥','🟤','⚫']},
  {id:'nexus', gal:'beta', name:'Нексус',  x:.6, y:.3, type:'trade',  emoji:'💠',fuelCost:23,pc:.15,goods:['tech','food','medicine'],   planets:['💠','🔵','🟣']},
  {id:'pulse', gal:'beta', name:'Пульсар', x:.15,y:.2, type:'science',emoji:'⚡',fuelCost:30,pc:.2, goods:['fuel','tech','minerals'],   planets:['⚡','🔵','⚪']},
  // ── GAMMA ──
  {id:'abad',  gal:'gamma',name:'Абаддон', x:.15,y:.6, type:'danger', emoji:'⚫',fuelCost:28,pc:.7, goods:['weapons','minerals','tech'],  planets:['⚫','💀','🖤']},
  {id:'zion',  gal:'gamma',name:'Зион',    x:.5, y:.35,type:'trade',  emoji:'🔵',fuelCost:33,pc:.12,goods:['tech','food','medicine'],    planets:['🔵','🟢','💠','🌕']},
  {id:'forge', gal:'gamma',name:'Кузница', x:.82,y:.7, type:'mining', emoji:'⚙️',fuelCost:36,pc:.3, goods:['ore','minerals','weapons'],  planets:['⚙️','🟤','⚫']},
  {id:'arcane',gal:'gamma',name:'Аркейн',  x:.35,y:.8, type:'science',emoji:'🌀',fuelCost:40,pc:.18,goods:['tech','medicine','fuel'],    planets:['🌀','💜','🔵']},
  {id:'abyss', gal:'gamma',name:'Бездна',  x:.7, y:.15,type:'danger', emoji:'🖤',fuelCost:42,pc:.6, goods:['weapons','minerals','ore'],  planets:['🖤','⚫','💀']},
  // ── CHAOS ──
  {id:'entropy',gal:'chaos',name:'Энтропия',x:.5,y:.5, type:'danger', emoji:'💀',fuelCost:36,pc:.85,goods:['weapons','minerals','tech'], planets:['💀','⚫','🌑']},
  {id:'rift',   gal:'chaos',name:'Разлом',  x:.25,y:.3,type:'danger', emoji:'🌑',fuelCost:40,pc:.75,goods:['weapons','ore','fuel'],      planets:['🌑','⚫','🖤']},
  {id:'vortex', gal:'chaos',name:'Вортекс', x:.75,y:.65,type:'danger',emoji:'🌪️',fuelCost:42,pc:.9, goods:['weapons','minerals','tech'], planets:['🌪️','💀','⚫']},
  {id:'sanctum',gal:'chaos',name:'Санктум', x:.4, y:.75,type:'trade', emoji:'🏯',fuelCost:48,pc:.4, goods:['tech','medicine','food'],    planets:['🏯','💜','🔵']},
  // ── ТУМАННОСТЬ ──
  {id:'rosia',  gal:'nebula',name:'Розария',  x:.5, y:.4, type:'paradise',emoji:'🌸',fuelCost:33,pc:.12,goods:['food','medicine','fuel'],  planets:['🌸','🟣','🔵']},
  {id:'mira',   gal:'nebula',name:'Мира',     x:.25,y:.25,type:'science', emoji:'🌺',fuelCost:36,pc:.15,goods:['tech','medicine','food'],  planets:['🌺','💜','⚪']},
  {id:'azure',  gal:'nebula',name:'Лазурь',   x:.72,y:.2, type:'trade',   emoji:'🔮',fuelCost:40,pc:.2, goods:['tech','food','minerals'], planets:['🔮','🔵','🌕']},
  {id:'silk',   gal:'nebula',name:'Шёлк',     x:.35,y:.7, type:'trade',   emoji:'🩷',fuelCost:68,pc:.18,goods:['medicine','food','tech'], planets:['🩷','💗','🌸']},
  {id:'haze',   gal:'nebula',name:'Дымка',    x:.8, y:.65,type:'mining',  emoji:'🌫️',fuelCost:62,pc:.3, goods:['ore','fuel','minerals'],  planets:['🌫️','⚫','🟤']},
  // ── ЖЕЛЕЗНЫЙ ПОЯС ──
  {id:'anvil',  gal:'iron',name:'Наковальня', x:.45,y:.3, type:'mining',  emoji:'🔩',fuelCost:42,pc:.4, goods:['ore','minerals','weapons'],planets:['🔩','⚙️','🟤']},
  {id:'furnace',gal:'iron',name:'Домна',      x:.2, y:.55,type:'mining',  emoji:'🏗️',fuelCost:45,pc:.35,goods:['ore','minerals','fuel'],  planets:['🏗️','🟤','⚫']},
  {id:'bastion',gal:'iron',name:'Бастион',    x:.75,y:.4, type:'danger',  emoji:'🛡️',fuelCost:72,pc:.55,goods:['weapons','tech','minerals'],planets:['🛡️','⚫','🔴']},
  {id:'depot',  gal:'iron',name:'Депо',       x:.55,y:.75,type:'trade',   emoji:'📦',fuelCost:68,pc:.2, goods:['tech','food','ore'],      planets:['📦','🔵','🟠']},
  {id:'scrap',  gal:'iron',name:'Металлолом', x:.3, y:.15,type:'mining',  emoji:'♻️',fuelCost:40,pc:.45,goods:['minerals','ore','fuel'],  planets:['♻️','🟤','⚫']},
  // ── ПУСТОТА ──
  {id:'null',   gal:'void',name:'Нуль-точка',  x:.5, y:.5, type:'danger', emoji:'🕳️',fuelCost:55,pc:.9, goods:['weapons','tech','minerals'],planets:['🕳️','⚫','💀']},
  {id:'echo',   gal:'void',name:'Эхо',         x:.2, y:.3, type:'science',emoji:'👁️',fuelCost:51,pc:.6, goods:['tech','fuel','medicine'], planets:['👁️','⚫','🌑']},
  {id:'phantom',gal:'void',name:'Фантом',      x:.75,y:.25,type:'danger', emoji:'💨',fuelCost:53,pc:.8, goods:['weapons','ore','fuel'],   planets:['💨','⚫','🖤']},
  {id:'oblivion',gal:'void',name:'Забвение',   x:.35,y:.75,type:'danger', emoji:'🌑',fuelCost:56,pc:.85,goods:['weapons','minerals','tech'],planets:['🌑','💀','⚫']},
  {id:'singularity_sys',gal:'void',name:'Сингулярность',x:.65,y:.65,type:'science',emoji:'⭕',fuelCost:58,pc:.7,goods:['tech','fuel','medicine'],planets:['⭕','⚫','🌀']},
  // ── КРИСТАЛЛИЯ ──
  {id:'prism',  gal:'crystal',name:'Призма',   x:.5, y:.35,type:'trade',  emoji:'💎',fuelCost:45,pc:.15,goods:['tech','medicine','food'],  planets:['💎','🔵','⚪']},
  {id:'quartz', gal:'crystal',name:'Кварц',    x:.25,y:.55,type:'mining', emoji:'🔷',fuelCost:47,pc:.25,goods:['ore','minerals','fuel'],   planets:['🔷','💠','⚪']},
  {id:'amber',  gal:'crystal',name:'Янтарь',   x:.72,y:.6, type:'science',emoji:'🟡',fuelCost:48,pc:.2, goods:['tech','medicine','food'], planets:['🟡','🟠','💛']},
  {id:'sapphire',gal:'crystal',name:'Сапфир',  x:.4, y:.2, type:'paradise',emoji:'🔹',fuelCost:72,pc:.1, goods:['food','medicine','fuel'],planets:['🔹','💙','🌕']},
  {id:'obsidian',gal:'crystal',name:'Обсидиан',x:.8, y:.25,type:'danger', emoji:'⬛',fuelCost:50,pc:.5, goods:['weapons','minerals','ore'],planets:['⬛','⚫','🖤']},
  // ── ИНФЕРНО ──
  {id:'magma',  gal:'inferno',name:'Магма',    x:.5, y:.5, type:'danger', emoji:'🌋',fuelCost:58,pc:.9, goods:['ore','minerals','weapons'],planets:['🌋','🔴','⚫']},
  {id:'cinder', gal:'inferno',name:'Зола',     x:.2, y:.3, type:'mining', emoji:'🔥',fuelCost:53,pc:.6, goods:['ore','fuel','minerals'],   planets:['🔥','🟤','⚫']},
  {id:'hellgate',gal:'inferno',name:'Врата',   x:.75,y:.65,type:'danger', emoji:'😈',fuelCost:56,pc:.85,goods:['weapons','tech','ore'],    planets:['😈','💀','🔴']},
  {id:'ember',  gal:'inferno',name:'Уголь',    x:.35,y:.75,type:'trade',  emoji:'♨️',fuelCost:51,pc:.4, goods:['tech','weapons','fuel'],   planets:['♨️','🔴','🟤']},
  {id:'flare',  gal:'inferno',name:'Вспышка',  x:.65,y:.15,type:'science',emoji:'☀️',fuelCost:55,pc:.5, goods:['tech','medicine','fuel'],  planets:['☀️','🟡','⚫']},
  // ── НОВЫЙ ЭДЕН ──
  {id:'genesis',gal:'eden2',name:'Генезис',   x:.5, y:.4, type:'paradise',emoji:'🌍',fuelCost:62,pc:.05,goods:['food','medicine','tech'], planets:['🌍','🌕','🌿','🌊']},
  {id:'haven',  gal:'eden2',name:'Пристань',  x:.25,y:.6, type:'trade',  emoji:'⚓',fuelCost:58, pc:.1, goods:['tech','food','medicine'], planets:['⚓','🔵','🟢']},
  {id:'bloom',  gal:'eden2',name:'Цветение',  x:.72,y:.3, type:'paradise',emoji:'🌸',fuelCost:60, pc:.08,goods:['food','medicine','fuel'], planets:['🌸','🟢','💚']},
  {id:'harmony',gal:'eden2',name:'Гармония',  x:.4, y:.2, type:'science',emoji:'☯️',fuelCost:62,pc:.12,goods:['tech','medicine','food'],  planets:['☯️','💜','🔵']},
  {id:'utopia', gal:'eden2',name:'Утопия',    x:.8, y:.7, type:'trade',  emoji:'🏙️',fuelCost:64,pc:.08,goods:['tech','food','medicine'], planets:['🏙️','🔵','🌕']},
  // ── ТЕНЬ ──
  {id:'umbra',  gal:'shadow',name:'Умбра',    x:.5, y:.45,type:'danger', emoji:'🌑',fuelCost:53,pc:.75,goods:['weapons','minerals','tech'],planets:['🌑','⚫','🖤']},
  {id:'whisper',gal:'shadow',name:'Шёпот',    x:.25,y:.3, type:'science',emoji:'🔮',fuelCost:50,pc:.5, goods:['tech','medicine','fuel'],   planets:['🔮','🌑','⚫']},
  {id:'spectre',gal:'shadow',name:'Призрак',  x:.72,y:.6, type:'danger', emoji:'👻',fuelCost:52,pc:.8, goods:['weapons','ore','minerals'], planets:['👻','⚫','🖤']},
  {id:'veil',   gal:'shadow',name:'Завеса',   x:.38,y:.75,type:'trade',  emoji:'🌫️',fuelCost:50,pc:.35,goods:['tech','food','weapons'],    planets:['🌫️','🌑','🔵']},
  {id:'dusk',   gal:'shadow',name:'Сумерки',  x:.65,y:.2, type:'mining', emoji:'🌒',fuelCost:48,pc:.45,goods:['ore','minerals','fuel'],    planets:['🌒','⚫','🟤']},
  // ── ШТОРМ ──
  {id:'tempest',gal:'storm',name:'Буря',       x:.5, y:.5, type:'danger', emoji:'⛈️',fuelCost:56,pc:.8, goods:['weapons','fuel','minerals'],planets:['⛈️','⚫','🌪️']},
  {id:'bolt',   gal:'storm',name:'Молния',     x:.22,y:.28,type:'science',emoji:'⚡',fuelCost:53,pc:.55,goods:['tech','fuel','minerals'],   planets:['⚡','🔵','⚪']},
  {id:'cyclone',gal:'storm',name:'Циклон',     x:.75,y:.35,type:'danger', emoji:'🌀',fuelCost:55,pc:.75,goods:['weapons','ore','fuel'],     planets:['🌀','⚫','💀']},
  {id:'gale',   gal:'storm',name:'Шквал',      x:.38,y:.72,type:'trade',  emoji:'🌬️',fuelCost:52,pc:.4, goods:['tech','food','medicine'],   planets:['🌬️','🔵','🌕']},
  {id:'thunder',gal:'storm',name:'Гром',       x:.65,y:.2, type:'mining', emoji:'🥁',fuelCost:50,pc:.5, goods:['ore','minerals','weapons'],  planets:['🥁','🟤','⚫']},
  // ── ДРЕВНЯЯ ──
  {id:'ruin',   gal:'ancient',name:'Руины',    x:.5, y:.4, type:'science',emoji:'🏛️',fuelCost:64,pc:.4, goods:['tech','medicine','food'],  planets:['🏛️','🟤','⚫']},
  {id:'temple', gal:'ancient',name:'Храм',     x:.25,y:.55,type:'science',emoji:'⛩️',fuelCost:66,pc:.35,goods:['tech','medicine','minerals'],planets:['⛩️','🏛️','⚪']},
  {id:'obelisk',gal:'ancient',name:'Обелиск',  x:.72,y:.3, type:'trade',  emoji:'🗿',fuelCost:65,pc:.3, goods:['tech','food','medicine'],  planets:['🗿','🟤','🔵']},
  {id:'crypt',  gal:'ancient',name:'Крипта',   x:.4, y:.2, type:'danger', emoji:'⚰️',fuelCost:68,pc:.6, goods:['weapons','minerals','tech'],planets:['⚰️','⚫','💀']},
  {id:'oracle', gal:'ancient',name:'Оракул',   x:.8, y:.7, type:'science',emoji:'🔭',fuelCost:70,pc:.35,goods:['tech','fuel','medicine'],  planets:['🔭','💜','⚪']},
  // ── ОМЕГА ──
  {id:'omega_prime',gal:'omega',name:'Омега-Прайм',x:.5,y:.5,type:'danger',emoji:'♾️',fuelCost:92,pc:.99,goods:['weapons','tech','minerals'],planets:['♾️','💀','⚫','🌑']},
  {id:'nexus2',gal:'omega',name:'Нексус-Z',    x:.25,y:.3, type:'trade',  emoji:'🌐',fuelCost:85,pc:.7, goods:['tech','medicine','food'],   planets:['🌐','💠','🔵']},
  {id:'zenith', gal:'omega',name:'Зенит',      x:.72,y:.6, type:'science',emoji:'🌟',fuelCost:88,pc:.75,goods:['tech','fuel','medicine'],   planets:['🌟','💜','⚪']},
  {id:'abyss2', gal:'omega',name:'Бездна-Икс', x:.38,y:.75,type:'danger', emoji:'🕳️',fuelCost:95,pc:.95,goods:['weapons','minerals','ore'], planets:['🕳️','⚫','💀']},
  {id:'eternity',gal:'omega',name:'Вечность',  x:.65,y:.2, type:'paradise',emoji:'⭐',fuelCost:82,pc:.4, goods:['food','medicine','tech'],  planets:['⭐','🌟','🌕','🟢']},
];

const GOODS={
  ore:     {name:'Руда',           icon:'⛏️',base:40},
  minerals:{name:'Минералы',       icon:'💎',base:120},
  food:    {name:'Продовольствие', icon:'🌾',base:60},
  tech:    {name:'Технологии',     icon:'🔬',base:200},
  fuel:    {name:'Топливо',        icon:'⚡',base:80},
  medicine:{name:'Медикаменты',    icon:'💊',base:150},
  weapons: {name:'Оружие',         icon:'⚔️',base:300},
};

const SHIP_UPGRADES=[
  {id:'drill',  icon:'⛏️',name:'Бур',        desc:'+2/клик',     costs:[150,600,2500,10000]},
  {id:'laser',  icon:'🔴',name:'Лазер',      desc:'+4 урона',    costs:[300,1200,5000,20000]},
  {id:'cargo',  icon:'📦',name:'Трюм',       desc:'+10 слотов',  costs:[500,2000,8000,30000]},
  {id:'engine', icon:'🚀',name:'Двигатель',  desc:'-25% топлива',costs:[800,3500,15000,60000]},
  {id:'shield', icon:'🛡️',name:'Щит',        desc:'+30 макс ХП', costs:[600,2500,10000,40000]},
  {id:'scanner',icon:'📡',name:'Сканер',     desc:'+0.5× науки', costs:[1000,4000,18000,70000]},
];

const HELPERS=[
  {id:'miner',  icon:'🤖',name:'Авто-майнер',  cps:2,   cost:800,    costM:1.6},
  {id:'drone',  icon:'🚁',name:'Дрон-сборщик', cps:12,  cost:8000,   costM:1.65},
  {id:'station',icon:'🏭',name:'Орбит-станция',cps:60,  cost:60000,  costM:1.75},
  {id:'ai',     icon:'🧬',name:'ИИ-ядро',      cps:300, cost:500000, costM:1.9},
];

const TECH={
  weapons:[
    {id:'plasma',      icon:'🌀',name:'Плазма I',       eff:'+8 урона',        cost:500,    rp:30,  req:null},
    {id:'torpedo',     icon:'🚀',name:'Торпеды',        eff:'+3 ракеты в бою', cost:1500,   rp:60,  req:'plasma'},
    {id:'ionbeam',     icon:'⚡',name:'Ион-луч',        eff:'+15 урона',       cost:4000,   rp:120, req:'torpedo'},
    {id:'antimatter',  icon:'💥',name:'Антиматерия',    eff:'×2 урон ракет',   cost:12000,  rp:300, req:'ionbeam'},
    {id:'singularity', icon:'🌑',name:'Сингулярность',  eff:'Крит 30%×3',      cost:40000,  rp:900, req:'antimatter'},
    {id:'plasma2',     icon:'🌀',name:'Плазма II',      eff:'+20 урона доп.',  cost:2000,   rp:80,  req:'plasma'},
    {id:'scatter_t',   icon:'💢',name:'Рассеивание',    eff:'+2 попадания',    cost:6000,   rp:200, req:'plasma2'},
    {id:'emp_tech',    icon:'⚡',name:'ЭМИ-технология', eff:'-20 энергии врага',cost:45000, rp:900, req:'scatter_t'},
  ],
  shields:[
    {id:'armor',       icon:'🔩',name:'Броня I',        eff:'+50 ХП',          cost:400,    rp:20,  req:null},
    {id:'regen',       icon:'🔋',name:'Регенерация',    eff:'+5 ХП/сек',       cost:1200,   rp:50,  req:'armor'},
    {id:'mirror',      icon:'🪞',name:'Зеркальное поле',eff:'20% отражение',   cost:3500,   rp:130, req:'regen'},
    {id:'nullfield',   icon:'🌐',name:'Нуль-поле',      eff:'-35% вх. урона',  cost:9000,   rp:320, req:'mirror'},
    {id:'fortress',    icon:'🏰',name:'Крепость',       eff:'Авт-ремонт 3/сек',cost:28000,  rp:800, req:'nullfield'},
    {id:'armor2',      icon:'🔩',name:'Броня II',       eff:'+120 ХП',         cost:1800,   rp:70,  req:'armor'},
    {id:'reactive',    icon:'💢',name:'Реактивная броня',eff:'Контратака 15%', cost:1800,   rp:80,  req:'armor2'},
    {id:'nanoshield',  icon:'🌟',name:'Нано-щит',       eff:'Регенерация в бою',cost:50000, rp:1500,req:'reactive'},
  ],
  engines:[
    {id:'turbo',       icon:'🔥',name:'Турбо',          eff:'-30% топлива',    cost:600,    rp:25,  req:null},
    {id:'warp',        icon:'🌌',name:'Варп-ядро',      eff:'Новые галактики', cost:6000,   rp:220, req:'turbo'},
    {id:'quantum',     icon:'✨',name:'Квантум',         eff:'Мгновенный перелёт',cost:18000,rp:600, req:'warp'},
    {id:'omega',       icon:'♾️',name:'Омега-драйв',    eff:'Галактика Омега', cost:30000,  rp:1000,req:'quantum'},
    {id:'afterburner', icon:'💨',name:'Форсаж',         eff:'-15% топлива доп.',cost:4000,  rp:150, req:'turbo'},
    {id:'fuel_cells',  icon:'⚗️',name:'Топливные ячейки',eff:'+30 макс. топлива',cost:9000, rp:300, req:'afterburner'},
    {id:'gravdrive',   icon:'🌀',name:'Гравитационный',  eff:'-50% перехватов', cost:30000, rp:900, req:'fuel_cells'},
  ],
  mining:[
    {id:'nanodrill',   icon:'🔬',name:'Нано-бур',       eff:'+5 добычи/клик', cost:300,    rp:15,  req:null},
    {id:'orbital',     icon:'🛸',name:'Орб-майнер',     eff:'+20 кр/сек',     cost:1500,   rp:60,  req:'nanodrill'},
    {id:'stellar',     icon:'⭐',name:'Звёздный коллектор',eff:'+100 кр/сек', cost:7000,   rp:220, req:'orbital'},
    {id:'galactic',    icon:'🌌',name:'Галакт-жнец',    eff:'+500 кр/сек',    cost:35000,  rp:800, req:'stellar'},
    {id:'deep_core',   icon:'⛏️',name:'Глубинное ядро', eff:'+10 добычи/клик',cost:800,    rp:30,  req:'nanodrill'},
    {id:'resonance',   icon:'🔊',name:'Резонанс',       eff:'+50% клик в шторм',cost:8000, rp:280, req:'deep_core'},
    {id:'antimatter_m',icon:'💠',name:'Антим. добыча',  eff:'+2× при крите',  cost:5000,   rp:180, req:'resonance'},
  ],
  science:[
    {id:'scanner_plus',icon:'📡',name:'Расширенный скан',eff:'+0.5 НО/сек',   cost:500,    rp:20,  req:null},
    {id:'xenolab',     icon:'🧬',name:'Ксено-лаборатория',eff:'+20% НО везде',cost:2500,   rp:90,  req:'scanner_plus'},
    {id:'deepfield',   icon:'🔭',name:'Глубинное поле', eff:'Аномалии +30%',  cost:7000,   rp:280, req:'xenolab'},
    {id:'omni_scan',   icon:'👁️',name:'Омни-сканер',    eff:'Видит все системы',cost:50000,rp:1800,req:'deepfield'},
    {id:'rp_boost',    icon:'⚗️',name:'НО-усилитель I', eff:'+25% к НО',      cost:1000,   rp:45,  req:'scanner_plus'},
    {id:'rp_boost2',   icon:'🧪',name:'НО-усилитель II',eff:'+50% к НО',      cost:15000,  rp:500, req:'rp_boost'},
  ],
};

const SKILLS_DEF=[
  {id:'attack',    icon:'⚔️',name:'Атака',        desc:'Урон в бою',          perLvl:'+5% урон'},
  {id:'defense',   icon:'🛡️',name:'Защита',       desc:'Снижение вх урона',   perLvl:'-4% вх урон'},
  {id:'piloting',  icon:'🚀',name:'Пилотирование',desc:'Уклонение в бою',     perLvl:'+3% уклонение'},
  {id:'trade',     icon:'💰',name:'Торговля',      desc:'Лучшие цены продажи', perLvl:'+3% цены'},
  {id:'charm',     icon:'😎',name:'Обаяние',       desc:'Награды за задания',  perLvl:'+5% квесты'},
  {id:'eloquence', icon:'🗣️',name:'Красноречие',  desc:'Скидка при покупке',  perLvl:'-2% покупки'},
  {id:'intellect', icon:'🧠',name:'Интеллект',     desc:'Больше науч.очков',   perLvl:'+8% науки'},
  {id:'luck',      icon:'🍀',name:'Удача',         desc:'Двойная добыча',      perLvl:'+2% шанс'},
  {id:'engineering',icon:'🔧',name:'Инженерия',   desc:'Рег.энергии и ремонт',perLvl:'+5%'},
];

// EQUIPMENT — алиас к EQUIPMENT_CATALOG (определён в equipment_catalog.js)
// Используется в getEquipStats() и старом коде. Будет доступен после загрузки каталога.
// Для обратной совместимости — базовые стартовые айтемы дублируются здесь как fallback
const EQUIPMENT_LEGACY=[
  {id:'hull_scout',  cat:'hull',  icon:'🚀',name:'Скаут',      tier:1,stats:{maxHull:80, cargo:15},         cost:0,   price:0,   desc:'Лёгкий корпус'},
  {id:'eng_basic',   cat:'engine',icon:'🔥',name:'Базовый двиг.',tier:1,stats:{fuelMod:0},    cost:0,   price:0,   desc:'Стандарт'},
  {id:'wpn_laser',   cat:'weapon',icon:'🔴',name:'Лазер',      tier:1,stats:{atk:5},        cost:0,   price:0,   desc:'+5 урона'},
  {id:'shld_basic',  cat:'shield',icon:'🔵',name:'Базовый щит', tier:1,stats:{def:0},        cost:0,   price:0,   desc:'Нет бонуса'},
];
// EQUIPMENT будет переопределён после загрузки equipment_catalog.js
var EQUIPMENT = EQUIPMENT_LEGACY;

const RANGER_BOTS=[
  {id:'trader',  icon:'🤝',name:'Бот-торговец', desc:'Колеблет рыночные цены. Поддержка торговой стратегии.',  cost:10000},
  {id:'miner_b', icon:'⛏️',name:'Бот-майнер',  desc:'Символическая добыча. Главный доход — ваши руки.',       cost:15000},
  {id:'hunter',  icon:'🎯',name:'Бот-охотник', desc:'Засчитывает убийства для заданий и рейтинга.',            cost:25000},
  {id:'scout',   icon:'🔭',name:'Бот-разведчик',desc:'Пассивное накопление НО для исследований.',              cost:20000},
];

const PIRATES=[
  {name:'Разбойник',     icon:'🏴',hp:60,  maxHp:60,  dmg:8, reward:250, xp:20,  tier:0},
  {name:'Пират',         icon:'☠️',hp:130, maxHp:130, dmg:14,reward:650, xp:50,  tier:1},
  {name:'Корсар',        icon:'⚔️',hp:280, maxHp:280, dmg:22,reward:1500,xp:110, tier:2},
  {name:'Капер',         icon:'🗡️',hp:600, maxHp:600, dmg:38,reward:3500,xp:250, tier:3},
  {name:'Флибустьер',    icon:'💀',hp:1400,maxHp:1400,dmg:65,reward:8000,xp:550, tier:4},
  {name:'Адмирал пиратов',icon:'👑',hp:3500,maxHp:3500,dmg:110,reward:20000,xp:1200,tier:5},
  {name:'Пустотный лорд',icon:'🌑',hp:9000,maxHp:9000,dmg:200,reward:55000,xp:2800,tier:6},
];

const MAYORS=[
  {id:'gov_sol',  sysId:'sol',   icon:'👨‍💼',name:'Губернатор Солнечной',title:'Губернатор'},
  {id:'gov_vega', sysId:'vega',  icon:'👩‍✈️',name:'Адмирал Вега',        title:'Адмирал'},
  {id:'gov_nova', sysId:'nova',  icon:'🧑‍🔬',name:'Профессор Нова',       title:'Учёный'},
  {id:'gov_abad', sysId:'abad',  icon:'🤺', name:'Барон Абаддон',         title:'Барон'},
  {id:'gov_eden', sysId:'eden',  icon:'👸', name:'Королева Эдема',        title:'Королева'},
  {id:'gov_drag', sysId:'dragon',icon:'⚔️', name:'Генерал Дракон',        title:'Генерал'},
  {id:'gov_nexus',sysId:'nexus', icon:'🤖', name:'ИИ-Координатор Нексус', title:'ИИ-Куратор'},
  {id:'gov_prism',sysId:'prism', icon:'💎', name:'Хранитель Призмы',      title:'Хранитель'},
  {id:'gov_ruin', sysId:'ruin',  icon:'🏛️', name:'Архивариус Руин',       title:'Архивариус'},
  {id:'gov_genesis',sysId:'genesis',icon:'🌍',name:'Основатель Генезиса', title:'Основатель'},
  {id:'gov_omega',sysId:'nexus2',icon:'🌐', name:'Вестник Омеги',         title:'Вестник'},
];

const DEBRIS_TYPES=[
  {id:'asteroid',icon:'🪨',name:'Астероид',         time:30, reward:80,   rp:2},
  {id:'wreck',   icon:'💥',name:'Обломки корабля',  time:60, reward:300,  rp:5},
  {id:'probe',   icon:'🛸',name:'Зонд-обломок',    time:120,reward:600,  rp:10},
  {id:'comet',   icon:'☄️',name:'Комета',           time:90, reward:450,  rp:8},
  {id:'station', icon:'🏚️',name:'Брошенная станция',time:300,reward:2500, rp:25},
];

const ALIEN_TYPES=[
  {id:'zorg_scout',   race:'zorg',    name:'Рой-разведчик',    icon:'👽',hp:180, maxHp:180, dmg:20, reward:700,  xp:55,  threat:1,special:'drain', color:'#00ff88',desc:'Высасывает энергию −8/ход'},
  {id:'zorg_warrior', race:'zorg',    name:'Зorg-воин',        icon:'🐛',hp:420, maxHp:420, dmg:35, reward:1800, xp:130, threat:2,special:'split', color:'#00ff88',desc:'Делится на двух при 50% ХП'},
  {id:'zorg_queen',   race:'zorg',    name:'Королева Зorg',    icon:'🦠',hp:1100,maxHp:1100,dmg:65, reward:5500, xp:350, threat:3,special:'split', color:'#00ff88',desc:'Делится и регенерирует споры'},
  {id:'tech_drone',   race:'technoid',name:'Тех-дрон',         icon:'🤖',hp:250, maxHp:250, dmg:28, reward:900,  xp:70,  threat:1,special:'shield',color:'#00c8ff',desc:'Щит восстанавливает 15 ХП/ход'},
  {id:'tech_hunter',  race:'technoid',name:'Охотник MK-II',    icon:'🦾',hp:600, maxHp:600, dmg:50, reward:2500, xp:180, threat:2,special:'shield',color:'#00c8ff',desc:'Адаптивная броня: +5 защиты/ход'},
  {id:'tech_overlord',race:'technoid',name:'Техно-Властелин',  icon:'🔮',hp:2000,maxHp:2000,dmg:90, reward:9000, xp:600, threat:4,special:'berserk',color:'#00c8ff',desc:'Берсерк ниже 30% ХП — урон ×2'},
  {id:'psi_phantom',  race:'psi',     name:'Пси-Фантом',       icon:'👻',hp:150, maxHp:150, dmg:30, reward:1000, xp:80,  threat:1,special:'psi',   color:'#a855f7',desc:'Пси-атака игнорирует 50% брони'},
  {id:'psi_mind',     race:'psi',     name:'Разум-Пожиратель', icon:'🧿',hp:400, maxHp:400, dmg:55, reward:3000, xp:220, threat:3,special:'psi',   color:'#a855f7',desc:'Контроль разума каждые 3 хода'},
  {id:'psi_hive',     race:'psi',     name:'Великий Улей',     icon:'🌀',hp:3500,maxHp:3500,dmg:120,reward:18000,xp:1200,threat:4,special:'psi',   color:'#a855f7',desc:'Коллективный разум — непредсказуем'},
  {id:'zorg_behemoth',    race:'zorg',    name:'Биобегемот Зorg',    icon:'🧬',hp:6200, maxHp:6200, dmg:165,reward:32000,xp:1900,threat:5,special:'split', color:'#36ff98',desc:'Финальный босс роя'},
  {id:'tech_dreadnought', race:'technoid',name:'Дредноут Омега-МК', icon:'🛡️',hp:7000, maxHp:7000, dmg:180,reward:36000,xp:2200,threat:5,special:'shield',color:'#3ad7ff',desc:'Финальный босс техноидов'},
  {id:'psi_overmind',     race:'psi',     name:'Пси-Овермайнд',     icon:'🔮',hp:7600, maxHp:7600, dmg:190,reward:39000,xp:2400,threat:5,special:'psi',   color:'#c084fc',desc:'Финальный босс коллективного разума'},
  {id:'mothership',       race:'zorg',    name:'Материнский корабль',icon:'🌐',hp:5000, maxHp:5000, dmg:150,reward:25000,xp:1500,threat:4,special:'split', color:'#ff2d78',desc:'Старый босс вторжений'},
];

const POLICE_FACTIONS={
  alpha: {name:'Галактическая Стража',icon:'👮',color:'#00c8ff',fine:500,  power:30,  gal:'alpha'},
  beta:  {name:'Имперский Патруль',   icon:'⚔️',color:'#ffd700',fine:1200, power:60,  gal:'beta'},
  gamma: {name:'Орден Гаммы',         icon:'🔱',color:'#a855f7',fine:3000, power:100, gal:'gamma'},
  chaos: {name:'Тёмная Инквизиция',   icon:'💀',color:'#ff3a3a',fine:8000, power:180, gal:'chaos'},
  nebula:{name:'Стражи Туманности',   icon:'🌸',color:'#ff9de2',fine:2000, power:75,  gal:'nebula'},
  iron:  {name:'Железный Орден',      icon:'⚙️',color:'#aaaaaa',fine:4000, power:120, gal:'iron'},
};

// ── Случайные события ──
const RANDOM_EVENTS=[
  {id:'gold_rush',   icon:'🪙',name:'Золотая лихорадка',  desc:'Добыча ×3 в текущей системе на 1 день!',      duration:1, effect:'mine_x3'},
  {id:'blockade',    icon:'🚫',name:'Торговая блокада',    desc:'Рынок закрыт на 1 день — ни купить, ни продать.',duration:1,effect:'trade_block'},
  {id:'storm_event', icon:'🌪️',name:'Космический шторм',  desc:'Перелёты стоят ×2 топлива на 2 дня.',          duration:2, effect:'fuel_x2'},
  {id:'epidemic',    icon:'🦠',name:'Эпидемия',           desc:'Медикаменты стоят ×5 на 3 дня.',               duration:3, effect:'medicine_x5'},
  {id:'tech_boom',   icon:'💻',name:'Технобум',           desc:'Цены на технологии +50% на 2 дня.',            duration:2, effect:'tech_bonus'},
  {id:'pirate_war',  icon:'⚔️',name:'Пиратская война',    desc:'Шанс нападения ×2 на 3 дня, но награды ×2.',   duration:3, effect:'pirate_war'},
  {id:'alien_signal',icon:'📡',name:'Сигнал пришельцев',  desc:'Обнаружен сигнал. НО +50% на 1 день.',         duration:1, effect:'rp_bonus'},
  {id:'wormhole',    icon:'🌀',name:'Червоточина',         desc:'Случайный телепорт в другую систему!',          duration:0, effect:'teleport'},
  {id:'debris_rain', icon:'☄️',name:'Дождь обломков',     desc:'3 обломка одновременно — успей собрать!',       duration:0, effect:'spawn_debris'},
  {id:'market_crash',icon:'📉',name:'Крах рынка',         desc:'Все цены -40% на 1 день. Покупай сейчас!',      duration:1, effect:'price_crash'},
  {id:'energy_surge',icon:'⚡',name:'Энергетический всплеск',desc:'Энергия восстанавливается ×3 на 1 день.',   duration:1, effect:'energy_x3'},
  {id:'patrol',      icon:'🚔',name:'Полицейский патруль', desc:'Штрафы удвоены. Не нарушай!',                  duration:2, effect:'police_x2'},
];

// ── Сюжетные цепочки ──
const STORY_CHAINS=[
  {
    id:'ancient_signal',
    title:'Древний Сигнал',
    icon:'📡',
    desc:'Старинный зонд передаёт координаты. Что скрывает Древняя галактика?',
    steps:[
      {id:'s1', title:'Первый контакт',    sys:'nova',    type:'deliver', good:'tech',    amt:3,  reward:2000,  xp:100, desc:'Профессор Нова просит доставить оборудование для расшифровки сигнала.'},
      {id:'s2', title:'Расшифровка',       sys:'arcane',  type:'kill',    count:3,        reward:3500,  xp:150, desc:'Пираты перехватили данные. Уничтожьте 3 корабля в системе Аркейн.'},
      {id:'s3', title:'Путь к истине',     sys:'ruin',    type:'arrive',                  reward:5000,  xp:200, desc:'Координаты ведут в Руины. Долетите до системы Руин.'},
      {id:'s4', title:'Реликвия',          sys:'temple',  type:'deliver', good:'minerals',amt:5,  reward:8000,  xp:300, desc:'Архивариус нуждается в материалах для восстановления реликвии.'},
      {id:'s5', title:'Финал',             sys:'oracle',  type:'kill',    count:5,        reward:25000, xp:800, desc:'Страж Оракула не желает раскрывать тайну. Уничтожьте 5 врагов.', final:true, finalReward:'equip:hull_carrier'},
    ]
  },
  {
    id:'lost_fleet',
    title:'Потерянный флот',
    icon:'🚢',
    desc:'Последний сигнал флота адмирала Марса — система Дракон. Найди выживших.',
    steps:[
      {id:'s1', title:'Последний сигнал',  sys:'dragon',  type:'arrive',                  reward:1500,  xp:80,  desc:'Долетите до системы Дракон — там был замечен последний сигнал.'},
      {id:'s2', title:'Пираты на обломках',sys:'dragon',  type:'kill',    count:4,        reward:3000,  xp:120, desc:'Пираты захватили обломки флота. Уничтожьте 4 пиратских корабля.'},
      {id:'s3', title:'Раненые',           sys:'eden',    type:'deliver', good:'medicine',amt:4,  reward:4000,  xp:160, desc:'Выжившие нуждаются в медикаментах. Доставьте 4 единицы в Эден.'},
      {id:'s4', title:'Новое оружие',      sys:'nexus',   type:'deliver', good:'weapons', amt:3,  reward:6000,  xp:250, desc:'ИИ-Координатор просит оружие для защиты беженцев.'},
      {id:'s5', title:'Месть адмирала',    sys:'ares',    type:'kill',    count:6,        reward:20000, xp:600, desc:'Главарь пиратов прячется в Аресе. Уничтожьте 6 врагов.', final:true, finalReward:'credits:50000'},
    ]
  },
  {
    id:'void_merchant',
    title:'Торговец из Пустоты',
    icon:'🕳️',
    desc:'Таинственный торговец предлагает сделку — но его товары могут изменить всё.',
    steps:[
      {id:'s1', title:'Первая сделка',     sys:'nexus',   type:'deliver', good:'tech',    amt:5,  reward:3000,  xp:100, desc:'Торговец хочет 5 единиц технологий. Доставьте в Нексус.'},
      {id:'s2', title:'Странный груз',     sys:'echo',    type:'arrive',                  reward:4500,  xp:150, desc:'Он просит встретиться в Эхо — системе Пустоты. Долетите туда.'},
      {id:'s3', title:'Охрана',            sys:'echo',    type:'kill',    count:4,        reward:6000,  xp:200, desc:'Конкуренты устроили засаду. Уничтожьте 4 корабля.'},
      {id:'s4', title:'Обратный путь',     sys:'sanctum', type:'deliver', good:'minerals',amt:8,  reward:10000, xp:350, desc:'Нужны редкие минералы для завершения сделки.'},
      {id:'s5', title:'Тайна Пустоты',     sys:'null',    type:'kill',    count:8,        reward:40000, xp:1200,desc:'Хранители Нуль-точки не пустят чужих. Прорвитесь сквозь 8 врагов.', final:true, finalReward:'equip:hull_dread'},
    ]
  },
];

// ── Аномалии ──
const ANOMALIES=[
  {id:'dark_matter',  icon:'🌑',name:'Тёмная материя',   desc:'Опасная, но богатая',  reward:{cr:5000,rp:50},  danger:0.4, rarity:0.15},
  {id:'quantum_rift', icon:'🌀',name:'Квантовый разлом', desc:'Телепортирует случайно',reward:{cr:0,teleport:true},danger:0.1,rarity:0.1},
  {id:'crystal_field',icon:'💎',name:'Кристаллическое поле',desc:'Редкие минералы',   reward:{minerals:20,cr:2000},danger:0.2,rarity:0.2},
  {id:'pulsar_beam',  icon:'⚡',name:'Луч пульсара',     desc:'Даёт энергию',         reward:{energy:50,rp:30},   danger:0.15,rarity:0.25},
  {id:'ghost_ship',   icon:'👻',name:'Корабль-призрак',  desc:'Старый корабль с грузом',reward:{cr:8000,tech:3}, danger:0.5, rarity:0.1},
  {id:'nebula_core',  icon:'🌸',name:'Ядро туманности',  desc:'Источник редкой энергии',reward:{cr:3000,rp:80},  danger:0.25,rarity:0.12},
  {id:'void_rift',    icon:'🕳️',name:'Разлом пустоты',  desc:'Засасывает или выбрасывает',reward:{cr:12000},    danger:0.7, rarity:0.08},
  {id:'ancient_beacon',icon:'🏛️',name:'Древний маяк',   desc:'Координаты неизвестных мест',reward:{rp:120,cr:6000},danger:0.3,rarity:0.07},
];

const ERAS=['Заря','Рост','Расцвет','Война','Закат','Сумерки'];
const MINS_PER_TICK=2;
const LEAGUE_SEASON_DAYS=30;
const LEAGUE_TIERS=[
  {name:'Бронза',  min:0,   icon:'🥉',color:'#cd7f32'},
  {name:'Серебро', min:50,  icon:'🥈',color:'#c0c0c0'},
  {name:'Золото',  min:150, icon:'🥇',color:'#ffd700'},
  {name:'Платина', min:400, icon:'💠',color:'#00c8ff'},
  {name:'Алмаз',   min:1000,icon:'💎',color:'#a855f7'},
  {name:'Мастер',  min:2500,icon:'👑',color:'#ff2d78'},
];
