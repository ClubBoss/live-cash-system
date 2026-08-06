import { eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { learnerStates } from "../../../db/schema";
import { migrateLearnerState, validateLearnerState, type LearnerState } from "../../../lib/model";

const MAX_STATE_BYTES = 1_000_000;

function safeParse(value: string): unknown {
  try { return JSON.parse(value); } catch { return null; }
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
  if (!value || typeof value !== "object") return null;
  const migrated = migrateLearnerState(value);
  return validateLearnerState(migrated) ? migrated : null;
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const record = await currentRecord(user.userId);
  if (!record) return Response.json({ state: null });
  const migrated = migrateStoredState(safeParse(record.stateJson));
  if (!migrated) {
    return Response.json({ state: null, warning: "Stored state could not be migrated safely" }, { status: 200 });
  }
  return Response.json({ state: migrated });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_STATE_BYTES) return Response.json({ error: "State payload is too large" }, { status: 413 });

  const text = await request.text();
  if (new TextEncoder().encode(text).byteLength > MAX_STATE_BYTES) {
    return Response.json({ error: "State payload is too large" }, { status: 413 });
  }

  let payload: unknown;
  try { payload = JSON.parse(text); } catch { return Response.json({ error: "Malformed JSON" }, { status: 400 }); }
  const rawState = payload && typeof payload === "object" && "state" in payload ? (payload as { state: unknown }).state : null;
  const incoming = migrateStoredState(rawState);
  if (!incoming) return Response.json({ error: "Learner state schema 2 is required" }, { status: 400 });

  const record = await currentRecord(user.userId);
  if (record) {
    const existing = migrateStoredState(safeParse(record.stateJson));
    if (existing) {
      const existingTime = Date.parse(existing.updatedAt) || 0;
      const incomingTime = Date.parse(incoming.updatedAt) || 0;
      if (existing.revision > incoming.revision || (existing.revision === incoming.revision && existingTime > incomingTime)) {
        return Response.json({ error: "Stale learner state", state: existing }, { status: 409 });
      }
    }
  }

  const db = getDb();
  await db
    .insert(learnerStates)
    .values({ userId: user.userId, stateJson: JSON.stringify(incoming), updatedAt: incoming.updatedAt })
    .onConflictDoUpdate({
      target: learnerStates.userId,
      set: { stateJson: JSON.stringify(incoming), updatedAt: incoming.updatedAt },
    });

  return Response.json({ ok: true, revision: incoming.revision });
}

export async function DELETE() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });
  const db = getDb();
  await db.delete(learnerStates).where(eq(learnerStates.userId, user.userId));
  return Response.json({ ok: true });
}
