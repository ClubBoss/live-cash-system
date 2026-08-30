import test from "node:test";
import assert from "node:assert/strict";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";

// Guards the exact composed-RU hybrid-composition defect fixed in the P2
// closure: the English words "fringe" and "rake" surviving untranslated in a
// Russian-labeled learner-facing field, despite this corpus having an
// established Russian rendering for both concepts (пограничный/маргинальный,
// рейк) used dozens of times elsewhere for the identical meaning. Scoped to
// the five confirmed items this closure repaired, not a corpus-wide scan --
// a blanket ban on the words "fringe"/"rake" would false-positive on the many
// other pre-existing occurrences of this same pervasive corpus style that are
// tracked separately as a follow-up repair wave, not fixed here.
const GUARDED_FIELDS = [
  { id: "PM-BL-01-103", field: "cueRu" },
  { id: "PM-BL-01-105", field: "questionRu" },
  { id: "PM-BL-01-106", field: "questionRu" },
  { id: "PM-BL-02-105", field: "questionRu" },
  { id: "PM-BL-04-103", field: "questionRu" },
];

const BARE_ENGLISH_RE = /\b(fringe|rake)\b/iu;

test("repaired BL-01/02/04 RU learner surfaces stay natural Russian and do not regress to bare English", () => {
  for (const { id, field } of GUARDED_FIELDS) {
    const decision = practicalDecisionById.get(id);
    assert.ok(decision, `missing decision ${id}`);
    const text = decision[field];
    assert.doesNotMatch(
      text,
      BARE_ENGLISH_RE,
      `${id}.${field} regressed to an untranslated "fringe"/"rake": "${text}"`,
    );
    assert.match(text, /[А-Яа-яЁё]/u, `${id}.${field} must remain a Russian sentence: "${text}"`);
  }
});
