# Implementation roadmap

Five packages in order. Internal checkpoints are recovery points, not extra project phases. Claude implements/fixes; ChatGPT reviews independently; Huy owns business exceptions, setup values and real activation. Use Standard speed for ChatGPT; model fallbacks and estimates are in [AI workflow](08_AI_WORKFLOW_AND_BUDGET.md).

| Package | Claude model / effort | ChatGPT model / effort | Sessions (Claude + GPT) |
|---|---|---|---|
| WP1 — Foundation and time calculation | Sonnet 5.5 / High | GPT-6.1 Sol / High | 2 + 1 |
| WP2 — Personal workspace and OT ledger | Sonnet 5.5 / Medium | GPT-6.1 Sol / Medium | 2–3 + 1 |
| WP3 — PDF, sign-off and automatic submission | Sonnet 5.5 / High | GPT-6.1 Sol / High | 2–3 + 1 |
| WP4 — Docker, import and recovery | Sonnet 5.5 / Medium | GPT-6.1 Sol / High | 1–2 + 1 |
| WP5 — Independent acceptance and pilot | Sonnet 5.5 / Medium | GPT-6.1 Sol / High | 1–2 + 1–2 |

## WP1 — Foundation and time calculation

Prerequisite: canonical docs/fixtures and an inspected private project directory; preserve unrelated files. 

Build the strict TypeScript/Hono/React skeleton, SQLite migrations, secure local login/session ownership, versioned calendar/policy records, period generator and pure production time/OT engine. Implement interval validation, historical policy references and old/current edit-reason enforcement. Supply synthetic seeds and runnable tests; no final PDF/email workflow yet.

Checkpoints: (1) Repository/schema/auth and daily engine; (2) intervals/zones, integration and evidence.

Gate: Type check/build, fresh SQLite migration tests, all time/OT fixtures, two-user isolation on implemented endpoints. Explicitly verify 09:00–18:00, N/M boundaries, off-day minutes, DST, seconds aggregation and mixed overnight shifts.

Prompts: [Implement](../handoff/prompts/WP1_IMPLEMENT.md) / [Review](../handoff/prompts/WP1_REVIEW.md).

## WP2 — Personal workspace and OT ledger

Prerequisite: accepted earlier handoffs and complete current source. 

Implement mobile/two-week views, actual clock/manual/break editing, partial leave/batch categories/WFH, settings, holiday CSV preview/import, user administration, history/audit and OT evidence CSV/report. Implement transactional ledger/delta/reservation services, recorded permission, partial consume/cancel/reverse and insufficient-balance behavior. WP3 wires finalization; expose no arbitrary public credit endpoint.

Checkpoints: (1) Editor/settings/calendar; (2) ledger/leave/history/integration; a third session only for concrete remaining work.

Gate: Core browser flows; AC-01/03/04/05 for implemented services; concurrent reservations; partial leave; correction deltas; safe evidence export; admin is not blanket private-data access.

Prompts: [Implement](../handoff/prompts/WP2_IMPLEMENT.md) / [Review](../handoff/prompts/WP2_REVIEW.md).

## WP3 — PDF, sign-off and automatic submission

Prerequisite: accepted earlier handoffs and complete current source. 

Implement immutable snapshots/hashes, explicit review/sign-off, atomic ledger/outbox finalization, pdf-lib report and private signature files, templates/recipients, durable jobs/reminders, deadline automation, capture/provider adapters and delivery history. Cover incomplete OT, deficit choices, activation boundary, late review/corrections/resend and uncertain SMTP outcomes. Authenticated deep links are required; restricted magic links are optional and must meet full safeguards if added.

Checkpoints: (1) Snapshot/review/PDF/ledger transaction; (2) jobs/reminders/adapters/failure recovery; (3) remaining integration/visual checks only if needed.

Gate: AC-06–AC-10 and AC-14; deadline/manual race, auto-image on/off, interrupted/uncertain send, duplicate jobs, private downloads and visual PDF evidence including both Sundays. All sending stays dry-run/capture.

Prompts: [Implement](../handoff/prompts/WP3_IMPLEMENT.md) / [Review](../handoff/prompts/WP3_REVIEW.md).

## WP4 — Docker, import and recovery

Prerequisite: accepted earlier handoffs and complete current source. 

Deliver pinned Docker/Compose, safe config examples, non-root persistent runtime, bootstrap/migrations/health, consistent backup/restore and upgrade/rollback runbook. Implement workbook preview/commit with source-cell provenance, source hash, idempotency/conflicts and explicit opening balance. Preview the tracked template workbook with synthetic dated sheets. Verify target architecture when available; otherwise mark NAS tests unverified and provide concrete owner setup steps.

Checkpoints: (1) Image/installation dry-run and restore; (2) workbook preview and operational handoff if needed.

Gate: AC-11/12/15: clean install, migrations, restart persistence, backup under writes, isolated restore with file hashes/balances, identical re-import no-op and outbound paused after restore.

Prompts: [Implement](../handoff/prompts/WP4_IMPLEMENT.md) / [Review](../handoff/prompts/WP4_REVIEW.md).

## WP5 — Independent acceptance and pilot

Prerequisite: accepted earlier handoffs and complete current source. **Start with the ChatGPT review prompt**, then use Claude for accepted fixes.

Start from the accepted WP1–WP4 release candidate and WP5 independent findings. Reproduce/fix accepted defects with bounded regression tests; preserve accepted scope and history. Prepare bilingual release/setup notes and the exact pilot packet (URL, sender/recipients, email/PDF, settings, restore proof and rollback). If no independent assessment exists, identify it as pending, never fabricate a pass. Do not perform real deployment/sending without owner authorization.

Checkpoints: ChatGPT assesses first; Claude fixes; ChatGPT rechecks; owner reviews the concrete pilot.

Gate: AC-13 plus every unresolved required gate; complete reproducible release, verified restore, no blocking integrity/privacy/submission defect. Separate software readiness from owner authorization and actual production pilot outcome.

Prompts: [Implement](../handoff/prompts/WP5_IMPLEMENT.md) / [Review](../handoff/prompts/WP5_REVIEW.md).

## Handover and completion

Each package delivers code/migrations/tests, reproducible commands, HANDOFF, review findings/disposition and one next action. Current package integrity/privacy blockers prevent advancing. Human-facing requirements/operations stay bilingual. No fake logs, required-path TODOs, personal timesheet data, signature images or secrets in public git.

Use [FIX_FINDINGS](../handoff/prompts/FIX_FINDINGS.md) for bounded fixes and [RESUME](../handoff/prompts/RESUME.md) for interruption. Missing NAS access means software ready/pilot pending, not production accepted. Completion requires required gates, authorized pilot, a restorable installation and the owner's normal two-week workflow. Observe one real period after activation.
