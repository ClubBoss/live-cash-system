import type { Metadata } from "next";
import "./globals.css";
import "./v11-overrides.css";
import "./w8-premium.css";

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
      <body>{children}</body>
    </html>
  );
}
