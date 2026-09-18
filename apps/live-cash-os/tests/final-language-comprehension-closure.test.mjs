import assert from "node:assert/strict";
import test from "node:test";

import {
  allPracticalTableStates,
  practicalDecisionById,
  practicalDecisions,
} from "../content/practical-mastery/index.ts";
import {
  practicalAssessmentExactReasonRepairs,
  practicalAssessmentLengthPresentedOptions,
  practicalAssessmentReasonRepairGroups,
} from "../lib/practical-assessment-length-presentation.ts";

function decision(id) {
  const value = practicalDecisionById.get(id);
  assert.ok(value, `${id}: decision missing`);
  return value;
}

function correctOption(d, kind) {
  const options = practicalAssessmentLengthPresentedOptions(d, kind, d[`${kind}Options`]);
  const correctId = kind === "action" ? d.correctActionId : d.correctReasonId;
  const option = options.find((candidate) => candidate.id === correctId);
  assert.ok(option, `${d.id}: presented correct ${kind} missing`);
  return option;
}

const A8_SKILLS = [
  "TURN-01", "TURN-02", "TURN-03", "TURN-04", "TURN-05",
  "RIV-01", "RIV-02", "RIV-03", "RIV-04", "RIV-05",
];

test("A8 202 cues are self-contained and A8 205/207 preserve the exact bilingual changed variable", () => {
  const cueNucleus202 = {
    "TURN-01": [/флоп.*бланк.*закрывающ.*дро/iu, /flop.*blank.*draw-completing/iu],
    "TURN-02": [/c-bet.*флоп/iu, /c-bet.*flop.*turn.*continuing range/iu],
    "TURN-03": [/чекнул флоп вдогонку.*сильн.*топ-пар/iu, /checked back the flop.*top-pair/iu],
    "TURN-04": [/коллировал.*флоп.*без позиции.*тёрн/iu, /called the flop.*OOP.*turn/iu],
    "TURN-05": [/рука средней силы.*тёрн.*худшие коллы.*рейз/iu, /medium-strength.*turn.*worse calls.*raising/iu],
    "RIV-01": [/ривере.*блеф-кетчеры.*вэлью/iu, /river.*bluff-catchers.*value/iu],
    "RIV-02": [/ривера.*промахнувшимися дро.*блокир/iu, /river.*missed draws.*block/iu],
    "RIV-03": [/ставк.*ривере.*блеф-кетчер.*предыдущая линия/iu, /river bet.*bluff-catcher.*prior line/iu],
    "RIV-04": [/блокирующ.*ставк.*ривере.*средней силы/iu, /river.*block bet.*medium-strength/iu],
    "RIV-05": [/недоблеф.*конкретной ветке.*соседним веткам/iu, /underbluffed river node.*neighboring branches/iu],
  };
  const nucleus205 = {
    "TURN-01": [/тёрн.*бланк.*закрывает.*дро/iu, /turn.*blank.*completes.*draw/iu],
    "TURN-02": [/баррель.*размер ставки.*малого.*крупный/iu, /turn barrel.*sizing.*small.*large/iu],
    "TURN-03": [/проб-бет.*размер.*малого.*крупный/iu, /probe.*size.*small.*large/iu],
    "TURN-04": [/лид.*мал.*крупн.*размер/iu, /lead.*small.*large.*size/iu],
    "TURN-05": [/размер.*тонк.*вэлью.*увелич/iu, /thin-value size.*increases/iu],
    "RIV-01": [/размер ставки.*вэлью.*увелич/iu, /river value size.*increases/iu],
    "RIV-02": [/крупн.*блеф.*ривере.*вместо малого/iu, /large river bluff.*instead of a small/iu],
    "RIV-03": [/ставка.*половины банка.*размера банка/iu, /bet.*half pot.*pot size/iu],
    "RIV-04": [/размер блокирующей ставки.*увелич/iu, /block-bet size increases/iu],
    "RIV-05": [/ветке ривера.*меняется размер ставки.*выборка/iu, /river node.*bet size changes.*sample/iu],
  };
  const nucleus207 = {
    "TURN-01": [/тёрн закрывает дро.*коллер/iu, /turn completes a draw.*caller/iu],
    "TURN-02": [/тёрн усиливает диапазон продолжения.*снижает фолд-эквити/iu, /turn strengthens.*continuing range.*reduces.*fold equity/iu],
    "TURN-03": [/тёрн возвращает.*двух пар.*стритов/iu, /turn restores.*two-pair.*straight/iu],
    "TURN-04": [/тёрн.*усиливает натсовую часть.*коллера/iu, /turn.*improves.*caller.*nut region/iu],
    "TURN-05": [/худшие коллы.*исчезают.*диапазон рейза/iu, /worse calls disappear.*raising region/iu],
    "RIV-01": [/крупного размера.*руками сильнее/iu, /large size.*hands better/iu],
    "RIV-02": [/блокирует.*рук.*фолдить.*разблокирует/iu, /blocks.*hands.*fold.*unblocks/iu],
    "RIV-03": [/цена колла.*та же.*удаляет.*дро/iu, /call price is unchanged.*removes.*draw/iu],
    "RIV-04": [/чаще рейзить.*небольшие ставки.*коллировать/iu, /raising small river bets.*calling tendencies/iu],
    "RIV-05": [/несколько повторяющихся наблюдений.*недоблефа.*соседние/iu, /repeated underbluff observations.*neighboring/iu],
  };

  for (const skill of A8_SKILLS) {
    for (const [suffix, nuclei] of [["202", cueNucleus202[skill]], ["205", nucleus205[skill]], ["207", nucleus207[skill]]]) {
      const d = decision(`PM-${skill}-A8-${suffix}`);
      assert.doesNotMatch(d.cueRu, /одно предыдущее действие|после этого изменения/iu, `${d.id}: generic RU referent returned`);
      assert.match(d.cueRu, nuclei[0], `${d.id}: RU changed-variable nucleus lost`);
      assert.match(d.cueEn, nuclei[1], `${d.id}: EN changed-variable nucleus lost`);
      assert.ok(d.changedVariables?.length || suffix === "202" || suffix === "205", `${d.id}: changed-variable metadata missing`);
      assert.equal(correctOption(d, "action").textEn, d.actionOptions.find((o) => o.id === d.correctActionId).textEn,
        `${d.id}: EN correct action mutated by presentation`);
    }
  }

  const turn02Changed = decision("PM-TURN-02-A8-207");
  assert.match(correctOption(turn02Changed, "action").textRu, /маргинальн.*блеф.*эквити.*блокер/iu);
  assert.match(correctOption(turn02Changed, "action").textEn, /marginal bluffs.*equity.*blocker/iu);
  assert.match(correctOption(turn02Changed, "reason").textRu, /усиление диапазона продолжения.*слаб.*блеф.*вэлью/iu);
  assert.match(correctOption(turn02Changed, "reason").textEn, /specific hand classes.*stronger continues.*value.*weak bluffs/iu);
});

test("decision-specific causal reasons replace skill-kind blanket reasons", () => {
  const guards = {
    "PM-B3-TURN02-104": [/класс руки изменился.*шоудаун.*чек.*EV/iu, /hand class changed.*showdown.*checking.*EV/iu],
    "PM-B4-TURN02-103": [/глубок.*будущий SPR.*дороже.*баррел/iu, /deep.*future SPR.*costly.*barrel/iu],
    "PM-TURN-02-FINAL-102": [/ветк.*уменьшают.*блеф.*той же цене.*диапазон продолжения/iu, /branch-specific.*bluff supply.*same price.*continuing range/iu],
    "PM-TURN-02-FINAL-104": [/вложенн.*невозвратн.*не эквити.*цен/iu, /invested chips.*sunk cost.*not equity.*price/iu],
    "PM-B4-RIV03-103": [/той же цене.*недоблеф.*запас блеф.*колл.*EV/iu, /same price.*underbluff.*bluff supply.*call.*EV/iu],
    "PM-B4-TURN02-101": [/будущ.*SPR.*фолд-эквити.*ривер.*EV/iu, /future SPR.*fold equity.*river.*EV/iu],
    "PM-B4-TURN02-102": [/глубок.*ошиб.*вэлью.*блеф/iu, /deep.*mistakes.*value.*bluffs/iu],
    "PM-B4-TURN02-104": [/глубин.*будущ.*вэлью.*блеф.*строж/iu, /depth.*future.*value.*bluffs.*strict/iu],
    "PM-TURN-02-FINAL-101": [/колл флопа.*отфильтровал.*рейзить тёрн/iu, /flop call.*filtered.*turn-raising/iu],
    "PM-TURN-02-FINAL-103": [/карта.*закрывающ.*дро.*сильн.*блеф/iu, /turn.*completes draws.*strong.*bluffs/iu],
    "PM-TURN-02-ETC-101": [/ремонтн.*пересч.*вэлью.*фолд-эквити.*агресс/iu, /range-repairing.*recomputation.*value.*fold-equity.*aggression/iu],
    "PM-TURN-02-ETC-102": [/бланк.*не создаёт.*худш.*колл.*фолд/iu, /blank.*creates neither.*value calls.*folds/iu],
    "PM-RIV-03-C0-201": [/широк.*старт.*воздух.*ривер.*линии/iu, /wide starting range.*air.*river.*line/iu],
    "PM-RIV-03-C0-202": [/разномаст.*стартов.*блеф.*ривер/iu, /offsuit.*starting combinations.*bluff.*river/iu],
    "PM-RIV-03-C0-205": [/BTN.*тайтов.*уменьш.*воздух.*линии/iu, /BTN.*tight.*reduces.*air.*line/iu],
    "PM-RIV-03-C0-207": [/широк.*исходн.*воздух.*линия.*переблеф/iu, /wide origin.*air.*line.*overbluff/iu],
    "PM-B4-RIV03-104": [/рид.*подтвержд.*ветк.*сайзинг.*лини.*реконструк/iu, /read.*evidenced branch.*size.*line.*reconstruction/iu],
  };
  const oldGeneric = /Текущий узел зависит от предыдущей линии|Геометрия живой игры меняет|Отклонение от базовой стратегии должно/iu;
  for (const [id, [ru, en]] of Object.entries(guards)) {
    const d = decision(id);
    const reason = correctOption(d, "reason");
    assert.match(reason.textRu, ru, `${id}: RU exact causal nucleus lost`);
    assert.match(reason.textEn, en, `${id}: EN exact causal nucleus lost`);
    assert.doesNotMatch(reason.textRu, oldGeneric, `${id}: generic cluster reason returned`);
  }
});

test("RIV-03 C0-208 keeps explicit no/boundary polarity", () => {
  const d = decision("PM-RIV-03-C0-208");
  const action = correctOption(d, "action");
  const reason = correctOption(d, "reason");
  assert.match(action.textRu, /^Нет\s.*тайтов.*исходн.*блеф.*не заменяет.*линии/iu);
  assert.match(reason.textRu, /тайтов.*уменьш.*запас блеф.*не доказывает/iu);
  assert.match(reason.textRu, /после всей линии.*перечисл.*правдоподобн.*блеф/iu);
  assert.match(reason.textRu, /цен.*блокер/iu);
  assert.match(reason.textEn, /tight origin.*reduce.*bluff supply.*does not prove.*enumerated.*line.*price.*blocker/iu);
});

test("A8/A9/A10 correct reasons are semantic-family specific, not cluster-wide templates", () => {
  const forbidden = new Set([
    "Текущий узел зависит от предыдущей линии, сохранившихся диапазонов и цены, а не только от ярлыка ситуации",
    "Геометрия живой игры меняет доступные ветки и их ценность, даже когда карты игрока те же",
    "Отклонение от базовой стратегии должно быть привязано к конкретной ветке и силе повторяющихся наблюдений",
    "The current node depends on ancestry, surviving ranges, and price rather than the situation label alone",
    "Live geometry changes the available branches and their EV even when Hero's cards stay the same",
    "An exploit should stay scoped to the exact branch and the strength of repeated evidence",
  ]);
  const expectations = { A8: 10, A9: 7, A10: 5 };
  for (const [cluster, expectedFamilies] of Object.entries(expectations)) {
    const rows = practicalDecisions.filter((d) => d.learnerEligibility !== "INTERNAL_ONLY" && d.id.includes(`-${cluster}-`));
    const bySkill = new Map();
    for (const d of rows) {
      const reason = correctOption(d, "reason");
      assert.equal(forbidden.has(reason.textRu), false, `${d.id}: old RU cluster template returned`);
      assert.equal(forbidden.has(reason.textEn), false, `${d.id}: old EN cluster template returned`);
      const set = bySkill.get(d.skillId) ?? new Set();
      set.add(`${reason.textRu}\u0000${reason.textEn}`);
      bySkill.set(d.skillId, set);
    }
    assert.equal(bySkill.size, expectedFamilies, `${cluster}: semantic-family count drifted`);
    assert.ok(new Set([...bySkill.values()].flatMap((set) => [...set])).size >= expectedFamilies,
      `${cluster}: correct reasons collapsed across semantic families`);
  }
});

test("deep-stack reason groups retain depth/price/position -> realization/risk -> EV/action bridges", () => {
  const groups = {
    B4_PF06: [
      /250.*300bb.*без позиции.*реализовать эквити.*доминир.*EV.*3-бет/iu,
      /250.*300bb.*out of position.*realize.*dominated.*EV.*3-bet/iu,
    ],
    B4_PF07: [
      /крупн.*3-бет.*цен.*глубок.*решени.*реализац.*EV.*колл.*4-бет.*фолд/iu,
      /large 3-bet.*price.*deep.*future decisions.*realization.*EV.*calling.*4-betting.*folding/iu,
    ],
    B4_OOP02: [
      /цен.*флоп.*глубок.*без позиции.*реализац.*доминир.*обратн.*EV/iu,
      /flop price.*deep.*out of position.*realization.*dominated.*reverse-implied.*EV/iu,
    ],
  };
  for (const [label, [ru, en]] of Object.entries(groups)) {
    const group = practicalAssessmentReasonRepairGroups.find((candidate) => candidate.label === label);
    assert.ok(group, `${label}: reason group missing`);
    assert.equal(group.decisionIds.length, 4, `${label}: expected four reviewed rows`);
    assert.match(group.presented.textRu, ru, `${label}: RU causal bridge incomplete`);
    assert.match(group.presented.textEn, en, `${label}: EN causal bridge incomplete`);
  }
});

test("BL-06..09 104..108 use decision-specific changed/boundary reasons", () => {
  for (const skill of ["06", "07", "08", "09"]) {
    const ids = ["104", "105", "106", "107", "108"].map((suffix) => `PM-BL-${skill}-B1-${suffix}`);
    const reasons = ids.map((id) => correctOption(decision(id), "reason"));
    assert.equal(new Set(reasons.map((r) => r.textRu)).size, 5, `BL-${skill}: RU 104..108 collapsed to a family reason`);
    assert.equal(new Set(reasons.map((r) => r.textEn)).size, 5, `BL-${skill}: EN 104..108 collapsed to a family reason`);
    for (const id of ids) {
      assert.ok(practicalAssessmentExactReasonRepairs[id], `${id}: exact reviewed reason not registered`);
    }
  }
  assert.match(correctOption(decision("PM-BL-07-B1-106"), "reason").textRu, /крупн.*опен.*цен.*реализац.*суж/iu);
  assert.match(correctOption(decision("PM-BL-08-B1-106"), "reason").textRu, /лимп-коллир.*фолд-эквити.*колл.*рейз.*EV/iu);
  assert.match(correctOption(decision("PM-BL-09-B1-106"), "reason").textRu, /крупн.*вэлью.*цена.*доминир.*суз/iu);
  assert.match(correctOption(decision("PM-BL-06-B1-108"), "reason").textRu, /не сводится.*рейз или фолд.*колл.*диапазон.*цен/iu);
});

test("language cleanup removes source IDs and RU perceptual English-history fallback without touching sourceRefs", () => {
  const sourceId = /\b(?:FTGU|SLC|LCM|CINJ|CP)-[A-Z0-9-]+\b/u;
  for (const d of practicalDecisions.filter((candidate) => candidate.learnerEligibility !== "INTERNAL_ONLY")) {
    assert.doesNotMatch(d.explanationRu, sourceId, `${d.id}: internal source id leaked into RU explanation`);
    assert.doesNotMatch(d.explanationEn, sourceId, `${d.id}: internal source id leaked into EN explanation`);
  }
  assert.deepEqual(decision("PM-4BP-03-001").sourceRefs, ["CP-G3-L10"], "source authority metadata mutated");
  assert.deepEqual(decision("PM-TURN-02-FINAL-104").sourceRefs, ["FTGU-E21", "SLC-TURN-BARREL"], "source authority metadata mutated");

  const bareEnglishAction = /\b(?:opens?|calls?|checks?|bets?|folds?|acts?|active|behind|effective|same pot type|no straddle)\b/iu;
  for (const state of allPracticalTableStates) {
    assert.ok(state.actionsRu, `${state.decisionId}: RU action history missing`);
    assert.equal(state.actionsRu.length, state.actions.length, `${state.decisionId}: RU action history length mismatch`);
    for (const line of state.actionsRu) {
      assert.doesNotMatch(line, bareEnglishAction, `${state.decisionId}: English action-history fallback remains: ${line}`);
    }
  }
});

test("touched presentation preserves answer IDs and misconception identity", () => {
  const ids = new Set([
    ...A8_SKILLS.flatMap((skill) => ["202", "205", "207"].map((suffix) => `PM-${skill}-A8-${suffix}`)),
    "PM-B3-TURN02-104", "PM-B4-TURN02-101", "PM-B4-TURN02-102", "PM-B4-TURN02-103", "PM-B4-TURN02-104",
    "PM-B4-RIV03-103", "PM-B4-RIV03-104",
    "PM-TURN-02-FINAL-101", "PM-TURN-02-FINAL-102", "PM-TURN-02-FINAL-103", "PM-TURN-02-FINAL-104",
    "PM-TURN-02-ETC-101", "PM-TURN-02-ETC-102",
    "PM-RIV-03-C0-201", "PM-RIV-03-C0-202", "PM-RIV-03-C0-205", "PM-RIV-03-C0-207", "PM-RIV-03-C0-208",
    ...["06", "07", "08", "09"].flatMap((skill) => ["104", "105", "106", "107", "108"].map((suffix) => `PM-BL-${skill}-B1-${suffix}`)),
    "PM-4BP-03-001",
  ]);
  for (const id of ids) {
    const d = decision(id);
    for (const kind of ["action", "reason"]) {
      const canonical = d[`${kind}Options`];
      const presented = practicalAssessmentLengthPresentedOptions(d, kind, canonical);
      assert.deepEqual(presented.map((o) => o.id), canonical.map((o) => o.id), `${id}: ${kind} option ids mutated`);
      for (const option of canonical) {
        const shown = presented.find((candidate) => candidate.id === option.id);
        assert.equal(shown?.misconception, option.misconception, `${id}/${option.id}: misconception identity mutated`);
      }
    }
  }
});

test("PM-4BP-03-001 RU is grammatical learner language rather than hybrid developer register", () => {
  const d = decision("PM-4BP-03-001");
  const allRu = [
    d.cueRu, d.questionRu, d.explanationRu,
    ...d.actionOptions.map((o) => o.textRu),
    ...d.reasonOptions.map((o) => o.textRu),
  ].join(" ");
  assert.doesNotMatch(allRu, /\b(?:automatic|thinking|checking|source-supported|credible|strong hands|bet)\b/iu);
  assert.match(d.questionRu, /Должен ли диапазон чека оставаться защищённым/iu);
  assert.match(correctOption(d, "reason").textRu, /сильные продолжения.*чека.*капнут/iu);
});
