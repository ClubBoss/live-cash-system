import {
  practicalAnchors,
  practicalDecisions,
  practicalSkillFamilies,
} from "./index";
import {
  practicalSourceAuthorityByRef,
  type PracticalSourceAuthority,
} from "./source-authority";
import {
  practicalSourceGapBySkillId,
  type PracticalSourceGapStatus,
} from "./source-gaps";
import type {
  PracticalAnchor,
  PracticalDecision,
  PracticalDecisionOption,
  PracticalEvidenceStage,
  PracticalSkillFamily,
} from "./types";

export const RUNTIME_CORPUS_AUDIT_SCHEMA = "LIVE_CASH_RUNTIME_CORPUS_AUDIT_V1" as const;

type AuditStatus = "PASS" | "REVIEW" | "SOURCE_BLOCKED" | "ERROR";
type RuntimeItemKind = "ANCHOR" | "DECISION";

type OptionAudit = {
  id: string;
  textRu: string;
  textEn: string;
  misconception: string | null;
  correct: boolean;
  order: number;
  ruLength: number;
  enLength: number;
};

type ReviewSignals = {
  missingChangedVariables: boolean;
  wrongOptionsWithoutMisconception: string[];
  promptLeakageCandidateOptionIds: string[];
  actionCorrectOrder: number | null;
  reasonCorrectOrder: number | null;
};

export type RuntimeCorpusAuditRow = {
  sequence: number;
  wave: string;
  skillId: string;
  itemId: string;
  itemKind: RuntimeItemKind;
  decisionKind: PracticalAnchor["kind"] | PracticalDecision["kind"];
  prerequisites: string[];
  sourceRefs: string[];
  sourceAuthorities: Array<{ ref: string; kind: PracticalSourceAuthority["kind"] }>;
  sourceStatus: PracticalSourceGapStatus;
  sourceCeiling: string | null;
  cueRu: string;
  cueEn: string;
  questionRu: string;
  questionEn: string;
  actionOptions: OptionAudit[];
  reasonOptions: OptionAudit[];
  correctActionId: string | null;
  correctReasonId: string | null;
  explanationRu: string;
  explanationEn: string;
  misconceptions: string[];
  changedVariables: string[];
  transferMarker: boolean;
  boundaryMarker: boolean;
  evidenceTarget: PracticalEvidenceStage;
  targetSeconds: number | null;
  reachable: boolean;
  auditStatus: AuditStatus;
  structuralErrors: string[];
  reviewSignals: ReviewSignals;
};

export type RuntimeCorpusAuditLedger = {
  schema: typeof RUNTIME_CORPUS_AUDIT_SCHEMA;
  generatedFrom: "practicalSkillFamilies+practicalAnchors+practicalDecisions";
  counts: {
    skills: number;
    anchors: number;
    decisions: number;
    stimuli: number;
    sourceBlockedSkills: number;
    partialSourceSkills: number;
    reviewItems: number;
    errorItems: number;
  };
  skills: Array<{
    sequence: number;
    skillId: string;
    wave: string;
    titleRu: string;
    titleEn: string;
    objectiveRu: string;
    prerequisites: string[];
    sourceRefs: string[];
    sourceStatus: PracticalSourceGapStatus;
    sourceCeiling: string | null;
    evidenceTarget: PracticalEvidenceStage;
    reachable: boolean;
  }>;
  rows: RuntimeCorpusAuditRow[];
  invariantErrors: string[];
};

function nonBlank(value: string): boolean {
  return value.trim().length > 0;
}

function normalize(value: string): string {
  return value.toLocaleLowerCase().replace(/[^\p{L}\p{N}%]+/gu, " ").trim();
}

function sourceStatus(skillId: string): PracticalSourceGapStatus {
  return practicalSourceGapBySkillId.get(skillId)?.status ?? "SUPPORTED";
}

function sourceCeiling(skillId: string): string | null {
  return practicalSourceGapBySkillId.get(skillId)?.reason ?? null;
}

function sourceAuthorities(sourceRefs: string[]) {
  return sourceRefs.flatMap((ref) => {
    const authority = practicalSourceAuthorityByRef.get(ref);
    return authority ? [{ ref, kind: authority.kind }] : [];
  });
}

function optionAudit(
  options: PracticalDecisionOption[],
  correctId: string,
): OptionAudit[] {
  return options.map((option, index) => ({
    id: option.id,
    textRu: option.textRu,
    textEn: option.textEn,
    misconception: option.misconception ?? null,
    correct: option.id === correctId,
    order: index + 1,
    ruLength: option.textRu.trim().length,
    enLength: option.textEn.trim().length,
  }));
}

function promptLeakageCandidates(decision: PracticalDecision): string[] {
  const promptRu = normalize(`${decision.cueRu} ${decision.questionRu}`);
  const promptEn = normalize(`${decision.cueEn} ${decision.questionEn}`);
  return [...decision.actionOptions, ...decision.reasonOptions]
    .filter((option) => {
      const ru = normalize(option.textRu);
      const en = normalize(option.textEn);
      return (ru.length >= 16 && promptRu.includes(ru)) || (en.length >= 16 && promptEn.includes(en));
    })
    .map((option) => option.id);
}

function duplicateIds(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return [...duplicates].sort();
}

function skillReachability(skills: PracticalSkillFamily[]): Map<string, boolean> {
  const byId = new Map(skills.map((skill) => [skill.id, skill]));
  const memo = new Map<string, boolean>();
  const visiting = new Set<string>();

  const reachable = (skillId: string): boolean => {
    if (memo.has(skillId)) return memo.get(skillId)!;
    const skill = byId.get(skillId);
    if (!skill || visiting.has(skillId)) {
      memo.set(skillId, false);
      return false;
    }
    visiting.add(skillId);
    const result = skill.prerequisiteSkillIds.every((id) => byId.has(id) && reachable(id));
    visiting.delete(skillId);
    memo.set(skillId, result);
    return result;
  };

  for (const skill of skills) reachable(skill.id);
  return memo;
}

function commonErrors(
  itemId: string,
  skillId: string,
  sourceRefs: string[],
  ruValues: string[],
  enValues: string[],
  skillIds: Set<string>,
): string[] {
  const errors: string[] = [];
  if (!skillIds.has(skillId)) errors.push(`${itemId}: unknown skill ${skillId}`);
  for (const ref of sourceRefs) {
    if (!practicalSourceAuthorityByRef.has(ref)) errors.push(`${itemId}: unknown sourceRef ${ref}`);
  }
  if (ruValues.some((value) => !nonBlank(value))) errors.push(`${itemId}: blank RU learner text`);
  if (enValues.some((value) => !nonBlank(value))) errors.push(`${itemId}: blank EN learner text`);
  return errors;
}

function rowStatus(
  errors: string[],
  status: PracticalSourceGapStatus,
  signals: ReviewSignals,
): AuditStatus {
  if (errors.length > 0) return "ERROR";
  if (status === "SOURCE_BLOCKED") return "SOURCE_BLOCKED";
  if (
    signals.missingChangedVariables ||
    signals.wrongOptionsWithoutMisconception.length > 0 ||
    signals.promptLeakageCandidateOptionIds.length > 0
  ) return "REVIEW";
  return "PASS";
}

function anchorRow(
  anchor: PracticalAnchor,
  sequence: number,
  skill: PracticalSkillFamily,
  reachable: boolean,
  skillIds: Set<string>,
): RuntimeCorpusAuditRow {
  const structuralErrors = commonErrors(
    anchor.id,
    anchor.skillId,
    anchor.sourceRefs,
    [anchor.promptRu, anchor.answerRu, anchor.rationaleRu],
    [anchor.promptEn, anchor.answerEn, anchor.rationaleEn],
    skillIds,
  );
  const reviewSignals: ReviewSignals = {
    missingChangedVariables: ["changed", "boundary", "mixed"].includes(anchor.kind) && (anchor.changedVariables?.length ?? 0) === 0,
    wrongOptionsWithoutMisconception: [],
    promptLeakageCandidateOptionIds: [],
    actionCorrectOrder: null,
    reasonCorrectOrder: null,
  };
  const status = sourceStatus(anchor.skillId);
  return {
    sequence,
    wave: skill.wave,
    skillId: anchor.skillId,
    itemId: anchor.id,
    itemKind: "ANCHOR",
    decisionKind: anchor.kind,
    prerequisites: [...skill.prerequisiteSkillIds],
    sourceRefs: [...anchor.sourceRefs],
    sourceAuthorities: sourceAuthorities(anchor.sourceRefs),
    sourceStatus: status,
    sourceCeiling: sourceCeiling(anchor.skillId),
    cueRu: anchor.promptRu,
    cueEn: anchor.promptEn,
    questionRu: anchor.promptRu,
    questionEn: anchor.promptEn,
    actionOptions: [],
    reasonOptions: [],
    correctActionId: null,
    correctReasonId: null,
    explanationRu: `${anchor.answerRu} ${anchor.rationaleRu}`.trim(),
    explanationEn: `${anchor.answerEn} ${anchor.rationaleEn}`.trim(),
    misconceptions: [],
    changedVariables: [...(anchor.changedVariables ?? [])],
    transferMarker: anchor.kind === "changed" || anchor.kind === "mixed",
    boundaryMarker: anchor.kind === "boundary" || anchor.kind === "mixed",
    evidenceTarget: skill.targetEvidenceStage,
    targetSeconds: null,
    reachable,
    auditStatus: rowStatus(structuralErrors, status, reviewSignals),
    structuralErrors,
    reviewSignals,
  };
}

function decisionRow(
  decision: PracticalDecision,
  sequence: number,
  skill: PracticalSkillFamily,
  reachable: boolean,
  skillIds: Set<string>,
): RuntimeCorpusAuditRow {
  const structuralErrors = commonErrors(
    decision.id,
    decision.skillId,
    decision.sourceRefs,
    [decision.cueRu, decision.questionRu, decision.explanationRu],
    [decision.cueEn, decision.questionEn, decision.explanationEn],
    skillIds,
  );
  if (decision.actionOptions.length < 2) structuralErrors.push(`${decision.id}: fewer than two action options`);
  if (decision.reasonOptions.length < 2) structuralErrors.push(`${decision.id}: fewer than two reason options`);
  for (const duplicate of duplicateIds(decision.actionOptions.map((option) => option.id))) {
    structuralErrors.push(`${decision.id}: duplicate action option ${duplicate}`);
  }
  for (const duplicate of duplicateIds(decision.reasonOptions.map((option) => option.id))) {
    structuralErrors.push(`${decision.id}: duplicate reason option ${duplicate}`);
  }
  if (!decision.actionOptions.some((option) => option.id === decision.correctActionId)) {
    structuralErrors.push(`${decision.id}: correct action is not an option`);
  }
  if (!decision.reasonOptions.some((option) => option.id === decision.correctReasonId)) {
    structuralErrors.push(`${decision.id}: correct reason is not an option`);
  }
  if (decision.targetSeconds <= 0) structuralErrors.push(`${decision.id}: invalid targetSeconds`);

  const wrongOptions = [
    ...decision.actionOptions.filter((option) => option.id !== decision.correctActionId),
    ...decision.reasonOptions.filter((option) => option.id !== decision.correctReasonId),
  ];
  const reviewSignals: ReviewSignals = {
    missingChangedVariables: ["changed", "boundary", "mixed"].includes(decision.kind) && (decision.changedVariables?.length ?? 0) === 0,
    wrongOptionsWithoutMisconception: wrongOptions.filter((option) => !option.misconception).map((option) => option.id),
    promptLeakageCandidateOptionIds: promptLeakageCandidates(decision),
    actionCorrectOrder: decision.actionOptions.findIndex((option) => option.id === decision.correctActionId) + 1,
    reasonCorrectOrder: decision.reasonOptions.findIndex((option) => option.id === decision.correctReasonId) + 1,
  };
  const status = sourceStatus(decision.skillId);
  return {
    sequence,
    wave: skill.wave,
    skillId: decision.skillId,
    itemId: decision.id,
    itemKind: "DECISION",
    decisionKind: decision.kind,
    prerequisites: [...skill.prerequisiteSkillIds],
    sourceRefs: [...decision.sourceRefs],
    sourceAuthorities: sourceAuthorities(decision.sourceRefs),
    sourceStatus: status,
    sourceCeiling: sourceCeiling(decision.skillId),
    cueRu: decision.cueRu,
    cueEn: decision.cueEn,
    questionRu: decision.questionRu,
    questionEn: decision.questionEn,
    actionOptions: optionAudit(decision.actionOptions, decision.correctActionId),
    reasonOptions: optionAudit(decision.reasonOptions, decision.correctReasonId),
    correctActionId: decision.correctActionId,
    correctReasonId: decision.correctReasonId,
    explanationRu: decision.explanationRu,
    explanationEn: decision.explanationEn,
    misconceptions: [...new Set([...decision.actionOptions, ...decision.reasonOptions].flatMap((option) => option.misconception ? [option.misconception] : []))],
    changedVariables: [...(decision.changedVariables ?? [])],
    transferMarker: decision.kind === "changed" || decision.kind === "mixed",
    boundaryMarker: decision.kind === "boundary" || decision.kind === "mixed",
    evidenceTarget: skill.targetEvidenceStage,
    targetSeconds: decision.targetSeconds,
    reachable,
    auditStatus: rowStatus(structuralErrors, status, reviewSignals),
    structuralErrors,
    reviewSignals,
  };
}

export function runtimeCorpusAuditLedger(): RuntimeCorpusAuditLedger {
  const invariantErrors: string[] = [];
  const skillIds = new Set(practicalSkillFamilies.map((skill) => skill.id));
  const reachability = skillReachability(practicalSkillFamilies);
  const skillById = new Map(practicalSkillFamilies.map((skill) => [skill.id, skill]));

  for (const duplicate of duplicateIds(practicalSkillFamilies.map((skill) => skill.id))) invariantErrors.push(`duplicate skill ${duplicate}`);
  for (const duplicate of duplicateIds(practicalAnchors.map((anchor) => anchor.id))) invariantErrors.push(`duplicate anchor ${duplicate}`);
  for (const duplicate of duplicateIds(practicalDecisions.map((decision) => decision.id))) invariantErrors.push(`duplicate decision ${duplicate}`);
  const crossKindDuplicates = practicalAnchors.map((anchor) => anchor.id).filter((id) => practicalDecisions.some((decision) => decision.id === id));
  for (const duplicate of [...new Set(crossKindDuplicates)].sort()) invariantErrors.push(`duplicate stimulus id across anchor/decision ${duplicate}`);

  for (const skill of practicalSkillFamilies) {
    for (const prerequisite of skill.prerequisiteSkillIds) {
      if (!skillIds.has(prerequisite)) invariantErrors.push(`${skill.id}: unknown prerequisite ${prerequisite}`);
    }
    if (!reachability.get(skill.id)) invariantErrors.push(`${skill.id}: unreachable prerequisite graph`);
    for (const ref of skill.sourceRefs) {
      if (!practicalSourceAuthorityByRef.has(ref)) invariantErrors.push(`${skill.id}: unknown sourceRef ${ref}`);
    }
  }

  const rows: RuntimeCorpusAuditRow[] = [];
  let sequence = 1;
  for (const anchor of practicalAnchors) {
    const skill = skillById.get(anchor.skillId);
    if (!skill) {
      invariantErrors.push(`${anchor.id}: unknown skill ${anchor.skillId}`);
      continue;
    }
    rows.push(anchorRow(anchor, sequence++, skill, reachability.get(skill.id) ?? false, skillIds));
  }
  for (const decision of practicalDecisions) {
    const skill = skillById.get(decision.skillId);
    if (!skill) {
      invariantErrors.push(`${decision.id}: unknown skill ${decision.skillId}`);
      continue;
    }
    rows.push(decisionRow(decision, sequence++, skill, reachability.get(skill.id) ?? false, skillIds));
  }
  invariantErrors.push(...rows.flatMap((row) => row.structuralErrors));

  const skills = practicalSkillFamilies.map((skill, index) => ({
    sequence: index + 1,
    skillId: skill.id,
    wave: skill.wave,
    titleRu: skill.titleRu,
    titleEn: skill.titleEn,
    objectiveRu: skill.objectiveRu,
    prerequisites: [...skill.prerequisiteSkillIds],
    sourceRefs: [...skill.sourceRefs],
    sourceStatus: sourceStatus(skill.id),
    sourceCeiling: sourceCeiling(skill.id),
    evidenceTarget: skill.targetEvidenceStage,
    reachable: reachability.get(skill.id) ?? false,
  }));

  return {
    schema: RUNTIME_CORPUS_AUDIT_SCHEMA,
    generatedFrom: "practicalSkillFamilies+practicalAnchors+practicalDecisions",
    counts: {
      skills: practicalSkillFamilies.length,
      anchors: practicalAnchors.length,
      decisions: practicalDecisions.length,
      stimuli: practicalAnchors.length + practicalDecisions.length,
      sourceBlockedSkills: skills.filter((skill) => skill.sourceStatus === "SOURCE_BLOCKED").length,
      partialSourceSkills: skills.filter((skill) => skill.sourceStatus === "PARTIAL").length,
      reviewItems: rows.filter((row) => row.auditStatus === "REVIEW").length,
      errorItems: rows.filter((row) => row.auditStatus === "ERROR").length,
    },
    skills,
    rows,
    invariantErrors: [...new Set(invariantErrors)].sort(),
  };
}

export function assertRuntimeCorpusAuditInvariants(ledger = runtimeCorpusAuditLedger()): void {
  if (ledger.counts.stimuli !== practicalAnchors.length + practicalDecisions.length) {
    throw new Error(`runtime corpus audit missed stimuli: expected ${practicalAnchors.length + practicalDecisions.length}, got ${ledger.counts.stimuli}`);
  }
  if (ledger.rows.length !== ledger.counts.stimuli) {
    throw new Error(`runtime corpus audit row mismatch: expected ${ledger.counts.stimuli}, got ${ledger.rows.length}`);
  }
  if (ledger.skills.length !== practicalSkillFamilies.length) {
    throw new Error(`runtime corpus audit missed skills: expected ${practicalSkillFamilies.length}, got ${ledger.skills.length}`);
  }
  if (ledger.invariantErrors.length > 0) {
    throw new Error(`runtime corpus audit invariant failure:\n${ledger.invariantErrors.join("\n")}`);
  }
}
