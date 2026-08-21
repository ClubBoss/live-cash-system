import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFile(path.join(root, relative), "utf8");

test("canonical product exposes Practical Mastery without removing the hardened legacy shell", async () => {
  const page = await read("app/page.tsx");
  const gateway = await read("components/PracticalMasteryGateway.tsx");
  assert.match(page, /PracticalMasteryGateway/);
  assert.match(page, /<PracticalMasteryGateway \/>[\s\S]*<LiveCashApp \/>/);
  assert.match(gateway, /href="\/mastery\/journey"/);
  assert.match(gateway, /Primary learning|Основное обучение|Primary route|Основной маршрут/);
});

test("every Practical Mastery route inherits the same test-invite boundary and shared navigation", async () => {
  const layout = await read("app/mastery/layout.tsx");
  const nav = await read("components/PracticalMasteryNav.tsx");
  assert.match(layout, /TestInviteGate/);
  assert.match(layout, /<TestInviteGate>/);
  assert.match(layout, /PracticalMasteryNav/);
  assert.match(nav, /href=\{item\.href\}/, "shared mastery navigation must render the declared route inventory");
  assert.match(nav, /aria-current=\{active \? "page" : undefined\}/, "shared mastery navigation must expose the current section");
  for (const route of ["/mastery", "/mastery/journey", "/mastery/session", "/mastery/perception", "/mastery/study", "/mastery/reference"]) {
    assert.ok(nav.includes(`href: "${route}"`), `${route} must remain declared in the shared mastery navigation`);
  }
  assert.match(nav, /Карта навыков/);
  assert.match(nav, /Старт обучения/);
  assert.match(nav, /Практика/);
  assert.match(nav, /Чтение стола/);
  assert.match(nav, /После игры/);
  assert.match(nav, /Справочник/);
});

test("release gate now carries dedicated Practical Mastery browser evidence", async () => {
  const pkg = await read("package.json");
  const acceptance = await read("e2e/practical-mastery-acceptance.spec.mjs");
  const access = await read("e2e/practical-mastery-access.spec.mjs");
  assert.match(pkg, /test:e2e:mastery-cross/);
  assert.match(pkg, /practical-mastery-access\.spec\.mjs/);
  for (const route of ["/mastery", "/mastery/journey", "/mastery/session", "/mastery/perception", "/mastery/study", "/mastery/reference"]) assert.ok(acceptance.includes(route), `${route} must be browser-covered`);
  assert.match(acceptance, /390, height: 844/);
  assert.match(acceptance, /rootSchema: root\.schemaVersion/);
  assert.match(acceptance, /practicalSchema: root\._practicalProfile\?\.mastery\?\.schemaVersion/);
  assert.match(acceptance, /ОГРАНИЧЕНИЕ ИСТОЧНИКА/);
  assert.match(acceptance, /недостаточно, чтобы честно задавать точные частоты/i);
  assert.match(access, /Вход для тестирования/);
});
