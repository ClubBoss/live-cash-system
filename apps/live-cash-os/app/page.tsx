import LiveCashApp from "../components/LiveCashApp";
import PracticalMasteryGateway from "../components/PracticalMasteryGateway";
import Wave5PracticeLayer from "../components/Wave5PracticeLayer";
import Wave8AccessibilityLayer from "../components/Wave8AccessibilityLayer";
import Gauntlet4LearningIntegrityLayer from "../components/Gauntlet4LearningIntegrityLayer";
import RealUseLessonAssist from "../components/RealUseLessonAssist";
import ScrollContinuityGuard from "../components/ScrollContinuityGuard";
import TestInviteGate from "../components/TestInviteGate";
import LegacyToolDeepLink from "../components/LegacyToolDeepLink";

export default function Home() {
  return <TestInviteGate>
    <PracticalMasteryGateway />
    <LiveCashApp />
    <LegacyToolDeepLink />
    <Wave5PracticeLayer />
    <Wave8AccessibilityLayer />
    <Gauntlet4LearningIntegrityLayer />
    <RealUseLessonAssist />
    <ScrollContinuityGuard />
  </TestInviteGate>;
}
