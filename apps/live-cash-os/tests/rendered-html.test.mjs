import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the Live Cash OS learning surface", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Live Cash OS<\/title>/i);
  assert.match(html, /ADAPTIVE TABLE TRAINING/);
  assert.match(html, /Delayed retrieval/i);
  assert.match(html, /ACTIVE RECALL/);
  assert.match(html, /FIELD NOTE/);
  assert.match(html, /Preflop range architecture/);
  assert.match(html, /Bet &amp; response shape/);
  assert.match(html, /Context-switch review/);
  assert.match(html, /PERSONAL DIAGNOSTIC/);
  assert.match(html, /Measure before you personalise/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site|SkeletonPreview/i);
});

test("keeps progression and evidence claims honest in the runtime source", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const flashcardSource = page.slice(page.indexOf("const flashcards = ["), page.indexOf("const intensiveRoute = ["));

  assert.match(page, /const flashcards = \[/);
  assert.equal((flashcardSource.match(/id: "/g) ?? []).length, 12);
  assert.match(page, /if \(module === "preflop" && !hasCompleted\("geometry"\)\) return/);
  assert.match(page, /if \(module === "blinds" && !hasCompleted\("preflop"\)\) return/);
  assert.match(page, /if \(module === "filtering" && !hasCompleted\("blinds"\)\) return/);
  assert.match(page, /if \(module === "shape" && !hasCompleted\("filtering"\)\) return/);
  assert.match(page, /if \(module === "aggression" && !hasCompleted\("shape"\)\) return/);
  assert.match(page, /if \(module === "ancestry" && !hasCompleted\("aggression"\)\) return/);
  assert.match(page, /if \(module === "multiway" && !hasCompleted\("ancestry"\)\) return/);
  assert.match(page, /if \(module === "river" && !hasCompleted\("multiway"\)\) return/);
  assert.match(page, /if \(module === "mixed" && !hasCompleted\("river"\)\) return/);
  assert.match(page, /if \(isRecall && actionOk && reasonOk\) nextDimensions\.retention/);
  assert.doesNotMatch(page, /nextDimensions\.transfer\s*=/);
  assert.match(page, /fieldNotes: Array\.isArray\(old\.fieldNotes\)/);
  assert.match(page, /transfer: 0/);
  assert.match(page, /const diagnosticT1: DiagnosticItem\[\] = \[/);
  assert.equal((page.match(/id: "LD-0/g) ?? []).length, 10);
  assert.match(page, /feedback is withheld until the whole tranche is reviewed/);
  assert.match(page, /status: final \? "AWAITING_REVIEW" : "IN_PROGRESS"/);
  assert.match(page, /Download T1 response record/);
  assert.doesNotMatch(page, /type DiagnosticResponse = [^;]*evaluation/);
});
