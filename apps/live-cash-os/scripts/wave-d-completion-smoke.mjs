import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const liveUrl = process.env.LIVE_URL ?? "https://live-cash-os-mobile-test.blufferus.workers.dev";
const deployedSha = process.env.DEPLOYED_SHA?.trim() || null;
const testInviteCode = process.env.LIVE_CASH_TEST_SMOKE_CODE?.trim().toUpperCase() || null;
const LEARNER_KEY = "live-cash-os:learner-state";
const PROFILE_KEY = "live-cash-os:portable-profile-code";

if (!testInviteCode) {
  console.log("WAVE_D_COMPLETION_SMOKE_SKIPPED no test invite code");
  process.exit(0);
}

await mkdir("smoke-evidence", { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

try {
  await page.addInitScript((code) => localStorage.setItem("live-cash-os:portable-profile-code", code), testInviteCode);
  await page.route("**/api/state", async (route) => {
    if (route.request().method() === "GET") {
      const response = await route.fetch();
      if (!response.ok()) {
        await route.fulfill({ response });
        return;
      }
      const payload = await response.json();
      await route.fulfill({ response, json: { ...payload, state: null } });
      return;
    }
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ code: "AUTH_REQUIRED", error: "Wave D smoke keeps learner mutations isolated locally" }),
    });
  });

  const response = await page.goto(liveUrl, { waitUntil: "domcontentloaded", timeout: 45_000 });
  if (response?.status() !== 200) throw new Error(`Unexpected HTTP status: ${response?.status() ?? "none"}`);
  await page.getByRole("navigation", { name: /Основная навигация|Primary navigation/ }).waitFor({ timeout: 20_000 });

  if (deployedSha) {
    const badge = page.locator("[data-build-sha]");
    await badge.waitFor({ timeout: 10_000 });
    const actual = await badge.getAttribute("data-build-sha");
    if (actual !== deployedSha) throw new Error(`Build identity mismatch: expected ${deployedSha}, got ${actual ?? "missing"}`);
  }

  await page.waitForFunction(({ learnerKey, profileKey }) => {
    const key = localStorage.getItem(profileKey)
      ? Object.keys(localStorage).find((candidate) => candidate.startsWith(`${learnerKey}:profile:`))
      : learnerKey;
    return Boolean(key && localStorage.getItem(key));
  }, { learnerKey: LEARNER_KEY, profileKey: PROFILE_KEY }, { timeout: 10_000 });

  await page.evaluate(({ learnerKey, profileKey }) => {
    const key = localStorage.getItem(profileKey)
      ? Object.keys(localStorage).find((candidate) => candidate.startsWith(`${learnerKey}:profile:`))
      : learnerKey;
    if (!key) throw new Error("Active learner storage key is missing");
    const state = JSON.parse(localStorage.getItem(key));
    const now = new Date().toISOString();
    state.interactions = state.interactions.filter((item) => !(item.mode === "lesson" && item.moduleId === "geometry"));
    state.reviewQueue = state.reviewQueue.filter((item) => !(item.moduleId === "geometry" && item.kind === "repair"));
    state.modules.geometry.contentCompleted = false;
    state.modules.geometry.lessonStep = 9;
    state.modules.geometry.highConfidenceError = false;
    state.activeSession = {
      mode: "lesson",
      moduleId: "geometry",
      step: 9,
      drillIds: ["geo-01", "geo-02", "geo-04"],
      currentIndex: 2,
      selectedActionId: null,
      selectedReasonId: null,
      confidence: 65,
      startedAt: now,
      itemStartedAt: now,
      explainBack: "Smoke-only completed explanation with enough detail to preserve final lesson state.",
    };
    state.revision += 1;
    state.updatedAt = now;
    localStorage.setItem("live-cash-os:locale", "ru");
    localStorage.setItem(key, JSON.stringify(state));
  }, { learnerKey: LEARNER_KEY, profileKey: PROFILE_KEY });

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByText("10 · Итог урока", { exact: true }).waitFor({ timeout: 15_000 });
  await page.getByText("Текущие проверки пройдены", { exact: true }).waitFor({ timeout: 10_000 });
  if (await page.getByText("Есть материал для разбора ошибки", { exact: true }).count()) {
    throw new Error("Clean lesson summary falsely reports a miss");
  }

  await page.getByRole("button", { name: /^Завершить урок и вернуться/ }).click();
  await page.waitForFunction(({ learnerKey, profileKey }) => {
    const key = localStorage.getItem(profileKey)
      ? Object.keys(localStorage).find((candidate) => candidate.startsWith(`${learnerKey}:profile:`))
      : learnerKey;
    const state = key ? JSON.parse(localStorage.getItem(key) ?? "null") : null;
    return state?.activeSession === null
      && state?.modules?.geometry?.contentCompleted === true
      && state?.modules?.geometry?.lessonStep === 10;
  }, { learnerKey: LEARNER_KEY, profileKey: PROFILE_KEY }, { timeout: 10_000 });

  const completionTruth = await page.evaluate(({ learnerKey, profileKey }) => {
    const key = localStorage.getItem(profileKey)
      ? Object.keys(localStorage).find((candidate) => candidate.startsWith(`${learnerKey}:profile:`))
      : learnerKey;
    const state = key ? JSON.parse(localStorage.getItem(key) ?? "null") : null;
    if (!state) throw new Error("Learner state disappeared after completion");
    return {
      repairs: state.reviewQueue.filter((item) => item.kind === "repair" && item.moduleId === "geometry").length,
      misses: state.interactions.filter((item) => item.mode === "lesson" && item.moduleId === "geometry" && (!item.actionOk || !item.reasonOk)).length,
    };
  }, { learnerKey: LEARNER_KEY, profileKey: PROFILE_KEY });
  if (completionTruth.repairs !== 0 || completionTruth.misses !== 0) {
    throw new Error(`Clean completion created false error truth: ${JSON.stringify(completionTruth)}`);
  }

  await page.getByRole("button", { name: "Сегодня", exact: true }).click();
  const today = page.locator(".today-card");
  await today.waitFor({ timeout: 10_000 });
  const todayText = await today.innerText();
  if (todayText.includes("Продолжить сохранённую сессию") || todayText.includes("Вернёмся ровно к месту остановки")) {
    throw new Error("Today resurrected the completed lesson");
  }
  const nextAction = (await today.locator("h2").innerText()).trim();
  if (!nextAction) throw new Error("Today did not derive a next action after completion");

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("navigation", { name: "Основная навигация" }).waitFor({ timeout: 15_000 });
  const reloaded = await page.evaluate(({ learnerKey, profileKey }) => {
    const key = localStorage.getItem(profileKey)
      ? Object.keys(localStorage).find((candidate) => candidate.startsWith(`${learnerKey}:profile:`))
      : learnerKey;
    return key ? JSON.parse(localStorage.getItem(key) ?? "null") : null;
  }, { learnerKey: LEARNER_KEY, profileKey: PROFILE_KEY });
  if (reloaded?.activeSession !== null || reloaded?.modules?.geometry?.contentCompleted !== true || reloaded?.modules?.geometry?.lessonStep !== 10) {
    throw new Error("Completed lesson did not survive reload");
  }
  const reloadToday = await page.locator(".today-card").innerText();
  if (reloadToday.includes("Продолжить сохранённую сессию") || reloadToday.includes("Вернёмся ровно к месту остановки")) {
    throw new Error("Reload resurrected completed session");
  }

  const report = {
    result: "WAVE_D_COMPLETION_SMOKE_GREEN",
    url: liveUrl,
    deployed_sha: deployedSha,
    completed_lesson_clears_active_session: true,
    completed_lesson_has_no_fake_error: true,
    completed_lesson_today_no_resume_loop: true,
    completed_lesson_survives_reload: true,
    completion_next_action: nextAction,
    timestamp: new Date().toISOString(),
  };
  await writeFile("smoke-evidence/wave-d-completion-report.json", `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`WAVE_D_COMPLETION_SMOKE_GREEN next_action=${nextAction}`);
} finally {
  await context.close();
  await browser.close();
}
