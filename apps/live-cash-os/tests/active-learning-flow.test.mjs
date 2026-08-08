import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const core = readFileSync(new URL("../components/LiveCashAppCore.tsx", import.meta.url), "utf8");
const model = readFileSync(new URL("../lib/model-core.ts", import.meta.url), "utf8");

function indexOfOrFail(source, token) {
  const index = source.indexOf(token);
  assert.notEqual(index, -1, `missing token: ${token}`);
  return index;
}

test("lesson cadence alternates explanation with active work instead of four passive screens", () => {
  const lessonStart = indexOfOrFail(core, "function LessonSession");
  const lessonEnd = indexOfOrFail(core, "function ConceptStep");
  const lesson = core.slice(lessonStart, lessonEnd);

  const ordered = [
    "session.step === 0",
    "session.step === 1 && <ConceptStep",
    "session.step === 2 && <>",
    "drill={firstApplication}",
    "session.step === 3 && <FrameworkStep",
    "session.step === 4 && <Worked",
    "session.step === 5 && <Lab",
    "session.step === 6 && <>",
    "drill={secondApplication}",
    "session.step === 7 && <ExplainBack",
    "session.step === 8 && <TableCard",
    "session.step === 9 && <LessonSummary",
  ];

  let cursor = -1;
  for (const token of ordered) {
    const next = lesson.indexOf(token, cursor + 1);
    assert.ok(next > cursor, `lesson flow is out of order at ${token}`);
    cursor = next;
  }

  assert.doesNotMatch(lesson, /session\.step === 1[^\n]+ContentStep/);
  assert.doesNotMatch(lesson, /session\.step === 2[^\n]+ListStep/);
  assert.doesNotMatch(lesson, /session\.step === 3[^\n]+ListStep/);
});

test("all curriculum detail remains available while the primary hierarchy stays compact", () => {
  const conceptStart = indexOfOrFail(core, "function ConceptStep");
  const frameworkStart = indexOfOrFail(core, "function FrameworkStep");
  const workedStart = indexOfOrFail(core, "function Worked");
  const tableStart = indexOfOrFail(core, "function TableCard");
  const summaryStart = indexOfOrFail(core, "function LessonSummary");

  const concept = core.slice(conceptStart, frameworkStart);
  const framework = core.slice(frameworkStart, workedStart);
  const table = core.slice(tableStart, summaryStart);

  assert.match(concept, /module\.theory/);
  assert.match(concept, /<details>/);
  assert.match(concept, /localized\.tableCue/);
  assert.match(concept, /module\.scope/);
  assert.match(framework, /module\.heuristics/);
  assert.match(framework, /module\.decisionTree/);
  assert.match(table, /module\.tableCard/);
  assert.match(table, /module\.glossary/);
  assert.match(table, /<details>/);
});

test("worked example requires prediction before revealing the answer", () => {
  const workedStart = indexOfOrFail(core, "function Worked");
  const labStart = indexOfOrFail(core, "function Lab");
  const worked = core.slice(workedStart, labStart);

  assert.match(worked, /useState\(false\)/);
  assert.match(worked, /Я решил — показать разбор/);
  assert.match(worked, /I decided — show the breakdown/);
  assert.ok(worked.indexOf("!revealed") < worked.indexOf("module.workedExample.steps"));
});

test("lesson summary reports evidence without turning completion into mastery", () => {
  const summaryStart = indexOfOrFail(core, "function LessonSummary");
  const practiceStart = indexOfOrFail(core, "function PracticeSession");
  const summary = core.slice(summaryStart, practiceStart);

  assert.match(summary, /actionPassed/);
  assert.match(summary, /reasonPassed/);
  assert.match(summary, /delayedChecked/);
  assert.match(summary, /ещё не проводилась/);
  assert.match(summary, /not proof of delayed retention/);

  const completeLessonStart = indexOfOrFail(model, "export function completeLesson");
  const completeLessonEnd = indexOfOrFail(model.slice(completeLessonStart), "export function completeBlock") + completeLessonStart;
  const completion = model.slice(completeLessonStart, completeLessonEnd);
  assert.match(completion, /contentCompleted = true/);
  assert.match(completion, /deriveModuleState/);
  assert.doesNotMatch(completion, /RETAINED|FIELD_VALIDATED/);
});
