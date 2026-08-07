import { readFile, writeFile } from "node:fs/promises";

function replaceOne(source, oldText, newText, label) {
  if (!source.includes(oldText)) throw new Error(`Wave 7 locale marker missing: ${label}`);
  return source.replace(oldText, newText);
}

const corePath = new URL("../components/LiveCashAppCore.tsx", import.meta.url);
let core = await readFile(corePath, "utf8");
core = replaceOne(core,
`  diagnosticStatusLabel,
  drillKindLabel,
  labLabels,`,
`  diagnosticStatusLabel,
  drillKindLabel,
  fieldFactLabels,
  fieldStatusLabel,
  labLabels,`,
"restore canonical field locale helpers");
core = replaceOne(core,
`<Wave7FieldPanel locale={locale} state={state} setState={setState} />`,
`<Wave7FieldPanel locale={locale} state={state} setState={setState} fieldStatusLabel={fieldStatusLabel} fieldFactLabels={fieldFactLabels} />`,
"pass canonical field locale helpers");
core = core.replaceAll("Реальные руки и explain-back", "Реальные руки и объяснения");
core = core.replaceAll("Real hands and explain-back", "Real hands and explanations");
core = core.replaceAll(
  "Семантический разбор делает человек или человек с инструментом. Импорт может направить практику, но не создаёт mastery, retention или field evidence.",
  "Семантический разбор делает человек или человек с инструментом. Импорт может поднять тему в очереди, но сам по себе не подтверждает навык, запоминание после паузы или игру за столом.",
);
core = core.replaceAll(
  "Semantic review is done by a human or human-assisted reviewer. Import can route practice, but it does not create mastery, retention, or field evidence.",
  "Semantic review is done by a human or human-assisted reviewer. Import may move a topic up the queue, but by itself it does not prove the skill, later recall, or real-table use.",
);
await writeFile(corePath, core, "utf8");

const experiencePath = new URL("../components/Wave7Experience.tsx", import.meta.url);
let experience = await readFile(experiencePath, "utf8");
experience = experience.replaceAll("Explain-back ждёт разбора", "Объяснение своими словами ждёт разбора");
experience = experience.replaceAll("Explain-back awaiting review", "Your explanation is awaiting review");
experience = experience.replaceAll("Разобрано, без repair", "Разобрано, дополнительная практика не нужна");
experience = experience.replaceAll("Reviewed, no repair", "Reviewed, no extra practice");
experience = experience.replaceAll("разобрано: без repair", "разобрано: дополнительная практика не нужна");
experience = experience.replaceAll("reviewed: no repair", "reviewed: no extra practice");
experience = experience.replaceAll("успешных delayed review", "успешных повторов после паузы");
experience = experience.replaceAll("successful delayed reviews", "successful reviews after a delay");
experience = experience.replaceAll("repair в очереди", "заданий на работу над ошибкой");
experience = experience.replaceAll("repairs queued", "mistake-practice tasks queued");
experience = replaceOne(experience,
`function fieldStatus(locale: LocaleCode, note: StructuredFieldNote): string {`,
`function fieldStatus(locale: LocaleCode, note: StructuredFieldNote, baseStatusLabel: (locale: LocaleCode, status: string) => string): string {`,
"field status helper signature");
experience = experience.replaceAll(`    return "ждёт разбора";`, `    return baseStatusLabel(locale, note.status);`);
experience = experience.replaceAll(`  return "awaiting review";`, `  return baseStatusLabel(locale, note.status);`);
experience = replaceOne(experience,
`export function Wave7FieldPanel({ locale, state, setState }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void }) {
  const c = copy(locale);`,
`export function Wave7FieldPanel({ locale, state, setState, fieldStatusLabel, fieldFactLabels }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; fieldStatusLabel: (locale: LocaleCode, status: string) => string; fieldFactLabels: (locale: LocaleCode) => { cue: string; action: string; reason: string } }) {
  const c = copy(locale);
  const facts = fieldFactLabels(locale);`,
"field panel locale helper props");
experience = experience.replaceAll(`{fieldStatus(locale, note)}`, `{fieldStatus(locale, note, fieldStatusLabel)}`);
experience = experience.replaceAll(`<label>{c.cue}<textarea`, `<label>{facts.cue}<textarea`);
experience = experience.replaceAll(`<label>{c.action}<textarea`, `<label>{facts.action}<textarea`);
experience = experience.replaceAll(`<label>{c.reason}<textarea`, `<label>{facts.reason} — {locale === "ru" ? "до результата" : "before the result"}<textarea`);
experience = experience.replaceAll(`<p><b>{c.cue}:</b>`, `<p><b>{facts.cue}:</b>`);
experience = experience.replaceAll(`<p><b>{c.action}:</b>`, `<p><b>{facts.action}:</b>`);
experience = experience.replaceAll(`<p><b>{c.reason}:</b>`, `<p><b>{facts.reason}:</b>`);
await writeFile(experiencePath, experience, "utf8");

const wave7Path = new URL("../lib/wave7.ts", import.meta.url);
let wave7 = await readFile(wave7Path, "utf8");
wave7 = wave7.replaceAll(
  "Есть минимум две разобранные реальные руки плюс delayed review и перенос на вариант.",
  "Есть минимум две разобранные реальные руки, успешное повторение после паузы и перенос на изменённую ситуацию.",
);
wave7 = wave7.replaceAll("Сделать назначенный repair.", "Сделать назначенную работу над ошибкой.");
wave7 = wave7.replaceAll("Complete the assigned repair.", "Complete the assigned mistake practice.");
await writeFile(wave7Path, wave7, "utf8");

console.log("Wave 7 canonical locale helper integration applied.");
