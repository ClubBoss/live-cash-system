import { moduleById } from "../modules";
import type { LocaleCode } from "../../lib/model";

type CorrectPatch = { action?: string; reason?: string };

function findDrill(drillId: string) {
  for (const module of Object.values(moduleById)) {
    const drill = module.drills.find((item) => item.id === drillId);
    if (drill) return drill;
  }
  throw new Error(`Missing option-balance drill ${drillId}`);
}

function patchCorrectOptions(patches: Record<string, CorrectPatch>) {
  for (const [drillId, patch] of Object.entries(patches)) {
    const drill = findDrill(drillId);
    if (patch.action) {
      const correct = drill.actionOptions.find((option) => option.id === drill.correctActionId);
      if (!correct) throw new Error(`Missing correct action for ${drillId}`);
      correct.text = patch.action;
    }
    if (patch.reason) {
      const correct = drill.reasonOptions.find((option) => option.id === drill.correctReasonId);
      if (!correct) throw new Error(`Missing correct reason for ${drillId}`);
      correct.text = patch.reason;
    }
  }
}

function patchWrongReasons(drillId: string, texts: [string, string]) {
  const drill = findDrill(drillId);
  const wrong = drill.reasonOptions.filter((option) => option.id !== drill.correctReasonId);
  if (wrong.length !== 2) throw new Error(`Expected two wrong reasons for ${drillId}`);
  wrong.forEach((option, index) => { option.text = texts[index]; });
}

const RU: Record<string, CorrectPatch> = {
  "bli-02": { reason: "Цена и закрытие торговли поддерживают колл" },
  "bli-03": { reason: "SB не закрывает торговлю; BB всё ещё может сквизить" },
  "bli-04": { reason: "Позиция и доминация снижают реальную реализацию эквити" },
  "bli-05": { action: "Расширить диапазон SB, сохранив позиционные ограничения", reason: "Рид меняет диапазон, но не структуру позиции" },
  "fil-01": { reason: "Каждый колл фильтрует диапазон и убирает часть фолдов" },
  "fil-03": { reason: "Чек фильтрует ставки, но может сохранять сильные руки" },
  "sha-01": { reason: "Лучшая цена и широкий бет оставляют больше воздуха" },
  "sha-02": { reason: "Хуже цена и сильнее диапазон продолжения" },
  "agg-01": { reason: "Слишком широкий 3-бет содержит больше слабых рук" },
  "agg-02": { reason: "Премиальное преимущество поддерживает частую маленькую ставку" },
  "agg-03": { reason: "Меньшее преимущество требует более точного выбора ставок" },
  "agg-05": { reason: "Крупный рейз требует достаточного верхнего вэлью" },
  "anc-01": { reason: "Блокер полезен только при реальных fold targets" },
  "anc-02": { reason: "Без реальных фолдов блокер не создаёт fold equity" },
  "anc-03": { reason: "Позиция и глубина сохраняют сильную колл-ветку" },
  "anc-05": { reason: "Блокер не создаёт блефы, не дошедшие по линии" },
  "mul-02": { action: "Защита может расшириться без диапазона за спиной" },
  "mul-03": { reason: "Тайтовый HJ сохраняет больше премиумов и QJ" },
  "mul-04": { reason: "BB лучше покрывает низкие сильные комбинации" },
  "mul-05": { reason: "Рид локально меняет исходный overcall-диапазон" },
  "riv-03": { reason: "Размер сужает вэлью, но не создаёт блефы" },
  "riv-04": { reason: "Блокер может удалять больше блефов, чем вэлью" },
  "evi-03": { action: "Baseline плюс population prior с ограниченной уверенностью", reason: "Источник задаёт направление, но не локальную частоту" },
  "evi-05": { reason: "Важны повторяемость и влияние на будущее решение" },
  "tra-01": { reason: "Перенос сохраняет механизм при изменённой переменной" },
  "tra-03": { reason: "Реальная рука требует разбора причинного решения" },
  "tra-04": { reason: "Один repair ещё не доказывает удержание навыка" },
};

const EN: Record<string, CorrectPatch> = {
  "geo-03": { reason: "The new pot and remaining stack set future SPR" },
  "bli-01": { action: "Rebuild each blind's preflop source range first" },
  "bli-02": { reason: "Price and closing action can preserve the call" },
  "bli-03": { reason: "SB stays exposed to a squeeze from BB" },
  "bli-04": { reason: "Position and domination reduce realised equity" },
  "bli-05": { reason: "The read changes range, not positional structure" },
  "fil-02": { reason: "The same size can represent different betting ranges" },
  "fil-03": { reason: "Checking filters bets but can retain strong hands" },
  "fil-05": { reason: "The call changes the range facing the next barrel" },
  "sha-01": { reason: "Better price and a wide bet leave more air" },
  "sha-02": { reason: "Worse price and stronger continues shrink thin raises" },
  "sha-03": { reason: "Robust hands protect calls and preserve future bluffs" },
  "sha-04": { reason: "The raise needs worse continues or equity denial" },
  "sha-05": { reason: "Discomfort does not create value or denial" },
  "agg-01": { reason: "The wider 3-bet range contains more weak hands" },
  "agg-02": { reason: "Premium advantage supports frequent small betting" },
  "agg-03": { reason: "Less range advantage requires more selective betting" },
  "agg-04": { reason: "The flop call strengthens the defender's surviving range" },
  "agg-05": { reason: "Large raises need enough top-end value first" },
  "anc-01": { reason: "Blocker value matters only with real fold targets" },
  "anc-02": { reason: "Without real folds, the blocker creates no fold equity" },
  "anc-03": { reason: "Position and depth preserve a strong calling branch" },
  "anc-04": { reason: "Reads can differ across separate action branches" },
  "anc-05": { reason: "Blockers cannot create bluffs absent from the line" },
  "mul-03": { reason: "Tight HJ retains more premiums and QJ" },
  "mul-04": { reason: "BB covers more low-board nut combinations" },
  "riv-03": { reason: "Size narrows value but does not create bluffs" },
  "evi-03": { action: "Use baseline plus a low-confidence population prior", reason: "The source guides attention, not local frequency" },
  "evi-04": { reason: "The read applies to that size and node" },
  "evi-05": { action: "Ask whether it repeats and changes a decision" },
  "tra-01": { reason: "Transfer preserves the mechanism under a changed variable" },
  "tra-02": { reason: "Retention requires a later answer without fresh feedback" },
  "tra-03": { reason: "A real hand needs review of the reasoning" },
  "tra-05": { reason: "Field validation needs repeated reviewed transfer evidence" },
};

/**
 * Real-use anti-guessing repair: keep selectable answers compact enough that
 * correctness is not signalled by prose length. Full teaching detail remains in
 * the post-answer explanation. Only text changes; IDs and scoring stay intact.
 */
export function applyDecisionOptionBalance(locale: LocaleCode) {
  patchCorrectOptions(locale === "ru" ? RU : EN);
  if (locale === "ru") {
    patchWrongReasons("geo-04", [
      "Позиция настолько важна, что отдельный расчёт SPR уже не нужен",
      "100bb уже задают короткую постфлоп-геометрию независимо от размера банка",
    ]);
  }
}
