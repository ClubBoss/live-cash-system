import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Live Cash OS",
  description: "Двуязычная система обучения live cash poker: короткие уроки, практика, повторение и разбор реальных рук.",
  applicationName: "Live Cash OS",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Live Cash OS",
    description: "Bilingual live cash learning with clear lessons, changed-spot practice, delayed review and real-hand analysis.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Cash OS",
    description: "Bilingual adaptive training for live cash decisions.",
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
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
