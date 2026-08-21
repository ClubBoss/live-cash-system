import type { ReactNode } from "react";
import PracticalMasteryNav from "../../components/PracticalMasteryNav";
import TestInviteGate from "../../components/TestInviteGate";

export default function PracticalMasteryLayout({ children }: { children: ReactNode }) {
  return <TestInviteGate>
    <PracticalMasteryNav />
    {children}
  </TestInviteGate>;
}
