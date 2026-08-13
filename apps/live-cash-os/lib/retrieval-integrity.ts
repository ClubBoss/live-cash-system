type RetrievalDrill = {
  id: string;
  kind: string;
};

type RetrievalModule = {
  id: string;
  drills: RetrievalDrill[];
};

const LESSON_APPLICATION_OVERRIDES: Record<string, readonly [string, string]> = {
  geometry: ["geo-05", "geo-02"],
  blinds: ["bli-02", "bli-04"],
  shape: ["sha-02", "sha-05"],
};

function hasDrill(module: RetrievalModule, drillId: string): boolean {
  return module.drills.some((drill) => drill.id === drillId);
}

export function selectLessonDrillIds(module: RetrievalModule, excludedDrillIds: readonly string[] = []): string[] {
  const excluded = new Set(excludedDrillIds);
  const eligible = module.drills.filter((drill) => !excluded.has(drill.id));
  const core = eligible.find((drill) => drill.kind === "core") ?? eligible[0];
  if (!core) return [];

  const candidates: RetrievalDrill[] = [];
  const push = (drill: RetrievalDrill | undefined) => {
    if (!drill || drill.id === core.id || candidates.some((candidate) => candidate.id === drill.id)) return;
    candidates.push(drill);
  };

  const override = LESSON_APPLICATION_OVERRIDES[module.id];
  if (override) {
    for (const drillId of override) {
      if (excluded.has(drillId) || !hasDrill(module, drillId)) continue;
      push(eligible.find((drill) => drill.id === drillId));
    }
  }

  for (const drill of eligible) {
    if (drill.kind === "changed" || drill.kind === "boundary") push(drill);
  }
  for (const drill of eligible) push(drill);

  return [core.id, ...candidates.slice(0, 2).map((drill) => drill.id)];
}
