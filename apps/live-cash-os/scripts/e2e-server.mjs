import { spawn, spawnSync } from "node:child_process";

const passthroughArgs = process.argv.slice(2);
const inheritedTarget = process.env.LIVE_CASH_DEPLOY_TARGET;
const testMirror = inheritedTarget === "test-mirror";
const buildEnv = { ...process.env };
const E2E_WRANGLER = "wrangler@4.125.0";

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

run("npm", ["run", "build"]);

if (!testMirror) {
  run("npx", [
    "--yes",
    E2E_WRANGLER,
    "d1",
    "execute",
    "live-cash-os-e2e-state",
    "--local",
    "--config",
    "dist/server/wrangler.json",
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
