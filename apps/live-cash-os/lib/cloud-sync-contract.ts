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
 *
 * The persisted `mastery.attempts` array order is the canonical replay order
 * (see validMasteryState in practical-profile-contract.ts) for both regimes.
 * There is no independent, immutable chronology/event-ledger authority that
 * requires the array to stay append-only: the writer that currently holds the
 * exact cloud token owns that slice's array order the same way it owns any
 * other field-level mutation of it. `practicalProfileSafeSuccessor`'s ancestry
 * proof (id-set membership, not array order) is deliberately scoped to the
 * lost-token regime only, matching the "exact-token writes may mutate the
 * slice" line above; requiring it on exact-token writes as well would change
 * the accepted concurrency model, not fix a defect in it.
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
