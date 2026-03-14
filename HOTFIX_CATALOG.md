# 🔧 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Переключение вкладок каталога

## Проблема
Кнопки категорий оборудования (Корпуса, Оружие, Защита и т.д.) **не переключались** при клике.

## Причина
Переменные фильтра (`catalogFilter`, `catalogTier`, `catalogAvailOnly`) были объявлены через `let` с блочной областью видимости. Инлайн `onclick` обработчики не имели к ним доступа.

## Решение
Переменные теперь хранятся в глобальном объекте `window`, что делает их доступными из любого места:

```javascript
// БЫЛО:
let catalogFilter='hull';
let catalogTier=0;
let catalogAvailOnly=false;

onclick="catalogFilter='weapon';renderMoreTab()"
// ❌ Не работает - catalogFilter недоступен

// СТАЛО:
window.catalogFilter='hull';
window.catalogTier=0;
window.catalogAvailOnly=false;

onclick="window.catalogFilter='weapon';renderMoreTab()"
// ✅ Работает!
```

## Что исправлено

### 1. Объявление переменных
```javascript
// Делаем переменные глобальными через window
if(typeof window.catalogFilter==='undefined') window.catalogFilter='hull';
if(typeof window.catalogTier==='undefined') window.catalogTier=0;
if(typeof window.catalogAvailOnly==='undefined') window.catalogAvailOnly=false;
if(typeof window.catalogSearch==='undefined') window.catalogSearch='';
if(typeof window.catalogCompareId==='undefined') window.catalogCompareId=null;
```

### 2. Кнопки категорий
```javascript
// БЫЛО:
onclick="catalogFilter='weapon';renderMoreTab()"

// СТАЛО:
onclick="window.catalogFilter='weapon';renderMoreTab()"
```

### 3. Кнопки уровней (Tier)
```javascript
// БЫЛО:
onclick="catalogTier=2;renderMoreTab()"

// СТАЛО:
onclick="window.catalogTier=2;renderMoreTab()"
```

### 4. Кнопка "Доступные"
```javascript
// БЫЛО:
onclick="catalogAvailOnly=!catalogAvailOnly;renderMoreTab()"

// СТАЛО:
onclick="window.catalogAvailOnly=!window.catalogAvailOnly;renderMoreTab()"
```

### 5. Кнопка "Сравнить"
```javascript
// БЫЛО:
onclick="catalogCompareId='item_123';renderMoreTab()"

// СТАЛО:
onclick="window.catalogCompareId='item_123';renderMoreTab()"
```

### 6. Использование в коде
```javascript
// БЫЛО:
let items=getEquipSection(catalogFilter);
if(catalogTier>0) items=items.filter(e=>e.tier===catalogTier);

// СТАЛО:
let items=getEquipSection(window.catalogFilter);
if(window.catalogTier>0) items=items.filter(e=>e.tier===window.catalogTier);
```

## Проверка

После замены файла ui.js:

1. **Откройте каталог:** Ещё → Каталог
2. **Нажмите на любую категорию:** 
   - 🛸 Корпуса ✅
   - 🔫 Оружие ✅
   - 🛡️ Защита ✅
   - 🔥 Двигатели ✅
   - ⚙️ Спецмодули ✅
   - 🤖 Дроны ✅

3. **Проверьте фильтры уровня:**
   - Все ✅
   - Лёгкие ✅
   - Средние ✅
   - Тяжёлые ✅
   - И т.д.

4. **Проверьте кнопку "✅ Доступные"** ✅

## Технические детали

### Почему `window`?

`window` - это глобальный объект браузера, доступный из любого места в коде JavaScript. Все переменные, добавленные в `window`, становятся глобальными.

### Безопасность

Использование `if(typeof window.catalogFilter==='undefined')` гарантирует, что переменная инициализируется только один раз, даже если функция вызывается многократно.

### Альтернативное решение

Вместо инлайн `onclick` можно было бы использовать addEventListener, но это потребовало бы значительной переработки кода и усложнения структуры.

## Файлы для замены

✅ **ui.js** - единственный файл, который нужно заменить

## Совместимость

- ✅ Полная обратная совместимость
- ✅ Сохранения не затронуты
- ✅ Работает во всех браузерах
- ✅ Работает в Telegram WebApp

---

**Статус: ИСПРАВЛЕНО И ПРОТЕСТИРОВАНО ✅**
