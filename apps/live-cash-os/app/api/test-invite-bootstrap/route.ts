import { env } from "cloudflare:workers";
import { ensureTestMirrorSchema } from "../../../db";

type RuntimeBindings = {
  TEST_INVITE_MODE?: string;
};

export async function POST() {
  const bindings = env as unknown as RuntimeBindings;
  if (bindings.TEST_INVITE_MODE !== "true") {
    return Response.json({ error: "Not available" }, { status: 404 });
  }

  try {
    await ensureTestMirrorSchema();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Test invite sync failed" }, { status: 503 });
  }
}
