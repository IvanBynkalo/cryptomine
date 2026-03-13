// ═══════════════════════════════════════
//  equipment_catalog.js — 180 единиц техники
//  Согласно ТЗ: корпуса, оружие, защита, двигатели, спецмодули, поддержка
// ═══════════════════════════════════════

// Редкость: common | enhanced | rare | military | experimental | legendary
// Производители: NovaDrive | HeliosArms | BastionWorks | CargoMax | RangerCore | SigmaLab | CivicUnion | XenoTech

const MANUFACTURERS = {
  NovaDrive:    { name:'NovaDrive',    icon:'🚀', spec:'Двигатели',         color:'#00c8ff' },
  HeliosArms:   { name:'Helios Arms',  icon:'🔴', spec:'Лазерное оружие',   color:'#ff6644' },
  BastionWorks: { name:'Bastion Works',icon:'🛡️', spec:'Броня и тяжёлые',   color:'#aaaaaa' },
  CargoMax:     { name:'CargoMax',     icon:'📦', spec:'Грузовые/логистика', color:'#ffd700' },
  RangerCore:   { name:'Ranger Core',  icon:'⚙️', spec:'Универсальная',     color:'#00ff88' },
  SigmaLab:     { name:'Sigma Lab',    icon:'🔬', spec:'Исследовательские', color:'#a855f7' },
  CivicUnion:   { name:'Civic Union',  icon:'🏛️', spec:'Командные/репутац.', color:'#d4a017' },
  XenoTech:     { name:'XenoTech',     icon:'👽', spec:'Ксено/Эксперим.',   color:'#ff00ff' },
};

const RARITY_COLOR = {
  common:       '#8899aa',
  enhanced:     '#00c8ff',
  rare:         '#a855f7',
  military:     '#ff3a3a',
  experimental: '#ff9900',
  legendary:    '#ffd700',
};

// ── Структура предмета техники ──
// { id, name, cat, subcat, tier, rarity, manufacturer, role,
//   levelRequired, classRequired, rankRequired, honorRequired,
//   powerRequired, influenceRequired, licenseRequired, bossKillRequired,
//   price, upkeep, sellPrice, stats, slotType, desc, icon, tags }

// ════════════════════════════════════
//  КОРПУСА (24 шт.)
// ════════════════════════════════════
const HULLS_CATALOG = [
  // T1 — Лёгкие (lvl 1-5)
  { id:'hull_swift_m',    name:'Swift-M',        cat:'hull', subcat:'light',   tier:1, rarity:'common',
    mfr:'RangerCore',   role:'Перехват',   levelRequired:1,  price:0,      upkeep:0,
    stats:{maxHull:80,  cargo:10, fuelMod:-.05, slots:{wpn:2,def:1,eng:1,spec:1,sup:0}},
    slotType:'hull', icon:'🚀', desc:'Стартовый лёгкий корпус. Быстрый и дешёвый.',
    tags:['light','speed'] },

  { id:'hull_ranger_one', name:'Ranger One',     cat:'hull', subcat:'universal',tier:1,rarity:'common',
    mfr:'RangerCore',   role:'Универсал',  levelRequired:1,  price:500,    upkeep:10,
    stats:{maxHull:120, cargo:20, slots:{wpn:2,def:1,eng:1,spec:2,sup:1}},
    slotType:'hull', icon:'🛸', desc:'Первый универсальный корпус рейнджера.',
    tags:['universal'] },

  { id:'hull_mule_t1',    name:'Mule T-1',       cat:'hull', subcat:'cargo',   tier:1, rarity:'common',
    mfr:'CargoMax',     role:'Торговля',   levelRequired:3,  price:1200,   upkeep:15,
    stats:{maxHull:100, cargo:40, tradeMod:.05, slots:{wpn:1,def:1,eng:1,spec:3,sup:1}},
    slotType:'hull', icon:'📦', desc:'Грузовой корпус с увеличенным трюмом.',
    tags:['cargo','trade'] },

  // T2 — Ветвление (lvl 6-10)
  { id:'hull_interceptor', name:'Interceptor-X', cat:'hull', subcat:'light',   tier:2, rarity:'enhanced',
    mfr:'RangerCore',   role:'Перехват',   levelRequired:6,  price:5000,   upkeep:30,
    stats:{maxHull:110, cargo:12, fuelMod:-.15, dodge:.06, slots:{wpn:2,def:1,eng:1,spec:1,sup:1}},
    slotType:'hull', icon:'⚡', desc:'Улучшенный перехватчик. +6% уклонение.',
    tags:['light','speed','dodge'] },

  { id:'hull_scout_pro',   name:'Scout Pro',     cat:'hull', subcat:'explorer', tier:2,rarity:'enhanced',
    mfr:'SigmaLab',     role:'Разведка',   levelRequired:7,  price:6000,   upkeep:35,
    stats:{maxHull:100, cargo:18, sciMod:.1, scanRange:1, slots:{wpn:1,def:1,eng:1,spec:3,sup:1}},
    slotType:'hull', icon:'🔭', desc:'Исследовательский корпус с бонусом к науке +10%.',
    tags:['explorer','science'] },

  { id:'hull_atlas_cargo', name:'Atlas Cargo',   cat:'hull', subcat:'cargo',   tier:2, rarity:'enhanced',
    mfr:'CargoMax',     role:'Торговля',   levelRequired:8,  price:8000,   upkeep:40,
    stats:{maxHull:130, cargo:60, tradeMod:.08, slots:{wpn:1,def:1,eng:1,spec:3,sup:1}},
    slotType:'hull', icon:'🚢', desc:'Профессиональный грузовик. Трюм +60, торговля +8%.',
    tags:['cargo','trade'] },

  { id:'hull_fighter_mk2', name:'Fighter MK-II', cat:'hull', subcat:'combat',  tier:2, rarity:'enhanced',
    mfr:'BastionWorks', role:'Бой',        levelRequired:9,  price:9000,   upkeep:50,
    stats:{maxHull:200, cargo:15, atk:8, slots:{wpn:3,def:2,eng:1,spec:1,sup:1}},
    slotType:'hull', icon:'🔴', desc:'Боевой корпус с 3 оружейными слотами.',
    tags:['combat','attack'] },

  // T3 — Профессиональный (lvl 11-18)
  { id:'hull_cruiser_r',   name:'Ranger Cruiser', cat:'hull', subcat:'universal',tier:3,rarity:'rare',
    mfr:'RangerCore',   role:'Универсал',  levelRequired:11, price:25000,  upkeep:100,
    stats:{maxHull:300, cargo:35, atk:10, slots:{wpn:2,def:1,eng:1,spec:2,sup:1}},
    slotType:'hull', icon:'🛡️', desc:'Крейсер рейнджеров. Баланс боя и возможностей.',
    tags:['universal','balanced'] },

  { id:'hull_bastion_x',   name:'Bastion-X',     cat:'hull', subcat:'combat',  tier:3, rarity:'rare',
    mfr:'BastionWorks', role:'Осада',      levelRequired:13, price:35000,  upkeep:150,
    stats:{maxHull:450, cargo:20, atk:15, def:15, slots:{wpn:3,def:2,eng:1,spec:1,sup:1}},
    slotType:'hull', icon:'💪', desc:'Тяжёлый боевой корпус. Высокая броня и DPS.',
    tags:['combat','tank'] },

  { id:'hull_horizon',     name:'Horizon Deep',  cat:'hull', subcat:'explorer', tier:3,rarity:'rare',
    mfr:'SigmaLab',     role:'Наука',      levelRequired:14, price:30000,  upkeep:120,
    stats:{maxHull:200, cargo:30, sciMod:.2, scanRange:2, slots:{wpn:1,def:1,eng:1,spec:3,sup:1}},
    slotType:'hull', icon:'🌌', desc:'Глубокий разведчик. Наука +20%, расширенное сканирование.',
    tags:['explorer','science'] },

  { id:'hull_freighter',   name:'Freighter-Pro', cat:'hull', subcat:'cargo',   tier:3, rarity:'rare',
    mfr:'CargoMax',     role:'Логистика',  levelRequired:15, price:40000,  upkeep:130,
    stats:{maxHull:220, cargo:90, tradeMod:.12, slots:{wpn:1,def:2,eng:1,spec:3,sup:2}},
    slotType:'hull', icon:'🏗️', desc:'Тяжёлый фрейтер. Трюм 90, торговля +12%.',
    tags:['cargo','trade','logistics'] },

  // T4 — Военный (lvl 19-28)
  { id:'hull_carrier',     name:'Star Marshal',  cat:'hull', subcat:'command', tier:4, rarity:'military',
    mfr:'CivicUnion',   role:'Командование',levelRequired:20, price:100000, upkeep:400,
    influenceRequired:50,
    stats:{maxHull:600, cargo:60, def:20, droneMod:2, slots:{wpn:2,def:2,eng:1,spec:2,sup:2}},
    slotType:'hull', icon:'👑', desc:'Флагман-авианосец. Дроны ×2, командные бонусы.',
    tags:['command','drones'] },

  { id:'hull_warlord',     name:'Warlord-IV',    cat:'hull', subcat:'combat',  tier:4, rarity:'military',
    mfr:'BastionWorks', role:'Линкор',     levelRequired:22, rankRequired:'Мастер', price:150000, upkeep:600,
    stats:{maxHull:900, cargo:25, atk:30, def:20, slots:{wpn:3,def:2,eng:1,spec:1,sup:1}},
    slotType:'hull', icon:'⚔️', desc:'Военный линкор. Требует ранг Мастер.',
    tags:['combat','military','heavy'] },

  { id:'hull_market_king', name:'Market King',   cat:'hull', subcat:'cargo',   tier:4, rarity:'military',
    mfr:'CargoMax',     role:'Торговля',   levelRequired:25, price:120000, upkeep:350,
    stats:{maxHull:300, cargo:130, tradeMod:.2, fuelMod:-.1, slots:{wpn:1,def:2,eng:1,spec:4,sup:2}},
    slotType:'hull', icon:'💰', desc:'Король торговли. Трюм 130, торговля +20%.',
    tags:['cargo','trade'] },

  // T5 — Элитный (lvl 29-40)
  { id:'hull_dread',       name:'Dreadnought',   cat:'hull', subcat:'combat',  tier:5, rarity:'experimental',
    mfr:'BastionWorks',  role:'Дредноут',  levelRequired:30, rankRequired:'Легенда', price:500000, upkeep:2000,
    stats:{maxHull:1200, cargo:80, atk:30, def:20, slots:{wpn:3,def:2,eng:1,spec:1,sup:1}},
    slotType:'hull', icon:'💀', desc:'Уничтожитель. Максимальная огневая мощь.',
    tags:['combat','military','heavy'] },

  { id:'hull_sigma_prime', name:'Sigma Prime',   cat:'hull', subcat:'explorer', tier:5,rarity:'experimental',
    mfr:'SigmaLab',      role:'ЭкспНаука', levelRequired:32, price:400000, upkeep:1500,
    stats:{maxHull:400, cargo:50, sciMod:.4, scanRange:3, anomalyMod:.3, slots:{wpn:2,def:2,eng:1,spec:4,sup:2}},
    slotType:'hull', icon:'🔮', desc:'Научная платформа. Аномалии +30%, наука +40%.',
    tags:['explorer','science','anomaly'] },

  // T6 — Экспериментальный (lvl 41+)
  { id:'hull_void_x',      name:'Void-X',        cat:'hull', subcat:'experimental',tier:6,rarity:'legendary',
    mfr:'XenoTech',      role:'Пустота',    levelRequired:42, bossKillRequired:3, price:2000000, upkeep:8000,
    stats:{maxHull:2000, cargo:100, atk:50, def:40, fuelMod:-.5, dodge:.15, slots:{wpn:3,def:2,eng:1,spec:3,sup:2}},
    slotType:'hull', icon:'🕳️', desc:'Легендарный корпус из материи пустоты. Требует 3 убийства боссов.',
    tags:['experimental','legendary','void'] },

  { id:'hull_xenoform',    name:'Xeno-Form',     cat:'hull', subcat:'experimental',tier:6,rarity:'legendary',
    mfr:'XenoTech',      role:'КсеноФорма', levelRequired:45, bossKillRequired:5, price:3000000, upkeep:12000,
    stats:{maxHull:1800, cargo:80, atk:60, sciMod:.5, alienMod:.5, slots:{wpn:3,def:2,eng:1,spec:4,sup:2}},
    slotType:'hull', icon:'👽', desc:'Корпус из ксено-материалов. Бонусы к бою с пришельцами.',
    tags:['experimental','legendary','alien'] },

  // Дополнительные корпуса (итого 24)
  { id:'hull_patrol',      name:'Patrol-7',      cat:'hull', subcat:'light',   tier:2, rarity:'enhanced',
    mfr:'RangerCore',   role:'Патруль',    levelRequired:5,  price:4000,   upkeep:25,
    stats:{maxHull:140, cargo:15, atk:5, dodge:.04, slots:{wpn:2,def:1,eng:1,spec:1,sup:1}},
    slotType:'hull', icon:'🔵', desc:'Патрульный корпус. Скорость и атака.',
    tags:['light','police'] },

  { id:'hull_commando',    name:'Commando',      cat:'hull', subcat:'combat',  tier:3, rarity:'rare',
    mfr:'BastionWorks', role:'Штурм',      levelRequired:16, price:45000,  upkeep:200,
    stats:{maxHull:380, cargo:18, atk:20, critMod:.1, slots:{wpn:3,def:1,eng:1,spec:1,sup:1}},
    slotType:'hull', icon:'🗡️', desc:'Штурмовик. Крит +10%, три оружейных слота.',
    tags:['combat','assault'] },

  { id:'hull_diplomat',    name:'Civic Envoy',   cat:'hull', subcat:'command', tier:3, rarity:'rare',
    mfr:'CivicUnion',   role:'Дипломатия', levelRequired:18, price:50000,  upkeep:180,
    influenceRequired:30,
    stats:{maxHull:250, cargo:30, repMod:.15, tradeMod:.1, slots:{wpn:1,def:2,eng:1,spec:3,sup:2}},
    slotType:'hull', icon:'🏛️', desc:'Дипломатический корпус. Репутация +15%, торговля +10%.',
    tags:['command','reputation'] },

  { id:'hull_salvager',    name:'Salvager',      cat:'hull', subcat:'cargo',   tier:2, rarity:'enhanced',
    mfr:'CargoMax',     role:'Утилизация', levelRequired:10, price:12000,  upkeep:60,
    stats:{maxHull:160, cargo:50, debrisMod:.3, slots:{wpn:1,def:1,eng:1,spec:2,sup:2}},
    slotType:'hull', icon:'♻️', desc:'Специалист по обломкам. Сбор +30%.',
    tags:['cargo','salvage'] },

  { id:'hull_ghost',       name:'Ghost Runner',  cat:'hull', subcat:'light',   tier:4, rarity:'military',
    mfr:'RangerCore',   role:'Стелс',      levelRequired:28, price:180000, upkeep:700,
    stats:{maxHull:350, cargo:20, fuelMod:-.3, dodge:.12, pirateMod:-.2, slots:{wpn:2,def:1,eng:1,spec:2,sup:1}},
    slotType:'hull', icon:'👻', desc:'Корпус-призрак. Уклонение 12%, шанс пиратов -20%.',
    tags:['light','stealth'] },

  { id:'hull_fortress',    name:'Fortress',      cat:'hull', subcat:'combat',  tier:5, rarity:'experimental',
    mfr:'BastionWorks', role:'Крепость',   levelRequired:38, rankRequired:'Призрак', price:800000, upkeep:3000,
    stats:{maxHull:2500, cargo:40, def:50, regenMod:15, slots:{wpn:2,def:2,eng:1,spec:2,sup:2}},
    slotType:'hull', icon:'🏰', desc:'Крепость. Максимальная защита, 2500 ХП.',
    tags:['combat','tank','heavy'] },
];

// ════════════════════════════════════
//  ОРУЖИЕ (54 шт.)
// ════════════════════════════════════
const WEAPONS_CATALOG = [
  // Лазеры T1
  { id:'wpn_beam1',       name:'Beam-1',         cat:'weapon', subcat:'laser',  tier:1, rarity:'common',
    mfr:'HeliosArms',  levelRequired:1,  price:0,     stats:{atk:5,  energy:0}, icon:'🔴', desc:'Стартовый лазер.' },
  { id:'wpn_beam2',       name:'Beam-2',         cat:'weapon', subcat:'laser',  tier:2, rarity:'enhanced',
    mfr:'HeliosArms',  levelRequired:4,  price:2000,  stats:{atk:12, energy:1}, icon:'🔴', desc:'Улучшенный лазер +12 урона.' },
  { id:'wpn_helios3',     name:'Helios III',     cat:'weapon', subcat:'laser',  tier:3, rarity:'rare',
    mfr:'HeliosArms',  levelRequired:10, price:12000, stats:{atk:25, energy:2, crit:.08}, icon:'🔴', desc:'Профлазер. Крит 8%.' },
  { id:'wpn_sunstrike',   name:'Sun Strike',     cat:'weapon', subcat:'laser',  tier:4, rarity:'military',
    mfr:'HeliosArms',  levelRequired:20, price:60000, stats:{atk:55, energy:3, crit:.15}, icon:'☀️', desc:'Военный лазер. Крит 15%.' },
  { id:'wpn_sol_cannon',  name:'Sol Cannon',     cat:'weapon', subcat:'laser',  tier:5, rarity:'experimental',
    mfr:'HeliosArms',  levelRequired:32, price:250000,stats:{atk:110,energy:4, crit:.2, burnChance:.25}, icon:'💫', desc:'Поджигающий лазер. Шанс горения 25%.' },
  { id:'wpn_photon_god',  name:'Photon God',     cat:'weapon', subcat:'laser',  tier:6, rarity:'legendary',
    mfr:'HeliosArms',  levelRequired:44, bossKillRequired:2, price:1500000, stats:{atk:220,energy:5,crit:.3}, icon:'⭐', desc:'Легендарный лазер. Крит 30%.' },

  // Баллистика T1-T6
  { id:'wpn_iron_burst',  name:'Iron Burst',     cat:'weapon', subcat:'ballistic',tier:1,rarity:'common',
    mfr:'BastionWorks',levelRequired:2,  price:800,   stats:{atk:8,  piercing:.1}, icon:'💥', desc:'Пробивает броню 10%.' },
  { id:'wpn_gatling',     name:'Gatling-22',     cat:'weapon', subcat:'ballistic',tier:2,rarity:'enhanced',
    mfr:'BastionWorks',levelRequired:6,  price:4000,  stats:{atk:18, piercing:.15, multiHit:2}, icon:'🔫', desc:'Двойной выстрел.' },
  { id:'wpn_rail_fang',   name:'Rail Fang',      cat:'weapon', subcat:'railgun',  tier:3,rarity:'rare',
    mfr:'BastionWorks',levelRequired:12, price:18000, stats:{atk:40, piercing:.3,  armor_break:.2}, icon:'⚡', desc:'Пробивает щиты 30%.' },
  { id:'wpn_mass_driver', name:'Mass Driver',    cat:'weapon', subcat:'railgun',  tier:4,rarity:'military',
    mfr:'BastionWorks',levelRequired:21, rankRequired:'Ветеран', price:80000, stats:{atk:85,piercing:.4}, icon:'🎯', desc:'Военный рейлган. Требует ранг Ветеран.' },
  { id:'wpn_void_slug',   name:'Void Slug',      cat:'weapon', subcat:'railgun',  tier:5,rarity:'experimental',
    mfr:'XenoTech',    levelRequired:33, price:300000,stats:{atk:160,piercing:.55,critMod:.25}, icon:'🌑', desc:'Пуля из материи пустоты.' },

  // Ракеты
  { id:'wpn_hydra2',      name:'Hydra-2',        cat:'weapon', subcat:'missile',  tier:2,rarity:'enhanced',
    mfr:'RangerCore',  levelRequired:5,  price:3000,  stats:{missileDmg:60, missiles:2}, icon:'🚀', desc:'+60 урона ракетой, +2 ракеты.' },
  { id:'wpn_hydra5',      name:'Hydra-5',        cat:'weapon', subcat:'missile',  tier:3,rarity:'rare',
    mfr:'RangerCore',  levelRequired:11, price:15000, stats:{missileDmg:120,missiles:3,multiMissile:2}, icon:'🚀', desc:'Двойная ракета.' },
  { id:'wpn_nova_strike', name:'Nova Strike',    cat:'weapon', subcat:'missile',  tier:4,rarity:'military',
    mfr:'RangerCore',  levelRequired:22, price:75000, stats:{missileDmg:250,missiles:5,aoe:.3}, icon:'💥', desc:'AoE ракета. Урон по площади 30%.' },
  { id:'wpn_omega_torp',  name:'Omega Torpedo',  cat:'weapon', subcat:'missile',  tier:5,rarity:'experimental',
    mfr:'XenoTech',    levelRequired:35, price:400000,stats:{missileDmg:500,missiles:6,aoe:.5,shieldBreak:.4}, icon:'☢️', desc:'Ломает щиты 40%.' },

  // Плазма
  { id:'wpn_plasma_s',    name:'Plasma Storm',   cat:'weapon', subcat:'plasma',   tier:3,rarity:'rare',
    mfr:'HeliosArms',  levelRequired:13, price:20000, stats:{atk:35, burnChance:.3, burnDmg:10}, icon:'🌀', desc:'Поджигает цель 30% шанс.' },
  { id:'wpn_inferno',     name:'Inferno Core',   cat:'weapon', subcat:'plasma',   tier:4,rarity:'military',
    mfr:'HeliosArms',  levelRequired:23, price:90000, stats:{atk:70, burnChance:.5, burnDmg:20}, icon:'🔥', desc:'Половина шансов поджечь цель.' },
  { id:'wpn_sun_plasma',  name:'Solar Annihilator',cat:'weapon',subcat:'plasma',  tier:5,rarity:'experimental',
    mfr:'HeliosArms',  levelRequired:36, price:500000,stats:{atk:140,burnChance:.7,burnDmg:35}, icon:'☀️', desc:'Почти всегда поджигает. Легко уничтожает.' },

  // Ксенотех T6
  { id:'wpn_xeno_pulse',  name:'Xeno Pulse',     cat:'weapon', subcat:'xenotech', tier:6,rarity:'legendary',
    mfr:'XenoTech',    levelRequired:41, bossKillRequired:2, price:1200000, stats:{atk:180,alienBonus:.5,piercing:.4}, icon:'👾', desc:'+50% урона пришельцам.' },
  { id:'wpn_mind_rift',   name:'Mind Rift',       cat:'weapon', subcat:'xenotech', tier:6,rarity:'legendary',
    mfr:'XenoTech',    levelRequired:43, bossKillRequired:3, price:2000000, stats:{atk:200,psiPierce:.6,crit:.35}, icon:'🌀', desc:'Пробивает пси-защиту 60%.' },

  // Дополнительные (до 54)
  { id:'wpn_scatter',     name:'Scatter Shot',   cat:'weapon', subcat:'ballistic',tier:2,rarity:'enhanced',
    mfr:'BastionWorks',levelRequired:7,  price:5000,  stats:{atk:15, multiHit:3, atkPenalty:.2}, icon:'💢', desc:'3 попадания -20% каждое.' },
  { id:'wpn_sniper',      name:'Long Eye',        cat:'weapon', subcat:'laser',   tier:3,rarity:'rare',
    mfr:'HeliosArms',  levelRequired:14, price:22000, stats:{atk:60, crit:.2, atkPenalty:.1}, icon:'🎯', desc:'Снайперский лазер. Крит 20%.' },
  { id:'wpn_emp',         name:'EMP Blaster',    cat:'weapon', subcat:'special',  tier:3,rarity:'rare',
    mfr:'SigmaLab',    levelRequired:15, price:25000, stats:{atk:20, energyDrain:15, shieldDisable:.3}, icon:'⚡', desc:'Высасывает 15 энергии, 30% отключить щит.' },
  { id:'wpn_grav_cannon', name:'Grav Cannon',    cat:'weapon', subcat:'special',  tier:4,rarity:'military',
    mfr:'XenoTech',    levelRequired:25, price:110000,stats:{atk:65, slowEffect:.4, piercing:.25}, icon:'🌀', desc:'Замедляет врага 40%.' },
  { id:'wpn_ion_storm',   name:'Ion Storm',      cat:'weapon', subcat:'plasma',   tier:4,rarity:'military',
    mfr:'HeliosArms',  levelRequired:24, price:95000, stats:{atk:80, ionChain:.25, chainDmg:.5}, icon:'⚡', desc:'Цепная молния 25% шанс.' },
  { id:'wpn_twin_laser',  name:'Twin Helix',     cat:'weapon', subcat:'laser',    tier:3,rarity:'rare',
    mfr:'HeliosArms',  levelRequired:12, price:16000, stats:{atk:20, multiHit:2}, icon:'🔴', desc:'Двойной лазерный удар.' },
  { id:'wpn_auto_rail',   name:'Auto Rail',      cat:'weapon', subcat:'railgun',  tier:3,rarity:'rare',
    mfr:'BastionWorks',levelRequired:13, price:19000, stats:{atk:35, multiHit:2, piercing:.2}, icon:'⚙️', desc:'Авторельсотрон. 2 снаряда.' },
  { id:'wpn_cluster',     name:'Cluster Bomb',   cat:'weapon', subcat:'missile',  tier:3,rarity:'rare',
    mfr:'RangerCore',  levelRequired:12, price:17000, stats:{missileDmg:90, missiles:2, aoe:.2}, icon:'💣', desc:'Кассетная бомба.' },
  { id:'wpn_disruptor',   name:'Disruptor',      cat:'weapon', subcat:'special',  tier:4,rarity:'military',
    mfr:'XenoTech',    levelRequired:26, price:120000,stats:{atk:50, specialDisrupt:.5, critVsDisrupted:.5}, icon:'🔮', desc:'Дезориентирует цель. Крит ×2 по дезор.' },
  { id:'wpn_dark_matter', name:'Dark Matter Gun',cat:'weapon', subcat:'xenotech', tier:5,rarity:'experimental',
    mfr:'XenoTech',    levelRequired:38, price:600000,stats:{atk:175,piercing:.5,antiMatter:true}, icon:'🖤', desc:'Игнорирует 50% защиты.' },
  // ... ещё 24 оружия для полноты 54
  ...Array.from({length:24},(_,i)=>{
    const tiers=[1,1,2,2,2,3,3,3,3,4,4,4,5,5,5,6,6,1,2,3,4,5,3,4];
    const subtypes=['laser','ballistic','missile','plasma','railgun','special','xenotech'];
    const mfrs=['HeliosArms','BastionWorks','RangerCore','XenoTech'];
    const t=tiers[i]||2; const lvl=[1,1,4,6,8,11,13,15,17,20,22,24,30,33,36,41,44,2,7,14,24,34,12,22][i]||5;
    return {
      id:`wpn_gen_${i}`, name:`W-${String(i+31).padStart(2,'0')}`, cat:'weapon',
      subcat:subtypes[i%7], tier:t, rarity:['common','enhanced','rare','military','experimental','legendary'][Math.min(t-1,5)],
      mfr:mfrs[i%4], levelRequired:lvl, price:Math.round(500*Math.pow(3,t-1)),
      stats:{atk:Math.round(5*Math.pow(2.2,t-1))}, icon:'🔫', desc:`Оружие уровня T${t}.`
    };
  }),
];

// ════════════════════════════════════
//  ЗАЩИТА (24 шт.)
// ════════════════════════════════════
const SHIELDS_CATALOG = [
  { id:'def_shield_a1',   name:'Shield A1',      cat:'defense', subcat:'shield', tier:1,rarity:'common',
    mfr:'RangerCore',  levelRequired:1,  price:0,     stats:{def:0, shieldHp:0}, icon:'🔵', desc:'Базовый щит.' },
  { id:'def_bastion_plate',name:'Bastion Plate', cat:'defense', subcat:'armor',  tier:2,rarity:'enhanced',
    mfr:'BastionWorks',levelRequired:5,  price:3000,  stats:{def:12, maxHull:50}, icon:'🔩', desc:'Броневые пластины. +50 ХП.' },
  { id:'def_guardian_net', name:'Guardian Net',  cat:'defense', subcat:'shield', tier:2,rarity:'enhanced',
    mfr:'RangerCore',  levelRequired:6,  price:4000,  stats:{def:8, reflect:.1}, icon:'🌐', desc:'Отражение 10%.' },
  { id:'def_reactive',     name:'Reactive Armor',cat:'defense', subcat:'armor',  tier:3,rarity:'rare',
    mfr:'BastionWorks',levelRequired:11, price:14000, stats:{def:20, maxHull:100, thornDmg:.15}, icon:'🛡️', desc:'Контратака 15% урона.' },
  { id:'def_mirage',       name:'Mirage Field',  cat:'defense', subcat:'shield', tier:3,rarity:'rare',
    mfr:'SigmaLab',    levelRequired:13, price:18000, stats:{def:15, reflect:.2, dodge:.05}, icon:'🪞', desc:'Отражение 20%, уклонение 5%.' },
  { id:'def_omega_barrier',name:'Omega Barrier', cat:'defense', subcat:'shield', tier:5,rarity:'experimental',
    mfr:'XenoTech',    levelRequired:35, price:450000,stats:{def:45, reflect:.35, maxHull:200}, icon:'💠', desc:'Лучший щит. Отражение 35%.' },
  { id:'def_xeno_carapace',name:'Xeno Carapace', cat:'defense', subcat:'armor',  tier:6,rarity:'legendary',
    mfr:'XenoTech',    levelRequired:42, bossKillRequired:2, price:1800000, stats:{def:60, maxHull:500, alienDef:.4}, icon:'👾', desc:'Ксено-броня. +40% защита от пришельцев.' },
  { id:'def_nullfield',    name:'Null Field',    cat:'defense', subcat:'shield', tier:4,rarity:'military',
    mfr:'SigmaLab',    levelRequired:22, price:85000, stats:{def:30, dmgReduction:.35, maxHull:100}, icon:'🌑', desc:'-35% вх. урона.' },
  // Дополнительные до 24
  ...Array.from({length:16},(_,i)=>{
    const t=Math.floor(i/3)+1||1;
    return { id:`def_gen_${i}`, name:`D-${String(i+9).padStart(2,'0')}`, cat:'defense',
      subcat:['shield','armor','anti_missile','jammer','barrier'][i%5],
      tier:Math.min(t,6), rarity:['common','enhanced','rare','military','experimental','legendary'][Math.min(t-1,5)],
      mfr:['BastionWorks','RangerCore','SigmaLab','XenoTech'][i%4],
      levelRequired:Math.max(1,[1,3,6,9,13,17,22,27,32,38,44,1,5,10,18,28][i]),
      price:Math.round(1000*Math.pow(2.5,t-1)),
      stats:{def:Math.round(5*Math.pow(1.9,t-1)), maxHull:Math.round(30*t)},
      icon:'🛡️', desc:`Защита T${t}.` };
  }),
];

// ════════════════════════════════════
//  ДВИГАТЕЛИ (24 шт.)
// ════════════════════════════════════
const ENGINES_CATALOG = [
  { id:'eng_ecodrive1',   name:'EcoDrive-1',     cat:'engine', subcat:'economy',tier:1,rarity:'common',
    mfr:'NovaDrive',   levelRequired:1,  price:0,     stats:{fuelMod:0, speed:1}, icon:'🔥', desc:'Стандартный двигатель.' },
  { id:'eng_razor',       name:'Razor Burn',     cat:'engine', subcat:'speed',  tier:2,rarity:'enhanced',
    mfr:'NovaDrive',   levelRequired:4,  price:2500,  stats:{fuelMod:-.1, speed:1.2}, icon:'⚡', desc:'Скоростной. -10% топлива.' },
  { id:'eng_longSail',    name:'Long Sail',      cat:'engine', subcat:'range',  tier:2,rarity:'enhanced',
    mfr:'NovaDrive',   levelRequired:6,  price:3500,  stats:{fuelMod:-.25, maxFuel:20}, icon:'🚀', desc:'Дальний. -25% топлива, +20 бак.' },
  { id:'eng_vector_core', name:'Vector Core',    cat:'engine', subcat:'tactical',tier:3,rarity:'rare',
    mfr:'NovaDrive',   levelRequired:11, price:12000, stats:{fuelMod:-.3, dodge:.04}, icon:'🌀', desc:'Тактический. Уклонение +4%.' },
  { id:'eng_warp_drive',  name:'Warp Drive',     cat:'engine', subcat:'warp',   tier:3,rarity:'rare',
    mfr:'NovaDrive',   levelRequired:13, price:20000, stats:{fuelMod:-.35, warp:true}, icon:'🌌', desc:'Открывает новые галактики.' },
  { id:'eng_quantum_leap',name:'Quantum Leap',   cat:'engine', subcat:'warp',   tier:4,rarity:'military',
    mfr:'NovaDrive',   levelRequired:22, price:80000, stats:{fuelMod:-.55, instantTravel:true}, icon:'✨', desc:'Мгновенный перелёт.' },
  { id:'eng_zero_rift',   name:'Zero Rift',      cat:'engine', subcat:'experimental',tier:5,rarity:'experimental',
    mfr:'XenoTech',    levelRequired:35, price:500000,stats:{fuelMod:-.75, fuelFree:true}, icon:'♾️', desc:'Бесплатные перелёты. Открывает Омегу.' },
  // Дополнительные до 24
  ...Array.from({length:17},(_,i)=>{
    const t=Math.min(Math.floor(i/3)+1,6);
    return { id:`eng_gen_${i}`, name:`E-${String(i+8).padStart(2,'0')}`, cat:'engine',
      subcat:['economy','speed','range','tactical','warp','experimental'][Math.min(i%6,5)],
      tier:t, rarity:['common','enhanced','rare','military','experimental','legendary'][Math.min(t-1,5)],
      mfr:['NovaDrive','XenoTech'][i%2],
      levelRequired:Math.max(1,[1,3,5,8,12,16,20,25,30,36,42,2,7,14,22,32,40][i]||1),
      price:Math.round(800*Math.pow(2.8,t-1)),
      stats:{fuelMod:-Math.round(t*8)/100, speed:1+t*.05},
      icon:'🚀', desc:`Двигатель T${t}.` };
  }),
];

// ════════════════════════════════════
//  СПЕЦМОДУЛИ (36 шт.)
// ════════════════════════════════════
const SPECMODS_CATALOG = [
  { id:'mod_market_lens', name:'Market Lens',    cat:'specmod', subcat:'trade',  tier:2,rarity:'enhanced',
    mfr:'CargoMax',    levelRequired:3,  price:2000,  stats:{tradeMod:.08, priceInfo:true}, icon:'💰', desc:'Торговля +8%. Показывает тренды.' },
  { id:'mod_deep_scan',   name:'Deep Scan',      cat:'specmod', subcat:'science',tier:2,rarity:'enhanced',
    mfr:'SigmaLab',    levelRequired:4,  price:2500,  stats:{sciMod:.1, anomalyChance:.1}, icon:'🔬', desc:'Наука +10%, аномалии +10%.' },
  { id:'mod_extractor',   name:'Core Extractor', cat:'specmod', subcat:'mining', tier:2,rarity:'enhanced',
    mfr:'RangerCore',  levelRequired:3,  price:1800,  stats:{mineMod:.15, cpsMod:5}, icon:'⛏️', desc:'Добыча +15%, +5 CPS.' },
  { id:'mod_nano_repair', name:'Nano Repair',    cat:'specmod', subcat:'repair', tier:3,rarity:'rare',
    mfr:'SigmaLab',    levelRequired:10, price:10000, stats:{regenMod:8, combatRegen:true}, icon:'🔧', desc:'+8 регенерации ХП/сек.' },
  { id:'mod_smart_hold',  name:'Smart Hold',     cat:'specmod', subcat:'logistics',tier:2,rarity:'enhanced',
    mfr:'CargoMax',    levelRequired:5,  price:3000,  stats:{cargo:15, autoSort:true}, icon:'📦', desc:'+15 трюма, авто-сортировка.' },
  { id:'mod_civic_beacon',name:'Civic Beacon',   cat:'specmod', subcat:'influence',tier:3,rarity:'rare',
    mfr:'CivicUnion',  levelRequired:12, influenceRequired:20, price:15000, stats:{repMod:.15, influenceMod:5}, icon:'📡', desc:'Репутация +15%, влияние +5/день.' },
  { id:'mod_xeno_scanner',name:'Xeno Scanner',   cat:'specmod', subcat:'science',tier:4,rarity:'military',
    mfr:'XenoTech',    levelRequired:22, price:70000, stats:{sciMod:.25, alienDetect:true, alienWeakspot:.15}, icon:'👽', desc:'Обнаруживает пришельцев заранее.' },
  { id:'mod_trade_lord',  name:'Trade Lord',     cat:'specmod', subcat:'trade',  tier:5,rarity:'experimental',
    mfr:'CargoMax',    levelRequired:33, price:350000,stats:{tradeMod:.3, priceManip:.1}, icon:'💎', desc:'Торговля +30%, манипуляция ценами.' },
  // Дополнительные до 36
  ...Array.from({length:28},(_,i)=>{
    const t=Math.min(Math.floor(i/5)+1,6);
    const subtypes=['trade','science','mining','repair','logistics','influence'];
    return { id:`mod_gen_${i}`, name:`M-${String(i+9).padStart(2,'0')}`, cat:'specmod',
      subcat:subtypes[i%6], tier:t,
      rarity:['common','enhanced','rare','military','experimental','legendary'][Math.min(t-1,5)],
      mfr:['CargoMax','SigmaLab','RangerCore','CivicUnion','XenoTech'][i%5],
      levelRequired:Math.max(1,t*4-3),
      price:Math.round(1500*Math.pow(2.5,t-1)),
      stats:{[['tradeMod','sciMod','mineMod','regenMod','cargo','repMod'][i%6]]: t*.05+(i%6<2?0.05:0)},
      icon:['💰','🔬','⛏️','🔧','📦','📡'][i%6], desc:`Спецмодуль ${subtypes[i%6]} T${t}.` };
  }),
];

// ════════════════════════════════════
//  ПОДДЕРЖКА / ДРОНЫ (18 шт.)
// ════════════════════════════════════
const DRONES_CATALOG = [
  { id:'drone_sting',     name:'Sting Drone',    cat:'support', subcat:'combat', tier:2,rarity:'enhanced',
    mfr:'RangerCore',  levelRequired:5,  price:4000,  stats:{droneDmg:15, droneCount:1}, icon:'🤖', desc:'Боевой дрон. +15 урона.' },
  { id:'drone_patch',     name:'Patch Drone',    cat:'support', subcat:'repair', tier:2,rarity:'enhanced',
    mfr:'SigmaLab',    levelRequired:6,  price:4500,  stats:{droneRegen:5, droneCount:1}, icon:'🔧', desc:'Ремонтный дрон. +5 ХП/сек.' },
  { id:'drone_mule',      name:'Mule Bot',       cat:'support', subcat:'cargo',  tier:2,rarity:'enhanced',
    mfr:'CargoMax',    levelRequired:5,  price:3500,  stats:{cargo:10, autoCollect:true}, icon:'🚁', desc:'Грузовой дрон. +10 трюма, автосбор.' },
  { id:'drone_probe_x',   name:'Probe-X',        cat:'support', subcat:'scout',  tier:3,rarity:'rare',
    mfr:'SigmaLab',    levelRequired:10, price:12000, stats:{sciMod:.1, anomalyChance:.15, droneCount:1}, icon:'🔭', desc:'Разведывательный зонд. Аномалии +15%.' },
  { id:'drone_marshal',   name:'Marshal Link',   cat:'support', subcat:'command',tier:4,rarity:'military',
    mfr:'CivicUnion',  levelRequired:20, influenceRequired:30, price:60000, stats:{influenceMod:8, allyBuff:.1}, icon:'🏛️', desc:'Командный ретранслятор. Влияние +8/день.' },
  { id:'drone_guardian',  name:'Guardian Bot',   cat:'support', subcat:'combat', tier:4,rarity:'military',
    mfr:'BastionWorks',levelRequired:22, price:75000, stats:{droneDmg:35, reflect:.1, droneCount:2}, icon:'🛡️', desc:'Боевой страж. 2 дрона, отражение 10%.' },
  { id:'drone_medpod',    name:'Med-Pod Alpha',  cat:'support', subcat:'repair', tier:3,rarity:'rare',
    mfr:'SigmaLab',    levelRequired:13, price:20000, stats:{droneRegen:12, combatRevive:.1}, icon:'💊', desc:'Медицинский дрон. 10% воскреснуть в бою.' },
  { id:'drone_xeno_link', name:'Xeno Link',      cat:'support', subcat:'command',tier:5,rarity:'experimental',
    mfr:'XenoTech',    levelRequired:34, bossKillRequired:1, price:300000, stats:{alienComm:true, droneDmg:50, droneCount:3}, icon:'👾', desc:'Ксено-дрон. Общается с пришельцами.' },
  // Дополнительные до 18
  ...Array.from({length:10},(_,i)=>{
    const t=Math.min(Math.floor(i/2)+1,5);
    return { id:`drone_gen_${i}`, name:`Drone-${String(i+9).padStart(2,'0')}`, cat:'support',
      subcat:['combat','repair','cargo','scout','command'][i%5], tier:t,
      rarity:['common','enhanced','rare','military','experimental'][Math.min(t-1,4)],
      mfr:['RangerCore','SigmaLab','CargoMax','CivicUnion'][i%4],
      levelRequired:Math.max(1,t*5),
      price:Math.round(2000*Math.pow(2.5,t-1)),
      stats:{droneCount:Math.ceil(t/2)}, icon:'🤖', desc:`Дрон T${t}.` };
  }),
];

// ════════════════════════════════════
//  СВОДНЫЙ КАТАЛОГ
// ════════════════════════════════════
const EQUIPMENT_CATALOG = [
  ...HULLS_CATALOG,
  ...WEAPONS_CATALOG,
  ...SHIELDS_CATALOG,
  ...ENGINES_CATALOG,
  ...SPECMODS_CATALOG,
  ...DRONES_CATALOG,
];

// Вспомогательные функции каталога
function getEquipUnlocked(item, G){
  if(!item) return false;
  if(item.levelRequired   && G.lvl         < item.levelRequired)   return false;
  if(item.honorRequired   && (G.honor||0)  < item.honorRequired)   return false;
  if(item.influenceRequired && (G.influence||0) < item.influenceRequired) return false;
  if(item.rankRequired){
    const rankOrder=['Новичок','Скаут','Рейнджер','Ветеран','Мастер','Легенда','Призрак'];
    if(rankOrder.indexOf(getRank()?.name)<rankOrder.indexOf(item.rankRequired)) return false;
  }
  if(item.bossKillRequired && ((G.alienKills||0)+(G.killCount||0)) < item.bossKillRequired*20) return false;
  return true;
}

function getEquipLockReason(item, G){
  if(!item) return '';
  const reasons=[];
  if(item.levelRequired   && G.lvl         < item.levelRequired)   reasons.push(`Уровень ${item.levelRequired}`);
  if(item.honorRequired   && (G.honor||0)  < item.honorRequired)   reasons.push(`Честь ${item.honorRequired}`);
  if(item.influenceRequired && (G.influence||0) < item.influenceRequired) reasons.push(`Влияние ${item.influenceRequired}`);
  if(item.rankRequired)   reasons.push(`Ранг: ${item.rankRequired}`);
  if(item.bossKillRequired) reasons.push(`Боссы: ${item.bossKillRequired}`);
  return reasons.join(' · ');
}
