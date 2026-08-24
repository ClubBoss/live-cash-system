import DiagnosticLearnerPresentationGuard from "../../components/DiagnosticLearnerPresentationGuard";
import SupportingToolsApp from "../../components/SupportingToolsApp";
import TestInviteGate from "../../components/TestInviteGate";

export default function SupportingToolsPage() {
  return <TestInviteGate>
    <DiagnosticLearnerPresentationGuard />
    <SupportingToolsApp />
  </TestInviteGate>;
}
