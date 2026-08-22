"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Full-document navigation is the fail-safe transport for the confirmed Vinext RSC client-transition defect; prefetch keeps it responsive without re-enabling the broken transition path. */

import type { AnchorHTMLAttributes, ReactNode } from "react";

const warmed = new Set<string>();

export function warmPracticalDocument(href: string) {
  if (typeof document === "undefined" || warmed.has(href)) return;
  warmed.add(href);
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = href;
  document.head.appendChild(link);
}

export default function PracticalDocumentLink({
  href,
  children,
  onPointerEnter,
  onFocus,
  ...props
}: Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  children: ReactNode;
}) {
  return <a
    {...props}
    href={href}
    onPointerEnter={(event) => {
      warmPracticalDocument(href);
      onPointerEnter?.(event);
    }}
    onFocus={(event) => {
      warmPracticalDocument(href);
      onFocus?.(event);
    }}
  >{children}</a>;
}
