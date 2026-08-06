import { readFile, writeFile } from "node:fs/promises";

const componentPath = new URL("../components/LiveCashApp.tsx", import.meta.url);
const cssPath = new URL("../app/globals.css", import.meta.url);
let source = await readFile(componentPath, "utf8");

if (source.includes('className="learning-route"') && source.includes("getLearningRoute(locale)")) {
  console.log("Explicit 0-to-100 learner route already materialized.");
  process.exit(0);
}

function replaceOnce(from, to, label) {
  if (!source.includes(from)) throw new Error(`Learning-route target missing: ${label}`);
  source = source.replace(from, to);
}

replaceOnce(
  'import { deriveDiagnosticPriorityModules, parseDiagnosticScore } from "../lib/diagnostic-import";',
  'import { deriveDiagnosticPriorityModules, parseDiagnosticScore } from "../lib/diagnostic-import";\nimport { getLearningRoute } from "../content/i18n/route";',
  "route import",
);
replaceOnce(
  'const action = todayActionCopy(actionKind, locale);',
  'const action = todayActionCopy(actionKind, locale); const route = getLearningRoute(locale);',
  "route data",
);
replaceOnce(
  '<section className="integrity"><h2>{t("integrityTitle")}</h2><p>{t("integrityBody")}</p></section>',
  '<section className="learning-route"><div className="section-head"><p className="eyebrow">{locale === "ru" ? "МАРШРУТ ОТ СТАРТА ДО ПОДТВЕРЖДЕНИЯ" : "ROUTE FROM START TO VALIDATION"}</p><h2>{locale === "ru" ? "Что означает путь 0 → 100%" : "What the 0 → 100% route means"}</h2><p>{locale === "ru" ? "Это не общий процент покерного мастерства. Это полный цикл подтверждений для одной конкретной темы." : "This is not an overall poker-mastery score. It is the complete evidence cycle for one specific module."}</p></div><div className="route-grid">{route.map((stage) => <article key={stage.percent}><span>{stage.percent}%</span><div><b>{stage.title}</b><p>{stage.description}</p></div></article>)}</div></section><section className="integrity"><h2>{t("integrityTitle")}</h2><p>{t("integrityBody")}</p></section>',
  "route section",
);

let css = await readFile(cssPath, "utf8");
if (!css.includes(".learning-route")) css += `

.learning-route { margin: 28px 0; padding: 28px; border: 1px solid var(--line); border-radius: 24px; background: var(--surface); }
.route-grid { display: grid; gap: 10px; }
.route-grid article { display: grid; grid-template-columns: 64px 1fr; gap: 14px; align-items: start; padding: 14px 0; border-top: 1px solid var(--line); }
.route-grid article:first-child { border-top: 0; }
.route-grid article > span { font-weight: 800; font-variant-numeric: tabular-nums; }
.route-grid b { display: block; margin-bottom: 4px; }
.route-grid p { margin: 0; color: var(--muted); }
@media (max-width: 520px) { .learning-route { padding: 20px; } .route-grid article { grid-template-columns: 52px 1fr; } }
`;

await writeFile(componentPath, source, "utf8");
await writeFile(cssPath, css, "utf8");
console.log("Added the explicit 0-to-100 learner route without creating a mastery percentage.");
