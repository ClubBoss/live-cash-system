import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");

test("Practical Mastery navigation exposes one primary learning route plus secondary tools", async () => {
  const nav = await read("components/PracticalMasteryNav.tsx");
  for (const label of ["Учиться", "Карта", "Чтение стола", "После игры", "Справочник", "Реальные руки →"]) {
    assert.match(nav, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(nav, /PracticalNextLearningLink/);
  assert.match(nav, /usePathname/);
  assert.match(nav, /ariaCurrent=\{learningActive \? "page" : undefined\}/);
  assert.match(nav, /aria-current=\{active \? "page" : undefined\}/);
  assert.match(nav, /href="\/\?tab=field"/);
  assert.doesNotMatch(nav, /Старт обучения|Смешанная практика|Первый круг/);
});

test("Quick Start teaches before scored practice instead of collecting unscored free text", async () => {
  const journey = await read("components/PracticalFirstJourneyExperience.tsx");
  const route = await read("content/practical-mastery/first-journey.ts");
  assert.match(journey, /БЫСТРЫЙ СТАРТ/);
  assert.match(journey, /ГДЕ ЭТО НУЖНО/);
  assert.match(journey, /Проверить на примере/);
  assert.doesNotMatch(journey, /<textarea|Твой прогноз|СНАЧАЛА ПРОГНОЗ|ПОЧЕМУ СЕЙЧАС/);
  assert.match(route, /tableUseRu/);
  assert.match(route, /минимальную equity/);
});

test("learner presentation keeps provenance internal while preserving the source-ceiling product contract", async () => {
  const guard = await read("components/PracticalLearnerPresentationGuard.tsx");
  const layout = await read("app/mastery/layout.tsx");
  const mastery = await read("components/PracticalMasteryExperience.tsx");

  assert.match(layout, /PracticalLearnerPresentationGuard/);
  assert.match(guard, /sourceLinePattern/);
  assert.match(guard, /FTGU-E/);
  assert.match(guard, /SLC-M/);
  assert.match(guard, /LCM-/);
  assert.match(guard, /CP-G/);
  assert.match(guard, /element\.hidden = true/);
  assert.match(mastery, /ПОКА ЕСТЬ ОГРАНИЧЕНИЕ/);
  assert.doesNotMatch(mastery, /sourceRefs\.join/);
});

test("skill map presents poker domains and progress instead of internal graph IDs and corpus counts", async () => {
  const mastery = await read("components/PracticalMasteryExperience.tsx");
  for (const label of ["База решений", "Префлоп", "Блайнды", "3-бет-банки", "Ривер", "Интеграция"]) assert.match(mastery, new RegExp(label));
  assert.match(mastery, /сохранились после паузы/);
  assert.match(mastery, /применены в реальных руках/);
  assert.doesNotMatch(mastery, /practicalSkillCorpusStats|scored decisions|Corpus: R/);
  assert.doesNotMatch(mastery, />\{item\.id\}/);
});

test("foundation pot-odds presentation teaches calculation plus changed-price transfer", async () => {
  const guard = await read("components/PracticalLearnerPresentationGuard.tsx");
  assert.match(guard, /1 \/ \(2 \+ 1\) = 33,3%/);
  assert.match(guard, /2 \/ \(2 \+ 2\) = 50%/);
  assert.match(guard, /порог вырос с 33,3% до 50%/);
  assert.match(guard, /break-even threshold/);
  assert.doesNotMatch(guard, /replacement intentionally omitted/);
});

test("clarity guard covers the full practical graph rather than a one-card patch", async () => {
  const registry = await read("content/practical-mastery/registry.ts");
  const guard = await read("components/PracticalLearnerPresentationGuard.tsx");
  const skillIds = [...registry.matchAll(/\bf\("([A-Z0-9-]+)"/g)].map((match) => match[1]);
  assert.ok(skillIds.length >= 80, `expected the full Practical graph, found only ${skillIds.length} skills`);
  assert.equal(new Set(skillIds).size, skillIds.length, "skill IDs must remain unique");

  for (const sourceCentricPhrase of [
    "Какие две основные причины FTGU даёт для IP cold-call?",
    "Какой simplified flop plan source поддерживает",
    "Какой practical simplification source предлагает",
    "Source поддерживает exploitative overfold",
  ]) {
    assert.match(guard, new RegExp(sourceCentricPhrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
  }
});
