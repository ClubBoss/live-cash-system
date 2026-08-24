import { readFile, stat } from "node:fs/promises";
import ts from "typescript";

const APP_ROOT_URL = new URL("../", import.meta.url).href;
const CORE_URL = new URL("../lib/model-core.ts", import.meta.url).href;
const MODEL_URL = new URL("../lib/model.ts", import.meta.url).href;
const RELIABILITY_URL = new URL("../lib/reliability.ts", import.meta.url).href;
const CLOUD_SYNC_CONTRACT_URL = new URL("../lib/cloud-sync-contract.ts", import.meta.url).href;
const AUTOMATICITY_URL = new URL("../lib/automaticity.ts", import.meta.url).href;
const SCHEDULER_URL = new URL("../lib/scheduler.ts", import.meta.url).href;
const SESSION_CLARITY_URL = new URL("../lib/session-clarity.ts", import.meta.url).href;
const RETRIEVAL_INTEGRITY_URL = new URL("../lib/retrieval-integrity.ts", import.meta.url).href;
const PROFILE_STORAGE_URL = new URL("../lib/profile-storage.ts", import.meta.url).href;
const PRACTICAL_PROFILE_CONTRACT_URL = new URL("../lib/practical-profile-contract.ts", import.meta.url).href;
const PRACTICAL_FIELD_TRANSFER_URL = new URL("../lib/practical-field-transfer.ts", import.meta.url).href;
const PRACTICAL_PROFILE_STATE_URL = new URL("../lib/practical-profile-state.ts", import.meta.url).href;
const TRANSPILED_URLS = new Set([
  CORE_URL,
  MODEL_URL,
  RELIABILITY_URL,
  CLOUD_SYNC_CONTRACT_URL,
  AUTOMATICITY_URL,
  SCHEDULER_URL,
  SESSION_CLARITY_URL,
  RETRIEVAL_INTEGRITY_URL,
  PROFILE_STORAGE_URL,
  PRACTICAL_PROFILE_CONTRACT_URL,
]);

function isTemporaryHarness(parentURL) {
  return parentURL?.includes("/tmp/live-cash-os-") || parentURL?.includes("live-cash-os-test-");
}

function isAppTypeScript(url) {
  return url.startsWith(APP_ROOT_URL) && url.endsWith(".ts");
}

function hasExplicitExtension(specifier) {
  return /\.[a-z0-9]+$/iu.test(specifier);
}

async function resolveAppTypeScript(specifier, parentURL) {
  const fileUrl = new URL(`${specifier}.ts`, parentURL);
  try {
    if ((await stat(fileUrl)).isFile()) return fileUrl.href;
  } catch {
    // Fall through to a directory index. Practical Mastery intentionally owns
    // its public surface through content/practical-mastery/index.ts.
  }

  const indexUrl = new URL(`${specifier}/index.ts`, parentURL);
  try {
    if ((await stat(indexUrl)).isFile()) return indexUrl.href;
  } catch {
    // Preserve the historical file resolution below so a genuinely missing
    // module still fails closed with the expected path in the error.
  }
  return fileUrl.href;
}

export async function resolve(specifier, context, nextResolve) {
  if (isTemporaryHarness(context.parentURL)) {
    if (specifier === "./model-core") return { url: CORE_URL, shortCircuit: true };
    if (specifier === "./reliability") return { url: RELIABILITY_URL, shortCircuit: true };
    if (specifier === "./cloud-sync-contract") return { url: CLOUD_SYNC_CONTRACT_URL, shortCircuit: true };
    if (specifier === "./automaticity") return { url: AUTOMATICITY_URL, shortCircuit: true };
    if (specifier === "./scheduler") return { url: SCHEDULER_URL, shortCircuit: true };
    if (specifier === "./profile-storage") return { url: PROFILE_STORAGE_URL, shortCircuit: true };
    if (specifier === "./practical-profile-contract") return { url: PRACTICAL_PROFILE_CONTRACT_URL, shortCircuit: true };
    if (specifier === "./practical-field-transfer") return { url: PRACTICAL_FIELD_TRANSFER_URL, shortCircuit: true };
    if (specifier === "./practical-profile-state") return { url: PRACTICAL_PROFILE_STATE_URL, shortCircuit: true };
  }
  if (context.parentURL?.startsWith(APP_ROOT_URL) && specifier.startsWith(".") && !hasExplicitExtension(specifier)) {
    return { url: await resolveAppTypeScript(specifier, context.parentURL), shortCircuit: true };
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
  if (TRANSPILED_URLS.has(url) || isAppTypeScript(url)) {
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
