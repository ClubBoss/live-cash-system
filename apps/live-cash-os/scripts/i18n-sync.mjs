import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../content/i18n/source.ru.json", import.meta.url);
const ruPath = new URL("../content/i18n/ru.json", import.meta.url);
const enPath = new URL("../content/i18n/en.json", import.meta.url);

const source = JSON.parse(await readFile(sourcePath, "utf8"));
const currentRu = JSON.parse(await readFile(ruPath, "utf8"));
const currentEn = JSON.parse(await readFile(enPath, "utf8"));

const ruPhrases = [
  ["teaching layers", "уроки"],
  ["teaching layer", "объяснение"],
  ["working evidence", "подтверждение в практике"],
  ["field evidence", "подтверждение за столом"],
  ["field transfer", "применение за столом"],
  ["delayed retrieval", "повторение через время"],
  ["delayed review", "повторение через время"],
  ["due review", "запланированное повторение"],
  ["changed nodes", "изменённые ситуации"],
  ["changed node", "изменённая ситуация"],
  ["explain-back", "объяснение своими словами"],
  ["table card", "памятка за столом"],
  ["cold diagnostic", "диагностика без подсказок"],
  ["cold check", "вопрос без подсказки"],
  ["repair family", "группа связанных ошибок"],
  ["repair", "разбор ошибки"],
  ["mastery", "устойчивый навык"],
  ["evidence grade", "надёжность наблюдения"],
  ["evidence", "подтверждение"],
  ["feedback", "разбор ответа"],
  ["structural baseline", "базовая линия"],
  ["baseline", "базовая линия"],
  ["falsifier", "признак, который опровергнет вывод"],
  ["future tree", "дальнейший розыгрыш"],
  ["decision tree", "порядок решения"],
  ["branch-specific", "привязанный к конкретной ветке"],
  ["node signature", "условия ситуации"],
  ["arrival ranges", "диапазоны, дошедшие до решения"],
  ["arrival range", "диапазон, дошедший до решения"],
  ["source ranges", "исходные диапазоны"],
  ["source range", "исходный диапазон"],
  ["range source", "источник диапазона"],
  ["action history", "история действий"],
  ["players behind", "игроки сзади"],
  ["player behind", "игрок сзади"],
  ["closing action", "закрытие торгов"],
  ["shared defence", "общая защита нескольких диапазонов"],
  ["shared defense", "общая защита нескольких диапазонов"],
  ["realized equity", "реализованное эквити"],
  ["realised equity", "реализованное эквити"],
  ["raw equity", "исходное эквити"],
  ["fold equity", "фолд-эквити"],
  ["implied odds", "потенциальные шансы банка"],
  ["pot odds", "шансы банка"],
  ["check-back", "чек вдогон"],
  ["check-raise", "чек-рейз"],
  ["range-bet", "ставка всем диапазоном"],
  ["near-range", "почти всем диапазоном"],
  ["small-wide", "маленькая ставка широким диапазоном"],
  ["large-selective", "крупная выборочная ставка"],
  ["value-heavy", "сильный и смещённый к вэлью"],
  ["value first", "сначала вэлью"],
  ["value-first", "сначала вэлью"],
  ["bluff supply", "запас возможных блефов"],
  ["credible bluff supply", "реально возможные блефы"],
  ["range construction", "построение диапазона"],
  ["response shape", "форма ответа"],
  ["betting range", "диапазон ставки"],
  ["continuing range", "диапазон продолжения"],
  ["source branch", "исходная ветка"],
  ["fold targets", "руки, которые действительно могут сфолдить"],
  ["value targets", "худшие руки, которые продолжат"],
  ["denial targets", "руки с живым эквити, которые можно выбить"],
  ["high-confidence miss", "ошибка при высокой уверенности"],
  ["structural miss", "ошибка в понимании структуры"],
  ["showdown value", "ценность на вскрытии"],
  ["showdown", "вскрытие"],
  ["overfolds", "слишком часто фолдит"],
  ["overfold", "слишком частый фолд"],
  ["overcalls", "слишком широко коллирует"],
  ["overcall", "слишком широкий колл"],
  ["overbluffs", "слишком часто блефует"],
  ["overbluff", "переблеф"],
  ["calls", "коллы"],
  ["folds", "фолды"],
  ["raises", "рейзы"],
  ["bets", "ставки"],
  ["checks", "чеки"],
  ["bluffs", "блефы"],
  ["blockers", "блокеры"],
  ["ranges", "диапазоны"],
  ["boards", "доски"],
  ["turns", "тёрны"],
  ["rivers", "риверы"],
  ["branches", "ветки"],
  ["actions", "действия"],
  ["players", "игроки"],
  ["premiums", "премиальные руки"],
  ["broadways", "бродвеи"],
  ["continues", "продолжения"],
  ["survivors", "дошедшие руки"],
  ["surviving", "дошедшие"],
  ["branch", "ветка"],
  ["node", "ситуация"],
  ["range", "диапазон"],
  ["hands", "руки"],
  ["hand", "рука"],
  ["board", "доска"],
  ["flop", "флоп"],
  ["turn", "тёрн"],
  ["river", "ривер"],
  ["call", "колл"],
  ["fold", "фолд"],
  ["raise", "рейз"],
  ["check", "чек"],
  ["bet", "ставка"],
  ["bluff", "блеф"],
  ["value", "вэлью"],
  ["blocker", "блокер"],
  ["equity", "эквити"],
  ["realisation", "реализация эквити"],
  ["realization", "реализация эквити"],
  ["size", "размер"],
  ["multiway", "мультивей"],
  ["heads-up", "один на один"],
  ["OOP", "без позиции"],
  ["IP", "в позиции"],
  ["deep", "глубоко"],
  ["shallow", "мелко"],
  ["default", "по умолчанию"],
  ["prior", "исходное предположение"],
  ["sample", "выборка"],
  ["frequency", "частота"],
  ["pattern", "схема"],
  ["skill", "навык"],
  ["learner", "ученик"],
  ["directional", "как общий ориентир"],
  ["core", "основная линия"],
  ["boundary", "граница"],
  ["uncapped", "без явного ограничения сверху"],
  ["capped", "ограниченный сверху"],
  ["ownership", "преимущество по сильным рукам"],
  ["coverage", "покрытие доски"],
  ["denial", "выбивание живого эквити"],
  ["pressure", "давление"],
  ["exploit", "эксплойт"],
  ["opponent", "соперник"],
  ["Villain", "соперник"],
  ["Hero", "Hero"],
  ["polar", "полярный"],
  ["linear", "линейный"],
  ["condensed", "плотный"],
  ["merged", "объединённый"],
  ["robust", "устойчивый"],
  ["vulnerable", "уязвимый"],
  ["selective", "выборочный"],
  ["dynamic", "динамичный"],
  ["scary", "опасный"],
  ["wide", "широкий"],
  ["tight", "тайтовый"],
  ["air", "воздух"],
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function naturalizeRussian(value) {
  let text = value;
  for (const [from, to] of ruPhrases) text = text.replace(new RegExp(`\\b${escapeRegExp(from)}\\b`, "gi"), to);
  text = text
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/\bпроверить проверить\b/gi, "проверить")
    .replace(/\bдиапазон диапазон\b/gi, "диапазон")
    .replace(/\bсоперник коллы\b/gi, "соперник коллирует")
    .replace(/\bсоперник фолды\b/gi, "соперник фолдит")
    .replace(/\bсоперник ставки\b/gi, "соперник ставит")
    .replace(/\bсоперник рейзы\b/gi, "соперник рейзит")
    .trim();
  return text;
}

const protectedTerms = [
  "SPR", "BB", "SB", "BTN", "CO", "HJ", "LJ", "UTG", "EP", "IP", "OOP",
  "3-bet", "4-bet", "c-bet", "squeeze", "MDF", "A5s", "AJo", "KJo", "KQ", "TT", "76s", "98s",
  "Hero", "Villain", "range", "call", "fold", "raise", "check", "bet", "flop", "turn", "river",
];

function protect(value) {
  const restore = [];
  let text = value;
  for (const term of [...protectedTerms].sort((a, b) => b.length - a.length)) {
    const expression = new RegExp(escapeRegExp(term), "gi");
    text = text.replace(expression, (match) => {
      const token = `__TERM_${restore.length}__`;
      restore.push(match);
      return token;
    });
  }
  return { text, restore };
}

function restoreTerms(value, restore) {
  return restore.reduce((text, term, index) => text.replaceAll(`__TERM_${index}__`, term), value);
}

async function translateGoogle(value) {
  if (!/[А-Яа-яЁё]/u.test(value)) return value;
  const { text, restore } = protect(value);
  const url = new URL("https://translate.googleapis.com/translate_a/single");
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "auto");
  url.searchParams.set("tl", "en");
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", text);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { "user-agent": "LiveCashOS-i18n/1.1" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const translated = payload[0].map((part) => part[0]).join("");
      return restoreTerms(translated, restore)
        .replace(/\bthe villain\b/gi, "Villain")
        .replace(/\bthe hero\b/gi, "Hero")
        .replace(/\bturne\b/gi, "turn")
        .replace(/\brivere\b/gi, "river")
        .replace(/\bfloppe\b/gi, "flop")
        .trim();
    } catch (error) {
      if (attempt === 2) throw error;
      await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
    }
  }
  return value;
}

function carry(memory, key, sourceValue) {
  const entry = memory[key];
  return entry && entry.source === sourceValue && entry.text?.trim() ? entry : null;
}

const nextRu = {};
const nextEn = {};
let draftedRu = 0;
let draftedEn = 0;

for (const [key, sourceValue] of Object.entries(source)) {
  const ruCurrent = carry(currentRu, key, sourceValue);
  if (ruCurrent) nextRu[key] = ruCurrent;
  else {
    nextRu[key] = { source: sourceValue, text: naturalizeRussian(sourceValue), status: "DRAFT" };
    draftedRu += 1;
  }

  const enCurrent = carry(currentEn, key, sourceValue);
  if (enCurrent) nextEn[key] = enCurrent;
  else {
    let text;
    try { text = await translateGoogle(sourceValue); }
    catch { text = sourceValue; }
    nextEn[key] = { source: sourceValue, text, status: "DRAFT" };
    draftedEn += 1;
    await new Promise((resolve) => setTimeout(resolve, 35));
  }
}

await writeFile(ruPath, `${JSON.stringify(nextRu, null, 2)}\n`, "utf8");
await writeFile(enPath, `${JSON.stringify(nextEn, null, 2)}\n`, "utf8");
console.log(`Translation memory synced: ${Object.keys(source).length} keys; RU drafted ${draftedRu}; EN drafted ${draftedEn}.`);
