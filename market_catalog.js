/* market_catalog.js
 * Каталог рынка для космической игры про рейнджера
 * Всего товаров: 139
 * Категории:
 * - basic: 24
 * - industrial: 20
 * - military: 15
 * - science: 15
 * - regional: 20
 * - unique: 20
 * - luxury: 10
 * - contract: 15
 */

(function(global){
  const MARKET_CATALOG = [
    {id:"iron_ore",name:"Железная руда",category:"basic",subcategory:"ore",basePrice:22,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Базовое промышленное сырьё."},
    {id:"copper_ore",name:"Медная руда",category:"basic",subcategory:"ore",basePrice:28,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Популярный проводящий металл."},
    {id:"titanium_ore",name:"Титановая руда",category:"basic",subcategory:"ore",basePrice:44,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Прочная руда для промышленности и корпуса."},
    {id:"aluminum_ore",name:"Алюминиевая руда",category:"basic",subcategory:"ore",basePrice:26,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Лёгкий металл для конструкций."},
    {id:"nickel_ore",name:"Никелевая руда",category:"basic",subcategory:"ore",basePrice:31,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Используется в сплавах и батареях."},
    {id:"cobalt_ore",name:"Кобальтовая руда",category:"basic",subcategory:"ore",basePrice:39,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Ценный компонент энергоэлементов."},
    {id:"quartz_raw",name:"Кварцевое сырьё",category:"basic",subcategory:"ore",basePrice:18,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Подходит для оптики и электроники."},
    {id:"industrial_slag",name:"Промышленный шлак",category:"basic",subcategory:"ore",basePrice:10,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Дешёвое сырьё низкого класса."},
    {id:"raw_water",name:"Техническая вода",category:"basic",subcategory:"supply",basePrice:14,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Вода для производства и охлаждения."},
    {id:"drink_water",name:"Питьевая вода",category:"basic",subcategory:"supply",basePrice:24,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Чистая вода для колоний."},
    {id:"food_rations",name:"Пищевые пайки",category:"basic",subcategory:"food",basePrice:32,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Стандартное питание для экспедиций."},
    {id:"canned_food",name:"Консервы",category:"basic",subcategory:"food",basePrice:27,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Долго хранится, востребовано в дальних системах."},
    {id:"fresh_food",name:"Свежие продукты",category:"basic",subcategory:"food",basePrice:41,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Скоропортящийся, но дорогой товар."},
    {id:"medical_supplies",name:"Медикаменты",category:"basic",subcategory:"med",basePrice:58,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Медицинские расходники общего назначения."},
    {id:"hygiene_kits",name:"Гигиенические наборы",category:"basic",subcategory:"med",basePrice:33,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Бытовые наборы для колоний и кораблей."},
    {id:"fertilizers",name:"Удобрения",category:"basic",subcategory:"agro",basePrice:21,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Основа аграрного производства."},
    {id:"fuel_cells",name:"Топливные ячейки",category:"basic",subcategory:"fuel",basePrice:52,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Главный массовый товар для логистики."},
    {id:"technical_fuel",name:"Техническое топливо",category:"basic",subcategory:"fuel",basePrice:45,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Универсальное топливо для сервисных нужд."},
    {id:"battery_packs",name:"Батарейные блоки",category:"basic",subcategory:"energy",basePrice:47,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Энергоячейки для техники и станций."},
    {id:"polymers",name:"Полимеры",category:"basic",subcategory:"material",basePrice:29,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Универсальный промышленный материал."},
    {id:"plastics",name:"Пластик",category:"basic",subcategory:"material",basePrice:19,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Дешёвый массовый материал."},
    {id:"industrial_lubricant",name:"Смазка",category:"basic",subcategory:"material",basePrice:17,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Нужна технике, двигателям и производству."},
    {id:"filters",name:"Фильтры",category:"basic",subcategory:"utility",basePrice:16,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Расходник для систем жизнеобеспечения."},
    {id:"glass_panels",name:"Стеклянные панели",category:"basic",subcategory:"material",basePrice:23,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Используются в модулях и куполах."},

    {id:"spare_parts",name:"Запчасти",category:"industrial",subcategory:"industrial",basePrice:61,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Базовые детали для ремонта."},
    {id:"microchips",name:"Микросхемы",category:"industrial",subcategory:"industrial",basePrice:88,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Электронная база для устройств."},
    {id:"sensor_arrays",name:"Сенсорные матрицы",category:"industrial",subcategory:"industrial",basePrice:96,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Комплекс чувствительных датчиков."},
    {id:"power_relays",name:"Силовые реле",category:"industrial",subcategory:"industrial",basePrice:79,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Ключевой элемент энергосистем."},
    {id:"cable_harness",name:"Кабельные жгуты",category:"industrial",subcategory:"industrial",basePrice:54,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Комплекты кабелей для сборки."},
    {id:"servo_motors",name:"Сервомоторы",category:"industrial",subcategory:"industrial",basePrice:102,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Точные приводы для механизмов."},
    {id:"reactor_blocks",name:"Реакторные блоки",category:"industrial",subcategory:"industrial",basePrice:138,rarity:"rare",volume:2,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Тяжёлые энергоблоки повышенной мощности."},
    {id:"energy_cassettes",name:"Энергокассеты",category:"industrial",subcategory:"industrial",basePrice:74,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Сменные энергоносители."},
    {id:"composite_plates",name:"Композитные плиты",category:"industrial",subcategory:"industrial",basePrice:83,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Прочные и лёгкие панели."},
    {id:"carbon_frames",name:"Карбоновые рамы",category:"industrial",subcategory:"industrial",basePrice:91,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Основа лёгких конструкций."},
    {id:"nav_modules",name:"Навигационные модули",category:"industrial",subcategory:"industrial",basePrice:117,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Комплекты для бортовой навигации."},
    {id:"cryo_containers",name:"Криоконтейнеры",category:"industrial",subcategory:"industrial",basePrice:69,rarity:"uncommon",volume:2,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Поддерживают низкую температуру груза."},
    {id:"assembly_frames",name:"Монтажные рамы",category:"industrial",subcategory:"industrial",basePrice:63,rarity:"common",volume:2,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Каркасы для быстрой сборки."},
    {id:"repair_kits",name:"Ремонтные комплекты",category:"industrial",subcategory:"industrial",basePrice:57,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Наборы полевого ремонта."},
    {id:"industrial_drones",name:"Промышленные дроны",category:"industrial",subcategory:"industrial",basePrice:146,rarity:"rare",volume:2,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Автономные рабочие помощники."},
    {id:"armored_sections",name:"Корпусные секции",category:"industrial",subcategory:"industrial",basePrice:128,rarity:"rare",volume:2,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Тяжёлые элементы защиты корпусов."},
    {id:"thermocores",name:"Термоядра",category:"industrial",subcategory:"industrial",basePrice:171,rarity:"rare",volume:2,illegal:false,licenseRequired:null,riskLevel:3,unique:false,questUse:true,description:"Мощные тепловые ядра."},
    {id:"power_bus",name:"Силовые шины",category:"industrial",subcategory:"industrial",basePrice:72,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Компоненты распределения энергии."},
    {id:"control_units",name:"Блоки управления",category:"industrial",subcategory:"industrial",basePrice:84,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Электронные центры контроля."},
    {id:"shield_emitters",name:"Излучатели щита",category:"industrial",subcategory:"industrial",basePrice:153,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Узлы генерации защитного поля."},

    {id:"ammo_crates",name:"Боеприпасы",category:"military",subcategory:"military",basePrice:76,rarity:"common",volume:1,illegal:false,licenseRequired:"military_basic",riskLevel:2,unique:false,questUse:true,description:"Ящики с боезапасом."},
    {id:"missile_pods",name:"Ракетные кассеты",category:"military",subcategory:"military",basePrice:142,rarity:"uncommon",volume:2,illegal:false,licenseRequired:"military_basic",riskLevel:3,unique:false,questUse:true,description:"Боекомплект для ракетных систем."},
    {id:"combat_rations",name:"Армейские пайки",category:"military",subcategory:"military",basePrice:49,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Питание для боевых подразделений."},
    {id:"armor_plates",name:"Бронеплиты",category:"military",subcategory:"military",basePrice:131,rarity:"uncommon",volume:2,illegal:false,licenseRequired:"military_basic",riskLevel:2,unique:false,questUse:true,description:"Защитные листы для техники."},
    {id:"tactical_sensors",name:"Тактические сенсоры",category:"military",subcategory:"military",basePrice:155,rarity:"rare",volume:1,illegal:false,licenseRequired:"military_advanced",riskLevel:3,unique:false,questUse:true,description:"Сенсоры для боевых систем."},
    {id:"jamming_devices",name:"Генераторы помех",category:"military",subcategory:"military",basePrice:164,rarity:"rare",volume:1,illegal:false,licenseRequired:"military_advanced",riskLevel:3,unique:false,questUse:true,description:"Средства РЭБ и глушения."},
    {id:"military_chips",name:"Военные чипы",category:"military",subcategory:"military",basePrice:172,rarity:"rare",volume:1,illegal:false,licenseRequired:"military_advanced",riskLevel:3,unique:false,questUse:true,description:"Защищённая электроника."},
    {id:"target_modules",name:"Узлы наведения",category:"military",subcategory:"military",basePrice:147,rarity:"rare",volume:1,illegal:false,licenseRequired:"military_basic",riskLevel:2,unique:false,questUse:true,description:"Комплекты точного наведения."},
    {id:"emp_coils",name:"ЭМИ-катушки",category:"military",subcategory:"military",basePrice:188,rarity:"rare",volume:1,illegal:false,licenseRequired:"military_advanced",riskLevel:4,unique:false,questUse:true,description:"Компоненты для ЭМИ-оружия."},
    {id:"deflector_nodes",name:"Дефлекторы",category:"military",subcategory:"military",basePrice:196,rarity:"rare",volume:1,illegal:false,licenseRequired:"military_advanced",riskLevel:4,unique:false,questUse:true,description:"Военные узлы отражения удара."},
    {id:"field_generators",name:"Полевые генераторы",category:"military",subcategory:"military",basePrice:124,rarity:"uncommon",volume:2,illegal:false,licenseRequired:"military_basic",riskLevel:2,unique:false,questUse:true,description:"Генераторы для фронтовых задач."},
    {id:"military_fuel",name:"Тактическое топливо",category:"military",subcategory:"military",basePrice:86,rarity:"uncommon",volume:1,illegal:false,licenseRequired:"military_basic",riskLevel:2,unique:false,questUse:true,description:"Стабильное топливо для боевых кораблей."},
    {id:"security_drones",name:"Охранные дроны",category:"military",subcategory:"military",basePrice:179,rarity:"rare",volume:2,illegal:false,licenseRequired:"military_advanced",riskLevel:3,unique:false,questUse:true,description:"Беспилотная охрана объектов."},
    {id:"shield_mods",name:"Модули щита",category:"military",subcategory:"military",basePrice:168,rarity:"rare",volume:1,illegal:false,licenseRequired:"military_advanced",riskLevel:3,unique:false,questUse:true,description:"Усилители щитовых систем."},
    {id:"fortification_kits",name:"Фортификационные наборы",category:"military",subcategory:"military",basePrice:111,rarity:"uncommon",volume:2,illegal:false,licenseRequired:"military_basic",riskLevel:2,unique:false,questUse:true,description:"Наборы укрепления позиций."},

    {id:"lab_reagents",name:"Лабораторные реактивы",category:"science",subcategory:"science",basePrice:72,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Расходники для исследований."},
    {id:"bio_samples",name:"Биопробы",category:"science",subcategory:"science",basePrice:109,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Образцы биологических структур."},
    {id:"archive_data",name:"Архивы данных",category:"science",subcategory:"science",basePrice:121,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Сжатые научные архивы."},
    {id:"analyzers",name:"Анализаторы",category:"science",subcategory:"science",basePrice:133,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Оборудование для точного анализа."},
    {id:"anomaly_scans",name:"Сканы аномалий",category:"science",subcategory:"science",basePrice:148,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:3,unique:false,questUse:true,description:"Результаты исследования аномальных зон."},
    {id:"dna_capsules",name:"ДНК-капсулы",category:"science",subcategory:"science",basePrice:117,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Биогенетические образцы."},
    {id:"cryo_samples",name:"Криообразцы",category:"science",subcategory:"science",basePrice:126,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Хрупкие замороженные образцы."},
    {id:"quantum_lenses",name:"Квантовые линзы",category:"science",subcategory:"science",basePrice:182,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:3,unique:false,questUse:true,description:"Сверхточная оптика."},
    {id:"research_probes",name:"Исследовательские зонды",category:"science",subcategory:"science",basePrice:144,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Автономные приборы сбора данных."},
    {id:"sensor_probes",name:"Научные датчики",category:"science",subcategory:"science",basePrice:115,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Чувствительные исследовательские сенсоры."},
    {id:"subspace_maps",name:"Субпространственные карты",category:"science",subcategory:"science",basePrice:207,rarity:"epic",volume:1,illegal:false,licenseRequired:"science_elite",riskLevel:4,unique:false,questUse:true,description:"Редкие карты нестабильных маршрутов."},
    {id:"tech_matrices",name:"Техноматрицы",category:"science",subcategory:"science",basePrice:194,rarity:"rare",volume:1,illegal:false,licenseRequired:"science_elite",riskLevel:3,unique:false,questUse:true,description:"Комплексные схемы и алгоритмы."},
    {id:"neural_circuits",name:"Нейросхемы",category:"science",subcategory:"science",basePrice:158,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:3,unique:false,questUse:true,description:"Продвинутая нейроэлектроника."},
    {id:"sample_containers",name:"Контейнеры образцов",category:"science",subcategory:"science",basePrice:66,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Безопасная тара для исследований."},
    {id:"lab_blocks",name:"Лабораторные блоки",category:"science",subcategory:"science",basePrice:99,rarity:"uncommon",volume:2,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Модульные научные секции."},

    {id:"ice_water",name:"Ледяная вода",category:"regional",subcategory:"regional",basePrice:39,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Вода ледяных миров."},
    {id:"nebula_dust",name:"Пыль туманности",category:"regional",subcategory:"regional",basePrice:94,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Мелкодисперсная пыль космических облаков."},
    {id:"crystal_salt",name:"Кристаллическая соль",category:"regional",subcategory:"regional",basePrice:71,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Минерал соляных плато."},
    {id:"gas_spores",name:"Газовые споры",category:"regional",subcategory:"regional",basePrice:88,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Биоматериал газовых гигантов."},
    {id:"plasmagel",name:"Плазмогель",category:"regional",subcategory:"regional",basePrice:136,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:3,unique:false,questUse:true,description:"Редкое энергосодержащее вещество."},
    {id:"volcanic_glass",name:"Вулканическое стекло",category:"regional",subcategory:"regional",basePrice:82,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Закалённый минерал лавовых миров."},
    {id:"luminous_moss",name:"Биолюминесцентный мох",category:"regional",subcategory:"regional",basePrice:93,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Живой светящийся организм."},
    {id:"void_fiber",name:"Пустотные волокна",category:"regional",subcategory:"regional",basePrice:128,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:3,unique:false,questUse:true,description:"Странные волокна из пустотных зон."},
    {id:"sulfur_salt",name:"Серная соль",category:"regional",subcategory:"regional",basePrice:47,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Активная минеральная соль."},
    {id:"ash_mineral",name:"Пепельный минерал",category:"regional",subcategory:"regional",basePrice:59,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Сырьё вулканических регионов."},
    {id:"glowing_sand",name:"Светящийся песок",category:"regional",subcategory:"regional",basePrice:76,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Песок с люминесцентными включениями."},
    {id:"floating_crystal",name:"Плавающий кристалл",category:"regional",subcategory:"regional",basePrice:149,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:3,unique:false,questUse:true,description:"Кристалл с аномальной антигравитацией."},
    {id:"black_ice",name:"Чёрный лёд",category:"regional",subcategory:"regional",basePrice:112,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Экзотический лёд с высокой плотностью."},
    {id:"mist_condensate",name:"Туманный конденсат",category:"regional",subcategory:"regional",basePrice:68,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Конденсат из плотных облачных зон."},
    {id:"magnetic_ore",name:"Магнитная руда",category:"regional",subcategory:"regional",basePrice:84,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Руда с необычной магнитной активностью."},
    {id:"ether_algae",name:"Эфирные водоросли",category:"regional",subcategory:"regional",basePrice:91,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Редкая флора из океанических планет."},
    {id:"heavy_gas",name:"Тяжёлый газ",category:"regional",subcategory:"regional",basePrice:73,rarity:"uncommon",volume:2,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Плотный промышленный газ."},
    {id:"rainbow_resin",name:"Радужная смола",category:"regional",subcategory:"regional",basePrice:133,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Полимерное вещество красивой структуры."},
    {id:"ember_slag",name:"Огненный шлак",category:"regional",subcategory:"regional",basePrice:61,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Остаточный продукт огненных зон."},
    {id:"field_quartz",name:"Полевой кварц",category:"regional",subcategory:"regional",basePrice:52,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Минерал для электроники и стекла."},

    {id:"xeno_crystal",name:"Ксенокристалл",category:"unique",subcategory:"alien",basePrice:420,rarity:"epic",volume:1,illegal:false,licenseRequired:"xeno_trade",riskLevel:4,unique:true,questUse:true,description:"Редкий инопланетный кристалл."},
    {id:"rift_core",name:"Ядро разлома",category:"unique",subcategory:"anomaly",basePrice:690,rarity:"legendary",volume:1,illegal:false,licenseRequired:"anomaly_elite",riskLevel:5,unique:true,questUse:true,description:"Источник нестабильной энергии."},
    {id:"living_plasma",name:"Живая плазма",category:"unique",subcategory:"alien",basePrice:510,rarity:"epic",volume:1,illegal:false,licenseRequired:"xeno_trade",riskLevel:4,unique:true,questUse:true,description:"Активная разумоподобная плазма."},
    {id:"singularity_fabric",name:"Ткань сингулярности",category:"unique",subcategory:"anomaly",basePrice:760,rarity:"legendary",volume:1,illegal:false,licenseRequired:"anomaly_elite",riskLevel:5,unique:true,questUse:true,description:"Ткань с искажённой геометрией."},
    {id:"code_shard",name:"Кодовый осколок",category:"unique",subcategory:"artifact",basePrice:380,rarity:"epic",volume:1,illegal:false,licenseRequired:"science_elite",riskLevel:4,unique:true,questUse:true,description:"Фрагмент древнего цифрового ключа."},
    {id:"alien_alloy",name:"Инопланетный сплав",category:"unique",subcategory:"alien",basePrice:470,rarity:"epic",volume:1,illegal:false,licenseRequired:"xeno_trade",riskLevel:4,unique:true,questUse:true,description:"Сплав неясного происхождения."},
    {id:"ancient_artifact",name:"Древний артефакт",category:"unique",subcategory:"artifact",basePrice:640,rarity:"legendary",volume:1,illegal:false,licenseRequired:"artifact_hunter",riskLevel:5,unique:true,questUse:true,description:"Реликвия древней цивилизации."},
    {id:"neuro_cluster",name:"Нейрокластер",category:"unique",subcategory:"alien",basePrice:560,rarity:"epic",volume:1,illegal:false,licenseRequired:"science_elite",riskLevel:4,unique:true,questUse:true,description:"Сгусток инопланетной нейросети."},
    {id:"psi_capsule",name:"Пси-капсула",category:"unique",subcategory:"alien",basePrice:495,rarity:"epic",volume:1,illegal:false,licenseRequired:"xeno_trade",riskLevel:4,unique:true,questUse:true,description:"Контейнер с пси-резонансом."},
    {id:"prismatic_ice",name:"Призматический лёд",category:"unique",subcategory:"regional",basePrice:315,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:3,unique:true,questUse:true,description:"Редкий лёд, переливающийся спектрами."},
    {id:"dark_fuel",name:"Тёмное топливо",category:"unique",subcategory:"anomaly",basePrice:530,rarity:"epic",volume:1,illegal:false,licenseRequired:"anomaly_trade",riskLevel:4,unique:true,questUse:true,description:"Энергоноситель из нестабильных зон."},
    {id:"memory_sphere",name:"Сфера памяти",category:"unique",subcategory:"artifact",basePrice:605,rarity:"legendary",volume:1,illegal:false,licenseRequired:"artifact_hunter",riskLevel:5,unique:true,questUse:true,description:"Носитель древних воспоминаний."},
    {id:"swarm_spark",name:"Искра роя",category:"unique",subcategory:"alien",basePrice:455,rarity:"epic",volume:1,illegal:false,licenseRequired:"xeno_trade",riskLevel:4,unique:true,questUse:true,description:"Остаточная энергия ройных организмов."},
    {id:"chrono_shard",name:"Хроноосколок",category:"unique",subcategory:"anomaly",basePrice:720,rarity:"legendary",volume:1,illegal:false,licenseRequired:"anomaly_elite",riskLevel:5,unique:true,questUse:true,description:"Осколок искажённого времени."},
    {id:"portal_fragment",name:"Фрагмент портала",category:"unique",subcategory:"anomaly",basePrice:670,rarity:"legendary",volume:1,illegal:false,licenseRequired:"anomaly_elite",riskLevel:5,unique:true,questUse:true,description:"Часть древней переходной арки."},
    {id:"anomaly_core",name:"Ядро аномалии",category:"unique",subcategory:"anomaly",basePrice:610,rarity:"legendary",volume:1,illegal:false,licenseRequired:"anomaly_elite",riskLevel:5,unique:true,questUse:true,description:"Стабилизированное ядро аномалии."},
    {id:"pulse_stone",name:"Пульс-камень",category:"unique",subcategory:"regional",basePrice:352,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:3,unique:true,questUse:true,description:"Минерал с ритмичными импульсами."},
    {id:"echo_matrix",name:"Эхо-матрица",category:"unique",subcategory:"artifact",basePrice:545,rarity:"epic",volume:1,illegal:false,licenseRequired:"artifact_hunter",riskLevel:4,unique:true,questUse:true,description:"Резонансный носитель данных."},
    {id:"light_thread",name:"Световая нить",category:"unique",subcategory:"alien",basePrice:498,rarity:"epic",volume:1,illegal:false,licenseRequired:"xeno_trade",riskLevel:4,unique:true,questUse:true,description:"Нить из чистой световой субстанции."},
    {id:"warp_heart",name:"Варп-сердечник",category:"unique",subcategory:"anomaly",basePrice:780,rarity:"legendary",volume:1,illegal:false,licenseRequired:"anomaly_elite",riskLevel:5,unique:true,questUse:true,description:"Редчайший варп-узел."},

    {id:"elite_drinks",name:"Элитные напитки",category:"luxury",subcategory:"luxury",basePrice:112,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Дорогие коллекционные напитки."},
    {id:"premium_fabrics",name:"Премиальные ткани",category:"luxury",subcategory:"luxury",basePrice:131,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Ткани высокого класса."},
    {id:"jewelry_cases",name:"Ювелирные изделия",category:"luxury",subcategory:"luxury",basePrice:214,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Предметы статуса и роскоши."},
    {id:"holo_art",name:"Голографическое искусство",category:"luxury",subcategory:"luxury",basePrice:248,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Коллекционные голографические произведения."},
    {id:"antique_devices",name:"Антикварные устройства",category:"luxury",subcategory:"luxury",basePrice:301,rarity:"epic",volume:1,illegal:false,licenseRequired:null,riskLevel:3,unique:false,questUse:true,description:"Редкие коллекционные приборы."},
    {id:"exotic_flowers",name:"Экзотические цветы",category:"luxury",subcategory:"luxury",basePrice:97,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Редкая декоративная флора."},
    {id:"rare_pets",name:"Редкие питомцы",category:"luxury",subcategory:"luxury",basePrice:342,rarity:"epic",volume:2,illegal:false,licenseRequired:"bio_trade",riskLevel:3,unique:false,questUse:true,description:"Элитные живые коллекционные существа."},
    {id:"royal_spices",name:"Королевские специи",category:"luxury",subcategory:"luxury",basePrice:165,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Дорогие пряности из закрытых миров."},
    {id:"collector_cards",name:"Коллекционные карты",category:"luxury",subcategory:"luxury",basePrice:139,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Редкие наборы для коллекционеров."},
    {id:"memory_crystals",name:"Кристаллы воспоминаний",category:"luxury",subcategory:"luxury",basePrice:226,rarity:"rare",volume:1,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Носители эмоциональных записей."},

    {id:"med_crates",name:"Медконтейнеры",category:"contract",subcategory:"contract",basePrice:84,rarity:"common",volume:2,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Стандартный контрактный медгруз."},
    {id:"power_generators",name:"Генераторы",category:"contract",subcategory:"contract",basePrice:141,rarity:"uncommon",volume:2,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Генераторы для срочных поставок."},
    {id:"construction_kits",name:"Строительные наборы",category:"contract",subcategory:"contract",basePrice:108,rarity:"uncommon",volume:2,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Комплекты для модульного строительства."},
    {id:"emergency_food",name:"Аварийная провизия",category:"contract",subcategory:"contract",basePrice:57,rarity:"common",volume:2,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Наборы для экстренной помощи."},
    {id:"defense_containers",name:"Оборонные контейнеры",category:"contract",subcategory:"contract",basePrice:173,rarity:"rare",volume:2,illegal:false,licenseRequired:"military_basic",riskLevel:3,unique:false,questUse:true,description:"Грузы для оборонных заказов."},
    {id:"medical_drones",name:"Медицинские дроны",category:"contract",subcategory:"contract",basePrice:164,rarity:"rare",volume:2,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Дроны для гуманитарных операций."},
    {id:"emergency_batteries",name:"Аварийные батареи",category:"contract",subcategory:"contract",basePrice:79,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Резервные источники энергии."},
    {id:"science_containers",name:"Научные контейнеры",category:"contract",subcategory:"contract",basePrice:152,rarity:"rare",volume:2,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Тара для исследовательских экспедиций."},
    {id:"refugee_supplies",name:"Помощь беженцам",category:"contract",subcategory:"contract",basePrice:63,rarity:"common",volume:2,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Базовые наборы поддержки населения."},
    {id:"shield_batteries",name:"Батареи щита",category:"contract",subcategory:"contract",basePrice:134,rarity:"uncommon",volume:1,illegal:false,licenseRequired:"military_basic",riskLevel:2,unique:false,questUse:true,description:"Энергоячейки для защитных систем."},
    {id:"station_tools",name:"Станционные инструменты",category:"contract",subcategory:"contract",basePrice:72,rarity:"common",volume:2,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Оборудование техобслуживания станции."},
    {id:"habitat_modules",name:"Жилые модули",category:"contract",subcategory:"contract",basePrice:188,rarity:"rare",volume:3,illegal:false,licenseRequired:null,riskLevel:2,unique:false,questUse:true,description:"Модули для размещения колонистов."},
    {id:"drone_parts",name:"Детали дронов",category:"contract",subcategory:"contract",basePrice:96,rarity:"uncommon",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Запчасти для сервисных дронов."},
    {id:"repair_containers",name:"Ремонтные контейнеры",category:"contract",subcategory:"contract",basePrice:89,rarity:"uncommon",volume:2,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Контейнеры с ремонтным оснащением."},
    {id:"relief_medkits",name:"Наборы помощи",category:"contract",subcategory:"contract",basePrice:68,rarity:"common",volume:1,illegal:false,licenseRequired:null,riskLevel:1,unique:false,questUse:true,description:"Универсальные наборы первой помощи."}
  ];

  const MARKET_CATEGORY_META = {
    basic: { name: "Базовые", color: "#7dd3fc" },
    industrial: { name: "Промышленные", color: "#f59e0b" },
    military: { name: "Военные", color: "#ef4444" },
    science: { name: "Научные", color: "#8b5cf6" },
    regional: { name: "Региональные", color: "#10b981" },
    unique: { name: "Уникальные", color: "#f97316" },
    luxury: { name: "Роскошь", color: "#ec4899" },
    contract: { name: "Контрактные", color: "#eab308" }
  };

  const MARKET_BY_ID = Object.fromEntries(MARKET_CATALOG.map(item => [item.id, item]));
  const MARKET_BY_CATEGORY = MARKET_CATALOG.reduce((acc, item) => {
    (acc[item.category] ||= []).push(item);
    return acc;
  }, {});

  global.MARKET_CATALOG = MARKET_CATALOG;
  global.MARKET_CATEGORY_META = MARKET_CATEGORY_META;
  global.MARKET_BY_ID = MARKET_BY_ID;
  global.MARKET_BY_CATEGORY = MARKET_BY_CATEGORY;
})(typeof window !== "undefined" ? window : globalThis);
