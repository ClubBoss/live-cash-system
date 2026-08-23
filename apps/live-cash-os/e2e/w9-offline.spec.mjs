import { expect, test } from "@playwright/test";

const LOCAL_KEY = "live-cash-os:learner-state";

test("controlled PWA can reload offline with a saved active session", async ({ page, context }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });

  await page.goto("/tools");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  await page.getByRole("button", { name: "Учиться", exact: true }).click();
  await page.getByRole("button", { name: /^Изучить/ }).first().click();
  await expect(page.getByText("1 · РЕШИ БЕЗ ПОДСКАЗКИ")).toBeVisible();

  await expect.poll(async () => page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw).activeSession?.moduleId ?? null;
  }, LOCAL_KEY)).toBe("geometry");

  await page.evaluate(async () => {
    if (!("serviceWorker" in navigator)) throw new Error("service worker unavailable");
    await navigator.serviceWorker.ready;
  });

  // Reload once online so the active worker controls and caches the exact
  // runtime requests needed by the application shell.
  await page.reload();
  await expect(page.getByText("1 · РЕШИ БЕЗ ПОДСКАЗКИ")).toBeVisible();
  await expect.poll(async () => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  await context.setOffline(true);
  try {
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByText("1 · РЕШИ БЕЗ ПОДСКАЗКИ")).toBeVisible();
    const state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), LOCAL_KEY);
    expect(state.activeSession.moduleId).toBe("geometry");
  } finally {
    await context.setOffline(false);
  }
});
