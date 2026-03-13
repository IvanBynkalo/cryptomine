// ═══════════════════════════════════════
//  SPACE RANGERS: IDLE WARS — data.js
//  All static game data / constants
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

const GALAXIES=[
  {id:'alpha',name:'Альфа',label:'🌌 Альфа',danger:1},
  {id:'beta', name:'Бета', label:'💫 Бета', danger:2},
  {id:'gamma',name:'Гамма',label:'⭐ Гамма',danger:3},
  {id:'chaos',name:'Хаос', label:'🔴 Хаос', danger:4},
  {id:'delta',name:'Дельта',label:'🧊 Дельта',danger:5},
  {id:'omega',name:'Омега',label:'🌀 Омега',danger:6},
];

const SYSTEMS=[
  // ALPHA
  {id:'sol',   gal:'alpha',name:'Солнечная',x:.5, y:.45,type:'home',   emoji:'🌍',fuelCost:0, pc:.05,goods:['ore','food','tech'],     planets:['🌍','🌕','🔴','⚫']},
  {id:'kep',   gal:'alpha',name:'Кеплер',   x:.2, y:.3, type:'mining', emoji:'🪐',fuelCost:18,pc:.18,goods:['ore','minerals','fuel'],  planets:['🪐','🟠','⚫']},
  {id:'vega',  gal:'alpha',name:'Вега',     x:.78,y:.22,type:'trade',  emoji:'🌟',fuelCost:25,pc:.1, goods:['tech','food','medicine'], planets:['🔵','🟢','🌕']},
  {id:'nova',  gal:'alpha',name:'Нова Кор', x:.3, y:.72,type:'science',emoji:'💜',fuelCost:32,pc:.12,goods:['tech','medicine','food'], planets:['💜','🔵','⚪']},
  {id:'icarus',gal:'alpha',name:'Икар',     x:.65,y:.15,type:'mining', emoji:'🟠',fuelCost:38,pc:.22,goods:['fuel','minerals','ore'],  planets:['🟠','⚫','🟤']},
  // BETA
  {id:'dragon',gal:'beta', name:'Дракон',   x:.85,y:.6, type:'danger', emoji:'🔴',fuelCost:28,pc:.5, goods:['minerals','weapons','ore'],  planets:['🔴','⚫','💀']},
  {id:'eden',  gal:'beta', name:'Эден',     x:.45,y:.8, type:'paradise',emoji:'🟢',fuelCost:42,pc:.08,goods:['food','medicine','fuel'],   planets:['🟢','💚','🌕','🔵']},
  {id:'ares',  gal:'beta', name:'Арес',     x:.2, y:.5, type:'danger', emoji:'🔥',fuelCost:35,pc:.45,goods:['weapons','minerals','ore'],  planets:['🔥','🟤','⚫']},
  {id:'nexus', gal:'beta', name:'Нексус',   x:.6, y:.3, type:'trade',  emoji:'💠',fuelCost:40,pc:.15,goods:['tech','food','medicine'],   planets:['💠','🔵','🟣']},
  {id:'pulse', gal:'beta', name:'Пульсар',  x:.15,y:.2, type:'science',emoji:'⚡',fuelCost:50,pc:.2, goods:['fuel','tech','minerals'],   planets:['⚡','🔵','⚪']},
  // GAMMA
  {id:'abad',  gal:'gamma',name:'Абаддон',  x:.15,y:.6, type:'danger', emoji:'⚫',fuelCost:48,pc:.7, goods:['weapons','minerals','tech'],  planets:['⚫','💀','🖤']},
  {id:'zion',  gal:'gamma',name:'Зион',     x:.5, y:.35,type:'trade',  emoji:'🔵',fuelCost:55,pc:.12,goods:['tech','food','medicine'],    planets:['🔵','🟢','💠','🌕']},
  {id:'forge', gal:'gamma',name:'Кузница',  x:.82,y:.7, type:'mining', emoji:'⚙️',fuelCost:60,pc:.3, goods:['ore','minerals','weapons'],  planets:['⚙️','🟤','⚫']},
  {id:'arcane',gal:'gamma',name:'Аркейн',   x:.35,y:.8, type:'science',emoji:'🌀',fuelCost:65,pc:.18,goods:['tech','medicine','fuel'],    planets:['🌀','💜','🔵']},
  {id:'abyss', gal:'gamma',name:'Бездна',   x:.7, y:.15,type:'danger', emoji:'🖤',fuelCost:70,pc:.6, goods:['weapons','minerals','ore'],  planets:['🖤','⚫','💀']},
  // CHAOS
  {id:'entropy',gal:'chaos',name:'Энтропия',x:.5, y:.5, type:'danger', emoji:'💀',fuelCost:60,pc:.85,goods:['weapons','minerals','tech'], planets:['💀','⚫','🌑']},
  {id:'rift',   gal:'chaos',name:'Разлом',  x:.25,y:.3, type:'danger', emoji:'🌑',fuelCost:65,pc:.75,goods:['weapons','ore','fuel'],      planets:['🌑','⚫','🖤']},
  {id:'vortex', gal:'chaos',name:'Вортекс', x:.75,y:.65,type:'danger', emoji:'🌪️',fuelCost:70,pc:.9, goods:['weapons','minerals','tech'], planets:['🌪️','💀','⚫']},
  {id:'sanctum',gal:'chaos',name:'Санктум', x:.4, y:.75,type:'trade',  emoji:'🏯',fuelCost:80,pc:.4, goods:['tech','medicine','food'],    planets:['🏯','💜','🔵']},

  // DELTA
  {id:'frost', gal:'delta',name:'Фрост',   x:.18,y:.22,type:'science', emoji:'🧊',fuelCost:86,pc:.35,goods:['medicine','tech','fuel'], planets:['🧊','⚪','🔵']},
  {id:'helix', gal:'delta',name:'Хеликс',   x:.52,y:.48,type:'trade',   emoji:'🧬',fuelCost:92,pc:.22,goods:['tech','medicine','food'], planets:['🧬','💠','🌕']},
  {id:'bastion',gal:'delta',name:'Бастион',x:.8, y:.72,type:'danger',  emoji:'🛡️',fuelCost:98,pc:.72,goods:['weapons','minerals','fuel'], planets:['🛡️','⚫','💀']},
  // OMEGA
  {id:'eclipse',gal:'omega',name:'Эклипс', x:.25,y:.68,type:'danger',  emoji:'🌘',fuelCost:108,pc:.88,goods:['weapons','tech','minerals'], planets:['🌘','⚫','🖤']},
  {id:'oracle', gal:'omega',name:'Оракул', x:.58,y:.25,type:'science', emoji:'🔮',fuelCost:112,pc:.4,goods:['tech','medicine','xeno'], planets:['🔮','💜','🌕']},
  {id:'citadel',gal:'omega',name:'Цитадель',x:.84,y:.5,type:'trade',   emoji:'🏛️',fuelCost:118,pc:.3,goods:['tech','weapons','medicine'], planets:['🏛️','💠','🔵']},
];

const GOODS={
  ore:     {name:'Руда',           icon:'⛏️',base:40},
  minerals:{name:'Минералы',       icon:'💎',base:120},
  food:    {name:'Провизия',       icon:'🌾',base:60},
  tech:    {name:'Технологии',     icon:'💻',base:200},
  fuel:    {name:'Топливо',        icon:'⚡',base:80},
  medicine:{name:'Медикаменты',    icon:'💊',base:150},
  weapons: {name:'Оружие',         icon:'🔫',base:300},
  xeno:    {name:'Ксенокристаллы',  icon:'🧪',base:900},
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
  {id:'miner',  icon:'🤖',name:'Авто-майнер',  cps:1,   cost:5000,   costM:1.8},
  {id:'drone',  icon:'🚁',name:'Дрон-сборщик', cps:5,   cost:30000,  costM:1.85},
  {id:'station',icon:'🏭',name:'Орбит-станция',cps:25,  cost:200000, costM:1.9},
  {id:'ai',     icon:'🧬',name:'ИИ-ядро',      cps:120, cost:1500000,costM:2.0},
];

const TECH={
  weapons:[
    {id:'plasma',     icon:'🌀',name:'Плазма',        eff:'+8 урона',       cost:500,  rp:20, req:null},
    {id:'torpedo',    icon:'🚀',name:'Торпеды',       eff:'+3 ракеты',      cost:800,  rp:35, req:'plasma'},
    {id:'ionbeam',    icon:'⚡',name:'Ион-луч',       eff:'+15 урона',      cost:1500, rp:60, req:'torpedo'},
    {id:'antimatter', icon:'💥',name:'Антиматерия',   eff:'×2 ракеты',      cost:3000, rp:120,req:'ionbeam'},
    {id:'singularity',icon:'🌑',name:'Сингулярность', eff:'Крит 30%×3',     cost:8000, rp:300,req:'antimatter'},
  ],
  shields:[
    {id:'armor',   icon:'🔩',name:'Броня',       eff:'+50 ХП',        cost:400,  rp:15, req:null},
    {id:'regen',   icon:'🔋',name:'Регенерация', eff:'+5 ХП/сек',     cost:900,  rp:40, req:'armor'},
    {id:'mirror',  icon:'🪞',name:'Зеркало',     eff:'20% отражение', cost:2000, rp:80, req:'regen'},
    {id:'nullfield',icon:'🌐',name:'Нуль-поле',  eff:'-35% вх урона', cost:4000, rp:150,req:'mirror'},
    {id:'fortress',icon:'🏰',name:'Крепость',    eff:'Авт-рем 3/сек', cost:10000,rp:400,req:'nullfield'},
  ],
  engines:[
    {id:'turbo',   icon:'🔥',name:'Турбо',        eff:'-30% топлива',   cost:600,  rp:25, req:null},
    {id:'warp',    icon:'🌌',name:'Варп-ядро',    eff:'Все галактики',  cost:1200, rp:55, req:'turbo'},
    {id:'quantum', icon:'✨',name:'Квантум',       eff:'Мгновенный перелёт',cost:3500,rp:130,req:'warp'},
    {id:'omega',   icon:'♾️',name:'Омега-драйв',  eff:'Бесплатный полёт',cost:15000,rp:500,req:'quantum'},
  ],
  mining:[
    {id:'nanodrill',icon:'🔬',name:'Нано-бур',    eff:'+5 добычи',     cost:350,  rp:12, req:null},
    {id:'orbital',  icon:'🛸',name:'Орб-майнер',  eff:'+20/сек',       cost:1000, rp:45, req:'nanodrill'},
    {id:'stellar',  icon:'⭐',name:'Звёздный',    eff:'+100/сек',      cost:4000, rp:110,req:'orbital'},
    {id:'galactic', icon:'🌌',name:'Галакт-жнец', eff:'+500/сек',      cost:20000,rp:400,req:'stellar'},
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


const RANGER_CLASSES=[
  {id:'freelancer',icon:'🛰️',name:'Свободный рейнджер',focus:'Универсал',
   desc:'Стабильный рост без перекоса. +5% ко всем базовым наградам.',
   bonuses:{quest:0.05,trade:0.03,combat:0.03,science:0.03,travel:0.03}},
  {id:'trader',icon:'💰',name:'Торговец',focus:'Экономика',
   desc:'Лучше торгует и медленнее скатывается в долг.',
   bonuses:{trade:0.12,quest:0.05,debt:0.15}},
  {id:'hunter',icon:'⚔️',name:'Охотник',focus:'Бой',
   desc:'Сильнее растёт от боёв, но требует чести и дисциплины.',
   bonuses:{combat:0.12,alien:0.12,power:0.08}},
  {id:'explorer',icon:'🧭',name:'Исследователь',focus:'Перелёты и наука',
   desc:'Быстрее набирает силу за открытия, перелёты и технологии.',
   bonuses:{science:0.12,travel:0.12,influence:0.08}},
  {id:'commander',icon:'👑',name:'Командор',focus:'Влияние',
   desc:'Сильнее работает через влияние, задания и контроль секторов.',
   bonuses:{quest:0.1,influence:0.12,police:0.08}}
];

const LICENSE_TIERS=[
  {tier:1,name:'Лицензия патруля', power:0, honor:-50, completedQ:0},
  {tier:2,name:'Лицензия рейдера', power:80, honor:0, completedQ:2},
  {tier:3,name:'Лицензия ветерана', power:180, honor:10, completedQ:6},
  {tier:4,name:'Лицензия командира', power:320, honor:20, completedQ:12},
  {tier:5,name:'Лицензия призрака', power:520, honor:35, completedQ:20},
];

const EQUIPMENT=[
  {id:'hull_scout',  cat:'hull',  icon:'🚀',name:'Скаут',      tier:1,stats:{maxHull:80, cargo:15},         cost:0,      desc:'Лёгкий корпус'},
  {id:'hull_fighter',cat:'hull',  icon:'🛸',name:'Истребитель',tier:2,stats:{maxHull:150,cargo:20,atk:5},   cost:5000,   desc:'Боевой корпус'},
  {id:'hull_cruiser',cat:'hull',  icon:'🚢',name:'Крейсер',    tier:3,stats:{maxHull:300,cargo:35,atk:10},  cost:25000,  desc:'Тяжёлый крейсер'},
  {id:'hull_carrier',cat:'hull',  icon:'🛡️',name:'Авианосец', tier:4,stats:{maxHull:600,cargo:60,def:20},  cost:100000, desc:'Флагман'},
  {id:'hull_dread',  cat:'hull',  icon:'💀',name:'Дредноут',   tier:5,stats:{maxHull:1200,cargo:80,atk:30,def:20},cost:500000,desc:'Уничтожитель'},
  {id:'eng_basic',   cat:'engine',icon:'🔥',name:'Базовый',    tier:1,stats:{fuelMod:0},    cost:0,      desc:'Стандарт'},
  {id:'eng_turbo',   cat:'engine',icon:'⚡',name:'Турбо',      tier:2,stats:{fuelMod:-.25}, cost:3000,   desc:'-25% топлива'},
  {id:'eng_ion',     cat:'engine',icon:'🌀',name:'Ионный',     tier:3,stats:{fuelMod:-.45}, cost:15000,  desc:'-45% топлива'},
  {id:'eng_quantum', cat:'engine',icon:'✨',name:'Квантовый',  tier:4,stats:{fuelMod:-.7},  cost:80000,  desc:'-70% топлива'},
  {id:'wpn_laser',   cat:'weapon',icon:'🔴',name:'Лазер',      tier:1,stats:{atk:5},        cost:0,      desc:'+5 урона'},
  {id:'wpn_plasma',  cat:'weapon',icon:'🌀',name:'Плазмаган',  tier:2,stats:{atk:15},       cost:4000,   desc:'+15 урона'},
  {id:'wpn_ion',     cat:'weapon',icon:'⚡',name:'Ион-пушка',  tier:3,stats:{atk:35},       cost:20000,  desc:'+35 урона'},
  {id:'wpn_dark',    cat:'weapon',icon:'🖤',name:'Тёмная материя',tier:4,stats:{atk:80},    cost:100000, desc:'+80 урона'},
  {id:'shld_basic',  cat:'shield',icon:'🔵',name:'Базовый',    tier:1,stats:{def:0},        cost:0,      desc:'Нет бонуса'},
  {id:'shld_energy', cat:'shield',icon:'🛡️',name:'Энерго-щит', tier:2,stats:{def:10},       cost:3500,   desc:'-10 вх урона'},
  {id:'shld_mirror', cat:'shield',icon:'🪞',name:'Зеркальный', tier:3,stats:{def:25,reflect:.15},cost:18000,desc:'Отражение 15%'},
  {id:'shld_null',   cat:'shield',icon:'🌐',name:'Нуль-щит',   tier:4,stats:{def:50,reflect:.3}, cost:90000, desc:'Отражение 30%'},
];

const RANGER_BOTS=[
  {id:'trader',  icon:'🤝',name:'Торговец-бот',  desc:'+8% торг.цен в системах',   cost:2000, costM:2.2},
  {id:'miner_b', icon:'⛏️',name:'Майнер-бот',    desc:'+20 кр/сек авто-добычи',    cost:5000, costM:2.5, cps:20},
  {id:'pirate_h',icon:'💀',name:'Охотник-бот',   desc:'Убивает пиратов, +убийства', cost:10000,costM:3.0},
  {id:'scout_b', icon:'📡',name:'Скаут-бот',     desc:'+5 НО/сек сканирования',    cost:8000, costM:2.8},
];

const PIRATES=[
  {name:'Пират Зоро',  hp:80,  maxHp:80,  dmg:10,reward:200, icon:'💀',tier:1,xp:15},
  {name:'Рейдер Крэй', hp:180, maxHp:180, dmg:18,reward:500, icon:'☠️',tier:2,xp:35},
  {name:'Капитан Рэй', hp:350, maxHp:350, dmg:28,reward:1200,icon:'🏴‍☠️',tier:3,xp:80},
  {name:'Адмирал Крог',hp:700, maxHp:700, dmg:45,reward:3000,icon:'👾',tier:4,xp:200},
  {name:'Тёмный Лорд', hp:1500,maxHp:1500,dmg:80,reward:8000,icon:'💀',tier:5,xp:500},
];

const MAYORS=[
  {id:'gov_sol',  sysId:'sol',   icon:'👨‍💼',name:'Губернатор Солнечной',title:'Губернатор'},
  {id:'gov_vega', sysId:'vega',  icon:'👩‍✈️',name:'Адмирал Вега',        title:'Адмирал'},
  {id:'gov_nova', sysId:'nova',  icon:'🧑‍🔬',name:'Профессор Нова',       title:'Учёный'},
  {id:'gov_abad', sysId:'abad',  icon:'🤺', name:'Барон Абаддон',         title:'Барон'},
  {id:'gov_eden', sysId:'eden',  icon:'👸', name:'Королева Эдема',        title:'Королева'},
  {id:'gov_drag', sysId:'dragon',icon:'⚔️', name:'Генерал Дракон',        title:'Генерал'},
  {id:'gov_nexus',sysId:'nexus', icon:'🤖', name:'ИИ-Координатор Нексус', title:'ИИ-Куратор'},
];

const DEBRIS_TYPES=[
  {id:'asteroid',icon:'🪨',name:'Астероид',        time:30, reward:{ore:5},              rp:2},
  {id:'wreck',   icon:'💥',name:'Обломки корабля', time:60, reward:{minerals:3},          rp:5},
  {id:'probe',   icon:'🛸',name:'Зонд-обломок',   time:120,reward:{tech:2},              rp:10},
  {id:'comet',   icon:'☄️',name:'Комета',          time:90, reward:{minerals:5,fuel:3},  rp:8},
  {id:'station', icon:'🏚️',name:'Брошенная станция',time:300,reward:{ore:10,tech:5,minerals:8},rp:25},
];

const ALIEN_TYPES=[
  // ── ЗORG (bio-swarm)
  {id:'zorg_scout',  race:'zorg',   name:'Рой-разведчик',   icon:'👽',hp:180, maxHp:180, dmg:20,reward:700,  xp:55, threat:1,special:'drain', color:'#00ff88',desc:'Высасывает энергию −8/ход'},
  {id:'zorg_warrior',race:'zorg',   name:'Зorg-воин',       icon:'🐛',hp:420, maxHp:420, dmg:35,reward:1800, xp:130,threat:2,special:'split', color:'#00ff88',desc:'Делится на двух при 50% ХП'},
  {id:'zorg_queen',  race:'zorg',   name:'Королева Зorg',   icon:'🦠',hp:1100,maxHp:1100,dmg:65,reward:5500, xp:350,threat:3,special:'split', color:'#00ff88',desc:'Делится и регенерирует споры'},
  // ── ТЕХНOИДЫ (machine)
  {id:'tech_drone',  race:'technoid',name:'Тех-дрон',       icon:'🤖',hp:250, maxHp:250, dmg:28,reward:900,  xp:70, threat:1,special:'shield',color:'#00c8ff',desc:'Щит восстанавливает 15 ХП/ход'},
  {id:'tech_hunter', race:'technoid',name:'Охотник MK-II',  icon:'🦾',hp:600, maxHp:600, dmg:50,reward:2500, xp:180,threat:2,special:'shield',color:'#00c8ff',desc:'Адаптивная броня: +5 защиты/ход'},
  {id:'tech_overlord',race:'technoid',name:'Техно-Властелин',icon:'🔮',hp:2000,maxHp:2000,dmg:90,reward:9000,xp:600,threat:4,special:'berserk',color:'#00c8ff',desc:'Берсерк ниже 30% ХП — урон ×2'},
  // ── ПСИ-РАЗУМ (psychic)
  {id:'psi_phantom', race:'psi',    name:'Пси-Фантом',      icon:'👻',hp:150, maxHp:150, dmg:30,reward:1000, xp:80, threat:1,special:'psi',   color:'#a855f7',desc:'Пси-атака игнорирует 50% брони'},
  {id:'psi_mind',    race:'psi',    name:'Разум-Пожиратель',icon:'🧿',hp:400, maxHp:400, dmg:55,reward:3000, xp:220,threat:3,special:'psi',   color:'#a855f7',desc:'Контроль разума каждые 3 хода'},
  {id:'psi_hive',    race:'psi',    name:'Великий Улей',    icon:'🌀',hp:3500,maxHp:3500,dmg:120,reward:18000,xp:1200,threat:4,special:'psi', color:'#a855f7',desc:'Коллективный разум — непредсказуем'},
  // ── Материнский корабль
  {id:'mothership',  race:'zorg',   name:'Материнский корабль',icon:'🌐',hp:5000,maxHp:5000,dmg:150,reward:25000,xp:1500,threat:4,special:'split',color:'#ff2d78',desc:'Финальный босс'},
];

const POLICE_FACTIONS={
  alpha:{name:'Галактическая Стража',icon:'👮',color:'#00c8ff',fine:500,  power:30},
  beta: {name:'Имперский Патруль',   icon:'⚔️',color:'#ffd700',fine:1200, power:60},
  gamma:{name:'Орден Гаммы',         icon:'🔱',color:'#a855f7',fine:3000, power:100},
  chaos:{name:'Тёмная Инквизиция',   icon:'💀',color:'#ff3a3a',fine:8000, power:180},
  delta:{name:'Ледяной Корпус',      icon:'🧊',color:'#7dd3fc',fine:14000,power:260},
  omega:{name:'Совет Омеги',         icon:'🌀',color:'#8b5cf6',fine:24000,power:360},
};

const QUEST_TYPES=[
  {type:'deliver',weight:4},
  {type:'kill',   weight:3},
  {type:'collect',weight:3},
];

const ERAS=['Заря','Рост','Расцвет','Война','Закат','Сумерки'];
const MINS_PER_TICK=2;

// League season config
const LEAGUE_SEASON_DAYS=30;
const LEAGUE_TIERS=[
  {name:'Бронза',  min:0,   icon:'🥉',color:'#cd7f32'},
  {name:'Серебро', min:50,  icon:'🥈',color:'#c0c0c0'},
  {name:'Золото',  min:150, icon:'🥇',color:'#ffd700'},
  {name:'Платина', min:400, icon:'💠',color:'#00c8ff'},
  {name:'Алмаз',   min:1000,icon:'💎',color:'#a855f7'},
  {name:'Мастер',  min:2500,icon:'👑',color:'#ff2d78'},
];
