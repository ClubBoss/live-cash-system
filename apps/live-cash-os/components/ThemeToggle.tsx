"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const THEME_KEY = "live-cash-os:theme";

type ThemeMode = "light" | "dark";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [target, setTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    setTheme(root.dataset.theme === "dark" ? "dark" : "light");
    setTarget(document.querySelector<HTMLElement>(".topmeta"));
  }, []);

  if (!target) return null;

  const dark = theme === "dark";

  function toggleTheme() {
    const next: ThemeMode = dark ? "light" : "dark";
    const root = document.documentElement;
    root.dataset.theme = next;
    root.style.colorScheme = next;
    setTheme(next);
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      // Preference persistence is optional; the current-tab visual change still applies.
    }
  }

  return createPortal(
    <button
      type="button"
      className="theme-toggle"
      role="switch"
      aria-checked={dark}
      aria-label="Темная тема / Dark theme"
      title={dark ? "Светлая тема / Light theme" : "Темная тема / Dark theme"}
      onClick={toggleTheme}
    >
      <span className="theme-toggle-track" aria-hidden="true">
        <span className="theme-toggle-thumb" />
      </span>
    </button>,
    target,
  );
}
