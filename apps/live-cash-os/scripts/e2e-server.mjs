import { spawn, spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const passthroughArgs = process.argv.slice(2);
const inheritedTarget = process.env.LIVE_CASH_DEPLOY_TARGET;
const testMirror = inheritedTarget === "test-mirror";
const buildEnv = { ...process.env };
const E2E_WRANGLER = "wrangler@4.125.0";
const GENERATED_WRANGLER_CONFIG = "dist/server/wrangler.json";

if (!testMirror) {
  buildEnv.LIVE_CASH_DEPLOY_TARGET = "e2e-local";
  delete buildEnv.LIVE_CASH_TEST_D1_DATABASE_ID;
}

function run(command, args, env = buildEnv) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function normalizeGeneratedWranglerConfigForCurrentE2E() {
  const config = JSON.parse(readFileSync(GENERATED_WRANGLER_CONFIG, "utf8"));

  if (Object.hasOwn(config, "legacy_env")) {
    if (config.legacy_env !== true) {
      throw new Error(
        `Refusing to remove generated legacy_env=${JSON.stringify(config.legacy_env)}; ` +
          "current Wrangler removal is semantics-preserving only for legacy_env=true.",
      );
    }
    delete config.legacy_env;
    writeFileSync(
      GENERATED_WRANGLER_CONFIG,
      `${JSON.stringify(config, null, 2)}\n`,
      "utf8",
    );
  }
}

run("npm", ["run", "build"]);

if (!testMirror) {
  // Wrangler 4.125 removed the obsolete legacy_env key. Vinext beta.2 can
  // still emit legacy_env=true in its generated config. Removing that exact
  // value is explicitly semantics-preserving under Wrangler's current
  // service-environment model; any other value fails closed above.
  normalizeGeneratedWranglerConfigForCurrentE2E();

  run("npx", [
    "--yes",
    E2E_WRANGLER,
    "d1",
    "execute",
    "live-cash-os-e2e-state",
    "--local",
    "--config",
    GENERATED_WRANGLER_CONFIG,
    "--file",
    "drizzle/0000_last_morph.sql",
  ]);
}

const server = spawn(
  "npm",
  ["run", "start", "--", ...passthroughArgs],
  {
    cwd: process.cwd(),
    env: buildEnv,
    stdio: "inherit",
  },
);

for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => {
    if (!server.killed) server.kill(signal);
  });
}

server.on("error", (error) => {
  console.error(error);
  process.exitCode = 1;
});

server.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
