import { chromium } from "playwright";

const baseURL = process.env.LIVE_CASH_PROFILE_URL ?? "http://127.0.0.1:5173";
const repetitions = Math.max(1, Number.parseInt(process.env.LIVE_CASH_PROFILE_RUNS ?? "5", 10) || 5);

function percentile(values, fraction) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
}

function summary(samples, key) {
  const values = samples.map((sample) => sample[key]);
  return {
    median_ms: Number(percentile(values, 0.5).toFixed(1)),
    p95_ms: Number(percentile(values, 0.95).toFixed(1)),
    max_ms: Number(Math.max(...values).toFixed(1)),
  };
}

async function localOnly(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "P2 local-fallback profile" }),
    });
  });
}

const browser = await chromium.launch({ headless: true });
const samples = [];
try {
  for (let run = 1; run <= repetitions; run += 1) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await localOnly(page);

    const bootstrapStart = performance.now();
    await page.goto(`${baseURL}/mastery`, { waitUntil: "domcontentloaded" });
    await page.getByRole("heading", { name: /Смотри прогресс|See your progress/ }).waitFor();
    const bootstrapMs = performance.now() - bootstrapStart;

    const navEntriesBefore = await page.evaluate(() => performance.getEntriesByType("navigation").length);
    const routeStart = performance.now();
    await page.getByRole("navigation", { name: "Practical Mastery navigation" })
      .getByRole("link", { name: /Продолжить обучение|Continue learning/ }).click();
    await page.waitForURL(/\/mastery\/journey$/);
    await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).waitFor();
    const routeSettleMs = performance.now() - routeStart;
    const navEntriesAfter = await page.evaluate(() => performance.getEntriesByType("navigation").length);
    if (navEntriesAfter !== navEntriesBefore) throw new Error("Practical route click caused a document navigation");

    await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
    const fields = page.locator("main fieldset");
    await fields.nth(0).locator('input[type="radio"]').first().check();
    await fields.nth(1).locator('input[type="radio"]').first().check();
    const answerStart = performance.now();
    await page.locator("main button.primary:visible").first().click();
    await page.getByRole("heading", { name: /Верно|Нужно исправить|Correct|Repair needed/ }).waitFor();
    const answerFeedbackMs = performance.now() - answerStart;

    const mobileOverflowPx = await page.evaluate(() => Math.max(
      0,
      document.documentElement.scrollWidth - document.documentElement.clientWidth,
    ));
    if (mobileOverflowPx > 1) throw new Error(`mobile horizontal overflow: ${mobileOverflowPx}px`);

    samples.push({
      run,
      bootstrap_local_fallback_ms: Number(bootstrapMs.toFixed(1)),
      spa_route_settle_ms: Number(routeSettleMs.toFixed(1)),
      answer_feedback_ms: Number(answerFeedbackMs.toFixed(1)),
      mobile_overflow_px: mobileOverflowPx,
      document_navigation_entries: navEntriesAfter,
    });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify({
  kind: "LC-AUD-009-bounded-profile",
  baseURL,
  repetitions,
  pass_criteria: [
    "Practical navigation stays SPA/same-document",
    "local/cloud-unavailable bootstrap reaches usable UI",
    "answer interaction reaches learner feedback",
    "390px viewport has <=1px horizontal overflow",
    "timings are descriptive only and are not CI latency thresholds",
  ],
  samples,
  timing_summary: {
    bootstrap_local_fallback: summary(samples, "bootstrap_local_fallback_ms"),
    spa_route_settle: summary(samples, "spa_route_settle_ms"),
    answer_feedback: summary(samples, "answer_feedback_ms"),
  },
}, null, 2));
