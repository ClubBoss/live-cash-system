import { expect, test } from "@playwright/test";

test("theme toggle is in the language control area and persists", async ({ page }) => {
  await page.goto("/tools");
  const root = page.locator("html");
  const toggle = page.locator(".topmeta").getByRole("switch", { name: "Темная тема / Dark theme" });
  await expect(toggle).toBeVisible();

  const before = await root.getAttribute("data-theme");
  expect(["light", "dark"]).toContain(before);
  await toggle.click();
  const after = await root.getAttribute("data-theme");
  expect(after).not.toBe(before);

  await page.reload();
  await expect(root).toHaveAttribute("data-theme", after);
});

test("theme toggle stays touch-safe without 360px overflow", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/tools");
  const toggle = page.locator(".topmeta").getByRole("switch", { name: "Темная тема / Dark theme" });
  const box = await toggle.boundingBox();
  expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  const size = await page.locator("html").evaluate((node) => ({ scroll: node.scrollWidth, client: node.clientWidth }));
  expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
});
