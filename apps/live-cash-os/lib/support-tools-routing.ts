export type SupportTab = "field" | "diagnostic" | "data";

export function supportTabFromSearch(search: string): SupportTab {
  const requested = new URLSearchParams(search).get("tab");
  if (requested === "field" || requested === "diagnostic" || requested === "data") return requested;
  return "data";
}

export function resolveToolsRuntime(input: {
  legacyToolsMode: boolean;
  search: string;
  legacyMarker: string | null;
  referrer: string;
  origin: string;
}): "support" | "legacy" {
  const params = new URLSearchParams(input.search);
  if (input.legacyToolsMode && params.get("legacy") === "1") return "legacy";

  const requestedTab = params.get("tab");
  if (
    params.get("support") === "1" ||
    requestedTab === "field" ||
    requestedTab === "diagnostic" ||
    requestedTab === "data"
  ) {
    return "support";
  }

  if (input.legacyToolsMode && input.legacyMarker === "1") {
    try {
      const referrer = new URL(input.referrer);
      if (referrer.origin === input.origin && referrer.pathname.startsWith("/mastery/")) {
        return "support";
      }
    } catch {
      // Direct local-E2E navigation has no referrer and intentionally uses legacy.
    }
    return "legacy";
  }

  return "support";
}
