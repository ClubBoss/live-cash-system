import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readJson = async (path) => JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), "utf8"));
const readText = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

function claimById(claims, id) {
  const claim = claims.find((item) => item.claim_id === id);
  assert.ok(claim, `Missing claim ${id}`);
  return claim;
}

test("W3 repaired claims keep the mechanism while bounding direct depth evidence", async () => {
  const lcm02 = await readJson("content/claims/lcm-02.claims.json");
  const lcm03 = await readJson("content/claims/lcm-03.claims.json");
  const lcm06 = await readJson("content/claims/lcm-06.claims.json");

  const preflopDepth = claimById(lcm02, "LCM-02-CL-004");
  assert.match(preflopDepth.claim, /Deeper stacks.*shorter stacks/u);
  assert.equal(preflopDepth.claim_type, "HEURISTIC");
  assert.equal(preflopDepth.confidence, "MEDIUM");
  assert.match(preflopDepth.depth_scope.join(" "), /100bb.*200bb.*400bb/u);
  assert.doesNotMatch(preflopDepth.depth_scope.join(" "), /60bb/u);
  assert.match(preflopDepth.notes, /not universal transition boundaries/u);

  const blindSource = claimById(lcm03, "LCM-03-CL-003");
  assert.match(blindSource.claim, /SB caller.*BB caller/u);
  assert.match(blindSource.depth_scope.join(" "), /Direct source example: 200bb/u);
  assert.match(blindSource.depth_scope.join(" "), /generalisation only/u);
  assert.doesNotMatch(blindSource.depth_scope.join(" "), /100bb/u);

  const compensation = claimById(lcm06, "LCM-06-CL-001");
  assert.match(compensation.claim, /over-wide preflop 3-bet range.*more postflop checks/u);
  assert.match(compensation.depth_scope.join(" "), /exact stack depth is not source-locked/u);
  assert.doesNotMatch(compensation.depth_scope.join(" "), /150-200bb|Deep live cash/u);
  assert.match(compensation.notes, /stack depth.*visual-dependent/u);
});

test("W3 source drills remove unsupported depth precision without changing answer semantics", async () => {
  const wave3 = await readText("content/i18n/wave3-priority-gold.ts");

  assert.doesNotMatch(wave3, /сравнение около 60bb и 200bb/u);
  assert.doesNotMatch(wave3, /compare roughly 60bb with 200bb/u);
  assert.match(wave3, /сравнение более короткого и более глубокого эффективного стека/u);
  assert.match(wave3, /compare a shorter effective stack with a deeper effective stack/u);

  assert.doesNotMatch(wave3, /situation: "200bb\. BB 3-бетит BTN заметно шире нормы/u);
  assert.doesNotMatch(wave3, /situation: "200bb\. BB 3-bets BTN clearly wider than normal/u);
  assert.doesNotMatch(wave3, /"agg-01": \{\s*assumptions: \["200bb"/u);

  for (const expected of [
    "Больше прямых линейных 3-бетов и меньше ценности у спекулятивных коллов",
    "More direct linear 3-betting and less value in speculative calls",
    "Защищаться шире против недокомпенсированной c-bet-частоты",
    "Defend wider against the uncompensated c-bet frequency",
    "Игнорировать префлоп-ширину и смотреть только на размер ставки",
    "Ignore preflop width and look only at bet size",
  ]) assert.match(wave3, new RegExp(expected.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "u"));

  assert.doesNotMatch(wave3, /misconceptionId/u, "Wave 3 locale layer must not rewrite runtime misconception tags");
});

test("W3 repaired candidate remains explicitly review-pending with approvals invalidated", async () => {
  const manifest = await readJson("content/i18n/editorial-manifest.json");
  assert.equal(manifest.status, "TRANSITIONAL_REVIEW_REQUIRED");
  assert.equal(manifest.strategy_status, "CURRICULUM_STRATEGY_REVIEW_PENDING");
  assert.equal(manifest.drill_content_status, "DRILLS_REVIEW_PENDING");
  assert.deepEqual(manifest.strategy_repair_scope, ["preflop", "blinds", "aggression"]);
  assert.deepEqual(manifest.drill_repair_scope, ["preflop", "aggression"]);
  assert.equal(manifest.strategy_approval, null);
  assert.equal(manifest.drill_approval, null);
  assert.deepEqual(manifest.human_approvals, {});
  assert.equal(manifest.final_composition.status, "STALE_REVIEW_REQUIRED");
  assert.equal(manifest.final_composition.current_digest, null);
  assert.equal(manifest.final_composition.approved_digest, null);
});
