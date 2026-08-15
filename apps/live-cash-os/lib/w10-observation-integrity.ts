import {
  validateW10ObservationLedger,
  type W10FrictionCategory,
  type W10ObservationLedger,
} from "./w10-evidence";

const FRICTION_CATEGORIES = new Set<W10FrictionCategory>([
  "content_error",
  "language_problem",
  "ambiguous_question",
  "weak_distractor",
  "routing",
  "scheduling",
  "visual_friction",
  "mobile_friction",
  "field_workflow_friction",
  "navigation_confusion",
  "queue_overload",
  "no_action",
]);

function optionalBoolean(value: unknown): boolean {
  return value === undefined || value === null || typeof value === "boolean";
}

function optionalScoreOneToFive(value: unknown): boolean {
  return value === undefined || value === null || (Number.isInteger(value) && Number(value) >= 1 && Number(value) <= 5);
}

function nonEmptyId(value: string): boolean {
  return value.trim().length > 0;
}

export function validateStrictW10ObservationLedger(value: unknown): W10ObservationLedger {
  const ledger = validateW10ObservationLedger(value);
  const sessionIds = new Set<string>();

  for (const session of ledger.sessions) {
    if (!nonEmptyId(session.id)) throw new Error("W10 session id must not be blank");
    if (sessionIds.has(session.id)) throw new Error(`Duplicate W10 session id: ${session.id}`);
    sessionIds.add(session.id);

    const startedAt = Date.parse(session.startedAt);
    const endedAt = session.endedAt ? Date.parse(session.endedAt) : null;
    if (endedAt !== null && endedAt < startedAt) throw new Error(`W10 session ended before it started: ${session.id}`);

    if (session.intendedAction !== undefined && session.intendedAction !== null && typeof session.intendedAction !== "string") {
      throw new Error(`Invalid intendedAction for ${session.id}`);
    }
    if (!optionalBoolean(session.startedIntendedActionWithoutNavigationConfusion)) {
      throw new Error(`Invalid startedIntendedActionWithoutNavigationConfusion for ${session.id}`);
    }
    if (!optionalBoolean(session.navigationConfusion)) throw new Error(`Invalid navigationConfusion for ${session.id}`);
    if (!optionalBoolean(session.queueOverload)) throw new Error(`Invalid queueOverload for ${session.id}`);
    if (!optionalBoolean(session.preSessionWarmup)) throw new Error(`Invalid preSessionWarmup for ${session.id}`);
    if (!optionalBoolean(session.returnedAfterMultiDayBreak)) throw new Error(`Invalid returnedAfterMultiDayBreak for ${session.id}`);

    if (session.unnecessaryClicks !== undefined && session.unnecessaryClicks !== null
      && (!Number.isInteger(session.unnecessaryClicks) || session.unnecessaryClicks < 0)) {
      throw new Error(`Invalid unnecessaryClicks for ${session.id}`);
    }
    if (!optionalScoreOneToFive(session.desireToReturn)) throw new Error(`Invalid desireToReturn for ${session.id}`);
    if (!optionalScoreOneToFive(session.beforePlayUsefulness)) throw new Error(`Invalid beforePlayUsefulness for ${session.id}`);

    if (session.comprehension !== undefined) {
      if (!session.comprehension || typeof session.comprehension !== "object" || Array.isArray(session.comprehension)) {
        throw new Error(`Invalid comprehension observation for ${session.id}`);
      }
      if (!optionalBoolean(session.comprehension.mechanismExplainable)
        || !optionalBoolean(session.comprehension.promptUnderstoodFirstRead)
        || !optionalBoolean(session.comprehension.assumptionsNoticed)) {
        throw new Error(`Invalid comprehension value for ${session.id}`);
      }
    }
  }

  const frictionIds = new Set<string>();
  for (const item of ledger.friction) {
    if (!nonEmptyId(item.id)) throw new Error("W10 friction id must not be blank");
    if (frictionIds.has(item.id)) throw new Error(`Duplicate W10 friction id: ${item.id}`);
    frictionIds.add(item.id);
    if (!FRICTION_CATEGORIES.has(item.category)) throw new Error(`Invalid friction category for ${item.id}`);
    if (!item.repeatKey.trim()) throw new Error(`W10 friction repeatKey must not be blank for ${item.id}`);
    if (item.note !== undefined && typeof item.note !== "string") throw new Error(`Invalid friction note for ${item.id}`);
  }

  return ledger;
}
