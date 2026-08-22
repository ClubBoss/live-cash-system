import type { ReactNode } from "react";
import PracticalLearnerPresentationGuard from "../../components/PracticalLearnerPresentationGuard";
import PracticalMasteryNav from "../../components/PracticalMasteryNav";
import PracticalNavigationGuard from "../../components/PracticalNavigationGuard";
import PracticalSkillDomainOverview from "../../components/PracticalSkillDomainOverview";
import TestInviteGate from "../../components/TestInviteGate";

export default function PracticalMasteryLayout({ children }: { children: ReactNode }) {
  return <TestInviteGate>
    <PracticalNavigationGuard />
    <PracticalMasteryNav />
    <PracticalSkillDomainOverview />
    {children}
    <PracticalLearnerPresentationGuard />
  </TestInviteGate>;
}
