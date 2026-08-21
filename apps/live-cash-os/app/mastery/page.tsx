import PracticalMasteryExperience from "../../components/PracticalMasteryExperience";

export default function PracticalMasteryPage() {
  return <>
    <nav aria-label="Practical Mastery tools" style={{ maxWidth: 1180, margin: "18px auto 0", padding: "0 20px", display: "flex", gap: 10, flexWrap: "wrap" }}>
      <a className="secondary" href="/mastery/study">Study loop →</a>
      <a className="secondary" href="/mastery/reference">Reference baselines →</a>
    </nav>
    <PracticalMasteryExperience />
  </>;
}
