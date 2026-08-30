import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");

test("canonical product cuts root over to Practical learning while preserving the hardened legacy shell under secondary tools", async () => {
  const page = await read("app/page.tsx");
  const tools = await read("app/tools/page.tsx");
  const supportingTools = await read("components/SupportingToolsApp.tsx");
  const supportRouting = await read("lib/support-tools-routing.ts");
  const nextLearning = await read("components/PracticalNextLearningLink.tsx");
  const journey = await read("components/PracticalFirstJourneyExperience.tsx");
  assert.match(page, /redirect\("\/mastery\/journey"\)/);
  assert.doesNotMatch(page, /LiveCashApp|PracticalMasteryGateway/);
  assert.match(tools, /<TestInviteGate>/);
  assert.match(tools, /<SupportingToolsApp \/>/);
  assert.match(supportingTools, /resolveToolsRuntime\(/);
  assert.match(supportRouting, /input\.legacyToolsMode && params\.get\("legacy"\) === "1"/);
  assert.match(supportingTools, /<LiveCashApp \/>/);
  assert.match(supportingTools, /<LegacyToolDeepLink \/>/);
  assert.match(supportingTools, /<Wave7FieldPanel/);
  assert.match(supportingTools, /<DataSafetyPanel/);
  assert.match(nextLearning, /href="\/mastery\/journey"/);
  assert.match(nextLearning, /isIntegratedFocusAdmissible/);
  assert.match(nextLearning, /usePracticalProfileState/);
  assert.doesNotMatch(nextLearning, /recommendNextPracticalSkill|useReliableLearnerState|firstJourneyProgress|localStorage|setMasteryWithPerformance|setMastery\(/, "shared navigation may read canonical mastery for admissibility but must not create another recommendation, persistence, or mutation authority");
  assert.match(journey, /href="\/mastery\/journey\?continue=1"/);
  assert.match(journey, /Быстрый старт завершён|Quick start complete/);
});

test("every Practical Mastery route inherits the invite boundary while shared navigation separates learning from tools", async () => {
  const layout = await read("app/mastery/layout.tsx");
  const nav = await read("components/PracticalMasteryNav.tsx");
  const nextLearning = await read("components/PracticalNextLearningLink.tsx");
  assert.match(layout, /TestInviteGate/);
  assert.match(layout, /<TestInviteGate>/);
  assert.match(layout, /PracticalMasteryNav/);
  assert.match(nav, /PracticalNextLearningLink/);
  assert.match(nav, /ariaCurrent=\{learningActive \? "page" : undefined\}/);
  assert.match(nav, /aria-current=\{active \? "page" : undefined\}/);
  assert.match(nav, /href="\/mastery"/);
  assert.match(nav, /homeActive = pathname === "\/mastery"/);
  assert.match(nav, /href="\/tools\?tab=field"/);
  for (const route of ["/mastery/perception", "/mastery/study", "/mastery/reference"]) {
    assert.ok(nav.includes(`href: "${route}"`), `${route} must remain declared as a supporting tool route`);
  }
  assert.match(nextLearning, /href="\/mastery\/journey"/);
  for (const label of ["Главная", "Продолжить обучение", "Чтение стола", "После игры", "Справочник"]) assert.match(nav, new RegExp(label));
  assert.doesNotMatch(nav, />Карта</);
  assert.doesNotMatch(nav, /Старт обучения|Смешанная практика/);
});

test("release gate carries dedicated Practical Mastery browser evidence", async () => {
  const pkg = await read("package.json");
  const waveC = await read("scripts/run-wave-c-cross.mjs");
  const acceptance = await read("e2e/practical-mastery-acceptance.spec.mjs");
  const clarity = await read("e2e/practical-mastery-ux-clarity.spec.mjs");
  const access = await read("e2e/practical-mastery-access.spec.mjs");
  assert.match(pkg, /test:e2e:mastery-cross/);
  assert.match(pkg, /node scripts\/run-wave-c-cross\.mjs/);
  for (const project of ["w8-chromium-desktop", "w8-webkit-390", "w8-chromium-android"]) {
    assert.ok(waveC.includes(`"${project}"`), `${project} must remain in isolated Wave C coverage`);
  }
  for (const spec of ["post-tester-access-mobile.spec.mjs", "post-tester-sync-performance.spec.mjs", "practical-mastery-access.spec.mjs"]) {
    assert.ok(waveC.includes(`e2e/${spec}`), `${spec} must remain in isolated Wave C coverage`);
  }
  assert.match(waveC, /--config=playwright\.cross-browser\.config\.mjs/);
  assert.match(waveC, /--project=\$\{project\}/);
  assert.match(waveC, /if \(result\.status !== 0\) process\.exit/);
  for (const route of ["/mastery", "/mastery/journey", "/mastery/session", "/mastery/perception", "/mastery/study", "/mastery/reference"]) assert.ok(acceptance.includes(route), `${route} must be browser-covered`);
  assert.match(acceptance, /390, height: 844/);
  assert.match(acceptance, /rootSchema: root\.schemaVersion/);
  assert.match(acceptance, /practicalSchema: root\._practicalProfile\?\.mastery\?\.schemaVersion/);
  assert.match(acceptance, /ПОКА ЕСТЬ ОГРАНИЧЕНИЕ/);
  assert.match(acceptance, /недостаточно, чтобы честно задавать точные частоты/i);
  assert.match(clarity, /textarea/);
  assert.match(clarity, /пот-оддсы 1:2/);
  assert.match(access, /Вход для тестирования/);
});
