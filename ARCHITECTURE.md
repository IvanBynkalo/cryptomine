# Space Rangers: Idle Wars — ARCHITECTURE.md

> **Цель этого документа:** любой (человек или Claude) должен прочитать его первым делом перед любой правкой кода. Здесь — что где живёт, как устроены данные, какие правила нельзя нарушать.

---

## 📁 Файлы проекта и порядок загрузки

Порядок `<script>` в `index.html` **критичен** — каждый файл зависит от предыдущих:

```
globals.js          ← 1. утилиты: toast, haptic, fmt, _uiReady, curScreen
data.js             ← 2. все константы: SYSTEMS, GOODS, PIRATES, TECH, ...
state.js            ← 3. G (состояние игры), saveG/loadG, calcXxx функции
equipment_catalog.js← 4. HULLS_CATALOG, WEAPONS_CATALOG, ... MANUFACTURERS
market_catalog.js   ← 5. MARKET_CATALOG, MARKET_BY_ID, MARKET_BY_CATEGORY
engine.js           ← 6. игровой цикл, цены, квесты, боты, аномалии, события
combat.js           ← 7. боевая система (использует G, ALIEN_TYPES, PIRATES)
galaxy.js           ← 8. карта галактик и систем (canvas)
online.js           ← 9. лига, онлайн-рейнджеры, heartbeat
ui.js               ← 10. весь рендеринг UI (вызывает всё выше)
```

**⚠️ Правило:** никогда не переставляй порядок без проверки зависимостей.

---

## 🗂️ Назначение каждого файла

### `globals.js`
Самый первый. Объявляет глобальные утилиты и переменные-флаги.
- `toast(msg, type)` — всплывающее уведомление
- `haptic(t)` / `hapticN(t)` — тактильный отклик Telegram
- `fmt(n)` — форматирование числа (1.2K, 3.4M)
- `_uiReady` — флаг готовности UI (engine.js проверяет его перед рендером)
- `curScreen` — текущий активный экран ('mine'|'galaxy'|'trade'|'quest'|'more')

### `data.js`
Все статические данные игры. **Только константы, никакой логики.**
- `SYSTEMS[]` — все системы (id, gal, type, goods[], planets[], fuelCost, pc)
- `GOODS{}` — 7 базовых товаров `{ore, minerals, food, tech, fuel, medicine, weapons}` → `{name, icon, base}`
- `SHIP_UPGRADES[]`, `HELPERS[]`, `TECH{}`, `SKILLS_DEF[]`, `EQUIPMENT[]`
- `RANGERS_BOTS[]`, `PIRATES[]`, `ALIEN_TYPES[]`, `MAYORS[]`
- `DEBRIS_TYPES[]` — типы обломков `{id, name, icon, time, reward{goodId:qty}, rp}`
- `POLICE_FACTIONS{}`, `RANKS[]`, `ERAS[]`, `GALAXIES[]`
- `LEAGUE_TIERS[]`, `LEAGUE_SEASON_DAYS`
- `RANDOM_EVENTS[]`, `ANOMALIES[]`

> **Важно:** `GOODS` содержит только 7 старых товаров. Новые товары живут в `MARKET_CATALOG`. Для доступа к любому товару используй хелперы `_goodName(gId)`, `_goodIcon(gId)`, `_goodBase(gId)` из engine.js — они работают с обоими источниками.

### `state.js`
Состояние игрока `G` и вычисляемые характеристики.

**Поля `G` (полный список):**
```js
// Ресурсы
cr, totalCr          // кредиты (текущие и всего заработано)
xp, lvl, skillPts    // опыт, уровень, очки навыков
energy, maxEnergy    // энергия для тапа
hull, maxHull        // корпус
fuel, maxFuel        // топливо
missiles, maxMissiles
rp                   // научные очки

// Время
day, hour, minute, month, year, era

// Местоположение
sys, gal             // текущая система и галактика
currentPlanetBySystem // {sysId: planetIndex}

// Прогресс
upgrades{}           // {upgradeId: level}
researched{}         // {techId: true}
skills{}             // {skillId: level}
equip{}              // {hull, engine, weapon, shield, specmod1, support}
owned_equip[]        // купленные предметы каталога

// Помощники и боты
helpers{}            // {helperId: count}
rangers{}            // {botId: count}

// Торговля
cargo{}              // {goodId: qty}
cargoCost{}          // {goodId: avgBuyPrice} — средняя цена покупки
cargoMax             // вычисляемый, обновляй через calcCargoMax()
prices{}             // {sysId: {goodId: price}}
priceHistory{}       // {sysId: {goodId: [price, price, ...]}} — последние 5

// Задания
quests[]             // активные квесты
completedQ           // счётчик выполненных

// Бой
combat               // null или объект текущего врага
combatLog[]          // лог последних ходов

// Статистика
killCount, totalKillReward
alienKills, alienKillsByRace{}
alienInvasion        // null или объект вторжения

// Прочее
debrisActive[]       // активные обломки
botActions[]         // лог действий ботов (max 8-10)
policeRep{}          // {galId: -100..100}
capturedSystems[]    // захваченные системы
landPlots{}          // {sysId: {good, level, lastHarvestDay}}

// Онлайн / лига
playerName
leagueSeason, leagueScore, leagueBestSeason
seasonStart, lastSave

// Новые фичи (добавлены в engine.js при старте, migrate из старых сейвов)
eventHistory[]       // история случайных событий
activeEvent          // null или текущее событие
anomalyLog[]         // история аномалий
anomaliesActive[]    // текущие аномалии в системах
anomaliesFound       // счётчик
storyProgress{}      // {chainId: {step, done, killCount}}
history[]            // общая история событий (квесты, и т.д.)
xeno                 // ксенокристаллы
```

**Вычисляемые функции (все в `state.js`):**
- `calcClickPower()` — урон за тап
- `calcCPS()` — кредиты в секунду от автоматизации
- `calcAttack()` — урон в бою
- `calcDefense()` — защита
- `calcMissileDmg()` — урон ракеты
- `calcMaxHull()` — максимум корпуса
- `calcFuelCost(sys)` — стоимость перелёта
- `calcCargoMax()` — размер трюма
- `calcCargoUsed()` — занятый трюм
- `calcRpMult()` — множитель науки
- `getRank()` / `getRankByLvl(lvl)` — ранг игрока
- `xpForLvl(l)` — XP для следующего уровня
- `getEquipStats()` — суммарные бонусы от снаряжения

**Аксессоры:**
- `gUpg(id)` — уровень апгрейда
- `gSkill(id)` — уровень навыка
- `hasTech(id)` — исследована ли технология

### `equipment_catalog.js`
Большой каталог снаряжения (180 предметов, 6 категорий).

**Глобальные переменные:**
- `HULLS_CATALOG[]` — корпуса (cat:'hull')
- `WEAPONS_CATALOG[]` — оружие (cat:'weapon')
- `SHIELDS_CATALOG[]` — защита (cat:'defense')
- `ENGINES_CATALOG[]` — двигатели (cat:'engine')
- `SPECMODS_CATALOG[]` — спецмодули (cat:'specmod')
- `DRONES_CATALOG[]` — дроны (cat:'support')
- `MANUFACTURERS{}` — производители
- `RARITY_COLOR{}` — цвета редкости

**Структура предмета:**
```js
{ id, name, cat, subcat, tier(1-6), rarity, mfr,
  role, levelRequired, price, upkeep,
  stats: { atk, def, maxHull, cargo, fuelMod, dodge, ... },
  icon, desc, tags[] }
```

**Тиры:** 1=Лёгкие, 2=Средние, 3=Тяжёлые, 4=Военные, 5=Экспер., 6=Легенд.
**Редкость:** common → enhanced → rare → military → experimental → legendary

### `market_catalog.js`
Расширенный товарный каталог (139 товаров, 8 категорий).

**Глобальные переменные:**
- `MARKET_CATALOG[]` — все товары
- `MARKET_BY_ID{}` — быстрый доступ по id
- `MARKET_BY_CATEGORY{}` — товары по категориям
- `MARKET_CATEGORY_META{}` — цвета и названия категорий

**Категории:** basic, industrial, military, science, regional, unique, luxury, contract

**Структура товара:**
```js
{ id, name, category, subcategory, basePrice, rarity,
  volume, illegal, licenseRequired, questUse, description }
```

**⚠️ Совместимость:** `MARKET_CATALOG` и `GOODS` — два разных источника. Для унифицированного доступа ВСЕГДА используй хелперы ниже.

### `engine.js`
Игровой цикл и вся бизнес-логика.

**Товарные хелперы (объявлены первыми — используй везде):**
```js
_goodBase(gId)   // базовая цена — работает для GOODS и MARKET_CATALOG
_goodName(gId)   // название товара
_goodIcon(gId)   // иконка товара
_sysGoods(sys)   // список товаров системы (legacy sys.goods + каталог)
```

**Цены:**
- `initPrices()` — инициализация цен при старте (вызывается ОДИН РАЗ из `ui.js`)
- `fluctuatePrices(bigEvent)` — колебания цен каждый игровой день

**Время:**
- `advanceTime()` — +2 минуты за тик, вызывает fluctuatePrices раз в сутки
- `timeStr()` — строка текущего времени для HUD
- `travelDays(sys)` — расчётное время перелёта в днях

**Квесты:**
- `refreshQuests()` — генерация новых квестов у мэров
- `completeQuest(q)` — выдача награды и запись в историю
- `acceptQuest(qId)` — принятие задания
- `claimDeliverQuest(qId)` — сдача груза (доставка)
- `claimKillQuest(qId)` — сдача задания на убийство
- `claimCollectQuest(qId)` — сдача задания на сбор
- `updateQuestBadge()` — обновление бейджа на кнопке квестов

**Обломки:**
- `spawnDebris()` — случайный спавн (max 3, шанс 30%)
- `forceSpawnDebris()` — гарантированный спавн (для событий)
- `collectDebris(dbId)` — сбор обломка

  > **Структура объекта обломка:** `{id, type, name, icon, reward(число), rp, expires(timestamp)}`
  > НЕ путать с `DEBRIS_TYPES[].reward` — там объект `{goodId: qty}`, у активных обломков `reward` — это число кредитов.

**Боты:**
- `tickBotRangers()` — вызывается каждую секунду из setInterval

**Земельные участки:**
- `buyLandPlot(sysId, good)` — покупка/апгрейд участка
- `harvestLandPlots()` — урожай товаров раз в игровой день

**Полиция:**
- `getPoliceRep(gal)` — репутация в галактике
- `addPoliceRep(gal, amt)` — изменение репутации

**Вторжения:**
- `checkAlienInvasion()` — шанс начала вторжения раз в день
- `buildAlienWave(sys, raceId)` — генерация волны врагов

**Добыча:**
- `onMine(e)` — клик по планете
- `lvlCheck()` — проверка и выдача уровня
- `buyHelper(id)` / `buyShipUpg(id)` — покупки

**Случайные события:**
- `tickRandomEvents()` — вызывается раз в 3 игровых дня
- `getEventMult(effect)` / `isEventActive(effect)` — проверка активного события

**Аномалии:**
- `tickAnomalies()` — спавн аномалий каждые 30 сек реального времени
- `exploreAnomaly(anomalyId)` — исследование аномалии

**Сюжетные цепочки:**
- `startStoryChain(chainId)` / `claimStoryStep(chainId)` — прогресс сюжета
- `trackStoryKills()` — засчёт убийств в сюжетных квестах

**Игровой цикл:**
```js
setInterval(tick, 250)      // основной тик: CPS, энергия, время, уровень
setInterval(..., 1000)       // 1/сек: обломки, боты, рендер активного экрана
setInterval(..., 10000)      // авто-сейв каждые 10 сек
setInterval(capturedIncome, 5000)  // доход от захваченных систем
setInterval(tickAnomalies + tickRandomEvents, 5000)  // аномалии и события
```

**⚠️ Migrate при старте:** engine.js при запуске проверяет и создаёт недостающие поля G для старых сохранений:
```js
if(!G.eventHistory)    G.eventHistory=[];
if(!G.anomalyLog)      G.anomalyLog=[];
if(!G.storyProgress)   G.storyProgress={};
if(!G.anomaliesActive) G.anomaliesActive=[];
```

### `combat.js`
Боевая система.
- `startCombat(tier)` — начало боя с пиратом
- `findEnemy()` — поиск противника с учётом `sys.pc`
- `fightAlien(alienId)` / `coopRaid(alienId)` — бой с пришельцами
- `combatAction(act)` — ход игрока: 'attack'|'missile'|'repair'|'flee'
- `currentAlienInvasion()` / `normalizeAlienInvasion(inv)` — нормализация объекта вторжения

**Структура объекта вторжения `G.alienInvasion`:**
```js
{ sysId, race, raceIcon, raceName, spawnDay,
  alienIds[],     // текущая волна врагов
  bossId,         // id финального босса
  bossUnlocked,   // boolean — можно ли уже бить босса
  bossDefeated,   // boolean
  progress,       // убито целей
  totalTargets,   // всего целей включая босса
  alienId }       // текущая выбранная цель (для UI)
```

### `galaxy.js`
Canvas-карта галактик и систем.
- `initGalaxy()` — инициализация canvas (вызывается при переходе на экран)
- `setGalaxy(idx, btn)` — переключение галактики
- `doFly()` — перелёт в выбранную систему
- `backToGalaxyView()` / `openSelectedSystem()` — навигация
- `travelTarget` — `{type:'system'|'planet', sysId, planetIndex}`

**Важно:** для разблокировки галактик используется `hasTech('warp')`. Некоторые галактики требуют минимального уровня (`GALAXIES[].unlock`).

### `online.js`
Многопользовательские фичи.
- `heartbeat()` — запись присутствия в shared storage (раз в 60 сек)
- `fetchOnline()` → `onlineRangers[]` — список онлайн-игроков
- `fetchLeague()` → `leagueData[]` — таблица лиги
- `renderOnlineRangers()` — рендер вкладки онлайн (async, поэтому вызывается отдельно)
- `addLeagueScore(pts)` — начисление очков лиги
- `leagueSeasonTick()` — проверка конца сезона
- `startPlanetCapture()` — захват системы

**Storage keys:** `online:{playerName}` (shared), `name:{lowercase}` (shared для проверки уникальности)

### `ui.js`
Весь рендеринг. Самый большой файл (1300 строк). Грузится последним.

**HUD и навигация:**
- `updateHUD()` — обновление всех числовых показателей в шапке
- `goTo(name, btn)` — переключение экранов

**Рендер экранов:**
- `renderMine()` — экран добычи (планета + хелперы + апгрейды)
- `renderTrade()` — рынок текущей системы
- `renderQuests()` — задания
- `renderMoreTab()` — диспетчер вкладок экрана "Ещё"

**Вкладки "Ещё" (`moreTab`):**
| Значение | Функция | Описание |
|----------|---------|----------|
| `combat` | `renderCombatHTML()` | Бой с пиратами/пришельцами |
| `hangar` | `renderHangarHTML()` | Текущее снаряжение и слоты |
| `catalog`| `renderCatalogHTML()` | Каталог всей техники |
| `tech`   | `renderTechHTML()` | Дерево технологий |
| `skills` | `renderSkillsHTML()` | Прокачка навыков |
| `market` | `renderMarketHTML()` | Рынок оборудования (→ catalog) |
| `rangers`| `renderRangersHTML()` | Боты-рейнджеры |
| `debris` | `renderDebrisHTML()` | Обломки в системе |
| `online` | `renderOnlineRangers()` | Онлайн и лига (async) |
| `events` | `renderEventsHTML()` | Случайные события и аномалии |
| `police` | `renderPoliceHTML()` | Репутация + дозаправка |
| `land`   | `renderLandHTML()` | Земельные участки |
| `story`  | `renderStoryHTML()` | Сюжетные цепочки |

**Каталог фильтры (глобальные через `window`):**
```js
window.catalogFilter      // 'hull'|'weapon'|'defense'|'engine'|'specmod'|'support'
window.catalogTier        // 0=все, 1-6=конкретный тир
window.catalogAvailOnly   // boolean — только доступные
window.catalogSearch      // строка поиска
window.catalogCompareId   // id предмета для сравнения
```
> **⚠️ Правило:** все эти переменные ТОЛЬКО через `window.catalogXxx`. Локальные `let catalogFilter` объявлены для удобства чтения но не используются в onclick — там только `window.*`.

**Торговые действия:**
- `buyGood(gId)` / `buyGoodMax(gId)` / `sellGood(gId, amt)`
- `_updateCargoCost(gId, price, qty)` — обновление средней цены покупки

**Снаряжение:**
- `buyCatalogItem(itemId)` / `equipCatalogItem(itemId)` — каталог (новая система)
- `buyEquip(id)` / `equipItem(id)` — старая система (EQUIPMENT из data.js)
- `buyRanger(id)`, `researchTech(id)`, `upgradeSkill(id)`, `bribePolice(gal)`

**Safe-хелперы для каталога:**
- `getEquipCatalog()` — возвращает EQUIPMENT_CATALOG или EQUIPMENT
- `getEquipSection(cat)` — предметы категории из нужного каталога
- `getEquipUnlockedSafe(item, G)` — проверка доступности предмета
- `getEquipLockReasonSafe(item, G)` — причина блокировки
- `getItemPriceSafe(item)` — цена предмета
- `eqRarityColor(rarity)` — цвет редкости

**Запуск:**
```js
initPrices();      // ЕДИНСТВЕННЫЙ вызов initPrices — здесь, в конце ui.js
_uiReady = true;
if(!G.playerName) showNameScreen();
else { updateHUD(); renderMine(); refreshQuests(); }
```

---

## 🔑 Критические правила (нарушение = баг)

### 1. Доступ к товарам — только через хелперы
```js
// ❌ НЕЛЬЗЯ
GOODS[gId].name
GOODS[gId].base
sys.goods.forEach(...)

// ✅ НУЖНО
_goodName(gId)
_goodBase(gId)
_sysGoods(sys).forEach(...)
```

### 2. `initPrices()` вызывается ровно один раз
Только в конце `ui.js`. В `engine.js` только объявление функции.

### 3. Каталог-фильтры только через `window`
```js
// ❌ НЕЛЬЗЯ в onclick
onclick="catalogFilter='hull'"

// ✅ НУЖНО
onclick="window.catalogFilter='hull';renderMoreTab()"
```

### 4. Структура объекта обломка в `G.debrisActive`
```js
// Создаётся в spawnDebris():
{ id, type, name, icon, reward: число_кредитов, rp, expires: timestamp }

// НЕ путать с DEBRIS_TYPES[].reward = {goodId: qty}
```

### 5. Новые поля G — мигрировать при старте
При добавлении нового поля в G — обязательно добавить миграцию в `engine.js`:
```js
if(!G.newField) G.newField = defaultValue;
```

### 6. `market_catalog.js` должен быть в index.html
Должен стоять перед `engine.js`. Без него `MARKET_CATALOG` = undefined.

---

## 🗺️ Схема экранов

```
┌─────────────────────────────────────┐
│  sc-mine    │ sc-galaxy │ sc-trade  │
│  sc-quest   │ sc-more               │
└─────────────────────────────────────┘

sc-more вкладки (moreTab):
  Основные: combat → hangar → catalog → tech → skills → market → rangers → online → events
  Скрытые (кнопка •••): police → land → story → debris
```

---

## 💾 Сохранение

- Ключ localStorage: `srw_v4` (бэкап: `srw_v4_bak`, устаревший: `srw_v3`)
- Авто-сейв: каждые 10 секунд
- Сброс: `resetAllProgress()` (видна только игрокам с именем "Иван"/"Ivan")

---

## 🌐 Деплой

- Хостинг: Vercel (`vercel.json` в корне — пустой, всё по умолчанию)
- Telegram WebApp: `telegram-web-app.js` подключён в head

---

## ➕ Как добавить новую фичу — чеклист

- [ ] Новые данные → в `data.js` (константы) или новый `xxx_catalog.js`
- [ ] Новый файл → добавить в `index.html` в правильное место порядка загрузки
- [ ] Новое поле G → в `freshState()` в `state.js` + миграция в `engine.js`
- [ ] Новая вкладка "Ещё" → кнопка в `index.html` + `else if` в `renderMoreTab()` + функция `renderXxxHTML()`
- [ ] Доступ к товарам → только `_goodName/_goodIcon/_goodBase/_sysGoods`
- [ ] Любая новая переменная для `onclick` → объявить через `window.xxx`
- [ ] После правки → проверить `grep -n "GOODS\[" ui.js` и `grep -n "sys\.goods\b" ui.js` — не должно быть прямых обращений
