"use client";

import { useEffect, useMemo, useState } from "react";

type ModuleId = "geometry" | "preflop" | "blinds" | "filtering" | "shape" | "aggression" | "ancestry" | "multiway" | "river" | "evidence" | "transfer" | "mixed";
type Drill = { module: ModuleId; cue: string; question: string; action: string; reason: string };
type DiagnosticItem = { id: string; title: string; prompt: string; targetSeconds: number };
type DiagnosticResponse = { item_id: string; answer: string; reasoning: string; confidence: number; time_seconds: number };
type DiagnosticState = { status: "NOT_STARTED" | "IN_PROGRESS" | "AWAITING_REVIEW"; startedAt: string | null; responses: DiagnosticResponse[]; submittedAt: string | null };
type LearnerState = {
  version: "0.4.1";
  completed: number;
  activeModule: ModuleId;
  dimension: Record<string, number>;
  cardStates: Record<string, boolean>;
  history: Array<{ module: ModuleId; score: number; at: string }>;
  recallDueAt: string | null;
  fieldNotes: Array<{ cue: string; action: string; reason: string; at: string }>;
  diagnostic: DiagnosticState;
};
type ResponseClass = "A" | "B" | "C" | "D";

const STORAGE_KEY = "live-cash-os:learner-state";
const appLoadedAt = Date.now();
const emptyState = (): LearnerState => ({
  version: "0.4.1",
  completed: 0,
  activeModule: "geometry",
  dimension: { node: 0, mechanism: 0, action: 0, boundary: 0, speed: 0, calibration: 0, retention: 0, transfer: 0 },
  cardStates: {},
  history: [],
  recallDueAt: null,
  fieldNotes: [],
  diagnostic: { status: "NOT_STARTED", startedAt: null, responses: [], submittedAt: null },
});

const drills: Record<ModuleId, Drill[]> = {
  geometry: [
    { module: "geometry", cue: "The pot is already large after a preflop 3-bet.", question: "What should set the postflop architecture first?", action: "Calculate post-action SPR", reason: "Nominal big blinds can hide a compressed future tree." },
    { module: "geometry", cue: "Stacks look 200bb deep, but a straddle is live.", question: "Which depth is most useful at the table?", action: "Use effective depth in straddles", reason: "The meaningful decision unit follows the live forced bet." },
    { module: "geometry", cue: "A medium pair is ahead now on a dynamic board.", question: "What distinguishes call from raise?", action: "Test the future job of each line", reason: "Immediate equity is not the same as long-tree resilience." },
    { module: "geometry", cue: "Two players have different stacks in a multiway pot.", question: "What prevents treating the table as one uniform depth?", action: "Map each relevant confrontation separately", reason: "The effective stack can change across the side confrontations." },
    { module: "geometry", cue: "A raise would create a very low remaining SPR.", question: "What should be checked before treating the raise as automatic?", action: "Compare commitment and future-tree length", reason: "A line is defined by the decisions it leaves, not only by current equity." },
  ],
  preflop: [
    { module: "preflop", cue: "100bb · CO opens 3bb · BTN calls · Hero SB holds TT.", question: "Which preflop family fits first?", action: "Use a value squeeze core", reason: "Wide late ranges, denial and poor SB flat realisation make a heads-up conversion valuable." },
    { module: "preflop", cue: "200bb · HJ opens 3bb · CO calls · Hero BTN holds 76s; blinds are passive.", question: "What protects the hand's value here?", action: "Call rather than force a squeeze", reason: "Position and depth create realisation and implied-odds value; removing a flat does not create a bluff." },
    { module: "preflop", cue: "100bb · EP opens 4bb · HJ calls · Hero CO holds KJo.", question: "What avoids a blocker-looking invention?", action: "Fold the dominated offsuit broadway", reason: "The strong opener zone, domination and poor multiway realisation outweigh superficial blockers." },
    { module: "preflop", cue: "100bb · CO opens 3bb · BTN calls · Hero SB holds A5s; BB is passive.", question: "Which branch has a real fold target?", action: "Use a polar squeeze flex", reason: "A5s blocks strong Ax continues, retains nut equity, and late ranges supply folds." },
    { module: "preflop", cue: "55bb · BTN opens 2.5bb · SB calls · Hero BB holds AJo.", question: "How does the shorter stack change the branch?", action: "Prefer a linear squeeze flex", reason: "Lower SPR raises high-card value while the implied odds of speculative calls fall." },
  ],
  blinds: [
    { module: "blinds", cue: "An opener reaches the same dry flop once against BB and once against a cold-calling SB.", question: "What prevents copying the same c-bet default?", action: "Distinguish the SB and BB arriving ranges", reason: "SB cold calls are generally more condensed than BB defence, changing the response geography." },
    { module: "blinds", cue: "Hero BB can close the action after an open and a call with a suited connected hand.", question: "What should be valued before turning it into aggression?", action: "Preserve the closing-action call branch", reason: "Closing action, price and board coverage can create realisation without forcing a large pot." },
    { module: "blinds", cue: "Hero SB faces an open and a caller with a hand that can continue in several ways.", question: "What makes a passive flat less automatic than from BB?", action: "Account for the players-behind squeeze risk", reason: "SB remains out of position and can lose the cheap realisation that a BB closing call retains." },
    { module: "blinds", cue: "A hand looks playable preflop but will be out of position in a deep pot.", question: "Which question should precede a loose defend?", action: "Test its future realisation under position", reason: "Raw hand appearance is not the same as the equity that survives future decisions." },
    { module: "blinds", cue: "A live player calls from a blind with an unfamiliar combination once.", question: "How should that observation enter the model?", action: "Keep the structural blind baseline until repeated evidence", reason: "One seen hand can inform a note but does not erase the range and position constraints." },
  ],
  filtering: [
    { module: "filtering", cue: "A player voluntarily calls twice before the river.", question: "What is the first range update?", action: "Filter the source range through both actions", reason: "Every voluntary action changes ownership and bluff supply." },
    { module: "filtering", cue: "A flop bet is small and near-range.", question: "Before selecting a defence, what comes first?", action: "Read the bet's range shape", reason: "Size alone does not identify the responding range geography." },
    { module: "filtering", cue: "A player checks back the flop, then faces a dynamic turn.", question: "What should the turn decision begin with?", action: "Rebuild the range after the check-back", reason: "The missed action removes some betting branches and preserves others." },
    { module: "filtering", cue: "A caller continues on the flop and turn, then the river changes the board.", question: "What stops a blocker-only river choice?", action: "Audit which value and bluffs actually arrived", reason: "A river card matters through the action-filtered range, not by appearance alone." },
    { module: "filtering", cue: "An opponent takes an unfamiliar line in a live game.", question: "What comes before an exploit adjustment?", action: "Keep the baseline until the branch error is evidenced", reason: "One unusual line does not prove a stable opponent tendency." },
  ],
  shape: [
    { module: "shape", cue: "Villain uses a small c-bet with a wide range.", question: "Which defensive direction becomes available first?", action: "Call wider and consider linear protection raises", reason: "The small wide branch contains more air and offers a better price." },
    { module: "shape", cue: "The same texture is bet large from a selective, value-heavy branch.", question: "How should the response shape change?", action: "Compress calls and remove thin raises", reason: "A large polar branch leaves a stronger continuing range and less denial value." },
    { module: "shape", cue: "You hold a strong but robust hand against a credible future aggressor.", question: "What protects the rest of your response range?", action: "Keep selected robust hands in the call branch", reason: "Strong calls retain air, protect weaker calls and preserve future aggressive options." },
    { module: "shape", cue: "A vulnerable top pair faces a small wide bet on a dynamic board with top-end support.", question: "What makes a raise potentially valid?", action: "Name value and denial targets before raising", reason: "A merged protection raise needs worse continues or meaningful live equity to deny." },
    { module: "shape", cue: "Playing the turn out of position feels uncomfortable.", question: "What should decide whether to raise now?", action: "Test whether the raise has a concrete job", reason: "Relief, control and discomfort are not value, denial, equity-pressure or protection jobs." },
  ],
  aggression: [
    { module: "aggression", cue: "A hand has little showdown value and Hero considers bluffing the turn.", question: "What question must be answered before counting bluffs?", action: "Set the weakest value hand and value threshold first", reason: "Bluff volume follows the value region and size, not the visual weakness of Hero’s hand." },
    { module: "aggression", cue: "A turn hand has little equity, blocks no strong calls, blocks folds and has no credible river plan.", question: "What should stop the barrel?", action: "Reject the jobless bluff", reason: "Low showdown value alone is not equity, blocker, matcher or future-air utility." },
    { module: "aggression", cue: "A turn card completes an obvious draw and improves Villain’s flop-calling range.", question: "What prevents an automatic scary-card overbet?", action: "Check whether the card repairs Villain’s range", reason: "A scary card can reduce Hero’s value advantage and favour smaller bets or checks." },
    { module: "aggression", cue: "A strong made hand faces a passive future actor unlikely to create aggression.", question: "Which future job can change value’s timing?", action: "Move selected value forward", reason: "Waiting is costly when future bets will not arrive; value-first logic can justify fast play." },
    { module: "aggression", cue: "A robust hand can call while a more vulnerable hand can raise a small wide bet.", question: "What distinguishes their jobs?", action: "Protect the call branch and raise for denial where needed", reason: "The strongest hand may preserve a protected call while vulnerable value gains from denying live equity." },
  ],
  ancestry: [
    { module: "ancestry", cue: "100bb · BTN opens · BB 3-bets wide and can fold to 4-bets · Hero holds A5s.", question: "What makes a 4-bet bluff a candidate rather than a rule?", action: "Verify credible better-hand folds and the value region", reason: "Ace blockers and suited equity matter only when the branch supplies folds and value is defined first." },
    { module: "ancestry", cue: "EP opens and a very tight SB 3-bets; Hero holds A5s.", question: "What should stop the familiar blocker bluff?", action: "Fold when the 3-bet branch has no real fold target", reason: "A blocker alone cannot create fold equity against a range that continues almost entirely." },
    { module: "ancestry", cue: "150bb · BTN opens · BB 3-bets · Hero holds 98s in position.", question: "Which family can be damaged by an automatic 4-bet?", action: "Preserve the well-realising call branch", reason: "A speculative suited hand can realise in position and does not block premium continues well." },
    { module: "ancestry", cue: "OOP 3-bettor c-bets too wide and folds to small raises, but flop 3-bets are value-heavy.", question: "How should the opponent model be stored?", action: "Split the c-bet/fold and c-bet/three-bet branches", reason: "A weak fold branch and a strong re-raise branch can coexist; one label loses the ancestry." },
    { module: "ancestry", cue: "A river blocker looks attractive after tight entry, flop raise call and turn call.", question: "What must be counted before calling a jam?", action: "Trace credible value and bluff ancestry", reason: "A blocker cannot manufacture bluff families that did not survive the prior actions." },
  ],
  multiway: [
    { module: "multiway", cue: "Three-way: EP checks, BTN bets small on Q-8-4, Hero BB has Q9 while EP remains behind.", question: "What prevents an automatic protection raise?", action: "Respect the sandwich and avoid auto-raising", reason: "The uncapped player behind can hold strong Qx, sets and check-raises; a small size does not create heads-up freedom." },
    { module: "multiway", cue: "The same Q9 spot is now BTN closing action after EP checks and BB calls.", question: "How does the role change defence?", action: "Defend wider as the closing player", reason: "No unseen range can wake up behind; the prior call also supplies range information." },
    { module: "multiway", cue: "Three-way: HJ opens, SB and BB call; flop A-K-T rainbow.", question: "Who has the strongest premium and nut density by default?", action: "Start from the HJ ownership advantage", reason: "The tight opener retains more QJ offsuit, premium pairs and AK while callers are more capped or broad." },
    { module: "multiway", cue: "CO opens, BTN calls, BB defends; flop 7-6-3 rainbow.", question: "What must precede a CO range-bet assumption?", action: "Audit BB’s low-board ownership", reason: "BB carries more low-card, two-pair, set and straight coverage; initiative alone does not settle nuts." },
    { module: "multiway", cue: "A loose SB is observed flatting QJo and suited broadways in a three-way pot.", question: "How should that live fact change the range audit?", action: "Keep the observed overcall combinations in ownership", reason: "Theory is a prior, not permission to delete a repeatedly evidenced live branch; action order still matters." },
  ],
  river: [
    { module: "river", cue: "A river call is considered because Hero holds a visually attractive blocker.", question: "What comes before judging the blocker?", action: "Count credible value and bluff ancestry", reason: "A blocker changes a range comparison; it cannot create bluffs that never reached the node." },
    { module: "river", cue: "A proposed bluff needs a low suited connector, but that hand was absent from Villain’s preflop 3-bet range.", question: "How should it enter the river count?", action: "Exclude the impossible bluff family", reason: "Natural-looking river cards do not override the range construction that failed to reach them." },
    { module: "river", cue: "Villain uses an extreme river re-raise while medium value hands would usually size smaller.", question: "What should the unusual size trigger?", action: "Apply size-specific value exclusions", reason: "The size can narrow represented value; compare what remains with credible blocker bluffs rather than folding by relative strength." },
    { module: "river", cue: "Hero’s nut blocker also removes many missed draws that would bluff.", question: "What prevents calling merely because the blocker is strong?", action: "Check whether the blocker removes folds or bluffs", reason: "A nut blocker can be bad when it damages the opponent’s bluff supply more than value." },
    { module: "river", cue: "A line is heavily filtered toward value and no natural air can be named.", question: "What is the baseline advanced response?", action: "Fold until branch evidence supports enough bluffs", reason: "Correct bluff-catch decisions require actual surviving air, not generic balance stories." },
  ],
  evidence: [
    { module: "evidence", cue: "A player showed one successful river bluff after an unusual flop line.", question: "What does that observation establish about the flop branch?", action: "Keep the branch unconfirmed and record the exact line", reason: "One result does not identify the player’s frequency, construction or decisions on earlier streets." },
    { module: "evidence", cue: "A live opponent repeatedly calls a small flop bet too wide, then folds turns after missing.", question: "How should the exploit be represented?", action: "Store the action-specific leak and re-filter on turn", reason: "An opponent model must name the branch error and its later range consequences, not a global player label." },
    { module: "evidence", cue: "A population belief feels familiar but the current game has no reliable sample.", question: "What is the disciplined default?", action: "Use the structural baseline and mark evidence missing", reason: "A prior can guide attention but cannot justify a confident exploit without observations in the relevant branch." },
    { module: "evidence", cue: "An opponent over-folds to one size but defends normally versus another.", question: "What prevents over-generalising the read?", action: "Keep the size and node attached to the note", reason: "A tendency can be real in one branch while disappearing when size, position or action history changes." },
    { module: "evidence", cue: "You want to change your range after a memorable showdown.", question: "Which check comes before the adjustment?", action: "Ask whether the observation is repeated and decision-relevant", reason: "Showdowns are evidence only when they support a stable, actionable branch model." },
  ],
  transfer: [
    { module: "transfer", cue: "A familiar flop pattern appears with a live straddle and a player behind.", question: "What shows that the mechanism has transferred rather than been memorised?", action: "Rebuild the changed node before reusing the rule", reason: "Transfer means preserving the mechanism under changed depth, order or range geography." },
    { module: "transfer", cue: "A drill answer was correct immediately after feedback.", question: "What evidence is still missing?", action: "Schedule delayed changed-node retrieval", reason: "Immediate repetition can reflect short-term cueing rather than retained decision ability." },
    { module: "transfer", cue: "You saved a field note with cue, action and reason.", question: "What must happen before it raises field-transfer evidence?", action: "Review the reasoning against the relevant mechanism", reason: "A raw note records an event; it does not verify the line or the causal model." },
    { module: "transfer", cue: "A repair drill is passed after a structural miss.", question: "What is the correct interpretation?", action: "Treat it as working evidence, not global mastery", reason: "One changed-node success can improve a local estimate but does not prove retention or broad transfer." },
    { module: "transfer", cue: "Two mechanisms compete for the next study slot after a diagnostic.", question: "How should the route stay efficient?", action: "Repair only the highest-priority evidenced families", reason: "Conservative routing prevents broad re-study from displacing the largest observed decision leak." },
  ],
  mixed: [
    { module: "geometry", cue: "A preflop 3-bet has made the pot large before the flop.", question: "Which quantity organizes the next decision tree?", action: "Calculate post-action SPR", reason: "The remaining stack relative to the pot determines the practical future tree." },
    { module: "preflop", cue: "200bb · HJ opens · CO calls · Hero BTN holds 76s; blinds are passive.", question: "Which branch should be protected before inventing a bluff?", action: "Call rather than force a squeeze", reason: "Position and depth create realisation and implied-odds value in the viable flat." },
    { module: "blinds", cue: "The same dry flop is reached once against BB and once against a cold-calling SB.", question: "What must change before copying a c-bet default?", action: "Distinguish the SB and BB arriving ranges", reason: "The blind roles create different preflop range mass and response geography." },
    { module: "filtering", cue: "Villain calls the flop after a line that had exploited weak flop defence.", question: "What prevents the original exploit from being copied to turn?", action: "Rebuild the range after the flop call", reason: "The call filters out many weak hands and strengthens the turn arrival range." },
    { module: "shape", cue: "A dynamic board faces a small wide bet and Hero has vulnerable value with top-end support.", question: "What must a valid raise create?", action: "Name value and denial targets before raising", reason: "A raise needs a better outcome against the continuing range, not relief from a turn." },
  ],
};

const repairDrills = [
  { module: "geometry" as ModuleId, cue: "Repair pair · The stacks look unchanged, but a live straddle is now in play.", question: "What must be rebuilt before choosing a line?", action: "Recalculate effective depth from the live forced bet", reason: "The straddle changes the meaningful decision unit and the postflop SPR." },
  { module: "filtering" as ModuleId, cue: "Repair pair · The same player reaches the turn after voluntarily calling the flop.", question: "What prevents a generic turn decision?", action: "Filter the source range through the flop call", reason: "The voluntary action changes which value and bluff combinations still arrive." },
  { module: "geometry" as ModuleId, cue: "Verification · A hand is ahead now, but the board makes later cards awkward.", question: "Which check tests whether a raise is actually the right line?", action: "Test the future job of each line", reason: "Being ahead immediately does not prove that a line survives the future tree." },
];

const flashcards = [
  { id: "depth-effective", front: "What depth matters in a live pot?", back: "The effective depth of the relevant confrontation—not the deepest visible stack." },
  { id: "depth-straddle", front: "What changes when a straddle is live?", back: "Use the live forced bet as the practical denominator, then rebuild SPR." },
  { id: "depth-future", front: "What does SPR tell you beyond current equity?", back: "How much future tree remains and whether a line compresses commitment." },
  { id: "preflop-sequence", front: "What is the preflop table cue?", back: "Price, range, players behind, realisation, line." },
  { id: "preflop-flat", front: "When can calling outrank squeezing?", back: "When a viable positional, deep, well-realising call branch exists; a weak flat does not create a bluff." },
  { id: "preflop-target", front: "What makes a polar squeeze plausible?", back: "Real target folds, useful blockers/equity, and no stronger protected flat." },
  { id: "blind-bb", front: "What is special about BB defence?", back: "BB often closes action and receives price, which can preserve a realisation-driven call." },
  { id: "blind-sb", front: "Why is an SB flat not the same as a BB defend?", back: "SB remains out of position and can face players behind, so realisation and squeeze risk differ." },
  { id: "blind-source", front: "Why distinguish SB cold-call from BB defence?", back: "They typically arrive with different range mass; postflop defaults cannot be copied unchanged." },
  { id: "filter-action", front: "What is the first range question after a voluntary action?", back: "What did that action remove, preserve, or strengthen from the source range?" },
  { id: "filter-turn", front: "Why can’t a flop exploit be copied to turn?", back: "The flop response filters the arrival range; the turn decision starts from that new range." },
  { id: "field-baseline", front: "What earns an exploit departure?", back: "Evidence of a branch-specific error—not one memorable live hand or a population stereotype." },
] as const;

const intensiveRoute = [
  ["Phase 1", "LCM-01 · Node & depth", "Build a reliable picture of effective depth, SPR, and the size of the future tree."],
  ["Phase 2", "LCM-02–04 · Range ancestry", "Add preflop source and voluntary-action filtering once the first node is automatic."],
  ["Phase 3", "LCM-05–06 · Response & aggression", "Choose a line by its future job, then test sizing and aggression without skipping the range work."],
  ["Phase 4", "LCM-07–08 · Complex trees", "Apply the same method to 3-bet pots and multiway nodes; complexity is added only after the base routine holds."],
  ["Phase 5", "LCM-09–10 · River & opponent evidence", "Audit value, bluff supply, blockers, and only then opponent or environment overlays."],
  ["Phase 6", "LCM-11 · Transfer & repair", "Use delayed retrieval, a compact repair block, and reviewed field notes to decide what is genuinely stable."],
] as const;

// T1 wording is copied from the active source diagnostic. Answers remain free text so the
// client cannot pretend to evaluate strategic reasoning from a keyword match.
const diagnosticT1: DiagnosticItem[] = [
  { id: "LD-001", title: "Straddle denominator", targetSeconds: 30, prompt: "Game is $2/$5/$10 with a mandatory live straddle. Hero and the one relevant opponent each have $1,400. Which effective depth do you use first for strategy and why? Also give ordinary BB." },
  { id: "LD-002", title: "Pairwise multiway depth", targetSeconds: 25, prompt: "Game is $1/$3. Hero has $900, Villain A $270, Villain B $1,200. What is Hero’s effective depth versus each opponent? Can the whole pot be described with one number?" },
  { id: "LD-003", title: "Blind source identity", targetSeconds: 35, prompt: "CO opens 3bb. Once A-7-2 rainbow reaches BB defend, once it reaches an SB cold-call. Which caller is usually more condensed, and can the same c-bet plan be used automatically?" },
  { id: "LD-004", title: "Value-heavy 3-bet defence", targetSeconds: 40, prompt: "150bb. HJ opens 3bb, BTN makes it 12bb. A reliable sample is almost only premiums/strong broadways with few suited bluffs. Which family loses defensive value first: dominated offsuit big cards or the best suited connectors? Explain without an exact chart cell." },
  { id: "LD-005", title: "Over-wide 3-bet compensation", targetSeconds: 45, prompt: "CO calls a BTN 3-bet. BTN 3-bets noticeably wider than normal, then c-bets 25% on Q-7-4 rainbow with almost all of range. What compensation test is needed, and where does OOP defence move if BTN does not compensate excess preflop air with extra checks?" },
  { id: "LD-006", title: "Small-wide vulnerable pair", targetSeconds: 50, prompt: "BTN vs BB, 200bb. Flop T-5-5 rainbow. BTN bets 25% with almost all range. Compare T6s and KTs in BB: which top-pair family has more directional raise incentive and why? No frequency is required." },
  { id: "LD-007", title: "Large-selective changed node", targetSeconds: 35, prompt: "Same BTN vs BB, 200bb, T-5-5 rainbow, but BTN bets 80% with a selective/polar range. What happens to T6s’ thin/protection raise branch compared with the 25% near-range node?" },
  { id: "LD-008", title: "Deep OOP protected call", targetSeconds: 50, prompt: "BTN vs BB, 200bb. Flop 8-7-6 two-tone. BTN bets 75% pot. BB has TT. Should the hand automatically check-raise to avoid difficult turns, or is protecting check-call a meaningful part of its function? Why?" },
  { id: "LD-009", title: "Sandwich shared defence", targetSeconds: 45, prompt: "HJ open, BTN call, BB call. Flop K-9-7 two-tone. HJ bets; Hero is BTN with KQ and BB remains behind with an uncapped continuing range. Should Hero defend as heads-up and carry all MDF? Name the main gate before call/raise." },
  { id: "LD-010", title: "River blocker ancestry", targetSeconds: 55, prompt: "River: Hero holds the nut-flush blocker and faces a jam after bet-call flop and overbet-call turn. This branch has no reliable population evidence. Which checks come before the blocker, and what response is acceptable if bluff supply cannot be justified?" },
];

function migrate(raw: unknown): LearnerState {
  const base = emptyState();
  if (!raw || typeof raw !== "object") return base;
  const old = raw as Partial<LearnerState> & { cards?: Record<string, boolean> };
  return {
    ...base,
    ...old,
    version: "0.4.1",
    dimension: { ...base.dimension, ...(old.dimension ?? {}), transfer: 0 },
    cardStates: { ...(old.cards ?? {}), ...(old.cardStates ?? {}) },
    history: Array.isArray(old.history) ? old.history : [],
    fieldNotes: Array.isArray(old.fieldNotes) ? old.fieldNotes : [],
    recallDueAt: typeof old.recallDueAt === "string" ? old.recallDueAt : null,
    diagnostic: old.diagnostic && typeof old.diagnostic === "object" ? {
      status: old.diagnostic.status === "IN_PROGRESS" || old.diagnostic.status === "AWAITING_REVIEW" ? old.diagnostic.status : "NOT_STARTED",
      startedAt: typeof old.diagnostic.startedAt === "string" ? old.diagnostic.startedAt : null,
      responses: Array.isArray(old.diagnostic.responses) ? old.diagnostic.responses.filter((entry): entry is DiagnosticResponse => Boolean(entry && typeof entry === "object" && typeof entry.item_id === "string" && typeof entry.answer === "string" && typeof entry.reasoning === "string" && typeof entry.confidence === "number" && typeof entry.time_seconds === "number")) : [],
      submittedAt: typeof old.diagnostic.submittedAt === "string" ? old.diagnostic.submittedAt : null,
    } : base.diagnostic,
  };
}

function stableOrder(values: string[], seed: number) {
  return [...values].sort((a, b) => {
    const rank = (value: string) => [...value].reduce((sum, char) => (sum * 31 + char.charCodeAt(0) + seed) % 997, seed);
    return rank(a) - rank(b);
  });
}

export default function Home() {
  const [state, setState] = useState<LearnerState>(emptyState);
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<"home" | "practice" | "feedback" | "summary" | "repair" | "repairSummary" | "recall" | "recallSummary" | "cards" | "diagnostic" | "diagnosticComplete">("home");
  const [index, setIndex] = useState(0);
  const [action, setAction] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(70);
  const [scores, setScores] = useState<number[]>([]);
  const [classes, setClasses] = useState<ResponseClass[]>([]);
  const [startedAt, setStartedAt] = useState<number>(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [fieldCue, setFieldCue] = useState("");
  const [fieldAction, setFieldAction] = useState("");
  const [fieldReason, setFieldReason] = useState("");
  const [diagnosticAnswer, setDiagnosticAnswer] = useState("");
  const [diagnosticReasoning, setDiagnosticReasoning] = useState("");
  const [diagnosticSeconds, setDiagnosticSeconds] = useState("");
  const [feedback, setFeedback] = useState<{ actionOk: boolean; reasonOk: boolean; responseClass: ResponseClass; action: string; reason: string; final: boolean; origin: "practice" | "repair" | "recall" } | null>(null);

  useEffect(() => {
    async function restore() {
      let legacy = emptyState();
      try { legacy = migrate(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null")); } catch { /* use empty state */ }
      try {
        const response = await fetch("/api/state", { cache: "no-store" });
        if (response.ok) {
          const payload = await response.json() as { state: unknown };
          if (payload.state) { setState(migrate(payload.state)); setReady(true); return; }
          if (legacy.completed > 0 || legacy.history.length > 0) {
            await fetch("/api/state", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ state: legacy }) });
          }
        }
      } catch { /* the local migration remains a safe offline fallback */ }
      setState(legacy); setReady(true);
    }
    void restore();
  }, []);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    void fetch("/api/state", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ state }),
    }).catch(() => undefined);
  }, [state, ready]);

  const isRepair = mode === "repair";
  const isRecall = mode === "recall";
  const activeDrills = isRepair || isRecall ? repairDrills : drills[state.activeModule];
  const drill = activeDrills[index];
  const actionOptions = useMemo(() => stableOrder([drill.action, "Choose the strongest made hand", "Apply a universal population rule"], index + 17), [index, drill.action]);
  const reasonOptions = useMemo(() => stableOrder([drill.reason, "It always increases immediate equity", "It removes all difficult turns"], index + 73), [index, drill.reason]);
  const mastery = Math.round(Object.values(state.dimension).reduce((a, b) => a + b, 0) / 8);
  const recallDue = Boolean(state.recallDueAt && Date.parse(state.recallDueAt) <= appLoadedAt);
  const hasCompleted = (module: ModuleId) => state.history.some(entry => entry.module === module) || (!state.history.length && state.completed >= 5 && module === "geometry");
  const diagnosticIndex = state.diagnostic.responses.length;
  const diagnosticItem = diagnosticT1[diagnosticIndex];

  function begin(module: ModuleId) {
    if (module === "preflop" && !hasCompleted("geometry")) return;
    if (module === "blinds" && !hasCompleted("preflop")) return;
    if (module === "filtering" && !hasCompleted("blinds")) return;
    if (module === "shape" && !hasCompleted("filtering")) return;
    if (module === "aggression" && !hasCompleted("shape")) return;
    if (module === "ancestry" && !hasCompleted("aggression")) return;
    if (module === "multiway" && !hasCompleted("ancestry")) return;
    if (module === "river" && !hasCompleted("multiway")) return;
    if (module === "evidence" && !hasCompleted("river")) return;
    if (module === "transfer" && !hasCompleted("evidence")) return;
    if (module === "mixed" && !hasCompleted("river")) return;
    setState(s => ({ ...s, activeModule: module }));
    setMode("practice"); setIndex(0); setScores([]); setClasses([]); setAction(null); setReason(null); setStartedAt(Date.now());
  }
  function beginRepair() {
    setMode("repair"); setIndex(0); setScores([]); setClasses([]); setAction(null); setReason(null); setStartedAt(Date.now());
  }
  function beginRecall() {
    setMode("recall"); setIndex(0); setScores([]); setClasses([]); setAction(null); setReason(null); setStartedAt(Date.now());
  }
  function beginCards() { setMode("cards"); setCardIndex(0); setCardRevealed(false); }
  function beginDiagnostic() {
    if (state.diagnostic.status === "AWAITING_REVIEW") { setMode("diagnosticComplete"); return; }
    setState(s => s.diagnostic.status === "NOT_STARTED" ? { ...s, diagnostic: { ...s.diagnostic, status: "IN_PROGRESS", startedAt: new Date().toISOString() } } : s);
    setDiagnosticAnswer(""); setDiagnosticReasoning(""); setDiagnosticSeconds(""); setConfidence(70); setStartedAt(Date.now()); setMode("diagnostic");
  }
  function submitDiagnostic() {
    if (!diagnosticItem || !diagnosticAnswer.trim() || !diagnosticReasoning.trim()) return;
    const elapsed = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const timeSeconds = diagnosticSeconds.trim() ? Number(diagnosticSeconds) : elapsed;
    if (!Number.isFinite(timeSeconds) || timeSeconds < 0) return;
    const response: DiagnosticResponse = { item_id: diagnosticItem.id, answer: diagnosticAnswer.trim(), reasoning: diagnosticReasoning.trim(), confidence, time_seconds: timeSeconds };
    const final = diagnosticIndex === diagnosticT1.length - 1;
    setState(s => ({ ...s, diagnostic: { ...s.diagnostic, status: final ? "AWAITING_REVIEW" : "IN_PROGRESS", responses: [...s.diagnostic.responses, response], submittedAt: final ? new Date().toISOString() : null } }));
    setDiagnosticAnswer(""); setDiagnosticReasoning(""); setDiagnosticSeconds(""); setConfidence(70); setStartedAt(Date.now()); setMode(final ? "diagnosticComplete" : "diagnostic");
  }
  function downloadDiagnostic() {
    if (state.diagnostic.status !== "AWAITING_REVIEW") return;
    const payload = { schema_version: "0.1", learner_id: "current_learner", tranche_id: "T1", submitted_at: state.diagnostic.submittedAt, responses: state.diagnostic.responses };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "live-cash-t1-responses.json"; anchor.click(); URL.revokeObjectURL(url);
  }
  function gradeCard(remembered: boolean) {
    const card = flashcards[cardIndex];
    setState(s => ({ ...s, cardStates: { ...s.cardStates, [card.id]: remembered } }));
    if (cardIndex === flashcards.length - 1) { setMode("home"); return; }
    setCardIndex(value => value + 1); setCardRevealed(false);
  }
  function saveFieldNote() {
    if (!fieldCue.trim() || !fieldAction.trim() || !fieldReason.trim()) return;
    setState(s => ({ ...s, fieldNotes: [...s.fieldNotes, { cue: fieldCue.trim(), action: fieldAction.trim(), reason: fieldReason.trim(), at: new Date().toISOString() }] }));
    setFieldCue(""); setFieldAction(""); setFieldReason("");
  }
  function submit() {
    if (!action || !reason) return;
    const actionOk = action === drill.action;
    const reasonOk = reason === drill.reason;
    const score = Number(actionOk) + Number(reasonOk);
    const responseClass: ResponseClass = actionOk && reasonOk ? "A" : actionOk ? "B" : reasonOk ? "C" : "D";
    const elapsedSeconds = (Date.now() - startedAt) / 1000;
    const nextDimensions = { ...state.dimension };
    nextDimensions.action = Math.min(100, nextDimensions.action + (actionOk ? 12 : 0));
    nextDimensions.mechanism = Math.min(100, nextDimensions.mechanism + (reasonOk ? 12 : 0));
    nextDimensions.node = Math.min(100, nextDimensions.node + (actionOk ? 7 : 0));
    if (actionOk && reasonOk) nextDimensions.boundary = Math.min(100, nextDimensions.boundary + 7);
    if (isRecall && actionOk && reasonOk) nextDimensions.retention = Math.min(100, nextDimensions.retention + 12);
    if (actionOk && elapsedSeconds <= 18) nextDimensions.speed = Math.min(100, nextDimensions.speed + 5);
    if ((actionOk && confidence >= 65) || (!actionOk && confidence < 65)) nextDimensions.calibration = Math.min(100, nextDimensions.calibration + 6);
    const nextScores = [...scores, score];
    const nextClasses = [...classes, responseClass];
    setScores(nextScores); setClasses(nextClasses);
    const final = index === activeDrills.length - 1;
    const origin = mode as "practice" | "repair" | "recall";
    if (final) {
      setState(s => ({ ...s, completed: s.completed + 1, dimension: nextDimensions, recallDueAt: isRecall ? null : s.recallDueAt ?? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), history: [...s.history, { module: s.activeModule, score: nextScores.reduce((a,b)=>a+b,0), at: new Date().toISOString() }] }));
    } else setState(s => ({ ...s, completed: s.completed + 1, dimension: nextDimensions }));
    setFeedback({ actionOk, reasonOk, responseClass, action: drill.action, reason: drill.reason, final, origin });
    setMode("feedback");
  }
  function continueFromFeedback() {
    if (!feedback) return;
    if (feedback.final) { setMode(feedback.origin === "recall" ? "recallSummary" : feedback.origin === "repair" ? "repairSummary" : "summary"); return; }
    setIndex(value => value + 1); setAction(null); setReason(null); setStartedAt(Date.now()); setMode(feedback.origin); setFeedback(null);
  }
  function reset() { localStorage.removeItem(STORAGE_KEY); setState(emptyState()); setMode("home"); }

  return <main>
    <header className="topbar"><span className="eyebrow">LIVE CASH OS</span><span className="status">v0.4.1 · accepted slice</span></header>
    {mode === "home" && <>
      <section className="hero"><p className="eyebrow">ADAPTIVE TABLE TRAINING</p><h1>Think in trees.<br/><em>Play the next decision.</em></h1><p className="lede">A compact practice system for live cash: depth, range ancestry, action, reason, confidence, and honest evidence.</p><button className="primary" onClick={() => begin("geometry")}>Start a 5-decision block <span>→</span></button></section>
      <section className="metrics"><div><b>{state.completed}</b><span>decisions logged</span></div><div><b>{mastery}%</b><span>evidence-weighted readiness</span></div><div><b>{state.history.length}</b><span>completed blocks</span></div></section>
      <section className="diagnostic-status"><div><p className="eyebrow">T1 · PERSONAL DIAGNOSTIC</p><h2>{state.diagnostic.status === "AWAITING_REVIEW" ? "Cold answers saved. Review is next." : state.diagnostic.status === "IN_PROGRESS" ? `${state.diagnostic.responses.length} of 10 cold answers saved.` : "Measure before you personalise."}</h2><p>{state.diagnostic.status === "AWAITING_REVIEW" ? "The answer key stays hidden here. Export this exact response record for expert evaluation and conservative routing into no more than two repair families." : "Ten free-text decisions across depth, blind identity, range shape, multiway and river ancestry. There is no feedback until all ten are complete, and no automatic keyword score."}</p></div><button className="primary" onClick={beginDiagnostic}>{state.diagnostic.status === "AWAITING_REVIEW" ? "Open T1 handoff" : state.diagnostic.status === "IN_PROGRESS" ? "Continue T1" : "Start cold T1"} <span>→</span></button></section>
      <section className="recall-status"><p className="eyebrow">DELAYED RETRIEVAL</p>{recallDue ? <><h2>Your recall check is ready.</h2><p>Three changed-node decisions. This is the only route that raises retention evidence.</p><button className="primary" onClick={beginRecall}>Start delayed recall <span>→</span></button></> : <><h2>Retention is earned later.</h2><p>{state.recallDueAt ? `Your next recall check opens after ${new Date(state.recallDueAt).toLocaleDateString()}.` : "Complete a decision block to schedule a changed-node recall check for the next day."}</p></>}</section>
      <section className="cards-status"><div><p className="eyebrow">ACTIVE RECALL · 12 CARDS</p><h2>Retrieve the cue before seeing the answer.</h2><p>Cards support vocabulary and table cues. They track review state but do not raise retention or readiness on their own.</p></div><button className="primary" onClick={beginCards}>Review cards <span>→</span></button></section>
      <section className="field-note"><div><p className="eyebrow">FIELD NOTE · PENDING REVIEW</p><h2>Capture the cue before the action.</h2><p>A note is raw evidence, not field mastery. It becomes useful only when its reasoning is reviewed against the relevant mechanism.</p></div><div className="field-form"><label>What did you notice before acting?<textarea value={fieldCue} onChange={event => setFieldCue(event.target.value)} placeholder="Example: CO opened, BTN called, I was in SB with TT…"/></label><label>What did you do?<textarea value={fieldAction} onChange={event => setFieldAction(event.target.value)} placeholder="Example: I squeezed…"/></label><label>Why did you choose it?<textarea value={fieldReason} onChange={event => setFieldReason(event.target.value)} placeholder="Name the range, depth, action-filter or blind logic."/></label><button className="primary" disabled={!fieldCue.trim() || !fieldAction.trim() || !fieldReason.trim()} onClick={saveFieldNote}>Save for review <span>→</span></button><p className="note-count">{state.fieldNotes.length} note{state.fieldNotes.length === 1 ? "" : "s"} captured · 0 field-transfer claims</p></div></section>
      <section className="grid"><article><p className="label">01 / FOUNDATION</p><h2>Effective depth &amp; geometry</h2><p>Read the pot you actually created: effective stacks, straddles, post-action SPR, and future-tree length.</p><button className="textbutton" onClick={() => begin("geometry")}>Practice module →</button></article><article className={hasCompleted("geometry") ? "accent" : "locked"}><p className="label">02 / PREREQUISITE-GATED</p><h2>Preflop range architecture</h2><p>Compare the viable call, squeeze and fold branches before expanding into a familiar-looking bluff.</p><button className="textbutton" disabled={!hasCompleted("geometry")} onClick={() => begin("preflop")}>{hasCompleted("geometry") ? "Practice module →" : "Complete Geometry first"}</button></article><article className={hasCompleted("preflop") ? "accent" : "locked"}><p className="label">03 / PREREQUISITE-GATED</p><h2>Blind identity &amp; realisation</h2><p>Separate SB, BB, closing action and out-of-position realisation before importing a range default.</p><button className="textbutton" disabled={!hasCompleted("preflop")} onClick={() => begin("blinds")}>{hasCompleted("preflop") ? "Practice module →" : "Complete Preflop Architecture first"}</button></article><article className={hasCompleted("blinds") ? "accent" : "locked"}><p className="label">04 / PREREQUISITE-GATED</p><h2>Range source &amp; action filtering</h2><p>Update ownership after every voluntary action before interpreting board texture, size, or blockers.</p><button className="textbutton" disabled={!hasCompleted("blinds")} onClick={() => begin("filtering")}>{hasCompleted("blinds") ? "Practice module →" : "Complete Blind Identity first"}</button></article><article className={hasCompleted("filtering") ? "accent" : "locked"}><p className="label">05 / PREREQUISITE-GATED</p><h2>Bet &amp; response shape</h2><p>Read whether a size is wide, selective or polar before building the response range.</p><button className="textbutton" disabled={!hasCompleted("filtering")} onClick={() => begin("shape")}>{hasCompleted("filtering") ? "Practice module →" : "Complete Filtering first"}</button></article><article className={hasCompleted("shape") ? "accent" : "locked"}><p className="label">06 / PREREQUISITE-GATED</p><h2>Aggression &amp; future jobs</h2><p>Build value first, then give each bet, call, raise or check a concrete future job.</p><button className="textbutton" disabled={!hasCompleted("shape")} onClick={() => begin("aggression")}>{hasCompleted("shape") ? "Practice module →" : "Complete Bet & Response Shape first"}</button></article><article className={hasCompleted("aggression") ? "accent" : "locked"}><p className="label">07 / PREREQUISITE-GATED</p><h2>3-bet-pot ancestry</h2><p>Trace which hands entered preflop and which value and bluff families survived the line.</p><button className="textbutton" disabled={!hasCompleted("aggression")} onClick={() => begin("ancestry")}>{hasCompleted("aggression") ? "Practice module →" : "Complete Aggression & Future Jobs first"}</button></article><article className={hasCompleted("ancestry") ? "accent" : "locked"}><p className="label">MIXED / RETRIEVAL</p><h2>Context-switch review</h2><p>Switch between learned mechanisms to verify that the decision routine travels.</p><button className="textbutton" disabled={!hasCompleted("ancestry")} onClick={() => begin("mixed")}>{hasCompleted("ancestry") ? "Start mixed block →" : "Complete 3-bet-pot Ancestry first"}</button></article></section>
      <section className="single-module"><article className={hasCompleted("ancestry") ? "accent" : "locked"}><p className="label">08 / PREREQUISITE-GATED</p><h2>Multiway structure</h2><p>Use action order, shared defence and ownership before importing heads-up aggression.</p><button className="textbutton" disabled={!hasCompleted("ancestry")} onClick={() => begin("multiway")}>{hasCompleted("ancestry") ? "Practice module →" : "Complete 3-bet-pot Ancestry first"}</button></article><article className={hasCompleted("multiway") ? "accent" : "locked"}><p className="label">09 / PREREQUISITE-GATED</p><h2>River value &amp; bluff audit</h2><p>Count what arrived, what the size excludes and what your blocker truly removes.</p><button className="textbutton" disabled={!hasCompleted("multiway")} onClick={() => begin("river")}>{hasCompleted("multiway") ? "Practice module →" : "Complete Multiway Structure first"}</button></article></section>
      <section className="single-module"><article className={hasCompleted("river") ? "accent" : "locked"}><p className="label">10 / EVIDENCE GATE</p><h2>Opponent evidence</h2><p>Turn observations into branch-specific evidence; one showdown never becomes a global exploit.</p><button className="textbutton" disabled={!hasCompleted("river")} onClick={() => begin("evidence")}>{hasCompleted("river") ? "Practice module →" : "Complete River Audit first"}</button></article><article className={hasCompleted("evidence") ? "accent" : "locked"}><p className="label">11 / TRANSFER GATE</p><h2>Transfer &amp; repair</h2><p>Prove a decision routine under changed nodes, delayed retrieval and reviewed field notes.</p><button className="textbutton" disabled={!hasCompleted("evidence")} onClick={() => begin("transfer")}>{hasCompleted("evidence") ? "Practice module →" : "Complete Opponent Evidence first"}</button></article></section>
      <section className="route"><div><p className="eyebrow">ADAPTIVE HIGH-EV ROUTE</p><h2>Gradual by design.<br/><em>Fast when earned.</em></h2><p className="lede">Use compact 15–25 minute sessions as a default, not a deadline. One new mechanism at a time; each session mixes a clean example, a changed-node contrast, and two decisions. Progress unlocks from reliable evidence, not from the calendar: accelerate when stable, repair when needed.</p></div><ol>{intensiveRoute.map(([phase, title, description], routeIndex) => <li key={title} className={routeIndex === 0 ? "current" : ""}><span>{phase}</span><div><b>{title}</b><p>{description}</p></div>{routeIndex === 0 && <small>Now</small>}</li>)}</ol></section>
      <section className="integrity"><h2>What this score does <em>not</em> claim</h2><p>Retention only rises after delayed retrieval. Field transfer requires cue-before-action and reviewed reasoning. No single correct answer creates global mastery.</p><button className="quiet" onClick={reset}>Reset this device’s practice data</button></section>
    </>}
    {mode === "diagnostic" && diagnosticItem && <section className="practice diagnostic"><div className="progress"><span>T1 · COLD {diagnosticIndex + 1} / {diagnosticT1.length}</span><div><i style={{ width: `${((diagnosticIndex + 1) / diagnosticT1.length) * 100}%` }}/></div></div><p className="eyebrow">{diagnosticItem.id} · {diagnosticItem.title}</p><p className="cue">Answer from your current process. Do not look up charts or keys; feedback is withheld until the whole tranche is reviewed.</p><h2>{diagnosticItem.prompt}</h2><label className="diagnostic-input">Action / direction<textarea value={diagnosticAnswer} onChange={event => setDiagnosticAnswer(event.target.value)} placeholder="State the action or directional conclusion." /></label><label className="diagnostic-input">One-sentence reason<textarea value={diagnosticReasoning} onChange={event => setDiagnosticReasoning(event.target.value)} placeholder="Name the mechanism, range or boundary that makes it true." /></label><label className="confidence">Confidence <b>{confidence}%</b><input type="range" min="0" max="100" value={confidence} onChange={e => setConfidence(Number(e.target.value))}/></label><label className="diagnostic-input compact">Rough time in seconds <input inputMode="numeric" type="number" min="0" placeholder="Auto-record elapsed time" value={diagnosticSeconds} onChange={event => setDiagnosticSeconds(event.target.value)} /><small>Optional; blank records elapsed time when you lock the response. Target: {diagnosticItem.targetSeconds}s.</small></label><button className="primary" disabled={!diagnosticAnswer.trim() || !diagnosticReasoning.trim()} onClick={submitDiagnostic}>Lock cold response <span>→</span></button></section>}
    {mode === "diagnosticComplete" && <section className="summary"><p className="eyebrow">T1 COMPLETE · AWAITING EXPERT REVIEW</p><h1>10 / 10 cold responses saved.</h1><p className="lede">No answer key or score is shown here. Free-text action and reasoning require an evaluator to classify each response A–E/U, then route only the highest-priority mechanisms. Until that review, readiness and transfer remain unmeasured.</p><div className="score-row"><div><span>responses</span><b>{state.diagnostic.responses.length}</b></div><div><span>feedback shown</span><b>0</b></div><div><span>repair families selected</span><b>0</b></div><div><span>status</span><b>review</b></div></div><button className="primary" onClick={downloadDiagnostic}>Download T1 response record <span>↓</span></button><button className="textbutton" onClick={() => setMode("home")}>Return to dashboard →</button></section>}
    {(mode === "practice" || mode === "repair" || mode === "recall") && <section className="practice"><div className="progress"><span>{isRecall ? "RECALL" : isRepair ? "REPAIR" : "BLOCK"} {index + 1} / {activeDrills.length}</span><div><i style={{ width: `${((index + 1) / activeDrills.length) * 100}%` }}/></div></div><p className="eyebrow">{isRecall ? "DELAYED CHANGED-NODE RETRIEVAL" : isRepair ? "CONTRASTIVE REPAIR" : drill.module === "geometry" ? "LCM-01 · GEOMETRY" : drill.module === "preflop" ? "LCM-02 · PREFLOP ARCHITECTURE" : drill.module === "blinds" ? "LCM-03 · BLIND IDENTITY" : drill.module === "filtering" ? "LCM-04 · FILTERING" : drill.module === "shape" ? "LCM-05 · BET & RESPONSE SHAPE" : drill.module === "aggression" ? "LCM-06 · AGGRESSION & FUTURE JOBS" : drill.module === "ancestry" ? "LCM-07 · 3-BET-POT ANCESTRY" : drill.module === "multiway" ? "LCM-08 · MULTIWAY STRUCTURE" : "LCM-09 · RIVER AUDIT"}</p><p className="cue">{drill.cue}</p><h2>{drill.question}</h2><div className="answer-set"><p>Select the action</p>{actionOptions.map(x => <button key={x} className={action === x ? "selected" : ""} onClick={() => setAction(x)}>{x}</button>)}</div><div className="answer-set"><p>Select the reason</p>{reasonOptions.map(x => <button key={x} className={reason === x ? "selected" : ""} onClick={() => setReason(x)}>{x}</button>)}</div><label className="confidence">Confidence <b>{confidence}%</b><input type="range" min="0" max="100" value={confidence} onChange={e => setConfidence(Number(e.target.value))}/></label><button className="primary" disabled={!action || !reason} onClick={submit}>Lock decision <span>→</span></button></section>}
    {mode === "feedback" && feedback && <section className="practice feedback"><p className="eyebrow">DECISION REVIEW · CLASS {feedback.responseClass}</p><h2>{feedback.actionOk && feedback.reasonOk ? "Correct decision structure." : feedback.actionOk ? "Action right. Reason needs repair." : feedback.reasonOk ? "Reason right. Action needs repair." : "Structural miss: rebuild the decision routine."}</h2><div className="feedback-card"><p><b>Correct action</b>{feedback.action}</p><p><b>Why</b>{feedback.reason}</p></div><p className="lede">Class A = action and reason; B = action only; C = reason only; D = neither. This review explains the current item; retention and field transfer still require their separate evidence gates.</p><button className="primary" onClick={continueFromFeedback}>{feedback.final ? "See block result" : "Next decision"} <span>→</span></button></section>}
    {mode === "summary" && <section className="summary"><p className="eyebrow">BLOCK COMPLETE</p><h1>{scores.reduce((a,b)=>a+b,0)} / 10 evidence points</h1><p className="lede">A = action and reason; B = action only; C = reason only; D = structural miss. Retention and field transfer remain unchanged until their own evidence gates are met.</p><div className="score-row">{(["A","B","C","D"] as ResponseClass[]).map(kind => <div key={kind}><span>class {kind}</span><b>{classes.filter(value => value === kind).length}</b></div>)}{Object.entries(state.dimension).map(([key, value]) => <div key={key}><span>{key}</span><b>{value}%</b></div>)}</div>{classes.some(value => value === "D") && <button className="textbutton" onClick={beginRepair}>Start a 3-decision repair →</button>}<button className="primary" onClick={() => setMode("home")}>Return to dashboard <span>→</span></button></section>}
    {mode === "repairSummary" && <section className="summary"><p className="eyebrow">REPAIR COMPLETE</p><h1>{scores.reduce((a,b)=>a+b,0)} / 6 repair points</h1><p className="lede">This checks whether the decision routine changed under a nearby node. It improves action, mechanism, and boundary evidence only; it does not create retention or field-transfer proof.</p><div className="score-row">{(["A","B","C","D"] as ResponseClass[]).map(kind => <div key={kind}><span>class {kind}</span><b>{classes.filter(value => value === kind).length}</b></div>)}</div><button className="primary" onClick={() => setMode("home")}>Return to dashboard <span>→</span></button></section>}
    {mode === "recallSummary" && <section className="summary"><p className="eyebrow">DELAYED RECALL COMPLETE</p><h1>{scores.reduce((a,b)=>a+b,0)} / 6 recall points</h1><p className="lede">Correct action-and-reason pairs here increase retention because they were retrieved after time and under changed visible details. Field transfer remains separate.</p><div className="score-row">{(["A","B","C","D"] as ResponseClass[]).map(kind => <div key={kind}><span>class {kind}</span><b>{classes.filter(value => value === kind).length}</b></div>)}</div><button className="primary" onClick={() => setMode("home")}>Return to dashboard <span>→</span></button></section>}
    {mode === "cards" && <section className="practice cards"><div className="progress"><span>CARD {cardIndex + 1} / {flashcards.length}</span><div><i style={{ width: `${((cardIndex + 1) / flashcards.length) * 100}%` }}/></div></div><p className="eyebrow">ACTIVE RECALL</p><h2>{flashcards[cardIndex].front}</h2>{cardRevealed ? <><p className="card-answer">{flashcards[cardIndex].back}</p><div className="card-actions"><button onClick={() => gradeCard(false)}>Again</button><button className="primary" onClick={() => gradeCard(true)}>Remembered <span>→</span></button></div></> : <button className="primary" onClick={() => setCardRevealed(true)}>Reveal answer <span>→</span></button>}</section>}
  </main>;
}
