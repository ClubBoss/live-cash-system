import type { PracticalDecision } from "./types";

const o=(id:string,textRu:string,textEn:string,misconception?:string)=>({id,textRu,textEn,misconception});
const RECOGNITION_SECOND_ACTION_IDS = new Set([
  "PM-W4-BOARD-01-101", "PM-W4-BOARD-01-102", "PM-W4-BOARD-01-103", "PM-W4-BOARD-01-104",
  "PM-W4-RUNOUT-01-101", "PM-W4-RUNOUT-01-102", "PM-W4-RUNOUT-01-103", "PM-W4-RUNOUT-01-104", "PM-W4-RUNOUT-01-105",
  "PM-W4-REL-01-101", "PM-W4-REL-01-102", "PM-W4-REL-01-103", "PM-W4-REL-01-104", "PM-W4-REL-01-105",
]);

const RECOGNITION_SECOND_REASON_IDS = new Set([
  "PM-W4-RUNOUT-01-101", "PM-W4-RUNOUT-01-102", "PM-W4-RUNOUT-01-103",
  "PM-W4-RUNOUT-01-104", "PM-W4-RUNOUT-01-105", "PM-W4-RUNOUT-01-106",
]);

type W4Distractors = {
  actionBRu: string;
  actionBEn: string;
  actionCRu: string;
  actionCEn: string;
  reason2Ru: string;
  reason2En: string;
  reason3Ru: string;
  reason3En: string;
};

const W4_SCENARIO_DISTRACTORS: Readonly<Record<string, Omit<W4Distractors, "actionBRu" | "actionBEn">>> = {
  "PM-W4-BOARD-01-101": {
    actionCRu: "Оценивать только абсолютную силу руки Hero, не сравнивая покрытие флопа обоими диапазонами",
    actionCEn: "Judge only Hero's absolute hand strength without comparing how both ranges cover the flop",
    reason2Ru: "Сухой высокий флоп сам по себе означает частую ставку для любого префлоп-агрессора",
    reason2En: "A dry high flop by itself means every preflop aggressor should bet frequently",
    reason3Ru: "Поскольку BTN был префлоп-агрессором, преимущество на флопе считается его независимо от состава диапазонов",
    reason3En: "Because BTN was the preflop aggressor, the flop advantage belongs to BTN regardless of range composition",
  },
  "PM-W4-BOARD-01-102": {
    actionCRu: "Использовать план с сухой высокой доски, не учитывая плотность двух пар и стритов у BB",
    actionCEn: "Reuse the dry-high-board plan without accounting for BB's two-pair and straight density",
    reason2Ru: "Ярлык «низкая связанная доска» сам задаёт стратегию и не требует проверки конкретных диапазонов",
    reason2En: "The 'low connected board' label sets the strategy by itself without checking the actual ranges",
    reason3Ru: "Префлоп-инициатива рейзера важнее того, сколько сильных комбинаций получает BB на этой доске",
    reason3En: "The raiser's preflop initiative matters more than how many strong combinations BB gains on this board",
  },
  "PM-W4-BOARD-01-103": {
    actionCRu: "Играть оба низких флопа одинаково и не учитывать различие в связности",
    actionCEn: "Play both low flops the same way and ignore the difference in connectivity",
    reason2Ru: "Высота рангов уже определяет класс стратегии, поэтому связность не меняет план",
    reason2En: "Rank height already determines the strategy class, so connectivity does not change the plan",
    reason3Ru: "У префлоп-агрессора одна и та же инициатива на обоих флопах, поэтому различие в связности вторично",
    reason3En: "The preflop aggressor has the same initiative on both flops, so the connectivity difference is secondary",
  },
  "PM-W4-BOARD-01-104": {
    actionCRu: "Сохранить план BTN против BB после перехода к более узким диапазонам HJ против BTN",
    actionCEn: "Keep the BTN-versus-BB plan after the ranges change to tighter HJ-versus-BTN ranges",
    reason2Ru: "Одинаковая текстура флопа означает одинаковое преимущество диапазона независимо от префлоп-ветки",
    reason2En: "The same flop texture means the same range advantage regardless of the preflop branch",
    reason3Ru: "Статус HJ как префлоп-агрессора сам сохраняет преимущество независимо от того, какие комбинации дошли до флопа",
    reason3En: "HJ's status as the preflop aggressor preserves the advantage regardless of which combinations reached the flop",
  },
  "PM-W4-BOARD-01-105": {
    actionCRu: "Выбрать размер только по силе конкретной руки Hero, не учитывая, какая часть диапазона может ставить вместе с ней",
    actionCEn: "Choose the size only from Hero's exact hand strength without considering how much of the range can bet with it",
    reason2Ru: "Доска с преимуществом диапазона требует одного крупного сайзинга, потому что сам класс доски задаёт размер",
    reason2En: "A range-advantage board requires one large size because the board class itself determines sizing",
    reason3Ru: "Префлоп-инициатива требует максимального давления крупной ставкой даже когда много средних и слабых рук хотят ставить",
    reason3En: "Preflop initiative calls for maximum pressure with a large bet even when many medium and weak hands want to bet",
  },
  "PM-W4-BOARD-01-106": {
    actionCRu: "Сохранить широкий план малых ставок с сухого высокого флопа, потому что префлоп-диапазоны не изменились",
    actionCEn: "Keep the broad small-bet plan from the dry high flop because the preflop ranges did not change",
    reason2Ru: "Как только доска становится связанной, сам ярлык требует почти полного отказа от ставок",
    reason2En: "Once the board becomes connected, the label itself calls for checking almost the entire range",
    reason3Ru: "Префлоп-инициатива позволяет сохранять широкую частоту ставок, даже когда защитник получает больше двух пар и стритов",
    reason3En: "Preflop initiative allows the aggressor to keep betting broadly even when the defender gains more two-pair and straight combinations",
  },
  "PM-W4-BOARD-01-107": {
    actionCRu: "Сохранить прежнюю оценку доски как выгодной защитнику, не учитывая исчезнувшие из его диапазона связанные комбинации",
    actionCEn: "Keep the old defender-friendly board read without accounting for the connected combinations removed from the defender's range",
    reason2Ru: "Связанная доска всегда принадлежит защитнику, даже если его фактическая префлоп-ветка не содержит ключевых комбинаций",
    reason2En: "A connected board always belongs to the defender even when the actual preflop branch lacks the key combinations",
    reason3Ru: "Префлоп-агрессор и так владеет доской из-за инициативы, поэтому потеря комбинаций у защитника ничего не объясняет",
    reason3En: "The preflop aggressor owns the board through initiative anyway, so the defender losing combinations explains nothing",
  },
  "PM-W4-BOARD-01-108": {
    actionCRu: "Разыгрывать узел как стандартную «доску BB», не проверяя, сохранились ли у BB комбинации, которые обычно делают её выгодной",
    actionCEn: "Play the node as a standard 'BB board' without checking whether BB retained the combinations that normally make it favorable",
    reason2Ru: "Низкая связанная текстура сама доказывает преимущество BB независимо от дошедшего префлоп-диапазона",
    reason2En: "A low connected texture by itself proves BB advantage regardless of the preflop range that arrived",
    reason3Ru: "Поскольку BTN сохраняет префлоп-инициативу, достаточно сравнить роли агрессора и коллера без анализа покрытия доски",
    reason3En: "Because BTN retains preflop initiative, comparing aggressor and caller roles is enough without analyzing board coverage",
  },
  "PM-W4-RUNOUT-01-101": {
    actionCRu: "Определить состояние диапазона только по бланковому тёрну и не учитывать, какие сильные руки коллер уже рейзил на флопе",
    actionCEn: "Infer the range state from the blank turn alone and ignore which strong hands the caller already raised on the flop",
    reason2Ru: "Ярлык «бланк» всегда сохраняет прежнее распределение силы у любого коллера",
    reason2En: "The 'blank' label always preserves the previous strength distribution for any caller",
    reason3Ru: "Флоп-агрессор сохраняет натсовое преимущество за счёт инициативы независимо от того, какие сильные руки коллер вывел в рейз",
    reason3En: "The flop aggressor keeps the nut advantage through initiative regardless of which strong hands the caller moved into raises",
  },
  "PM-W4-RUNOUT-01-102": {
    actionCRu: "Перенести старую оценку капнутого диапазона на тёрн, не добавляя закрывшиеся стриты, флеши и новые две пары",
    actionCEn: "Carry the old capped-range estimate onto the turn without adding completed straights, flushes, and new two-pair combinations",
    reason2Ru: "Карта, закрывающая дро, автоматически делает любой диапазон некапнутым независимо от предыдущей линии",
    reason2En: "A draw-completing card automatically makes any range uncapped regardless of the prior line",
    reason3Ru: "Инициатива предыдущего агрессора не позволяет новой карте сместить натсовое преимущество к коллеру",
    reason3En: "The prior aggressor's initiative prevents the new card from shifting nut advantage toward the caller",
  },
  "PM-W4-RUNOUT-01-103": {
    actionCRu: "Ставить проб-бет только потому, что тёрн нейтральный, не восстанавливая состав диапазона после чек-бэка",
    actionCEn: "Probe only because the turn is neutral without reconstructing the range left by the flop check-back",
    reason2Ru: "Нейтральный тёрн после пропущенного c-bet сам по себе разрешает проб-бет",
    reason2En: "A neutral turn after a missed c-bet is enough by itself to justify a probe",
    reason3Ru: "После чек-бэка IP уступил инициативу, поэтому OOP может атаковать независимо от того, какие сильные руки были удалены из диапазона",
    reason3En: "Once IP checked back and surrendered initiative, OOP can attack regardless of which strong hands were removed from the range",
  },
  "PM-W4-RUNOUT-01-104": {
    actionCRu: "Сохранить старую оценку чек-бэк диапазона как капнутого и не добавить комбинации, которые усилил тёрн",
    actionCEn: "Keep the old check-back range classified as capped and ignore the combinations strengthened by the turn",
    reason2Ru: "Пропущенный c-bet навсегда фиксирует диапазон IP как капнутый на всех следующих картах",
    reason2En: "A missed c-bet permanently fixes IP's range as capped on every later card",
    reason3Ru: "Раз IP уступил инициативу на флопе, OOP сохраняет преимущество и после тёрна, даже если карта возвращает IP сильные комбинации",
    reason3En: "Once IP gives up initiative on the flop, OOP keeps the advantage on the turn even when the card restores strong IP combinations",
  },
  "PM-W4-RUNOUT-01-105": {
    actionCRu: "Выбрать один размер по величине банка, не разделяя натсовое вэлью, блефы и тонкие защитные ставки по функциям",
    actionCEn: "Choose one size from the pot size alone without separating nutted value, bluffs, and thin protection bets by function",
    reason2Ru: "Капнутый коллер на бланке означает, что весь диапазон ставки должен использовать один маленький сайзинг",
    reason2En: "A capped caller on a blank means the entire betting range should use one small size",
    reason3Ru: "Инициатива агрессора позволяет всем ставящим рукам использовать один размер независимо от их функции",
    reason3En: "The aggressor's initiative lets every betting hand use one size regardless of its function",
  },
  "PM-W4-RUNOUT-01-106": {
    actionCRu: "Сохранить оценку капа с бланкового тёрна после того, как новая карта добавила сильные комбинации",
    actionCEn: "Keep the cap estimate from the blank turn after the new card adds strong combinations",
    reason2Ru: "Если диапазон был капнут после флопа, никакой класс ран-аута уже не может вернуть ему верх диапазона",
    reason2En: "Once a range is capped after the flop, no runout class can restore its top end",
    reason3Ru: "Предыдущая инициатива агрессора сохраняет натсовое преимущество на любом тёрне",
    reason3En: "The prior aggressor's initiative preserves the nut advantage on every turn",
  },
  "PM-W4-RUNOUT-01-107": {
    actionCRu: "Оставить частоту проб-бета как на бланке, хотя тёрн снова добавил IP сильные руки",
    actionCEn: "Keep the probe frequency from a blank turn even though this turn restores strong hands to IP",
    reason2Ru: "Сам ярлык «проб-бет после чек-бэка» означает, что частоту атаки нужно повышать на любом тёрне",
    reason2En: "The 'probe after check-back' label means attack frequency should rise on every turn",
    reason3Ru: "Чек-бэк передал инициативу OOP, поэтому восстановившиеся сильные руки IP не должны менять агрессию",
    reason3En: "The check-back handed initiative to OOP, so restored strong IP hands should not change the aggression",
  },
  "PM-W4-RUNOUT-01-108": {
    actionCRu: "Объявить коллера капнутым по его роли, не проверяя, остались ли сильные руки внутри стратегии без рейзов",
    actionCEn: "Declare the caller capped from the caller role without checking whether strong hands remain inside the no-raise strategy",
    reason2Ru: "Коллер на бланковом тёрне по определению капнут, даже если сильные руки сохранялись в колле",
    reason2En: "A caller on a blank turn is capped by definition even when strong hands stayed in the calling branch",
    reason3Ru: "Инициативы исходного агрессора достаточно, чтобы считать коллера капнутым даже при стратегии без рейзов",
    reason3En: "The original aggressor's initiative is enough to treat the caller as capped even in a no-raise strategy",
  },
  "PM-W4-HAND-01-101": {
    actionCRu: "Назвать топ-пару и кикер, но не учитывать уязвимость, редро, блокеры и диапазон соперника",
    actionCEn: "Name top pair and kicker but ignore vulnerability, redraws, blockers, and the opponent's range",
    reason2Ru: "Ярлык «топ-пара с сильным кикером» уже полностью определяет стратегическую функцию руки",
    reason2En: "The 'top pair with strong kicker' label already determines the hand's strategic function",
    reason3Ru: "Префлоп-инициатива делает топ-пару вэлью-агрессией без проверки диапазона продолжения",
    reason3En: "Preflop initiative makes top pair a value-aggression hand without checking the continuing range",
  },
  "PM-W4-HAND-01-102": {
    actionCRu: "Играть пару с сильным дро как обычную готовую пару, потому что основной ярлык руки не изменился",
    actionCEn: "Play the pair plus strong draw like an ordinary made pair because the main hand label did not change",
    reason2Ru: "Категории «одна пара» достаточно для оценки EV, даже когда к ней добавляется сильное дро",
    reason2En: "The 'one pair' category is enough to determine EV even when a strong draw is added",
    reason3Ru: "Если Hero сохраняет инициативу, эквити дро не должно менять выбранную ветку",
    reason3En: "If Hero retains initiative, draw equity should not change the chosen branch",
  },
  "PM-W4-HAND-01-103": {
    actionCRu: "Считать разницу мастей отдельной новой ситуацией, не проверяя, что семейство и важные блокеры фактически совпадают",
    actionCEn: "Treat the suit difference as a completely new spot without checking that the family and relevant blockers are unchanged",
    reason2Ru: "Точная масть комбо сама задаёт отдельную стратегию, даже когда важные свойства руки совпадают",
    reason2En: "The exact suits of a combo define a separate strategy even when the decision-relevant traits are unchanged",
    reason3Ru: "Одинаковая роль префлоп-агрессора сама гарантирует перенос решения между любыми двумя комбо семейства",
    reason3En: "The same preflop-aggressor role by itself guarantees transfer between any two combos in the family",
  },
  "PM-W4-HAND-01-104": {
    actionCRu: "Сохранить прежнее действие только из-за одинакового названия пары, игнорируя редро и блокеры",
    actionCEn: "Keep the same action from the shared pair label while ignoring redraw and blocker differences",
    reason2Ru: "Одинаковое название пары означает одинаковую стратегическую роль независимо от редро и блокеров",
    reason2En: "The same pair label means the same strategic role regardless of redraw and blocker differences",
    reason3Ru: "Статус Hero как агрессора делает различия в редро и блокерах несущественными для решения",
    reason3En: "Hero's aggressor status makes redraw and blocker differences irrelevant to the decision",
  },
  "PM-W4-HAND-01-105": {
    actionCRu: "Перейти от конкретного комбо сразу к действию по префлоп-роли, пропустив семейство, свойства руки и контекст доски",
    actionCEn: "Jump from the exact combo straight to an action from the preflop role, skipping family, hand traits, and board context",
    reason2Ru: "Точное название комбо напрямую соответствует фиксированному действию без промежуточной классификации",
    reason2En: "The exact combo label maps directly to a fixed action without an intermediate classification",
    reason3Ru: "Префлоп-инициатива может заменить переход через семейство руки и контекст",
    reason3En: "Preflop initiative can replace the family-and-context bridge",
  },
  "PM-W4-HAND-01-106": {
    actionCRu: "Сохранить прежние свойства семейства после изменения доски, потому что ранги руки остались похожими",
    actionCEn: "Keep the old family traits after the board changes because the hand's rank pattern still looks similar",
    reason2Ru: "То же название готовой руки означает ту же стратегическую функцию на любой доске",
    reason2En: "The same made-hand label means the same strategic function on every board",
    reason3Ru: "Инициатива Hero делает новые уязвимость и редро несущественными для выбора ветки",
    reason3En: "Hero's initiative makes the new vulnerability and redraw structure irrelevant to the branch choice",
  },
  "PM-W4-HAND-01-107": {
    actionCRu: "Сохранить старое решение, потому что семейство руки не изменилось, и не учитывать усиление диапазона соперника",
    actionCEn: "Keep the old decision because the hand family is unchanged and ignore the stronger opponent range",
    reason2Ru: "Ярлык семейства фиксирует относительную силу руки независимо от диапазона соперника",
    reason2En: "The family label fixes the hand's relative strength regardless of the opponent's range",
    reason3Ru: "Инициатива Hero сохраняет прежний порог вэлью даже после усиления диапазона соперника",
    reason3En: "Hero's initiative preserves the old value threshold even after the opponent's range becomes stronger",
  },
  "PM-W4-REL-01-101": {
    actionCRu: "Сохранить роль топ-пары после смены доски, потому что название руки не изменилось, и не учитывать распределение натсов",
    actionCEn: "Keep top pair's role after the board changes because the hand label is unchanged and ignore the nut distribution",
    reason2Ru: "Категория «топ-пара» имеет одну стратегическую роль на любой доске",
    reason2En: "The 'top pair' category has one strategic role on every board",
    reason3Ru: "Префлоп-инициатива сама определяет роль топ-пары и на доске с преимуществом, и на выравнивающей доске",
    reason3En: "Preflop initiative alone determines top pair's role on both the advantage board and the equalizing board",
  },
  "PM-W4-REL-01-102": {
    actionCRu: "Рейзить из-за абсолютной силы руки, не учитывая низкую срочность и ценность сохранения будущих блефов",
    actionCEn: "Raise from absolute hand strength without accounting for low urgency or the value of preserving future bluffs",
    reason2Ru: "Ярлык сильной готовой руки сам требует немедленного рейза даже в узле с низкой срочностью",
    reason2En: "The strong-made-hand label itself requires an immediate raise even in a low-urgency node",
    reason3Ru: "Инициатива Hero делает немедленный рейз лучше колла независимо от будущего давления соперника",
    reason3En: "Hero's initiative makes an immediate raise better than calling regardless of the opponent's future pressure",
  },
  "PM-W4-REL-01-103": {
    actionCRu: "Сохранить пассивную линию с сухой доски, не учитывая выросшую уязвимость сильной руки",
    actionCEn: "Keep the passive line from a dry board without accounting for the strong hand's increased vulnerability",
    reason2Ru: "Ярлык сильной готовой руки означает, что слоуплей одинаково безопасен на любой текстуре",
    reason2En: "The strong-made-hand label means slow-playing is equally safe on every texture",
    reason3Ru: "Инициатива гарантирует достаточно будущего вэлью, поэтому текущая уязвимость не должна менять действие",
    reason3En: "Initiative guarantees enough future value, so current vulnerability should not change the action",
  },
  "PM-W4-REL-01-104": {
    actionCRu: "Сохранить агрессивный план с доски, где у рейзера было преимущество, не учитывая выравнивание диапазонов",
    actionCEn: "Keep the aggressive plan from the range-advantage board without accounting for the ranges becoming more equal",
    reason2Ru: "Ярлык руки средней шоудаун-силы означает один и тот же план ставки на любой доске",
    reason2En: "The medium-showdown hand label implies the same betting plan on every board",
    reason3Ru: "Префлоп-инициативы достаточно, чтобы продолжать ставить даже после того, как доска выровняла диапазоны",
    reason3En: "Preflop initiative is enough to keep betting even after the board equalizes the ranges",
  },
  "PM-W4-REL-01-105": {
    actionCRu: "Рейзить по силе руки сейчас, не учитывая, что колл сохраняет будущие блефы агрессивного соперника",
    actionCEn: "Raise from current hand strength without accounting for calling preserving an aggressive opponent's future bluffs",
    reason2Ru: "Сильная рука всегда должна немедленно увеличивать банк, даже когда колл сохраняет блефы",
    reason2En: "A strong hand should always build the pot immediately even when calling preserves bluffs",
    reason3Ru: "Инициатива Hero важнее будущей агрессии соперника, поэтому колл не добавляет EV",
    reason3En: "Hero's initiative matters more than the opponent's future aggression, so calling adds no EV",
  },
  "PM-W4-REL-01-106": {
    actionCRu: "Сохранить план со сухой доски после роста числа дро и уязвимости, потому что сама рука не изменилась",
    actionCEn: "Keep the dry-board plan after draws and vulnerability increase because the hand itself did not change",
    reason2Ru: "Одинаковая сильная рука означает одинаковую срочность действия на сухой и динамичной доске",
    reason2En: "The same strong hand implies the same urgency on dry and dynamic boards",
    reason3Ru: "Инициатива гарантирует будущие возможности для вэлью, поэтому динамичность доски не должна влиять на рейз",
    reason3En: "Initiative guarantees future value opportunities, so board dynamism should not affect the raise decision",
  },
  "PM-W4-REL-01-107": {
    actionCRu: "Сохранить слоуплей против пассивного соперника, не учитывая падение вероятности будущих блефов",
    actionCEn: "Keep slow-playing against the passive opponent without accounting for the drop in future bluff frequency",
    reason2Ru: "Если сильная рука подходит для слоуплея, тип будущей агрессии соперника уже не меняет её роль",
    reason2En: "Once a strong hand is labeled a slow-play, the opponent's future aggression no longer changes its role",
    reason3Ru: "Инициатива и сила руки важнее того, будет ли соперник реально ставить позже",
    reason3En: "Initiative and hand strength matter more than whether the opponent will actually bet later",
  },
  "PM-W4-REL-01-108": {
    actionCRu: "Сохранить линию только с коллом из узла с низкой срочностью, хотя будущего действия почти не будет и вэлью уязвимо",
    actionCEn: "Keep the call-only line from a low-urgency node even though little future action remains and the value is vulnerable",
    reason2Ru: "Ярлык «только колл» обязателен для любой сильной руки в этом узле независимо от изменившейся срочности",
    reason2En: "The 'call-only' label is mandatory for every strong hand in this node regardless of the changed urgency",
    reason3Ru: "Инициатива и история линии делают немедленный рейз ненужным даже при уязвимом вэлью и слабой будущей активности",
    reason3En: "Initiative and prior action make an immediate raise unnecessary even with vulnerable value and little future action",
  },
};

function w4Distractors(id: string, skillId: string, badRu: string, badEn: string): W4Distractors {
  const scenario = W4_SCENARIO_DISTRACTORS[id];
  if (scenario) {
    return {
      actionBRu: badRu,
      actionBEn: badEn,
      ...scenario,
    };
  }

  // The only unlisted recognition-expansion row is the INTERNAL_ONLY transfer fixture.
  return {
    actionBRu: badRu,
    actionBEn: badEn,
    actionCRu: "Считать один успешный пример доказательством переноса на всё семейство без проверки нового стимула",
    actionCEn: "Treat one successful example as proof of transfer across the family without testing a new stimulus",
    reason2Ru: "Один правильно распознанный представитель семейства уже доказывает перенос на неидентичные примеры",
    reason2En: "One correctly recognized family member already proves transfer to non-identical examples",
    reason3Ru: "Та же роль и инициатива делают дополнительную проверку переноса ненужной",
    reason3En: "The same role and initiative make an additional transfer check unnecessary",
  };
}
const q=(id:string,skillId:string,kind:PracticalDecision["kind"],sourceRefs:string[],cueRu:string,cueEn:string,questionRu:string,questionEn:string,goodRu:string,goodEn:string,badRu:string,badEn:string,whyRu:string,whyEnOrChanged?:string|string[],changedVariablesArg?:string[],learnerEligibility:PracticalDecision["learnerEligibility"]="ORDINARY"):PracticalDecision=>{
  const whyEn=typeof whyEnOrChanged==="string"?whyEnOrChanged:whyRu;
  const changedVariables=Array.isArray(whyEnOrChanged)?whyEnOrChanged:changedVariablesArg;
  const distractors=w4Distractors(id,skillId,badRu,badEn);
  const good=o("a",goodRu,goodEn);
  const b=o("b",distractors.actionBRu,distractors.actionBEn,"CLASSIFICATION_SHORTCUT");
  const c=o("c",distractors.actionCRu,distractors.actionCEn,"CONTEXT_IGNORED");
  const r1=o("r1",whyRu,whyEn);
  const r2=o("r2",distractors.reason2Ru,distractors.reason2En,"LABEL_AS_STRATEGY");
  const r3=o("r3",distractors.reason3Ru,distractors.reason3En,"INITIATIVE_ONLY");
  return {
    id,skillId,learnerEligibility,kind,sourceRefs,
    assumptions:["mechanism-level classification; no exact solver frequency claimed"],
    cueRu,cueEn,questionRu,questionEn,
    actionOptions:RECOGNITION_SECOND_ACTION_IDS.has(id)?[b,good,c]:[good,b,c],
    reasonOptions:RECOGNITION_SECOND_REASON_IDS.has(id)?[r2,r1,r3]:[r1,r2,r3],
    correctActionId:"a",correctReasonId:"r1",targetSeconds:22,
    explanationRu:whyRu,explanationEn:whyEn,changedVariables,
  };
};

export const recognitionExpansionDecisions:PracticalDecision[]=[
// W4-BOARD-01 — board classes through range interaction, FTGU E07 + Smash board reports.
q("PM-W4-BOARD-01-101","W4-BOARD-01","recognition",["FTGU-E07"],"BTN vs BB, high dry flop that preserves raiser's high-card/overpair density.","BTN vs BB, high dry flop that preserves the raiser's high-card/overpair density.","Что распознать первым?","What should be recognized first?","Сильное сохранение range advantage","Strong preservation of range advantage","'Высокий flop = всегда bet'","'High flop = always bet'","Board strategy starts with how the flop interacts with both preflop ranges, not with a texture nickname."),
q("PM-W4-BOARD-01-102","W4-BOARD-01","recognition",["FTGU-E07"],"Low connected flop where BB retains many two-pair/straight candidates.","Low connected flop where BB retains many two-pair/straight candidates.","Какой structural class ближе?","Which structural class is closer?","Equalising / defender-friendly relative to dry high boards","Equalizing / defender-friendly relative to dry high boards","Automatic PFR range-bet board","Automatic PFR range-bet board","When the board connects with the discounted BB range and neutralizes overpair advantage, betting should become more selective."),
q("PM-W4-BOARD-01-103","W4-BOARD-01","decision",["FTGU-E07","SLC-SRP-BOARD-CLASSES"],"Two flops are both 'low', but one is disconnected and one highly connected.","Two flops are both 'low', but one is disconnected and one highly connected.","Можно ли дать им одну strategy только по rank height?","Can they share one strategy based only on rank height?","Нет — connectivity and range fit matter","No — connectivity and range fit matter","Да — low is one class","Yes — low is one class","Board labels that ignore actual range interaction are insufficient for choosing a strategy."),
q("PM-W4-BOARD-01-104","W4-BOARD-01","decision",["FTGU-E07"],"Same flop texture, but preflop ranges change from BTN-vs-BB to tighter HJ-vs-BTN.","Same flop texture, but preflop ranges change from BTN-vs-BB to tighter HJ-vs-BTN.","Сохраняется ли board ownership автоматически?","Does board ownership remain automatic?","Нет — пересчитать через arriving ranges","No — recalculate through arriving ranges","Да — board texture owns itself","Yes — board texture owns itself","A board has no strategy identity independent of the ranges that arrive there."),
q("PM-W4-BOARD-01-105","W4-BOARD-01","decision",["FTGU-E07"],"PFR retains concentrated advantage and many medium/weak hands can share one branch.","PFR retains concentrated advantage and many medium/weak hands can share one branch.","Какой strategy family становится plausible?","Which strategy family becomes plausible?","Small high-frequency/unselective betting","Small high-frequency/unselective betting","Large polar betting with every hand","Large polar betting with every hand","Concentrated range advantage plus broad participation supports a small sizing."),
q("PM-W4-BOARD-01-106","W4-BOARD-01","changed",["FTGU-E07"],"Same ranges; board changes from dry high to connected equaliser.","Same ranges; board changes from dry high to a connected equalizer.","Как должен двигаться betting structure?","How should betting structure move?","От broad/small к более selective","From broad/small toward more selective","К ещё более unselective","Toward even more unselective","When the defender gains two-pair/straight density, the raiser selects more strongly.",["board_class","range_advantage"]),
q("PM-W4-BOARD-01-107","W4-BOARD-01","changed",["FTGU-E07"],"Same board, defender preflop range loses the combos that connect most strongly.","Same board, the defender's preflop range loses the combos that connect most strongly.","Что происходит с ownership?","What happens to ownership?","Может сместиться обратно к aggressor","It can shift back toward the aggressor","Board label cannot change ownership","The board label cannot change ownership","Ownership follows surviving combinations, not visual texture alone.",["preflop_range_shape"]),
q("PM-W4-BOARD-01-108","W4-BOARD-01","boundary",["FTGU-E07"],"A low connected board appears 'BB-friendly', but BB's actual preflop branch lacks many relevant combos.","A low connected board looks 'BB-friendly', but the BB's actual preflop branch lacks many relevant combos.","Достаточно ли visual label?","Is the visual label sufficient?","Нет","No","Да","Yes","A low connected board is not automatically good for BB; actual arriving ranges still determine ownership."),

// W4-RUNOUT-01 — turn/runout classes through ancestry, E20/E21.
q("PM-W4-RUNOUT-01-101","W4-RUNOUT-01","recognition",["FTGU-E21"],"Flop caller raised many strongest hands; turn is a true blank.","The flop caller raised many strongest hands; the turn is a true blank.","Какой range-state чаще сохраняется?","Which range state is more likely to persist?","Caller remains relatively capped","The caller remains relatively capped","Caller automatically becomes uncapped","The caller automatically becomes uncapped","A blank preserves a cap only when strong hands plausibly left the calling branch earlier."),
q("PM-W4-RUNOUT-01-102","W4-RUNOUT-01","recognition",["FTGU-E21"],"Turn completes a relevant straight/flush or creates new two-pair/top-pair regions.","The turn completes a relevant straight/flush or creates new two-pair/top-pair regions.","Какой class?","Which class?","Game-changing / range-uncapping candidate","Game-changing / range-uncapping candidate","Automatic blank","Automatic blank","A capped flop branch can become uncapped on game-changing cards."),
q("PM-W4-RUNOUT-01-103","W4-RUNOUT-01","decision",["FTGU-E20"],"IP checked back flop, removing many nutted flop hands; turn is neutral.","IP checked back flop, removing many nutted flop hands; turn is neutral.","Что проверить до probe?","What should be checked before probing?","Какие strong hands flop check removed","Which strong hands the flop check removed","Только то, что c-bet был пропущен","Only that the c-bet was missed","Probe opportunity comes from the exact check-back composition, not from a mechanical missed-c-bet rule."),
q("PM-W4-RUNOUT-01-104","W4-RUNOUT-01","decision",["FTGU-E20"],"Flop check-back looked capped, but turn strongly improves the check-back range.","The flop check-back looked capped, but the turn strongly improves the check-back range.","Нужно ли mechanical overbet probe?","Should Hero mechanically overbet probe?","Нет — cap must be reassessed","No — the cap must be reassessed","Да — missed c-bet always means overbet","Yes — a missed c-bet always means overbet","The turn card can strengthen and uncap the checked-back range."),
q("PM-W4-RUNOUT-01-105","W4-RUNOUT-01","decision",["FTGU-E21"],"Caller is capped on a blank turn.","The caller is capped on a blank turn.","Какая sizing architecture может появиться?","Which sizing architecture can appear?","Polar overbet plus modest thin/protection branch","Polar overbet plus a modest thin/protection branch","Only one tiny size with entire range","Only one tiny size with the entire range","Against a capped branch, the strongest value and high-quality bluffs separate from thinner value and protection."),
q("PM-W4-RUNOUT-01-106","W4-RUNOUT-01","changed",["FTGU-E21"],"Same flop action; turn changes from blank to game-changing.","Same flop action; turn changes from blank to game-changing.","Что происходит с assumed cap?","What happens to the assumed cap?","Может исчезнуть","It can disappear","Всегда сохраняется","It always persists","Action ancestry and the new card jointly determine whether the branch remains capped.",["turn_class"]),
q("PM-W4-RUNOUT-01-107","W4-RUNOUT-01","changed",["FTGU-E20"],"Same check-back branch; turn now recreates strong hands for IP.","Same check-back branch; the turn now recreates strong hands for IP.","Как меняется probe aggression?","How does probe aggression change?","Более selective / less automatic","More selective / less automatic","More automatic","More automatic","The checked-back range must be re-evaluated before assuming it is still capped.",["turn_card","range_cap"]),
q("PM-W4-RUNOUT-01-108","W4-RUNOUT-01","boundary",["FTGU-E21"],"Flop caller used a call-only strategy and kept strong hands in calls.","The flop caller used a call-only strategy and kept strong hands in calls.","Можно ли объявить caller capped на blank turn?","Can the caller be declared capped on a blank turn?","Нет, не автоматически","No — the situation label alone is not enough to justify the conclusion","Да, callers are always capped","Yes, callers are always capped","Whether the flop node had a raising range determines whether the calling branch can be treated as capped."),

// W4-HAND-01 — exact combo -> family/traits; internal integrity authority + admitted LCMs.
q("PM-W4-HAND-01-101","W4-HAND-01","recognition",["FINAL_LEARNING_INTEGRITY","LCM-02"],"Exact combo makes top pair with strong kicker on a static board.","An exact combo makes top pair with a strong kicker on a static board.","Что игрок должен назвать кроме карт?","What should the player name beyond the cards?","Семейство руки и важные для решения свойства","Hand family + relevant traits","Только точное комбо","Only the exact combo","Перед решением назови семейство руки и свойства, которые влияют на решение: уязвимость, редро, блокеры, силу против диапазона соперника, — а не только две карты.","Before deciding, name the hand's family and the traits that drive the decision — vulnerability, redraws, blockers, strength versus the opponent's range — not just the two cards."),
q("PM-W4-HAND-01-102","W4-HAND-01","recognition",["FINAL_LEARNING_INTEGRITY"],"Exact combo has pair + strong draw.","An exact combo has a pair plus a strong draw.","Почему одного «пара» недостаточно?","Why is 'one pair' insufficient?","Эквити дро и устойчивость на будущих улицах меняют роль руки","Draw equity and future robustness change the family traits","Ярлык готовой руки полностью определяет EV","The made-hand label fully determines EV","Пара с сильным дро играется совсем иначе, чем та же пара без дро: эквити дро и то, как рука держится на следующих улицах, меняют её ценность, поэтому ярлыка «пара» недостаточно.","A pair with a strong draw plays very differently from the same pair without one: the draw's equity and how the hand holds up on later streets change its value, so the label 'one pair' is not enough."),
q("PM-W4-HAND-01-103","W4-HAND-01","decision",["FINAL_LEARNING_INTEGRITY","LCM-02"],"Two exact combos differ in suits but share the same relative family and relevant blockers do not change.","Two exact combos differ in suits but share the same relative family and relevant blockers do not change.","Что проверять?","What should be checked?","Переносится ли решение на уровне семейства","Whether the mechanism transfers at family level","Запомнить только первое комбо","Memorize the first combo only","Проверь, работает ли то же рассуждение после смены конкретных карт: если два комбо в одном семействе и важные блокеры не меняются, решение переносится; если свойство отличается — пересчитай.","Check whether the same reasoning still applies once the exact cards change: if two combos share the family and the relevant blockers, the decision carries over; if a trait differs, re-evaluate."),
q("PM-W4-HAND-01-104","W4-HAND-01","decision",["FINAL_LEARNING_INTEGRITY"],"Same named pair, but one version has redraws/blockers and the other does not.","Same named pair, but one version has redraws/blockers and the other does not.","Одинакова ли практическая роль руки?","Is the practical identity identical?","Нет — свойства разделяют семейство","No — traits split the family","Да — та же пара означает то же решение","Yes — the same pair means the same decision","Распознавание семейства руки должно сохранять важные для решения свойства: уязвимость, редро и блокеры.","Hand-family recognition must keep decision-relevant vulnerability, redraw and blocker traits."),
q("PM-W4-HAND-01-105","W4-HAND-01","decision",["LCM-02","FINAL_LEARNING_INTEGRITY"],"A concrete combo is shown after a preflop line.","A concrete combo is shown after a preflop line.","Какой переход нужен до действия?","Which bridge is needed before action?","Комбо → семейство и свойства → контекст → решение","Combo → family/traits → context → decision","Комбо → заученный ответ","Combo → memorized answer","Иди от конкретного комбо к его семейству и свойствам, затем учти доску и соперника, и только потом выбирай действие — не переходи от карт сразу к заученному ответу.","Go from the concrete combo to its family and traits, then apply the board and opponent context, and only then choose an action — do not jump from the cards straight to a memorized answer."),
q("PM-W4-HAND-01-106","W4-HAND-01","changed",["FINAL_LEARNING_INTEGRITY"],"Exact rank pattern stays similar, but board changes vulnerability/redraws.","The exact rank pattern stays similar, but the board changes vulnerability/redraws.","Что обновить?","What should be updated?","Family traits, not just name","Family traits, not just the name","Nothing","Nothing","A family is useful only if its contextual traits are recomputed when the board changes.",["board","vulnerability"]),
q("PM-W4-HAND-01-107","W4-HAND-01","changed",["FINAL_LEARNING_INTEGRITY"],"Same family, opponent range becomes much stronger.","Same family, opponent range becomes much stronger.","Что меняется?","What changes?","Relative strength/decision even if hand name stays","Relative strength/decision even if hand name stays","Nothing because family label fixed","Nothing because the family label is fixed","Family recognition is an intermediate representation, not the final action.",["opponent_range"]),
// Internal transfer-validation fixture: preserved for closure evidence, never ordinary learner practice.
q("PM-W4-HAND-01-108","W4-HAND-01","boundary",["FINAL_LEARNING_INTEGRITY"],"A learner gets the exact first combo correct but fails a non-identical combo from the same family.","A learner gets the exact first combo correct but fails a non-identical combo from the same family.","Что доказано?","What has been proven?","Recognition of one stimulus, not transfer","Recognition of one stimulus, not transfer","Full mastery","Full mastery","The integrity closure requires non-identical stimuli before claiming transfer.",undefined,undefined,"INTERNAL_ONLY"),

// W4-REL-01 — relative strength, E07/E08.
q("PM-W4-REL-01-101","W4-REL-01","recognition",["FTGU-E07"],"Same top pair appears in a range-advantage board and an equalising board.","The same top pair appears on a range-advantage board and an equalizing board.","Почему absolute label недостаточен?","Why is the absolute label insufficient?","Одна и та же топ-пара меняет стратегическую роль вместе с распределением силы и натсов в пришедших диапазонах","The same top pair changes strategic role with the strength and nut distribution of the arriving ranges","Top pair has one fixed value","Top pair has one fixed value","Strategy starts from ranges and board interaction, not from absolute made-hand labels."),
q("PM-W4-REL-01-102","W4-REL-01","recognition",["FTGU-E08"],"Strong made hand sits in a low-urgency, low-SPR call-only candidate node.","A strong made hand sits in a low-urgency, low-SPR call-only candidate node.","Does strength force an immediate raise?","Does strength force an immediate raise?","Нет","No","Да, strong always raises","Yes, strong always raises","Strong hands can remain in passive branches when raising adds little EV and later pressure is reliable."),
q("PM-W4-REL-01-103","W4-REL-01","decision",["FTGU-E08"],"Board is wet and strong value is vulnerable.","The board is wet and strong value is vulnerable.","Как меняется urgency?","How does urgency change?","На мокрой доске уязвимое сильное вэлью чаще требует немедленной агрессии, потому что промедление отдаёт эквити и защиту","On a wet board, vulnerable strong value more often needs immediate aggression because delay gives up equity and protection","Always slow-play","Always slow-play","Wetness and vulnerability are exceptions to call-only or passive simplifications."),
q("PM-W4-REL-01-104","W4-REL-01","decision",["FTGU-E07"],"Medium showdown hand on an equalising board.","A medium showdown hand on an equalizing board.","Что чаще происходит в selective structure?","What more often happens in a selective structure?","Средняя шоудаун-рука на уравнивающей доске чаще уходит в чек, пока верх диапазона и блефы используют ставки избирательно","A medium showdown hand on an equalizing board checks more often while top-range value and bluffs use betting selectively","Always large bet","Always large bet","Medium-strength showdown hands shift toward checking when the board neutralizes the raiser's advantage."),
q("PM-W4-REL-01-105","W4-REL-01","decision",["FTGU-E08"],"Aggressive opponent will keep bluffing later; strong hand is not vulnerable.","An aggressive opponent will keep bluffing later; the strong hand is not vulnerable.","Какой branch может gain EV?","Which branch can gain EV?","Call and preserve bluffs","Call and preserve bluffs","Raise automatically","Raise automatically","When urgency is low, calling can preserve an aggressive opponent's future bluffs."),
q("PM-W4-REL-01-106","W4-REL-01","changed",["FTGU-E08"],"Same hand, board changes dry -> wet/vulnerable.","Same hand, board changes from dry to wet/vulnerable.","Как меняется urgency?","How does urgency change?","Higher","Higher","Lower","Lower","Wetness and vulnerability can restore the need for a raising range.",["board_wetness","vulnerability"]),
q("PM-W4-REL-01-107","W4-REL-01","changed",["FTGU-E08"],"Same hand/board, opponent changes aggressive future bluffer -> passive.","Same hand/board, opponent changes from an aggressive future bluffer to passive.","Как меняется привлекательность слоуплея?","How does slow-play appeal change?","Падает","Falls","Растёт","Rises","Логика слоуплея частично держится на том, что будущая агрессия действительно последует.","Slow-play logic partly relies on future aggression actually arriving.",["opponent_future_aggression"]),
q("PM-W4-REL-01-108","W4-REL-01","boundary",["FTGU-E08"],"Strong hand in a call-only framework, but later action is unlikely and value is vulnerable.","A strong hand is in a call-only framework, but later action is unlikely and value is vulnerable.","Is call-only still mandatory?","Is call-only still mandatory?","Нет","No","Да","Yes","Passive lines are conditional; vulnerability and limited future action can restore immediate raising."),
];
