import { readFile, writeFile } from "node:fs/promises";

const path = new URL("../lib/model.ts", import.meta.url);
let source = await readFile(path, "utf8");
if (source.includes("runId: string | null;")) {
  console.log("Diagnostic run ID already materialized.");
  process.exit(0);
}

function replaceOnce(from, to, label) {
  if (!source.includes(from)) throw new Error(`Diagnostic run-ID target missing: ${label}`);
  source = source.replace(from, to);
}

replaceOnce(
  "  localeAtStart: LocaleCode | null;\n};",
  "  localeAtStart: LocaleCode | null;\n  runId: string | null;\n};",
  "DiagnosticState contract",
);
replaceOnce(
  "    localeAtStart: null,\n  };",
  "    localeAtStart: null,\n    runId: null,\n  };",
  "empty diagnostic",
);
replaceOnce(
  "    localeAtStart: locale,\n  };",
  "    localeAtStart: locale,\n    runId: id(\"t1\"),\n  };",
  "diagnostic start",
);
replaceOnce(
  "    localeAtStart: primary.localeAtStart ?? secondary.localeAtStart,\n  };",
  "    localeAtStart: primary.localeAtStart ?? secondary.localeAtStart,\n    runId: primary.runId ?? secondary.runId,\n  };",
  "diagnostic merge",
);
replaceOnce(
  "    localeAtStart: isLocale(raw.localeAtStart) ? raw.localeAtStart : null,\n  };",
  "    localeAtStart: isLocale(raw.localeAtStart) ? raw.localeAtStart : null,\n    runId: typeof raw.runId === \"string\" && raw.runId.trim() ? raw.runId : null,\n  };",
  "diagnostic migration",
);
replaceOnce(
  "  if (!(diagnostic.localeAtStart === null || isLocale(diagnostic.localeAtStart))) return false;\n  return true;",
  "  if (!(diagnostic.localeAtStart === null || isLocale(diagnostic.localeAtStart))) return false;\n  if (!(diagnostic.runId === null || (typeof diagnostic.runId === \"string\" && diagnostic.runId.trim().length > 0))) return false;\n  return true;",
  "diagnostic validation",
);

await writeFile(path, source, "utf8");
console.log("Added immutable diagnostic run identity to learner state and migration.");
