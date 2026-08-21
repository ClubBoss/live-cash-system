import Link from "next/link";
import type { ReactNode } from "react";
import TestInviteGate from "../../components/TestInviteGate";

export default function PracticalMasteryLayout({ children }: { children: ReactNode }) {
  return <TestInviteGate>
    <nav
      aria-label="Practical Mastery navigation"
      style={{ maxWidth: 1180, margin: "18px auto 0", padding: "0 20px", display: "flex", gap: 10, flexWrap: "wrap" }}
    >
      <Link className="secondary" href="/">Live Cash OS</Link>
      <Link className="secondary" href="/mastery">Skill map</Link>
      <Link className="secondary" href="/mastery/journey">First Journey</Link>
      <Link className="secondary" href="/mastery/session">Mixed session</Link>
      <Link className="secondary" href="/mastery/perception">Table reading</Link>
      <Link className="secondary" href="/mastery/study">Study loop</Link>
      <Link className="secondary" href="/mastery/reference">Reference</Link>
      <Link className="secondary" href="/">Real Hands · Live Cash OS</Link>
    </nav>
    {children}
  </TestInviteGate>;
}
