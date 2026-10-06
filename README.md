# Timesheet Web — implementation package

Original documentation revision: **2026-09-30-r1.1**. Repository status: **WP1, WP2 and WP3 independently accepted; WP4 implemented (T01–T12 and the documentation task T13), awaiting the package-final gate WP4-GATE and the independent audits; not accepted**.

English `.md` files are authoritative. Every `.vi.md` is a translation of the corresponding English file. JSON keys and enum values stay in English. The manifests in `handoff/delivery/` are historical snapshots of the r1.1 documentation package, not certification of the current repository; see [VALIDATION](handoff/delivery/VALIDATION.md).

## Start

1. Read [NEXT_ACTION](handoff/NEXT_ACTION.md).
2. Read [requirements](docs/01_PRODUCT_REQUIREMENTS.md), [time/OT rules](docs/02_TIME_AND_OT_RULES.md) and [roadmap](docs/09_IMPLEMENTATION_ROADMAP.md).
3. Read [DEVELOPMENT](DEVELOPMENT.md), the [WP1 handoff](handoff/delivery/WP1_HANDOFF.md), the [WP2 handoff](handoff/delivery/WP2_HANDOFF.md) and the [WP3 handoff](handoff/delivery/WP3_HANDOFF.md) and the [WP4 handoff](handoff/delivery/WP4_HANDOFF.md); they describe the complete source in this repository and how to verify it. To install and operate the application on the NAS, read the [operations runbook](docs/11_OPERATIONS_RUNBOOK.md).
4. WP1 was accepted after the F-01 recheck ([WP1 review](handoff/delivery/WP1_REVIEW.md), [recheck](handoff/delivery/WP1_RECHECK.md)); WP2 and WP3 were accepted after their gates and independent audits (see their handoffs). The next step is the WP4 package-final gate and the fresh independent audits; do not begin WP5 before they pass.

Give Claude the single entry prompt in NEXT_ACTION; the coordinator resumes [saved tasks](handoff/delivery/ORCHESTRATION.json) and advances only after independent gates. Project profiles live in `.claude/agents/`, with the default coordinator in `.claude/settings.json`.

Each prompt names its reading scope. Do not paste every document into every session. Use [RESUME](handoff/prompts/RESUME.md) after an interruption.

## Selected direction

- Node.js LTS + TypeScript + Hono + React/Vite + SQLite, implemented in WP1; one Docker application container is the deployment target. WP3 added sign-off, finalization, the PDF, the capture/SMTP mail adapters, the job runner, deadline automation, reminders, owner-granted sharing and the admin status view. WP4 added a pinned non-root image with a Compose example, a readiness check and trusted-proxy handling, a one-time production bootstrap, consistent online backup with pruning, isolated restore with an outbound pause and reconciliation, rollback restore, an owner-only workbook import with preview and idempotent commit, an explicit opening OT balance, and an operations drill; the NAS target itself is not yet verified.
- Eight worked hours/day, flexible start, configurable breaks, daily N/M OT rules.
- All actual work outside normal working-calendar dates is OT-eligible without subtracting eight hours or applying weekday N; M rounding still applies.
- Separate employee sign-off, automatic submission, signature image, delivery acceptance and manager permission.
- Five work packages under one resumable coordinator mission. Subagents plan/implement/fix/verify/audit; vendor roles are optional. Huy supplies setup values and authorizes the real pilot.
- Subscription usage first; **zero planned spending** from the 2,500 reserve credits.

## Map

| Folder | Responsibility |
|---|---|
| `docs/` | Specification documents 01–10 and the operations runbook 11 (table below); `docs/agents/` configures the agent skills |
| `src/`, `tests/`, `scripts/` | Application source, automated tests and development scripts; see [DEVELOPMENT](DEVELOPMENT.md) |
| `handoff/` | Agent workflow: [NEXT_ACTION](handoff/NEXT_ACTION.md) (status and next step), `prompts/` (implementation/review/fix/resume instructions), `templates/` (handoff/review/checkpoint forms) and `delivery/` (state, handoffs, reviews, evidence and package validation) |
| `reference/` | Reference data: [fixtures](reference/fixtures/README.md) (91 reference scenarios that the tests read), [examples](reference/examples/README.md) (safe configuration samples that the synthetic seed reads) and [inputs](reference/inputs/README.md) (the sanitized workbook template) |
| `.agents/`, `.claude/` | Skills pinned by `skills-lock.json`; project orchestration in `.claude/agents/` and `settings.json` |

| File | Responsibility |
|---|---|
| [01 Product](docs/01_PRODUCT_REQUIREMENTS.md) | Scope and requirements |
| [02 Time and OT](docs/02_TIME_AND_OT_RULES.md) | Authoritative calculation/accounting rules |
| [03 Architecture](docs/03_ARCHITECTURE_AND_DATA.md) | Components, records, invariants |
| [04 UX](docs/04_UX_AND_SETTINGS.md) | Screens, settings, defaults |
| [05 Submission](docs/05_SUBMISSION_AND_NOTIFICATIONS.md) | Sign-off, PDF, email, reminders/recovery |
| [06 Acceptance](docs/06_TEST_AND_ACCEPTANCE.md) | Required verification |
| [07 Operations](docs/07_DEPLOYMENT_AND_OPERATIONS.md) | Docker, import, backup and restore |
| [08 AI workflow](docs/08_AI_WORKFLOW_AND_BUDGET.md) | Model/effort allocation and usage estimate |
| [09 Roadmap](docs/09_IMPLEMENTATION_ROADMAP.md) | Five packages and gates |
| [10 Decisions](docs/10_DECISIONS_AND_SOURCES.md) | Defaults, provenance, official sources |
| [11 Runbook](docs/11_OPERATIONS_RUNBOOK.md) | Install on the NAS, bootstrap, backup, restore, reconciliation, upgrade, rollback |

The [Excel template](reference/inputs/Timesheet_Rev8_2026.xlsx) is a public sample: the form, working-info and holiday sheets of the original workbook with all personal data removed (dated attendance sheets, employee name, signature images, author metadata and local path). The personal original is not retained. Keep the workbook out of production images; use synthetic demo data.

WP1, WP2 and WP3 are accepted; WP4 source with implementer and per-task verification evidence is present (WP4 is not yet gated or independently audited); see DEVELOPMENT and the handoffs. No production deployment or real email has occurred: outbound mail is capture-only until the owner authorizes a pilot, and the production sending flag is never set in development. Bilingual documentation does not require a bilingual initial application UI. Model information was rechecked on 2026-09-30; actual account availability and usage must be checked in the client.
