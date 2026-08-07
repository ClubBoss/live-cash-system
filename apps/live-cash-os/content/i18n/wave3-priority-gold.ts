import { moduleById } from "../modules";
import type { Drill } from "../types";
import type { LocaleCode, ModuleId } from "../../lib/model";

type PriorityModuleId = "preflop" | "blinds" | "aggression";

type DrillCopy = {
  assumptions: string[];
  cue: string;
  question: string;
  actions: [string, string, string];
  reasons: [string, string, string];
  explanation: string;
};

type ModuleCopy = {
  title: string;
  shortTitle: string;
  description: string;
  scope: string;
  plainGoal: string;
  tableCue: string;
  technicalTerm: string;
  theory: string[];
  heuristics: string[];
  decisionTree: string[];
  workedExample: { situation: string; steps: string[]; answer: string };
  counterexample: string;
  lab: { title: string; description: string; leftTitle: string; leftText: string; rightTitle: string; rightText: string };
  explainBackPrompt: string;
  tableCard: string[];
  glossary: Array<{ term: string; meaning: string }>;
  drills: Record<string, DrillCopy>;
  cards: Record<string, [string, string]>;
};

const RU_PRIORITY: Record<PriorityModuleId, ModuleCopy> = {
  preflop: {
    title: "Префлоп: структура решения",
    shortTitle: "Колл, 3-бет или фолд",
    description: "Сначала понять цену и жизнеспособные ветки, и только потом вспоминать диапазон.",
    scope: "Направленная архитектура для live cash. Точные комбинации и частоты зависят от позиций, глубины, размера открытия, рейка и поведения игроков за спиной.",
    plainGoal: "Выбирать между коллом, 3-бетом и фолдом без десятков заученных чартов.",
    tableCue: "Цена → диапазоны → игроки за спиной → качество колла → 3-бет или фолд.",
    technicalTerm: "Линейный и полярный 3-бет; защищённый колл.",
    theory: [
      "Префлоп-чарт — это форма базовой стратегии, а не команда на каждый стол. Размер открытия, рейк, глубина и игроки за спиной могут менять ветку.",
      "Колл нужно оценить отдельно. То, что колл плох, ещё не делает руку хорошим блеф-3-бетом: после 3-бета соперник продолжит более сильной частью диапазона.",
      "Когда поле открывает и коллирует слишком широко, разумная подстройка — чаще использовать уже существующие смешанные 3-бет-кандидаты, а не добавлять случайные руки только ради агрессии.",
      "С ростом глубины ценность позиции, мастевых связок и защищённых коллов обычно растёт. При более коротком стеке стратегия чаще смещается к прямому линейному 3-бету и более раннему выставлению, но точная граница остаётся ситуационной.",
    ],
    heuristics: [
      "Сначала спроси: есть ли здесь хороший колл?",
      "Перед 3-бетом назови руки, которые реально сфолдят, и руки, которые продолжат.",
      "Чем хуже позиция и чем больше активных игроков за спиной, тем дороже пассивный колл.",
    ],
    decisionTree: [
      "Определи позиции, эффективный стек, размер открытия и рейк, если он существенно влияет на цену.",
      "Оцени исходные диапазоны открывшегося игрока и коллера — хотя бы по форме, а не по точным клеткам.",
      "Проверь игроков за спиной: кто может сквизить и закрываешь ли ты торговлю.",
      "Сравни колл с фолдом: цена, доминация, позиция и способность реализовать эквити.",
      "Только затем оцени 3-бет: это вэлью/изоляция, полярный блеф с реальными фолдами или лишняя агрессия?",
    ],
    workedExample: {
      situation: "200bb. HJ открывается, CO коллирует, Hero на BTN с мастевой связкой из нижней части базового колл-региона; блайнды пассивны.",
      steps: [
        "Hero в позиции, а риск сквиза за спиной ниже обычного.",
        "Глубина оставляет больше пространства для реализации эквити и выигрыша крупных банков при сильном попадании.",
        "Рука плохо блокирует премиальные продолжения, поэтому 3-бет не получает автоматического преимущества только из-за инициативы.",
      ],
      answer: "Колл остаётся полноценной веткой. Не превращай жизнеспособный колл в сквиз без отдельной причины.",
    },
    counterexample: "Та же по силе мастевая рука из SB против открытия и колла может резко потерять ценность: Hero вне позиции, BB ещё не действовал и может сквизить. Тогда колл надо сравнивать уже с 3-бетом и фолдом, а не переносить BTN-логику.",
    lab: {
      title: "Колл или 3-бет",
      description: "Сравни две ветки по тому, что они реально выигрывают и чем рискуют.",
      leftTitle: "Колл",
      leftText: "Цена, позиция, доминация, глубина и вероятность увидеть флоп без нового рейза.",
      rightTitle: "3-бет",
      rightText: "Кто продолжит хуже, кто сфолдит лучше, какие блокеры помогают и каким станет будущий SPR.",
    },
    explainBackPrompt: "Объясни, почему плохой колл сам по себе не превращает руку в хороший 3-бет-блеф.",
    tableCard: ["Позиции и цена", "Исходные диапазоны", "Игроки за спиной", "Качество колла", "Зачем нужен 3-бет?"],
    glossary: [
      { term: "Линейный 3-бет", meaning: "Продолжение сильнейшими доступными руками, когда соперник мало фолдит или отдельный колл-регион не нужен." },
      { term: "Полярный 3-бет", meaning: "Сильное вэлью плюс блефы, которым заметно выгоден фолд соперника." },
      { term: "Защищённый колл", meaning: "Колл-регион, в котором остаётся достаточно сильных рук, чтобы его нельзя было безнаказанно атаковать." },
    ],
    drills: {
      "pre-01": {
        assumptions: ["100bb", "CO открывает 3bb", "BTN коллирует", "Hero SB с TT", "BB компетентный и ещё не действовал"],
        cue: "Позднее открытие и колл; Hero в SB с TT, BB ещё за спиной.",
        question: "Какая ветка должна быть базовым кандидатом первой?",
        actions: ["Сквиз на вэлью и изоляцию", "Пассивный колл как автоматический выбор", "Фолд из-за игры вне позиции"],
        reasons: ["Сильная рука выигрывает от изоляции и лишения эквити, а SB-колл несёт риск сквиза и плохой реализации", "TT всегда обязана 3-бетить независимо от позиций и диапазонов", "Любая игра вне позиции делает продолжение ошибкой"],
        explanation: "Здесь сквиз — базовый кандидат из-за совокупности силы руки и структуры SB, а не потому, что TT является универсальной клеткой 3-бета.",
      },
      "pre-02": {
        assumptions: ["200bb", "HJ открывается", "CO коллирует", "Hero BTN", "рука входит в нижнюю мастевую часть базового колл-региона", "блайнды пассивны"],
        cue: "Глубокий open+call, Hero в позиции, а игроки за спиной редко сквизят.",
        question: "Что важно сохранить перед поиском сквиза?",
        actions: ["Жизнеспособный колл", "Полярный сквиз только из-за масти и связности", "Фолд только потому, что рука не high-card"],
        reasons: ["Позиция, глубина и низкий риск сквиза позволяют реализовать эквити без раздувания банка", "Любая мастевая связка обязана превращаться в блеф-3-бет", "Низкие карты не могут выигрывать глубокие банки"],
        explanation: "Глубина и позиция могут сделать колл лучшей веткой. Инициатива не является самостоятельной целью.",
      },
      "pre-03": {
        assumptions: ["100bb", "ранняя позиция открывает крупнее стандартного", "следующий игрок коллирует", "Hero держит доминируемый оффсьют-бродвей у нижней границы продолжения"],
        cue: "Сильные исходные диапазоны и риск мультивея против доминируемого оффсьют-бродвея.",
        question: "Какой вывод наиболее устойчив?",
        actions: ["Фолд", "Колл ради возможности попасть в топ-пару", "Сквиз только из-за блокера на старшую карту"],
        reasons: ["Доминация и плохая реализация против сильных диапазонов перевешивают поверхностную привлекательность high-card руки", "Любой оффсьют-бродвей всегда обязан фолдить мультивей", "Один блокер сам по себе создаёт достаточную fold equity"],
        explanation: "Причина фолда — не название руки, а структура диапазонов и доминация после продолжения соперников.",
      },
      "pre-04": {
        assumptions: ["100bb", "широкое позднее открытие", "широкий колл", "Hero в SB", "рука уже является смешанным полярным 3-бет-кандидатом в базовой стратегии", "BB пассивный"],
        cue: "Поле входит слишком широко, а у Hero уже есть базовый смешанный 3-бет-кандидат.",
        question: "Как расширять сквиз наиболее дисциплинированно?",
        actions: ["Чаще использовать уже существующего смешанного кандидата", "Добавить любые мастевые руки, которые выглядят играбельно", "Убрать все блефы и 3-бетить только премиумы"],
        reasons: ["Подстройка усиливает уже обоснованную ветку с fold equity и playability, не изобретая новую область диапазона", "Масть сама гарантирует прибыль после колла", "Широкие входные диапазоны соперников всегда означают, что они никогда не фолдят на 3-бет"],
        explanation: "Источник прямо поддерживает «очистку» существующих миксов: чаще используй хорошие кандидаты, а не придумывай случайные блефы.",
      },
      "pre-05": {
        assumptions: ["сравнение более короткого и более глубокого эффективного стека", "одни и те же позиции", "без особого рида на соперника"],
        cue: "Та же префлоп-ситуация становится значительно короче по эффективному стеку.",
        question: "Какое направление изменения наиболее надёжно?",
        actions: ["Больше прямых линейных 3-бетов и меньше ценности у спекулятивных коллов", "Больше защищённых глубоких коллов и меньше 3-бетов", "Глубина не должна менять префлоп-ветку"],
        reasons: ["При низком будущем SPR сильные high-card и пары реализуют ценность прямее, а implied odds спекулятивных рук уменьшаются", "Короткий стек увеличивает implied odds мастевых связок", "Эффективный стек влияет только после флопа"],
        explanation: "Это направленный сдвиг, а не точный чарт: чем короче стек, тем меньше пространства у спекулятивных коллов и тем больше ценности у прямой агрессии.",
      },
    },
    cards: {
      "pre-card-seq": ["Пять префлоп-проверок перед решением?", "Позиции и цена → диапазоны → игроки за спиной → качество колла → цель 3-бета."],
      "pre-card-flat": ["Когда колл нельзя выбрасывать только ради инициативы?", "Когда цена, позиция, глубина и низкий риск сквиза дают ему самостоятельную ценность."],
      "pre-card-polar": ["Что нужно полярному 3-бет-блефу?", "Реальные фолды, полезный блокер/эквити и причина не выбирать лучший колл."],
    },
  },
  blinds: {
    title: "Блайнды: SB не равен BB",
    shortTitle: "SB и BB",
    description: "Одинаковая рука и доска меняют ценность в зависимости от цены, порядка действий и исходного диапазона.",
    scope: "Направленная логика защиты блайндов. Точные коллы и 3-беты зависят от размера открытия, рейка, глубины и конкретного поля.",
    plainGoal: "Разделять защиту SB и BB и понимать, когда закрытие торговли делает колл реально лучше.",
    tableCue: "Какой блайнд → какая цена → кто ещё действует → как реализуется эквити.",
    technicalTerm: "Закрытие торговли, исходный диапазон и реализация эквити.",
    theory: [
      "BB уже вложил большой блайнд и часто закрывает префлоп-торговлю. Поэтому некоторые коллы могут быть лучше фолда даже с отрицательным абсолютным результатом: важна разница между EV колла и потерей блайнда при фолде.",
      "SB получает меньшую скидку, остаётся вне позиции и не закрывает торговлю. BB может сквизить и полностью лишить пассивный колл реализации эквити.",
      "SB и BB приходят на один и тот же флоп с разными по форме диапазонами. Поэтому нельзя автоматически переносить один c-bet-план против обоих блайндов.",
      "Конкретный рид может расширить или сузить исходный диапазон, но порядок действий и цена никуда не исчезают.",
    ],
    heuristics: [
      "Сначала назови блайнд и цену, а не только свои две карты.",
      "BB: спроси, закрываешь ли ты торговлю и достаточно ли реализуешь эквити.",
      "SB: прежде чем коллировать, посчитай риск BB-сквиза и цену игры вне позиции.",
    ],
    decisionTree: [
      "Hero в SB или BB?",
      "Какова цена продолжения после уже вложенного блайнда?",
      "Закрывается ли торговля после Hero или кто-то ещё может повысить?",
      "Как исходный диапазон этой позиции взаимодействует с диапазоном открывшегося игрока?",
      "Сможет ли рука реализовать достаточно эквити с учётом позиции, рейка и будущих решений?",
    ],
    workedExample: {
      situation: "CO открывается. Один и тот же сухой A-high флоп достигается сначала против BB-колла, затем против SB-колла.",
      steps: [
        "BB обычно защищается шире благодаря цене и закрытию торговли.",
        "SB-колл чаще начинается из более узкого и сжатого диапазона, потому что Hero не закрывал торговлю и играл вне позиции.",
        "Следовательно, одинаковая доска не означает одинаковую частоту автоматических фолдов или одинаковый план продолженной ставки.",
      ],
      answer: "Сначала восстанови, откуда пришёл диапазон соперника; только потом выбирай c-bet-план.",
    },
    counterexample: "Если конкретный SB многократно показал очень широкие коллы, его фактический диапазон может стать ближе к широкому BB-профилю. Но Hero всё равно должен учитывать, что SB не закрывал торговлю и платил за худшую позицию.",
    lab: {
      title: "SB против BB",
      description: "Один открывающий диапазон, но разная цена и разный порядок действий.",
      leftTitle: "BB",
      leftText: "Лучше цена, часто закрывает торговлю, поэтому может сохранять более широкий колл-регион.",
      rightTitle: "SB",
      rightText: "Хуже цена, игра вне позиции и BB за спиной делают пассивный колл структурно дороже.",
    },
    explainBackPrompt: "Объясни, почему одинаковые две карты могут быть нормальным коллом из BB и плохим пассивным коллом из SB.",
    tableCard: ["SB или BB?", "Цена продолжения", "Закрывается ли торговля", "Кто за спиной", "Реализация эквити"],
    glossary: [
      { term: "Закрыть торговлю", meaning: "После твоего решения никто больше не может сделать префлоп-рейз в этой ветке." },
      { term: "Сжатый диапазон", meaning: "Диапазон с большой долей средне-сильных рук и меньшей долей крайних по силе комбинаций." },
      { term: "Реализация эквити", meaning: "Насколько хорошо рука превращает свою исходную долю банка в фактический результат через будущие решения." },
    ],
    drills: {
      "bli-01": {
        assumptions: ["CO открывается 3bb", "одинаковый сухой A-high флоп", "в одном случае BB коллировал, в другом SB коллировал"],
        cue: "Одна и та же доска против двух разных блайнд-коллов.",
        question: "Можно ли автоматически использовать один и тот же c-bet-план?",
        actions: ["Нет; сначала восстановить разные исходные диапазоны", "Да; доска одна и та же", "Да; оба соперника начали руку на блайнде"],
        reasons: ["Цена и порядок действий создают разные формы SB- и BB-колла ещё до флопа", "После флопа префлоп-позиция больше не влияет на диапазон", "Все диапазоны блайнд-колла становятся одинаковыми после выхода доски"],
        explanation: "Доска интерпретируется через диапазон, который до неё дошёл. У SB и BB этот диапазон обычно сформирован разными ограничениями.",
      },
      "bli-02": {
        assumptions: ["open+call", "Hero BB", "рука имеет достаточную играбельность", "после Hero торговля закрывается"],
        cue: "Hero в BB получает хорошую цену и после его решения никто больше не может повысить.",
        question: "Что нужно честно сравнить до автоматического сквиза?",
        actions: ["EV колла против EV фолда и 3-бета", "Только желание получить инициативу", "Только абсолютную вероятность выиграть банк"],
        reasons: ["Уже вложенный блайнд, цена и закрытие торговли могут сделать колл лучшей реализацией, даже если рука не доминирует диапазон", "Инициатива всегда ценнее хорошей цены", "Колл прибыльный только если выигрывает большинство банков"],
        explanation: "BB защищает не потому, что рука «сильная», а потому что цена и закрытие торговли снижают требуемую реализацию относительно фолда.",
      },
      "bli-03": {
        assumptions: ["open+call", "Hero SB рассматривает пассивный колл", "BB ещё не действовал"],
        cue: "Hero в SB видит привлекательную цену, но BB остаётся за спиной.",
        question: "Какой риск нельзя игнорировать?",
        actions: ["BB может сквизить и лишить колл реализации", "Только вероятность получить неудобный флоп", "Риска нет, если рука мастевая"],
        reasons: ["SB не закрывает торговлю и после колла всё ещё может столкнуться с новым крупным рейзом", "SB получает ту же структуру цены, что и BB", "Масть нейтрализует позицию и действия игрока за спиной"],
        explanation: "Пассивный SB-колл нужно оценивать вместе с вероятностью сквиза, а не как гарантированный билет на флоп.",
      },
      "bli-04": {
        assumptions: ["глубокий банк", "Hero вне позиции", "рука имеет приличное сырое эквити, но сложные будущие решения"],
        cue: "Рука выглядит достаточно сильной на префлопе, но Hero почти всегда будет действовать первым после флопа.",
        question: "Какой вопрос важнее внешней красоты руки?",
        actions: ["Сколько эквити рука реально сможет реализовать", "Насколько красиво она выглядит в стартовой таблице", "Можно ли рейзом навсегда убрать сложные тёрны"],
        reasons: ["Позиционное давление, доминация и будущие ставки могут сильно отделить сырое эквити от фактического результата", "Игра вне позиции всегда означает фолд", "Инициатива полностью компенсирует позицию"],
        explanation: "Реализация эквити — это не комфорт. Это способность пройти будущие решения без систематической потери ценности.",
      },
      "bli-05": {
        assumptions: ["несколько релевантных наблюдений", "SB многократно показывает более широкий колл, чем базовый", "структура стола не изменилась"],
        cue: "Фактический SB соперника подтверждённо коллирует шире обычного.",
        question: "Как правильно обновить модель?",
        actions: ["Расширить его исходный диапазон, но сохранить цену и порядок действий в анализе", "Полностью приравнять SB к BB", "Игнорировать наблюдения и всегда держать теоретический диапазон"],
        reasons: ["Рид меняет состав диапазона, но не отменяет того, что SB платил худшую цену и не закрывал торговлю", "Один широкий диапазон делает позиции стратегически одинаковыми", "Теория никогда не должна обновляться данными поля"],
        explanation: "Наблюдение корректирует исходный диапазон. Структурные свойства позиции остаются частью задачи.",
      },
    },
    cards: {
      "bli-card-source": ["Первый вопрос на одинаковой доске против SB и BB?", "Из какого префлоп-диапазона соперник дошёл до этой доски?"],
      "bli-card-close": ["Что особенно помогает BB-коллу?", "Цена уже вложенного блайнда и возможность закрыть префлоп-торговлю."],
      "bli-card-sb": ["Почему пассивный SB-колл обычно дороже BB-колла?", "Хуже цена, игра вне позиции и BB, который ещё может повысить."],
    },
  },
  aggression: {
    title: "3-бет-банки: агрессия и защита",
    shortTitle: "После 3-бета",
    description: "Префлоп-состав диапазона определяет, сколько агрессии он реально выдерживает после флопа.",
    scope: "Механизмы 3-бет-банков без точных solver-частот. Конкретные доски, размеры и пороги требуют отдельной визуальной проверки источника.",
    plainGoal: "Понимать, когда 3-беттор действительно может ставить часто, а когда его диапазон обязан тормозить.",
    tableCue: "Какой был 3-бет-диапазон → кому подходит доска → размер → что отфильтровал колл.",
    technicalTerm: "Компенсация диапазона, частая малая ставка, селективная полярная ставка и OOP raise gate.",
    theory: [
      "Префлоп-подстройка не заканчивается на префлопе. Если игрок 3-бетит намного шире обычного, его флоп-диапазон содержит больше слабого материала и должен компенсировать это большим количеством чеков.",
      "Если широкий 3-беттор продолжает ставить флоп с частотой сильного базового диапазона, он соединяет две ошибки: вошёл слишком широко и не снизил агрессию. Защитник может продолжать заметно шире.",
      "Нормальный сильный 3-бет-диапазон на сухой старшей или спаренной доске часто сохраняет преимущество премиальных пар и сильных high-card рук. Тогда частая небольшая ставка может быть естественной. На связанных средних досках это разрешение исчезает, и стратегия становится селективнее.",
      "После частой флоп-ставки и колла диапазоны меняются несимметрично: защитник уже выкинул слабейшие руки, а ставивший сохранил весь исходный воздух. На тёрне нельзя механически продолжать ставить всем диапазоном.",
      "Для OOP-рейза в 3-бет-банке сначала нужен настоящий верх диапазона. При низком SPR олл-ин строится вокруг сильного вэлью, лучших блефов и отдельных гибридов; одно лишь желание выбить эквити не оправдывает пуш средней части диапазона.",
    ],
    heuristics: [
      "Сначала восстанови форму префлоп 3-бет-диапазона: нормальный, слишком тайтовый или слишком широкий.",
      "Спроси, сохранила ли доска премиальное преимущество 3-беттора или уравняла диапазоны.",
      "После колла заново фильтруй оба диапазона перед следующей ставкой.",
    ],
    decisionTree: [
      "Как соперник построил 3-бет: базово, слишком тайтово или слишком широко?",
      "Какие сильные руки и какой слабый материал реально дошли до флопа?",
      "Доска сохраняет это преимущество или даёт защитнику больше сильных и натсовых рук?",
      "Соответствуют ли частота и размер ставки реальной форме диапазона?",
      "После колла перестрой диапазоны; для OOP-рейза отдельно проверь наличие верхнего вэлью и подходящих блефов.",
    ],
    workedExample: {
      situation: "BB 3-бетит BTN заметно шире нормы, но на сухом флопе продолжает маленькой ставкой почти всем диапазоном, как будто префлоп-подстройки не было.",
      steps: [
        "Лишние префлоп-комбинации добавили в диапазон BB слабый материал.",
        "Такой диапазон должен чаще чекать, чтобы не ставить слишком много воздуха.",
        "Если BB всё равно сохраняет обычную высокую частоту c-bet, BTN получает право защищаться шире и внимательно смотреть, где соперник сдаётся или продолжает переблефовывать на следующих улицах.",
      ],
      answer: "Не защищайся как против нормального сильного 3-бет-диапазона: сначала проверь, компенсировал ли соперник свою лишнюю префлоп-ширину.",
    },
    counterexample: "Широкая флоп-ставка сама по себе не ошибка. Нормальный премиум-тяжёлый 3-бет-диапазон на сухой старшей или спаренной доске может честно поддерживать частую небольшую ставку. Ошибка появляется, когда диапазон и частота ставки не соответствуют друг другу.",
    lab: {
      title: "Нормальный или слишком широкий 3-бет",
      description: "Одинаковая кнопка c-bet означает разное, если префлоп-состав диапазона разный.",
      leftTitle: "Базовый 3-бет",
      leftText: "Больше премиумов и меньше мусора: на подходящей сухой доске частая малая ставка может быть устойчивой.",
      rightTitle: "Слишком широкий 3-бет",
      rightText: "Больше слабых рук: диапазон обязан чаще чекать; без компенсации та же c-bet-частота становится переблефованной.",
    },
    explainBackPrompt: "Объясни, почему слишком широкий префлоп 3-бет должен менять постфлоп-частоты, а флоп range-bet после колла не переносится автоматически на тёрн.",
    tableCard: ["Форма 3-бет-диапазона", "Кому подходит доска", "Частота и размер", "Что отфильтровал колл", "Есть ли верх для OOP-рейза"],
    glossary: [
      { term: "Компенсация диапазона", meaning: "Постфлоп-изменение частот, необходимое потому, что префлоп-диапазон стал шире или уже обычного." },
      { term: "Селективная ставка", meaning: "Ставка только выбранной частью диапазона: сильное вэлью плюс подходящие блефы, а не почти всем диапазоном." },
      { term: "Верх диапазона", meaning: "Достаточно сильные руки, которые делают агрессивную ветку правдоподобной и защищённой." },
    ],
    drills: {
      "agg-01": {
        assumptions: ["BB 3-бетит BTN заметно шире базового", "флоп сухой", "BB всё равно ставит маленьким размером почти всем диапазоном"],
        cue: "Соперник добавил много слабых рук префлоп, но не добавил нужные чеки на флопе.",
        question: "Какой вывод наиболее важен для BTN?",
        actions: ["Защищаться шире против недокомпенсированной c-bet-частоты", "Защищаться тайтовее, потому что 3-беттор всегда сильнее", "Игнорировать префлоп-ширину и смотреть только на размер ставки"],
        reasons: ["Дополнительный слабый материал делает прежнюю частоту ставки переблефованной, если соперник не компенсирует её чеками", "Любой 3-бет-диапазон сохраняет одинаковую силу после расширения", "Маленький размер полностью определяет состав диапазона"],
        explanation: "Постфлоп-эксплойт следует из префлоп-состава. Широкий диапазон не может безнаказанно играть частоты более сильного диапазона.",
      },
      "agg-02": {
        assumptions: ["обычный сильный 3-бет-диапазон", "сухая старшая или спаренная доска", "премиальные пары и сильные high-card руки остаются у 3-беттора чаще"],
        cue: "Доска почти не добавляет защитнику новых натсовых рук и сохраняет префлоп-премиальное преимущество.",
        question: "Какой план является разумным кандидатом?",
        actions: ["Частая небольшая ставка", "Автоматический чек всем диапазоном", "Только большой полярный overbet"],
        reasons: ["Преимущество диапазона сохранилось, а маленький размер позволяет ставить также среднему вэлью и защитным рукам", "Позиция всегда запрещает частую ставку в 3-бет-банке", "Высокая частота всегда требует самого большого размера"],
        explanation: "Это направление, а не точная solver-частота: сухая доска может сохранить настолько сильное преимущество 3-беттора, что малая частая ставка становится естественной.",
      },
      "agg-03": {
        assumptions: ["обычный 3-бет-диапазон", "связанная средняя доска", "обе стороны имеют заметную долю сильных и натсовых комбинаций"],
        cue: "Доска уравняла диапазоны сильнее, чем сухой A-high или paired flop.",
        question: "Что происходит с автоматической частой ставкой?",
        actions: ["Она уступает место более селективному bet/check-разделению", "Она становится ещё чаще только потому, что Hero был 3-беттором", "Нужно всегда чекать и никогда не ставить"],
        reasons: ["Когда натсовое и общее преимущество уменьшается, вэлью и блефы нужно выбирать точнее, а средняя часть чаще уходит в чек", "Статус префлоп-агрессора автоматически даёт право ставить любую доску", "Связанная доска всегда полностью принадлежит коллеру"],
        explanation: "Высокие карты сами по себе не дают вечного разрешения на c-bet. Сначала проверь реальное взаимодействие диапазонов с доской.",
      },
      "agg-04": {
        assumptions: ["флоп — частая малая ставка", "защитник коллирует", "тёрн не создаёт нового экстремального преимущества"],
        cue: "Флоп был поставлен почти всем диапазоном, но слабейшая часть диапазона защитника уже сфолдила.",
        question: "Можно ли автоматически повторить range-bet на тёрне?",
        actions: ["Нет; заново отфильтровать оба диапазона и стать селективнее", "Да; если флоп был range-bet, тёрн тоже range-bet", "Да; колл всегда означает слабость"],
        reasons: ["После колла защитник стал сильнее относительно исходного диапазона, тогда как ставивший сохранил весь флоп-воздух", "Одна высокая частота должна сохраняться на всех улицах", "Колл удаляет сильные руки и оставляет только bluff-catchers"],
        explanation: "Флоп-колл меняет относительное преимущество. Частая первая ставка не является лицензией на автоматический второй баррель.",
      },
      "agg-05": {
        assumptions: ["OOP защищается в 3-бет-банке", "низкий SPR", "в рассматриваемой ветке у OOP почти нет рук верхнего вэлью-класса"],
        cue: "Hero хочет построить крупный рейз или пуш только ради лишения эквити.",
        question: "Какой gate важнее всего?",
        actions: ["Без достаточного верхнего вэлью рейз может почти исчезнуть", "Пушить среднюю часть диапазона ради защиты", "Рейзить любую руку, которая не хочет коллировать"],
        reasons: ["Правдоподобная агрессивная ветка требует сильного вэлью; denial усиливает подходящего кандидата, но не создаёт его из середины диапазона", "Низкий SPR превращает любое made hand в вэлью-пуш", "Плохой колл автоматически означает хороший блеф-рейз"],
        explanation: "Carrot прямо ставит наличие top-end holdings перед построением OOP raise range. Denial — дополнительная выгода, а не самостоятельное разрешение на пуш.",
      },
    },
    cards: {
      "agg-card-value": ["Первый вопрос после слишком широкого 3-бета соперника?", "Компенсировал ли он слабый префлоп-состав большим количеством постфлоп-чеков?"],
      "agg-card-job": ["Когда частая малая ставка в 3-бет-банке естественна?", "Когда доска сохраняет сильное премиальное преимущество 3-беттора и размер подходит широкому диапазону."],
      "agg-card-scary": ["Что меняется после range-bet и колла?", "Диапазон защитника уже отфильтрован и стал сильнее; тёрн нужно строить заново."],
    },
  },
};

const EN_PRIORITY: Record<PriorityModuleId, ModuleCopy> = {
  preflop: {
    title: "Preflop structure for live cash",
    shortTitle: "Call, 3-bet or fold",
    description: "Understand the price and viable branches before reaching for a memorised range.",
    scope: "A directional live-cash framework. Exact combos and frequencies depend on positions, depth, open size, rake and the players left to act.",
    plainGoal: "Choose between calling, 3-betting and folding without memorising dozens of charts.",
    tableCue: "Price → ranges → players behind → call quality → 3-bet or fold.",
    technicalTerm: "Linear and polar 3-betting; protected calling ranges.",
    theory: [
      "A preflop chart is a baseline shape, not a command for every table. Open size, rake, depth and the players behind can change the branch.",
      "Evaluate the call independently. A poor call does not automatically make a good bluff 3-bet: after the raise, Villain continues with a stronger filtered range.",
      "When the field opens and calls too widely, a disciplined exploit is to use existing mixed 3-bet candidates more often rather than inventing arbitrary new bluffs.",
      "As stacks deepen, position, suited playability and protected flats usually gain value. Shorter stacks shift more weight toward direct linear 3-betting and earlier stack commitment, but the exact boundary remains node-specific.",
    ],
    heuristics: [
      "First ask whether a good call exists.",
      "Before 3-betting, name the hands that can actually fold and the hands that continue.",
      "The worse your position and the more active players behind, the more expensive a passive call becomes.",
    ],
    decisionTree: [
      "Identify positions, effective stack, open size and material rake effects.",
      "Estimate the opener and caller range shapes without pretending you know every mixed cell.",
      "Check the players behind: who can squeeze, and do you close the action?",
      "Compare calling with folding: price, domination, position and equity realisation.",
      "Only then evaluate the 3-bet: value/isolation, a polar bluff with real folds, or unnecessary aggression?",
    ],
    workedExample: {
      situation: "200bb. HJ opens, CO calls, and Hero is on the BTN with a suited connector from the lower part of a baseline calling region; the blinds are passive.",
      steps: [
        "Hero has position and faces less squeeze risk than usual from the players behind.",
        "Depth leaves more room to realise equity and win larger pots when the hand connects strongly.",
        "The hand does not block premium continues well, so a 3-bet does not become superior merely because it gains initiative.",
      ],
      answer: "Calling remains a real branch. Do not turn a viable call into a squeeze without a separate reason.",
    },
    counterexample: "A similarly playable suited hand in the SB against an open and a call can lose value sharply: Hero is out of position and the BB can still squeeze. Now the call must be compared with 3-betting and folding rather than imported from the BTN branch.",
    lab: {
      title: "Call or 3-bet",
      description: "Compare what each branch actually wins and what it risks.",
      leftTitle: "Call",
      leftText: "Price, position, domination, depth and the chance of reaching the flop without another raise.",
      rightTitle: "3-bet",
      rightText: "Which worse hands continue, which better hands fold, which blockers help and what future SPR will be created.",
    },
    explainBackPrompt: "Explain why a poor call does not by itself turn a hand into a good bluff 3-bet.",
    tableCard: ["Positions and price", "Source ranges", "Players behind", "Call quality", "What is the 3-bet doing?"],
    glossary: [
      { term: "Linear 3-bet", meaning: "Continue with the strongest available hands when Villain folds little or a separate calling range is not useful." },
      { term: "Polar 3-bet", meaning: "Strong value plus bluffs that gain materially from Villain folding." },
      { term: "Protected call", meaning: "A calling range that retains enough strong hands to avoid becoming an easy target." },
    ],
    drills: {
      "pre-01": {
        assumptions: ["100bb", "CO opens 3bb", "BTN calls", "Hero SB with TT", "competent BB still to act"],
        cue: "Late-position open and call; Hero is in the SB with TT and the BB is still behind.",
        question: "Which branch should be the first baseline candidate?",
        actions: ["Squeeze for value and isolation", "Passive call by default", "Fold because Hero will be out of position"],
        reasons: ["The strong hand benefits from isolation and equity denial, while an SB call carries squeeze risk and poor realisation", "TT must always 3-bet regardless of positions and ranges", "Any out-of-position hand should avoid the pot"],
        explanation: "The squeeze is the baseline candidate because of hand strength plus SB structure, not because TT is a universal 3-bet cell.",
      },
      "pre-02": {
        assumptions: ["200bb", "HJ opens", "CO calls", "Hero BTN", "hand is in the lower suited part of a baseline call region", "passive blinds"],
        cue: "Deep open-plus-call, Hero has position and the players behind rarely squeeze.",
        question: "What should be preserved before searching for a squeeze?",
        actions: ["A viable call", "A polar squeeze merely because the hand is suited and connected", "A fold merely because the hand is not high-card"],
        reasons: ["Position, depth and low squeeze risk allow the hand to realise equity without inflating the pot", "Every suited connector should become a bluff 3-bet", "Low cards cannot win deep pots"],
        explanation: "Depth and position can make calling the better branch. Initiative is not a goal by itself.",
      },
      "pre-03": {
        assumptions: ["100bb", "early position opens larger than standard", "next player calls", "Hero holds a dominated offsuit broadway near the bottom of the candidate region"],
        cue: "Strong source ranges and multiway risk against a dominated offsuit broadway.",
        question: "Which conclusion is most robust?",
        actions: ["Fold", "Call for the chance to make top pair", "Squeeze solely because one high card is a blocker"],
        reasons: ["Domination and poor realisation against strong ranges outweigh the superficial appeal of a high-card hand", "Every offsuit broadway must always fold multiway", "One blocker creates enough fold equity by itself"],
        explanation: "The fold comes from range shape and domination after Villain continues, not from the hand label alone.",
      },
      "pre-04": {
        assumptions: ["100bb", "wide late-position open", "wide call", "Hero SB", "hand is already a mixed polar 3-bet candidate in the baseline", "passive BB"],
        cue: "The field enters too widely and Hero already has a baseline mixed 3-bet candidate.",
        question: "What is the disciplined way to expand the squeeze?",
        actions: ["Use the existing mixed candidate more often", "Add any suited hands that look playable", "Remove all bluffs and 3-bet premiums only"],
        reasons: ["The exploit increases an already justified branch with fold equity and playability instead of inventing a new range region", "Suitedness guarantees profitable postflop play when called", "Wide entering ranges always mean opponents never fold to a 3-bet"],
        explanation: "The source explicitly supports purifying existing mixes: use good candidates more often rather than inventing random bluffs.",
      },
      "pre-05": {
        assumptions: ["compare a shorter effective stack with a deeper effective stack", "same positions", "no special opponent read"],
        cue: "The same preflop situation becomes much shorter in effective depth.",
        question: "Which directional shift is most reliable?",
        actions: ["More direct linear 3-betting and less value in speculative calls", "More protected deep calls and fewer 3-bets", "Depth should not change the preflop branch"],
        reasons: ["At lower future SPR, strong high cards and pairs realise value more directly while speculative implied odds shrink", "Short stacks increase the implied odds of suited connectors", "Effective depth matters only after the flop"],
        explanation: "This is a directional shift, not an exact chart: shorter stacks reduce the room for speculative calls and increase the value of direct aggression.",
      },
    },
    cards: {
      "pre-card-seq": ["Five preflop checks before acting?", "Positions and price → ranges → players behind → call quality → purpose of the 3-bet."],
      "pre-card-flat": ["When should a call survive the temptation to gain initiative?", "When price, position, depth and low squeeze risk give the call independent value."],
      "pre-card-polar": ["What does a polar 3-bet bluff need?", "Real folds, useful blockers/equity and a reason not to choose a better call."],
    },
  },
  blinds: {
    title: "Blind source and range identity",
    shortTitle: "SB versus BB",
    description: "The same hand and board change value when price, action order and the source range change.",
    scope: "Directional blind-defence logic. Exact calls and 3-bets depend on open size, rake, depth and the actual pool.",
    plainGoal: "Keep SB and BB defence separate and understand when closing the action makes a call materially better.",
    tableCue: "Which blind → price → who can still act → equity realisation.",
    technicalTerm: "Closing the action, source range and equity realisation.",
    theory: [
      "The BB has already invested a full blind and often closes the preflop action. Some calls can therefore beat folding even when their absolute result is negative: compare the call with the loss from surrendering the blind.",
      "The SB gets a smaller discount, remains out of position and does not close the action. The BB can squeeze and deny the passive caller all equity.",
      "SB and BB reach the same flop with different range shapes. Do not copy one c-bet plan automatically against both blind callers.",
      "A reliable player read can widen or tighten the source range, but it does not erase action order or price.",
    ],
    heuristics: [
      "Name the blind and the price before focusing on your two cards.",
      "From the BB, ask whether you close the action and can realise enough equity.",
      "From the SB, price the BB squeeze risk and out-of-position cost before calling.",
    ],
    decisionTree: [
      "Is Hero in the SB or BB?",
      "What is the continuing price after the blind already posted?",
      "Does Hero close the action, or can someone still raise?",
      "How does this source range interact with the opener's range?",
      "Can the hand realise enough equity after position, rake and future decisions are included?",
    ],
    workedExample: {
      situation: "CO opens. The same dry A-high flop is reached once against a BB call and once against an SB call.",
      steps: [
        "The BB usually arrives wider because of price and closing action.",
        "The SB calling range often starts more condensed because it paid a worse price, stayed out of position and did not close the action.",
        "The same board therefore does not imply the same automatic folds or the same c-bet plan.",
      ],
      answer: "Reconstruct where Villain's range came from before choosing the c-bet strategy.",
    },
    counterexample: "If a specific SB has repeatedly shown very wide calls, the practical range can move closer to a wide BB profile. Hero still has to remember that the SB did not close the action and paid the positional cost.",
    lab: {
      title: "SB versus BB",
      description: "One opening range, but different price and action order.",
      leftTitle: "BB",
      leftText: "Better price and often closes the action, so a wider calling region can survive.",
      rightTitle: "SB",
      rightText: "Worse price, out of position and a BB still behind make passive calling structurally more expensive.",
    },
    explainBackPrompt: "Explain why the same two cards can be a reasonable BB call and a poor passive SB call.",
    tableCard: ["SB or BB?", "Continuing price", "Does the action close?", "Who is behind?", "Equity realisation"],
    glossary: [
      { term: "Closing the action", meaning: "After your decision, nobody can make another preflop raise in that branch." },
      { term: "Condensed range", meaning: "A range concentrated around medium-strength hands with fewer extreme strong and weak holdings." },
      { term: "Equity realisation", meaning: "How effectively a hand converts raw equity into actual result through future decisions." },
    ],
    drills: {
      "bli-01": {
        assumptions: ["CO opens 3bb", "same dry A-high flop", "one branch is a BB call and the other an SB call"],
        cue: "The same board against two different blind-calling ranges.",
        question: "Can the same c-bet plan be used automatically?",
        actions: ["No; reconstruct the different source ranges first", "Yes; the board is identical", "Yes; both Villains started in the blinds"],
        reasons: ["Price and action order create different SB and BB calling shapes before the flop", "Preflop position stops mattering once the flop is dealt", "All blind-calling ranges become identical after a call"],
        explanation: "The board is interpreted through the range that reached it. SB and BB calls are usually formed under different constraints.",
      },
      "bli-02": {
        assumptions: ["open plus call", "Hero BB", "hand has adequate playability", "Hero closes the action"],
        cue: "Hero gets a good BB price and nobody can raise after Hero's decision.",
        question: "What should be compared before auto-squeezing?",
        actions: ["The EV of calling versus folding and 3-betting", "Only the desire to gain initiative", "Only the absolute chance of winning the pot"],
        reasons: ["The posted blind, price and closing action can make calling the best realisation even without range domination", "Initiative is always worth more than a good price", "A call is profitable only if it wins most pots"],
        explanation: "The BB defends because price and closing action lower the required realisable equity relative to folding, not because the hand must be intrinsically strong.",
      },
      "bli-03": {
        assumptions: ["open plus call", "Hero SB considers a passive call", "BB has not acted"],
        cue: "Hero sees an attractive SB price, but the BB is still behind.",
        question: "Which risk cannot be ignored?",
        actions: ["The BB can squeeze and deny the call's realisation", "Only the chance of facing an awkward flop", "There is no risk when the hand is suited"],
        reasons: ["The SB does not close the action and can still face another large raise after calling", "The SB gets the same price structure as the BB", "Suitedness neutralises position and the player behind"],
        explanation: "A passive SB call must include squeeze probability rather than being treated as a guaranteed ticket to the flop.",
      },
      "bli-04": {
        assumptions: ["deep pot", "Hero out of position", "hand has decent raw equity but difficult future decisions"],
        cue: "The hand looks playable preflop, but Hero will act first on most later streets.",
        question: "Which question matters more than visual hand appeal?",
        actions: ["How much equity the hand can actually realise", "How attractive the hand looks in a preflop grid", "Whether a raise can remove every difficult turn forever"],
        reasons: ["Position, domination and future betting can create a large gap between raw equity and realised result", "Playing out of position always means folding", "Initiative fully compensates for position"],
        explanation: "Equity realisation is not comfort. It is the ability to navigate future decisions without systematically surrendering value.",
      },
      "bli-05": {
        assumptions: ["several relevant observations", "SB repeatedly shows wider calls than the baseline", "table structure is otherwise unchanged"],
        cue: "The actual SB player is reliably calling wider than expected.",
        question: "How should the model update?",
        actions: ["Widen the source range while keeping price and action order in the analysis", "Treat SB and BB as the same position", "Ignore the observations and keep the theoretical range forever"],
        reasons: ["The read changes range composition but not the fact that SB paid a worse price and did not close the action", "One wide range makes the positions strategically identical", "Theory should never update from field evidence"],
        explanation: "The observation updates the source range. Structural properties of the position remain part of the node.",
      },
    },
    cards: {
      "bli-card-source": ["First question on the same board versus SB and BB?", "Which preflop source range reached this board?"],
      "bli-card-close": ["What especially helps a BB call?", "The price of the posted blind and the chance to close the preflop action."],
      "bli-card-sb": ["Why is a passive SB call usually more expensive than a BB call?", "Worse price, out of position, and a BB who can still raise."],
    },
  },
  aggression: {
    title: "Aggression and defence in 3-bet pots",
    shortTitle: "After the 3-bet",
    description: "Preflop range composition determines how much postflop aggression the range can honestly support.",
    scope: "Mechanism-level 3-bet-pot strategy without exact solver frequencies. Specific boards, sizes and thresholds require claim-driven visual review.",
    plainGoal: "Recognise when the 3-bettor can bet frequently and when the range has to slow down.",
    tableCue: "3-bet range shape → board ownership → size → what the call filtered out.",
    technicalTerm: "Range compensation, high-frequency small betting, selective polar betting and the OOP raise gate.",
    theory: [
      "A preflop adjustment does not end preflop. If a player 3-bets much wider than normal, the flop range contains more weak material and must compensate with more checks.",
      "If the over-wide 3-bettor keeps using the flop frequency of a stronger baseline range, two errors are combined: entering too wide and failing to reduce aggression. The defender can continue materially wider.",
      "A normal strong 3-bet range on dry high-card or paired boards often retains a dense premium-pair and strong-high-card advantage. A frequent small bet can then be natural. Coordinated middling boards remove that licence and require a more selective split.",
      "After a high-frequency flop bet gets called, the ranges change asymmetrically: the defender already folded the weakest hands while the bettor still carried all original flop air. Do not copy the range bet mechanically onto the turn.",
      "For an OOP raise in a 3-bet pot, establish a genuine top-end value region first. At low SPR, jams are built around thick value, the best bluffs and selected hybrids; equity denial alone does not justify shoving the middle of the range.",
    ],
    heuristics: [
      "Reconstruct the preflop 3-bet range first: normal, too tight or too wide.",
      "Ask whether the flop preserves the 3-bettor's premium advantage or equalises the ranges.",
      "After a call, re-filter both ranges before choosing the next bet.",
    ],
    decisionTree: [
      "How was the 3-bet range built: baseline, too tight or too wide?",
      "Which strong hands and which weak material actually reached the flop?",
      "Does the board preserve that advantage or give the defender more strong and nutted hands?",
      "Do bet frequency and size match the actual range shape?",
      "After a call, rebuild the ranges; for an OOP raise, separately verify top-end value and credible bluff candidates.",
    ],
    workedExample: {
      situation: "BB 3-bets BTN clearly wider than normal, then uses a small bet on a dry flop with almost the whole range as if the preflop adjustment never happened.",
      steps: [
        "The extra preflop combos added weak material to BB's range.",
        "That weaker range should compensate by checking more often.",
        "If BB keeps the normal high c-bet frequency anyway, BTN can defend wider and then identify whether Villain gives up or keeps over-bluffing on later streets.",
      ],
      answer: "Do not defend as if you faced the normal strong 3-bet range. First test whether Villain compensated for the extra preflop width.",
    },
    counterexample: "A wide flop betting frequency is not automatically a mistake. A normal premium-dense 3-bet range on a dry high-card or paired board can honestly support a frequent small bet. The error appears when the range and betting frequency no longer match.",
    lab: {
      title: "Baseline versus over-wide 3-bet",
      description: "The same c-bet button means different things when the preflop range has a different shape.",
      leftTitle: "Baseline 3-bet",
      leftText: "More premiums and less dust: a frequent small bet can be robust on the right dry board.",
      rightTitle: "Over-wide 3-bet",
      rightText: "More weak hands: the range must check more; without compensation the same c-bet frequency becomes over-bluffed.",
    },
    explainBackPrompt: "Explain why an over-wide preflop 3-bet must change postflop frequencies, and why a flop range bet does not carry automatically to the turn after a call.",
    tableCard: ["3-bet range shape", "Who owns the board?", "Frequency and size", "What did the call filter?", "Is there top-end value for an OOP raise?"],
    glossary: [
      { term: "Range compensation", meaning: "A postflop frequency change required because the preflop range became wider or tighter than normal." },
      { term: "Selective bet", meaning: "Bet only a chosen part of the range — strong value plus suitable bluffs — rather than betting almost everything." },
      { term: "Top-end value", meaning: "Hands strong enough to make an aggressive branch credible and protected." },
    ],
    drills: {
      "agg-01": {
        assumptions: ["BB 3-bets BTN materially wider than baseline", "dry flop", "BB still small-bets almost the whole range"],
        cue: "Villain added many weak hands preflop but did not add the required flop checks.",
        question: "What matters most for BTN?",
        actions: ["Defend wider against the uncompensated c-bet frequency", "Defend tighter because the 3-bettor is always stronger", "Ignore preflop width and look only at bet size"],
        reasons: ["The extra weak material makes the old betting frequency over-bluffed unless Villain compensates with more checks", "Every 3-bet range keeps the same strength after it widens", "A small size fully determines the range composition"],
        explanation: "The postflop exploit follows from preflop composition. A wider range cannot use a stronger range's frequencies for free.",
      },
      "agg-02": {
        assumptions: ["normal strong 3-bet range", "dry high-card or paired flop", "premium pairs and strong high cards remain denser for the 3-bettor"],
        cue: "The board adds few new nutted hands to the defender and preserves the preflop premium advantage.",
        question: "Which plan is a reasonable candidate?",
        actions: ["Frequent small betting", "Automatic range check", "Only a large polar overbet"],
        reasons: ["The range advantage survived and the small size can serve medium value and protection hands as well as strong hands", "Position always prevents frequent betting in 3-bet pots", "High frequency always requires the largest size"],
        explanation: "This is directional, not an exact solver frequency: a dry board can preserve enough premium advantage for a frequent small bet to be natural.",
      },
      "agg-03": {
        assumptions: ["normal 3-bet range", "coordinated middling flop", "both ranges contain meaningful strong and nutted holdings"],
        cue: "The board has equalised the ranges much more than a dry A-high or paired flop.",
        question: "What happens to the automatic high-frequency bet?",
        actions: ["It gives way to a more selective bet/check split", "It becomes even more frequent because Hero was the preflop 3-bettor", "Hero must always check and never bet"],
        reasons: ["When nut and range advantage shrink, value and bluffs must be selected more carefully while medium strength moves toward checks", "Preflop aggressor status automatically owns every board", "A coordinated board always belongs entirely to the caller"],
        explanation: "High cards and preflop initiative do not provide a permanent c-bet licence. Re-evaluate how the actual ranges hit the board.",
      },
      "agg-04": {
        assumptions: ["flop uses a frequent small bet", "defender calls", "turn creates no new extreme range advantage"],
        cue: "The flop was bet almost range, but the defender's weakest hands have already folded.",
        question: "Can the range bet be copied automatically to the turn?",
        actions: ["No; re-filter both ranges and become more selective", "Yes; a flop range bet implies a turn range bet", "Yes; a call always signals weakness"],
        reasons: ["After the call the defender is stronger relative to the starting range while the bettor still carried all flop air", "One high frequency should persist on every street", "Calling removes strong hands and leaves only bluff-catchers"],
        explanation: "The flop call changes relative range strength. A frequent first bet is not a licence for an automatic second barrel.",
      },
      "agg-05": {
        assumptions: ["OOP defends in a 3-bet pot", "low SPR", "the branch contains almost no top-end value for OOP"],
        cue: "Hero wants to build a large raise or jam mainly for equity denial.",
        question: "Which gate matters most?",
        actions: ["Without enough top-end value, raising can largely disappear", "Jam the middle of the range for protection", "Raise every hand that dislikes calling"],
        reasons: ["A credible aggressive branch needs strong value; denial improves a valid candidate but does not create one from the middle of the range", "Low SPR turns every made hand into a value jam", "A bad call automatically becomes a good bluff raise"],
        explanation: "Carrot places the presence of top-end holdings before building the OOP raise range. Denial is an extra benefit, not an independent licence to jam.",
      },
    },
    cards: {
      "agg-card-value": ["First question after Villain 3-bets too wide?", "Did Villain compensate for the weaker preflop range by checking more postflop?"],
      "agg-card-job": ["When is a frequent small bet natural in a 3-bet pot?", "When the board preserves a strong premium-range advantage and the small size fits a wide betting range."],
      "agg-card-scary": ["What changes after a range bet gets called?", "The defender is already filtered and stronger; the turn must be rebuilt rather than copied."],
    },
  },
};

function replaceStrings(target: string[], source: string[]) {
  target.splice(0, target.length, ...source);
}

function applyDrill(target: Drill, source: DrillCopy) {
  target.assumptions = [...source.assumptions];
  target.cue = source.cue;
  target.question = source.question;
  target.actionOptions.forEach((option, index) => { option.text = source.actions[index]; });
  target.reasonOptions.forEach((option, index) => { option.text = source.reasons[index]; });
  target.explanation = source.explanation;
}

function applyModuleCopy(moduleId: PriorityModuleId, source: ModuleCopy) {
  const target = moduleById[moduleId];
  Object.assign(target, {
    title: source.title,
    shortTitle: source.shortTitle,
    description: source.description,
    scope: source.scope,
    plainGoal: source.plainGoal,
    tableCue: source.tableCue,
    technicalTerm: source.technicalTerm,
    counterexample: source.counterexample,
    explainBackPrompt: source.explainBackPrompt,
  });
  replaceStrings(target.theory, source.theory);
  replaceStrings(target.heuristics, source.heuristics);
  replaceStrings(target.decisionTree, source.decisionTree);
  target.workedExample.situation = source.workedExample.situation;
  replaceStrings(target.workedExample.steps, source.workedExample.steps);
  target.workedExample.answer = source.workedExample.answer;
  if (target.lab.type !== "compare") throw new Error(`${moduleId}: Wave 3 gold expects compare lab`);
  Object.assign(target.lab, source.lab);
  replaceStrings(target.tableCard, source.tableCard);
  target.glossary.splice(0, target.glossary.length, ...source.glossary.map((item) => ({ ...item })));
  for (const drill of target.drills) {
    const copy = source.drills[drill.id];
    if (!copy) throw new Error(`${moduleId}: missing gold drill ${drill.id}`);
    applyDrill(drill, copy);
  }
  for (const card of target.flashcards) {
    const copy = source.cards[card.id];
    if (!copy) throw new Error(`${moduleId}: missing gold card ${card.id}`);
    [card.front, card.back] = copy;
  }
}

export const wave3PriorityModuleIds = ["preflop", "blinds", "aggression"] as const satisfies readonly ModuleId[];

export function applyWave3PriorityLocale(locale: LocaleCode) {
  const source = locale === "ru" ? RU_PRIORITY : EN_PRIORITY;
  for (const moduleId of wave3PriorityModuleIds) applyModuleCopy(moduleId, source[moduleId]);
}
