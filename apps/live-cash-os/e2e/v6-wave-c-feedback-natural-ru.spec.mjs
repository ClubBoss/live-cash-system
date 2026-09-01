import { expect, test } from "@playwright/test";
import { reachPersistedSkillTargets } from "./practical-fixture-authority.mjs";
import { practicalSkillCorpusCanReach } from "../lib/practical-mastery-core.ts";
import { practicalSkillFamilies } from "../content/practical-mastery/index.ts";

const LEARNER_KEY = "live-cash-os:learner-state";
// Legacy-bridge and thin-corpus skills are permanently ceilinged below
// REAL_HAND_TRANSFER (applySourceEvidenceCeiling / practicalSkillCorpusCanReach);
// left untouched at their natural SOURCE_SUPPORTED state rather than forcing a
// value the canonical re-derivation could never legitimately produce.
const REAL_HAND_TRANSFER_TARGETS = practicalSkillFamilies
  .map((skill) => skill.id)
  .filter((skillId) => practicalSkillCorpusCanReach(skillId, "REAL_HAND_TRANSFER"))
  .map((skillId) => ({ skillId, targetStage: "REAL_HAND_TRANSFER" }));
const observedRuArtifacts = /небольшой открытие|преимущество диапазона сконцентрирован(?![А-Яа-яЁё])|концентрированный преимущество|расширение диапазон(?![А-Яа-яЁё])|позиция рейзер(?![А-Яа-яЁё])|(?:больше|меньше)\s+[А-Яа-яЁё-]+ых\s+сохранившиеся\s+комбинации|избирательный\s+доски\s+требуют|убира(?:ют|ет)\s+[А-Яа-яЁё-]*ые\s+кандидаты(?![А-Яа-яЁё])|конкретными\s+ран-ауты(?![А-Яа-яЁё])/iu;

async function seedSupportedPracticalSkills(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local V6 Wave C fixture" }) });
  });
  await page.goto("/mastery");
  await expect.poll(async () => page.evaluate((key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile?.mastery?.skills), LEARNER_KEY)).toBe(true);
  await restoreSupportedPracticalSkills(page);
}

async function restoreSupportedPracticalSkills(page) {
  await reachPersistedSkillTargets(page, LEARNER_KEY, REAL_HAND_TRANSFER_TARGETS);
}

async function revealTarget(page, focusSkillId, targetDecisionId) {
  await page.goto(`/mastery/session?focus=${focusSkillId}`);
  for (let step = 0; step < 10; step += 1) {
    const card = page.locator("section.today-card[data-practical-decision-id]");
    await expect(card).toBeVisible();
    const decisionId = await card.getAttribute("data-practical-decision-id");
    const actionInputs = card.locator("fieldset").nth(0).locator('input[type="radio"]');
    const reasonInputs = card.locator("fieldset").nth(1).locator('input[type="radio"]');
    if (decisionId === targetDecisionId) {
      await actionInputs.nth(1).check();
      await reasonInputs.nth(1).check();
      await card.getByRole("button", { name: /Ответить|Answer/ }).click();
      await expect(card.locator("[data-practical-correct-answer]")).toBeVisible();
      return card;
    }
    await actionInputs.first().check();
    await reasonInputs.first().check();
    await card.getByRole("button", { name: /Ответить|Answer/ }).click();
    await card.getByRole("button", { name: /Следующее решение|Next decision/ }).click();
    await expect.poll(() => card.getAttribute("data-practical-decision-id")).not.toBe(decisionId);
  }
  throw new Error(`Target decision ${targetDecisionId} was not reached in the bounded focused round`);
}

async function assertFocusedFamilyHasNaturalRu(page, focusSkillId) {
  await page.goto(`/mastery/session?focus=${focusSkillId}`);
  for (let step = 0; step < 8; step += 1) {
    const card = page.locator("section.today-card[data-practical-decision-id]");
    await expect(card).toBeVisible();
    expect(await card.innerText()).not.toMatch(observedRuArtifacts);
    await card.locator("fieldset").nth(0).locator('input[type="radio"]').first().check();
    await card.locator("fieldset").nth(1).locator('input[type="radio"]').first().check();
    await card.getByRole("button", { name: /Ответить/ }).click();
    expect(await card.innerText()).not.toMatch(observedRuArtifacts);
    if (step < 7) await card.getByRole("button", { name: /Следующее решение/ }).click();
  }
}

test("RU and EN focused feedback teaches mechanism and boundary across skill families while wrong answers stay corrective", async ({ page }) => {
  await seedSupportedPracticalSkills(page);

  const blindCard = await revealTarget(page, "BL-01", "PM-BL-01-106");
  const blindMechanism = blindCard.locator("[data-practical-feedback-mechanism]");
  const blindBoundary = blindCard.locator("[data-practical-feedback-boundary]");
  await expect(blindMechanism).toContainText(/Ключевой сигнал.*более ранняя позиция открытия/u);
  await expect(blindBoundary).toContainText(/фактический диапазон открытия/u);
  const blindCorrectReason = (await blindCard.locator("[data-practical-correct-answer] p").nth(1).innerText()).replace(/^Правильная причина:\s*/u, "").trim();
  expect((await blindMechanism.innerText()).trim()).not.toBe(blindCorrectReason);

  await restoreSupportedPracticalSkills(page);
  const oopCard = await revealTarget(page, "OOP-01", "PM-OOP-01-106");
  await page.getByLabel("Язык").getByRole("button", { name: "EN", exact: true }).click();
  const oopMechanism = oopCard.locator("[data-practical-feedback-mechanism]");
  const oopBoundary = oopCard.locator("[data-practical-feedback-boundary]");
  await expect(oopMechanism).toContainText(/Key signal: the flop became dry and high-card/u);
  await expect(oopBoundary).toContainText(/high-card flop by itself does not justify an automatic c-bet/u);
  const oopCorrectReason = (await oopCard.locator("[data-practical-correct-answer] p").nth(1).innerText()).replace(/^Correct reason:\s*/u, "").trim();
  expect((await oopMechanism.innerText()).trim()).not.toBe(oopCorrectReason);
});

test("observed Russian agreement artifacts stay absent through a focused blind-defense family", async ({ page }) => {
  await seedSupportedPracticalSkills(page);
  await assertFocusedFamilyHasNaturalRu(page, "BL-02");
});
