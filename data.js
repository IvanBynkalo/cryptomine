// ═══════════════════════════════════════
//  SPACE RANGERS: IDLE WARS — data.js
//  All static game data / constants

// ═══════════════════════════════════════════════════════════════
//  STORY_CHAINS — 50 сюжетных цепочек
//
//  Структура:
//  - id            уникальный ключ
//  - icon          эмодзи
//  - title         название
//  - desc          краткое описание
//  - difficulty    'easy'|'normal'|'hard'|'epic'
//  - minLevel      минимальный уровень игрока для старта
//  - startGal      галактика где ВЫДАЁТСЯ цепочка (нужно прилететь)
//  - startSys      система где берётся задание
//  - steps[]       шаги цепочки
//    - title       название шага
//    - desc        текст задания
//    - type        'arrive'|'deliver'|'kill'
//    - sys         id системы назначения
//    - good        id товара (для deliver)
//    - amt         количество (для deliver)
//    - count       кол-во убийств (для kill)
//    - reward      кредиты за шаг
//    - xp          опыт за шаг
//    - final       true на последнем шаге
//    - finalReward 'credits:N' или 'equip:item_id'
// ═══════════════════════════════════════════════════════════════

const STORY_CHAINS = [

  // ══════════════════════════════════════
  //  АЛЬФА — Уровни 1-3 (easy)
  // ══════════════════════════════════════

  {
    id: 'alpha_rookie',
    icon: '🌱', title: 'Первые шаги',
    desc: 'Губернатор Солнечной даёт тебе первое задание — доставь провизию в Кеплер.',
    difficulty: 'easy', minLevel: 1, startGal: 'alpha', startSys: 'sol',
    steps: [
      { title: 'Закупка провизии', desc: 'Купи провизию на рынке Солнечной и лети в Кеплер.',
        type: 'deliver', sys: 'kep', good: 'food', amt: 3, reward: 400, xp: 30 },
      { title: 'Обратный путь', desc: 'Вернись в Солнечную с отчётом.',
        type: 'arrive', sys: 'sol', reward: 300, xp: 20,
        final: true, finalReward: 'credits:1000' },
    ],
  },

  {
    id: 'alpha_miner_start',
    icon: '⛏️', title: 'Горняцкий сезон',
    desc: 'На Икаре нехватка топлива. Доставь ресурсы и помоги шахтёрам.',
    difficulty: 'easy', minLevel: 1, startGal: 'alpha', startSys: 'kep',
    steps: [
      { title: 'Топливо для шахты', desc: 'Доставь топливо из Кеплера на Икар.',
        type: 'deliver', sys: 'icarus', good: 'fuel', amt: 4, reward: 500, xp: 40 },
      { title: 'Руда для обработки', desc: 'Доставь руду из Икара на Вегу для переработки.',
        type: 'deliver', sys: 'vega', good: 'ore', amt: 5, reward: 700, xp: 50,
        final: true, finalReward: 'credits:2000' },
    ],
  },

  {
    id: 'alpha_science_intro',
    icon: '🔬', title: 'Научный интерес',
    desc: 'Профессор Нова Кор ищет технологии для новых экспериментов.',
    difficulty: 'easy', minLevel: 2, startGal: 'alpha', startSys: 'nova',
    steps: [
      { title: 'Закупка технологий', desc: 'Привези технологии с Веги в Нова Кор.',
        type: 'deliver', sys: 'nova', good: 'tech', amt: 3, reward: 600, xp: 45 },
      { title: 'Образцы минералов', desc: 'Для опытов нужны минералы — доставь с Кеплера.',
        type: 'deliver', sys: 'nova', good: 'minerals', amt: 4, reward: 800, xp: 55,
        final: true, finalReward: 'credits:2500' },
    ],
  },

  {
    id: 'alpha_patrol_duty',
    icon: '👮', title: 'Патрульная служба',
    desc: 'Галактическая Стража просит помочь с патрулированием.',
    difficulty: 'easy', minLevel: 2, startGal: 'alpha', startSys: 'vega',
    steps: [
      { title: 'Первый патруль', desc: 'Уничтожь 2 пирата в секторе Альфа.',
        type: 'kill', count: 2, reward: 700, xp: 60 },
      { title: 'Отчёт командиру', desc: 'Прибудь на Вегу с отчётом о выполнении.',
        type: 'arrive', sys: 'vega', reward: 500, xp: 30,
        final: true, finalReward: 'credits:2000' },
    ],
  },

  {
    id: 'alpha_medical_crisis',
    icon: '💊', title: 'Медицинский кризис',
    desc: 'На Икаре вспышка болезни. Необходимы медикаменты срочно.',
    difficulty: 'easy', minLevel: 2, startGal: 'alpha', startSys: 'vega',
    steps: [
      { title: 'Закупка медикаментов', desc: 'Возьми медикаменты с Веги.',
        type: 'deliver', sys: 'icarus', good: 'medicine', amt: 4, reward: 800, xp: 55 },
      { title: 'Благодарность колонии', desc: 'Вернись в Вегу с подтверждением доставки.',
        type: 'arrive', sys: 'vega', reward: 600, xp: 35,
        final: true, finalReward: 'credits:2500' },
    ],
  },

  // ══════════════════════════════════════
  //  АЛЬФА — Уровни 3-5 (normal)
  // ══════════════════════════════════════

  {
    id: 'alpha_trade_route',
    icon: '📦', title: 'Торговый маршрут',
    desc: 'Адмирал Вега хочет наладить торговый маршрут через всю Альфу.',
    difficulty: 'normal', minLevel: 3, startGal: 'alpha', startSys: 'vega',
    steps: [
      { title: 'Звено первое: Кеплер', desc: 'Доставь провизию с Веги в Кеплер.',
        type: 'deliver', sys: 'kep', good: 'food', amt: 5, reward: 900, xp: 70 },
      { title: 'Звено второе: Нова Кор', desc: 'Доставь минералы из Кеплера в Нова Кор.',
        type: 'deliver', sys: 'nova', good: 'minerals', amt: 5, reward: 1000, xp: 80 },
      { title: 'Замыкание маршрута', desc: 'Технологии из Нова Кор нужны обратно на Вегу.',
        type: 'deliver', sys: 'vega', good: 'tech', amt: 4, reward: 1200, xp: 90,
        final: true, finalReward: 'credits:5000' },
    ],
  },

  {
    id: 'alpha_pirate_threat',
    icon: '☠️', title: 'Пиратская угроза',
    desc: 'Пираты активизировались на подступах к Альфе. Очисти сектор.',
    difficulty: 'normal', minLevel: 3, startGal: 'alpha', startSys: 'sol',
    steps: [
      { title: 'Первая волна', desc: 'Уничтожь 4 пирата в системах Альфы.',
        type: 'kill', count: 4, reward: 1000, xp: 80 },
      { title: 'Зачистка Икара', desc: 'Прибудь в Икар — там самая высокая концентрация пиратов.',
        type: 'arrive', sys: 'icarus', reward: 500, xp: 40 },
      { title: 'Финальный удар', desc: 'Уничтожь ещё 5 пиратов.',
        type: 'kill', count: 5, reward: 1500, xp: 120,
        final: true, finalReward: 'credits:6000' },
    ],
  },

  {
    id: 'alpha_fuel_crisis',
    icon: '⛽', title: 'Топливный кризис',
    desc: 'Вся галактика Альфа испытывает нехватку топлива. Организуй поставки.',
    difficulty: 'normal', minLevel: 4, startGal: 'alpha', startSys: 'icarus',
    steps: [
      { title: 'Резервы Икара', desc: 'Забери топливо из Икара и доставь в Солнечную.',
        type: 'deliver', sys: 'sol', good: 'fuel', amt: 6, reward: 1100, xp: 85 },
      { title: 'Резервы Кеплера', desc: 'Закупи ещё топливо в Кеплере для Веги.',
        type: 'deliver', sys: 'vega', good: 'fuel', amt: 6, reward: 1300, xp: 95,
        final: true, finalReward: 'credits:6500' },
    ],
  },

  // ══════════════════════════════════════
  //  БЕТА — Уровни 3-5 (normal)
  // ══════════════════════════════════════

  {
    id: 'beta_welcome',
    icon: '💠', title: 'Новый горизонт',
    desc: 'Первые контакты с галактикой Бета. ИИ-Координатор Нексуса ждёт тебя.',
    difficulty: 'normal', minLevel: 3, startGal: 'beta', startSys: 'nexus',
    steps: [
      { title: 'Аудиенция', desc: 'Прибудь на Нексус и представься координатору.',
        type: 'arrive', sys: 'nexus', reward: 600, xp: 50 },
      { title: 'Пробный контракт', desc: 'Доставь технологии с Нексуса в Эден.',
        type: 'deliver', sys: 'eden', good: 'tech', amt: 4, reward: 1200, xp: 90,
        final: true, finalReward: 'credits:4000' },
    ],
  },

  {
    id: 'beta_eden_paradise',
    icon: '🌿', title: 'Рай в опасности',
    desc: 'Королева Эдема просит защитить колонию от участившихся пиратских налётов.',
    difficulty: 'normal', minLevel: 4, startGal: 'beta', startSys: 'eden',
    steps: [
      { title: 'Оборона рая', desc: 'Уничтожь 4 пирата в секторе Беты.',
        type: 'kill', count: 4, reward: 1100, xp: 90 },
      { title: 'Провизия для колонии', desc: 'Доставь провизию с Нексуса в Эден.',
        type: 'deliver', sys: 'eden', good: 'food', amt: 6, reward: 1000, xp: 80 },
      { title: 'Медицинский запас', desc: 'Доставь медикаменты с Пульсара в Эден.',
        type: 'deliver', sys: 'eden', good: 'medicine', amt: 5, reward: 1300, xp: 100,
        final: true, finalReward: 'credits:7000' },
    ],
  },

  {
    id: 'beta_dragon_intel',
    icon: '🐉', title: 'Разведка Дракона',
    desc: 'Генерал требует разведданные из системы Дракон — логова пиратов.',
    difficulty: 'normal', minLevel: 4, startGal: 'beta', startSys: 'dragon',
    steps: [
      { title: 'Бросок в пасть', desc: 'Лети в Дракон и выживи. Данные собирут автоматически.',
        type: 'arrive', sys: 'dragon', reward: 800, xp: 70 },
      { title: 'Ответный удар', desc: 'Уничтожь 5 пиратов в системе Дракон.',
        type: 'kill', count: 5, reward: 1800, xp: 140 },
      { title: 'Передача данных', desc: 'Вернись в Нексус с разведывательными данными.',
        type: 'arrive', sys: 'nexus', reward: 1000, xp: 80,
        final: true, finalReward: 'credits:8000' },
    ],
  },

  {
    id: 'beta_pulse_science',
    icon: '⚡', title: 'Пульсирующая наука',
    desc: 'Учёные Пульсара обнаружили аномалию. Нужны редкие материалы для исследования.',
    difficulty: 'normal', minLevel: 4, startGal: 'beta', startSys: 'pulse',
    steps: [
      { title: 'Сбор минералов', desc: 'Доставь минералы с Дракона в Пульсар.',
        type: 'deliver', sys: 'pulse', good: 'minerals', amt: 6, reward: 1200, xp: 95 },
      { title: 'Топливо для реактора', desc: 'Привези топливо из Эдема на Пульсар.',
        type: 'deliver', sys: 'pulse', good: 'fuel', amt: 5, reward: 1100, xp: 85,
        final: true, finalReward: 'credits:6500' },
    ],
  },

  // ══════════════════════════════════════
  //  АЛЬФА/БЕТА — Уровни 5-7 (hard)
  // ══════════════════════════════════════

  {
    id: 'inter_galactic_trade',
    icon: '🌌', title: 'Межгалактический торговец',
    desc: 'Первый торговый союз между Альфой и Бетой. Историческая миссия.',
    difficulty: 'hard', minLevel: 5, startGal: 'alpha', startSys: 'vega',
    steps: [
      { title: 'Технологии для Беты', desc: 'Доставь технологии из Веги в Нексус.',
        type: 'deliver', sys: 'nexus', good: 'tech', amt: 8, reward: 1800, xp: 140 },
      { title: 'Оружие обратно', desc: 'Доставь оружие из Беты в Солнечную для защиты.',
        type: 'deliver', sys: 'sol', good: 'weapons', amt: 5, reward: 2000, xp: 160 },
      { title: 'Закрепление союза', desc: 'Уничтожь 6 пиратов угрожающих торговым путям.',
        type: 'kill', count: 6, reward: 2500, xp: 200,
        final: true, finalReward: 'credits:12000' },
    ],
  },

  {
    id: 'beta_ares_siege',
    icon: '🔥', title: 'Осада Ареса',
    desc: 'Система Арес блокирована пиратским флотом. Пробей блокаду.',
    difficulty: 'hard', minLevel: 5, startGal: 'beta', startSys: 'ares',
    steps: [
      { title: 'Прорыв блокады', desc: 'Уничтожь 7 пиратов у Ареса.',
        type: 'kill', count: 7, reward: 2000, xp: 160 },
      { title: 'Снабжение выживших', desc: 'Доставь медикаменты из Эдема на Арес.',
        type: 'deliver', sys: 'ares', good: 'medicine', amt: 6, reward: 1800, xp: 140 },
      { title: 'Военные трофеи', desc: 'Доставь захваченное оружие с Ареса в Нексус.',
        type: 'deliver', sys: 'nexus', good: 'weapons', amt: 5, reward: 2200, xp: 180,
        final: true, finalReward: 'credits:15000' },
    ],
  },

  {
    id: 'alpha_ancient_relic',
    icon: '🏺', title: 'Древняя реликвия',
    desc: 'В астероидном поле Икара нашли артефакт неизвестной цивилизации.',
    difficulty: 'hard', minLevel: 5, startGal: 'alpha', startSys: 'icarus',
    steps: [
      { title: 'Осмотр места', desc: 'Прибудь в Икар для первичного осмотра.',
        type: 'arrive', sys: 'icarus', reward: 800, xp: 70 },
      { title: 'Материалы для анализа', desc: 'Доставь минералы и технологии в Нова Кор.',
        type: 'deliver', sys: 'nova', good: 'minerals', amt: 7, reward: 1800, xp: 145 },
      { title: 'Охрана артефакта', desc: 'Уничтожь 6 пиратов охотящихся за артефактом.',
        type: 'kill', count: 6, reward: 2200, xp: 175 },
      { title: 'Транспортировка', desc: 'Доставь технологии из Нова Кор в Солнечную для сохранения.',
        type: 'deliver', sys: 'sol', good: 'tech', amt: 5, reward: 2000, xp: 160,
        final: true, finalReward: 'credits:18000' },
    ],
  },

  // ══════════════════════════════════════
  //  ГАММА — Уровни 5-7 (hard)
  // ══════════════════════════════════════

  {
    id: 'gamma_first_step',
    icon: '⚫', title: 'Шаг в темноту',
    desc: 'Первый разведывательный рейд в галактику Гамма. Будь осторожен.',
    difficulty: 'hard', minLevel: 5, startGal: 'gamma', startSys: 'zion',
    steps: [
      { title: 'Прибытие в Зион', desc: 'Доберись до торгового хаба Зион в Гамме.',
        type: 'arrive', sys: 'zion', reward: 1000, xp: 90 },
      { title: 'Ценный груз', desc: 'Доставь технологии из Зиона в Аркейн для учёных.',
        type: 'deliver', sys: 'arcane', good: 'tech', amt: 5, reward: 2000, xp: 160 },
      { title: 'Выживание', desc: 'Уничтожь 5 пиратов в Гамме и вернись в Зион.',
        type: 'kill', count: 5, reward: 2500, xp: 200,
        final: true, finalReward: 'credits:14000' },
    ],
  },

  {
    id: 'gamma_forge_contract',
    icon: '⚙️', title: 'Контракт Кузницы',
    desc: 'Кузница — крупнейший добывающий комплекс Гаммы. Организуй поставки.',
    difficulty: 'hard', minLevel: 6, startGal: 'gamma', startSys: 'forge',
    steps: [
      { title: 'Руда для Кузницы', desc: 'Привези руду из системы Зион в Кузницу.',
        type: 'deliver', sys: 'forge', good: 'ore', amt: 8, reward: 2000, xp: 160 },
      { title: 'Сплавы на экспорт', desc: 'Доставь минералы из Кузницы в Зион.',
        type: 'deliver', sys: 'zion', good: 'minerals', amt: 8, reward: 2200, xp: 175 },
      { title: 'Охрана конвоя', desc: 'Уничтожь 7 пиратов атакующих торговые маршруты Гаммы.',
        type: 'kill', count: 7, reward: 3000, xp: 240,
        final: true, finalReward: 'credits:18000' },
    ],
  },

  {
    id: 'gamma_abyss_scout',
    icon: '🖤', title: 'Разведка Бездны',
    desc: 'Система Бездна — самое опасное место в Гамме. Нужны смельчаки.',
    difficulty: 'hard', minLevel: 6, startGal: 'gamma', startSys: 'abyss',
    steps: [
      { title: 'Прыжок в Бездну', desc: 'Лети в систему Бездна. Там ждёт опасность.',
        type: 'arrive', sys: 'abyss', reward: 1500, xp: 120 },
      { title: 'Резня', desc: 'Уничтожь 8 пиратов засевших в Бездне.',
        type: 'kill', count: 8, reward: 3000, xp: 240 },
      { title: 'Контрабанда знаний', desc: 'Вывези технологии из Бездны в Аркейн.',
        type: 'deliver', sys: 'arcane', good: 'tech', amt: 6, reward: 2500, xp: 200,
        final: true, finalReward: 'credits:22000' },
    ],
  },

  {
    id: 'gamma_arcane_mystery',
    icon: '🌀', title: 'Тайна Аркейна',
    desc: 'Учёные Аркейна обнаружили следы древней цивилизации. Требуется помощь.',
    difficulty: 'hard', minLevel: 6, startGal: 'gamma', startSys: 'arcane',
    steps: [
      { title: 'Экспедиционное снаряжение', desc: 'Привези медикаменты из Зиона в Аркейн.',
        type: 'deliver', sys: 'arcane', good: 'medicine', amt: 6, reward: 1800, xp: 145 },
      { title: 'Образцы с Кузницы', desc: 'Нужны уникальные минералы — привези из Кузницы.',
        type: 'deliver', sys: 'arcane', good: 'minerals', amt: 8, reward: 2200, xp: 175 },
      { title: 'Защита от мародёров', desc: 'Пираты прознали про находку — уничтожь 7.',
        type: 'kill', count: 7, reward: 3500, xp: 280,
        final: true, finalReward: 'credits:25000' },
    ],
  },

  // ══════════════════════════════════════
  //  ХАОС — Уровни 7-8 (epic)
  // ══════════════════════════════════════

  {
    id: 'chaos_entry',
    icon: '💀', title: 'Добро пожаловать в Хаос',
    desc: 'Немногие решаются войти в галактику Хаос. Ты — один из них.',
    difficulty: 'epic', minLevel: 7, startGal: 'chaos', startSys: 'sanctum',
    steps: [
      { title: 'Единственный маяк', desc: 'Санктум — единственный торговый пост в Хаосе. Прибудь сюда.',
        type: 'arrive', sys: 'sanctum', reward: 2000, xp: 180 },
      { title: 'Цена выживания', desc: 'Уничтожь 8 пиратов Хаоса — докажи что ты не жертва.',
        type: 'kill', count: 8, reward: 4000, xp: 320 },
      { title: 'Ресурсы для Санктума', desc: 'Доставь провизию с Санктума пополнив запасы.',
        type: 'deliver', sys: 'sanctum', good: 'food', amt: 8, reward: 3000, xp: 240,
        final: true, finalReward: 'credits:30000' },
    ],
  },

  {
    id: 'chaos_entropy_run',
    icon: '🌑', title: 'Бег через Энтропию',
    desc: 'Группа выживших застряла в системе Энтропия. Нужна срочная эвакуация.',
    difficulty: 'epic', minLevel: 7, startGal: 'chaos', startSys: 'entropy',
    steps: [
      { title: 'Рывок к Энтропии', desc: 'Лети в систему Энтропия. Там пиратская активность 85%.',
        type: 'arrive', sys: 'entropy', reward: 2500, xp: 210 },
      { title: 'Пробить кольцо', desc: 'Уничтожь 10 пиратов блокирующих выход.',
        type: 'kill', count: 10, reward: 5000, xp: 400 },
      { title: 'Медикаменты выжившим', desc: 'Доставь медикаменты из Санктума в Энтропию.',
        type: 'deliver', sys: 'entropy', good: 'medicine', amt: 8, reward: 4000, xp: 320,
        final: true, finalReward: 'credits:40000' },
    ],
  },

  {
    id: 'chaos_vortex_storm',
    icon: '🌪️', title: 'Буря в Вортексе',
    desc: 'Вортекс — самая нестабильная система Хаоса. Добыть там нечто ценное.',
    difficulty: 'epic', minLevel: 8, startGal: 'chaos', startSys: 'vortex',
    steps: [
      { title: 'Войти в шторм', desc: 'Достигни системы Вортекс. 90% вероятность пиратов.',
        type: 'arrive', sys: 'vortex', reward: 3000, xp: 260 },
      { title: 'Резня в шторме', desc: 'Уничтожь 12 пиратов в системе Вортекс.',
        type: 'kill', count: 12, reward: 6000, xp: 480 },
      { title: 'Добыча хаоса', desc: 'Вывези оружие из Вортекса в Санктум.',
        type: 'deliver', sys: 'sanctum', good: 'weapons', amt: 10, reward: 5000, xp: 400,
        final: true, finalReward: 'credits:50000' },
    ],
  },

  {
    id: 'chaos_rift_expedition',
    icon: '🕳️', title: 'Экспедиция в Разлом',
    desc: 'Аномальный Разлом скрывает технологии потерянной цивилизации.',
    difficulty: 'epic', minLevel: 8, startGal: 'chaos', startSys: 'rift',
    steps: [
      { title: 'Прыжок в Разлом', desc: 'Прибудь в систему Разлом.',
        type: 'arrive', sys: 'rift', reward: 2800, xp: 240 },
      { title: 'Охрана экспедиции', desc: 'Уничтожь 10 пиратов угрожающих учёным.',
        type: 'kill', count: 10, reward: 5500, xp: 440 },
      { title: 'Артефакты на базу', desc: 'Доставь технологии из Разлома в Санктум.',
        type: 'deliver', sys: 'sanctum', good: 'tech', amt: 8, reward: 4500, xp: 360,
        final: true, finalReward: 'credits:55000' },
    ],
  },

  // ══════════════════════════════════════
  //  ДЕЛЬТА/ТУМАННОСТЬ — Уровни 6-8 (hard)
  // ══════════════════════════════════════

  {
    id: 'delta_new_frontier',
    icon: '🪐', title: 'Новый рубеж',
    desc: 'Дельта — только что открытая галактика. Установи первые торговые связи.',
    difficulty: 'hard', minLevel: 6, startGal: 'delta', startSys: 'delta_prime',
    steps: [
      { title: 'Первый визит', desc: 'Прибудь в Дельта Прайм.',
        type: 'arrive', sys: 'delta_prime', reward: 1500, xp: 130 },
      { title: 'Торговый дебют', desc: 'Доставь технологии из Дельта Прайм на Гелиос.',
        type: 'deliver', sys: 'helios', good: 'tech', amt: 6, reward: 2500, xp: 200 },
      { title: 'Первая зачистка', desc: 'Уничтожь 6 пиратов в Дельте.',
        type: 'kill', count: 6, reward: 3000, xp: 240,
        final: true, finalReward: 'credits:18000' },
    ],
  },

  {
    id: 'nebula_mist_research',
    icon: '🌫️', title: 'Исследование Мглы',
    desc: 'Туманность — загадочная галактика с уникальными аномалиями.',
    difficulty: 'hard', minLevel: 6, startGal: 'nebula', startSys: 'mist',
    steps: [
      { title: 'Добраться до Мглы', desc: 'Прибудь в научную станцию Мгла.',
        type: 'arrive', sys: 'mist', reward: 1500, xp: 130 },
      { title: 'Снаряжение учёных', desc: 'Доставь медикаменты из Авроры в Мглу.',
        type: 'deliver', sys: 'mist', good: 'medicine', amt: 7, reward: 2500, xp: 200 },
      { title: 'Образцы для лаборатории', desc: 'Привези топливо из Эха в Мглу.',
        type: 'deliver', sys: 'mist', good: 'fuel', amt: 6, reward: 2200, xp: 175,
        final: true, finalReward: 'credits:20000' },
    ],
  },

  {
    id: 'belt_smuggler_hunt',
    icon: '🛰️', title: 'Охота на контрабандистов',
    desc: 'Пояс — перевалочный пункт контрабандистов. Разгроми их сеть.',
    difficulty: 'hard', minLevel: 7, startGal: 'belt', startSys: 'dockyard',
    steps: [
      { title: 'Прибыть в Докъярд', desc: 'Брифинг у местного командира.',
        type: 'arrive', sys: 'dockyard', reward: 1500, xp: 130 },
      { title: 'Зачистка Ореона', desc: 'Уничтожь 7 контрабандистов у Ореона.',
        type: 'kill', count: 7, reward: 3500, xp: 280 },
      { title: 'Зачистка Брейкера', desc: 'Уничтожь ещё 8 пиратов у Брейкера.',
        type: 'kill', count: 8, reward: 4000, xp: 320,
        final: true, finalReward: 'credits:25000' },
    ],
  },

  // ══════════════════════════════════════
  //  ПУСТОТА/КРИСТАЛЛИЯ — Уровни 7-9 (epic)
  // ══════════════════════════════════════

  {
    id: 'void_nulla_deep',
    icon: '🕳️', title: 'Глубины Пустоты',
    desc: 'Пустота — место где пропадают корабли. Нулла — последний маяк цивилизации.',
    difficulty: 'epic', minLevel: 7, startGal: 'void', startSys: 'nulla',
    steps: [
      { title: 'Войти в Пустоту', desc: 'Достигни научной станции Нулла.',
        type: 'arrive', sys: 'nulla', reward: 2500, xp: 210 },
      { title: 'Топливо для маяка', desc: 'Доставь топливо из Нуллы в Шейд — поддержи маяк.',
        type: 'deliver', sys: 'shade', good: 'fuel', amt: 8, reward: 3500, xp: 280 },
      { title: 'Тени в пустоте', desc: 'Уничтожь 10 пиратов в системах Пустоты.',
        type: 'kill', count: 10, reward: 5000, xp: 400,
        final: true, finalReward: 'credits:40000' },
    ],
  },

  {
    id: 'crystal_prism_heist',
    icon: '💎', title: 'Ограбление Призмы',
    desc: 'В Кристаллии добываются уникальные кристаллы. Обеспечь их безопасность.',
    difficulty: 'epic', minLevel: 8, startGal: 'crystal', startSys: 'prism',
    steps: [
      { title: 'Прибыть в Призму', desc: 'Лети на научную станцию Призма.',
        type: 'arrive', sys: 'prism', reward: 2000, xp: 180 },
      { title: 'Охрана шахт', desc: 'Уничтожь 10 пиратов атакующих шахты Осколка.',
        type: 'kill', count: 10, reward: 5000, xp: 400 },
      { title: 'Кристаллы на рынок', desc: 'Доставь минералы из Осколка в Фасет.',
        type: 'deliver', sys: 'facet', good: 'minerals', amt: 10, reward: 4000, xp: 320,
        final: true, finalReward: 'credits:45000' },
    ],
  },

  // ══════════════════════════════════════
  //  ИНФЕРНО/ОМЕГА — Уровни 8-10 (epic)
  // ══════════════════════════════════════

  {
    id: 'inferno_gate',
    icon: '🌋', title: 'Врата Инферно',
    desc: 'Инферно — самая горячая и смертоносная галактика. Добро пожаловать.',
    difficulty: 'epic', minLevel: 8, startGal: 'inferno', startSys: 'cinder',
    steps: [
      { title: 'Прыжок в огонь', desc: 'Достигни горнодобывающей системы Синдер.',
        type: 'arrive', sys: 'cinder', reward: 3000, xp: 260 },
      { title: 'Адское пламя', desc: 'Уничтожь 12 пиратов в системах Инферно.',
        type: 'kill', count: 12, reward: 7000, xp: 560 },
      { title: 'Руда Инферно', desc: 'Вывези руду из Синдера на Пиру.',
        type: 'deliver', sys: 'pyra', good: 'ore', amt: 10, reward: 5000, xp: 400,
        final: true, finalReward: 'credits:60000' },
    ],
  },

  {
    id: 'inferno_ashen_lord',
    icon: '☄️', title: 'Повелитель Пепла',
    desc: 'Система Пепел контролируется пиратским лордом. Свергни его.',
    difficulty: 'epic', minLevel: 9, startGal: 'inferno', startSys: 'ashen',
    steps: [
      { title: 'Вторжение', desc: 'Прибудь в систему Пепел.',
        type: 'arrive', sys: 'ashen', reward: 3500, xp: 300 },
      { title: 'Сломить оборону', desc: 'Уничтожь 15 пиратов-защитников.',
        type: 'kill', count: 15, reward: 9000, xp: 720 },
      { title: 'Трофеи победителя', desc: 'Вывези технологии из Пепла в Синдер.',
        type: 'deliver', sys: 'cinder', good: 'tech', amt: 10, reward: 6000, xp: 480,
        final: true, finalReward: 'credits:80000' },
    ],
  },

  {
    id: 'omega_crown_audience',
    icon: '👑', title: 'Аудиенция у Короны',
    desc: 'Омега — легендарная галактика. Лишь лучшие рейнджеры удостоены аудиенции.',
    difficulty: 'epic', minLevel: 9, startGal: 'omega', startSys: 'crown',
    steps: [
      { title: 'Достичь Короны', desc: 'Прибудь в торговую систему Крона. Омега ждёт.',
        type: 'arrive', sys: 'crown', reward: 5000, xp: 450 },
      { title: 'Дань уважения', desc: 'Доставь технологии из Короны в Оракул.',
        type: 'deliver', sys: 'oracle', good: 'tech', amt: 10, reward: 8000, xp: 640 },
      { title: 'Испытание огнём', desc: 'Уничтожь 15 пиратов Омеги.',
        type: 'kill', count: 15, reward: 10000, xp: 800,
        final: true, finalReward: 'credits:100000' },
    ],
  },

  {
    id: 'omega_oracle_truth',
    icon: '🔮', title: 'Истина Оракула',
    desc: 'Оракул хранит знания о природе галактики. Последняя великая миссия.',
    difficulty: 'epic', minLevel: 10, startGal: 'omega', startSys: 'oracle',
    steps: [
      { title: 'Допуск к знаниям', desc: 'Доставь медикаменты из Короны в Оракул.',
        type: 'deliver', sys: 'oracle', good: 'medicine', amt: 12, reward: 8000, xp: 700 },
      { title: 'Страж Трона', desc: 'Прибудь в систему Трон — самый опасный форпост Омеги.',
        type: 'arrive', sys: 'throne', reward: 5000, xp: 450 },
      { title: 'Финальная битва', desc: 'Уничтожь 20 пиратов Трона — элитная гвардия.',
        type: 'kill', count: 20, reward: 15000, xp: 1200 },
      { title: 'Последний груз', desc: 'Доставь оружие из Трона обратно в Оракул.',
        type: 'deliver', sys: 'oracle', good: 'weapons', amt: 12, reward: 10000, xp: 900,
        final: true, finalReward: 'credits:200000' },
    ],
  },

  // ══════════════════════════════════════
  //  СПЕЦМИССИИ — Особые нарративы
  // ══════════════════════════════════════

  {
    id: 'special_spy_mission',
    icon: '🕵️', title: 'Двойной агент',
    desc: 'ИИ-Координатор Нексуса подозревает утечку данных. Нужна тихая операция.',
    difficulty: 'hard', minLevel: 5, startGal: 'beta', startSys: 'nexus',
    steps: [
      { title: 'Встреча в тени', desc: 'Прибудь на Пульсар для получения задания.',
        type: 'arrive', sys: 'pulse', reward: 1500, xp: 130 },
      { title: 'Документы прикрытия', desc: 'Доставь технологии с Пульсара в Арес (маскировка под торговца).',
        type: 'deliver', sys: 'ares', good: 'tech', amt: 5, reward: 2500, xp: 200 },
      { title: 'Ликвидация', desc: 'Уничтожь 8 агентов-пиратов причастных к утечке.',
        type: 'kill', count: 8, reward: 4000, xp: 320,
        final: true, finalReward: 'credits:20000' },
    ],
  },

  {
    id: 'special_lost_ship',
    icon: '🚀', title: 'Потерянный флагман',
    desc: 'Флагманский корабль торговой гильдии пропал в Гамме. Ищи его.',
    difficulty: 'hard', minLevel: 6, startGal: 'gamma', startSys: 'zion',
    steps: [
      { title: 'Последний курс', desc: 'Флагман шёл в Аркейн. Лети туда.',
        type: 'arrive', sys: 'arcane', reward: 1500, xp: 130 },
      { title: 'Свидетели', desc: 'Доставь медикаменты в Кузницу — там видели корабль.',
        type: 'deliver', sys: 'forge', good: 'medicine', amt: 6, reward: 2000, xp: 160 },
      { title: 'Пираты и трофеи', desc: 'Флагман захватили пираты. Уничтожь 9 из них.',
        type: 'kill', count: 9, reward: 4500, xp: 360 },
      { title: 'Возвращение груза', desc: 'Доставь спасённые технологии в Зион.',
        type: 'deliver', sys: 'zion', good: 'tech', amt: 7, reward: 3000, xp: 240,
        final: true, finalReward: 'credits:28000' },
    ],
  },

  {
    id: 'special_rebellion',
    icon: '⚡', title: 'Восстание колонии',
    desc: 'Колония Арес объявила независимость. Предотврати эскалацию конфликта.',
    difficulty: 'epic', minLevel: 7, startGal: 'beta', startSys: 'ares',
    steps: [
      { title: 'Войти в зону конфликта', desc: 'Лети в Арес посреди восстания.',
        type: 'arrive', sys: 'ares', reward: 2000, xp: 180 },
      { title: 'Гуманитарная помощь', desc: 'Доставь провизию и медикаменты из Эдема в Арес.',
        type: 'deliver', sys: 'ares', good: 'medicine', amt: 8, reward: 3000, xp: 240 },
      { title: 'Переговоры силой', desc: 'Уничтожь 10 экстремистов срывающих мирный процесс.',
        type: 'kill', count: 10, reward: 5000, xp: 400,
        final: true, finalReward: 'credits:35000' },
    ],
  },

  {
    id: 'special_xenotech',
    icon: '👾', title: 'Ксено-технологии',
    desc: 'XenoTech засекла следы инопланетного присутствия в Пустоте.',
    difficulty: 'epic', minLevel: 8, startGal: 'void', startSys: 'nulla',
    steps: [
      { title: 'Сигнал из Морна', desc: 'Лети в опасную систему Морн.',
        type: 'arrive', sys: 'mourne', reward: 3000, xp: 260 },
      { title: 'Зачистка зоны', desc: 'Уничтожь 12 пиратов в системах Пустоты.',
        type: 'kill', count: 12, reward: 6000, xp: 480 },
      { title: 'Ксено-образцы', desc: 'Доставь технологии из Морна в Нуллу для изучения.',
        type: 'deliver', sys: 'nulla', good: 'tech', amt: 8, reward: 5000, xp: 400,
        final: true, finalReward: 'credits:60000' },
    ],
  },

  {
    id: 'special_grand_alliance',
    icon: '🌐', title: 'Великий Альянс',
    desc: 'Создать союз между всеми галактиками — мечта поколений рейнджеров.',
    difficulty: 'epic', minLevel: 9, startGal: 'alpha', startSys: 'sol',
    steps: [
      { title: 'Альфа согласна', desc: 'Получи поддержку Солнечной. Прибудь с грузом провизии.',
        type: 'deliver', sys: 'sol', good: 'food', amt: 10, reward: 5000, xp: 450 },
      { title: 'Бета присоединяется', desc: 'Доставь технологии из Солнечной в Нексус.',
        type: 'deliver', sys: 'nexus', good: 'tech', amt: 10, reward: 6000, xp: 540 },
      { title: 'Гамма на переговорах', desc: 'Доставь медикаменты из Нексуса в Зион.',
        type: 'deliver', sys: 'zion', good: 'medicine', amt: 10, reward: 7000, xp: 630 },
      { title: 'Последний элемент', desc: 'Уничтожь 15 врагов Альянса пытающихся помешать.',
        type: 'kill', count: 15, reward: 10000, xp: 900,
        final: true, finalReward: 'credits:150000' },
    ],
  },

  // ══════════════════════════════════════
  //  ДОПОЛНИТЕЛЬНЫЕ easy/normal
  // ══════════════════════════════════════

  {
    id: 'alpha_supply_run',
    icon: '🚛', title: 'Срочная поставка',
    desc: 'Кеплер срочно нуждается в медикаментах — эпидемия среди шахтёров.',
    difficulty: 'easy', minLevel: 1, startGal: 'alpha', startSys: 'kep',
    steps: [
      { title: 'Медикаменты с Веги', desc: 'Забери медикаменты с Веги и доставь на Кеплер.',
        type: 'deliver', sys: 'kep', good: 'medicine', amt: 3, reward: 500, xp: 35,
        final: true, finalReward: 'credits:1500' },
    ],
  },

  {
    id: 'alpha_first_blood',
    icon: '⚔️', title: 'Первая кровь',
    desc: 'Самое простое испытание для новичка — уничтожь пирата.',
    difficulty: 'easy', minLevel: 1, startGal: 'alpha', startSys: 'sol',
    steps: [
      { title: 'Крещение боем', desc: 'Уничтожь 1 пирата в системах Альфы.',
        type: 'kill', count: 1, reward: 400, xp: 30,
        final: true, finalReward: 'credits:1000' },
    ],
  },

  {
    id: 'alpha_resource_loop',
    icon: '🔄', title: 'Ресурсный цикл',
    desc: 'Экономика Альфы держится на торговом балансе. Помоги его восстановить.',
    difficulty: 'normal', minLevel: 3, startGal: 'alpha', startSys: 'nova',
    steps: [
      { title: 'Наука → Вега', desc: 'Доставь технологии из Нова Кор на Вегу.',
        type: 'deliver', sys: 'vega', good: 'tech', amt: 5, reward: 900, xp: 70 },
      { title: 'Вега → Кеплер', desc: 'Доставь провизию с Веги на Кеплер.',
        type: 'deliver', sys: 'kep', good: 'food', amt: 5, reward: 900, xp: 70 },
      { title: 'Кеплер → Нова Кор', desc: 'Доставь руду с Кеплера в Нова Кор.',
        type: 'deliver', sys: 'nova', good: 'ore', amt: 5, reward: 900, xp: 70,
        final: true, finalReward: 'credits:5500' },
    ],
  },

  {
    id: 'beta_mining_supply',
    icon: '🪨', title: 'Снабжение шахт',
    desc: 'Добывающие платформы Беты требуют постоянного снабжения.',
    difficulty: 'normal', minLevel: 3, startGal: 'beta', startSys: 'pulse',
    steps: [
      { title: 'Топливо для платформ', desc: 'Доставь топливо с Пульсара на Арес.',
        type: 'deliver', sys: 'ares', good: 'fuel', amt: 6, reward: 1100, xp: 85 },
      { title: 'Обратный груз', desc: 'Забери оружие с Ареса и доставь в Нексус для торговли.',
        type: 'deliver', sys: 'nexus', good: 'weapons', amt: 4, reward: 1300, xp: 100,
        final: true, finalReward: 'credits:6000' },
    ],
  },

  {
    id: 'gamma_zion_hub',
    icon: '🔵', title: 'Узел Зиона',
    desc: 'Зион — торговый хаб Гаммы. Организуй поставки для роста колонии.',
    difficulty: 'hard', minLevel: 5, startGal: 'gamma', startSys: 'zion',
    steps: [
      { title: 'Продовольствие', desc: 'Доставь провизию из Зиона в Аркейн.',
        type: 'deliver', sys: 'arcane', good: 'food', amt: 7, reward: 1800, xp: 145 },
      { title: 'Оружие для защиты', desc: 'Привези оружие с Абаддона в Зион.',
        type: 'deliver', sys: 'zion', good: 'weapons', amt: 6, reward: 2000, xp: 160 },
      { title: 'Безопасный маршрут', desc: 'Уничтожь 8 пиратов угрожающих торговому хабу.',
        type: 'kill', count: 8, reward: 3500, xp: 280,
        final: true, finalReward: 'credits:20000' },
    ],
  },

  {
    id: 'nebula_aurora_peace',
    icon: '🌈', title: 'Аврора мира',
    desc: 'Аврора — тихий рай Туманности. Помоги сохранить покой.',
    difficulty: 'hard', minLevel: 6, startGal: 'nebula', startSys: 'aurora',
    steps: [
      { title: 'Мирный визит', desc: 'Прибудь в систему Аврора.',
        type: 'arrive', sys: 'aurora', reward: 1500, xp: 130 },
      { title: 'Снабжение колонии', desc: 'Доставь медикаменты из Авроры в Мглу.',
        type: 'deliver', sys: 'mist', good: 'medicine', amt: 7, reward: 2500, xp: 200 },
      { title: 'Тень Эха', desc: 'Уничтожь 7 пиратов из опасной системы Эхо.',
        type: 'kill', count: 7, reward: 3500, xp: 280,
        final: true, finalReward: 'credits:22000' },
    ],
  },

  {
    id: 'delta_helios_science',
    icon: '☀️', title: 'Гелиосфера',
    desc: 'Учёные Гелиоса изучают звёздные аномалии. Нужна поддержка.',
    difficulty: 'hard', minLevel: 7, startGal: 'delta', startSys: 'helios',
    steps: [
      { title: 'Научное снаряжение', desc: 'Доставь технологии из Дельта Прайм на Гелиос.',
        type: 'deliver', sys: 'helios', good: 'tech', amt: 8, reward: 2800, xp: 225 },
      { title: 'Защита базы', desc: 'Уничтожь 8 пиратов угрожающих научной базе.',
        type: 'kill', count: 8, reward: 4000, xp: 320 },
      { title: 'Ресурсы Мидаса', desc: 'Привези минералы с Мидаса на Гелиос.',
        type: 'deliver', sys: 'helios', good: 'minerals', amt: 8, reward: 3000, xp: 240,
        final: true, finalReward: 'credits:28000' },
    ],
  },

  {
    id: 'crystal_facet_market',
    icon: '🔷', title: 'Рынок Кристаллии',
    desc: 'Фасет — богатейший торговый пост в Кристаллии. Войди в доверие.',
    difficulty: 'epic', minLevel: 8, startGal: 'crystal', startSys: 'facet',
    steps: [
      { title: 'Представление', desc: 'Прибудь в Фасет с достойным грузом провизии.',
        type: 'deliver', sys: 'facet', good: 'food', amt: 10, reward: 4000, xp: 350 },
      { title: 'Защита интересов', desc: 'Уничтожь 10 пиратов нападающих на торговые конвои.',
        type: 'kill', count: 10, reward: 5500, xp: 440 },
      { title: 'Кристаллы в обмен', desc: 'Доставь технологии из Фасета в Призму.',
        type: 'deliver', sys: 'prism', good: 'tech', amt: 10, reward: 5000, xp: 400,
        final: true, finalReward: 'credits:50000' },
    ],
  },

  {
    id: 'inferno_pyra_trial',
    icon: '🔥', title: 'Испытание Пиры',
    desc: 'Пира — опасная зона боевых действий. Пройди испытание пламенем.',
    difficulty: 'epic', minLevel: 8, startGal: 'inferno', startSys: 'pyra',
    steps: [
      { title: 'Огненный крещение', desc: 'Достигни системы Пира. Пиратская активность 68%.',
        type: 'arrive', sys: 'pyra', reward: 3000, xp: 260 },
      { title: 'Пламя войны', desc: 'Уничтожь 12 пиратов охраняющих Пиру.',
        type: 'kill', count: 12, reward: 7000, xp: 560 },
      { title: 'Горючий груз', desc: 'Доставь топливо из Пиры в Синдер.',
        type: 'deliver', sys: 'cinder', good: 'fuel', amt: 10, reward: 5000, xp: 400,
        final: true, finalReward: 'credits:55000' },
    ],
  },

  {
    id: 'omega_throne_trial',
    icon: '⚜️', title: 'Суд Трона',
    desc: 'Трон — последний форпост тьмы в Омеге. Докажи что достоин финального испытания.',
    difficulty: 'epic', minLevel: 9, startGal: 'omega', startSys: 'throne',
    steps: [
      { title: 'Войти в Трон', desc: 'Прибудь в систему Трон. Пиратская активность 82%.',
        type: 'arrive', sys: 'throne', reward: 5000, xp: 450 },
      { title: 'Первый круг', desc: 'Уничтожь 12 пиратов первой волны.',
        type: 'kill', count: 12, reward: 8000, xp: 640 },
      { title: 'Второй круг', desc: 'Ещё 10 пиратов стоят на пути.',
        type: 'kill', count: 10, reward: 8000, xp: 640 },
      { title: 'Трофей победителя', desc: 'Доставь оружие из Трона в Оракул.',
        type: 'deliver', sys: 'oracle', good: 'weapons', amt: 12, reward: 8000, xp: 700,
        final: true, finalReward: 'credits:120000' },
    ],
  },

]; // end STORY_CHAINS

try { globalThis.STORY_CHAINS = STORY_CHAINS; } catch(e) {}

try {
  globalThis.RANDOM_EVENTS = RANDOM_EVENTS;
  globalThis.ANOMALIES = ANOMALIES;
} catch(e) {}
