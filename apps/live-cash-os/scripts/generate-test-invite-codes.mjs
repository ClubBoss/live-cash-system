import { createHash, randomBytes } from "node:crypto";

const prefix = "LCO-TEST-";
const requested = Number(process.argv.find((argument) => argument.startsWith("--count="))?.slice("--count=".length) || 5);

if (!Number.isInteger(requested) || requested < 1 || requested > 20) {
  throw new Error("Use --count=N with an integer from 1 through 20.");
}

function codeHash(code) {
  return createHash("sha256").update(code).digest("hex");
}

function sqlLiteral(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

const createdAt = new Date().toISOString();
const invites = Array.from({ length: requested }, (_, index) => {
  const label = `tester-${String(index + 1).padStart(2, "0")}`;
  const code = `${prefix}${randomBytes(18).toString("base64url").toUpperCase()}`;
  return { label, code, codeHash: codeHash(code) };
});

const sql = invites.map(({ label, codeHash: hash }) => (
  "INSERT INTO test_invites (label, code_hash, active, created_at) VALUES ("
    + `${sqlLiteral(label)}, ${sqlLiteral(hash)}, 1, ${sqlLiteral(createdAt)});`
)).join("\n");

console.log(JSON.stringify({
  warning: "Store these codes in a password manager. They are shown once and must not be committed or pasted into CI logs.",
  createdAt,
  invites: invites.map(({ label, code }) => ({ label, code })),
  sql,
}, null, 2));
