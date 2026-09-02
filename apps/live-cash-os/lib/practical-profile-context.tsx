"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePracticalProfileState as useOwnPracticalProfileState } from "./use-practical-profile-state";

type PracticalProfileContextValue = ReturnType<typeof useOwnPracticalProfileState>;

const PracticalProfileContext = createContext<PracticalProfileContextValue | null>(null);

// app/mastery/layout.tsx renders layout-persistent siblings (nav, skill
// overview) alongside the routed page content. Client-side navigation
// between /mastery/* routes does not remount the layout, so each sibling
// previously calling usePracticalProfileState() independently held its own
// stale learner-state snapshot from whenever it last mounted. This provider
// owns the single live instance for one /mastery/* page load; every mastery
// component reads it through usePracticalProfileState() below instead of
// calling the underlying hook directly, so the two can never diverge.
export function PracticalProfileProvider({ children }: { children: ReactNode }) {
  const profile = useOwnPracticalProfileState();
  return <PracticalProfileContext.Provider value={profile}>{children}</PracticalProfileContext.Provider>;
}

export function usePracticalProfileState(): PracticalProfileContextValue {
  const context = useContext(PracticalProfileContext);
  if (!context) throw new Error("usePracticalProfileState must be used within PracticalProfileProvider");
  return context;
}
