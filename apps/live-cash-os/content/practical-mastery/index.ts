import { foundationAnchors } from "./anchors-w1";
import { preflopAndBlindAnchors } from "./anchors-w2-w3";
import { recognitionAndSrpAnchors } from "./anchors-w4-w6";
import { advancedPracticalAnchors } from "./anchors-w7-w13";
import { foundationPreflopBlindDecisions } from "./decisions-w1-w3";
import { postflopAndLiveDecisions } from "./decisions-w4-w13";
import { integratedMasteryDecisions } from "./decisions-w14";
import { sourceSupportedGapFillDecisions } from "./decisions-gap-fill";
import { preflopCoreExpansionDecisions } from "./decisions-preflop-core-expansion";
import { practicalSkillFamilies } from "./registry";

export * from "./types";
export * from "./source-authority";
export { practicalSkillFamilies } from "./registry";

export const practicalAnchors = [
  ...foundationAnchors,
  ...preflopAndBlindAnchors,
  ...recognitionAndSrpAnchors,
  ...advancedPracticalAnchors,
];

export const practicalDecisions = [
  ...foundationPreflopBlindDecisions,
  ...postflopAndLiveDecisions,
  ...sourceSupportedGapFillDecisions,
  ...preflopCoreExpansionDecisions,
  ...integratedMasteryDecisions,
];

export const practicalAnchorById = new Map(practicalAnchors.map((anchor) => [anchor.id, anchor]));
export const practicalDecisionById = new Map(practicalDecisions.map((decision) => [decision.id, decision]));
export const practicalSkillById = new Map(practicalSkillFamilies.map((skill) => [skill.id, skill]));
