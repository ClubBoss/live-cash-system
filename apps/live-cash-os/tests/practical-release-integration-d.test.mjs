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
  const nextLearning = await read("components/PracticalNextLearningLink.tsx");
  const journey = await read("components/PracticalFirstJourneyExperience.tsx");
  assert.match(page, /redirect\("\/mastery\/journey"\)/);
  assert.doesNotMatch(page, /LiveCashApp|PracticalMasteryGateway/);
  assert.match(tools, /<TestInviteGate>/);
  assert.match(tools, /<LiveCashApp \/>/);
  assert.match(tools, /<LegacyToolDeepLink \/>/);
  assert.match(nextLearning, /href="\/mastery\/journey"/);
  assert.doesNotMatch(nextLearning, /usePracticalProfileState|useReliableLearnerState|firstJourneyProgress/, "shared navigation must not create another learner-state sync owner");
  assert.match(journey, /href="\/mastery\/session"/);
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
  for (const label of ["Главная", "Учиться", "Чтение стола", "После игры", "Справочник"]) assert.match(nav, new RegExp(label));
  assert.doesNotMatch(nav, />Карта</);
  assert.doesNotMatch(nav, /Старт обучения|Смешанная практика/);
});

test("release gate carries dedicated Practical Mastery browser evidence", async () => {
  const pkg = await read("package.json");
  const acceptance = await read("e2e/practical-mastery-acceptance.spec.mjs");
  const clarity = await read("e2e/practical-mastery-ux-clarity.spec.mjs");
  const access = await read("e2e/practical-mastery-access.spec.mjs");
  assert.match(pkg, /test:e2e:mastery-cross/);
  assert.match(pkg, /practical-mastery-access\.spec\.mjs/);
  for (const route of ["/mastery", "/mastery/journey", "/mastery/session", "/mastery/perception", "/mastery/study", "/mastery/reference"]) assert.ok(acceptance.includes(route), `${route} must be browser-covered`);
  assert.match(acceptance, /390, height: 844/);
  assert.match(acceptance, /rootSchema: root\.schemaVersion/);
  assert.match(acceptance, /practicalSchema: root\._practicalProfile\?\.mastery\?\.schemaVersion/);
  assert.match(acceptance, /ПОКА ЕСТЬ ОГРАНИЧЕНИЕ/);
  assert.match(acceptance, /недостаточно, чтобы честно задавать точные частоты/i);
  assert.match(clarity, /textarea/);
  assert.match(clarity, /33,3%/);
  assert.match(access, /Вход для тестирования/);
});
