# Fix accepted review findings

Operator: Claude Code, same package model/effort from document 08; existing subscription. Provide the current complete source, reviewed baseline, REVIEW and HANDOFF.

Follow AGENTS.md. Reproduce each accepted finding, link its rule/AC ID, then make the smallest coherent fix. Preserve unrelated work, immutable history, ownership and accepted scope. Add meaningful regression coverage for the defect, not tests that simply mirror implementation.

Run affected checks and the required package gate. Do not implement the next package, redesign accepted architecture, change billing or send real messages. Explain any finding contradicted by actual evidence rather than silently ignoring it.

Update the English HANDOFF and Vietnamese translation with finding disposition, changed files/commit, commands/results, remaining unverified paths and one next review action. Save CHECKPOINT if interrupted. Do not call a fix independently accepted until the reviewer rechecks it.
