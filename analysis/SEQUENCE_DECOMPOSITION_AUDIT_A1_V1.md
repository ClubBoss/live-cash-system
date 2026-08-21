# A1 — Sequence Decomposition Audit V1

Status: `MATERIAL_REDESIGN_REQUIRED`

## Finding

The legacy course contains strategy-correct but memory-fragile learner sequences. They work as explanatory order inside a lesson, but are too costly to expect a learner to consciously replay under live-table pressure.

This is a learning-interface defect, not a poker-strategy defect.

## Confirmed examples

### LCM-01 Geometry

Legacy learner scaffolding includes:

- table cue: `Единица → эффективный стек → банк после действия.`
- decision tree: forced unit → pairwise effective stack → future pot/stack → future SPR → choose line.
- table card: forced unit / pairwise stack / pot+stack after action / future SPR.

### Classification

- `forced unit / straddle`: `ENVIRONMENTAL_HABIT` where possible; notice before the hand starts.
- `unusual/asymmetric stacks`: `ENVIRONMENTAL_HABIT`; scan before action pressure.
- `large preflop or postflop action changes geometry`: `TRIGGER_RULE` — large pot growth should automatically trigger a fresh SPR/commitment read.
- `pairwise stack in a specific multiway decision`: `TRIGGER_RULE` — asymmetry triggers pairwise effective-stack attention.
- the four-item ordered checklist itself: `SCAFFOLD_ONLY`, not a permanent table routine.

### Replacement memory targets

1. Trigger: `straddle / forced bet changes` → meaning: working blind unit changed → action: re-anchor effective depth.
2. Trigger: `stack asymmetry` → meaning: no single multiway effective stack → action: identify pairwise confrontation.
3. Trigger: `pot suddenly became large` → meaning: nominal deep stack may now be low-SPR → action: recompute future leverage.

The learner should not need to recite all three on every hand.

---

### LCM-02 Preflop

Legacy learner scaffolding includes:

- table cue: `Цена → диапазоны → игроки сзади → реализация → линия.`
- decision tree: opener/caller ranges and sizing → players behind/position → call quality → squeeze value/folds → fold.

### Classification

- `players behind`: `TRIGGER_RULE` when Hero is not closing action; not a mandatory verbal step in spots where action is closed.
- `price`: `TRIGGER_RULE` when size materially deviates or Hero has blind discount.
- `range origin`: `TRIGGER_RULE` when opener position/profile changes.
- `realisation`: causal interpretation attached to position/hand class, not a separate checklist word.
- branch comparison `call vs raise vs fold`: `TRUE_DECISION_STRUCTURE`, but it should be presented as competing EV branches rather than a memorised five-step phrase.

### Replacement memory targets

1. Trigger: `Hero does not close action` → players-behind / squeeze risk becomes salient.
2. Trigger: `open size increases` → marginal calls lose price first.
3. Trigger: `origin range becomes stronger` → domination and overpair density rise; fringe continues contract.
4. Trigger: `fold equity collapses` → bluff-heavy isolation/3-bet logic shifts toward hands that perform well when called.

---

## General decomposition rule

When a legacy checklist contains observations that are not relevant in every hand, split it.

Do not require:

`A → B → C → D → E` every time.

Prefer:

- collect stable environment facts before the hand;
- bind conditional variables to the event that makes them relevant;
- teach one-variable contrasts so the cue becomes automatic;
- keep a short emergency scaffold available for novices, then fade it.

## Preserve

The causal content of LCM-01 and LCM-02 remains useful and should be reused as source/internal authority. This audit does not reject their mechanisms; it rejects permanent dependence on reciting their sequence.

## Next implementation

Create a machine-readable Practical Rule library and retrieval APIs keyed by skill/trigger family. The First Journey should use these rules instead of presenting the old multi-step checklist as the primary memory target.
