import type { DiagnosticItem } from "../diagnostic";
import { diagnosticT1 as source } from "../diagnostic";
import type { Locale } from "./ui";

const ru: DiagnosticItem[] = [
  { id: "LD-001", title: "Глубина при страддле", targetSeconds: 30, prompt: "Игра $2/$5/$10 с обязательным страддлом. У Hero и единственного важного соперника по $1,400. В какой единице ты сначала опишешь эффективную глубину и почему? Отдельно укажи обычные большие блайнды." },
  { id: "LD-002", title: "Эффективные стеки в мультивее", targetSeconds: 25, prompt: "Игра $1/$3. У Hero $900, у соперника A $270, у соперника B $1,200. Каков эффективный стек Hero против каждого? Можно ли описать весь банк одной цифрой?" },
  { id: "LD-003", title: "Чем отличаются диапазоны SB и BB", targetSeconds: 35, prompt: "CO открывает 3bb. В одном случае флоп A-7-2 радугой сыгран против защиты BB, в другом — против холодного колла SB. Чей диапазон обычно плотнее и можно ли автоматически использовать один и тот же план продолженной ставки?" },
  { id: "LD-004", title: "Защита против сильного 3-бета", targetSeconds: 40, prompt: "150bb. HJ открывает 3bb, BTN 3-бетит до 12bb. Надёжная выборка показывает почти только премиальные руки, сильные бродвеи и мало одномастных блефов. Какие руки первыми теряют ценность в защите: доминируемые разномастные старшие карты или лучшие одномастные коннекторы? Объясни без точной клетки чарта." },
  { id: "LD-005", title: "Компенсация слишком широкого 3-бета", targetSeconds: 45, prompt: "CO коллирует 3-бет BTN. BTN 3-бетит заметно шире нормы, но на Q-7-4 радугой ставит 25% почти всем диапазоном. Что нужно проверить и куда в целом сдвигается защита без позиции, если BTN не компенсирует лишний префлоп-воздух дополнительными чеками?" },
  { id: "LD-006", title: "Уязвимая пара против маленькой широкой ставки", targetSeconds: 50, prompt: "BTN против BB, 200bb. Флоп T-5-5 радугой. BTN ставит 25% почти всем диапазоном. Сравни T6s и KTs у BB: у какой топ-пары больше причин для рейза и почему? Точная частота не нужна." },
  { id: "LD-007", title: "Та же доска против крупной выборочной ставки", targetSeconds: 35, prompt: "Та же ситуация BTN против BB, 200bb, T-5-5 радугой, но BTN ставит 80% выборочным полярным диапазоном. Что происходит с тонкими защитными рейзами T6s по сравнению с маленькой ставкой 25% почти всем диапазоном?" },
  { id: "LD-008", title: "Глубокий колл без позиции", targetSeconds: 50, prompt: "BTN против BB, 200bb. Флоп 8-7-6 с флеш-дро. BTN ставит 75% банка. У BB TT. Нужно ли автоматически чек-рейзить, чтобы не играть сложные тёрны, или важная часть функции руки — защищать чек-колл? Почему?" },
  { id: "LD-009", title: "Защита между двумя диапазонами", targetSeconds: 45, prompt: "HJ открывает, BTN коллирует, BB коллирует. Флоп K-9-7 с флеш-дро. HJ ставит, Hero на BTN с KQ, за ним остаётся BB с сильным диапазоном продолжения. Должен ли Hero защищаться как один на один и нести всю минимальную частоту защиты? Назови главный вопрос перед коллом или рейзом." },
  { id: "LD-010", title: "Блокер на ривере и происхождение блефов", targetSeconds: 55, prompt: "На ривере у Hero блокер на натсовый флеш, и он получает пуш после линии ставка–колл на флопе и овербет–колл на тёрне. Надёжных данных по этой ветке нет. Какие проверки идут до оценки блокера и какой ответ допустим, если реальных блефов не удаётся обосновать?" },
];

const en: DiagnosticItem[] = [
  { id: "LD-001", title: "Straddle denominator", targetSeconds: 30, prompt: "The game is $2/$5/$10 with a mandatory live straddle. Hero and the only relevant opponent each have $1,400. Which unit should describe the effective depth first, and why? Also give the depth in ordinary big blinds." },
  { id: "LD-002", title: "Pairwise multiway depth", targetSeconds: 25, prompt: "The game is $1/$3. Hero has $900, Villain A has $270, and Villain B has $1,200. What is Hero's effective stack against each opponent? Can the whole pot be described by one number?" },
  { id: "LD-003", title: "Blind range identity", targetSeconds: 35, prompt: "CO opens to 3bb. In one hand the flop is A-7-2 rainbow against a BB defend; in another it is against an SB cold-call. Which caller is usually more condensed, and can you automatically use the same c-bet plan?" },
  { id: "LD-004", title: "Defending against a value-heavy 3-bet", targetSeconds: 40, prompt: "150bb. HJ opens to 3bb and BTN 3-bets to 12bb. A reliable sample shows mostly premiums and strong broadways with few suited bluffs. Which family loses value first when defending: dominated offsuit high cards or the best suited connectors? Explain without naming an exact chart cell." },
  { id: "LD-005", title: "Compensating for an over-wide 3-bet", targetSeconds: 45, prompt: "CO calls a BTN 3-bet. BTN 3-bets clearly too wide, then bets 25% on Q-7-4 rainbow with almost the whole range. What compensation test is needed, and how should OOP defence shift if BTN does not compensate for the extra preflop air with additional checks?" },
  { id: "LD-006", title: "Vulnerable pair versus a small wide bet", targetSeconds: 50, prompt: "BTN versus BB, 200bb. The flop is T-5-5 rainbow and BTN bets 25% with almost the whole range. Compare T6s and KTs for BB: which top-pair family has more incentive to raise, and why? No exact frequency is required." },
  { id: "LD-007", title: "Large selective changed spot", targetSeconds: 35, prompt: "Same BTN-versus-BB spot, 200bb, T-5-5 rainbow, but BTN bets 80% with a selective polar range. What happens to the thin protection-raise branch of T6s compared with the previous 25% near-range bet?" },
  { id: "LD-008", title: "Deep OOP protected call", targetSeconds: 50, prompt: "BTN versus BB, 200bb. The flop is 8-7-6 two-tone and BTN bets 75% pot. BB holds TT. Must the hand automatically check-raise to avoid difficult turns, or is protecting the check-call range an important part of its job? Why?" },
  { id: "LD-009", title: "Sandwich and shared defence", targetSeconds: 45, prompt: "HJ opens, BTN calls, and BB calls. The flop is K-9-7 two-tone. HJ bets, Hero is on BTN with KQ, and BB remains behind with an uncapped continuing range. Should Hero defend as if heads-up and carry the full MDF? Name the main gate before calling or raising." },
  { id: "LD-010", title: "River blocker and bluff ancestry", targetSeconds: 55, prompt: "On the river Hero holds the nut-flush blocker and faces a jam after bet-call on the flop and overbet-call on the turn. There is no reliable population evidence for this branch. What must be checked before the blocker, and which answer is valid if the bluff supply cannot be justified?" },
];

export function getDiagnostic(locale: Locale): DiagnosticItem[] {
  const selected = locale === "ru" ? ru : en;
  if (selected.length !== source.length || selected.some((item, index) => item.id !== source[index].id)) throw new Error("Diagnostic locale parity failed");
  return selected;
}
