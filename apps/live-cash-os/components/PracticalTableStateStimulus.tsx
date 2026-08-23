import type { PracticalTableState } from "../content/practical-mastery";

type Locale = "ru" | "en";

export default function PracticalTableStateStimulus({ state, locale }: { state: PracticalTableState; locale: Locale }) {
  const heroSeat = state.seats.find((seat) => seat.position === state.hero);
  return <div aria-label="poker table state" style={{ margin: "18px auto", maxWidth: 720 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, marginBottom: 8 }}>
      {state.seats.slice(0, 3).map((seat) => <Seat key={seat.position} seat={seat} hero={seat.position === state.hero} />)}
    </div>
    <div style={{ border: "2px solid currentColor", borderRadius: "44%", minHeight: 220, padding: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>{state.board?.map((card) => <Card key={card} card={card} />)}</div>
      {state.potBb !== undefined ? <p><b>{locale === "ru" ? "Банк" : "Pot"} {state.potBb}bb</b></p> : null}
      {state.straddle ? <p>{locale === "ru" ? "Страддл" : "Straddle"}: <b>{state.straddle.position} {state.straddle.amountBb}bb</b></p> : null}
      <div style={{ fontSize: 14, maxWidth: 560 }}>{state.actions.map((action) => <div key={action}>{action}</div>)}</div>
      {state.irrelevantCues?.map((cue) => <div key={cue} style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>• {cue}</div>)}
      {heroSeat && state.heroCards ? <div style={{ marginTop: 14 }}><b>Hero {state.hero}</b><div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 5 }}>{state.heroCards.map((card) => <Card key={card} card={card} />)}</div></div> : null}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, marginTop: 8 }}>
      {state.seats.slice(3).map((seat) => <Seat key={seat.position} seat={seat} hero={seat.position === state.hero} />)}
    </div>
  </div>;
}

function Seat({ seat, hero }: { seat: PracticalTableState["seats"][number]; hero: boolean }) {
  return <div style={{ border: "1px solid currentColor", borderRadius: 12, padding: "8px 6px", textAlign: "center", opacity: seat.status === "folded" ? 0.45 : 1, fontWeight: hero ? 800 : 500 }}><div>{seat.position}{hero ? " · HERO" : ""}</div><div>{seat.stackBb}bb</div></div>;
}

function Card({ card }: { card: string }) {
  return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 42, height: 56, border: "1px solid currentColor", borderRadius: 7, fontWeight: 800, background: "var(--surface, white)" }}>{card}</span>;
}
