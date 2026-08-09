import { integer, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const learnerStates = sqliteTable("learner_states", {
  userId: text("user_id").primaryKey(),
  stateJson: text("state_json").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// This table exists only in the isolated test-mirror D1 database.
export const testInvites = sqliteTable("test_invites", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull().unique(),
  codeHash: text("code_hash").notNull().unique(),
  active: integer("active").notNull().default(1),
  createdAt: text("created_at").notNull(),
  firstUsedAt: text("first_used_at"),
  lastUsedAt: text("last_used_at"),
});
