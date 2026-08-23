import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { sites } from "./build/sites-vite-plugin";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";
const LOCAL_E2E_DATABASE_ID = "00000000-0000-4000-8000-000000000002";

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

const localE2EWorkerConfig = {
  main: "./worker/index.ts",
  // Vinext's generated Worker already carries the required nodejs_compat flag.
  // Do not repeat it in this local E2E overlay: workerd rejects duplicate flags.
  // Release E2E runs in workerd with the same production `DB` binding name,
  // but against a project-local D1 initialized from the canonical migration.
  // Sites packaging is disabled for this local harness because its external
  // access-control database is a hosting concern, not Live Cash app state.
  d1_databases: [
    {
      binding: "DB",
      database_name: "live-cash-os-e2e-state",
      database_id: LOCAL_E2E_DATABASE_ID,
    },
  ],
};

function testMirrorWorkerConfig(databaseId: string) {
  return {
    main: "./worker/index.ts",
    compatibility_flags: ["nodejs_compat"],
    // Deliberately a different binding name: the production Sites `DB`
    // binding is neither read nor emitted in this Workers configuration.
    d1_databases: [
      {
        binding: "TEST_DB",
        database_name: "live-cash-os-mobile-test-state",
        database_id: databaseId,
      },
    ],
    vars: { TEST_INVITE_MODE: "true" },
  };
}

export default defineConfig(async () => {
  // Keep Wrangler and Miniflare state project-local. These are non-secret tool
  // settings; application environment belongs in ignored `.env*` files.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  const deployTarget = process.env.LIVE_CASH_DEPLOY_TARGET;
  const isTestMirrorDeploy = deployTarget === "test-mirror";
  const isLocalE2ERuntime = deployTarget === "e2e-local";
  const testDatabaseId = process.env.LIVE_CASH_TEST_D1_DATABASE_ID;
  if (isTestMirrorDeploy && !testDatabaseId) {
    throw new Error("LIVE_CASH_TEST_D1_DATABASE_ID is required for the test mirror.");
  }

  return {
    define: {
      __LIVE_CASH_TEST_INVITE_MODE__: JSON.stringify(isTestMirrorDeploy),
      // The pre-Practical shell is a regression/test-mirror compatibility
      // harness only. Production builds compile this capability off so stale
      // `?legacy=1` URLs cannot reopen a competing learner product.
      __LIVE_CASH_LEGACY_TOOLS_MODE__: JSON.stringify(isTestMirrorDeploy || isLocalE2ERuntime),
    },
    server: isCodexSeatbeltSandbox
      ? { watch: { useFsEvents: false, usePolling: true } }
      : undefined,
    plugins: [
      vinext(),
      ...(isTestMirrorDeploy || isLocalE2ERuntime ? [] : [sites()]),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: isTestMirrorDeploy
          ? testMirrorWorkerConfig(testDatabaseId!)
          : isLocalE2ERuntime
            ? localE2EWorkerConfig
            : localBindingConfig,
      }),
    ],
  };
});
