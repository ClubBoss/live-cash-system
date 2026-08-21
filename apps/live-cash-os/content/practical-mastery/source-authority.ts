export type PracticalSourceAuthority = {
  ref: string;
  kind: "CANONICAL_SOURCE" | "INTERNAL_AUTHORITY" | "SOURCE_GROUP_ALIAS";
  canonicalRefs?: string[];
  note?: string;
};

const canonical = (ref: string, note?: string): PracticalSourceAuthority => ({ ref, kind: "CANONICAL_SOURCE", note });
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

  // B1 externally reviewed public authorities. These are source-scoped mechanisms,
  // not permission to copy exact visual charts/frequencies into learner memory.
  canonical("EXT-PC-OUTS-2026", "PokerCoaching, Poker Math / Outs and dirty-outs sections, reviewed 2026-08-21. Supports clean-vs-dirty out distinction, discounting questionable outs, and opponent-range dependence. https://pokercoaching.com/poker-math/"),
  canonical("EXT-PC-OUTS-GUIDE-2023", "PokerCoaching, How to Count Poker Outs, reviewed 2026-08-21. Supports dirty-out traps, double-count avoidance, range/multiway caveats and approximate rule-of-2/4 use. https://pokercoaching.com/blog/outs-in-poker/"),
  canonical("EXT-GTOW-SB-SRP-2024", "GTO Wizard, Aggregate Flop Strategy: SB C-Betting in SRP, reviewed 2026-08-21. Public cash-game article includes 100bb SB opening structure and explicitly warns BvB mixes are opponent-sensitive. https://blog.gtowizard.com/aggregate-flop-strategy-sb-c-betting-in-srp/"),
  canonical("EXT-UP-BVB-CALLER-2019", "Upswing, How to Win Your Blind vs Blind Battles (as the Preflop Caller), reviewed 2026-08-21. Supports BB-vs-SB-open price, closing action, positional realization and wide defence direction. https://upswingpoker.com/win-blind-vs-blind-battles-caller/"),
  canonical("EXT-UP-BVB-LIMP-2019", "Upswing, How to Win Your Blind vs Blind Wars (When Facing a Limp), reviewed 2026-08-21. Supports BB response to SB limp, raise/check split, exploit sensitivity and continuation after limp-reraise. https://upswingpoker.com/blind-vs-small-blind-limp/"),
  canonical("EXT-GTOW-BVB-LIMP-CALLED-2024", "GTO Wizard, Limp-Called Pot as BB, reviewed 2026-08-21. Supports BB raise-vs-check EV framing and SB response after BB isolation raise; exact cells remain reference-only. https://blog.gtowizard.com/limp-called-pot-as-bb/"),
  canonical("EXT-GTOW-3BP-OOP-2023", "GTO Wizard, C-Betting OOP in 3-Bet Pots, reviewed 2026-08-21. Supports blind 3-bettor depth/board checking and sizing mechanisms; not a direct SB-vs-BB full answer-key tree. https://blog.gtowizard.com/c-betting-oop-in-3-bet-pots/"),
  canonical("EXT-GTOW-DEEP-300-2025", "GTO Wizard, How To Respond to Large Preflop Raises in Poker, reviewed 2026-08-21. Explicitly compares raked/unraked 300bb cash opening/calling/3-betting incentives. https://blog.gtowizard.com/how-to-respond-to-large-preflop-raises-in-poker/"),
  canonical("EXT-GTOW-DEEP-SOLUTIONS-300", "GTO Wizard public deep-solution catalogue / nodelocking article, reviewed 2026-08-21. Confirms 150/200/300bb cash solution families and rake assumptions; existence alone is not an answer key. https://blog.gtowizard.com/introducing-nodelocking/"),
  canonical("EXT-UP-SET-MINING-300-2025", "Upswing, Set Mining Poker Tips, reviewed 2026-08-21. Supports deeper implied-odds upside and corresponding larger reverse-implied-loss exposure through a 300bb comparison. https://upswingpoker.com/set-mining-poker-tips/"),
  canonical("EXT-PS-MULTIWAY-2026", "PokerStars Learn, A Guide to Multiway Pots, reviewed 2026-08-21. Supports stronger continuing ranges, reduced bluffing and stricter one-pair/value thresholds multiway. https://www.pokerstars.com/poker/learn/strategies/a-guide-to-multiway-pots/"),
  canonical("EXT-PS-RIVER-2025", "PokerStars Learn, How to Win More Money on the River in NLHE, reviewed 2026-08-21. Supports river value-target logic and live underbluff/value tendencies; use together with canonical multiway sources, not as a standalone multiway solver tree. https://www.pokerstars.com/poker/learn/strategies/tips-that-will-help-you-win-more-money-on-the-river/"),
  canonical("EXT-PC-GAMESEL-2025", "PokerCoaching, Game Selection in Poker, reviewed 2026-08-21. Supports choosing table/game by expected profitability, opponent quality and willingness to move rather than excitement/ego. https://pokercoaching.com/blog/game-selection-in-poker/"),
  canonical("EXT-CP-SEATSEL-2014", "CardPlayer Head Games: Table and Seat Selection in Cash Games, reviewed 2026-08-21. Multi-pro discussion supports seat-relative skill/aggression considerations and cautions against superficial profiling. https://www.cardplayer.com/cardplayer-poker-magazines/66266-isaac-haxton-11-2/articles/21728-head-games-how-important-is-table-and-seat-selection-in-cash-games"),

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
