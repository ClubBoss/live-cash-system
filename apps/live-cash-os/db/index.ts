import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

type LiveCashBindings = {
  DB?: D1Database;
  TEST_DB?: D1Database;
};

export function getDb() {
  const bindings = env as unknown as LiveCashBindings;
  // Sites continues to use the production `DB` binding. The Workers test
  // mirror receives only `TEST_DB`, which points at its separate test D1.
  const database = bindings.TEST_DB ?? bindings.DB;
  if (!database) {
    throw new Error(
      "Cloudflare D1 binding is unavailable. Set the Sites `DB` binding or the test-mirror `TEST_DB` binding before using cloud storage."
    );
  }

  return drizzle(database, { schema });
}
