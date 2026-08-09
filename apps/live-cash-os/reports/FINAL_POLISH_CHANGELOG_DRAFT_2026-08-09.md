# Final Polish Changelog Draft

- Production smoke now follows the current `Diagnostic` navigation contract instead of the stale `Check/Проверка` label.
- Deployed test-mirror builds expose an immutable Git SHA marker; smoke verifies that the page being exercised matches the accepted commit.
- Manual main-branch workflow dispatch can rerun the same test-mirror deployment/smoke path instead of validating source only.
- Smoke screenshots/report are retained as a workflow artifact.
- Warm-up copy now states the actual bounded duration (`up to 2 minutes`) instead of the stale 90-second promise.
- Diagnostic terminology is unified in the learner shell for RU and EN.
- New E2E coverage locks the final shell terminology, warm-up timing and build-identity marker.

No poker-strategy, answer-identity, scheduler, mastery, retention, field-validation or learner-state semantics are intentionally changed.
