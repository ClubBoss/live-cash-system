"use client";

import { useState } from "react";
import { APP_VERSION, CONTENT_VERSION, STATE_SCHEMA_VERSION, saveActiveSession, type LearnerState, type LocaleCode } from "../lib/model";
import { buildSafeDebugSummary } from "../lib/reliability";
import type { RecoveryCode, ReliableLearnerStateController, SyncStatus } from "../lib/use-learner-state-sync";

function downloadJson(filename: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadText(filename: string, value: string) {
  const url = URL.createObjectURL(new Blob([value], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function importFailure(locale: LocaleCode, reason?: string) {
  const ru = locale === "ru";
  if (reason === "unsupported_future_schema") {
    return ru ? "Этот файл создан более новой версией приложения. Обнови приложение и повтори импорт." : "This file was created by a newer app version. Update the app before importing it.";
  }
  if (reason === "malformed_json") return ru ? "Файл не является корректным JSON." : "The file is not valid JSON.";
  return ru ? "Файл прогресса не прошёл проверку и ничего не изменил." : "The progress file failed validation and nothing was changed.";
}

function syncStatusLabel(locale: LocaleCode, status: SyncStatus) {
  const ru = locale === "ru";
  const labels: Record<SyncStatus, [string, string]> = {
    loading: ["Загрузка…", "Loading…"],
    local: ["Сохранено на устройстве", "Saved on this device"],
    syncing: ["Синхронизация…", "Syncing…"],
    synced: ["Синхронизировано", "Synced"],
    offline: ["Нет сети — сохранено локально", "Offline — saved locally"],
    conflict: ["Нужно выбрать версию", "Choose a progress version"],
    error: ["Синхронизация требует внимания", "Sync needs attention"],
  };
  return labels[status][ru ? 0 : 1];
}

function createPortableProfileCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  const encoded = btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  return `LCO-${encoded.toUpperCase()}`;
}

function recoveryMessage(locale: LocaleCode, code: Exclude<RecoveryCode, null>) {
  const ru = locale === "ru";
  const messages: Record<Exclude<RecoveryCode, null>, [string, string]> = {
    LOCAL_STATE_RECOVERED: [
      "Локальная копия прогресса была безопасно восстановлена после проверки.",
      "Your local progress copy was safely recovered after validation.",
    ],
    LOCAL_STATE_CORRUPT: [
      "Локальную копию не удалось безопасно прочитать. Исходные данные не были молча перезаписаны — используй сохранённую recovery-копию или облачную версию.",
      "The local copy could not be read safely. The original data was not silently overwritten — use the preserved recovery copy or the cloud version.",
    ],
    FUTURE_STATE_UNSUPPORTED: [
      "Эти данные созданы более новой версией приложения. Обнови приложение перед продолжением; исходная копия сохранена.",
      "This data was created by a newer app version. Update the app before continuing; the original copy was preserved.",
    ],
    CLOUD_STATE_UNREADABLE: [
      "Облачную копию не удалось безопасно прочитать. Локальный прогресс не был заменён.",
      "The cloud copy could not be read safely. Your local progress was not replaced.",
    ],
    STATE_CONFLICT: [
      "Найдены две разные версии прогресса. Ни одна не была удалена — выбери основную ниже.",
      "Two different progress versions were found. Neither was deleted — choose the version to keep below.",
    ],
    UPDATE_REQUIRED: [
      "Эта версия приложения слишком старая для безопасной синхронизации. Обнови или перезагрузи приложение перед следующей облачной записью.",
      "This app version is too old for safe sync. Update or reload the app before the next cloud write.",
    ],
    LOCAL_WRITE_FAILED: [
      "Не удалось надёжно сохранить прогресс на этом устройстве. Проверь доступное место и повтори действие перед продолжением обучения.",
      "Progress could not be saved reliably on this device. Check available storage and retry before continuing your session.",
    ],
    STATE_TOO_LARGE: [
      "Объём прогресса превышает лимит облачной копии. Локальная версия остаётся доступной; при необходимости экспортируй её перед дальнейшими изменениями.",
      "Your progress exceeds the cloud-copy size limit. The local version remains available; export it before further changes if needed.",
    ],
  };
  return messages[code][ru ? 0 : 1];
}

function progressSnapshot(value: LearnerState | null, locale: LocaleCode) {
  if (!value) return null;
  const now = Date.now();
  const completedLessons = Object.values(value.modules).filter((module) => module.contentCompleted).length;
  const dueItems = value.reviewQueue.filter((item) => Date.parse(item.dueAt) <= now).length;
  const active = value.activeSession
    ? `${value.activeSession.mode} · ${value.activeSession.moduleId}`
    : locale === "ru" ? "нет" : "none";
  return {
    updated: new Date(value.updatedAt).toLocaleString(locale === "ru" ? "ru-RU" : "en-US"),
    revision: value.revision,
    completedLessons,
    dueItems,
    hands: value.fieldNotes.length,
    active,
  };
}

export default function DataSafetyPanel({
  locale,
  controller,
  route,
}: {
  locale: LocaleCode;
  controller: ReliableLearnerStateController;
  route: string;
}) {
  const ru = locale === "ru";
  const {
    state,
    setState,
    syncStatus,
    cloudMode,
    recoveryCode,
    lastErrorCode,
    lastLocalSaveAt,
    lastCloudSaveAt,
    conflict,
    recoveryRaw,
    retrySync,
    deleteCloud,
    enableCloud,
    resolveConflictWithCloud,
    resolveConflictWithLocal,
    prepareImport,
    applyImport,
    resetLocal,
    portableProfileActive,
    activatePortableProfile,
    disconnectPortableProfile,
  } = controller;
  const [profileCode, setProfileCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  async function importState(file: File) {
    const prepared = prepareImport(await file.text());
    if (!prepared.ok || !prepared.candidate) {
      alert(importFailure(locale, prepared.reason));
      return;
    }
    if (prepared.requiresConfirmation) {
      const confirmed = confirm(ru
        ? "Этот снимок не доказан как продолжение текущего прогресса. Заменить текущий прогресс на этом устройстве? Перед заменой будет сохранена резервная копия."
        : "This snapshot is not proven to continue your current progress. Replace progress on this device? A backup will be saved first.");
      if (!confirmed) return;
    }
    if (!applyImport(prepared.candidate)) {
      alert(ru ? "Не удалось сохранить резервную копию. Импорт отменён." : "Could not save the backup. Import was cancelled.");
    }
  }

  async function removeCloud() {
    const confirmed = confirm(ru
      ? "Удалить облачную копию? Локальный прогресс останется на этом устройстве, а облачная синхронизация будет выключена до явного включения."
      : "Delete the cloud copy? Local progress stays on this device and cloud sync remains off until you explicitly enable it again.");
    if (confirmed) await deleteCloud();
  }

  async function resetDevice() {
    const message = cloudMode === "cloud"
      ? (ru ? "Сбросить локальную копию и заново загрузить облачную? Облачный прогресс не удаляется." : "Reset the local copy and reload the cloud copy? Cloud progress will not be deleted.")
      : (ru ? "Удалить локальный прогресс на этом устройстве? Облачной копии сейчас нет." : "Delete local progress on this device? Cloud sync is currently off.");
    if (confirm(message)) await resetLocal();
  }

  async function eraseAllProgress() {
    const confirmed = confirm(ru
      ? "Стереть весь прогресс этого профиля и начать с нуля? Будут удалены облачная и локальная копии, включая T1, уроки, повторы, карточки, explain-back и реальные руки. Отменить это действие нельзя, если заранее не экспортировать прогресс."
      : "Erase all progress for this profile and start from zero? Both cloud and local copies will be removed, including T1, lessons, reviews, cards, explain-back, and real hands. This cannot be undone unless you export progress first.");
    if (!confirmed) return;

    if (cloudMode === "cloud") {
      const deleted = await deleteCloud();
      if (!deleted) {
        alert(ru
          ? "Облачную копию удалить не удалось. Прогресс не был сброшен, чтобы не оставить две расходящиеся версии."
          : "The cloud copy could not be deleted. Progress was not reset to avoid leaving two diverging versions.");
        return;
      }
    }

    const reset = await resetLocal();
    if (!reset) {
      alert(ru
        ? "Локальный сброс не завершён. Перезагрузи страницу и проверь раздел данных перед продолжением."
        : "The local reset did not complete. Reload the page and check Data & Recovery before continuing.");
      return;
    }
    window.location.reload();
  }

  async function keepLocalConflict() {
    const confirmed = confirm(ru
      ? "Заменить облачную конфликтующую копию прогрессом с этого устройства? Обе версии уже сохранены для восстановления."
      : "Replace the conflicting cloud copy with this device copy? Both versions are already preserved for recovery.");
    if (confirmed) await resolveConflictWithLocal();
  }

  function useCloudConflict() {
    const confirmed = confirm(ru
      ? "Использовать облачную копию на этом устройстве? Локальная конфликтующая версия уже сохранена для восстановления."
      : "Use the cloud copy on this device? The conflicting local version is already preserved for recovery.");
    if (confirmed) resolveConflictWithCloud();
  }

  function abandonSession() {
    if (!state.activeSession) return;
    const confirmed = confirm(ru
      ? "Завершить сохранённую сессию без продолжения? Уже записанные решения и прогресс останутся."
      : "Abandon the saved session? Already recorded decisions and progress will remain.");
    if (confirmed) setState(saveActiveSession(state, null));
  }

  async function copyProfileCode() {
    if (!generatedCode) return;
    try { await navigator.clipboard.writeText(generatedCode); } catch { /* code remains visible for manual copy */ }
  }

  function activateGeneratedProfile() {
    if (!generatedCode) return;
    activatePortableProfile(generatedCode);
  }

  function activateEnteredProfile() {
    if (!activatePortableProfile(profileCode)) {
      alert(ru ? "Проверь код профиля: он начинается с LCO-." : "Check the profile code: it starts with LCO-.");
    }
  }

  const debugSummary = () => buildSafeDebugSummary({
    state,
    locale,
    syncStatus,
    cloudMode,
    lastLocalSaveAt,
    lastCloudSaveAt,
    route,
    online: typeof navigator === "undefined" ? true : navigator.onLine,
    lastErrorCode,
  });
  const localConflictSummary = conflict ? progressSnapshot(conflict.local, locale) : null;
  const cloudConflictSummary = conflict ? progressSnapshot(conflict.remote, locale) : null;

  return <section className="surface">
    <div className="section-head">
      <p className="eyebrow">{ru ? "ДАННЫЕ И ВОССТАНОВЛЕНИЕ" : "DATA & RECOVERY"}</p>
      <h1>{ru ? "Прогресс остаётся под твоим контролем." : "Your progress stays under your control."}</h1>
      <p>{ru
        ? "Прогресс хранится локально. Подключи личный профиль, чтобы продолжать на другом устройстве без ChatGPT-аккаунта. В него входят ответы T1, сохранённые объяснения и записанные реальные руки. Эти тексты не отправляются автоматически на AI-разбор."
        : "Progress is stored locally. Connect a personal profile to continue on another device without a ChatGPT account. It includes T1 answers, saved explanations, and recorded real hands. Those texts are not automatically sent for AI evaluation."}</p>
    </div>

    <div className="counterexample">
      <b>{portableProfileActive
        ? (ru ? "Профиль обучения подключён" : "Learning profile connected")
        : (ru ? "Продолжай на другом устройстве" : "Continue on another device")}</b>
      {portableProfileActive ? <>
        <p>{ru ? "Этот браузер привязан к личному профилю. Не удаляй его код, пока не подключишь другое устройство." : "This browser is connected to a personal profile. Keep its code until another device is connected."}</p>
        <button className="secondary" onClick={disconnectPortableProfile}>{ru ? "Отключить этот профиль на устройстве" : "Disconnect this profile on this device"}</button>
      </> : <>
        <p>{ru ? "Создай личный код на этом устройстве, сохрани его в менеджер паролей и введи на телефоне. Код — это ключ к прогрессу; никому его не отправляй." : "Create a personal code here, save it in a password manager, then enter it on your phone. The code is the key to your progress; never share it."}</p>
        {!generatedCode ? <button className="secondary" onClick={() => setGeneratedCode(createPortableProfileCode())}>{ru ? "Создать личный код" : "Create personal code"}</button> : <div className="profile-code">
          <code>{generatedCode}</code>
          <div className="button-row">
            <button className="secondary" onClick={() => void copyProfileCode()}>{ru ? "Скопировать код" : "Copy code"}</button>
            <button className="secondary" onClick={activateGeneratedProfile}>{ru ? "Я сохранил код — включить синхронизацию" : "I saved it — enable sync"}</button>
          </div>
        </div>}
        <div className="profile-join">
          <label htmlFor="profile-code">{ru ? "Уже есть код? Введи его на новом устройстве" : "Already have a code? Enter it on the new device"}</label>
          <div className="button-row">
            <input id="profile-code" value={profileCode} onChange={(event) => setProfileCode(event.target.value)} placeholder="LCO-…" autoCapitalize="characters" autoCorrect="off" />
            <button className="secondary" onClick={activateEnteredProfile}>{ru ? "Продолжить с этим профилем" : "Continue with this profile"}</button>
          </div>
        </div>
      </>}
    </div>

    <div className="debug-grid">
      <div><span>{ru ? "Режим" : "Mode"}</span><b>{cloudMode === "cloud" ? (ru ? "локально + облако" : "local + cloud") : (ru ? "только локально" : "local only")}</b></div>
      <div><span>{ru ? "Синхронизация" : "Sync"}</span><b>{syncStatusLabel(locale, syncStatus)}</b></div>
      <div><span>{ru ? "Локально сохранено" : "Local save"}</span><b>{lastLocalSaveAt ? new Date(lastLocalSaveAt).toLocaleString() : "—"}</b></div>
      <div><span>{ru ? "Облако сохранено" : "Cloud save"}</span><b>{lastCloudSaveAt ? new Date(lastCloudSaveAt).toLocaleString() : "—"}</b></div>
    </div>

    {recoveryCode && <div className="notice" role="status" aria-live="polite"><span>{recoveryMessage(locale, recoveryCode)}</span></div>}

    {conflict && <div className="counterexample">
      <b>{ru ? "Обнаружены две разные версии прогресса" : "Two different progress versions were found"}</b>
      <p>{ru ? "Ни одна версия не была автоматически отброшена. Сначала сравни ключевые факты, затем выбери, какую сделать основной." : "Neither version was discarded automatically. Compare the key facts first, then choose which copy should become authoritative."}</p>
      <div className="compare-lab" aria-label={ru ? "Сравнение версий прогресса" : "Progress version comparison"}>
        {localConflictSummary && <article>
          <b>{ru ? "Эта копия" : "This device copy"}</b>
          <p>{ru ? "Обновлено" : "Updated"}: {localConflictSummary.updated}</p>
          <p>Revision: {localConflictSummary.revision}</p>
          <p>{ru ? "Уроки" : "Lessons"}: {localConflictSummary.completedLessons}/11</p>
          <p>{ru ? "Срочные повторы" : "Due items"}: {localConflictSummary.dueItems}</p>
          <p>{ru ? "Реальные руки" : "Real hands"}: {localConflictSummary.hands}</p>
          <p>{ru ? "Сохранённая сессия" : "Saved session"}: {localConflictSummary.active}</p>
        </article>}
        <article>
          <b>{ru ? "Облачная копия" : "Cloud copy"}</b>
          {cloudConflictSummary ? <>
            <p>{ru ? "Обновлено" : "Updated"}: {cloudConflictSummary.updated}</p>
            <p>Revision: {cloudConflictSummary.revision}</p>
            <p>{ru ? "Уроки" : "Lessons"}: {cloudConflictSummary.completedLessons}/11</p>
            <p>{ru ? "Срочные повторы" : "Due items"}: {cloudConflictSummary.dueItems}</p>
            <p>{ru ? "Реальные руки" : "Real hands"}: {cloudConflictSummary.hands}</p>
            <p>{ru ? "Сохранённая сессия" : "Saved session"}: {cloudConflictSummary.active}</p>
          </> : <p>{ru ? "Облачная версия недоступна для чтения; не выбирай её как основную." : "The cloud copy is not readable; do not choose it as authoritative."}</p>}
        </article>
      </div>
      <div className="button-row">
        <button className="secondary" disabled={!conflict.remote} onClick={useCloudConflict}>{ru ? "Использовать облачную" : "Use cloud copy"}</button>
        <button className="secondary" onClick={() => void keepLocalConflict()}>{ru ? "Оставить эту копию" : "Keep this device copy"}</button>
      </div>
    </div>}

    <div className="button-row">
      <button className="secondary" onClick={() => downloadJson("live-cash-progress.json", state)}>{ru ? "Экспорт прогресса" : "Export progress"}</button>
      <label className="file-button">{ru ? "Импорт прогресса" : "Import progress"}<input type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importState(file); }} /></label>
      {cloudMode === "cloud"
        ? <button className="secondary" onClick={() => void removeCloud()}>{ru ? "Удалить облачную копию" : "Delete cloud copy"}</button>
        : <button className="secondary" onClick={() => void enableCloud()}>{ru ? "Включить облачную копию" : "Enable cloud copy"}</button>}
      <button className="secondary" onClick={() => void resetDevice()}>{ru ? "Сбросить локальную копию" : "Reset local copy"}</button>
      <button className="secondary" onClick={() => void eraseAllProgress()}>{ru ? "Стереть весь прогресс" : "Erase all progress"}</button>
      {state.activeSession && <button className="secondary" onClick={abandonSession}>{ru ? "Завершить сохранённую сессию" : "Abandon saved session"}</button>}
      {(syncStatus === "offline" || syncStatus === "error" || syncStatus === "local") && cloudMode === "cloud" && <button className="secondary" onClick={retrySync}>{ru ? "Повторить синхронизацию" : "Retry sync"}</button>}
    </div>
    <p className="support">{ru
      ? "«Стереть весь прогресс» удаляет данные только текущего профиля. После полного сброса облачная копия остаётся выключенной до явного включения."
      : "“Erase all progress” removes data only for the current profile. After a full reset, cloud sync stays off until you explicitly enable it again."}</p>

    {recoveryRaw && <p className="support"><button className="textbutton" onClick={() => downloadText("live-cash-recovery-backup.json", recoveryRaw)}>{ru ? "Скачать сохранённую проблемную копию" : "Download preserved recovery copy"}</button></p>}

    <details>
      <summary>{ru ? "Техническая диагностика" : "Technical diagnostics"}</summary>
      <div className="debug-grid">
        <div><span>App</span><b>{APP_VERSION}</b></div>
        <div><span>Content</span><b>{CONTENT_VERSION}</b></div>
        <div><span>Schema</span><b>{STATE_SCHEMA_VERSION}</b></div>
        <div><span>Revision</span><b>{state.revision}</b></div>
        <div><span>{ru ? "Маршрут" : "Route"}</span><b>{route}</b></div>
        <div><span>{ru ? "Ошибка" : "Error"}</span><b>{lastErrorCode ?? "—"}</b></div>
      </div>
      <button className="secondary" onClick={() => downloadJson("live-cash-debug-summary.json", debugSummary())}>{ru ? "Экспорт безопасной диагностики" : "Export safe diagnostics"}</button>
      <p className="support">{ru ? "Диагностический экспорт не содержит тексты T1, реальных рук, explain-back, email или идентификатор пользователя." : "The diagnostic export excludes T1 text, real-hand text, explain-back text, email, and user identifiers."}</p>
    </details>
  </section>;
}