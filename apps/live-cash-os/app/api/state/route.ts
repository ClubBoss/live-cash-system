import { and, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { learnerStates, testInvites } from "../../../db/schema";
import { assessCloudWrite } from "../../../lib/cloud-sync-contract";
import {
  STATE_SCHEMA_VERSION,
  migrateLearnerState,
  validateLearnerState,
  type LearnerState,
} from "../../../lib/model";
import { CURRENT_RUNTIME, validateRootLearnerState } from "../../../lib/reliability";

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

function cloudToken(): string {
  return `${Date.now()}-${crypto.randomUUID()}`;
}

const PORTABLE_PROFILE_HEADER = "x-live-cash-profile-code";
const PORTABLE_PROFILE_PATTERN = /^LCO-[A-Z0-9_-]{20,80}$/;

type PortableProfile = {
  codeHash: string;
  userId: string;
};

type RuntimeBindings = {
  TEST_INVITE_MODE?: string;
};

async function portableProfile(request: Request): Promise<PortableProfile | null> {
  const raw = request.headers.get(PORTABLE_PROFILE_HEADER)?.trim().toUpperCase() ?? "";
  if (!PORTABLE_PROFILE_PATTERN.test(raw)) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return { codeHash: hash, userId: `portable:${hash}` };
}

function isTestInviteMode(): boolean {
  const bindings = env as unknown as RuntimeBindings;
  return bindings.TEST_INVITE_MODE === "true";
}

async function activeTestInvite(profile: PortableProfile): Promise<boolean> {
  const db = getDb();
  const [invite] = await db
    .select({ id: testInvites.id, firstUsedAt: testInvites.firstUsedAt })
    .from(testInvites)
    .where(and(eq(testInvites.codeHash, profile.codeHash), eq(testInvites.active, 1)))
    .limit(1);
  if (!invite) return false;

  const now = new Date().toISOString();
  await db
    .update(testInvites)
    .set({ firstUsedAt: invite.firstUsedAt ?? now, lastUsedAt: now })
    .where(eq(testInvites.id, invite.id));
  return true;
}

async function currentIdentity(request: Request): Promise<string | null> {
  const portable = await portableProfile(request);
  if (isTestInviteMode()) {
    // TEST_DB is isolated from production. Its schema is applied by the
    // deploy workflow before the Worker is published; runtime requests only
    // perform the invite lookup and learner-state operations.
    return portable && await activeTestInvite(portable) ? portable.userId : null;
  }
  if (portable) return portable.userId;
  const user = await getChatGPTUser();
  return user?.userId ?? null;
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
    .select({ stateJson: learnerStates.stateJson, cloudToken: learnerStates.updatedAt })
    .from(learnerStates)
    .where(eq(learnerStates.userId, userId))
    .limit(1);
  return record ?? null;
}

function migrateStoredState(value: unknown): LearnerState | null {
  if (!isRecord(value)) return null;
  const version = value.schemaVersion;
  if (typeof version === "number" && version > STATE_SCHEMA_VERSION) return null;
  if (version === STATE_SCHEMA_VERSION && !validateRootLearnerState(value)) return null;
  const migrated = migrateLearnerState(value);
  return validateRootLearnerState(migrated) ? migrated : null;
}

function parseTombstone(value: unknown): CloudTombstone | null {
  if (!isRecord(value) || value.kind !== TOMBSTONE_KIND || typeof value.deletedAt !== "string") return null;
  return { kind: TOMBSTONE_KIND, deletedAt: value.deletedAt };
}

function incomingRuntimeMatches(rawState: Record<string, unknown>): boolean {
  return rawState.schemaVersion === CURRENT_RUNTIME.schemaVersion
    && rawState.appVersion === CURRENT_RUNTIME.appVersion
    && rawState.contentVersion === CURRENT_RUNTIME.contentVersion;
}

async function conflictFromLatest(userId: string) {
  const latest = await currentRecord(userId);
  if (!latest) {
    return json({ error: "Cloud state changed while saving", code: "STATE_CONFLICT", state: null, cloudToken: null }, 409);
  }
  const parsed = safeParse(latest.stateJson);
  const tombstone = parseTombstone(parsed);
  if (tombstone) {
    return json({
      error: "Cloud state was deleted",
      code: "CLOUD_STATE_DELETED",
      cloudDeleted: true,
      deletedAt: tombstone.deletedAt,
      cloudToken: latest.cloudToken,
    }, 410);
  }
  const state = migrateStoredState(parsed);
  return json({
    error: "Cloud state changed while saving",
    code: "STATE_CONFLICT",
    state,
    cloudToken: latest.cloudToken,
  }, 409);
}

export async function GET(request: Request) {
  let userId: string | null;
  try { userId = await currentIdentity(request); } catch { return serverError(); }
  if (!userId) return json({ error: "Sign in or connect a learning profile", code: "AUTH_REQUIRED" }, 401);

  try {
    const record = await currentRecord(userId);
    if (!record) return json({ state: null, cloudDeleted: false, cloudToken: null });
    const parsed = safeParse(record.stateJson);
    const tombstone = parseTombstone(parsed);
    if (tombstone) {
      return json({
        state: null,
        cloudDeleted: true,
        deletedAt: tombstone.deletedAt,
        cloudToken: record.cloudToken,
      });
    }
    const migrated = migrateStoredState(parsed);
    if (!migrated) {
      return json({
        state: null,
        cloudDeleted: false,
        cloudToken: record.cloudToken,
        warning: "Stored state could not be migrated safely",
        code: "CLOUD_STATE_UNREADABLE",
      });
    }
    return json({ state: migrated, cloudDeleted: false, cloudToken: record.cloudToken });
  } catch {
    return serverError();
  }
}

export async function POST(request: Request) {
  let userId: string | null;
  try { userId = await currentIdentity(request); } catch { return serverError(); }
  if (!userId) return json({ error: "Sign in or connect a learning profile", code: "AUTH_REQUIRED" }, 401);

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
  if (!isRecord(rawState)) return json({ error: "Learner state schema 2 is required", code: "INVALID_STATE" }, 400);
  if (!incomingRuntimeMatches(rawState)) {
    return json({ error: "Client state version does not match this deployment", code: "UPDATE_REQUIRED" }, 426);
  }
  if (!validateLearnerState(rawState)) {
    return json({ error: "Learner state schema 2 is required", code: "INVALID_STATE" }, 400);
  }
  const incoming = migrateLearnerState(rawState);
  // Every LearnerState persistence branch below shares this root trust boundary.
  // Migration happens first so legacy-compatible states can normalize before
  // current Practical Profile integrity is evaluated; malformed Practical
  // evidence can never reach first-write, live CAS, or tombstone-resume writes.
  if (!validateRootLearnerState(incoming)) {
    return json({ error: "Learner state schema 2 is required", code: "INVALID_STATE" }, 400);
  }
  const baseRevision = typeof payload.baseRevision === "number" && Number.isFinite(payload.baseRevision)
    ? payload.baseRevision
    : null;
  const baseCloudToken = typeof payload.baseCloudToken === "string" ? payload.baseCloudToken : null;
  const resumeCloudSync = payload.resumeCloudSync === true;

  try {
    const record = await currentRecord(userId);
    const db = getDb();

    if (!record) {
      const decision = assessCloudWrite(null, incoming, baseRevision, baseCloudToken, null);
      if (decision.kind === "conflict") {
        return json({ error: "Cloud state changed while saving", code: "STATE_CONFLICT", state: null, cloudToken: null }, 409);
      }
      const nextCloudToken = cloudToken();
      const inserted = await db
        .insert(learnerStates)
        .values({ userId, stateJson: JSON.stringify(incoming), updatedAt: nextCloudToken })
        .onConflictDoNothing({ target: learnerStates.userId })
        .run();
      if ((inserted.meta?.changes ?? 0) !== 1) return conflictFromLatest(userId);
      return json({ ok: true, revision: incoming.revision, cloudToken: nextCloudToken });
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
          cloudToken: record.cloudToken,
        }, 410);
      }
      const nextCloudToken = cloudToken();
      const resumed = await db
        .update(learnerStates)
        .set({ stateJson: JSON.stringify(incoming), updatedAt: nextCloudToken })
        .where(and(eq(learnerStates.userId, userId), eq(learnerStates.updatedAt, record.cloudToken)))
        .run();
      if ((resumed.meta?.changes ?? 0) !== 1) return conflictFromLatest(userId);
      return json({ ok: true, resumed: true, revision: incoming.revision, cloudToken: nextCloudToken });
    }

    const existing = migrateStoredState(parsedExisting);
    if (!existing) {
      return json({
        error: "Existing cloud state cannot be read safely; refusing to overwrite it",
        code: "CLOUD_STATE_UNREADABLE",
        state: null,
        cloudToken: record.cloudToken,
      }, 409);
    }

    const decision = assessCloudWrite(existing, incoming, baseRevision, baseCloudToken, record.cloudToken);
    if (decision.kind === "idempotent") {
      return json({ ok: true, idempotent: true, revision: existing.revision, cloudToken: record.cloudToken });
    }
    if (decision.kind === "conflict") {
      return json({
        error: "Cloud state changed on another device",
        code: "STATE_CONFLICT",
        state: existing,
        cloudToken: record.cloudToken,
      }, 409);
    }

    const nextCloudToken = cloudToken();
    const updated = await db
      .update(learnerStates)
      .set({ stateJson: JSON.stringify(incoming), updatedAt: nextCloudToken })
      .where(and(eq(learnerStates.userId, userId), eq(learnerStates.updatedAt, record.cloudToken)))
      .run();
    if ((updated.meta?.changes ?? 0) !== 1) return conflictFromLatest(userId);

    return json({ ok: true, revision: incoming.revision, cloudToken: nextCloudToken });
  } catch {
    return serverError();
  }
}

export async function DELETE(request: Request) {
  let userId: string | null;
  try { userId = await currentIdentity(request); } catch { return serverError(); }
  if (!userId) return json({ error: "Sign in or connect a learning profile", code: "AUTH_REQUIRED" }, 401);

  try {
    const deletedAt = new Date().toISOString();
    const tombstone: CloudTombstone = { kind: TOMBSTONE_KIND, deletedAt };
    const nextCloudToken = cloudToken();
    const db = getDb();
    await db
      .insert(learnerStates)
      .values({ userId, stateJson: JSON.stringify(tombstone), updatedAt: nextCloudToken })
      .onConflictDoUpdate({
        target: learnerStates.userId,
        set: { stateJson: JSON.stringify(tombstone), updatedAt: nextCloudToken },
      });
    return json({ ok: true, cloudDeleted: true, deletedAt, cloudToken: nextCloudToken });
  } catch {
    return serverError();
  }
}