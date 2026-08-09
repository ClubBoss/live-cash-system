import { readFile } from "node:fs/promises";
import ts from "typescript";

const CORE_URL = new URL("../lib/model-core.ts", import.meta.url).href;
const MODEL_URL = new URL("../lib/model.ts", import.meta.url).href;
const RELIABILITY_URL = new URL("../lib/reliability.ts", import.meta.url).href;
const CLOUD_SYNC_CONTRACT_URL = new URL("../lib/cloud-sync-contract.ts", import.meta.url).href;
const AUTOMATICITY_URL = new URL("../lib/automaticity.ts", import.meta.url).href;
const SCHEDULER_URL = new URL("../lib/scheduler.ts", import.meta.url).href;
const SESSION_CLARITY_URL = new URL("../lib/session-clarity.ts", import.meta.url).href;
const RUNTIME_URL = new URL("../content/i18n/runtime.ts", import.meta.url).href;
const RUNTIME_CORE_URL = new URL("../content/i18n/runtime-core.ts", import.meta.url).href;
const TRANSPILED_URLS = new Set([CORE_URL, MODEL_URL, RELIABILITY_URL, CLOUD_SYNC_CONTRACT_URL, AUTOMATICITY_URL, SCHEDULER_URL, SESSION_CLARITY_URL, RUNTIME_URL, RUNTIME_CORE_URL]);

function isTemporaryHarness(parentURL) {
  return parentURL?.includes("/tmp/live-cash-os-") || parentURL?.includes("live-cash-os-test-");
}

export async function resolve(specifier, context, nextResolve) {
  if (isTemporaryHarness(context.parentURL)) {
    if (specifier === "./model-core") return { url: CORE_URL, shortCircuit: true };
    if (specifier === "./reliability") return { url: RELIABILITY_URL, shortCircuit: true };
    if (specifier === "./cloud-sync-contract") return { url: CLOUD_SYNC_CONTRACT_URL, shortCircuit: true };
    if (specifier === "./automaticity") return { url: AUTOMATICITY_URL, shortCircuit: true };
    if (specifier === "./scheduler") return { url: SCHEDULER_URL, shortCircuit: true };
  }
  if (context.parentURL === SESSION_CLARITY_URL && specifier === "../content/i18n/runtime") {
    return { url: RUNTIME_URL, shortCircuit: true };
  }
  if (context.parentURL === RUNTIME_URL && specifier === "./runtime-core") {
    return { url: RUNTIME_CORE_URL, shortCircuit: true };
  }
  if (context.parentURL === CLOUD_SYNC_CONTRACT_URL && specifier === "./reliability") {
    return { url: RELIABILITY_URL, shortCircuit: true };
  }
  if ((context.parentURL === MODEL_URL || context.parentURL === RELIABILITY_URL || context.parentURL === CLOUD_SYNC_CONTRACT_URL || context.parentURL === AUTOMATICITY_URL || context.parentURL === SCHEDULER_URL) && specifier === "./model-core") {
    return { url: CORE_URL, shortCircuit: true };
  }
  if (context.parentURL === AUTOMATICITY_URL && specifier === "./scheduler") {
    return { url: SCHEDULER_URL, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (TRANSPILED_URLS.has(url)) {
    const source = await readFile(new URL(url), "utf8");
    const compiled = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
        importsNotUsedAsValues: ts.ImportsNotUsedAsValues.Remove,
      },
    }).outputText;
    return { format: "module", source: compiled, shortCircuit: true };
  }
  return nextLoad(url, context);
}
