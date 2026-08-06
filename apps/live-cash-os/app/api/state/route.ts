import { eq } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { learnerStates } from "../../../db/schema";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const db = getDb();
  const [record] = await db
    .select({ stateJson: learnerStates.stateJson })
    .from(learnerStates)
    .where(eq(learnerStates.userId, user.userId))
    .limit(1);

  return Response.json({ state: record ? JSON.parse(record.stateJson) : null });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return Response.json({ error: "Sign in required" }, { status: 401 });

  const payload = (await request.json()) as { state?: unknown };
  if (!payload.state || typeof payload.state !== "object") {
    return Response.json({ error: "Valid learner state is required" }, { status: 400 });
  }

  const db = getDb();
  await db
    .insert(learnerStates)
    .values({
      userId: user.userId,
      stateJson: JSON.stringify(payload.state),
      updatedAt: new Date().toISOString(),
    })
    .onConflictDoUpdate({
      target: learnerStates.userId,
      set: {
        stateJson: JSON.stringify(payload.state),
        updatedAt: new Date().toISOString(),
      },
    });

  return Response.json({ ok: true });
}
