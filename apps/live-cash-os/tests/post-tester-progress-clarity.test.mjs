import assert from "node:assert/strict";
import test from "node:test";

import {
  diagnosticContinuation,
  lessonSkillTruth,
  lessonStepLabel,
  sessionSaveLabel,
  skillStateLabel,
} from "../lib/session-clarity.ts";

test("completed lesson and repair-required skill remain separate truths in RU and EN", () => {
  assert.deepEqual(lessonSkillTruth("ru", true, "REPAIR_REQUIRED"), {
    lesson: "Урок: пройден",
    skill: "Навык: нуждается в работе",
    explanation: "Урок завершён. В самостоятельной проверке была ошибка, поэтому отдельное задание добавлено в Повтор.",
  });
  assert.deepEqual(lessonSkillTruth("en", true, "REPAIR_REQUIRED"), {
    lesson: "Lesson: completed",
    skill: "Skill: needs repair",
    explanation: "Lesson completed. A self-check found a mistake, so a separate repair task was added to Review.",
  });
  assert.equal(lessonSkillTruth("en", true, "INTRODUCED").explanation, null);
  assert.equal(skillStateLabel("en", "INTRODUCED"), "introduced");
  assert.notEqual(skillStateLabel("en", "INTRODUCED"), "lesson completed");
});

test("lesson step label uses the actual zero-based lesson step", () => {
  assert.equal(lessonStepLabel("ru", "LCM-01", 0), "LCM-01 · Урок · шаг 1 из 10");
  assert.equal(lessonStepLabel("ru", "LCM-01", 4), "LCM-01 · Урок · шаг 5 из 10");
  assert.equal(lessonStepLabel("ru", "LCM-01", 9), "LCM-01 · Урок · шаг 10 из 10");
  assert.equal(lessonStepLabel("en", "LCM-01", 0), "LCM-01 · Lesson · step 1 of 10");
  assert.equal(lessonStepLabel("en", "LCM-01", 4), "LCM-01 · Lesson · step 5 of 10");
  assert.equal(lessonStepLabel("en", "LCM-01", 9), "LCM-01 · Lesson · step 10 of 10");
});

test("session save copy is derived from the reliable controller status", () => {
  const cases = [
    ["syncing", null, "Сохраняем…", "Saving…"],
    ["synced", null, "Сохранено", "Saved"],
    ["local", null, "Сохранено на устройстве", "Saved on device"],
    ["offline", null, "Нет сети · сохранено локально", "Offline · saved locally"],
    ["conflict", "STATE_CONFLICT", "Нужна синхронизация", "Sync needed"],
    ["error", null, "Нужна синхронизация", "Sync needed"],
    ["error", "UPDATE_REQUIRED", "Сохранение требует внимания", "Save needs attention"],
    ["error", "LOCAL_WRITE_FAILED", "Сохранение не удалось", "Save failed"],
  ];
  for (const [status, recoveryCode, ru, en] of cases) {
    assert.equal(sessionSaveLabel("ru", status, recoveryCode), ru);
    assert.equal(sessionSaveLabel("en", status, recoveryCode), en);
  }
});

test("in-progress Diagnostic exposes saved count and next question without changing status", () => {
  assert.deepEqual(diagnosticContinuation("ru", "IN_PROGRESS", 3), {
    title: "Диагностика · 3/10 сохранено",
    body: "Сохранённые ответы не потеряны. Продолжишь с 4-го вопроса.",
    action: "Продолжить",
  });
  assert.deepEqual(diagnosticContinuation("en", "IN_PROGRESS", 3), {
    title: "Diagnostic · 3/10 saved",
    body: "Your saved answers are still here. Continue with question 4.",
    action: "Continue",
  });
  assert.equal(diagnosticContinuation("ru", "AWAITING_REVIEW", 10), null);
});
