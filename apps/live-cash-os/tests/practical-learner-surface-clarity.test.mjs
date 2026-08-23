import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");

test("Practical Mastery navigation exposes one canonical home, one learning route, and reliable secondary tools", async () => {
  const nav = await read("components/PracticalMasteryNav.tsx");
  const layout = await read("app/mastery/layout.tsx");
  const navigationGuard = await read("components/PracticalNavigationGuard.tsx");
  for (const label of ["Главная", "Учиться", "Чтение стола", "После игры", "Справочник", "Реальные руки →"]) {
    assert.match(nav, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(nav, /href="\/mastery"/);
  assert.doesNotMatch(nav, /ru: "Карта"/);
  assert.match(nav, /PracticalNextLearningLink/);
  assert.match(nav, /usePathname/);
  assert.match(nav, /ariaCurrent=\{learningActive \? "page" : undefined\}/);
  assert.match(nav, /aria-current=\{active \? "page" : undefined\}/);
  assert.match(nav, /href="\/tools\?tab=field"/);
  assert.match(layout, /PracticalNavigationGuard/);
  assert.match(navigationGuard, /useRouter/);
  assert.match(navigationGuard, /router\.push\(nextHref\)/);
  assert.match(navigationGuard, /window\.location\.assign\(destination\.href\)/);
  assert.match(navigationGuard, /clientMasteryRoutes\.has\(destination\.pathname\)/);
  for (const route of ["/mastery", "/mastery/journey", "/mastery/session", "/mastery/perception", "/mastery/study", "/mastery/reference"]) {
    assert.ok(navigationGuard.includes(`"${route}"`), `client navigation allowlist must include ${route}`);
  }
  assert.match(navigationGuard, /url\.pathname === "\/tools"/);
  assert.match(navigationGuard, /url\.searchParams\.get\("tab"\) === "field"/);
  assert.doesNotMatch(nav, /Старт обучения|Смешанная практика|Первый круг/);
});

test("Quick Start teaches pot odds as a calculation and immediately contrasts a changed price", async () => {
  const guard = await read("components/PracticalLearnerPresentationGuard.tsx");
  const journey = await read("components/PracticalFirstJourneyExperience.tsx");
  assert.match(journey, /БЫСТРЫЙ СТАРТ/);
  assert.match(journey, /ГДЕ ЭТО НУЖНО/);
  assert.doesNotMatch(journey, /<textarea|Твой прогноз|СНАЧАЛА ПРОГНОЗ|ПОЧЕМУ СЕЙЧАС/);
  assert.match(guard, /1 \/ \(2 \+ 1\) = 33,3%/);
  assert.match(guard, /2 \/ \(2 \+ 2\) = 50%/);
  assert.match(guard, /порог вырос с 33,3% до 50%/);
});

test("learner presentation keeps provenance internal while preserving the source-ceiling product contract", async () => {
  const guard = await read("components/PracticalLearnerPresentationGuard.tsx");
  const layout = await read("app/mastery/layout.tsx");
  const mastery = await read("components/PracticalMasteryExperience.tsx");
  assert.match(layout, /PracticalLearnerPresentationGuard/);
  assert.match(guard, /sourceLinePattern/);
  assert.match(guard, /sourceIdPattern/);
  assert.match(guard, /polishRussianLearnerText/);
  assert.match(guard, /element\.hidden = true/);
  assert.match(mastery, /ПОКА ЕСТЬ ОГРАНИЧЕНИЕ/);
  assert.doesNotMatch(mastery, /sourceRefs\.join/);
});

test("skill map presents poker domains and progress instead of internal graph IDs and corpus counts", async () => {
  const mastery = await read("components/PracticalMasteryExperience.tsx");
  const overview = await read("components/PracticalSkillDomainOverview.tsx");
  for (const label of ["База решений", "Префлоп", "Блайнды", "3-бет-банки", "Ривер", "Интеграция"]) assert.match(mastery, new RegExp(label));
  assert.match(mastery, /сохранились после паузы/);
  assert.match(mastery, /применены в реальных руках/);
  assert.match(overview, /Прогресс по игровым направлениям/);
  assert.match(overview, /DECISION_TRAINED/);
  assert.doesNotMatch(mastery, /practicalSkillCorpusStats|scored decisions|Corpus: R/);
  assert.doesNotMatch(mastery, />\{item\.id\}/);
});

test("clarity guard covers the full practical graph with generic source-language cleanup rather than one-card patches", async () => {
  const registry = await read("content/practical-mastery/registry.ts");
  const guard = await read("components/PracticalLearnerPresentationGuard.tsx");
  const skillIds = [...registry.matchAll(/\bf\("([A-Z0-9-]+)"/g)].map((match) => match[1]);
  assert.ok(skillIds.length >= 80, `expected the full Practical graph, found only ${skillIds.length} skills`);
  assert.equal(new Set(skillIds).size, skillIds.length, "skill IDs must remain unique");
  assert.match(guard, /sourceIdPattern/);
  assert.match(guard, /polishRussianLearnerText/);
  for (const token of ["FTGU", "source", "ranges?", "OOP"]) assert.ok(guard.includes(token), `generic cleanup must cover ${token}`);
});
