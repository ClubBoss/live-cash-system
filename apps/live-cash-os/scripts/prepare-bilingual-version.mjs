import { readFile, writeFile } from "node:fs/promises";

const modelPath = new URL("../lib/model.ts", import.meta.url);
let model = await readFile(modelPath, "utf8");
if (model.includes('export const APP_VERSION = "1.0.0";')) {
  model = model.replace('export const APP_VERSION = "1.0.0";', 'export const APP_VERSION = "1.1.0";');
} else if (!model.includes('export const APP_VERSION = "1.1.0";')) {
  throw new Error("Unexpected APP_VERSION authority");
}
await writeFile(modelPath, model, "utf8");

const manifestPath = new URL("../public/manifest.webmanifest", import.meta.url);
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
manifest.description = "Bilingual adaptive live cash poker learning system.";
manifest.lang = "ru";
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

const serviceWorkerPath = new URL("../public/sw.js", import.meta.url);
let serviceWorker = await readFile(serviceWorkerPath, "utf8");
if (serviceWorker.includes('const CACHE = "live-cash-os-shell-v1";')) {
  serviceWorker = serviceWorker.replace('const CACHE = "live-cash-os-shell-v1";', 'const CACHE = "live-cash-os-shell-v1.1";');
} else if (!serviceWorker.includes('const CACHE = "live-cash-os-shell-v1.1";')) {
  throw new Error("Unexpected service-worker cache authority");
}
await writeFile(serviceWorkerPath, serviceWorker, "utf8");

console.log("Prepared Live Cash OS bilingual version 1.1.0 and refreshed the PWA shell cache.");
