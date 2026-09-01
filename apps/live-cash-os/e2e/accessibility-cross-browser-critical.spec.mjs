import { expect, test } from "@playwright/test";

test("Practical Mastery primary navigation is keyboard reachable with visible focus", async ({ page }) => {
  await page.goto("/mastery");
  const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav).toBeVisible();
  const learn = nav.getByRole("link", { name: "Продолжить обучение", exact: true });
  await expect(learn).toBeVisible();

  let reachedLearn = false;
  for (let step = 0; step < 20; step += 1) {
    await page.keyboard.press("Tab");
    reachedLearn = await learn.evaluate((element) => element === document.activeElement);
    if (reachedLearn) break;
  }
  expect(reachedLearn, "Tab order must reach the primary Learn link").toBe(true);

  const focusStyle = await learn.evaluate((element) => {
    const style = getComputedStyle(element);
    return { outlineStyle: style.outlineStyle, outlineWidth: Number.parseFloat(style.outlineWidth) || 0 };
  });
  expect(focusStyle.outlineStyle).not.toBe("none");
  expect(focusStyle.outlineWidth).toBeGreaterThan(0);

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  await expect(page.getByRole("link", { name: "Продолжить обучение", exact: true })).toHaveAttribute("aria-current", "page");
});

const mobileNavCases = [
  { locale: "RU", labels: ["Главная", "Продолжить обучение", "Улучшить", "Чтение стола", "После игры", "Справочник"] },
  { locale: "EN", labels: ["Home", "Continue learning", "Improve", "Table reading", "After play", "Reference"] },
];

test("V3-10 Practical navigation fits every destination at 390x844 in RU and EN", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const { locale, labels } of mobileNavCases) {
    await page.goto("/mastery");
    const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
    await nav.getByRole("button", { name: locale, exact: true }).click();

    const rail = nav.locator(".practical-mastery-nav__rail");
    const links = rail.locator(".practical-mastery-nav__item");
    await expect(links).toHaveCount(6);

    for (const label of labels) {
      await expect(rail.getByRole("link", { name: label, exact: true })).toBeVisible();
    }

    const geometry = await rail.evaluate((element) => {
      const railRect = element.getBoundingClientRect();
      const itemRects = [...element.querySelectorAll(".practical-mastery-nav__item")].map((item) => {
        const rect = item.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width, height: rect.height };
      });
      return {
        rail: { left: railRect.left, right: railRect.right },
        clientWidth: element.clientWidth,
        scrollWidth: element.scrollWidth,
        documentClientWidth: document.documentElement.clientWidth,
        documentScrollWidth: document.documentElement.scrollWidth,
        itemRects,
      };
    });

    expect(geometry.documentScrollWidth).toBeLessThanOrEqual(geometry.documentClientWidth + 1);
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
    for (const rect of geometry.itemRects) {
      expect(rect.left).toBeGreaterThanOrEqual(geometry.rail.left - 1);
      expect(rect.right).toBeLessThanOrEqual(geometry.rail.right + 1);
      expect(rect.width).toBeGreaterThanOrEqual(44);
      expect(rect.height).toBeGreaterThanOrEqual(44);
    }

    await links.first().focus();
    for (let index = 0; index < 5; index += 1) {
      await expect(links.nth(index)).toBeFocused();
      if (index < 4) await page.keyboard.press("Tab");
    }
    await expect(rail.getByRole("link", { name: labels.at(-1), exact: true })).toBeFocused();
  }
});
