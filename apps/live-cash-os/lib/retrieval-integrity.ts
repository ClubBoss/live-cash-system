type RetrievalDrill = {
  id: string;
  kind: string;
  nodeKey?: string;
  changedNode?: string;
};

type RetrievalModule = {
  id: string;
  drills: RetrievalDrill[];
};

const LESSON_APPLICATION_OVERRIDES: Record<string, readonly [string, string]> = {
  geometry: ["geo-05", "geo-02"],
  blinds: ["bli-02", "bli-04"],
  shallow: ["sha-02", "sha-05"],
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

function selectByPriority(
  modules: RetrievalModule[],
  seenDrillIds: ReadonlySet<string>,
  limit: number,
  unseenOnly: boolean,
): string[] {
  const selected: string[] = [];
  const selectedIds = new Set<string>();
  const selectedModules = new Set<string>();

  const predicates: Array<(drill: RetrievalDrill) => boolean> = [
    (drill) => drill.kind === "changed" && Boolean(drill.changedNode),
    (drill) => drill.kind === "changed",
    (drill) => drill.kind === "boundary",
    (drill) => drill.kind !== "core",
    (drill) => drill.kind === "core",
  ];

  const eligible = (drill: RetrievalDrill): boolean =>
    !selectedIds.has(drill.id) && (!unseenOnly || !seenDrillIds.has(drill.id));

  for (const predicate of predicates) {
    for (const module of modules) {
      if (selected.length >= limit) return selected;
      if (selectedModules.has(module.id)) continue;
      const drill = module.drills.find((candidate) => eligible(candidate) && predicate(candidate));
      if (!drill) continue;
      selected.push(drill.id);
      selectedIds.add(drill.id);
      selectedModules.add(module.id);
    }
  }

  for (const predicate of predicates) {
    for (const module of modules) {
      for (const drill of module.drills) {
        if (selected.length >= limit) return selected;
        if (!eligible(drill) || !predicate(drill)) continue;
        selected.push(drill.id);
        selectedIds.add(drill.id);
      }
    }
  }

  return selected;
}

export function selectIndependentDiagnosticDrillIds(
  modules: RetrievalModule[],
  seenDrillIds: ReadonlySet<string>,
  limit: number,
): string[] {
  if (limit <= 0) return [];

  const unseen = selectByPriority(modules, seenDrillIds, limit, true);
  if (unseen.length >= limit) return unseen;

  const selected = [...unseen];
  const selectedIds = new Set(selected);
  const fallback = selectByPriority(modules, new Set<string>(), limit, false);
  for (const drillId of fallback) {
    if (selected.length >= limit) break;
    if (selectedIds.has(drillId)) continue;
    selected.push(drillId);
    selectedIds.add(drillId);
  }
  return selected;
}
