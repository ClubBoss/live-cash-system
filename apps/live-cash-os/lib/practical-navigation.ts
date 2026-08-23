export type PracticalNavigationTransport = "client" | "document";

export function navigatePracticalWithFallback(
  href: string,
  clientNavigate: (href: string) => void,
  documentNavigate: () => void,
  onClientError: (error: unknown) => void = () => {},
): PracticalNavigationTransport {
  try {
    clientNavigate(href);
    return "client";
  } catch (error) {
    onClientError(error);
    documentNavigate();
    return "document";
  }
}
