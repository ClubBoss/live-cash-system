import { foundationAnchors } from "./anchors-w1";
import { preflopAndBlindAnchors } from "./anchors-w2-w3";
import { recognitionAndSrpAnchors } from "./anchors-w4-w6";
import { advancedPracticalAnchors } from "./anchors-w7-w13";
import { foundationPreflopBlindDecisions } from "./decisions-w1-w3";
import { postflopAndLiveDecisions } from "./decisions-w4-w13";
import { integratedMasteryDecisions } from "./decisions-w14";
import { integratedA11ExpansionDecisions } from "./decisions-integrated-a11-expansion";
import { sourceSupportedGapFillDecisions } from "./decisions-gap-fill";
import { foundationExpansionDecisions } from "./decisions-foundation-expansion";
import { preflopCoreExpansionDecisions } from "./decisions-preflop-core-expansion";
import { preflopAdvancedExpansionDecisions } from "./decisions-preflop-advanced-expansion";
import { preflopLiveExpansionDecisions } from "./decisions-preflop-live-expansion";
import { blindDefenceExpansionDecisions } from "./decisions-blind-defence-expansion";
import { recognitionExpansionDecisions } from "./decisions-recognition-expansion";
import { srpA6ExpansionDecisions } from "./decisions-srp-a6-expansion";
import { threeBetFourBetA7ExpansionDecisions } from "./decisions-3bp-4bp-a7-expansion";
import { turnRiverA8ExpansionDecisions } from "./decisions-turn-river-a8-expansion";
import { liveA9ExpansionDecisions } from "./decisions-live-a9-expansion";
import { exploitA10ExpansionDecisions } from "./decisions-exploit-a10-expansion";
import { sourceClosureB1Decisions } from "./decisions-source-closure-b1";
import { sourceUtilizationC0Decisions } from "./decisions-source-utilization-c0";
import { perceptualPracticalDecisions, practicalTableStates } from "./perceptual-table-states";
import { variationB3Decisions } from "./decisions-variation-b3";
import { balanceB3AssessmentOptions } from "./b3-assessment-integrity";
import { b3PracticalTableStates } from "./perceptual-table-states-b3";
import { liveEdgeB4Decisions } from "./decisions-live-edge-b4";
import { executableGateRepairDecisions } from "./decisions-executable-gate-repair";
import { applyPracticalRuCopyRepair } from "./practical-ru-copy-repair";
import { applyPracticalRuFinalPolish } from "./practical-ru-final-polish";
import { applyPracticalAnchorRuCopyRepair } from "./practical-anchor-ru-copy-repair";
import {
  applyPracticalRuSystemicAnchorProjection,
  applyPracticalRuSystemicDecisionProjection,
} from "./practical-ru-systemic-publication";
import { applyPracticalRuSystemicPreflopCoreDecisionProjection } from "./practical-ru-systemic-preflop-core-publication";
import { applyPracticalRuSystemicPreflopCorePf05DecisionProjection } from "./practical-ru-systemic-preflop-core-pf05-publication";
import { applyPracticalRuSystemicPreflopAdvancedPf06DecisionProjection } from "./practical-ru-systemic-preflop-advanced-pf06-publication";
import { applyPracticalRuSystemicPreflopAdvancedPf07DecisionProjection } from "./practical-ru-systemic-preflop-advanced-pf07-publication";
import { applyPracticalRuSystemicPreflopAdvancedPf08DecisionProjection } from "./practical-ru-systemic-preflop-advanced-pf08-publication";
import { applyPracticalRuSystemicPreflopLivePf09DecisionProjection } from "./practical-ru-systemic-preflop-live-pf09-publication";
import { applyPracticalRuSystemicPreflopLivePf10DecisionProjection } from "./practical-ru-systemic-preflop-live-pf10-publication";
import {
  applyPracticalRuSystemicBlindDefenceAnchorProjection,
  applyPracticalRuSystemicBlindDefenceDecisionProjection,
} from "./practical-ru-systemic-blind-defence-publication";
import { applyPracticalAssessmentIntegrityRepair } from "./practical-assessment-integrity-repair";
import { practicalSkillFamilies } from "./registry";

export * from "./types";
export * from "./source-authority";
export * from "./learning-route";
export * from "./mental-model";
export * from "./memory-practice";
export * from "./preflop-a3-memory";
export * from "./blind-a4-memory";
export * from "./recognition-a5-memory";
export * from "./srp-a6-memory";
export * from "./threebet-fourbet-a7-memory";
export * from "./turn-river-a8-memory";
export * from "./decisions-turn-river-a8-expansion";
export * from "./live-a9-memory";
export * from "./decisions-live-a9-expansion";
export * from "./exploit-a10-memory";
export * from "./decisions-exploit-a10-expansion";
export * from "./decisions-integrated-a11-expansion";
export * from "./decisions-source-closure-b1";
export * from "./decisions-source-utilization-c0";
export * from "./perceptual-table-states";
export * from "./perceptual-table-states-b3";
export * from "./decisions-variation-b3";
export * from "./decisions-live-edge-b4";
export * from "./decisions-executable-gate-repair";
export * from "./rep-depth-policy";
export * from "./study-loop-c1";
export * from "./reference-baselines-c2";
export { practicalSkillFamilies } from "./registry";

export const allPracticalTableStates = [...practicalTableStates, ...b3PracticalTableStates];

export const practicalAnchors = [
  ...foundationAnchors,
  ...preflopAndBlindAnchors,
  ...recognitionAndSrpAnchors,
  ...advancedPracticalAnchors,
]
  .map(applyPracticalAnchorRuCopyRepair)
  .map(applyPracticalRuSystemicAnchorProjection)
  .map(applyPracticalRuSystemicBlindDefenceAnchorProjection)
  .map((anchor) => ({
    ...anchor,
    titleRu: anchor.promptRu,
    titleEn: anchor.promptEn,
    bodyRu: `${anchor.answerRu} ${anchor.rationaleRu}`,
    bodyEn: `${anchor.answerEn} ${anchor.rationaleEn}`,
  }));

export const practicalDecisions = [
  ...foundationPreflopBlindDecisions,
  ...postflopAndLiveDecisions,
  ...sourceSupportedGapFillDecisions,
  ...foundationExpansionDecisions,
  ...preflopCoreExpansionDecisions,
  ...preflopAdvancedExpansionDecisions,
  ...preflopLiveExpansionDecisions,
  ...blindDefenceExpansionDecisions,
  ...recognitionExpansionDecisions,
  ...srpA6ExpansionDecisions,
  ...threeBetFourBetA7ExpansionDecisions,
  ...turnRiverA8ExpansionDecisions,
  ...liveA9ExpansionDecisions,
  ...exploitA10ExpansionDecisions,
  ...sourceClosureB1Decisions,
  ...sourceUtilizationC0Decisions,
  ...balanceB3AssessmentOptions(variationB3Decisions),
  ...liveEdgeB4Decisions,
  ...executableGateRepairDecisions,
  ...perceptualPracticalDecisions,
  ...integratedMasteryDecisions,
  ...integratedA11ExpansionDecisions,
]
  .map(applyPracticalRuCopyRepair)
  .map(applyPracticalRuFinalPolish)
  .map(applyPracticalAssessmentIntegrityRepair)
  .map(applyPracticalRuSystemicDecisionProjection)
  .map(applyPracticalRuSystemicPreflopCoreDecisionProjection)
  .map(applyPracticalRuSystemicPreflopCorePf05DecisionProjection)
  .map(applyPracticalRuSystemicPreflopAdvancedPf06DecisionProjection)
  .map(applyPracticalRuSystemicPreflopAdvancedPf07DecisionProjection)
  .map(applyPracticalRuSystemicPreflopAdvancedPf08DecisionProjection)
  .map(applyPracticalRuSystemicPreflopLivePf09DecisionProjection)
  .map(applyPracticalRuSystemicPreflopLivePf10DecisionProjection)
  .map(applyPracticalRuSystemicBlindDefenceDecisionProjection);

export const practicalAnchorById = new Map(practicalAnchors.map((anchor) => [anchor.id, anchor]));
export const practicalDecisionById = new Map(practicalDecisions.map((decision) => [decision.id, decision]));
export const practicalSkillById = new Map(practicalSkillFamilies.map((skill) => [skill.id, skill]));
