# Live Cash System — Initial Personalised Diagnostic Battery v0.1

Status: `ACTIVE_QUESTION_BANK / T1_READY / ANSWERS_HIDDEN_FROM_LEARNER_FLOW`

## Purpose

Measure table-relevant reasoning before teaching. This supersedes `learning/INITIAL_DIAGNOSTIC_v0_1.md` for the current learner while preserving that file as historical scaffolding.

This is not an exact-range exam. Exact mixed frequencies are never required.

## Response protocol

For every item submit:

```text
ITEM — action/direction; one-sentence reason; confidence 0–100; rough time in seconds
```

Rules:

- answer cold;
- do not look up charts or answer keys;
- `UNKNOWN / BASELINE` is allowed when the node lacks reliable exploit evidence;
- a correct action for a structurally wrong reason is not mastery;
- feedback is withheld until the tranche is complete.

## Tranche T1 — active first measurement

### LD-001 — Straddle denominator

Игра $2/$5/$10 с обязательным live straddle. Hero и единственный релевантный соперник имеют по $1,400. Какую эффективную глубину ты используешь первой для стратегии и почему? Укажи также обычные BB.

### LD-002 — Pairwise multiway depth

Игра $1/$3. Hero $900, Villain A $270, Villain B $1,200. Какая эффективная глубина у Hero против каждого соперника? Можно ли описать весь банк одной цифрой?

### LD-003 — Blind source identity

CO открывает 3bb. Один раз флоп A-7-2 rainbow достигнут против BB defend, второй — против SB cold-call. Какой caller обычно более condensed и можно ли автоматически использовать одинаковый c-bet plan?

### LD-004 — Value-heavy 3-bet defence

150bb. HJ открывает 3bb, BTN делает 12bb. Надёжная выборка показывает почти только premiums/strong broadways и мало suited bluffs. Какая семья первой теряет ценность при защите: dominated offsuit big cards или лучшие suited connectors? Объясни без требования назвать точный chart cell.

### LD-005 — Over-wide 3-bet compensation

CO call против BTN 3-bet. BTN 3-бетит заметно шире нормы, но на Q-7-4 rainbow продолжает ставить 25% почти всей range. Какой compensation-test нужен и куда направленно сдвигается OOP defence, если BTN не компенсирует лишний preflop air дополнительными checks?

### LD-006 — Small-wide vulnerable pair

BTN vs BB, 200bb. Flop T-5-5 rainbow. BTN ставит 25% почти всей range. Сравни T6s и KTs у BB: какая top-pair family имеет больше directional raise incentive и почему? Не требуется частота.

### LD-007 — Large-selective changed node

Тот же BTN vs BB, 200bb и T-5-5 rainbow, но BTN ставит 80% selective/polar range. Что происходит с thin/protection raise branch T6s по сравнению с предыдущим 25% near-range node?

### LD-008 — Deep OOP protected call

BTN vs BB, 200bb. Flop 8-7-6 two-tone. BTN ставит 75% pot. У BB TT. Базовый directional вопрос: должна ли рука автоматически check-raise, чтобы «не играть трудные turns», или значимая часть функции — защищать check-call? Почему?

### LD-009 — Sandwich shared defence

HJ open, BTN call, BB call. Flop K-9-7 two-tone. HJ ставит, Hero на BTN с KQ, за ним остаётся BB с uncapped continuing range. Должен ли Hero защищаться как в heads-up и нести весь MDF? Назови главный gate перед call/raise.

### LD-010 — River blocker ancestry

River. Hero держит nut-flush blocker и получает jam после bet-call flop и overbet-call turn. По этой конкретной branch нет надёжной population evidence. Какие проверки идут до blocker и какой ответ допустим, если bluff supply не удаётся обосновать?

## Tranche T2 — adaptive second measurement

T2 is released after T1 scoring. It distinguishes true gaps from one-off misses and introduces adjacent transfer nodes.

### LD-011 — Small versus large defence

На одной и той же texture Villain использует 20% near-range bet или 90% polar bet. В какой branch обычно шире calls и возможны более linear raises? Почему денежно меньшая ставка может быть сложнее?

### LD-012 — Exploit call filter

Hero exploitatively c-bets wider против overfolder. Villain calls. Что происходит с turn range и можно ли автоматически продолжить excess bluffing?

### LD-013 — Value before bluffs

Перед выбором turn bluffs какой вопрос идёт первым?

### LD-014 — Jobless barrel

Turn hand имеет мало showdown value, почти нулевую equity, блокирует часть folds и не имеет useful river jobs. Куда её классифицировать?

### LD-015 — Scary card repairs caller

Turn закрывает draws, сконцентрированные в flop calling range Villain. Является ли «страшность» карты основанием для automatic overbet?

### LD-016 — Multiway bluff support

В multiway pot выбери stronger bluff family: naked zero-equity high card или pair-plus-draw с nut improvement и removal. Почему?

### LD-017 — Field-clear delayed aggression

Multiway flop checks through because players were sandwiched. Turn оставляет Hero heads-up/closing и улучшает его filtered ownership. Может ли aggression появиться позже, несмотря на passive flop?

### LD-018 — Passive-pool fast play

Hero имеет сильное, но уязвимое value multiway. Следующий игрок редко bet when checked to. Что происходит с slow-play incentive?

### LD-019 — Result-oriented read

Villain показал один successful river bluff. Что это доказывает о его flop overbet branch?

### LD-020 — Correct action wrong reason

Hero правильно folds river, но reasoning: «one pair никогда не call huge bet». Как классифицировать learning result?

## Coverage

- total items: `20`;
- T1: `10`;
- T2: `10`;
- modules touched: `10`;
- candidate mechanisms instrumented: `28/34`;
- all scenarios and wording are original;
- missing candidates remain available through the 34/34 direct drill library after the first diagnostic.

## Verdict

`INITIAL_PERSONALISED_DIAGNOSTIC_T1_READY`

`NO_PERFORMANCE_INFERENCE_BEFORE_RESPONSES`
