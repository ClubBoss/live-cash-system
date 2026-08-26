import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path, { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function loadAuthorityModel() {
  const source = await readFile(new URL("../lib/practical-first-journey-authority.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
      importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
    },
  }).outputText;
  const directory = await mkdtemp(join(tmpdir(), "live-cash-os-v4-wave-a-authority-"));
  const output = join(directory, "practical-first-journey-authority.mjs");
  await writeFile(output, compiled, "utf8");
  return import(`${new URL(`file://${output}`).href}?${Date.now()}-${Math.random()}`);
}

async function sourceFilesUnder(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await sourceFilesUnder(absolute));
    else if (/\.(?:tsx|ts)$/.test(entry.name)) result.push(absolute);
  }
  return result;
}

const authorityPromise = loadAuthorityModel();

test("Quick Start 0..8 presentation matrix can complete only from progress.completed", async () => {
  const { firstJourneyPresentationState } = await authorityPromise;

  for (let reached = 0; reached <= 7; reached += 1) {
    const progress = { reached, total: 8, completed: false };
    assert.equal(firstJourneyPresentationState(progress, true), "ACTIVE", `${reached}/8 with a usable recommendation must stay active`);
    assert.equal(firstJourneyPresentationState(progress, false), "BLOCKED", `${reached}/8 without a usable recommendation must fail closed`);
  }

  const complete = { reached: 8, total: 8, completed: true };
  assert.equal(firstJourneyPresentationState(complete, true), "COMPLETE");
  assert.equal(firstJourneyPresentationState(complete, false), "COMPLETE");
});

test("route authority owns presentation state and the single Practical profile controller supplied to Experience", async () => {
  const authority = await readFile(path.join(root, "components/PracticalFirstJourneyAuthority.tsx"), "utf8");
  const experience = await readFile(path.join(root, "components/PracticalFirstJourneyExperience.tsx"), "utf8");

  assert.match(authority, /const profile = usePracticalProfileState\(\)/);
  assert.match(authority, /firstJourneyPresentationState\(progress, Boolean\(recommendation && skill && journeyStep\)\)/);
  assert.match(authority, /<PracticalFirstJourneyExperience presentation=\{presentation\} profile=\{profile\} \/>/);
  assert.doesNotMatch(authority, /restoreQuickStartPostAnswer/);
  assert.match(experience, /presentation: FirstJourneyPresentationState \| null/);
  assert.match(experience, /profile:/);
  assert.doesNotMatch(experience, /const profile = usePracticalProfileState\(\)/);
  assert.match(experience, /!answeredDecisionId && presentation === "COMPLETE"/);
  assert.match(experience, /!answeredDecisionId && presentation === "BLOCKED"/);
  assert.doesNotMatch(experience, /!recommendation \|\| !skill \|\| !journeyStep/);
});

test("VALID post-answer restoration preserves feedback without recording duplicate mastery evidence", async () => {
  const experience = await readFile(path.join(root, "components/PracticalFirstJourneyExperience.tsx"), "utf8");
  const restoreStart = experience.indexOf("const restored = restoreQuickStartPostAnswer");
  const restoreEnd = experience.indexOf("useEffect(() =>", restoreStart + 1);
  const restoreSection = experience.slice(restoreStart, restoreEnd);

  assert.ok(restoreStart >= 0);
  assert.match(restoreSection, /restored\.status === "VALID"/);
  assert.match(restoreSection, /setAnsweredDecisionId\(restored\.decisionId\)/);
  assert.match(restoreSection, /setAnswerRevealed\(true\)/);
  assert.doesNotMatch(restoreSection, /recordPracticalDecision|setMasteryWithStudyWorkspace/);
});

test("only the canonical Quick Start renderer contains learner-visible completion copy", async () => {
  const roots = [path.join(root, "app"), path.join(root, "components")];
  const markers = ["Quick start complete", "Быстрый старт завершён", "core models. This is not full mastery", "ключевых моделей. Это не означает полное освоение"];
  const matches = [];

  for (const directory of roots) {
    for (const file of await sourceFilesUnder(directory)) {
      const source = await readFile(file, "utf8");
      if (markers.some((marker) => source.includes(marker))) matches.push(path.relative(root, file));
    }
  }

  assert.deepEqual([...new Set(matches)], ["components/PracticalFirstJourneyExperience.tsx"]);
});

test("Diagnostic remains a generic handoff to the canonical journey route", async () => {
  const diagnostic = await readFile(path.join(root, "components/DiagnosticExperience.tsx"), "utf8");
  const continueStart = diagnostic.indexOf("const continueToPractical");
  const continueEnd = diagnostic.indexOf("return <section", continueStart);
  const handoff = diagnostic.slice(continueStart, continueEnd);

  assert.ok(continueStart >= 0);
  assert.match(handoff, /window\.location\.assign\("\/mastery\/journey"\)/);
  assert.doesNotMatch(handoff, /firstJourneyPresentationState|firstJourneyProgress|recommendFirstJourneyStep/);
});
