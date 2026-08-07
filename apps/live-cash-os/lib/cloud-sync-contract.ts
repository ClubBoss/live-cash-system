import type { LearnerState } from "./model-core";
import { isSafeSuccessor, sameLearnerState } from "./reliability";

export type CloudWriteDecision =
  | { kind: "idempotent" }
  | { kind: "accept"; compareUpdatedAt: string | null }
  | { kind: "conflict"; reason: "missing_base" | "divergent_history" };

/**
 * One precedence contract for browser and server:
 * - identical retries are idempotent;
 * - a write based on the current cloud token may advance it;
 * - a lost acknowledgement may also advance when the incoming snapshot proves
 *   it contains all durable cloud evidence;
 * - otherwise preserve both snapshots and surface a conflict.
 *
 * updatedAt is a CAS token, never a winner selector.
 */
export function assessCloudWrite(
  existing: LearnerState | null,
  incoming: LearnerState,
  baseRevision: number | null,
  baseUpdatedAt: string | null,
): CloudWriteDecision {
  if (!existing) {
    if (baseRevision === null && baseUpdatedAt === null) return { kind: "accept", compareUpdatedAt: null };
    return { kind: "conflict", reason: "missing_base" };
  }

  if (sameLearnerState(existing, incoming)) return { kind: "idempotent" };

  const tokenMatches = baseRevision === existing.revision && baseUpdatedAt === existing.updatedAt;
  if (tokenMatches) return { kind: "accept", compareUpdatedAt: existing.updatedAt };

  // This path handles a network response lost after the previous write. It is
  // intentionally conservative: only a proven whole-state successor may move
  // the cloud head without the exact previous acknowledgement token.
  if (isSafeSuccessor(incoming, existing)) return { kind: "accept", compareUpdatedAt: existing.updatedAt };

  return { kind: "conflict", reason: "divergent_history" };
}
