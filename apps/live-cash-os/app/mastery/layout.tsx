import type { ReactNode } from "react";
import BuildIdentityFooter from "../../components/BuildIdentityFooter";
import PracticalLearnerPresentationGuard from "../../components/PracticalLearnerPresentationGuard";
import PracticalMasteryNav from "../../components/PracticalMasteryNav";
import PracticalNavigationGuard from "../../components/PracticalNavigationGuard";
import PracticalSkillDomainOverview from "../../components/PracticalSkillDomainOverview";
import TestInviteGate from "../../components/TestInviteGate";
import { PracticalProfileProvider } from "../../lib/practical-profile-context";

export default function PracticalMasteryLayout({ children }: { children: ReactNode }) {
  return <TestInviteGate>
    <PracticalProfileProvider>
      <PracticalNavigationGuard />
      <PracticalMasteryNav />
      <PracticalSkillDomainOverview />
      {children}
      <PracticalLearnerPresentationGuard />
      <BuildIdentityFooter />
    </PracticalProfileProvider>
  </TestInviteGate>;
}
