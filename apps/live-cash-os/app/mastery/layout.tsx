import type { ReactNode } from "react";
import TestInviteGate from "../../components/TestInviteGate";

export default function MasteryLayout({ children }: { children: ReactNode }) {
  return <TestInviteGate>{children}</TestInviteGate>;
}
