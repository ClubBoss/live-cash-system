# A7 — 3-Bet Pot + 4-Bet / Low-SPR Engine — 10/10 DoD V1

Status: `ACTIVE`

## Mission

Turn 3-bet and 4-bet pots into role-aware, board-aware decision families rather than one generic "aggressor has range advantage" rule.

## 10/10 definition

A7 closes only when:

1. `3BP-01` aggressor IP, `3BP-02` aggressor OOP, `3BP-03` caller IP, `3BP-04` caller OOP, and `3BP-05` board/sizing matrix are independently trainable.
2. Each supported 3BP family has at least 2 recognition, 3 direct decision, 2 transfer/changed, and 1 boundary stimuli.
3. The learner must distinguish role before importing a c-bet/defence default.
4. Dry/premium-preserving boards and coordinated/equalising boards are contrasted through arriving ranges, not board nicknames alone.
5. Small high-frequency betting is taught only where source-supported range advantage survives; it is never a universal 3BP rule.
6. Selective/check branches are explicit when board/range interaction neutralises the preflop advantage.
7. Caller IP and caller OOP are not collapsed into one defence tree.
8. Sizing changes can alter defence and pressure structure.
9. `4BP-01..04` are trained as low-SPR compression, hand-family selection, protected checks, and jam/reopen exposure rather than automatic stack-off.
10. Low SPR reduces branch depth but does not erase hand-family, board, position, or jam-exposure reasoning.
11. Exact solver frequencies are not invented or required unless visually reviewed and explicitly admitted.
12. Correct-option positions are not structurally fixed.
13. Action and reason must both be correct for evidence.
14. Changed-node transfer must alter one material variable rather than restating the same answer.
15. Remaining gaps after gauntlet must be executable-validation or source-review gaps, not missing role mechanics.

## Source ceiling

Primary authorities:
- `FTGU-E28` — high-frequency betting in 3-bet pots;
- `FTGU-E29` — selective strategies in 3-bet pots;
- Smash Live Cash 3-bet-pot lessons, including IP/OOP and low-equity-board material;
- `CP-G3-L09` — defending 3-bet pots OOP;
- `CP-G3-L10` — 4-bet pots / low-SPR play;
- `CINJ-E09` only for the specifically audited IP click-back exploit mechanism.

No exact chart/frequency claim is admitted by this wave unless already source-reviewed elsewhere.
