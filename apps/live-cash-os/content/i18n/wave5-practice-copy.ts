import { moduleById } from "../modules";
import type { LocaleCode } from "../../lib/model";

const FILTER_CARD_ID = "fil-card-blocker";

export function applyWave5PracticeCopy(locale: LocaleCode) {
  const card = moduleById.filtering.flashcards.find((item) => item.id === FILTER_CARD_ID);
  if (!card) throw new Error(`Missing Wave 5 card ${FILTER_CARD_ID}`);
  card.front = locale === "ru"
    ? "Что восстановить перед оценкой блокера на новой улице?"
    : "What should be rebuilt before judging a blocker on a new street?";
}
