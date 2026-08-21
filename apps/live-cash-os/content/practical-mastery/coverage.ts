import { practicalAnchors, practicalDecisions, practicalSkillFamilies } from "./index";
import { practicalSourceAuthorityByRef } from "./source-authority";
import { practicalSourceGapBySkillId, type PracticalSourceGapStatus } from "./source-gaps";
import type { PracticalEvidenceStage } from "./types";

export type PracticalCoverageStatus =
  | "SOURCE_BLOCKED"
  | "SOURCE_ONLY"
  | "ANCHORED"
  | "DECISION_TRAINED"
  | "TRANSFER_EXPOSED"
  | "BOUNDARY_EXPOSED";

export type PracticalCoverageRow = {
  skillId: string;
  wave: string;
  priority: "P0" | "P1" | "P2";
  targetEvidenceStage: PracticalEvidenceStage;
  sourceGapStatus: PracticalSourceGapStatus | "SUPPORTED";
  sourceRefs: string[];
  unknownSourceRefs: string[];
  anchorCount: number;
  decisionCount: number;
  changedDecisionCount: number;
  boundaryDecisionCount: number;
  mixedDecisionCount: number;
  status: PracticalCoverageStatus;
};

export function practicalCoverageRows(): PracticalCoverageRow[] {
  return practicalSkillFamilies.map((skill) => {
    const anchors = practicalAnchors.filter((anchor) => anchor.skillId === skill.id);
    const decisions = practicalDecisions.filter((decision) => decision.skillId === skill.id);
    const sourceRefs = [...new Set([...skill.sourceRefs, ...anchors.flatMap((anchor) => anchor.sourceRefs), ...decisions.flatMap((decision) => decision.sourceRefs)])];
    const unknownSourceRefs = sourceRefs.filter((ref) => !practicalSourceAuthorityByRef.has(ref));
    const sourceGap = practicalSourceGapBySkillId.get(skill.id);
    const sourceGapStatus = sourceGap?.status ?? "SUPPORTED";
    const changedDecisionCount = decisions.filter((decision) => decision.kind === "changed").length;
    const boundaryDecisionCount = decisions.filter((decision) => decision.kind === "boundary").length;
    const mixedDecisionCount = decisions.filter((decision) => decision.kind === "mixed").length;
    const status: PracticalCoverageStatus = sourceGapStatus === "SOURCE_BLOCKED"
      ? "SOURCE_BLOCKED"
      : boundaryDecisionCount > 0
        ? "BOUNDARY_EXPOSED"
        : changedDecisionCount > 0 || mixedDecisionCount > 0
          ? "TRANSFER_EXPOSED"
          : decisions.length > 0
            ? "DECISION_TRAINED"
            : anchors.length > 0
              ? "ANCHORED"
              : "SOURCE_ONLY";
    return {
      skillId: skill.id,
      wave: skill.wave,
      priority: skill.livePriority,
      targetEvidenceStage: skill.targetEvidenceStage,
      sourceGapStatus,
      sourceRefs,
      unknownSourceRefs,
      anchorCount: anchors.length,
      decisionCount: decisions.length,
      changedDecisionCount,
      boundaryDecisionCount,
      mixedDecisionCount,
      status,
    };
  });
}

export function practicalCoverageSummary() {
  const rows = practicalCoverageRows();
  return {
    skills: rows.length,
    p0: rows.filter((row) => row.priority === "P0").length,
    p1: rows.filter((row) => row.priority === "P1").length,
    withDecisions: rows.filter((row) => row.decisionCount > 0).length,
    withTransferOrBoundary: rows.filter((row) => row.changedDecisionCount + row.boundaryDecisionCount + row.mixedDecisionCount > 0).length,
    sourceOnly: rows.filter((row) => row.status === "SOURCE_ONLY").map((row) => row.skillId),
    sourceBlocked: rows.filter((row) => row.status === "SOURCE_BLOCKED").map((row) => row.skillId),
    partialSource: rows.filter((row) => row.sourceGapStatus === "PARTIAL").map((row) => row.skillId),
    unknownSourceRefs: [...new Set(rows.flatMap((row) => row.unknownSourceRefs))],
  };
}
