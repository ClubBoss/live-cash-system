import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { navigatePracticalWithFallback } from "../lib/practical-navigation.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");

test("Practical Mastery navigation exposes one canonical home, one learning route, and reliable secondary tools", async () => {
  const nav = await read("components/PracticalMasteryNav.tsx");
  const layout = await read("app/mastery/layout.tsx");
  const navigationGuard = await read("components/PracticalNavigationGuard.tsx");
  for (const label of ["Главная", "Продолжить обучение", "Чтение стола", "После игры", "Справочник", "Реальные руки →"]) {
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
  assert.match(navigationGuard, /navigatePracticalWithFallback/);
  assert.match(navigationGuard, /router\.push\(href\)/);
  assert.match(navigationGuard, /window\.location\.assign\(destination\.href\)/);
  assert.match(navigationGuard, /clientMasteryRoutes\.has\(destination\.pathname\)/);
  for (const route of ["/mastery", "/mastery/journey", "/mastery/session", "/mastery/perception", "/mastery/study", "/mastery/reference"]) {
    assert.ok(navigationGuard.includes(`"${route}"`), `client navigation allowlist must include ${route}`);
  }
  assert.match(navigationGuard, /url\.pathname === "\/tools"/);
  assert.match(navigationGuard, /url\.searchParams\.get\("tab"\) === "field"/);
  assert.doesNotMatch(nav, /Старт обучения|Смешанная практика|Первый круг/);
});

test("Practical navigation falls back exactly once only when client routing throws synchronously", () => {
  const clientCalls = [];
  let hardCalls = 0;
  let observedError = null;
  const clientResult = navigatePracticalWithFallback(
    "/mastery/study",
    (href) => clientCalls.push(href),
    () => { hardCalls += 1; },
    (error) => { observedError = error; },
  );
  assert.equal(clientResult, "client");
  assert.deepEqual(clientCalls, ["/mastery/study"]);
  assert.equal(hardCalls, 0, "successful client routing must not trigger document navigation");
  assert.equal(observedError, null);

  const expectedError = new Error("synthetic client initiation failure");
  const fallbackResult = navigatePracticalWithFallback(
    "/mastery/reference",
    () => { throw expectedError; },
    () => { hardCalls += 1; },
    (error) => { observedError = error; },
  );
  assert.equal(fallbackResult, "document");
  assert.equal(hardCalls, 1, "failed client initiation must trigger one hard-navigation fallback");
  assert.equal(observedError, expectedError);
});

test("Quick Start teaches pot odds as a calculation and immediately contrasts a changed price", async () => {
  const anchors = await read("content/practical-mastery/anchors-w1.ts");
  const decisions = await read("content/practical-mastery/decisions-foundation-expansion.ts");
  const journey = await read("components/PracticalFirstJourneyExperience.tsx");
  assert.match(journey, /БЫСТРЫЙ СТАРТ/);
  assert.match(journey, /ГДЕ ЭТО НУЖНО/);
  assert.doesNotMatch(journey, /<textarea|Твой прогноз|СНАЧАЛА ПРОГНОЗ|ПОЧЕМУ СЕЙЧАС/);
  assert.match(anchors, /порог равен 2 \/ 4 = 50%/);
  assert.match(decisions, /1 \/ \(1 \+ 3\) = 25%/);
  assert.match(decisions, /Его 38% выше этого порога/);
});

test("learner presentation keeps provenance internal while preserving the source-ceiling product contract", async () => {
  const guard = await read("components/PracticalLearnerPresentationGuard.tsx");
  const firewall = await read("lib/learner-presentation-firewall.ts");
  const layout = await read("app/mastery/layout.tsx");
  const mastery = await read("components/PracticalMasteryExperience.tsx");
  const study = await read("components/PracticalStudyLoopExperience.tsx");
  assert.match(layout, /PracticalLearnerPresentationGuard/);
  assert.match(guard, /isLearnerMetadataOnlyLine/);
  assert.match(guard, /sanitizeLearnerPresentationText/);
  assert.match(firewall, /MIGRATION_HISTORY/);
  assert.match(guard, /legacyExactFallbacks/);
  assert.doesNotMatch(guard, /polishRussianLearnerText|cleanupSourceLanguage/);
  assert.match(guard, /element\.hidden = true/);
  assert.match(mastery, /ПОКА ЕСТЬ ОГРАНИЧЕНИЕ/);
  assert.match(mastery, /learnerReason/);
  assert.doesNotMatch(mastery, /gap\.reasonRu : gap\.reason/);
  assert.doesNotMatch(study, /sourceRefs\.join/);
  assert.doesNotMatch(study, /recommendedSkill\.id\}\s*·/);
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

test("clarity contract keeps source content clean and uses the shared post-render firewall only as fallback defense", async () => {
  const registry = await read("content/practical-mastery/registry.ts");
  const guard = await read("components/PracticalLearnerPresentationGuard.tsx");
  const firewall = await read("lib/learner-presentation-firewall.ts");
  const study = await read("components/PracticalStudyLoopExperience.tsx");
  const mastery = await read("components/PracticalMasteryExperience.tsx");
  const skillIds = [...registry.matchAll(/\bf\("([A-Z0-9-]+)"/g)].map((match) => match[1]);
  assert.ok(skillIds.length >= 80, `expected the full Practical graph, found only ${skillIds.length} skills`);
  assert.equal(new Set(skillIds).size, skillIds.length, "skill IDs must remain unique");
  assert.match(guard, /isLearnerMetadataOnlyLine/);
  assert.match(guard, /sanitizeLearnerPresentationText/);
  assert.match(firewall, /learnerPresentationLeakClasses|LearnerPresentationLeakClass/);
  assert.match(guard, /Learner teaching copy is authored in its source fields/);
  assert.doesNotMatch(guard, /polishRussianLearnerText|cleanupSourceLanguage/);
  assert.doesNotMatch(study, /sourceRefs\.join|skill\?\.id|FTGU E30/);
  assert.match(study, /recommendedSkill\.titleRu/);
  assert.match(mastery, /gap\.learnerReasonRu/);
});
