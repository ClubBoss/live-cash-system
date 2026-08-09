import LiveCashApp from "../components/LiveCashApp";
import Wave5PracticeLayer from "../components/Wave5PracticeLayer";
import Wave8AccessibilityLayer from "../components/Wave8AccessibilityLayer";
import Gauntlet4LearningIntegrityLayer from "../components/Gauntlet4LearningIntegrityLayer";
import TestInviteGate from "../components/TestInviteGate";

export default function Home() {
  return <TestInviteGate>
    <LiveCashApp />
    <Wave5PracticeLayer />
    <Wave8AccessibilityLayer />
    <Gauntlet4LearningIntegrityLayer />
  </TestInviteGate>;
}
