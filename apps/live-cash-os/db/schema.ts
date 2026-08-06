import { text, sqliteTable } from "drizzle-orm/sqlite-core";

export const learnerStates = sqliteTable("learner_states", {
  userId: text("user_id").primaryKey(),
  stateJson: text("state_json").notNull(),
  updatedAt: text("updated_at").notNull(),
});
