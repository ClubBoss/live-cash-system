import type { Metadata } from "next";
import "./globals.css";
import "./v11-overrides.css";
import "./w8-premium.css";
import "./mobile-visual-closure.css";
import "./active-learning.css";
import "./theme.css";

const themeBootstrap = `(() => {
  const key = "live-cash-os:theme";
  const apply = (theme) => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  };
  try {
    const stored = localStorage.getItem(key);
    if (stored === "light" || stored === "dark") {
      apply(stored);
      return;
    }
    apply(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  } catch {
    apply(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
})();`;

export const metadata: Metadata = {
  title: "Live Cash OS",
  description: "Adaptive RU/EN live-cash poker training with compact lessons, delayed recall and reviewed real-hand transfer.",
  applicationName: "Live Cash OS",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Live Cash OS",
    description: "Compact live-cash lessons, changed-situation drills, delayed recall and real-hand review.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Cash OS",
    description: "Adaptive RU/EN training for live-cash decisions.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
