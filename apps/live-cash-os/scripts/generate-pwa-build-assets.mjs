import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

export function collectPwaClientAssets(manifest) {
  const assets = new Set();
  for (const entry of Object.values(manifest)) {
    if (!entry || typeof entry !== "object") continue;
    for (const value of [entry.file, ...(entry.css ?? []), ...(entry.assets ?? [])]) {
      if (typeof value !== "string" || !value.trim()) continue;
      assets.add(value.startsWith("/") ? value : `/${value}`);
    }
  }
  return [...assets].sort();
}

export function pwaBuildIdentity(buildId, assets) {
  const source = `${String(buildId).trim()}\n${assets.join("\n")}`;
  return createHash("sha256").update(source).digest("hex").slice(0, 20);
}

export function renderPwaBuildAssets(buildId, manifest) {
  const assets = collectPwaClientAssets(manifest);
  const id = pwaBuildIdentity(buildId, assets);
  return `self.__LIVE_CASH_PWA_BUILD__ = Object.freeze(${JSON.stringify({ id, assets }, null, 2)});\n`;
}

export async function generatePwaBuildAssets({
  manifestPath = "dist/client/.vite/manifest.json",
  buildIdPath = "dist/server/BUILD_ID",
  outputPath = "dist/client/pwa-build-assets.js",
} = {}) {
  const [manifestRaw, buildIdRaw] = await Promise.all([
    readFile(manifestPath, "utf8"),
    readFile(buildIdPath, "utf8"),
  ]);
  const content = renderPwaBuildAssets(buildIdRaw.trim(), JSON.parse(manifestRaw));
  await writeFile(outputPath, content, "utf8");
  return { outputPath, content };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const result = await generatePwaBuildAssets();
  process.stdout.write(`generated ${result.outputPath}\n`);
}
