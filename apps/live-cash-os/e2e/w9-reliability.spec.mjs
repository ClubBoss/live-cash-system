import { expect, test } from "@playwright/test";

const API = "**/api/state";
const LOCAL_KEY = "live-cash-os:learner-state";
const SYNC_KEY = "live-cash-os:sync-meta";
const RECOVERY_KEY = "live-cash-os:recovery-backup";
const CONFLICT_KEY = "live-cash-os:sync-conflict";

async function storedState(page) {
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key), LOCAL_KEY)).not.toBeNull();
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)), LOCAL_KEY);
}

function runtime(state, overrides = {}) {
  return {
    appVersion: state.appVersion,
    contentVersion: state.contentVersion,
    schemaVersion: state.schemaVersion,
    ...overrides,
  };
}

async function bootLocalTemplate(page) {
  await page.route(API, async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  const state = await storedState(page);
  await page.unroute(API);
  return state;
}

function makeMeaningful(state, suffix = "base") {
  const next = structuredClone(state);
  next.modules.geometry.contentCompleted = true;
  next.modules.geometry.lessonStep = 10;
  next.modules.geometry.completedBlocks = Math.max(1, next.modules.geometry.completedBlocks);
  next.revision = Math.max(8, next.revision + 8);
  next.updatedAt = `2026-08-07T12:00:0${suffix === "remote" ? "2" : "1"}.000Z`;
  return next;
}

async function installCloudServer(page, initialState, options = {}) {
  const server = {
    state: initialState ? structuredClone(initialState) : null,
    token: "cloud-1",
    deleted: false,
    failPost: Boolean(options.failPost),
    failGet: Boolean(options.failGet),
    forceConflict: Boolean(options.forceConflict),
    postBodies: [],
    deleteCount: 0,
  };

  await page.route(API, async (route) => {
    const request = route.request();
    const method = request.method();
    const rt = runtime(server.state ?? options.runtimeTemplate, options.runtimeOverrides);

    if (method === "GET") {
      if (server.failGet) {
        await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ code: "CLOUD_STORAGE_UNAVAILABLE", runtime: rt }) });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          state: server.deleted ? null : server.state,
          cloudDeleted: server.deleted,
          cloudToken: server.token,
          runtime: rt,
        }),
      });
      return;
    }

    if (method === "DELETE") {
      server.deleteCount += 1;
      server.deleted = true;
      server.state = null;
      server.token = `cloud-delete-${server.deleteCount}`;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, cloudDeleted: true, cloudToken: server.token, runtime: rt }),
      });
      return;
    }

    if (method === "POST") {
      const body = request.postDataJSON();
      server.postBodies.push(body);
      if (server.failPost) {
        await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ code: "CLOUD_STORAGE_UNAVAILABLE", runtime: rt }) });
        return;
      }
      if (server.deleted && body.resumeCloudSync !== true) {
        await route.fulfill({
          status: 410,
          contentType: "application/json",
          body: JSON.stringify({ code: "CLOUD_STATE_DELETED", cloudDeleted: true, cloudToken: server.token, runtime: rt }),
        });
        return;
      }
      if (server.forceConflict) {
        await route.fulfill({
          status: 409,
          contentType: "application/json",
          body: JSON.stringify({ code: "STATE_CONFLICT", state: server.state, cloudToken: server.token, runtime: rt }),
        });
        return;
      }
      server.deleted = false;
      server.state = structuredClone(body.state);
      server.token = `cloud-${server.postBodies.length + 1}`;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, revision: server.state.revision, cloudToken: server.token, runtime: rt }),
      });
      return;
    }

    await route.fallback();
  });

  return server;
}

test("fresh device restores meaningful cloud state before any local overwrite", async ({ page }) => {
  const template = await bootLocalTemplate(page);
  const remote = makeMeaningful(template, "remote");
  const server = await installCloudServer(page, remote, { runtimeTemplate: template });

  await page.evaluate(({ localKey, syncKey }) => {
    localStorage.removeItem(localKey);
    localStorage.removeItem(syncKey);
  }, { localKey: LOCAL_KEY, syncKey: SYNC_KEY });
  await page.reload();

  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  const restored = await storedState(page);
  expect(restored.revision).toBe(remote.revision);
  expect(restored.modules.geometry.contentCompleted).toBe(true);

  await page.waitForTimeout(1_000);
  for (const body of server.postBodies) {
    expect(body.state.modules.geometry.contentCompleted).toBe(true);
    expect(body.state.revision).toBeGreaterThanOrEqual(remote.revision);
  }
});

test("divergent local and cloud histories preserve both and require explicit recovery", async ({ page }) => {
  const template = await bootLocalTemplate(page);
  const local = makeMeaningful(template, "local");
  const remote = makeMeaningful(template, "remote");
  local.fieldNotes.push({ id: "local-hand", at: "2026-08-07T12:01:00.000Z", moduleId: "geometry", cue: "local cue", action: "local action", reason: "local reason", cueBeforeAction: true, status: "PENDING_REVIEW", evaluatorNote: "" });
  remote.fieldNotes.push({ id: "remote-hand", at: "2026-08-07T12:01:01.000Z", moduleId: "geometry", cue: "remote cue", action: "remote action", reason: "remote reason", cueBeforeAction: true, status: "PENDING_REVIEW", evaluatorNote: "" });
  local.revision = 12;
  remote.revision = 12;
  const server = await installCloudServer(page, remote, { runtimeTemplate: template });

  await page.evaluate(({ key, syncKey, state }) => {
    localStorage.setItem(key, JSON.stringify(state));
    localStorage.removeItem(syncKey);
  }, { key: LOCAL_KEY, syncKey: SYNC_KEY, state: local });
  await page.reload();

  await expect(page.locator(".notice").getByText(/Обнаружены две разные версии прогресса/i)).toBeVisible();
  const live = await storedState(page);
  expect(live.fieldNotes.some((row) => row.id === "local-hand")).toBe(true);
  const backup = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), CONFLICT_KEY);
  expect(backup.local.fieldNotes.some((row) => row.id === "local-hand")).toBe(true);
  expect(backup.remote.fieldNotes.some((row) => row.id === "remote-hand")).toBe(true);

  await page.getByRole("button", { name: "Данные", exact: true }).click();
  await expect(page.getByText(/Сначала сравни ключевые факты/i)).toBeVisible();
  const comparison = page.getByLabel("Сравнение версий прогресса");
  await expect(comparison).toBeVisible();
  await expect(comparison.getByText("Эта копия", { exact: true })).toBeVisible();
  await expect(comparison.getByText("Облачная копия", { exact: true })).toBeVisible();
  await expect(comparison.getByText(/Revision: 12/)).toHaveCount(2);
  await expect(comparison.getByText(/Реальные руки: 1/)).toHaveCount(2);
  await expect(comparison.getByText(/Сохранённая сессия:/)).toHaveCount(2);
  await page.waitForTimeout(1_000);
  expect(server.postBodies).toHaveLength(0);
});

test("network save failure keeps local progress and retry can acknowledge it", async ({ page }) => {
  const template = await bootLocalTemplate(page);
  const remote = makeMeaningful(template, "remote");
  const server = await installCloudServer(page, remote, { runtimeTemplate: template });
  await page.evaluate(({ key, syncKey }) => {
    localStorage.removeItem(key);
    localStorage.removeItem(syncKey);
  }, { localKey: LOCAL_KEY, syncKey: SYNC_KEY });
  await page.reload();
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  await page.waitForTimeout(1_000);
  server.failPost = true;

  await page.getByRole("button", { name: "Учиться", exact: true }).click();
  await page.getByRole("button", { name: /^Повторить урок|^Изучить/ }).first().click();
  await expect(page.getByText("1 · РЕШИ БЕЗ ПОДСКАЗКИ")).toBeVisible();
  await page.waitForTimeout(1_100);
  const local = await storedState(page);
  expect(local.activeSession).not.toBeNull();

  await page.getByRole("button", { name: "Данные", exact: true }).click();
  await expect(page.locator(".notice").getByText(/Облачное сохранение сейчас недоступно/i)).toBeVisible();
  server.failPost = false;
  await page.getByRole("button", { name: "Повторить синхронизацию", exact: true }).click();
  await expect(page.getByText("Синхронизировано", { exact: true })).toBeVisible();
  expect(server.state.activeSession).not.toBeNull();
});

test("cloud deletion remains local-only and does not resurrect after later mutations", async ({ page }) => {
  const template = await bootLocalTemplate(page);
  const remote = makeMeaningful(template, "remote");
  const server = await installCloudServer(page, remote, { runtimeTemplate: template });
  await page.evaluate(({ key, syncKey }) => {
    localStorage.removeItem(key);
    localStorage.removeItem(syncKey);
  }, { key: LOCAL_KEY, syncKey: SYNC_KEY });
  await page.reload();
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  await page.waitForTimeout(1_000);

  await page.getByRole("button", { name: "Данные", exact: true }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Удалить облачную копию", exact: true }).click();
  await expect(page.getByText("только локально", { exact: true })).toBeVisible();
  const postsAtDelete = server.postBodies.length;

  await page.getByRole("button", { name: "Учиться", exact: true }).click();
  await page.getByRole("button", { name: /^Повторить урок|^Изучить/ }).first().click();
  await expect(page.getByText("1 · РЕШИ БЕЗ ПОДСКАЗКИ")).toBeVisible();
  await page.waitForTimeout(1_100);
  expect(server.postBodies).toHaveLength(postsAtDelete);
  const meta = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), SYNC_KEY);
  expect(meta.cloudDisabled).toBe(true);
});

test("malformed localStorage is quarantined and the app remains recoverable", async ({ page }) => {
  await bootLocalTemplate(page);
  await page.route(API, async (route) => route.fulfill({ status: 401, contentType: "application/json", body: "{}" }));
  const broken = "{not-json";
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: LOCAL_KEY, value: broken });
  await page.reload();

  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  await expect(page.locator(".notice").getByText(/Локальная копия потребовала восстановления/i)).toBeVisible();
  const preserved = await page.evaluate((key) => localStorage.getItem(key), RECOVERY_KEY);
  expect(preserved).toBe(broken);
});

test("future local schema is preserved and not downgraded destructively", async ({ page }) => {
  await bootLocalTemplate(page);
  await page.route(API, async (route) => route.fulfill({ status: 401, contentType: "application/json", body: "{}" }));
  const future = JSON.stringify({ schemaVersion: 99, revision: 500, futurePayload: { keep: "me" } });
  await page.evaluate(({ key, syncKey, value }) => {
    localStorage.setItem(key, value);
    localStorage.removeItem(syncKey);
  }, { key: LOCAL_KEY, syncKey: SYNC_KEY, value: future });
  await page.reload();

  await expect(page.locator(".notice").getByText(/Версии приложения и сохранённых данных не совпадают/i)).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), LOCAL_KEY)).toBe(future);
  expect(await page.evaluate((key) => localStorage.getItem(key), RECOVERY_KEY)).toBe(future);
});

test("state endpoint outage at startup keeps a valid local session usable", async ({ page }) => {
  const template = await bootLocalTemplate(page);
  await page.route(API, async (route) => route.abort("failed"));
  const local = makeMeaningful(template, "local");
  local.activeSession = {
    mode: "lesson",
    moduleId: "geometry",
    step: 0,
    drillIds: ["geo-01"],
    currentIndex: 0,
    selectedActionId: null,
    selectedReasonId: null,
    confidence: 65,
    startedAt: "2026-08-07T12:00:00.000Z",
    itemStartedAt: "2026-08-07T12:00:00.000Z",
    explainBack: "",
  };
  await page.evaluate(({ key, syncKey, state }) => {
    localStorage.setItem(key, JSON.stringify(state));
    localStorage.removeItem(syncKey);
  }, { key: LOCAL_KEY, syncKey: SYNC_KEY, state: local });
  await page.reload();

  await expect(page.getByText(/РЕШИ БЕЗ ПОДСКАЗКИ/).last()).toBeVisible();
  const restored = await storedState(page);
  expect(restored.activeSession.moduleId).toBe("geometry");
  await expect(page.locator(".notice").getByText(/Нет сети/i)).toBeVisible();
});

test("server runtime skew blocks cloud mutation and asks for refresh", async ({ page }) => {
  const template = await bootLocalTemplate(page);
  const local = makeMeaningful(template, "local");
  const server = await installCloudServer(page, local, {
    runtimeTemplate: template,
    runtimeOverrides: { contentVersion: "stale-content-version" },
  });
  await page.evaluate(({ key, syncKey, state }) => {
    localStorage.setItem(key, JSON.stringify(state));
    localStorage.removeItem(syncKey);
  }, { key: LOCAL_KEY, syncKey: SYNC_KEY, state: local });
  await page.reload();

  await expect(page.locator(".notice").getByText(/Версии приложения и сохранённых данных не совпадают/i)).toBeVisible();
  await page.waitForTimeout(1_000);
  expect(server.postBodies).toHaveLength(0);
});

test("data screen explains private learning text and keeps raw debug content hidden", async ({ page }) => {
  await page.route(API, async (route) => route.fulfill({ status: 401, contentType: "application/json", body: "{}" }));
  await page.goto("/");
  await page.getByRole("button", { name: "Данные", exact: true }).click();
  await expect(page.getByText(/ответы T1, сохранённые объяснения и записанные реальные руки/i)).toBeVisible();
  await expect(page.getByText(/не отправляются автоматически на AI-разбор/i)).toBeVisible();
  await page.getByText("Техническая диагностика", { exact: true }).click();
  await expect(page.getByText(/Диагностический экспорт не содержит тексты T1/i)).toBeVisible();
});
