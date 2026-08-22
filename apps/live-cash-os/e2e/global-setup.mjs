export default async function globalSetup() {
  if (process.env.LIVE_CASH_DEPLOY_TARGET !== "test-mirror") return;

  const response = await fetch("http://127.0.0.1:5173/api/test-invite-bootstrap", {
    method: "POST",
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Test-mirror schema bootstrap failed: ${response.status} ${body}`,
    );
  }
}
