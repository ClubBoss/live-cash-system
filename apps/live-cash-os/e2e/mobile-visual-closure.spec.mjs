import { expect, test } from "@playwright/test";

async function openLocal(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
}

function contrastRatio(foreground, background) {
  const parse = (value) => value.match(/[\d.]+/g).slice(0, 3).map(Number).map((channel) => channel / 255);
  const luminance = (value) => {
    const [red, green, blue] = parse(value).map((channel) => channel <= 0.04045
      ? channel / 12.92
      : ((channel + 0.055) / 1.055) ** 2.4);
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

test("real-device mobile closure keeps Today action above the fold at 390x844", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLocal(page);

  const marker = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--mobile-visual-closure").trim());
  expect(marker).toBe("closure-20260808");

  const topbar = page.locator(".topbar");
  const topbarBox = await topbar.boundingBox();
  expect(topbarBox?.height ?? 999).toBeLessThan(80);

  const heading = page.getByRole("heading", { name: /Учись понемногу/i });
  const headingSize = Number.parseFloat(await heading.evaluate((element) => getComputedStyle(element).fontSize));
  expect(headingSize).toBeLessThanOrEqual(50);

  const tabs = page.getByRole("navigation", { name: "Основная навигация" });
  const tabCue = await tabs.evaluate((element) => ({
    mask: getComputedStyle(element).maskImage || getComputedStyle(element).webkitMaskImage,
    snap: getComputedStyle(element).scrollSnapType,
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }));
  expect(tabCue.scrollWidth).toBeGreaterThan(tabCue.clientWidth);
  expect(tabCue.mask).not.toBe("none");
  expect(tabCue.snap).toContain("x");

  const card = page.locator(".today-card");
  const radius = Number.parseFloat(await card.evaluate((element) => getComputedStyle(element).borderTopLeftRadius));
  expect(radius).toBeGreaterThanOrEqual(18);

  const start = page.getByRole("button", { name: "Начать", exact: true });
  await expect(start).toBeVisible();
  await expect(start).toBeInViewport();

  await page.screenshot({ path: testInfo.outputPath("today-390x844.png"), fullPage: true });
});

test("mobile header remains compact without horizontal document overflow at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await openLocal(page);

  const dimensions = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);

  for (const name of ["RU", "EN"]) {
    const box = await page.getByRole("button", { name, exact: true }).boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
  }

  const themeBox = await page.getByRole("switch", { name: "Темная тема" }).boundingBox();
  expect(themeBox?.height ?? 0).toBeGreaterThanOrEqual(44);
  expect(themeBox?.width ?? 0).toBeGreaterThanOrEqual(44);
});

test("dark theme follows system, persists, keeps contrast, and remains localized", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() => localStorage.removeItem("live-cash-os:theme"));
  await openLocal(page);

  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-theme", "dark");

  const toggle = page.getByRole("switch", { name: "Темная тема" });
  await expect(toggle).toHaveAttribute("aria-checked", "true");

  const contrast = await page.evaluate(() => {
    const body = getComputedStyle(document.body);
    const card = getComputedStyle(document.querySelector(".today-card"));
    return {
      bodyForeground: body.color,
      bodyBackground: body.backgroundColor,
      cardForeground: card.color,
      cardBackground: card.backgroundColor,
    };
  });
  expect(contrastRatio(contrast.bodyForeground, contrast.bodyBackground)).toBeGreaterThanOrEqual(7);
  expect(contrastRatio(contrast.cardForeground, contrast.cardBackground)).toBeGreaterThanOrEqual(7);

  await toggle.click();
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(toggle).toHaveAttribute("aria-checked", "false");
  expect(await page.evaluate(() => localStorage.getItem("live-cash-os:theme"))).toBe("light");

  await page.reload();
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  await expect(root).toHaveAttribute("data-theme", "light");

  await page.getByRole("button", { name: "EN", exact: true }).click();
  const englishToggle = page.getByRole("switch", { name: "Dark theme" });
  await expect(englishToggle).toHaveAttribute("aria-checked", "false");
  await englishToggle.click();
  await expect(root).toHaveAttribute("data-theme", "dark");
});
