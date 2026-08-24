import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { resolveToolsRuntime, supportTabFromSearch } from "../lib/support-tools-routing.ts";

const root = new URL("../", import.meta.url);
const read = (relative) => readFile(new URL(relative, root), "utf8");

test("Real Hands review presentation hides internal routing vocabulary while retaining ID-backed binding", async () => {
  const source = await read("components/RealHandCanonicalReview.tsx");

  for (const learnerCopy of [
    "Причина ошибки / разбора",
    "Подходящие темы",
    "Выбери тему, которую подтвердил разбор",
    "Тема для тренировки",
    "Reason identified in the review",
    "Relevant topics",
    "Select the topic established by the review",
    "Practice topic",
  ]) assert.match(source, new RegExp(learnerCopy.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));

  for (const staleLearnerCopy of [
    "Canonical Practical candidates",
    "Canonical Practical кандидаты",
    "authoritative Practical",
    "focused repair",
    "Exact canonical skill",
    "Точный canonical навык",
  ]) assert.doesNotMatch(source, new RegExp(staleLearnerCopy, "i"));

  assert.match(source, /routeRealHandToRepairs\(signals\)/);
  assert.match(source, /value=\{selectedStillValid \? value\.practicalSkillId : ""\}/);
  assert.match(source, /value=\{candidate\.skillId\}/);
  assert.doesNotMatch(source, /candidates\.map\(\(candidate\) => candidate\.skillId\)\.join/);
  assert.doesNotMatch(source, />\{candidate\.skillId\}\s*·/);
});

test("support tab parsing has one deterministic field/diagnostic/data contract", () => {
  assert.equal(supportTabFromSearch("?tab=field"), "field");
  assert.equal(supportTabFromSearch("?tab=diagnostic"), "diagnostic");
  assert.equal(supportTabFromSearch("?tab=data"), "data");
  assert.equal(supportTabFromSearch("?tab=today"), "data");
  assert.equal(supportTabFromSearch("?tab=review"), "data");
  assert.equal(supportTabFromSearch(""), "data");
});

test("production legacy escape attacks remain support-only even with the old E2E marker", () => {
  const base = {
    legacyToolsMode: false,
    legacyMarker: "1",
    referrer: "",
    origin: "https://live-cash-os.example",
  };
  for (const search of ["?legacy=1", "?tab=today", "?tab=learn", "?tab=review", "?tab=cards", "?tab=map", ""]) {
    assert.equal(resolveToolsRuntime({ ...base, search }), "support", `production attack escaped through ${search || "marker-only"}`);
  }

  assert.equal(resolveToolsRuntime({ ...base, legacyToolsMode: true, search: "?legacy=1" }), "legacy");
  assert.equal(resolveToolsRuntime({ ...base, legacyToolsMode: true, search: "" }), "legacy");
});

test("support UI uses History API and one navigation path including Diagnostic exit", async () => {
  const source = await read("components/SupportingToolsApp.tsx");
  assert.match(source, /window\.history\.pushState/);
  assert.match(source, /window\.addEventListener\("popstate", syncTabFromHistory\)/);
  assert.match(source, /onExit=\{\(\) => navigateSupportTab\("data"\)\}/);
  assert.match(source, /url\.searchParams\.set\("tab", nextTab\)/);
  assert.doesNotMatch(source, /searchParams\.delete\("tab"\)/);
  assert.doesNotMatch(source, /setTab\("field"\)\}>\{copy\.field/);
});
