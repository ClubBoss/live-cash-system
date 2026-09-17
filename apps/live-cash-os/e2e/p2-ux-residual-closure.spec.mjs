import { expect, test } from "@playwright/test";
import { reachPersistedSkillTargets } from "./practical-fixture-authority.mjs";

const LEARNER_KEY = "live-cash-os:learner-state";
const LOCALE_KEY = "live-cash-os:locale";

async function localOnly(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "bounded P2 fixture" }),
    });
  });
}

async function settledLearnerSnapshot(page) {
  let previous = null;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const current = await page.evaluate((key) => localStorage.getItem(key), LEARNER_KEY);
    if (current && current === previous) return current;
    previous = current;
    await page.waitForTimeout(50);
  }
  return previous;
}

async function expectMinHitArea(locator, minimum = 44) {
  const boxes = await locator.evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return { width: rect.width, height: rect.height };
  }));
  expect(boxes.length).toBeGreaterThan(0);
  for (const box of boxes) {
    expect(box.width).toBeGreaterThanOrEqual(minimum);
    expect(box.height).toBeGreaterThanOrEqual(minimum);
  }
}

test.beforeEach(async ({ page }) => {
  await localOnly(page);
});

for (const viewport of [{ width: 360, height: 800 }, { width: 390, height: 844 }]) {
  test(`Practical decision rows expose >=44px rendered hit areas at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto("/mastery/journey");
    await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();

    await expectMinHitArea(page.locator("main .practical-option-row"));
    await expectMinHitArea(
      page.getByRole("navigation", { name: "Practical Mastery navigation" })
        .locator(".mode-switch button"),
    );
    await expectMinHitArea(page.locator("main button.primary:visible").first());
    await expectMinHitArea(page.locator("main button.secondary:visible").first());

    await page.goto("/mastery/session?focus=FND-01");
    await expect(page.locator("[data-practical-decision-id]")).toBeVisible();
    await expectMinHitArea(page.locator("main .practical-option-row"));
  });
}

test("Perceptual option rows use the same mobile hit-target contract", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/mastery/journey");
  await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();

  await reachPersistedSkillTargets(page, LEARNER_KEY, [
    { skillId: "BL-04", targetStage: "CONCEPT_TAUGHT" },
  ]);
  await page.goto("/mastery/perception?focus=BL-04");

  await expect(page.locator("[data-practical-decision-id]")).toBeVisible();
  await expectMinHitArea(page.locator("main .practical-option-row"));
});

test("shared Practical navigation is the sole locale control and does not mutate learner state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/mastery");
  const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.locator(".mode-switch")).toHaveCount(1);
  await expect(page.locator("main .mode-switch")).toHaveCount(0);

  const learnerBefore = await settledLearnerSnapshot(page);
  const en = nav.getByRole("button", { name: "EN", exact: true });
  await en.focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), LOCALE_KEY)).toBe("en");
  const learnerAfter = await settledLearnerSnapshot(page);
  expect(learnerAfter).toBe(learnerBefore);

  await nav.getByRole("link", { name: "After play", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery\/study$/);
  await expect(page.locator("main .mode-switch")).toHaveCount(0);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("navigation", { name: "Practical Mastery navigation" })
      .getByRole("button", { name: "EN", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("retired PracticalMasteryGateway is not part of the canonical learner composition", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/mastery/journey");
  await expect(page.locator(".practical-mastery-gateway")).toHaveCount(0);
});

async function computedContrast(locator) {
  return locator.evaluate((element) => {
    const parse = (value) => {
      const match = value.match(/rgba?\(([^)]+)\)/i);
      if (!match) throw new Error(`Unsupported computed color: ${value}`);
      const parts = match[1].split(/[ ,/]+/u).filter(Boolean).map(Number);
      return { r: parts[0], g: parts[1], b: parts[2], a: Number.isFinite(parts[3]) ? parts[3] : 1 };
    };
    const composite = (top, bottom) => {
      const a = top.a + bottom.a * (1 - top.a);
      if (a <= 0) return { r: 255, g: 255, b: 255, a: 1 };
      return {
        r: (top.r * top.a + bottom.r * bottom.a * (1 - top.a)) / a,
        g: (top.g * top.a + bottom.g * bottom.a * (1 - top.a)) / a,
        b: (top.b * top.a + bottom.b * bottom.a * (1 - top.a)) / a,
        a,
      };
    };
    const linear = (channel) => {
      const c = channel / 255;
      return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const luminance = (color) => 0.2126 * linear(color.r) + 0.7152 * linear(color.g) + 0.0722 * linear(color.b);
    const fg = parse(getComputedStyle(element).color);
    const backgrounds = [];
    let node = element;
    while (node instanceof Element) {
      backgrounds.push(parse(getComputedStyle(node).backgroundColor));
      node = node.parentElement;
    }
    let bg = { r: 255, g: 255, b: 255, a: 1 };
    for (let index = backgrounds.length - 1; index >= 0; index -= 1) bg = composite(backgrounds[index], bg);
    const paintedFg = composite(fg, bg);
    const l1 = luminance(paintedFg);
    const l2 = luminance(bg);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return {
      text: element.textContent?.trim().slice(0, 80) ?? "",
      color: getComputedStyle(element).color,
      background: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
      fontSize: getComputedStyle(element).fontSize,
      ratio,
    };
  });
}

test("normal learner support and metadata text meet WCAG AA in light and dark themes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const theme of ["light", "dark"]) {
    await page.goto("/mastery");
    await page.evaluate((value) => {
      localStorage.setItem("live-cash-os:theme", value);
      document.documentElement.dataset.theme = value;
      document.documentElement.style.colorScheme = value;
    }, theme);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const samples = [
      page.locator("main .support:visible").first(),
      page.locator("main .practical-domain-card__meta span:visible").first(),
      page.locator("main .eyebrow:visible").first(),
    ];
    for (const sample of samples) {
      await expect(sample).toBeVisible();
      const measured = await computedContrast(sample);
      expect(Number.parseFloat(measured.fontSize)).toBeLessThan(24);
      expect(measured.ratio, `${theme}: ${measured.text} ${measured.color} on ${measured.background}`).toBeGreaterThanOrEqual(4.5);
    }
  }
});
