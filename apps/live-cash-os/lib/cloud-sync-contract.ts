import type { LearnerState } from "./model-core";
import {
  learnerStateHasValidPracticalProfile,
  hasPracticalProfileField,
  practicalProfileSafeSuccessor,
} from "./practical-profile-contract";
import { isSafeSuccessor, sameLearnerState } from "./reliability";

export type CloudWriteDecision =
  | { kind: "idempotent" }
  | { kind: "accept" }
  | { kind: "conflict"; reason: "missing_base" | "divergent_history" };

/**
 * One precedence contract for browser and server:
 * - identical retries are idempotent;
 * - a write based on the current opaque cloud token may advance it;
 * - a lost acknowledgement may also advance when the incoming snapshot proves
 *   it contains all durable cloud evidence;
 * - otherwise preserve both snapshots and surface a conflict.
 *
 * Learner updatedAt is descriptive only. It is never a winner selector or a
 * compare-and-swap token.
 *
 * Practical Mastery is an additive profile slice. Once a durable snapshot has
 * that slice, no later write may silently drop or corrupt it. Exact-token writes
 * may mutate the slice; lost-token writes additionally need monotonic practical
 * ancestry before they can be accepted automatically.
 */
export function assessCloudWrite(
  existing: LearnerState | null,
  incoming: LearnerState,
  baseRevision: number | null,
  baseCloudToken: string | null,
  currentCloudToken: string | null,
): CloudWriteDecision {
  if (!existing) {
    if (hasPracticalProfileField(incoming) && !learnerStateHasValidPracticalProfile(incoming)) {
      return { kind: "conflict", reason: "divergent_history" };
    }
    if (baseRevision === null && baseCloudToken === null) return { kind: "accept" };
    return { kind: "conflict", reason: "missing_base" };
  }

  if (sameLearnerState(existing, incoming)) return { kind: "idempotent" };

  if (hasPracticalProfileField(existing) && !learnerStateHasValidPracticalProfile(incoming)) {
    return { kind: "conflict", reason: "divergent_history" };
  }
  if (hasPracticalProfileField(incoming) && !learnerStateHasValidPracticalProfile(incoming)) {
    return { kind: "conflict", reason: "divergent_history" };
  }

  const tokenMatches = baseRevision === existing.revision
    && baseCloudToken !== null
    && baseCloudToken === currentCloudToken;
  if (tokenMatches) return { kind: "accept" };

  // Handles a lost response after a successful previous save. Only a proven
  // whole-state successor may advance without the exact acknowledgement token.
  if (isSafeSuccessor(incoming, existing) && practicalProfileSafeSuccessor(incoming, existing)) {
    return { kind: "accept" };
  }

  return { kind: "conflict", reason: "divergent_history" };
}
