import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { moduleById } from "../content/modules.ts";
import { applyLocaleData } from "../content/i18n/locale-pipeline.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const NEW_CARD_IDS = ["pre-card-family-87s", "pre-card-family-a4s"];
const baselineCardIds = moduleById.preflop.flashcards.map((card) => card.id);
const baselineDecisionIdentities = moduleById.preflop.drills.map((drill) => ({
  id: drill.id,
  correctActionId: drill.correctActionId,
  correctReasonId: drill.correctReasonId,
  actionIds: drill.actionOptions.map((option) => option.id),
  reasonIds: drill.reasonOptions.map((option) => option.id),
}));

function gitBlobSha(buffer) {
  return createHash("sha1").update(`blob ${buffer.length}\0`).update(buffer).digest("hex");
}

async function assertGitBlob(relativePath, expectedSha) {
  const buffer = await readFile(path.join(root, relativePath));
  assert.equal(gitBlobSha(buffer), expectedSha, `${relativePath} changed outside this micro-closure`);
}

async function existingLearnerCorpus() {
  const paths = ["content/modules.ts"];
  const i18nDir = path.join(root, "content/i18n");
  for (const entry of await readdir(i18nDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".ts") || entry.name === "stimulus-generalisation-micro.ts") continue;
    paths.push(`content/i18n/${entry.name}`);
  }
  return (await Promise.all(paths.map(async (relativePath) => readFile(path.join(root, relativePath), "utf8")))).join("\n");
}

test("87s and A4s were genuinely unseen in the pre-existing learner-facing TypeScript corpus", async () => {
  const corpus = await existingLearnerCorpus();
  assert.doesNotMatch(corpus, /\b87s\b/u);
  assert.doesNotMatch(corpus, /\bA4s\b/u);
});

test("micro-closure adds exactly two stable LCM-02 cards and no new card architecture", () => {
  assert.deepEqual(baselineCardIds, ["pre-card-seq", "pre-card-flat", "pre-card-polar"]);
  applyLocaleData("ru");
  const cards = moduleById.preflop.flashcards;
  assert.equal(cards.length, baselineCardIds.length + 2);
  assert.deepEqual(cards.filter((card) => NEW_CARD_IDS.includes(card.id)).map((card) => card.id), NEW_CARD_IDS);
  assert.equal(new Set(cards.map((card) => card.id)).size, cards.length);
  assert.equal(cards.find((card) => card.id === "pre-card-family-87s")?.kind, "procedure");
  assert.equal(cards.find((card) => card.id === "pre-card-family-a4s")?.kind, "boundary");
  assert.ok(cards.every((card) => ["heuristic", "boundary", "procedure"].includes(card.kind)));
});

for (const locale of ["ru", "en"]) {
  test(`${locale}: final learner-facing cards require structural retrieval and reject family -> action shortcuts`, () => {
    applyLocaleData(locale);
    const cards = moduleById.preflop.flashcards;
    const connector = cards.find((card) => card.id === "pre-card-family-87s");
    const wheelAce = cards.find((card) => card.id === "pre-card-family-a4s");
    assert.ok(connector);
    assert.ok(wheelAce);
    assert.equal(cards.filter((card) => NEW_CARD_IDS.includes(card.id)).length, 2);

    assert.match(connector.front, /87s/u);
    assert.match(wheelAce.front, /A4s/u);
    assert.match(connector.front, locale === "ru" ? /семейств.*1–2.*свойств/iu : /family.*1–2.*traits/iu);
    assert.match(wheelAce.front, locale === "ru" ? /семейств.*1–2.*свойств/iu : /family.*1–2.*traits/iu);

    assert.match(connector.back, locale === "ru" ? /мастевая связка.*маст.*связност/iu : /suited connector.*suitedness.*connectivity/iu);
    assert.match(connector.back, locale === "ru" ? /не предписывает.*колл.*3-бет.*фолд/iu : /does not prescribe.*call.*3-bet.*fold/iu);
    assert.match(wheelAce.back, locale === "ru" ? /мастевой туз колеса.*туз-блокер.*натсового флеша/iu : /suited wheel ace.*ace blocker.*nut-flush/iu);
    assert.match(wheelAce.back, locale === "ru" ? /не создают автоматический.*блеф.*3-бет.*действие/iu : /neither creates an automatic.*bluff.*3-bet.*action/iu);

    assert.doesNotMatch(connector.back, /87s\s*(?:=|→)\s*(?:call|колл|3-bet|3-бет|fold|фолд)/iu);
    assert.doesNotMatch(wheelAce.back, /A4s\s*(?:=|→)\s*(?:call|колл|3-bet|3-бет|fold|фолд|bluff|блеф)/iu);
    assert.deepEqual(moduleById.preflop.drills.map((drill) => ({
      id: drill.id,
      correctActionId: drill.correctActionId,
      correctReasonId: drill.correctReasonId,
      actionIds: drill.actionOptions.map((option) => option.id),
      reasonIds: drill.reasonOptions.map((option) => option.id),
    })), baselineDecisionIdentities);
  });
}

test("state, card schema, scheduler, mastery and evidence implementation stay byte-identical to accepted main", async () => {
  await assertGitBlob("lib/model-core.ts", "42ef6e80912887ee2c18e5264fd4c8e3edf32726");
  await assertGitBlob("lib/scheduler.ts", "6cf3ba078ec98ac0af90aa18cf9aae62fe7a144d");
  await assertGitBlob("content/types.ts", "d3aec56bbdb1e28d83aa32ce3391cbfa70d5efa2");
  await assertGitBlob("lib/reliability.ts", "8bf4457acbedbc95cf62f54b85e38f6002ee0fbe");
});
