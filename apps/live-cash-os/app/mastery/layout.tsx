import type { ReactNode } from "react";

export default function PracticalMasteryLayout({ children }: { children: ReactNode }) {
  return <>
    <nav
      aria-label="Practical Mastery navigation"
      style={{ maxWidth: 1180, margin: "18px auto 0", padding: "0 20px", display: "flex", gap: 10, flexWrap: "wrap" }}
    >
      <a className="secondary" href="/">Live Cash OS</a>
      <a className="secondary" href="/mastery">Skill map</a>
      <a className="secondary" href="/mastery/journey">First Journey</a>
      <a className="secondary" href="/mastery/session">Mixed session</a>
      <a className="secondary" href="/mastery/perception">Table reading</a>
      <a className="secondary" href="/mastery/study">Study loop</a>
      <a className="secondary" href="/mastery/reference">Reference</a>
      <a className="secondary" href="/?section=field">Real Hands</a>
    </nav>
    {children}
  </>;
}
