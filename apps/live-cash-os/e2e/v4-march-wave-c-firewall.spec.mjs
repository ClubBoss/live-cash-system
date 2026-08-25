import { expect, test } from "@playwright/test";

const internalMetadata = /POSITIVE_EV_SOURCE_ACCESS_REQUIRED|sourceRefs|\b(?:FND|PF|BL|W4(?:-HAND|-BOARD|-RUNOUT)?|OOP|IP|3BP|4BP|TURN|RIV|MW|DEEP|EXP)-\d{2}(?:-\d+)?\b|\b(?:FTGU(?:[- ]?E)?\d+|SLC-[A-Z0-9-]+|CINJ-E\d+|CP-G\d+-L\d+|LCM-\d+)\b|(?:^|\s)E\d{2}(?=\s|$)|(?:^|\s)B1(?=\s|$)/i;

async function openBvBSourceLimit(page) {
  await page.goto("/mastery");
  const group = page.locator("details").filter({ has: page.locator("button").filter({ hasText: /BvB 3-bet pots/i }) });
  await expect(group).toHaveCount(1);
  await group.locator("summary").click();
  await group.getByRole("button", { name: /BvB 3-bet pots/i }).click();
}

test("Wave C RU learner surfaces expose natural copy without machine metadata", async ({ page }) => {
  await page.goto("/mastery/study");
  const main = page.locator("main");
  await expect(main).toBeVisible();
  await expect(page.getByText("Твоя сохранённая заметка на эту сессию", { exact: true })).toBeVisible();
  await expect(page.getByText(/поле не заменяет её и не обновляется автоматически/i)).toBeVisible();
  await expect(main).not.toContainText(internalMetadata);
  await expect(main).not.toContainText(/Источники\s*:/i);

  await openBvBSourceLimit(page);
  await expect(page.getByText("ПОКА ЕСТЬ ОГРАНИЧЕНИЕ", { exact: true })).toBeVisible();
  await expect(page.locator("main")).toContainText(/недостаточно, чтобы честно задавать точные частоты/i);
  await expect(page.locator("main")).not.toContainText(internalMetadata);
});

test("Wave C EN learner surfaces expose natural copy without governance sentinels", async ({ page }) => {
  await page.goto("/mastery");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.goto("/mastery/study");
  const main = page.locator("main");
  await expect(page.getByText("Your saved session note", { exact: true })).toBeVisible();
  await expect(page.getByText(/neither replaces it nor updates automatically/i)).toBeVisible();
  await expect(main).not.toContainText(internalMetadata);
  await expect(main).not.toContainText(/Sources\s*:/i);

  await openBvBSourceLimit(page);
  await expect(page.getByText("CURRENT LIMIT", { exact: true })).toBeVisible();
  await expect(page.locator("main")).toContainText(/available material is not sufficient to present exact frequencies/i);
  await expect(page.locator("main")).not.toContainText(internalMetadata);
});
