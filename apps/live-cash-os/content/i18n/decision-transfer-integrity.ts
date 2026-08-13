import { moduleById } from "../modules";
import type { LocaleCode, ModuleId } from "../../lib/model";

type DrillPatch = Partial<{
  assumptions: string[];
  cue: string;
  question: string;
  actions: [string, string, string];
  reasons: [string, string, string];
  explanation: string;
}>;

type WorkedExamplePatch = {
  situation: string;
  steps: string[];
  answer: string;
};

function patchDrill(moduleId: ModuleId, drillId: string, patch: DrillPatch) {
  const drill = moduleById[moduleId].drills.find((item) => item.id === drillId);
  if (!drill) throw new Error(`Missing decision-transfer drill ${drillId}`);
  if (patch.assumptions) drill.assumptions = [...patch.assumptions];
  if (patch.cue) drill.cue = patch.cue;
  if (patch.question) drill.question = patch.question;
  if (patch.actions) drill.actionOptions.forEach((option, index) => { option.text = patch.actions![index]; });
  if (patch.reasons) drill.reasonOptions.forEach((option, index) => { option.text = patch.reasons![index]; });
  if (patch.explanation) drill.explanation = patch.explanation;
}

function patchWorkedExample(moduleId: ModuleId, patch: WorkedExamplePatch) {
  const example = moduleById[moduleId].workedExample;
  example.situation = patch.situation;
  example.steps = [...patch.steps];
  example.answer = patch.answer;
}

function softenEnglishDistractor(text: string) {
  return text
    .replace(/\bmerely because\b/giu, "because")
    .replace(/\bsolely because\b/giu, "because")
    .replace(/\bonly because\b/giu, "because")
    .replace(/\bmust always\b/giu, "is usually better to")
    .replace(/\balways\b/giu, "usually")
    .replace(/\bnever\b/giu, "rarely")
    .replace(/\bautomatically\b/giu, "by default");
}

function softenRussianDistractor(text: string) {
  return text
    .replace(/только потому,? что/giu, "потому что")
    .replace(/только из-за/giu, "из-за")
    .replace(/всегда обязана/giu, "обычно должна")
    .replace(/всегда обязан/giu, "обычно должен")
    .replace(/всегда/giu, "обычно")
    .replace(/никогда/giu, "редко")
    .replace(/автоматически/giu, "по умолчанию");
}

/**
 * Removes high-salience linguistic tells only from incorrect alternatives.
 * IDs, scoring, misconception mapping and the correct answer are untouched.
 * The goal is to make a misconception sound like a plausible poker thought,
 * not like a deliberately caricatured wrong answer.
 */
function softenAllDistractors(locale: LocaleCode) {
  const soften = locale === "ru" ? softenRussianDistractor : softenEnglishDistractor;
  for (const module of Object.values(moduleById)) {
    for (const drill of module.drills) {
      for (const option of drill.actionOptions) {
        if (option.id !== drill.correctActionId) option.text = soften(option.text);
      }
      for (const option of drill.reasonOptions) {
        if (option.id !== drill.correctReasonId) option.text = soften(option.text);
      }
    }
  }
}

function applyRussianConcreteTransfer() {
  patchWorkedExample("preflop", {
    situation: "200bb. HJ открывается, CO коллирует, Hero на BTN с 76s; блайнды пассивны. Для этой задачи 76s используется как конкретный представитель жизнеспособного базового колла, а не как новая точная клетка чарта.",
    steps: [
      "Hero в позиции, а риск сквиза за спиной ниже обычного.",
      "Глубина оставляет 76s больше пространства для реализации эквити и выигрыша крупных банков при сильном попадании.",
      "76s плохо блокирует премиальные продолжения, поэтому инициатива сама по себе не делает сквиз лучше колла.",
    ],
    answer: "Сохрани колл как полноценную ветку. Конкретная рука помогает распознать спот, но пример не утверждает универсальную chart-частоту для 76s.",
  });
  patchDrill("preflop", "pre-01", {
    reasons: [
      "TT выигрывает от изоляции и лишения эквити, а SB-колл оставляет риск сквиза и слабую реализацию",
      "TT достаточно сильна, чтобы предпочесть 3-бет даже без отдельной проверки диапазонов и игроков за спиной",
      "Игра вне позиции заметно снижает реализацию TT, поэтому пассивное продолжение слишком дорого",
    ],
  });
  patchDrill("preflop", "pre-02", {
    assumptions: [
      "200bb",
      "HJ открывается",
      "CO коллирует",
      "Hero BTN 76s",
      "в этой задаче 76s — конкретный представитель жизнеспособного базового колла; точная chart-частота не утверждается",
      "блайнды пассивны",
    ],
    cue: "200bb: HJ open, CO call, Hero BTN с 76s; игроки за спиной редко сквизят.",
    question: "Какую ветку лучше сохранить для 76s в заданной модели?",
    actions: ["Колл", "Сквиз как полярный блеф", "Фолд"],
    reasons: [
      "Позиция, глубина и низкий риск сквиза дают 76s хорошую реализацию без лишнего раздувания банка",
      "Мёртвые деньги и играбельность 76s делают инициативу сквиза ценнее сохранения колл-ветки",
      "Низкие карты 76s слишком часто попадут в сложные глубокие банки против доминирующих продолжений",
    ],
    explanation: "Здесь конкретная рука нужна для переноса навыка, но стратегическая посылка остаётся прежней: жизнеспособный колл нельзя превращать в сквиз только ради инициативы. Пример не задаёт точную универсальную частоту для 76s.",
  });
  patchDrill("preflop", "pre-03", {
    assumptions: [
      "100bb",
      "EP открывается 4bb",
      "HJ коллирует",
      "Hero CO KJo",
      "KJo используется как конкретный представитель доминируемого оффсьют-бродвея у нижней границы кандидатов, а не как универсальная chart-клетка",
    ],
    cue: "EP open 4bb, HJ call, Hero CO с KJo против двух сильных исходных диапазонов.",
    actions: ["Фолд", "Колл", "Сквиз"],
    reasons: [
      "Доминация и слабая реализация KJo против сильных продолжений перевешивают его high-card привлекательность",
      "KJo всё ещё делает сильные топ-пары и имеет достаточно broadway-покрытия, чтобы реализовать цену в позиции",
      "K-блокер и мёртвые деньги делают изоляцию сквизом ценнее пограничного пассивного продолжения",
    ],
    explanation: "Решение следует из структуры диапазонов и доминации. KJo здесь — конкретный учебный представитель класса, а не заявка на точную универсальную границу чарта.",
  });
  patchDrill("preflop", "pre-04", {
    assumptions: [
      "100bb",
      "широкое позднее открытие и широкий колл",
      "Hero SB A5s",
      "в условии A5s уже является смешанным полярным 3-бет-кандидатом базовой модели; это premise задачи, а не новая chart-клетка",
      "нет рида, что соперники чрезмерно продолжают против сквиза",
      "BB пассивный",
    ],
    cue: "Широкий late open+call; Hero SB с A5s, который в условии уже относится к смешанной полярной ветке.",
    actions: ["Сквизить A5s чаще", "Оставить базовый микс без подстройки", "Перевести A5s преимущественно в колл"],
    reasons: [
      "Подстройка усиливает уже обоснованного кандидата с блокером, эквити и реальными фолдами, не создавая новую область блефов",
      "Без прямого замера fold-to-squeeze безопаснее не менять частоту A5s и не усиливать эксплуатацию широких входов",
      "Мастевой туз сохраняет натсовый потенциал постфлоп, поэтому колл лучше использует играбельность руки",
    ],
    explanation: "Источник поддерживает более частое использование уже существующих смешанных кандидатов против слишком широких входов. A5s здесь делает идею конкретной, но не превращается в универсальную обязательную клетку.",
  });
  patchDrill("preflop", "pre-05", {
    reasons: [
      "При меньшем будущем SPR high-card и pair value реализуются прямее, а ценность спекулятивных implied odds снижается",
      "Более короткий стек уменьшает стоимость постфлоп-ошибок, поэтому защищённые коллы получают больше пространства",
      "Префлоп-ветку задают позиции и диапазоны, а эффективная глубина в основном меняет только постфлоп",
    ],
  });

  patchDrill("blinds", "bli-01", {
    assumptions: [
      "CO открывается 3bb",
      "A-7-2 rainbow — конкретный представитель сухого A-high флопа, а не точная solver-частота",
      "сравнивается ветка BB call и ветка SB call",
    ],
    cue: "Один и тот же A-7-2 rainbow после CO open: в одной ветке Villain защищал BB, в другой коллировал из SB.",
  });

  patchWorkedExample("shape", {
    situation: "BTN vs BB на T-5-5 rainbow. BTN использует маленькую широкую ставку. Сравни Hero BB с T6s и KTs как два конкретных представителя уязвимой и более устойчивой топ-пары.",
    steps: [
      "Широкая ставка содержит достаточно слабых продолжений, поэтому тонкое вэлью и лишение эквити могут иметь работу.",
      "T6s сильнее страдает от оверкарт и будущих ухудшений, поэтому у рейза может быть больше защитной ценности.",
      "KTs устойчивее и лучше сохраняет сильные руки в колл-ветке, оставляя сопернику будущие блефы.",
    ],
    answer: "Не ранжируй рейзы только по абсолютной силе. T6s и KTs могут выполнять разные роли против одной и той же широкой ставки.",
  });
  patchDrill("shape", "sha-03", {
    assumptions: ["BTN vs BB", "T-5-5 rainbow", "маленькая широкая ставка", "Hero BB KTs", "соперник способен продолжать блефовать"],
    cue: "На T-5-5 rainbow Hero BB держит KTs против маленькой широкой ставки BTN.",
    question: "Почему KTs может остаться в колле, несмотря на высокую абсолютную силу?",
  });
  patchDrill("shape", "sha-04", {
    assumptions: ["BTN vs BB", "T-5-5 rainbow", "маленькая широкая ставка", "Hero BB T6s", "в рейз-ветке есть достаточно верхнего вэлью"],
    cue: "На T-5-5 rainbow Hero BB держит T6s против маленькой широкой ставки BTN.",
    question: "Что должно оправдывать рейз T6s, кроме желания избежать сложных тёрнов?",
  });

  patchWorkedExample("ancestry", {
    situation: "EP открывается, а тайтовый SB 3-бетит почти без блефов. Hero держит A5s — конкретный представитель мастевого туза-блокера в этой задаче.",
    steps: [
      "Исходный 3-бет-диапазон SB уже сконцентрирован вокруг сильных рук.",
      "У A5s мало более сильных целей, которые одновременно присутствуют и достаточно часто фолдят на 4-бет.",
      "A-блокер уменьшает число комбинаций, но сам не создаёт нужную fold equity.",
    ],
    answer: "Сначала проверь реальные fold targets. Название A5s не превращает 4-бет-блеф в автоматическую линию.",
  });
  patchDrill("ancestry", "anc-01", {
    assumptions: ["BTN открывается широко", "BB 3-бетит широко и имеет реальную fold-ветку против 4-бета", "Hero A5s", "A5s в этой задаче — конкретный представитель уже допустимого мастевого туза-кандидата, а не новая chart-клетка"],
    cue: "BTN open, широкий BB 3-bet с реальными фолдами; Hero держит A5s.",
    question: "Что должно быть подтверждено до превращения A5s в 4-бет-блеф?",
  });
  patchDrill("ancestry", "anc-02", {
    assumptions: ["EP открывается", "SB 3-бетит очень тайтово и почти без блефов", "Hero A5s", "сравнивается та же конкретная рука с anc-01"],
    cue: "Теперь тот же A5s видит тайтовый value-heavy SB 3-bet против EP.",
    question: "Почему знакомый 4-бет-блеф с A5s теряет основание?",
  });
  patchDrill("ancestry", "anc-03", {
    assumptions: ["150bb", "BTN против BB 3-бета", "Hero 98s в позиции", "в условии 98s имеет жизнеспособную колл-ветку; точная chart-частота не утверждается"],
    cue: "150bb: Hero BTN с 98s в позиции против BB 3-бета и имеет реальный колл-кандидат.",
    question: "Что нужно сравнить до превращения 98s в 4-бет-блеф?",
  });

  patchWorkedExample("multiway", {
    situation: "HJ open, BTN call, BB call. Флоп K-9-7 two-tone. HJ ставит, Hero BTN держит KQ, BB ещё за спиной.",
    steps: [
      "KQ — конкретная готовая рука, но Hero не закрывает торговлю.",
      "BB всё ещё может продолжить сильными готовыми руками, дро и рейзами.",
      "Часть общей защиты может выполнить BB, поэтому KQ нельзя оценивать как heads-up bluff-catcher в вакууме.",
    ],
    answer: "Сначала учти диапазон BB за спиной и порядок действий; абсолютная сила KQ не отменяет sandwich pressure.",
  });
  patchDrill("multiway", "mul-01", {
    assumptions: ["HJ open, BTN call, BB call", "флоп K-9-7 two-tone", "HJ ставит", "Hero BTN KQ", "BB ещё не действовал"],
    cue: "Три игрока на K-9-7 two-tone: HJ bet, Hero BTN с KQ, BB остаётся за спиной.",
    question: "Какой структурный фактор проверить раньше автоматической защиты KQ?",
  });
  patchDrill("multiway", "mul-02", {
    assumptions: ["та же KQ на K-9-7 two-tone", "теперь Hero действует последним после ставки и колла"],
    cue: "Та же KQ на K-9-7 two-tone, но теперь Hero закрывает торговлю после bet+call.",
    question: "Что изменилось для той же конкретной руки?",
  });
}

function applyEnglishConcreteTransfer() {
  patchWorkedExample("preflop", {
    situation: "200bb. HJ opens, CO calls, Hero is on the BTN with 76s, and the blinds are passive. In this exercise 76s is a concrete representative of an already-viable baseline call, not a new exact chart cell.",
    steps: [
      "Hero has position and faces less squeeze risk than usual from the players behind.",
      "Depth gives 76s more room to realise equity and win larger pots when it connects strongly.",
      "76s blocks premium continues poorly, so initiative alone does not make squeezing superior to calling.",
    ],
    answer: "Keep calling as a real branch. The concrete hand improves recognition, but this example does not claim a universal chart frequency for 76s.",
  });
  patchDrill("preflop", "pre-01", {
    reasons: [
      "TT benefits from isolation and equity denial, while an SB call retains squeeze risk and weak realisation",
      "TT is strong enough to prefer 3-betting without separately checking the ranges and players behind",
      "Playing out of position reduces TT's realisation enough that passive continuing becomes too costly",
    ],
  });
  patchDrill("preflop", "pre-02", {
    assumptions: [
      "200bb",
      "HJ opens",
      "CO calls",
      "Hero BTN 76s",
      "for this exercise 76s is a concrete representative of an already-viable baseline call; no exact chart frequency is claimed",
      "passive blinds",
    ],
    cue: "200bb: HJ opens, CO calls, Hero BTN has 76s, and the players behind rarely squeeze.",
    question: "Which branch best preserves the value of 76s in the stated model?",
    actions: ["Call", "Squeeze as a polar bluff", "Fold"],
    reasons: [
      "Position, depth and low squeeze risk let 76s realise equity without forcing a larger pot",
      "Dead money and the playability of 76s make squeeze initiative more valuable than keeping the call branch",
      "The low-card structure of 76s creates too many difficult deep pots against dominating continues",
    ],
    explanation: "The concrete hand is here to improve transfer, while the strategic identity stays the same: do not destroy a viable call just to gain initiative. This is not a universal exact-frequency claim for 76s.",
  });
  patchDrill("preflop", "pre-03", {
    assumptions: [
      "100bb",
      "EP opens 4bb",
      "HJ calls",
      "Hero CO KJo",
      "KJo is used as a concrete representative of the dominated offsuit-broadway class near the candidate boundary, not as a universal chart cell",
    ],
    cue: "EP opens 4bb, HJ calls, and Hero CO holds KJo against two strong starting ranges.",
    actions: ["Fold", "Call", "Squeeze"],
    reasons: [
      "Domination and weak realisation against strong continues outweigh KJo's high-card appeal",
      "KJo still makes strong top pairs and has enough broadway coverage to realise the price in position",
      "The king blocker plus dead money make squeeze isolation more valuable than taking a marginal passive branch",
    ],
    explanation: "The decision comes from range structure and domination. KJo is a concrete training representative, not a claim about one universal chart boundary.",
  });
  patchDrill("preflop", "pre-04", {
    assumptions: [
      "100bb",
      "wide late-position open and wide call",
      "Hero SB A5s",
      "the exercise premise already places A5s in a mixed polar 3-bet region; this is not a new chart-cell claim",
      "no read that opponents over-continue against squeezes",
      "passive BB",
    ],
    cue: "Wide late open-plus-call; Hero SB has A5s, which the exercise premise already treats as a mixed polar candidate.",
    actions: ["Squeeze A5s more often", "Keep the baseline mix unchanged", "Move A5s mostly into calls"],
    reasons: [
      "The exploit increases an already justified blocker-and-equity candidate with real folds instead of inventing a new bluff region",
      "Without a direct fold-to-squeeze estimate, keeping the A5s frequency unchanged avoids over-adjusting to wide entries",
      "The suited ace retains nut potential postflop, so calling uses the hand's playability more effectively",
    ],
    explanation: "The source supports using existing mixed candidates more often against overly wide entry ranges. A5s makes the idea concrete without becoming a universal mandatory cell.",
  });
  patchDrill("preflop", "pre-05", {
    reasons: [
      "At lower future SPR, high-card and pair value realise more directly while speculative implied odds shrink",
      "A shorter stack reduces the cost of postflop mistakes, so protected calls gain more room",
      "Positions and ranges set the preflop branch, while effective depth mainly changes decisions after the flop",
    ],
  });

  patchDrill("blinds", "bli-01", {
    assumptions: [
      "CO opens 3bb",
      "A-7-2 rainbow is a concrete representative of a dry A-high flop, not an exact solver-frequency claim",
      "compare a BB-call branch with an SB-call branch",
    ],
    cue: "The same A-7-2 rainbow flop after a CO open: one branch came from a BB call and the other from an SB call.",
  });

  patchWorkedExample("shape", {
    situation: "BTN versus BB on T-5-5 rainbow. BTN uses a small wide bet. Compare Hero BB with T6s and KTs as concrete representatives of a vulnerable and a more robust top pair.",
    steps: [
      "The wide bet contains enough weak continues for thin value and equity denial to have a job.",
      "T6s suffers more from overcards and future deterioration, so raising can gain more immediate protection value.",
      "KTs is more robust and can keep a strong hand in calls while preserving Villain's future bluffs.",
    ],
    answer: "Do not rank raises only by absolute hand strength. T6s and KTs can serve different branches against the same wide bet.",
  });
  patchDrill("shape", "sha-03", {
    assumptions: ["BTN versus BB", "T-5-5 rainbow", "small wide bet", "Hero BB KTs", "Villain can continue bluffing later"],
    cue: "On T-5-5 rainbow Hero BB holds KTs against BTN's small wide bet.",
    question: "Why can KTs remain in the calling branch despite its high absolute strength?",
  });
  patchDrill("shape", "sha-04", {
    assumptions: ["BTN versus BB", "T-5-5 rainbow", "small wide bet", "Hero BB T6s", "the raising branch contains enough top-end value"],
    cue: "On T-5-5 rainbow Hero BB holds T6s against BTN's small wide bet.",
    question: "What must justify raising T6s besides wanting to avoid difficult turns?",
  });

  patchWorkedExample("ancestry", {
    situation: "EP opens and a very tight SB 3-bets with almost no bluffs. Hero holds A5s, used here as the concrete suited-ace blocker representative.",
    steps: [
      "SB's starting 3-bet range is already concentrated around strong hands.",
      "A5s has few better targets that both exist and fold often enough to the 4-bet.",
      "The ace blocker removes some combinations but does not create the missing fold equity.",
    ],
    answer: "Check the real fold targets first. The label A5s does not make a 4-bet bluff automatic.",
  });
  patchDrill("ancestry", "anc-01", {
    assumptions: ["BTN opens wide", "BB 3-bets wide and has a real folding branch versus a 4-bet", "Hero A5s", "A5s is a concrete representative of an already-eligible suited-ace candidate in this exercise, not a new chart cell"],
    cue: "BTN opens, BB 3-bets wide with real folds, and Hero holds A5s.",
    question: "What must be confirmed before turning A5s into a 4-bet bluff?",
  });
  patchDrill("ancestry", "anc-02", {
    assumptions: ["EP opens", "SB 3-bets very tight with almost no bluffs", "Hero A5s", "compare the same concrete hand with anc-01"],
    cue: "Now the same A5s faces a tight value-heavy SB 3-bet against EP.",
    question: "Why does the familiar A5s 4-bet bluff lose its basis?",
  });
  patchDrill("ancestry", "anc-03", {
    assumptions: ["150bb", "BTN versus BB 3-bet", "Hero 98s in position", "the exercise premise gives 98s a viable calling branch; no exact chart frequency is claimed"],
    cue: "150bb: Hero BTN holds 98s in position against a BB 3-bet and has a real call candidate.",
    question: "What should be compared before turning 98s into a 4-bet bluff?",
  });

  patchWorkedExample("multiway", {
    situation: "HJ opens, BTN calls, BB calls. Flop K-9-7 two-tone. HJ bets, Hero BTN holds KQ, and BB is still behind.",
    steps: [
      "KQ is a concrete made hand, but Hero does not close the action.",
      "BB can still continue with strong made hands, draws and raises.",
      "BB can carry part of the shared defence, so KQ should not be treated as a heads-up bluff-catcher in isolation.",
    ],
    answer: "Account for the BB range behind and the action order first; KQ's absolute strength does not erase sandwich pressure.",
  });
  patchDrill("multiway", "mul-01", {
    assumptions: ["HJ opens, BTN calls, BB calls", "flop K-9-7 two-tone", "HJ bets", "Hero BTN KQ", "BB has not acted"],
    cue: "Three-way on K-9-7 two-tone: HJ bets, Hero BTN holds KQ, and BB remains behind.",
    question: "Which structural factor should be checked before defending KQ automatically?",
  });
  patchDrill("multiway", "mul-02", {
    assumptions: ["the same KQ on K-9-7 two-tone", "Hero now acts last after a bet and call"],
    cue: "The same KQ on K-9-7 two-tone, but Hero now closes the action after bet-plus-call.",
    question: "What changed for the same concrete hand?",
  });
}

export function applyDecisionTransferIntegrity(locale: LocaleCode) {
  if (locale === "ru") applyRussianConcreteTransfer();
  else applyEnglishConcreteTransfer();
  softenAllDistractors(locale);
}
