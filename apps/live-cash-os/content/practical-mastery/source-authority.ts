export type PracticalSourceAuthority = {
  ref: string;
  kind: "CANONICAL_SOURCE" | "INTERNAL_AUTHORITY" | "SOURCE_GROUP_ALIAS";
  canonicalRefs?: string[];
  note?: string;
};

const canonical = (ref: string): PracticalSourceAuthority => ({ ref, kind: "CANONICAL_SOURCE" });
const internal = (ref: string, note: string): PracticalSourceAuthority => ({ ref, kind: "INTERNAL_AUTHORITY", note });
const alias = (ref: string, canonicalRefs: string[]): PracticalSourceAuthority => ({ ref, kind: "SOURCE_GROUP_ALIAS", canonicalRefs });

export const practicalSourceAuthorities: PracticalSourceAuthority[] = [
  ...Array.from({ length: 30 }, (_, index) => canonical(`FTGU-E${String(index + 1).padStart(2, "0")}`)),
  ...Array.from({ length: 10 }, (_, index) => canonical(`CINJ-E${String(index + 1).padStart(2, "0")}`)),
  ...Array.from({ length: 10 }, (_, index) => canonical(`CP-G3-L${String(index + 1).padStart(2, "0")}`)),
  ...Array.from({ length: 3 }, (_, index) => canonical(`SLC-M01-L${String(index + 1).padStart(2, "0")}`)),
  ...Array.from({ length: 20 }, (_, index) => canonical(`SLC-M02-L${String(index + 4).padStart(2, "0")}`)),
  ...Array.from({ length: 12 }, (_, index) => canonical(`SLC-M03-L${String(index + 24).padStart(2, "0")}`)),
  ...Array.from({ length: 6 }, (_, index) => canonical(`SLC-M04-L${String(index + 36).padStart(2, "0")}`)),

  internal("LCM-01", "Legacy admitted geometry mechanism; not an external source ID."),
  internal("LCM-02", "Legacy admitted preflop mechanism; not an external source ID."),
  internal("LCM-03", "Legacy admitted blind identity mechanism; not an external source ID."),
  internal("LCM-09", "Legacy admitted river mechanism; not an external source ID."),
  internal("LCM-10", "Legacy evidence-discipline authority; not an external source ID."),
  internal("LCM-11", "Legacy transfer/retention authority; not an external source ID."),
  internal("FINAL_LEARNING_INTEGRITY", "Repository learning-integrity authority; supports transfer design, not poker strategy truth."),
  internal("LIVE_CASH_SYSTEM_OBJECTIVE", "Product objective authority only; cannot support a poker-strategy answer key."),

  alias("SLC-PREFLOP-SQUEEZING", ["SLC-M01-L02"]),
  alias("SLC-PREFLOP-ADJUSTMENTS", ["SLC-M01-L03"]),
  alias("SLC-BB-VS-BTN", ["SLC-M02-L06", "SLC-M02-L07"]),
  alias("SLC-BB-VS-SB", ["SLC-M02-L05"]),
  alias("SLC-SRP-BOARD-CLASSES", ["SLC-M02-L22", "SLC-M02-L23"]),
  alias("SLC-CHECK-RAISE", ["SLC-M02-L16", "SLC-M02-L17"]),
  alias("SLC-HARD-CONTINUES", ["SLC-M02-L15"]),
  alias("SLC-TURN-LEADS", ["SLC-M02-L18", "SLC-M02-L19"]),
  alias("SLC-TURN-BARREL", ["SLC-M02-L09", "SLC-M02-L10", "SLC-M02-L11"]),
  alias("SLC-CAPPED-RANGES", ["SLC-M02-L12"]),
  alias("SLC-FLOP-OVERBET", ["SLC-M02-L13", "SLC-M02-L14"]),
  alias("SLC-3BET-POTS", ["SLC-M03-L24", "SLC-M03-L25", "SLC-M03-L26", "SLC-M03-L27", "SLC-M03-L28", "SLC-M03-L29", "SLC-M03-L30", "SLC-M03-L31", "SLC-M03-L32", "SLC-M03-L33", "SLC-M03-L34", "SLC-M03-L35"]),
  alias("SLC-EXPLOITING-OOP-CBETS", ["SLC-M03-L27"]),
  alias("SLC-3BET-IP", ["SLC-M03-L32"]),
  alias("SLC-LOW-EQUITY-BOARDS", ["SLC-M03-L33", "SLC-M03-L34", "SLC-M03-L35"]),
  alias("SLC-MULTIWAY", ["SLC-M04-L36", "SLC-M04-L37", "SLC-M04-L38", "SLC-M04-L39", "SLC-M04-L40", "SLC-M04-L41"]),
  alias("SLC-DEEP-SRP-OOP", ["SLC-M02-L21"]),
];

export const practicalSourceAuthorityByRef = new Map(practicalSourceAuthorities.map((authority) => [authority.ref, authority]));

export function resolvePracticalSourceRef(ref: string): string[] {
  const authority = practicalSourceAuthorityByRef.get(ref);
  if (!authority) return [];
  if (authority.kind === "SOURCE_GROUP_ALIAS") return authority.canonicalRefs ?? [];
  return [authority.ref];
}

export function isPokerStrategySourceRef(ref: string): boolean {
  const authority = practicalSourceAuthorityByRef.get(ref);
  if (!authority) return false;
  if (authority.kind === "CANONICAL_SOURCE" || authority.kind === "SOURCE_GROUP_ALIAS") return true;
  return ["LCM-01", "LCM-02", "LCM-03", "LCM-09"].includes(ref);
}
