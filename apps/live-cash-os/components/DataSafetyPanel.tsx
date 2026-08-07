"use client";

import { APP_VERSION, CONTENT_VERSION, STATE_SCHEMA_VERSION, saveActiveSession, type LocaleCode } from "../lib/model";
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
  } = controller;

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

  return <section className="surface">
    <div className="section-head">
      <p className="eyebrow">{ru ? "ДАННЫЕ И ВОССТАНОВЛЕНИЕ" : "DATA & RECOVERY"}</p>
      <h1>{ru ? "Прогресс остаётся под твоим контролем." : "Your progress stays under your control."}</h1>
      <p>{ru
        ? "Прогресс хранится локально. При доступной авторизации копия может синхронизироваться в облако. В неё входят ответы T1, сохранённые объяснения и записанные реальные руки. Эти тексты не отправляются автоматически на AI-разбор."
        : "Progress is stored locally. When authentication is available, a copy may sync to the cloud. It includes T1 answers, saved explanations, and recorded real hands. Those texts are not automatically sent for AI evaluation."}</p>
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
      <p>{ru ? "Ни одна версия не была автоматически отброшена. Выбери, какую сделать основной." : "Neither version was discarded automatically. Choose which copy should become authoritative."}</p>
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
      {state.activeSession && <button className="secondary" onClick={abandonSession}>{ru ? "Завершить сохранённую сессию" : "Abandon saved session"}</button>}
      {(syncStatus === "offline" || syncStatus === "error" || syncStatus === "local") && cloudMode === "cloud" && <button className="secondary" onClick={retrySync}>{ru ? "Повторить синхронизацию" : "Retry sync"}</button>}
    </div>

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
