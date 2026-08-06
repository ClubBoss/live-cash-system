import { readFile, writeFile } from "node:fs/promises";

const sourcePath = new URL("../content/i18n/source.ru.json", import.meta.url);
const ruPath = new URL("../content/i18n/ru.json", import.meta.url);
const enPath = new URL("../content/i18n/en.json", import.meta.url);

const source = JSON.parse(await readFile(sourcePath, "utf8"));
const currentRu = JSON.parse(await readFile(ruPath, "utf8"));
const currentEn = JSON.parse(await readFile(enPath, "utf8"));

const ruPhrases = [
  ["teaching layer", "объяснение"],
  ["teaching layers", "уроки"],
  ["working evidence", "подтверждение в практике"],
  ["field transfer", "применение за столом"],
  ["delayed review", "повторение через время"],
  ["due review", "запланированное повторение"],
  ["changed node", "изменённая ситуация"],
  ["changed nodes", "изменённые ситуации"],
  ["explain-back", "объяснение своими словами"],
  ["table card", "памятка за столом"],
  ["cold diagnostic", "диагностика без подсказок"],
  ["cold check", "вопрос без подсказки"],
  ["repair family", "группа связанных ошибок"],
  ["repair", "разбор ошибки"],
  ["mastery", "устойчивый навык"],
  ["evidence", "подтверждение"],
  ["feedback", "разбор ответа"],
  ["baseline", "базовая линия"],
  ["falsifier", "признак, который опровергнет вывод"],
  ["future tree", "дальнейший розыгрыш"],
  ["decision tree", "порядок решения"],
  ["branch-specific", "привязанный к конкретной ветке"],
  ["branch", "ветка"],
  ["node signature", "набор условий ситуации"],
  ["node", "ситуация"],
  ["arrival range", "диапазон, дошедший до решения"],
  ["source range", "исходный диапазон"],
  ["range source", "источник диапазона"],
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
  ["bet", "ставка"],
  ["bluff", "блеф"],
  ["value", "вэлью"],
  ["blocker", "блокер"],
  ["equity", "эквити"],
  ["realisation", "реализация эквити"],
  ["realized equity", "реализованное эквити"],
  ["raw equity", "исходное эквити"],
  ["size", "размер"],
  ["player behind", "игрок сзади"],
  ["players behind", "игроки сзади"],
  ["closing action", "закрытие торгов"],
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
];

function naturalizeRussian(value) {
  let text = value;
  for (const [from, to] of ruPhrases) text = text.replace(new RegExp(`\\b${from.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`, "gi"), to);
  text = text
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/\bпроверить проверить\b/gi, "проверить")
    .replace(/\bдиапазон диапазон\b/gi, "диапазон")
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
  for (const term of protectedTerms.sort((a, b) => b.length - a.length)) {
    const expression = new RegExp(term.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&"), "gi");
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
      const response = await fetch(url, { headers: { "user-agent": "LiveCashOS-i18n/1.0" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      const translated = payload[0].map((part) => part[0]).join("");
      return restoreTerms(translated, restore)
        .replace(/\bthe villain\b/gi, "Villain")
        .replace(/\bthe hero\b/gi, "Hero")
        .replace(/\bturne\b/gi, "turn")
        .replace(/\brivere\b/gi, "river")
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
