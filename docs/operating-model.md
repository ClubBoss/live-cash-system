# Operating Model

## Purpose

This repository is the durable SSOT for the user's live-cash learning system. Chat is the orchestration surface; GitHub stores the state that must survive long conversations, multiple source courses, and repeated strategy revisions.

## Separation of concerns

### 1. Source layer

Stores source-faithful transcripts and visual extraction. No strategic rewriting is allowed inside raw source files.

### 2. Analysis layer

Explains what the instructor claims, the mechanism, assumptions, relevance, conflicts, and likely transfer to deep live cash.

### 3. Playbook layer

Contains only the current executable strategy. A playbook rule must be concise enough to recall at the table and precise enough not to hide a major exception.

### 4. Training layer

Transforms playbook rules into recall, discrimination, and mixed decision drills. Recognition while reading is not treated as mastery.

### 5. Fieldwork layer

Captures game conditions, population tendencies, hand histories, execution failures, and post-session evidence.

## Source authority

No course is the final authority. Sources have specialised roles:

- Smash Live Cash: deep live cash, multiway pots, rake, broad preflop coverage, live exploitation.
- Carrot Grade 1: fundamentals and compact mental models.
- Carrot Grade 2: range construction, sizing, and IP/OOP systems.
- Carrot Grade 3: advanced aggression, bluff catching, protected checks, SPR, and 3-bet-pot defence.
- Cash Injection: population-exploit hypotheses.
- From the Ground Up: concise explanations and baseline reinforcement.
- External research and solvers: verification and gap filling.
- Live field evidence: local adaptation, not automatic universal truth.

## Change control

Every material change to an admitted playbook rule should record:

- previous rule;
- proposed rule;
- evidence or source delta;
- affected game conditions;
- expected EV or execution benefit;
- rollback condition.

## Compression standard

A compressed rule should include:

1. Trigger.
2. Default action or priority.
3. Reason.
4. Boundary condition.
5. Observable exploit adjustment, when relevant.

Example:

> Against a large live open with high rake, remove the weakest offsuit BB calls first because they realise equity poorly; retain more suited and connected hands only when effective stacks and opponent errors preserve implied odds.

## Memory budget

- Maximum three new core rules per learning block.
- Maximum one major strategic system change per day.
- Solver mixtures are converted to pure or low-branching approximations unless the mix has meaningful EV and is trainable.
- Rare nodes remain in the knowledge base but outside the active session card.

## Review cadence

- Per lesson: source QA and lesson analysis.
- Per concept cluster: synthesis and contradiction review.
- Every 3-4 study days: mixed recall assessment.
- Before each live session: session card review.
- After each session: execution and field evidence review.
- After Batumi: full system retro and playbook revalidation.
