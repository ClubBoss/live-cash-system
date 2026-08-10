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

export function selectLessonDrillIds(module: RetrievalModule): string[] {
  const core = module.drills.find((drill) => drill.kind === "core") ?? module.drills[0];
  if (!core) return [];

  const override = LESSON_APPLICATION_OVERRIDES[module.id];
  if (override && override.every((drillId) => hasDrill(module, drillId))) {
    return [core.id, ...override];
  }

  const applications = module.drills
    .filter((drill) => drill.kind === "changed" || drill.kind === "boundary")
    .filter((drill) => drill.id !== core.id)
    .slice(0, 2);

  return [core.id, ...applications.map((drill) => drill.id)];
}

export function applyLessonIntegrityOrdering(modules: RetrievalModule[]): void {
  for (const module of modules) {
    const desired = selectLessonDrillIds(module);
    if (desired.length < 3 || !LESSON_APPLICATION_OVERRIDES[module.id]) continue;
    const rank = new Map(desired.map((drillId, index) => [drillId, index]));
    module.drills.sort((left, right) => {
      const leftRank = rank.get(left.id);
      const rightRank = rank.get(right.id);
      if (leftRank !== undefined || rightRank !== undefined) {
        return (leftRank ?? Number.MAX_SAFE_INTEGER) - (rightRank ?? Number.MAX_SAFE_INTEGER);
      }
      return 0;
    });
  }
}
