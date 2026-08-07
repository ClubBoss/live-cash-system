import { and, eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { learnerStates } from "../../../db/schema";
import { assessCloudWrite } from "../../../lib/cloud-sync-contract";
import {
  STATE_SCHEMA_VERSION,
  migrateLearnerState,
  validateLearnerState,
  type LearnerState,
} from "../../../lib/model";
import { CURRENT_RUNTIME } from "../../../lib/reliability";

const MAX_STATE_BYTES = 1_000_000;
const TOMBSTONE_KIND = "cloud-deleted-v1";

type CloudTombstone = {
  kind: typeof TOMBSTONE_KIND;
  deletedAt: string;
};

function safeParse(value: string): unknown {
  try { return JSON.parse(value); } catch { return null; }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function json(body: Record<string, unknown>, status = 200) {
  return Response.json({ ...body, runtime: CURRENT_RUNTIME }, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

function serverError() {
  return json({ error: "Cloud storage is temporarily unavailable", code: "CLOUD_STORAGE_UNAVAILABLE" }, 503);
}

async function currentRecord(userId: string) {
  const db = getDb();
  const [record] = await db
    .select({ stateJson: learnerStates.stateJson, updatedAt: learnerStates.updatedAt })
    .from(learnerStates)
    .where(eq(learnerStates.userId, userId))
    .limit(1);
  return record ?? null;
}

function migrateStoredState(value: unknown): LearnerState | null {
  if (!isRecord(value)) return null;
  const version = value.schemaVersion;
  if (typeof version === "number" && version > STATE_SCHEMA_VERSION) return null;
  const migrated = migrateLearnerState(value);
  return validateLearnerState(migrated) ? migrated : null;
}

function parseTombstone(value: unknown): CloudTombstone | null {
  if (!isRecord(value) || value.kind !== TOMBSTONE_KIND || typeof value.deletedAt !== "string") return null;
  return { kind: TOMBSTONE_KIND, deletedAt: value.deletedAt };
}

async function conflictFromLatest(userId: string) {
  const latest = await currentRecord(userId);
  if (!latest) return json({ error: "Cloud state changed while saving", code: "STATE_CONFLICT", state: null }, 409);
  const parsed = safeParse(latest.stateJson);
  const tombstone = parseTombstone(parsed);
  if (tombstone) {
    return json({ error: "Cloud state was deleted", code: "CLOUD_STATE_DELETED", cloudDeleted: true, deletedAt: tombstone.deletedAt }, 410);
  }
  const state = migrateStoredState(parsed);
  return json({ error: "Cloud state changed while saving", code: "STATE_CONFLICT", state }, 409);
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "Sign in required", code: "AUTH_REQUIRED" }, 401);

  try {
    const record = await currentRecord(user.userId);
    if (!record) return json({ state: null, cloudDeleted: false });
    const parsed = safeParse(record.stateJson);
    const tombstone = parseTombstone(parsed);
    if (tombstone) {
      return json({ state: null, cloudDeleted: true, deletedAt: tombstone.deletedAt });
    }
    const migrated = migrateStoredState(parsed);
    if (!migrated) {
      return json({
        state: null,
        cloudDeleted: false,
        warning: "Stored state could not be migrated safely",
        code: "CLOUD_STATE_UNREADABLE",
      });
    }
    return json({ state: migrated, cloudDeleted: false });
  } catch {
    return serverError();
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "Sign in required", code: "AUTH_REQUIRED" }, 401);

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_STATE_BYTES) return json({ error: "State payload is too large", code: "STATE_TOO_LARGE" }, 413);

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_STATE_BYTES) {
    return json({ error: "State payload is too large", code: "STATE_TOO_LARGE" }, 413);
  }

  let payload: unknown;
  try { payload = JSON.parse(text); } catch { return json({ error: "Malformed JSON", code: "MALFORMED_JSON" }, 400); }
  if (!isRecord(payload)) return json({ error: "Malformed request", code: "INVALID_REQUEST" }, 400);

  const rawState = "state" in payload ? payload.state : null;
  if (!isRecord(rawState) || rawState.schemaVersion !== STATE_SCHEMA_VERSION || !validateLearnerState(rawState)) {
    return json({ error: "Learner state schema 2 is required", code: "INVALID_STATE" }, 400);
  }
  const incoming = migrateLearnerState(rawState);
  const baseRevision = typeof payload.baseRevision === "number" && Number.isFinite(payload.baseRevision)
    ? payload.baseRevision
    : null;
  const baseUpdatedAt = typeof payload.baseUpdatedAt === "string" ? payload.baseUpdatedAt : null;
  const resumeCloudSync = payload.resumeCloudSync === true;

  try {
    const record = await currentRecord(user.userId);
    const db = getDb();

    if (!record) {
      const decision = assessCloudWrite(null, incoming, baseRevision, baseUpdatedAt);
      if (decision.kind === "conflict") {
        return json({ error: "Cloud state changed while saving", code: "STATE_CONFLICT", state: null }, 409);
      }
      const inserted = await db
        .insert(learnerStates)
        .values({ userId: user.userId, stateJson: JSON.stringify(incoming), updatedAt: incoming.updatedAt })
        .onConflictDoNothing({ target: learnerStates.userId })
        .run();
      if ((inserted.meta?.changes ?? 0) !== 1) return conflictFromLatest(user.userId);
      return json({ ok: true, revision: incoming.revision, updatedAt: incoming.updatedAt });
    }

    const parsedExisting = safeParse(record.stateJson);
    const tombstone = parseTombstone(parsedExisting);
    if (tombstone) {
      if (!resumeCloudSync) {
        return json({
          error: "Cloud state was deleted and will not be recreated automatically",
          code: "CLOUD_STATE_DELETED",
          cloudDeleted: true,
          deletedAt: tombstone.deletedAt,
        }, 410);
      }
      const resumed = await db
        .update(learnerStates)
        .set({ stateJson: JSON.stringify(incoming), updatedAt: incoming.updatedAt })
        .where(and(eq(learnerStates.userId, user.userId), eq(learnerStates.updatedAt, record.updatedAt)))
        .run();
      if ((resumed.meta?.changes ?? 0) !== 1) return conflictFromLatest(user.userId);
      return json({ ok: true, resumed: true, revision: incoming.revision, updatedAt: incoming.updatedAt });
    }

    const existing = migrateStoredState(parsedExisting);
    if (!existing) {
      return json({
        error: "Existing cloud state cannot be read safely; refusing to overwrite it",
        code: "CLOUD_STATE_UNREADABLE",
        state: null,
      }, 409);
    }

    const decision = assessCloudWrite(existing, incoming, baseRevision, baseUpdatedAt);
    if (decision.kind === "idempotent") {
      return json({ ok: true, idempotent: true, revision: existing.revision, updatedAt: existing.updatedAt });
    }
    if (decision.kind === "conflict") {
      return json({ error: "Cloud state changed on another device", code: "STATE_CONFLICT", state: existing }, 409);
    }

    const updated = await db
      .update(learnerStates)
      .set({ stateJson: JSON.stringify(incoming), updatedAt: incoming.updatedAt })
      .where(and(eq(learnerStates.userId, user.userId), eq(learnerStates.updatedAt, record.updatedAt)))
      .run();
    if ((updated.meta?.changes ?? 0) !== 1) return conflictFromLatest(user.userId);

    return json({ ok: true, revision: incoming.revision, updatedAt: incoming.updatedAt });
  } catch {
    return serverError();
  }
}

export async function DELETE() {
  const user = await getChatGPTUser();
  if (!user) return json({ error: "Sign in required", code: "AUTH_REQUIRED" }, 401);

  try {
    const deletedAt = new Date().toISOString();
    const tombstone: CloudTombstone = { kind: TOMBSTONE_KIND, deletedAt };
    const db = getDb();
    await db
      .insert(learnerStates)
      .values({ userId: user.userId, stateJson: JSON.stringify(tombstone), updatedAt: deletedAt })
      .onConflictDoUpdate({
        target: learnerStates.userId,
        set: { stateJson: JSON.stringify(tombstone), updatedAt: deletedAt },
      });
    return json({ ok: true, cloudDeleted: true, deletedAt });
  } catch {
    return serverError();
  }
}
