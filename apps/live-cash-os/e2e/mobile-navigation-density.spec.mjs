import { expect, test } from "@playwright/test";

const destinations = [
  { labelRu: "Главная", labelEn: "Home", href: "/mastery" },
  { labelRu: "Продолжить обучение", labelEn: "Continue learning", href: "/mastery/journey" },
  { labelRu: "Улучшить", labelEn: "Improve", href: "/mastery/improve" },
  { labelRu: "Чтение стола", labelEn: "Table reading", href: "/mastery/perception" },
  { labelRu: "После игры", labelEn: "After play", href: "/mastery/study" },
  { labelRu: "Справочник", labelEn: "Reference", href: "/mastery/reference" },
];

for (const viewport of [
  { name: "narrow-320", width: 320, height: 700, maxNavHeight: 255 },
  { name: "mobile-390", width: 390, height: 844, maxNavHeight: 245 },
]) {
  test(`mobile navigation stays fully accessible and compact at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.route("**/api/state", (route) => route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "navigation visual test" }),
    }));
    await page.goto("/mastery/journey");
    const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
    await expect(nav).toBeVisible();
    const fullNavBox = await nav.boundingBox();
    expect(fullNavBox).not.toBeNull();
    expect(fullNavBox.height).toBeLessThanOrEqual(viewport.maxNavHeight);
    await expect(nav.locator(".practical-mastery-nav__rail > a")).toHaveCount(6);

    for (const destination of destinations) {
      const link = nav.getByRole("link", { name: destination.labelRu, exact: true });
      await expect(link).toHaveAttribute("href", destination.href);
      await expect(link).toBeVisible();
      const box = await link.boundingBox();
      expect(box).not.toBeNull();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }

    const brand = await nav.locator(".practical-mastery-nav__brand").boundingBox();
    const sync = await nav.getByTestId("practical-sync-status").boundingBox();
    const mode = await nav.locator(".mode-switch").boundingBox();
    const data = await nav.getByTestId("data-recovery-entry").boundingBox();
    expect(brand).not.toBeNull();
    expect(sync).not.toBeNull();
    expect(mode).not.toBeNull();
    expect(data).not.toBeNull();
    expect(Math.abs(brand.y - sync.y)).toBeLessThan(9);
    expect(Math.abs(mode.y - data.y)).toBeLessThan(9);
    expect(data.height).toBeGreaterThanOrEqual(44);
    await expect(nav.getByTestId("data-recovery-entry")).toHaveAttribute("href", "/tools?tab=data");
    await expect(nav.getByRole("link", { name: "Реальные руки →" })).toHaveAttribute("href", "/tools?tab=field");
    await expect(nav.getByRole("link", { name: "Продолжить обучение", exact: true })).toHaveAttribute("aria-current", "page");
    for (const language of ["RU", "EN"]) {
      const button = nav.getByRole("button", { name: language, exact: true });
      const box = await button.boundingBox();
      expect(box).not.toBeNull();
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);

    await nav.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(nav.getByRole("link", { name: "Continue learning", exact: true })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByTestId("practical-sync-status")).toHaveText(/Cloud|On device/);
    for (const destination of destinations) {
      await expect(nav.getByRole("link", { name: destination.labelEn, exact: true })).toHaveAttribute("href", destination.href);
    }
    const enNavBox = await nav.boundingBox();
    expect(enNavBox.height).toBeLessThanOrEqual(viewport.maxNavHeight);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);

    await nav.getByRole("link", { name: "After play", exact: true }).click();
    await expect(page).toHaveURL(/\/mastery\/study$/);
    await expect(page.getByRole("navigation", { name: "Practical Mastery navigation" })
      .getByRole("link", { name: "After play", exact: true })).toHaveAttribute("aria-current", "page");
  });
}
