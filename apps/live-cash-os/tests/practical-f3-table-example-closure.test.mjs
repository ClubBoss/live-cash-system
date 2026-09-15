import test from "node:test";
import assert from "node:assert/strict";

import { practicalSourceBoundTeachingAssetBySkillId } from "../content/practical-mastery/post-quick-start-teaching-assets.ts";
import { practicalPostQuickStartTeachingAssetForSkill } from "../lib/practical-post-quick-start-learning.ts";

const EXPECTED = {
  "OOP-04": [/2\/5/u, /BTN/u, /BB/u, /A♠7♦2♣/u, /\$15/u, /\$10/u, /Прогноз до ответа:/u],
  "DEEP-01": [/2\/5/u, /200bb/u, /\$1,000/u, /\$120/u, /IP → OOP/u, /Прогноз до ответа:/u],
  "RIV-01": [/2\/5/u, /ривере/u, /\$300/u, /A♠Q♣/u, /\$90/u, /\$240/u, /Прогноз до ответа:/u],
};

test("F3 examples are concrete table-ready contrasts and resolve through the canonical source-bound assets", () => {
  for (const [skillId, patterns] of Object.entries(EXPECTED)) {
    const canonical = practicalSourceBoundTeachingAssetBySkillId.get(skillId);
    assert.ok(canonical, `${skillId}: canonical source-bound asset missing`);

    const resolved = practicalPostQuickStartTeachingAssetForSkill(skillId);
    assert.ok(resolved, `${skillId}: post-QS asset missing`);
    assert.equal(resolved.kind, "SOURCE_BOUND", `${skillId}: should render the source-bound asset`);
    assert.equal(resolved.teaching, canonical, `${skillId}: resolver must return the canonical asset object`);

    assert.match(canonical.exampleRu, /^Контраст:/u, `${skillId}: worked contrast label missing`);
    for (const pattern of patterns) assert.match(canonical.exampleRu, pattern, `${skillId}: ${pattern}`);
    assert.ok(canonical.sourceRefs.length > 0, `${skillId}: source refs must remain intact`);
  }
});
