import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  isPrimaryPracticalLearnerSkill,
  practicalProgressCountingSkills,
  primaryPracticalLearnerSkills,
} from "../lib/practical-learner-skill-set.ts";
import { practicalSkillCorpusCanReach } from "../lib/practical-mastery-core.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BRIDGES = ["OOP-06", "OOP-07", "IP-03", "IP-04", "IP-05", "IP-06"];
const INTEGRATION = ["INT-01", "INT-02", "INT-03", "INT-04", "INT-05"];

test("primary learner Skill Map excludes legacy bridges and integration-derived identities", () => {
  const ids = new Set(primaryPracticalLearnerSkills().map((skill) => skill.id));
  for (const skillId of [...BRIDGES, ...INTEGRATION]) {
    assert.equal(isPrimaryPracticalLearnerSkill(skillId), false, `${skillId}: must not be an ordinary learner mastery target`);
    assert.equal(ids.has(skillId), false, `${skillId}: leaked into primary learner Skill Map`);
  }
  assert.ok(ids.has("TURN-04"), "canonical turn-lead target must remain visible after hiding OOP-06 bridge");
});

test("progress denominators contain only attainable primary decision-training targets", () => {
  const skills = practicalProgressCountingSkills();
  assert.ok(skills.length > 60, `unexpectedly narrow progress set: ${skills.length}`);
  for (const skill of skills) {
    assert.equal(isPrimaryPracticalLearnerSkill(skill.id), true, `${skill.id}: denominator contains a non-primary skill`);
    assert.equal(
      practicalSkillCorpusCanReach(skill.id, "DECISION_TRAINED"),
      true,
      `${skill.id}: impossible skill must not block 100% progress`,
    );
  }

  const postflop = skills.filter((skill) => ["W4_RECOGNITION", "W5_SRP_OOP", "W6_SRP_IP", "W7_3BET"].includes(skill.wave));
  assert.equal(postflop.length, 17, "postflop denominator must exclude the six legacy later-street bridges");
  assert.equal(skills.some((skill) => skill.wave === "W14_INTEGRATED"), false, "derived W14 identities must not create an ordinary mastery denominator");
});

test("Skill Map and domain overview consume the canonical learner skill authorities", async () => {
  const [map, overview] = await Promise.all([
    readFile(path.join(root, "components/PracticalMasteryExperience.tsx"), "utf8"),
    readFile(path.join(root, "components/PracticalSkillDomainOverview.tsx"), "utf8"),
  ]);
  assert.match(map, /primaryPracticalLearnerSkills/);
  assert.match(overview, /practicalProgressCountingSkills/);
  assert.doesNotMatch(map, /filter\(\(skill\) => !isIntegrationDerivedSkill\(skill\.id\)\)/);
});
