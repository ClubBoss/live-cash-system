# Wave 1 First-Use Comprehension Protocol

Date: 2026-08-07
Status: `HUMAN_EVIDENCE_PENDING`

## Rule

This protocol collects the human evidence required by the original Wave 1 Master Plan. Automated checks may verify implementation but cannot prove fresh-user comprehension. Never invent or infer participant results.

## Acceptance thresholds

Wave 1 human evidence passes only when:

1. At least 3 eligible fresh-context walkthroughs are complete.
2. At least 90% correctly explain the diagnostic purpose and that it is optional.
3. At least 90% correctly locate Learn, Review, and Real Hands.
4. The home-screen comprehension questions follow no more than 30 seconds of viewing.
5. The first lesson is reached in no more than 2 intentional actions from Today.

With only 3 participants, a 90% threshold requires 3/3 correct. Ten participants are preferred because 9/10 maps directly to 90%.

## Fresh-context eligibility

Count a participant only if they:

- have not worked on Live Cash OS;
- have not read project plans or acceptance reports;
- have not been briefed on T1 or learner-state/evidence terminology;
- use fresh browser storage;
- receive no UI explanation before the first answers.

## Moderator rules

- No leading, pointing, or label explanations before an answer is recorded.
- Record the participant's raw meaning, not a polished rewrite.
- Self-correction before feedback may count; correction after feedback does not.
- Record every intervention.

## Environment record

Record participant ID, locale, device/viewport, URL or build identity, source/deployed SHA if known, fresh-storage confirmation, and timestamp. Include at least one mobile walkthrough. Do not claim independent RU/EN first-use approval without evidence in both locales.

## Walkthrough

### A. First screen

Show Today for at most 30 seconds without clicking. Ask:

1. What is this product for?
2. What would you do next?
3. What does it not claim to do?

Record answers before any explanation.

### B. Navigation

Ask the participant to show where they would:

1. continue today's action;
2. learn a topic;
3. review due material;
4. use cards;
5. inspect skill/progress state;
6. record a real hand;
7. open the starting diagnostic.

Learn + Review + Real Hands must all be found without help to count as a core-navigation pass.

### C. First lesson

Return to Today. Ask the participant to start the first lesson. Count intentional clicks/taps only. Pass at 2 or fewer actions. Record the exact sequence.

### D. Diagnostic

Open the diagnostic start surface without starting the run. Ask:

1. What is it for?
2. Is it required before the first lesson?
3. How long should it take?
4. What result/output will you get?
5. What happens if you skip it?
6. How are results evaluated, as you understand it?
7. Is it presented as a formal exam or an automatic judgment?

For the 90% threshold, the participant must correctly state purpose, optionality, and that skipping does not block learning. Duration, output, evaluation, and non-exam/non-automatic-judgment understanding remain separate DoD observations.

### E. Empty states

On a fresh learner state, open Review and every other naturally empty learner surface. Ask what the screen means and what can be done next. Record whether both state and next action are understandable without project vocabulary.

### F. Terminology

Ask which visible terms are unclear. Independently record any learner-facing raw state/evidence vocabulary, including unexplained T1, evidence gate, probe, retention, field validated, measurement context, or raw enum names.

## Evidence per participant

Use `WAVE_1_FIRST_USE_EVIDENCE_TEMPLATE_2026-08-07.json` or an equivalent record containing:

- participant/environment eligibility;
- first-screen answers;
- all 7 navigation outcomes;
- first-lesson action sequence/count;
- all diagnostic answers;
- empty-state observations;
- terminology findings;
- moderator interventions;
- per-item pass/fail;
- optional recording/screenshot references.

## Aggregate calculation

For N eligible participants:

- diagnostic optionality rate = optionality passes / N;
- diagnostic purpose rate = purpose passes / N;
- navigation core rate = Learn+Review+Real Hands passes / N;
- first-lesson <=2 rate = <=2-action passes / N.

Do not round upward to meet 90%.

## Evidence state

Use one state:

- `HUMAN_EVIDENCE_PENDING`: fewer than 3 eligible complete walkthroughs;
- `HUMAN_EVIDENCE_FAIL`: minimum sample exists but a required threshold/DoD check fails;
- `HUMAN_EVIDENCE_PASS`: minimum sample exists and all required thresholds/records pass.

`HUMAN_EVIDENCE_PASS` is required for `WAVE_1_ACCEPTED`.