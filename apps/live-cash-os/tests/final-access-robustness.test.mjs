import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const gatePath = new URL("../components/TestInviteGate.tsx", import.meta.url);
const smokePath = new URL("../scripts/production-smoke.mjs", import.meta.url);

test("test invite verification is bounded, fail-closed, and retryable", async () => {
  const source = await readFile(gatePath, "utf8");

  assert.match(source, /const INVITE_CHECK_TIMEOUT_MS = 10_000;/);
  assert.match(source, /new AbortController\(\)/);
  assert.match(source, /signal:\s*controller\.signal/);
  assert.match(source, /controller\.abort\(\)/);
  assert.match(source, /clearTimeout\(timeout\)/);
  assert.match(source, /SERVICE_UNAVAILABLE/);
  assert.match(source, /OFFLINE/);
  assert.match(source, /retry:\s*"Повторить проверку"/);
  assert.match(source, /retry:\s*"Retry verification"/);
  assert.match(source, /status === "SERVICE_UNAVAILABLE" \|\| status === "OFFLINE"/);

  assert.doesNotMatch(source, /universal.*bypass/i);
  assert.doesNotMatch(source, /LCO-[A-Z0-9_-]{20,80}["']/);
});

test("deployment smoke asserts current canonical Practical and Data Recovery surfaces", async () => {
  const source = await readFile(smokePath, "utf8");

  assert.match(source, /Продолжить обучение/);
  assert.match(source, /Continue learning/);
  assert.match(source, /generic Continue learning must target \/mastery\/journey/);
  assert.match(source, /\/tools\?tab=data/);
  assert.match(source, /Данные и восстановление/);
  assert.match(source, /Data & Recovery/);
  assert.match(source, /viewport: \{ width: 390, height: 844 \}/);

  assert.doesNotMatch(source, /\["Сегодня", "Учиться", "Повтор", "Карточки", "Карта"/);
  assert.doesNotMatch(source, /openGoldLesson/);
});
