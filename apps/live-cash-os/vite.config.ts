import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";

const localBindingConfig = {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
  d1_databases: d1
    ? [
        {
          binding: d1,
          database_name: "site-creator-d1",
          database_id: SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
        },
      ]
    : [],
  r2_buckets: r2
    ? [
        {
          binding: r2,
          bucket_name: "site-creator-r2",
        },
      ]
    : [],
};

function testMirrorWorkerConfig(databaseId: string) {
  return {
  main: "./worker/index.ts",
  compatibility_flags: ["nodejs_compat"],
    // Deliberately a different binding name: the production Sites `DB`
    // binding is neither read nor emitted in this Workers configuration.
    d1_databases: [{
      binding: "TEST_DB",
      database_name: "live-cash-os-mobile-test-state",
      database_id: databaseId,
    }],
    vars: { TEST_INVITE_MODE: "true" },
  };
}

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  const isTestMirrorDeploy =
    process.env.LIVE_CASH_DEPLOY_TARGET === "test-mirror";
  const testDatabaseId = process.env.LIVE_CASH_TEST_D1_DATABASE_ID;
  if (isTestMirrorDeploy && !testDatabaseId) {
    throw new Error("LIVE_CASH_TEST_D1_DATABASE_ID is required for the test mirror.");
  }

  return {
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      ...(isTestMirrorDeploy ? [] : [sites()]),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: isTestMirrorDeploy
          ? testMirrorWorkerConfig(testDatabaseId!)
          : localBindingConfig,
      }),
    ],
  };
});
