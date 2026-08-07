export type RuntimeRepairKind = "core" | "changed" | "boundary";
export type RuntimeRepairRule = {
  errorKey: string;
  preferredVariantGroup?: string;
  preferredNodeKey?: string;
  preferredKind?: RuntimeRepairKind;
  fallbackKind?: RuntimeRepairKind;
};

/**
 * Local runtime repair routing only. Keys are exact drill + option identities.
 * This registry never infers or exports canonical diagnostic misconception IDs.
 */
export const RUNTIME_REPAIR_REGISTRY: Readonly<Record<string, RuntimeRepairRule>> = {
  "geo-03::geo-03-a1": { errorKey: "current-price-vs-future-geometry", preferredVariantGroup: "future-spr", preferredNodeKey: "nominal-100bb", preferredKind: "boundary", fallbackKind: "changed" },
  "geo-03::geo-03-a2": { errorKey: "starting-depth-vs-post-action-spr", preferredVariantGroup: "future-spr", preferredNodeKey: "nominal-400bb-compressed", preferredKind: "changed", fallbackKind: "boundary" },
  "geo-03::geo-03-r1": { errorKey: "call-does-not-end-future-tree", preferredVariantGroup: "future-spr", preferredNodeKey: "nominal-100bb", preferredKind: "boundary", fallbackKind: "changed" },
  "geo-03::geo-03-r2": { errorKey: "spr-is-not-equity", preferredVariantGroup: "future-spr", preferredNodeKey: "nominal-400bb-compressed", preferredKind: "changed", fallbackKind: "boundary" },
  "pre-02::pre-02-a1": { errorKey: "suitedness-does-not-force-squeeze", preferredNodeKey: "sb-a5s-late", preferredKind: "changed", fallbackKind: "boundary" },
  "pre-02::pre-02-r2": { errorKey: "initiative-is-not-a-squeeze-job", preferredNodeKey: "sb-a5s-late", preferredKind: "changed", fallbackKind: "boundary" },
  "pre-04::pre-04-a1": { errorKey: "polar-candidate-is-not-fixed-cell", preferredNodeKey: "btn-76s-deep", preferredKind: "changed", fallbackKind: "boundary" },
  "pre-04::pre-04-r1": { errorKey: "blocker-needs-real-fold-targets", preferredNodeKey: "co-kjo-ep", preferredKind: "boundary", fallbackKind: "changed" },
  "pre-05::pre-05-a1": { errorKey: "shorter-stack-reduces-speculative-flat-value", preferredNodeKey: "btn-76s-deep", preferredKind: "changed", fallbackKind: "boundary" },
  "pre-05::pre-05-a2": { errorKey: "depth-changes-preflop-branch", preferredNodeKey: "btn-76s-deep", preferredKind: "changed", fallbackKind: "boundary" },
  "bli-02::bli-02-a1": { errorKey: "closing-call-before-initiative-squeeze", preferredNodeKey: "sb-player-behind", preferredKind: "boundary", fallbackKind: "changed" },
  "bli-02::bli-02-r2": { errorKey: "closing-action-is-value-not-guarantee", preferredNodeKey: "sb-player-behind", preferredKind: "boundary", fallbackKind: "changed" },
  "bli-03::bli-03-a1": { errorKey: "player-behind-is-distinct-preflop-risk", preferredNodeKey: "bb-closing-call", preferredKind: "changed", fallbackKind: "boundary" },
  "bli-03::bli-03-r1": { errorKey: "sb-price-is-not-bb-closing-price", preferredNodeKey: "bb-closing-call", preferredKind: "changed", fallbackKind: "boundary" },
  "agg-02::agg-02-a1": { errorKey: "low-showdown-does-not-create-bluff-job", preferredNodeKey: "protected-call-vs-denial", preferredKind: "changed", fallbackKind: "boundary" },
  "agg-02::agg-02-r1": { errorKey: "size-does-not-create-folds-from-nothing", preferredNodeKey: "protected-call-vs-denial", preferredKind: "changed", fallbackKind: "boundary" },
};

export function getRuntimeRepairRule(drillId: string, optionId: string): RuntimeRepairRule | undefined {
  return RUNTIME_REPAIR_REGISTRY[`${drillId}::${optionId}`];
}
