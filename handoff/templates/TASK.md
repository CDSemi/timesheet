# Durable task brief and result

Coordinator writes the brief before dispatch; worker appends results after each
coherent step. Task briefs/results under handoff/delivery/tasks/ are English-only (no .vi.md).

- Mission/task ID; package/kind; dependencies; attempt:
- Prompt and necessary English reading list:
- Baseline/commit, digest and unrelated changes to preserve; freeze/reviewed commit:
- Routing {size S/M/L/XL, risk L/M/H, novelty}:
- Profile (fixed effort); requested model; model_override_reason (size_risk|novelty|escalation|fallback_unavailable|owner|none); self-reported actual model/effort and source; agent/session IDs:
- Exact writable paths; read-only scope; separate report/evidence paths:
- What "works as asked" means, and the tests or direct run that show it (plus the quick suite):
- Documents checked against the changed code, and documents changed (English and `.vi.md`):
- Completed edits/checks and current file state:
- Evidence: command | environment | exit | observed result | log path:
- Unfinished edits; unknown command completion; live processes:
- Findings/decisions, unresolved paths and blockers:
- Status: pending / running / interrupted / blocked / done / cancelled:
- One next action and resumption inputs:

Only coordinator updates shared state. The owner tests the running app.
An owner-requested auditor records author separation and an independent decision.
