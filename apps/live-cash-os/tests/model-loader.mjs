import { readFile } from "node:fs/promises";
import ts from "typescript";

const CORE_URL = new URL("../lib/model-core.ts", import.meta.url).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "./model-core" && context.parentURL?.includes("live-cash-os-test-")) {
    return { url: CORE_URL, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url === CORE_URL) {
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
