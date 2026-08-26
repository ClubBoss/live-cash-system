from pathlib import Path

path = Path("components/Wave7Experience.tsx")
text = path.read_text()


def replace_once(old: str, new: str, label: str) -> None:
    global text
    count = text.count(old)
    if count != 1:
        raise SystemExit(f"{label}: expected 1 seam, found {count}")
    text = text.replace(old, new, 1)


replace_once(
    '''import {
  REAL_HAND_DRAFT_KEY,
  clearUiStorage,
  readProfileScopedUiValue,
  writeProfileScopedUiValue,
} from "../lib/ui-session-storage";''',
    '''import {
  clearAcknowledgedRealHandPostCaptureDraft,
  clearRealHandCapture,
  isRealHandDraftMutationAcknowledged,
  patchRealHandBindingInput,
  patchRealHandCapture,
  patchRealHandPostCaptureText,
  patchRealHandReviewerKind,
  persistRealHandDraftWorkspace,
  readRealHandDraftWorkspace,
  type PendingRealHandDraftMutation,
  type RealHandDraftWorkspace,
} from "../lib/real-hand-draft-continuity";''',
    "persistence import",
)
replace_once("  type PracticalFieldBindingInput,\n", "", "obsolete binding type import")

start = text.index("const REAL_HAND_DRAFT_TTL_MS")
end = text.index("function copy(locale")
text = text[:start] + '''const REQUIRED_HAND_FIELDS = [
  "stakes",
  "heroPosition",
  "villainPositions",
  "effectiveStacks",
  "straddle",
  "actionSequence",
  "board",
  "sizings",
  "cue",
  "action",
  "reason",
] as const satisfies readonly (keyof FieldHandInput)[];

type PendingFieldSave = {
  revision: number;
  updatedAt: string;
  noteId: string;
  previousLocalSaveAt: string | null;
};

''' + text[end:]

replace_once(
    '''  const [hand, setHand] = useState<FieldHandInput>(() => readRealHandDraft());
  const [pendingSave, setPendingSave] = useState<PendingFieldSave | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [reviewerKinds, setReviewerKinds] = useState<Record<string, FieldReviewerKind>>({});
  const [bindingInputs, setBindingInputs] = useState<Record<string, PracticalFieldBindingInput>>({});
  const [resultDrafts, setResultDrafts] = useState<Record<string, string>>({});
  const [showdownDrafts, setShowdownDrafts] = useState<Record<string, string>>({});
  const [explainNotes, setExplainNotes] = useState<Record<string, string>>({});''',
    '''  const [draftWorkspace, setDraftWorkspace] = useState<RealHandDraftWorkspace>(() => readRealHandDraftWorkspace(state));
  const hand = draftWorkspace.capture;
  const reviewNotes = draftWorkspace.postCapture.reviewNoteByNoteId;
  const reviewerKinds = draftWorkspace.postCapture.reviewerKindByNoteId;
  const bindingInputs = draftWorkspace.postCapture.practicalBindingByNoteId;
  const resultDrafts = draftWorkspace.postCapture.resultByNoteId;
  const showdownDrafts = draftWorkspace.postCapture.showdownByNoteId;
  const explainNotes = draftWorkspace.postCapture.explainReviewByRecordId;
  const [pendingSave, setPendingSave] = useState<PendingFieldSave | null>(null);
  const [pendingDraftSaves, setPendingDraftSaves] = useState<PendingRealHandDraftMutation[]>([]);''',
    "component draft state",
)

replace_once(
    '''    clearUiStorage(REAL_HAND_DRAFT_KEY);
    setHand(emptyHand());
    setPendingSave(null);
  }, [lastLocalSaveAt, pendingSave, state.fieldNotes, state.revision]);

  function patch<K extends keyof FieldHandInput>(key: K, value: FieldHandInput[K]) {
    const next = { ...hand, [key]: value };
    setHand(next);
    persistRealHandDraft(next);
  }

  function clearDraft() {
    if (pendingSave) return;
    clearUiStorage(REAL_HAND_DRAFT_KEY);
    setHand(emptyHand());
  }

  function save() {
    if (errors.length || pendingSave) return;
    if (!persistRealHandDraft(hand)) return;''',
    '''    setDraftWorkspace((current) => {
      const next = clearRealHandCapture(current);
      persistRealHandDraftWorkspace(next);
      return next;
    });
    setPendingSave(null);
  }, [lastLocalSaveAt, pendingSave, state.fieldNotes, state.revision]);

  useEffect(() => {
    if (!pendingDraftSaves.length || !lastLocalSaveAt) return;
    const acknowledged = pendingDraftSaves.filter((pending) => isRealHandDraftMutationAcknowledged(state, pending, lastLocalSaveAt));
    if (!acknowledged.length) return;
    const keys = new Set(acknowledged.map((pending) => `${pending.kind}:${pending.identity}:${pending.revision}`));
    setDraftWorkspace((current) => {
      let next = current;
      for (const pending of acknowledged) next = clearAcknowledgedRealHandPostCaptureDraft(next, pending);
      persistRealHandDraftWorkspace(next);
      return next;
    });
    setPendingDraftSaves((current) => current.filter((pending) => !keys.has(`${pending.kind}:${pending.identity}:${pending.revision}`)));
  }, [lastLocalSaveAt, pendingDraftSaves, state]);

  function updateDraftWorkspace(transform: (current: RealHandDraftWorkspace) => RealHandDraftWorkspace) {
    setDraftWorkspace((current) => {
      const next = transform(current);
      persistRealHandDraftWorkspace(next);
      return next;
    });
  }

  function patch<K extends keyof FieldHandInput>(key: K, value: FieldHandInput[K]) {
    updateDraftWorkspace((current) => patchRealHandCapture(current, { [key]: value } as Partial<FieldHandInput>));
  }

  function clearDraft() {
    if (pendingSave) return;
    updateDraftWorkspace(clearRealHandCapture);
  }

  function save() {
    if (errors.length || pendingSave) return;
    if (!persistRealHandDraftWorkspace(draftWorkspace)) return;''',
    "capture durability",
)

start = text.index("  function reviewHand(noteId: string, outcome: FieldReviewOutcome)")
end = text.index("  function reviewerLabel(note: StructuredFieldNote)")
text = text[:start] + '''  function queuePendingDraftSave(pending: PendingRealHandDraftMutation) {
    setPendingDraftSaves((current) => [
      ...current.filter((item) => !(item.kind === pending.kind && item.identity === pending.identity)),
      pending,
    ]);
  }

  function addResultForNote(noteId: string) {
    const result = resultDrafts[noteId] ?? "";
    const showdown = showdownDrafts[noteId] ?? "";
    if (!result.trim() || !persistRealHandDraftWorkspace(draftWorkspace)) return;
    const next = addFieldResult(state, noteId, result, showdown);
    if (next === state) return;
    const nextNote = (next.fieldNotes as StructuredFieldNote[]).find((note) => note.id === noteId);
    if (!nextNote?.resultAddedAt) return;
    queuePendingDraftSave({
      kind: "RESULT",
      identity: noteId,
      revision: next.revision,
      updatedAt: next.updatedAt,
      previousLocalSaveAt: lastLocalSaveAt,
      result,
      showdown,
    });
    setState(next);
  }

  function reviewHand(noteId: string, outcome: FieldReviewOutcome) {
    const reviewText = reviewNotes[noteId] ?? "";
    const reviewerKind = reviewerKinds[noteId] ?? "SELF";
    if (!reviewText.trim()) return;
    const input = bindingInputs[noteId];
    const resolved = reviewerKind === "SELF" ? null : resolvePracticalFieldBinding(noteId, reviewerKind, input);
    if ((outcome === "REPAIR_REQUIRED" || outcome === "SUPPORTS_TRANSFER") && reviewerKind !== "SELF" && !resolved) return;
    if (!persistRealHandDraftWorkspace(draftWorkspace)) return;
    const next = reviewFieldHand(state, noteId, outcome, reviewText, reviewerKind, resolved ? input : undefined);
    if (next === state) return;
    const nextNote = (next.fieldNotes as StructuredFieldNote[]).find((note) => note.id === noteId);
    if (!nextNote?.reviewedAt) return;
    queuePendingDraftSave({
      kind: "REVIEW",
      identity: noteId,
      revision: next.revision,
      updatedAt: next.updatedAt,
      previousLocalSaveAt: lastLocalSaveAt,
      reviewerKind,
      reviewerNote: reviewText,
      reviewedAt: nextNote.reviewedAt,
    });
    setState(next);
  }

  function reviewExplainRecord(recordId: string, status: "REVIEWED_OK" | "REVIEWED_REPAIR" | "INSUFFICIENT") {
    const reviewText = explainNotes[recordId] ?? "";
    if (!reviewText.trim() || !persistRealHandDraftWorkspace(draftWorkspace)) return;
    const next = reviewExplainBack(state, recordId, status, reviewText);
    if (next === state) return;
    const record = explainBackRecords(next).find((row) => row.id === recordId);
    if (!record?.reviewedAt) return;
    queuePendingDraftSave({
      kind: "EXPLAIN_REVIEW",
      identity: recordId,
      revision: next.revision,
      updatedAt: next.updatedAt,
      previousLocalSaveAt: lastLocalSaveAt,
      status,
      reviewerNote: reviewText,
      reviewedAt: record.reviewedAt,
    });
    setState(next);
  }

''' + text[end:]

for old, new, label in [
    ('onChange={(event) => setExplainNotes((current) => ({ ...current, [record.id]: event.target.value }))}', 'onChange={(event) => updateDraftWorkspace((current) => patchRealHandPostCaptureText(current, "explainReviewByRecordId", record.id, event.target.value))}', "explain draft"),
    ('onClick={() => setState(reviewExplainBack(state, record.id, "INSUFFICIENT", reviewText))}', 'onClick={() => reviewExplainRecord(record.id, "INSUFFICIENT")}', "explain insufficient"),
    ('onClick={() => setState(reviewExplainBack(state, record.id, "REVIEWED_REPAIR", reviewText))}', 'onClick={() => reviewExplainRecord(record.id, "REVIEWED_REPAIR")}', "explain repair"),
    ('onClick={() => setState(reviewExplainBack(state, record.id, "REVIEWED_OK", reviewText))}', 'onClick={() => reviewExplainRecord(record.id, "REVIEWED_OK")}', "explain ok"),
    ('onChange={(event) => setResultDrafts((current) => ({ ...current, [note.id]: event.target.value }))}', 'onChange={(event) => updateDraftWorkspace((current) => patchRealHandPostCaptureText(current, "resultByNoteId", note.id, event.target.value))}', "result draft"),
    ('onChange={(event) => setShowdownDrafts((current) => ({ ...current, [note.id]: event.target.value }))}', 'onChange={(event) => updateDraftWorkspace((current) => patchRealHandPostCaptureText(current, "showdownByNoteId", note.id, event.target.value))}', "showdown draft"),
    ('onClick={() => setState(addFieldResult(state, note.id, resultText, showdownText))}', 'onClick={() => addResultForNote(note.id)}', "result submit"),
    ('onChange={(event) => setReviewerKinds((current) => ({ ...current, [note.id]: event.target.value as FieldReviewerKind }))}', 'onChange={(event) => updateDraftWorkspace((current) => patchRealHandReviewerKind(current, note.id, event.target.value as FieldReviewerKind))}', "reviewer draft"),
    ('onChange={(value) => setBindingInputs((current) => ({ ...current, [note.id]: value }))}', 'onChange={(value) => updateDraftWorkspace((current) => patchRealHandBindingInput(current, note.id, value))}', "binding draft"),
    ('onChange={(event) => setReviewNotes((current) => ({ ...current, [note.id]: event.target.value }))}', 'onChange={(event) => updateDraftWorkspace((current) => patchRealHandPostCaptureText(current, "reviewNoteByNoteId", note.id, event.target.value))}', "review draft"),
]:
    replace_once(old, new, label)

path.write_text(text)
