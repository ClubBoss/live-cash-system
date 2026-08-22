import { expect, test } from "@playwright/test";

test("Practical Mastery primary navigation is keyboard reachable with visible focus", async ({ page }) => {
  await page.goto("/mastery");
  const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav).toBeVisible();
  const learn = nav.getByRole("link", { name: "Учиться", exact: true });
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
  await expect(page.getByRole("link", { name: "Учиться", exact: true })).toHaveAttribute("aria-current", "page");
});
