import {
  practicalDecisionById,
  practicalDecisions,
  practicalSkillById,
  isOrdinaryLearnerDecision,
  type PracticalDecision,
  type PracticalEvidenceStage,
} from "../content/practical-mastery";
import { isIntegrationDerivedSkill } from "../content/practical-mastery/integration-derived";
import { practicalSourceGapBySkillId } from "../content/practical-mastery/source-gaps";
import { learningRouteScore, whyNowForSkill } from "../content/practical-mastery/learning-route";
import {
  PRACTICAL_HIGH_CONFIDENCE_WRONG,
  currentPracticalMistakes,
  selectedWrongPracticalMisconceptionIds,
} from "./practical-current-mistakes";
import {
  isPracticalBridgeSkill,
  isSemanticallyValidPracticalAttempt,
  latestAttemptsByDecision,
  markDelayedPracticalRetrieval,
  practicalPrerequisitesMet,
  practicalSkillCorpusCanReach,
  recordPracticalDecision,
  stageAtLeast,
  type PracticalAttempt,
  type PracticalMasteryState,
} from "./practical-mastery-core";
import { recentlyAttemptedDecisionIds } from "./practical-repeat-window";

export const INTEGRATED_SESSION_SIZE = 8;
export const RETENTION_INTERVAL_DAYS = [1, 3, 7] as const;
const BRIDGE_SKILL_IDS = new Set(["OOP-06", "OOP-07", "IP-03", "IP-04", "IP-05", "IP-06"]);

type MistakeFamily = { key: string; skillId: string; unresolvedDecisionIds: string[]; priority: number };
export type IntegratedSessionItem = { decisionId: string; skillId: string; priority: number; reason: "REPAIR" | "RETENTION" | "TRANSFER" | "REINFORCE" | "RECOGNITION"; whyAfterAnswer: string; retentionTierDays: number | null };

export function unresolvedMistakeFamilies(state: PracticalMasteryState): MistakeFamily[] {
  const grouped = new Map<string, MistakeFamily>();

  for (const mistake of currentPracticalMistakes(state)) {
    const normalEvidenceCount = mistake.evidenceCount - mistake.highConfidenceEvidenceCount;
    grouped.set(JSON.stringify([mistake.skillId, mistake.misconceptionId]), {
      key: mistake.misconceptionId,
      skillId: mistake.skillId,
      unresolvedDecisionIds: [...mistake.unresolvedDecisionIds],
      priority: mistake.highConfidenceEvidenceCount * 5 + normalEvidenceCount * 2,
    });
  }

  // Feature A never synthesizes misconception evidence. Integrated scheduling
  // still needs the historical generic repair fallback for a real latest wrong
  // whose actually-wrong dimensions carry no misconception tag.
  for (const attempt of latestAttemptsByDecision(state).values()) {
    if (attempt.correct) continue;
    const decision = practicalDecisionById.get(attempt.decisionId);
    if (!decision || !isOrdinaryLearnerDecision(decision) || decision.skillId !== attempt.skillId) continue;
    if (isIntegrationDerivedSkill(attempt.skillId) || isPracticalBridgeSkill(attempt.skillId)) continue;
    const selectedActionValid = decision.actionOptions.some((option) => option.id === attempt.actionId);
    const selectedReasonValid = decision.reasonOptions.some((option) => option.id === attempt.reasonId);
    const derivedCorrect = attempt.actionId === decision.correctActionId && attempt.reasonId === decision.correctReasonId;
    if (!selectedActionValid || !selectedReasonValid || attempt.correct !== derivedCorrect) continue;
    if (selectedWrongPracticalMisconceptionIds(attempt).length > 0) continue;

    const key = `SKILL:${attempt.skillId}`;
    const composite = JSON.stringify([attempt.skillId, key]);
    const current = grouped.get(composite) ?? { key, skillId: attempt.skillId, unresolvedDecisionIds: [], priority: 0 };
    current.unresolvedDecisionIds.push(attempt.decisionId);
    current.priority += attempt.confidence >= PRACTICAL_HIGH_CONFIDENCE_WRONG ? 5 : 2;
    grouped.set(composite, current);
  }

  return [...grouped.values()].sort((a, b) => b.priority - a.priority || a.skillId.localeCompare(b.skillId));
}

// The most recent qualifying row itself must be semantically valid, or this
// returns null rather than falling back to an older correct attempt: a
// forged/malformed "correct" row must not be allowed to establish a fake
// (e.g. artificially old) retention anchor, and reaching past it to an older
// row would let it silently overrule a genuine, more recent unresolved miss.
function latestCorrectAttempt(state: PracticalMasteryState, skillId: string): PracticalAttempt | null { const attempt = [...state.attempts].reverse().find((candidate) => candidate.skillId === skillId && candidate.correct) ?? null; return attempt && isSemanticallyValidPracticalAttempt(attempt) ? attempt : null; }
function elapsedDays(iso: string, now: Date): number { return Math.max(0, (now.getTime() - new Date(iso).getTime()) / 86_400_000); }

export function retentionTierDue(state: PracticalMasteryState, skillId: string, now = new Date()): number | null {
  const progress = state.skills[skillId]; if (!progress || !stageAtLeast(progress.evidenceStage, "BOUNDARY_TESTED")) return null;
  const lastCorrect = latestCorrectAttempt(state, skillId); if (!lastCorrect) return null; const elapsed = elapsedDays(lastCorrect.answeredAt, now); const passed = new Set(progress.retentionDaysPassed);
  for (const tier of RETENTION_INTERVAL_DAYS) if (elapsed >= tier && !passed.has(tier)) return tier; return null;
}

function candidateDecisionForSkill(
  state: PracticalMasteryState,
  skillId: string,
  kinds: PracticalDecision["kind"][],
  excludedDecisionIds: Set<string>,
  requireNonIdenticalToLatest = false,
  avoidDecisionIds: ReadonlySet<string> = new Set<string>(),
): PracticalDecision | null {
  const rawLatest = [...state.attempts].reverse().find((attempt) => attempt.skillId === skillId) ?? null;
  const latest = rawLatest && isSemanticallyValidPracticalAttempt(rawLatest) ? rawLatest : null;
  const attempted = new Set(state.attempts.filter((attempt) => attempt.skillId === skillId && isSemanticallyValidPracticalAttempt(attempt)).map((attempt) => attempt.decisionId));
  const pool = practicalDecisions.filter((decision) => isOrdinaryLearnerDecision(decision) && decision.skillId === skillId && kinds.includes(decision.kind) && !excludedDecisionIds.has(decision.id) && !avoidDecisionIds.has(decision.id));
  return pool.find((decision) => !attempted.has(decision.id) && (!requireNonIdenticalToLatest || decision.id !== latest?.decisionId)) ?? pool.find((decision) => !requireNonIdenticalToLatest || decision.id !== latest?.decisionId) ?? null;
}
function currentStage(state: PracticalMasteryState, skillId: string): PracticalEvidenceStage { return state.skills[skillId]?.evidenceStage ?? "SOURCE_SUPPORTED"; }
function recentExposurePenalty(state: PracticalMasteryState, skillId: string): number { return Math.min(18, state.attempts.slice(-12).filter(isSemanticallyValidPracticalAttempt).filter((attempt) => attempt.skillId === skillId).length * 4); }

export function integratedBreadthReady(state: PracticalMasteryState): boolean {
  const trained = Object.values(state.skills).filter((progress) => !isIntegrationDerivedSkill(progress.skillId) && stageAtLeast(progress.evidenceStage, "DECISION_TRAINED"));
  const waves = new Set(trained.map((progress) => practicalSkillById.get(progress.skillId)?.wave).filter(Boolean));
  return trained.length >= 8 && waves.size >= 4;
}

export function supportedIntegratedSkillIds(state: PracticalMasteryState): string[] {
  return [...new Set(practicalDecisions.filter(isOrdinaryLearnerDecision).map((decision) => decision.skillId))].filter((skillId) => {
    if (isIntegrationDerivedSkill(skillId)) return false;
    if (BRIDGE_SKILL_IDS.has(skillId)) return false;
    const gap = practicalSourceGapBySkillId.get(skillId);
    if (gap?.status === "SOURCE_BLOCKED" || gap?.status === "PARTIAL") return false;
    const progress = state.skills[skillId];
    if (!progress?.conceptTaught) return false;
    if (!practicalSkillCorpusCanReach(skillId, "DECISION_TRAINED")) return false;
    return practicalPrerequisitesMet(state, skillId);
  });
}

export function buildIntegratedSession(state: PracticalMasteryState, now = new Date(), size = INTEGRATED_SESSION_SIZE): IntegratedSessionItem[] {
  const items: IntegratedSessionItem[] = []; const excluded = new Set<string>(); const skillUse = new Map<string, number>(); const eligibleIds = new Set(supportedIntegratedSkillIds(state));
  const recentlyAttempted = recentlyAttemptedDecisionIds(state);
  const push = (decision: PracticalDecision, reason: IntegratedSessionItem["reason"], priority: number, why: string, retentionTierDays: number | null = null) => {
    if (items.length >= size || excluded.has(decision.id) || (skillUse.get(decision.skillId) ?? 0) >= 2) return;
    items.push({ decisionId: decision.id, skillId: decision.skillId, priority, reason, whyAfterAnswer: why, retentionTierDays }); excluded.add(decision.id); skillUse.set(decision.skillId, (skillUse.get(decision.skillId) ?? 0) + 1);
  };

  const mistakeFamilies = unresolvedMistakeFamilies(state);
  const dueRetentions = [...eligibleIds].map((skillId) => ({ skillId, tier: retentionTierDue(state, skillId, now) })).filter((entry): entry is { skillId: string; tier: number } => Boolean(entry.tier));

  const runRepairPass = (allowRecentFallback: boolean) => {
    for (const family of mistakeFamilies) {
      if (items.length >= size) break; if (!eligibleIds.has(family.skillId)) continue;
      const kinds: PracticalDecision["kind"][] = ["changed", "boundary", "decision", "mixed", "recognition"];
      const decision = candidateDecisionForSkill(state, family.skillId, kinds, excluded, true, recentlyAttempted)
        ?? (allowRecentFallback ? candidateDecisionForSkill(state, family.skillId, kinds, excluded, true) : null);
      if (decision) push(decision, "REPAIR", 120 + family.priority, `Repair ${family.key}: repeated or high-confidence miss in ${family.skillId}.`);
    }
  };
  const runRetentionPass = (allowRecentFallback: boolean) => {
    for (const { skillId, tier } of dueRetentions) {
      if (items.length >= size) break;
      const kinds: PracticalDecision["kind"][] = ["changed", "mixed", "boundary", "decision"];
      const decision = candidateDecisionForSkill(state, skillId, kinds, excluded, true, recentlyAttempted)
        ?? (allowRecentFallback ? candidateDecisionForSkill(state, skillId, kinds, excluded, true) : null);
      if (decision) push(decision, "RETENTION", 100 + tier, `Due ${tier}-day non-identical retrieval for ${skillId}.`, tier);
    }
  };

  // Pass 1: every REPAIR/RETENTION/ranked slot strictly avoids the last-seen
  // window. A skill whose own repeatable content is briefly exhausted simply
  // yields its slot to other eligible content in this same round, instead of
  // reusing an exact just-attempted prompt while alternatives exist elsewhere.
  runRepairPass(false);
  runRetentionPass(false);

  const rankedSkills = [...eligibleIds].map((skillId) => {
    const skill = practicalSkillById.get(skillId); if (!skill) return null; const stage = currentStage(state, skillId);
    return { skillId, stage, score: learningRouteScore({ skill, currentStage: stage }) - recentExposurePenalty(state, skillId), why: whyNowForSkill(skill, stage) };
  }).filter((item): item is NonNullable<typeof item> => Boolean(item)).sort((a, b) => b.score - a.score || a.skillId.localeCompare(b.skillId));

  for (const item of rankedSkills) {
    if (items.length >= size) break; const transferReady = stageAtLeast(item.stage, "DECISION_TRAINED");
    const kinds: PracticalDecision["kind"][] = transferReady ? ["changed", "mixed", "boundary", "decision"] : stageAtLeast(item.stage, "RECOGNITION_TRAINED") ? ["decision", "changed", "mixed"] : ["recognition", "decision"];
    const decision = candidateDecisionForSkill(state, item.skillId, kinds, excluded, false, recentlyAttempted); if (!decision) continue;
    const reason: IntegratedSessionItem["reason"] = transferReady ? "TRANSFER" : stageAtLeast(item.stage, "RECOGNITION_TRAINED") ? "REINFORCE" : "RECOGNITION";
    push(decision, reason, 40 + item.score, item.why);
  }

  // Pass 2: only once every avoiding source (repair, retention, and the ranked
  // skill sweep above) has had first claim on every slot do we allow an exact
  // recently-attempted repeat, and only to fill whatever is still short. This
  // is the genuinely-exhausted-corpus fallback: it now fires exclusively when
  // no eligible non-recent decision exists anywhere else in the round, never
  // merely because one skill's own alternatives ran out early.
  if (items.length < size) {
    runRepairPass(true);
    runRetentionPass(true);
  }

  // A corpus that is recently-seen everywhere intentionally yields a short or
  // empty round; the integrated-session UI routes the learner to the
  // always-available primary route rather than repeating a just-seen exact
  // prompt purely to pad the round out.
  return items.sort((a, b) => b.priority - a.priority).slice(0, size);
}

export function recordIntegratedDecision(state: PracticalMasteryState, item: IntegratedSessionItem, input: { actionId: string; reasonId: string; confidence: number; now?: Date }): PracticalMasteryState {
  const now = input.now ?? new Date(); const decision = practicalDecisionById.get(item.decisionId); if (!decision) throw new Error(`Unknown integrated decision: ${item.decisionId}`);
  const latestCorrectBefore = latestCorrectAttempt(state, decision.skillId); const correct = input.actionId === decision.correctActionId && input.reasonId === decision.correctReasonId;
  let next = recordPracticalDecision(state, { decisionId: item.decisionId, actionId: input.actionId, reasonId: input.reasonId, confidence: input.confidence, now });
  if (correct && item.retentionTierDays && latestCorrectBefore && item.decisionId !== latestCorrectBefore.decisionId) {
    const actualGap = elapsedDays(latestCorrectBefore.answeredAt, now);
    if (actualGap >= item.retentionTierDays) {
      const clone = structuredClone(next); const progress = clone.skills[decision.skillId]; progress.retentionDaysPassed = [...new Set([...progress.retentionDaysPassed, item.retentionTierDays])].sort((a, b) => a - b); clone.revision += 1; clone.updatedAt = now.toISOString(); next = clone;
      if (!next.skills[decision.skillId].delayedRetrievalPassed) next = markDelayedPracticalRetrieval(next, decision.skillId, true, now);
    }
  }
  return next;
}

export type RealHandRepairSignals = {
  street?: "preflop" | "flop" | "turn" | "river"; potType?: "srp" | "3bp" | "4bp" | "multiway"; role?: "aggressor_ip" | "aggressor_oop" | "caller_ip" | "caller_oop";
  blindIssue?: boolean; openSizeIssue?: boolean; boardOwnershipIssue?: boolean; automaticCbetIssue?: boolean; probeIssue?: boolean; bluffCatchIssue?: boolean; multiwayThresholdIssue?: boolean; straddleGeometryIssue?: boolean; evidenceGeneralizationIssue?: boolean;
};
export type RealHandRepairCandidate = { skillId: string; reason: string; priority: number };

export function routeRealHandToRepairs(signals: RealHandRepairSignals): RealHandRepairCandidate[] {
  const candidates: RealHandRepairCandidate[] = []; const add = (skillId: string, reason: string, priority: number) => { if (!candidates.some((item) => item.skillId === skillId)) candidates.push({ skillId, reason, priority }); };
  if (signals.blindIssue || signals.openSizeIssue) { add("PF-04", "Blind price/closing-action decision", 90); add("BL-04", "Open-size sensitivity in blind defence", 88); }
  if (signals.boardOwnershipIssue || signals.automaticCbetIssue) { add("W4-BOARD-01", "Board×arriving-range ownership", 92); add("OOP-01", "OOP checking versus initiative autopilot", 90); }
  if (signals.potType === "3bp") { const byRole: Record<NonNullable<RealHandRepairSignals["role"]>, string> = { aggressor_ip: "3BP-01", aggressor_oop: "3BP-02", caller_ip: "3BP-03", caller_oop: "3BP-04" }; if (signals.role) add(byRole[signals.role], "3-bet-pot role-specific execution", 86); add("3BP-05", "3-bet-pot board/sizing matrix", 80); }
  if (signals.potType === "4bp") { add("4BP-01", "Low-SPR compression", 84); add("4BP-04", "Jam/reopen exposure", 82); }
  if (signals.probeIssue || signals.street === "turn") { if (signals.probeIssue) add("TURN-03", "Turn probe ancestry/cap logic", 92); add("W4-RUNOUT-01", "Runout/range-shift recognition", 76); }
  if (signals.bluffCatchIssue || signals.street === "river") { if (signals.bluffCatchIssue) { add("RIV-03", "River price × bluff supply", 94); add("FND-05", "Combo/removal support", 72); } }
  if (signals.potType === "multiway" || signals.multiwayThresholdIssue) { add("MW-01", "Relative position / remaining ranges", 88); if (signals.multiwayThresholdIssue) add("MW-02", "Multiway value threshold", 92); }
  if (signals.straddleGeometryIssue) { add("DEEP-03", "Straddle resets strategic geometry", 96); add("FND-06", "Effective depth / SPR", 86); }
  if (signals.evidenceGeneralizationIssue) add("EXP-01", "Observation versus branch-scoped evidence", 96);
  return candidates.sort((a, b) => b.priority - a.priority || a.skillId.localeCompare(b.skillId));
}
