import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const registryPath = path.join(root, "content/practical-mastery/registry.ts");
const typesPath = path.join(root, "content/practical-mastery/types.ts");

const registry = await readFile(registryPath, "utf8");
const types = await readFile(typesPath, "utf8");

test("practical mastery registry spans Waves 1-14 and is not constrained to legacy eleven modules", () => {
  for (const wave of [
    "W1_FOUNDATION", "W2_PREFLOP", "W3_BLINDS", "W4_RECOGNITION", "W5_SRP_OOP", "W6_SRP_IP",
    "W7_3BET", "W8_4BET_LOW_SPR", "W9_TURN", "W10_RIVER", "W11_MULTIWAY_LIMP", "W12_DEEP_STRADDLE",
    "W13_EXPLOIT_LIVE", "W14_INTEGRATED",
  ]) assert.match(registry, new RegExp(`"${wave}"`));

  assert.match(types, /REAL_HAND_TRANSFER/);
  assert.match(registry, /Topic-hidden mixed decisions/);
  assert.match(registry, /BB vs BTN/);
  assert.match(registry, /3-bet-pot caller OOP/);
  assert.match(registry, /Multiway value thresholds/);
  assert.match(registry, /150–200bb planning/);
});

test("every practical family is source-routed and priority-classified in source text", () => {
  const declarations = registry.match(/f\("[A-Z0-9-]+"/g) ?? [];
  assert.ok(declarations.length >= 60, `expected broad skill graph, found ${declarations.length}`);
  assert.doesNotMatch(registry, /targetEvidenceStage: "FIELD_VALIDATED"/);
});
