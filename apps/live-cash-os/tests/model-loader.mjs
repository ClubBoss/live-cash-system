import { readFile } from "node:fs/promises";
import ts from "typescript";

const CORE_URL = new URL("../lib/model-core.ts", import.meta.url).href;
const RELIABILITY_URL = new URL("../lib/reliability.ts", import.meta.url).href;
const CLOUD_SYNC_CONTRACT_URL = new URL("../lib/cloud-sync-contract.ts", import.meta.url).href;
const TRANSPILED_URLS = new Set([CORE_URL, RELIABILITY_URL, CLOUD_SYNC_CONTRACT_URL]);

export async function resolve(specifier, context, nextResolve) {
  if (context.parentURL?.includes("live-cash-os-test-")) {
    if (specifier === "./model-core") return { url: CORE_URL, shortCircuit: true };
    if (specifier === "./reliability") return { url: RELIABILITY_URL, shortCircuit: true };
    if (specifier === "./cloud-sync-contract") return { url: CLOUD_SYNC_CONTRACT_URL, shortCircuit: true };
  }
  if (context.parentURL === CLOUD_SYNC_CONTRACT_URL && specifier === "./reliability") {
    return { url: RELIABILITY_URL, shortCircuit: true };
  }
  if ((context.parentURL === RELIABILITY_URL || context.parentURL === CLOUD_SYNC_CONTRACT_URL) && specifier === "./model-core") {
    return { url: CORE_URL, shortCircuit: true };
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
