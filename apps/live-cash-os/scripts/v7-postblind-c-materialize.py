from pathlib import Path


def replace_once(path: Path, old: str, new: str, label: str) -> None:
    text = path.read_text()
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 seam, found {count}")
    path.write_text(text.replace(old, new, 1))


component = Path("components/PracticalIntegratedSessionExperience.tsx")
replace_once(
    component,
    'import { recordIntegratedAnswerContinuity, restoreIntegratedRound } from "../lib/practical-continuity-workspace";',
    'import { recordIntegratedAnswerContinuity, recordIntegratedRoundStartContinuity, restoreIntegratedRound } from "../lib/practical-continuity-workspace";',
    "component continuity import",
)
replace_once(
    component,
    '''    studyWorkspace,\n    setMasteryWithPerformanceAndStudyWorkspace,\n    ready,''',
    '''    studyWorkspace,\n    setMasteryWithPerformanceAndStudyWorkspace,\n    setStudyWorkspace,\n    ready,''',
    "study workspace setter",
)
replace_once(
    component,
    '''    setItems(buildAdaptiveIntegratedSession(state, new Date(), INTEGRATED_SESSION_SIZE, performance, requestedFocus));\n    setIndex(0);\n    setInitializedRevision(state.revision);\n  }, [initializedRevision, performance, ready, requestedFocus, state, studyWorkspace]);''',
    '''    const startedAt = new Date();\n    const nextItems = buildAdaptiveIntegratedSession(state, startedAt, INTEGRATED_SESSION_SIZE, performance, requestedFocus);\n    if (nextItems.length > 0) {\n      const nextWorkspace = recordIntegratedRoundStartContinuity(studyWorkspace, state.contentVersion, {\n        focusSkillId: requestedFocus,\n        items: nextItems,\n      }, startedAt);\n      if (!nextWorkspace || !setStudyWorkspace(nextWorkspace)) {\n        setWorkspaceRecovery(true);\n        setInitializedRevision(state.revision);\n        return;\n      }\n    }\n    setItems(nextItems);\n    setIndex(0);\n    setInitializedRevision(state.revision);\n  }, [initializedRevision, performance, ready, requestedFocus, setStudyWorkspace, state, studyWorkspace]);''',
    "initial fresh round persistence",
)
replace_once(
    component,
    '''  const startFreshRound = (focusSkillId: string | null) => {\n    const focusAdmissible = !focusSkillId || isIntegratedFocusAdmissible(state, focusSkillId);\n    const nextItems = focusAdmissible ? buildAdaptiveIntegratedSession(state, new Date(), INTEGRATED_SESSION_SIZE, performance, focusSkillId) : [];\n    setItems(nextItems);\n    setIndex(0);\n    setWorkspaceRecovery(false);\n    setInitializedRevision(state.revision);\n  };''',
    '''  const startFreshRound = (focusSkillId: string | null) => {\n    const startedAt = new Date();\n    const focusAdmissible = !focusSkillId || isIntegratedFocusAdmissible(state, focusSkillId);\n    const nextItems = focusAdmissible ? buildAdaptiveIntegratedSession(state, startedAt, INTEGRATED_SESSION_SIZE, performance, focusSkillId) : [];\n    if (nextItems.length > 0) {\n      const nextWorkspace = recordIntegratedRoundStartContinuity(studyWorkspace, state.contentVersion, {\n        focusSkillId,\n        items: nextItems,\n      }, startedAt);\n      if (!nextWorkspace || !setStudyWorkspace(nextWorkspace)) {\n        setWorkspaceRecovery(true);\n        return;\n      }\n    }\n    setItems(nextItems);\n    setIndex(0);\n    setWorkspaceRecovery(false);\n    setInitializedRevision(state.revision);\n  };''',
    "fresh round persistence",
)
replace_once(
    component,
    '''  const continueWithGenericSession = () => {\n    const nextUrl = new URL(window.location.href);\n    nextUrl.searchParams.delete("focus");\n    window.history.replaceState(window.history.state, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);\n    setRequestedFocus(null);\n    startFreshRound(null);\n  };''',
    '''  const continueWithGenericSession = () => {\n    const nextUrl = new URL(window.location.href);\n    nextUrl.searchParams.delete("focus");\n    window.history.replaceState(window.history.state, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);\n    if (requestedFocus === null) {\n      startFreshRound(null);\n      return;\n    }\n    setRequestedFocus(null);\n  };''',
    "generic continue lifecycle",
)

continuity = Path("lib/practical-continuity-workspace.ts")
marker = '''export function recordIntegratedAnswerContinuity(\n  workspace: PracticalStudyWorkspace,'''
helper = '''export function recordIntegratedRoundStartContinuity(\n  workspace: PracticalStudyWorkspace,\n  contentVersion: string,\n  input: {\n    focusSkillId: string | null;\n    items: IntegratedSessionItem[];\n  },\n  now = new Date(),\n): PracticalStudyWorkspace | null {\n  if (input.items.length === 0 || input.items.length > 8) return null;\n\n  const continuity = nextContinuity(workspace, contentVersion);\n  return withContinuity(workspace, {\n    ...continuity,\n    integrated: {\n      focusSkillId: input.focusSkillId,\n      items: input.items.map((item) => ({ ...item })),\n      nextIndex: 0,\n      submittedAttemptIds: [],\n      updatedAt: now.toISOString(),\n    },\n  }, now);\n}\n\nexport function recordIntegratedAnswerContinuity(\n  workspace: PracticalStudyWorkspace,'''
replace_once(continuity, marker, helper, "round-start continuity helper")
