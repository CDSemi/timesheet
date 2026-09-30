# Timesheet Web — implementation package

Original documentation revision: **2026-09-30-r1.1**. Repository status: **WP1 foundation implemented; independent review pending; WP2 not started**.

English `.md` files are authoritative. Every `.vi.md` is a translation of the corresponding English file. JSON keys and enum values stay in English. The manifests in `delivery/` are historical snapshots of the r1.1 documentation package, not certification of the current repository; see [VALIDATION](delivery/VALIDATION.md).

## Start

1. Read [NEXT_ACTION](NEXT_ACTION.md).
2. Read [requirements](docs/01_PRODUCT_REQUIREMENTS.md), [time/OT rules](docs/02_TIME_AND_OT_RULES.md) and [roadmap](docs/09_IMPLEMENTATION_ROADMAP.md).
3. Read [DEVELOPMENT](DEVELOPMENT.md) and the [WP1 handoff](delivery/WP1_HANDOFF.md); they describe the complete source in this repository and how to verify it.
4. The next action is independent review with [WP1_REVIEW](prompts/WP1_REVIEW.md). Do not restart WP1 implementation or begin WP2 before that review passes.

Each prompt names its reading scope. Do not paste every document into every session. Use [RESUME](prompts/RESUME.md) after an interruption.

## Selected direction

- Node.js LTS + TypeScript + Hono + React/Vite + SQLite, implemented in WP1; one Docker application container is the WP4 target, not yet delivered.
- Eight worked hours/day, flexible start, configurable breaks, daily N/M OT rules.
- All actual work outside normal working-calendar dates is OT-eligible without subtracting eight hours or applying weekday N; M rounding still applies.
- Separate employee sign-off, automatic submission, signature image, delivery acceptance and manager permission.
- Five work packages. Claude implements; ChatGPT independently reviews; Huy supplies deployment values and authorizes the real pilot.
- Subscription usage first; **zero planned spending** from the 2,500 reserve credits.

## Map

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

`prompts/` has implementation/review/fix/resume instructions. `templates/` has handoff/review/checkpoint forms. [Fixtures](fixtures/README.md) contain 91 reference scenarios; [examples](examples/README.md) contain safe configuration samples. `delivery/` records package state and validation.

The [Excel template](inputs/Timesheet_Rev8_2026.xlsx) is a public sample: the form, working-info and holiday sheets of the original workbook with all personal data removed (dated attendance sheets, employee name, signature images, author metadata and local path). The personal original is not retained. Keep the workbook out of production images; use synthetic demo data.

WP1 foundation source and implementer verification evidence are present; see DEVELOPMENT and the handoff. No production deployment or real email has occurred. Bilingual documentation does not require a bilingual initial application UI. Model information was rechecked on 2026-09-30; actual account availability and usage must be checked in the client.
