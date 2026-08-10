import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [gate, activeLearningCss, stateRoute, manifestRaw, packageRaw] = await Promise.all([
  readFile(new URL("../components/TestInviteGate.tsx", import.meta.url), "utf8"),
  readFile(new URL("../app/active-learning.css", import.meta.url), "utf8"),
  readFile(new URL("../app/api/state/route.ts", import.meta.url), "utf8"),
  readFile(new URL("../content/i18n/editorial-manifest.json", import.meta.url), "utf8"),
  readFile(new URL("../package.json", import.meta.url), "utf8"),
]);
const manifest = JSON.parse(manifestRaw);
const packageJson = JSON.parse(packageRaw);

test("Wave C invite gate uses typed client truth without weakening auth", () => {
  assert.match(gate, /type InviteCheckResult = "VALID" \| "INVALID" \| "OFFLINE" \| "SERVICE_UNAVAILABLE"/);
  assert.match(gate, /const CODE_PATTERN = \/\^LCO-\[A-Z0-9_-\]\{20,80\}\$\//);
  assert.match(gate, /if \(!CODE_PATTERN\.test\(code\)\) return "INVALID"/);
  assert.match(gate, /if \(response\.ok\) return "VALID"/);
  assert.match(gate, /if \(response\.status === 401\) return "INVALID"/);
  assert.match(gate, /return "SERVICE_UNAVAILABLE"/);
  assert.match(gate, /return navigator\.onLine \? "SERVICE_UNAVAILABLE" : "OFFLINE"/);
  assert.match(gate, /if \(checkingRef\.current\) return/);
  assert.match(gate, /disabled=\{status === "CHECKING"\}/);
  assert.doesNotMatch(gate, /console\.(?:log|info|warn|error)/);
  assert.doesNotMatch(gate, /removeItem\(PORTABLE_PROFILE_KEY\)/);

  assert.match(stateRoute, /const PORTABLE_PROFILE_PATTERN = \/\^LCO-\[A-Z0-9_-\]\{20,80\}\$\//);
  assert.match(stateRoute, /return portable && await activeTestInvite\(portable\) \? portable\.userId : null/);
  assert.match(stateRoute, /code: "AUTH_REQUIRED" \}, 401/);
  assert.match(stateRoute, /code: "CLOUD_STORAGE_UNAVAILABLE" \}, 503/);
});

test("Wave C gate persists the existing locale identity without touching learner state", () => {
  assert.match(gate, /const LOCALE_KEY = "live-cash-os:locale"/);
  assert.match(gate, /localStorage\.setItem\(LOCALE_KEY, locale\)/);
  assert.match(gate, /document\.documentElement\.lang = nextLocale/);
  assert.match(gate, /aria-pressed=\{locale === "ru"\}/);
  assert.match(gate, /aria-pressed=\{locale === "en"\}/);
  assert.match(gate, /Код не найден или отключён\. Проверьте его и попробуйте ещё раз\./);
  assert.match(gate, /Нет подключения к интернету\. Подключитесь к сети, чтобы проверить код доступа\./);
  assert.match(gate, /Сервис проверки временно недоступен\. Код может быть корректным — попробуйте ещё раз чуть позже\./);
  assert.doesNotMatch(gate, /live-cash-os:learner-state/);
  assert.equal(packageJson.version, "1.2.0");
});

test("Wave C mobile answer density is presentation-only and preserves 48px targets", () => {
  const mobile = activeLearningCss.slice(activeLearningCss.indexOf("@media (max-width: 520px)"));
  assert.match(mobile, /\.session \.answer-set \{/);
  assert.match(mobile, /margin-block: 22px/);
  assert.match(mobile, /\.session \.answer-set button \{[\s\S]*min-height: 48px/);
  assert.match(mobile, /margin-block: 3px/);
  assert.match(mobile, /padding: 12px 15px/);
  assert.match(mobile, /white-space: normal/);
  assert.match(mobile, /overflow-wrap: break-word/);
  const answerButtonBlock = mobile.match(/\.session \.answer-set button \{([\s\S]*?)\}/)?.[1] ?? "";
  assert.doesNotMatch(answerButtonBlock, /font-size/);
  assert.doesNotMatch(answerButtonBlock, /overflow:\s*hidden/);
  assert.doesNotMatch(answerButtonBlock, /text-overflow:\s*ellipsis/);
});

test("Wave C learner-facing gate copy is represented without creating human approval", () => {
  assert.ok(manifest.repair_source_paths.language.includes("components/TestInviteGate.tsx"));
  assert.match(manifest.source_blobs["components/TestInviteGate.tsx"], /^[a-f0-9]{40}$/);
  assert.equal(manifest.strategy_status, "CURRICULUM_STRATEGY_REVIEW_PENDING");
  assert.equal(manifest.drill_content_status, "DRILLS_REVIEW_PENDING");
  assert.equal(manifest.strategy_approval, null);
  assert.equal(manifest.drill_approval, null);
  assert.deepEqual(manifest.human_approvals, {});
  assert.equal(manifest.final_composition.status, "REVIEW_PENDING");
  assert.equal(manifest.final_composition.approved_digest, null);
  assert.equal(manifest.final_composition.current_digest, manifest.final_composition.review_corpus_fingerprint);
});
