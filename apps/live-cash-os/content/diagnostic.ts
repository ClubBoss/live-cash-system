export type DiagnosticItem = {
  id: string;
  title: string;
  prompt: string;
  targetSeconds: number;
};

export const diagnosticT1: DiagnosticItem[] = [
  { id: "LD-001", title: "Straddle denominator", targetSeconds: 30, prompt: "Игра $2/$5/$10 с обязательным live straddle. Hero и единственный релевантный соперник имеют по $1,400. Какую эффективную глубину ты используешь первой для стратегии и почему? Укажи также обычные BB." },
  { id: "LD-002", title: "Pairwise multiway depth", targetSeconds: 25, prompt: "Игра $1/$3. Hero $900, Villain A $270, Villain B $1,200. Какая эффективная глубина у Hero против каждого соперника? Можно ли описать весь банк одной цифрой?" },
  { id: "LD-003", title: "Blind source identity", targetSeconds: 35, prompt: "CO открывает 3bb. Один раз флоп A-7-2 rainbow достигнут против BB defend, второй — против SB cold-call. Какой caller обычно более condensed и можно ли автоматически использовать одинаковый c-bet plan?" },
  { id: "LD-004", title: "Value-heavy 3-bet defence", targetSeconds: 40, prompt: "150bb. HJ открывает 3bb, BTN делает 12bb. Надёжная выборка показывает почти только premiums/strong broadways и мало suited bluffs. Какая семья первой теряет ценность при защите: dominated offsuit big cards или лучшие suited connectors? Объясни без требования назвать точный chart cell." },
  { id: "LD-005", title: "Over-wide 3-bet compensation", targetSeconds: 45, prompt: "CO call против BTN 3-bet. BTN 3-бетит заметно шире нормы, но на Q-7-4 rainbow продолжает ставить 25% почти всей range. Какой compensation-test нужен и куда направленно сдвигается OOP defence, если BTN не компенсирует лишний preflop air дополнительными checks?" },
  { id: "LD-006", title: "Small-wide vulnerable pair", targetSeconds: 50, prompt: "BTN vs BB, 200bb. Flop T-5-5 rainbow. BTN ставит 25% почти всей range. Сравни T6s и KTs у BB: какая top-pair family имеет больше directional raise incentive и почему? Частота не требуется." },
  { id: "LD-007", title: "Large-selective changed node", targetSeconds: 35, prompt: "Тот же BTN vs BB, 200bb и T-5-5 rainbow, но BTN ставит 80% selective/polar range. Что происходит с thin/protection raise branch T6s по сравнению с предыдущим 25% near-range node?" },
  { id: "LD-008", title: "Deep OOP protected call", targetSeconds: 50, prompt: "BTN vs BB, 200bb. Flop 8-7-6 two-tone. BTN ставит 75% pot. У BB TT. Должна ли рука автоматически check-raise, чтобы не играть трудные turns, или значимая часть функции — защищать check-call? Почему?" },
  { id: "LD-009", title: "Sandwich shared defence", targetSeconds: 45, prompt: "HJ open, BTN call, BB call. Flop K-9-7 two-tone. HJ ставит, Hero на BTN с KQ, за ним остаётся BB с uncapped continuing range. Должен ли Hero защищаться как в heads-up и нести весь MDF? Назови главный gate перед call/raise." },
  { id: "LD-010", title: "River blocker ancestry", targetSeconds: 55, prompt: "River. Hero держит nut-flush blocker и получает jam после bet-call flop и overbet-call turn. По этой branch нет надёжной population evidence. Какие проверки идут до blocker и какой ответ допустим, если bluff supply не удаётся обосновать?" },
];
