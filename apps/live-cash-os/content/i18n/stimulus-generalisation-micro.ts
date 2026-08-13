import { moduleById } from "../modules";
import type { Flashcard } from "../types";
import type { LocaleCode } from "../../lib/model";

const CARD_IDS = ["pre-card-family-87s", "pre-card-family-a4s"] as const;

const COPY: Record<LocaleCode, readonly Flashcard[]> = {
  ru: [
    { id: "pre-card-family-87s", moduleId: "preflop", kind: "procedure", front: "87s: назови семейство и 1–2 структурных свойства до выбора линии.", back: "Мастевая связка (suited connector): карты одной масти и соседних рангов — масть и связность дают потенциал сильных дро при скромной силе старших карт. Семейство описывает свойства руки, но не предписывает колл, 3-бет или фолд." },
    { id: "pre-card-family-a4s", moduleId: "preflop", kind: "boundary", front: "A4s: назови семейство и 1–2 структурных свойства до выбора линии.", back: "Мастевой туз колеса: туз-блокер, потенциал натсового флеша и связность к нижнему стриту. Семейство и ценность блокера описывают свойства, но сами по себе не создают автоматический блеф, 3-бет или другое действие." },
  ],
  en: [
    { id: "pre-card-family-87s", moduleId: "preflop", kind: "procedure", front: "87s: name the hand family and 1–2 structural traits before choosing a line.", back: "Suited connector: same-suit adjacent ranks; suitedness and connectivity create strong-draw potential despite modest high-card strength. The family describes the hand's properties but does not prescribe a call, 3-bet or fold." },
    { id: "pre-card-family-a4s", moduleId: "preflop", kind: "boundary", front: "A4s: name the hand family and 1–2 structural traits before choosing a line.", back: "Suited wheel ace: ace blocker, nut-flush potential and wheel connectivity. The family and blocker value describe properties; neither creates an automatic bluff, 3-bet or other action." },
  ],
};

export function applyStimulusGeneralisationMicro(locale: LocaleCode) {
  const preflop = moduleById.preflop;
  const ids = new Set<string>(CARD_IDS);
  preflop.flashcards = preflop.flashcards.filter((card) => !ids.has(card.id));
  preflop.flashcards.push(...COPY[locale].map((card) => ({ ...card })));
}
