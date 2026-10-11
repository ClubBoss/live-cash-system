import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";

async function storedAttemptCount(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw)._practicalProfile?.mastery?.attempts?.length ?? 0 : 0;
  }, LEARNER_KEY);
}

for (const viewport of [
  { name: "desktop-1440", width: 1440, height: 900 },
  { name: "mobile-320", width: 320, height: 700 },
  { name: "mobile-390", width: 390, height: 844 },
]) {
  test(`Quick Start is explanation-first and task-first after beginning on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.route("**/api/state", async (route) => {
      await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local UX fixture" }) });
    });
    await page.goto("/mastery/journey");
    const teaching = page.locator('main[data-quick-start-phase="teach"]');
    await expect(teaching).toBeVisible();

    const explanationLink = page.getByRole("link", { name: /Перейти к объяснению|Go to explanation/ });
    await expect(explanationLink).toHaveAttribute("href", "#quick-start-material");
    await expect(page.locator("#quick-start-material")).toBeAttached();
    const jumpBox = await explanationLink.boundingBox();
    expect(jumpBox).not.toBeNull();
    expect(jumpBox.y + jumpBox.height).toBeLessThan(viewport.height);
    await explanationLink.click();
    await expect(page).toHaveURL(/#quick-start-material$/);
    await expect(page.locator("#quick-start-material")).toBeInViewport({ ratio: 0.1 });

    const attemptsBefore = await storedAttemptCount(page);
    await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
    const practice = page.locator('main[data-quick-start-phase="practice"]');
    await expect(practice).toBeVisible();
    await expect(page.locator(".quick-start-intro")).toHaveCount(0);
    await expect(page.locator(".quick-start-practice-context h1")).toBeVisible();
    const question = page.locator(".quick-start-decision h2");
    await expect(question).toBeFocused();
    await expect(question).toBeInViewport({ ratio: 0.4 });
    await expect(practice.locator(".quick-start-decision fieldset")).toHaveCount(2);
    await expect(page.getByRole("button", { name: /Ответить|Answer/ }).last()).toBeDisabled();
    expect(await storedAttemptCount(page)).toBe(attemptsBefore);

    const decision = page.locator(".quick-start-decision");
    await decision.locator("fieldset").nth(0).locator('input[type="radio"]').first().check();
    await decision.locator("fieldset").nth(1).locator('input[type="radio"]').first().check();
    await page.getByRole("button", { name: /Ответить|Answer/ }).last().click();
    const feedbackHeading = page.locator(".quick-start-decision h3");
    await expect(feedbackHeading).toBeFocused();
    await expect(feedbackHeading).toBeInViewport({ ratio: 1 });
    const feedbackBox = await feedbackHeading.boundingBox();
    expect(feedbackBox).not.toBeNull();
    expect(feedbackBox.y).toBeGreaterThanOrEqual(0);
    // The document may end before the heading can be aligned to y=0.
    // The useful invariant is early, fully visible feedback, not a fixed pixel.
    expect(feedbackBox.y).toBeLessThan(viewport.height * 0.35);
    expect(await storedAttemptCount(page)).toBe(attemptsBefore + 1);
  });
}
