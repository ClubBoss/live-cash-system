import { readFile, writeFile } from "node:fs/promises";

const ruPath = new URL("../content/i18n/ru.json", import.meta.url);
const enPath = new URL("../content/i18n/en.json", import.meta.url);
const sourcePath = new URL("../content/i18n/source.ru.json", import.meta.url);
const source = JSON.parse(await readFile(sourcePath, "utf8"));
const ru = JSON.parse(await readFile(ruPath, "utf8"));
const en = JSON.parse(await readFile(enPath, "utf8"));

const ruFixes = {
  "drill.anc-04.cue": "Соперник слишком широко ставит c-bet и часто фолдит на рейз, но его 3-bet на флопе смещён к вэлью.",
  "drill.anc-04.option.anc-04-a0": "Разделить ветки c-bet/fold и c-bet/3-bet.",
  "drill.bli-01.question": "Можно ли автоматически использовать тот же план c-bet?",
  "drill.fil-05.assumptions.0": "широкий эксплойтный c-bet",
  "drill.fil-05.cue": "Hero ставит c-bet шире против игрока, который слишком часто фолдит, но соперник коллирует.",
  "drill.geo-02.assumptions.1": "Hero $900, соперник A $270, соперник B $1,200",
  "drill.geo-03.option.geo-03-a2": "Стартовую глубину в BB до флопа.",
  "module.blinds.explainBackPrompt": "Объясни, почему SB и BB приходят на флоп с разными диапазонами и почему это меняет план c-bet.",
  "module.blinds.worked.steps.2": "Поэтому одинаковый автоматический c-bet против SB и BB не обоснован.",
  "module.geometry.explainBackPrompt": "Объясни своими словами, почему обычные BB, эффективный стек и SPR отвечают на разные вопросы.",
  "module.geometry.worked.answer": "Сначала 140 BB по страддлу, затем глубина против конкретного соперника и SPR после действия.",
  "module.geometry.worked.steps.0": "Рабочая единица сейчас — $10, поэтому первая глубина равна 140 BB по страддлу.",
  "module.geometry.worked.steps.1": "В обычных BB это 280 BB, но эта цифра не должна первой управлять решением.",
};

const enFixes = {
  "card.agg-card-job.back": "Equity, useful blockers or removal, and a credible river continuation.",
  "card.agg-card-value.back": "The weakest value hand and the size it uses.",
  "card.anc-card-before.back": "The source range and the value and bluff combinations that survive the line.",
  "card.geo-card-spr.front": "Why can starting BB be misleading?",
  "card.mul-card-own.back": "Audit source ranges and board ownership before relying on initiative.",
  "drill.anc-02.cue": "A tight, value-heavy SB 3-bet against an EP open.",
  "drill.evi-01.option.evi-01-a1": "Villain overbluffs this branch.",
  "drill.evi-02.cue": "Villain repeatedly calls a small flop bet too wide and then overfolds the turn.",
  "drill.evi-02.option.evi-02-a0": "Store it as a small-flop-call to turn-fold leak tied to this branch.",
  "drill.geo-01.explanation": "The forced bet changes the working unit. Ordinary BB remain useful as a secondary description.",
  "drill.geo-02.assumptions.1": "Hero $900, Villain A $270, Villain B $1,200",
  "drill.geo-03.option.geo-03-a2": "Only the starting BB before the flop.",
  "drill.mul-01.cue": "Three-way on K-9-7 two-tone: HJ bets, Hero is BTN with KQ, and BB remains behind.",
  "drill.mul-01.explanation": "Sandwich pressure changes the thresholds because BB still has an uncapped continuing range.",
  "drill.mul-01.option.mul-01-a0": "Account for BB's uncapped continuing range.",
  "drill.mul-04.cue": "CO, BTN and BB see a 7-6-3 rainbow flop.",
  "drill.riv-03.option.riv-03-a1": "Fold every one-pair hand.",
  "drill.sha-04.cue": "A vulnerable top pair faces a small, wide bet on a dynamic board.",
  "module.aggression.lab.rightText": "Equity, useful removal, or a credible river continuation.",
  "module.aggression.technicalTerm": "Value-first construction, equity denial, pressure and future-street jobs.",
  "module.ancestry.heuristics.0": "Trace the range ancestry before evaluating a blocker.",
  "module.ancestry.shortTitle": "Ancestry before blockers",
  "module.ancestry.technicalTerm": "Range ancestry, branch-specific opponent modelling, and credible bluff supply.",
  "module.ancestry.worked.situation": "A tight SB 3-bets against an EP open and Hero holds A5s.",
  "module.blinds.lab.title": "Same flop, different source range",
  "module.blinds.technicalTerm": "Blind source identity, closing the action, and equity realisation.",
  "module.evidence.lab.title": "A note versus usable evidence",
  "module.evidence.technicalTerm": "Branch-specific opponent modelling, evidence strength, and falsifiers.",
  "module.evidence.worked.situation": "Villain repeatedly calls small flop bets too wide and folds turns after missing.",
  "module.evidence.worked.steps.2": "The exploit is selective turn pressure, not a global label such as 'weak player'.",
  "module.filtering.technicalTerm": "Range source, action filtering, and the range that arrives at the decision.",
  "module.filtering.worked.situation": "Hero c-bets wider against an overfolder, and Villain calls the flop.",
  "module.geometry.explainBackPrompt": "Explain why ordinary BB, effective stack, and SPR answer different questions.",
  "module.geometry.worked.answer": "Start with 140 straddle BB, then use pairwise depth and post-action SPR.",
  "module.geometry.worked.steps.0": "The current strategic unit is $10, so the first depth is 140 straddle BB.",
  "module.geometry.worked.steps.1": "That is 280 ordinary BB, but the larger number should not drive the decision first.",
  "module.multiway.shortTitle": "Sandwich and closing action",
  "module.multiway.technicalTerm": "Sandwich pressure, shared defence, closing action, and multiway range ownership.",
  "module.multiway.worked.situation": "HJ opens, BTN calls, and BB calls. On K-9-7 two-tone, HJ bets and Hero has KQ on BTN with BB still behind.",
  "module.preflop.technicalTerm": "Preflop range architecture: linear value, polar aggression, and protected flatting branches.",
  "module.preflop.worked.situation": "At 200bb, HJ opens, CO calls, Hero has 76s on BTN, and the blinds are passive.",
  "module.river.decisionTree.0": "Trace the source range through every previous action.",
  "module.river.technicalTerm": "River range ancestry, size-specific exclusions, and blocker interaction.",
  "module.shape.technicalTerm": "Small-wide and large-selective betting ranges, linear raises, and protected calls.",
  "module.transfer.technicalTerm": "Variant transfer, delayed retrieval, field transfer, and targeted repair families.",
};

function apply(memory, fixes, locale) {
  for (const [key, text] of Object.entries(fixes)) {
    if (!(key in source) || !(key in memory)) throw new Error(`${locale} correction refers to an unknown key: ${key}`);
    memory[key] = { source: source[key], text, status: memory[key].status === "REVIEWED" ? "REVIEWED" : "DRAFT" };
  }
}

apply(ru, ruFixes, "RU");
apply(en, enFixes, "EN");
await writeFile(ruPath, `${JSON.stringify(ru, null, 2)}\n`, "utf8");
await writeFile(enPath, `${JSON.stringify(en, null, 2)}\n`, "utf8");
console.log(`Applied ${Object.keys(ruFixes).length} RU and ${Object.keys(enFixes).length} EN explicit audit corrections.`);
