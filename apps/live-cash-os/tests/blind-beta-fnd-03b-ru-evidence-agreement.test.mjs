import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisions, practicalAnchors } from "../content/practical-mastery";
import { sanitizeLearnerPresentationText } from "../lib/learner-presentation-firewall";

// After the learner firewall rewrites a source identifier to the plurale-tantum
// phrase "проверенные данные", the following finite verb must agree in number.
// FND-03 closed only the single observed "прямо показывает" case; FND-03b closes
// the full bounded class for every finite verb that actually follows the phrase
// in the active learner corpus.

const SINGULAR_PREDICATE = /проверенные данные(?:\s+(?:прямо|отдельно|специально|именно|сразу|особенно|явно|одновременно|также|уже|обычно)){0,3}\s+([а-яё]+)/giu;

function isThirdPersonSingularPresent(verb) {
  if (/(?:ют|ят|ат|уют)$/u.test(verb)) return false;
  return /(?:ает|яет|ует|ывает|ирует|еет|ит|ет|ёт)$/u.test(verb);
}

function corpusRuStrings() {
  const out = [];
  for (const decision of practicalDecisions) {
    out.push(decision.cueRu, decision.questionRu, decision.explanationRu, decision.whyRu);
    for (const option of decision.actionOptions) out.push(option.textRu);
    for (const option of decision.reasonOptions) out.push(option.textRu);
  }
  for (const anchor of practicalAnchors) out.push(anchor.rationaleRu, anchor.cueRu);
  return out.filter((value) => typeof value === "string" && value.length > 0);
}

test("FND-03b closes the observed evidence-predicate agreement break", () => {
  assert.equal(
    sanitizeLearnerPresentationText("FTGU-E01 прямо показывает, почему цена колла важна.", "ru"),
    "проверенные данные прямо показывают, почему цена колла важна.",
  );
  assert.equal(
    sanitizeLearnerPresentationText("FTGU-E02 требует сужать fringe при давлении позади.", "ru"),
    "проверенные данные требуют сужать fringe при давлении позади.",
  );
  assert.equal(
    sanitizeLearnerPresentationText("FTGU-E01 вводит pot odds как порог, и FTGU-E01 добавляет контекст.", "ru"),
    "проверенные данные вводят pot odds как порог, и проверенные данные добавляют контекст.",
  );
});

test("FND-03b leaves an already-plural predicate untouched", () => {
  const already = "проверенные данные требуют пересчитывать диапазон после изменений доски.";
  assert.equal(sanitizeLearnerPresentationText(already, "ru"), already);
});

test("FND-03b: no active learner string keeps a singular predicate after the firewall", () => {
  const offenders = [];
  for (const value of corpusRuStrings()) {
    if (!/FTGU|CINJ-E\d|CP-G\d+-L\d+|SLC-[A-Z]|\bE\d{2,}\b/u.test(value)) continue;
    const sanitized = sanitizeLearnerPresentationText(value, "ru");
    for (const match of sanitized.matchAll(SINGULAR_PREDICATE)) {
      const verb = match[1].toLocaleLowerCase("ru-RU");
      if (["может", "будет", "имеет"].includes(verb)) continue;
      if (isThirdPersonSingularPresent(verb)) offenders.push(`${verb} :: ${sanitized.slice(0, 90)}`);
    }
  }
  assert.deepEqual(offenders, [], `residual singular evidence predicates: ${offenders.join(" | ")}`);
});
