import assert from "node:assert/strict";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${Math.random()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server redirects canonical root to Practical Mastery journey", async () => {
  const response = await render();
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "/mastery/journey");
});

test("Practical Mastery destination renders Russian-first metadata and PWA manifest", async () => {
  const response = await render("/mastery/journey");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Live Cash OS<\/title>/i);
  assert.match(html, /lang="ru"/i);
  assert.match(html, /manifest\.webmanifest/i);
  assert.doesNotMatch(html, /accepted slice/i);
  assert.doesNotMatch(html, /vinext-starter/i);
});
