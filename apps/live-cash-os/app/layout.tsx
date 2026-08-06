import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Live Cash OS",
  description: "Русскоязычная адаптивная система обучения live cash poker.",
  applicationName: "Live Cash OS",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Live Cash OS",
    description: "Короткие уроки, changed-node drills, delayed recall и разбор реальных рук.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Cash OS",
    description: "Адаптивная тренировка live cash решений.",
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
