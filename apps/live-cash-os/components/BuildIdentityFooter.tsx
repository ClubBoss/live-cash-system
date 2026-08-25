"use client";

import { APP_VERSION } from "../lib/model";

const rawBuildSha = (import.meta as ImportMeta & { env?: { VITE_BUILD_SHA?: string } }).env?.VITE_BUILD_SHA ?? "local";

export default function BuildIdentityFooter() {
  return <footer
    data-build-sha={rawBuildSha}
    data-app-version={APP_VERSION}
    aria-label={`Live Cash OS v${APP_VERSION}`}
    style={{ padding: "12px 24px 18px", textAlign: "right", fontSize: "12px", opacity: 0.55 }}
  >
    Live Cash OS v{APP_VERSION}
  </footer>;
}
