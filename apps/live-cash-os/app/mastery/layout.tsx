import type { ReactNode } from "react";
import PracticalLearnerPresentationGuard from "../../components/PracticalLearnerPresentationGuard";
import PracticalMasteryNav from "../../components/PracticalMasteryNav";
import TestInviteGate from "../../components/TestInviteGate";

export default function PracticalMasteryLayout({ children }: { children: ReactNode }) {
  return <TestInviteGate>
    <PracticalMasteryNav />
    {children}
    <PracticalLearnerPresentationGuard />
  </TestInviteGate>;
}
