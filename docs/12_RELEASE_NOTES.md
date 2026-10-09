# Release notes

These notes identify the release candidate of the Timesheet application, state what each work package delivered, and list the limits and carried risks that a pilot user or operator must know. English is authoritative; [12_RELEASE_NOTES.vi.md](12_RELEASE_NOTES.vi.md) is the translation. They do not repeat the rules: each line points to the document or runbook step that owns it. The owner decisions D-1 to D-15 are listed in [WP5-PLAN](../handoff/delivery/tasks/WP5-PLAN.md) section D. **Every one of them is still open.** Wherever a line below follows a recommendation, it is labelled "recommended; owner decision pending (D-n)" and is not a decision.

## Release identity

- **Release commit and source digest.** The release is the WP5 package-final freeze commit. Its SHA, its source digest (`npm run digest`, which excludes `handoff/`) and its file count are recorded in the [WP5 handoff](../handoff/delivery/WP5_HANDOFF.md) and in the gate record. They are not written here, because a document cannot contain the digest of the tree that holds it. Before these notes were added the source was commit `8e99d2c6375f71ac94faff9eb859b9b7bcf3e741` with digest `1e59ad31d9af2a3f4a3aa5711647ea8742e1534b3d4f8ba4f2210beee44a3d2c` over 777 files.
- **Version.** `package.json` says `0.1.0`, the same value as the earlier WP3 build. The version does not identify the release; the commit and the digest do (R-B5-1).
- **Image ID.** Record the image ID when the image is built on the host: `docker image inspect --format '{{.Id}}' <image>` ([runbook](11_OPERATIONS_RUNBOOK.md) section 1 step 8). A rebuild of the same source gave different image IDs in the independent review although the application files were identical, so the tag `timesheet:<release-commit>` is never reused for a rebuild (R-B5-1).
- **Base image.** The Dockerfile pins the Node base image by its multi-architecture digest. The review found the pin one Debian rebuild behind the tag on 2026-10-06; decide on the refresh before the pilot build ([runbook](11_OPERATIONS_RUNBOOK.md) section 9; R-B5-2).
- **Declaration.** No release has been declared and no tag exists. The first release is declared at the owner's pilot authorization; from then on fixes go through branches and pull requests ([08 AI workflow](08_AI_WORKFLOW_AND_BUDGET.md)). Recommended; owner decision pending (D-14). Agents create no tag.

## Scope by package

- **WP1, foundation and time calculation.** Strict TypeScript, Hono and React with SQLite migrations, local sign-in with ownership checks, versioned calendars and policies, period generation, and the one production time and OT engine (N/M boundaries, off days, flexible start, overnight, DST). Rules: [02 Time and OT](02_TIME_AND_OT_RULES.md).
- **WP2, personal workspace and OT ledger.** Two-week views, clock, manual and break editing, partial leave, settings, holiday import, user administration, history and audit, the OT evidence export, and the transactional ledger with recorded permission, reservation, partial use and corrections. Rules: [01 Product](01_PRODUCT_REQUIREMENTS.md), [03 Architecture](03_ARCHITECTURE_AND_DATA.md).
- **WP3, sign-off, PDF and submission.** Immutable snapshots, explicit sign-off with a signature image, the PDF, capture and SMTP mail adapters, durable jobs, reminders, deadline automation with the activation instant, owner-granted sharing and the administrator status. Rules: [05 Submission](05_SUBMISSION_AND_NOTIFICATIONS.md).
- **WP4, deployment, recovery and import.** A pinned non-root image with a Compose example, one-time production bootstrap, consistent online backup with pruning, isolated restore with an outbound pause and reconciliation, upgrade and rollback, owner-only workbook import with an explicit opening balance, and the operations drill. Rules: [07 Operations](07_DEPLOYMENT_AND_OPERATIONS.md); steps: [11 Runbook](11_OPERATIONS_RUNBOOK.md).
- **WP5, independent acceptance and pilot preparation.** An independent assessment of the WP1 to WP4 candidate (integrated workflow; release, restore and operations), two runbook documentation fixes (the Compose binding and the env-file copy), the integrated two-week test (AC-13), and these notes with the pilot activation, deactivation and rollback card in the runbook (sections 13 to 16). The acceptance record of WP5 is in the [WP5 handoff](../handoff/delivery/WP5_HANDOFF.md).
- **WP5 change round, UI redesign (owner request of 2026-10-08).** The screens were redesigned for ease of use; business rules, the PDF and the server calculations are unchanged. This round needs its own gate and fresh independent audit before pilot activation, so the release identity above is refreshed only after them. What people see ([04 UX](04_UX_AND_SETTINGS.md); owner decisions in [10 Decisions](10_DECISIONS_AND_SOURCES.md)):
  - **Timesheet in the Excel form.** The page shows the layout of the Excel workbook and the PDF: the form header, two Monday to Sunday weeks with the rows Day, Date, Label, Time and OT, a Check row that states each day's status in words and shapes, "Show details" rows, the "Overtime Total :" box and the signature lines (without the signature image). Weekends, holidays and closures from the company calendar are tinted and hatched, and today is marked. Dates, durations and times are written as on the PDF (US dates, h:mm, 24-hour). On a phone each week is a compact four-column table without sideways scrolling.
  - **New navigation.** A top bar on the desktop (Timesheet, Overtime, History, Settings, and Admin for administrators) and a bottom tab bar on a phone with a More menu (Settings, Import, Admin, Sign out). "OT" is now called "Overtime"; Import is reached from Settings or More.
  - **Period bar and clock.** One bar shows the period, its single status, the payroll date, the due date in words and "Review & sign off". One Clock in / Clock out button shows whether you are clocked in. "Change several days" opens batch editing on demand instead of being always visible.
  - **Day editor.** A side panel on the desktop and a bottom sheet on a phone, with the times first, one-tap confirmation of suggested breaks, leave typed as hours and minutes, and the label pickable directly in the sheet cell. Reasons and conflict confirmations work as before.
  - **Review.** "What you sign" shows the same sheet people sign, with the detail rows on, beside a three-step checklist (days that need attention, email and PDF, sign).
  - **Not reproduced from Excel.** The workbook's formulas that conflict with the canonical rules (the 8.5-hour daily OT, the total without Sunday, decimal hours and the TODAY() dates) are not copied; the app shows the server's values.
  - **Later round.** Overtime, History and Settings keep their current layout and are restyled in a later round (owner decision E-7).

## Software readiness, owner permission and pilot result

These are separate facts ([06 Acceptance](06_TEST_AND_ACCEPTANCE.md)).

- **Software readiness** means the gates and independent audits of the packages passed on synthetic data in capture mode on a developer workstation. It is recorded in the package handoffs and is not a statement about the NAS.
- **Owner permission** is the owner's explicit authorization of real sending and activation. It has not been requested or given in this release; nothing is deployed and no real email has been sent.
- **Pilot result** is what the owner observes in one real period with the Excel workbook still available. There is none yet.
- **Provider acceptance and recipient receipt** are also separate: the provider's acceptance of a message does not show that anyone received or read it ([05 Submission](05_SUBMISSION_AND_NOTIFICATIONS.md)).
- The NAS target is NOT VERIFIED until the owner ticks the [runbook](11_OPERATIONS_RUNBOOK.md) section 2 checklist (recommended; owner decision pending (D-13)). Without it the result is "software ready, pilot pending".

## Known limits and carried risks

Each line gives the limit and where the rule or step is. None is a known defect that blocks the pilot; the independent assessment found no blocking integrity, privacy or submission defect.

### Submission and mail

- **Reminder repeat after a crash on real SMTP (D-7).** A reminder may go out twice if the process stops while sending (at-least-once). Reminders are advisory. Recommended: accept; owner decision pending (D-7). [05 Submission](05_SUBMISSION_AND_NOTIFICATIONS.md) "Durable delivery".
- **TLS certificate failure is classified temporary (D-8).** A failed certificate check reaches the SMTP adapter as a socket error, so the send is retried and then ends in visible intervention instead of failing at once. Recommended: treat it as a permanent configuration fault; owner decision pending (D-8). Until then, a failing send after a certificate or host change is a configuration problem to check first ([runbook](11_OPERATIONS_RUNBOOK.md) section 13).
- **Send before the PDF.** A send that runs before its PDF exists is retried once after about a minute; this is the documented retry, not a fault ([05 Submission](05_SUBMISSION_AND_NOTIFICATIONS.md)).
- **Real SMTP is unobserved.** Capture mode cannot show real provider behaviour. It is observed only in the staged first period ([runbook](11_OPERATIONS_RUNBOOK.md) section 13).
- **Never-configured accounts (WP3 R8, R-WA3).** Once automation is active, an account that never saved its submission settings, including the bootstrap administrator account, still receives before-due reminders. Save the settings of every account, or use only the accounts that have them, before activation ([runbook](11_OPERATIONS_RUNBOOK.md) section 16).
- **The reviewed-payload hash includes the OT balance (WP3 R4).** A review can go stale after an OT movement; reload and review again.
- **Sign-off before the period end is allowed (WP3 R5).** An accepted interpretation of [05 Submission](05_SUBMISSION_AND_NOTIFICATIONS.md).
- **Seed events show as automatic (WP3 R9).** Only synthetic seed data; the seed is refused in production.
- **The long holiday label is cut with an ellipsis in the PDF (WP3 R1, R-WA6).** The owner judges it on the pilot sample.
- **Partial leave is not visible on the PDF (R-WA2).** A day with 4 h work and 4 h leave prints as worked time with its OT; the leave minutes do not appear. The owner judges whether payroll needs them.
- **Days without records read "Worked" on an automatic PDF (R-WA8).** This is the owner's decision F-1 and F-Q1 (no automatic indicator, default labels), see [10 Decisions](10_DECISIONS_AND_SOURCES.md); the pilot sample shows it.
- **The outcome notice after downtime recovery is inexact (R-WA1).** It says the period was submitted "at the deadline" although a recovered submission is produced later; the PDF date is correct.
- **Unconfirmed breaks.** Clock out is refused with 422 while a break row is unconfirmed, and future break rows on an open session are refused; confirm the breaks first ([02 Time and OT](02_TIME_AND_OT_RULES.md)).

### Accounts, import and balances

- **Temporary passwords (D-9).** There is no self-service password change. The pilot is owner-only and a temporary password is set out of band; add a change-password route before anyone else is onboarded. Recommended; owner decision pending (D-9). [runbook](11_OPERATIONS_RUNBOOK.md) section 3 step 5.
- **Opening balance and history (D-10).** Record one evidence-backed opening balance, or start at zero, and do not import history for the pilot. Recommended; owner decision pending (D-10). [runbook](11_OPERATIONS_RUNBOOK.md) section 10.
- **More than 64 sheets are refused by the import (R-B4-3).** Only relevant if history is imported.
- **Open owner choices with their current safe defaults** (nothing below depends on the answer):
  - D-2 (WP4-I-1): a draft period never receives imported days.
  - D-3 (WP4-I-2): "Off day (overtime used)" is skipped.
  - D-4 (WP4-I-3): an unended or not-yet-due period is skip-only.
  - D-5 (WP4-I-4): a correction of the opening balance to a net zero is refused.
  - D-6 (WP4-I-5): uncommitted import previews have no quota.
  - D-15 (F-Q6): the holiday preview keeps no per-date counts.

### Operations

- **Rollback residual (R-A3, D-1).** Jobs created after a rollback to an older schema are not held: the older build runs with `JOB_RUNNER=off` until reconciliation. Recommended; owner decision pending (D-1). [runbook](11_OPERATIONS_RUNBOOK.md) sections 8 and 15.
- **Concurrent openers of a new database (R-A2).** Start one instance and wait until it is healthy before any other process opens a new database ([runbook](11_OPERATIONS_RUNBOOK.md) section 16).
- **The CLI falls back to the development database without `DATABASE_PATH` (R-A8).** Production refuses a missing path; keep both paths explicit for host CLI use ([runbook](11_OPERATIONS_RUNBOOK.md) section 16).
- **A same-day prune removes the paired pre-upgrade backup (R-RA2, R-B5-5).** Copy that backup aside, or prune on another day ([runbook](11_OPERATIONS_RUNBOOK.md) sections 8 and 16).
- **Restore onto a dangling junction (R-RA9).** Restore into a new real folder ([runbook](11_OPERATIONS_RUNBOOK.md) section 16).
- **Backup status after a restore (R-B5-4).** A restored instance reports the backup as `never` until its own first backup ([runbook](11_OPERATIONS_RUNBOOK.md) section 7).
- **Status gaps.** The result of the last `--prune` is not recorded, the retention run is only in the JSON, and a held send cannot be dropped (release or leave it) ([runbook](11_OPERATIONS_RUNBOOK.md) sections 5, 7 and 12).
- **Image identity and base image (R-B5-1, R-B5-2).** See "Release identity".
- **The NAS is NOT VERIFIED (D-13).** See "Software readiness, owner permission and pilot result".
- **The activation instant has no screen.** The administrator status shows it; recording or clearing it is an API call ([runbook](11_OPERATIONS_RUNBOOK.md) section 13).

## Setup summary

This is a pointer, not a copy. Do the steps in this order and keep real values only in the owner's private copy outside git (recommended; owner decision pending (D-11)).

1. Check the NAS and install: [runbook](11_OPERATIONS_RUNBOOK.md) section 1; tick the checklist in section 2.
2. Bootstrap the first administrator: section 3. Settings and the setup sequence: [07 Operations](07_DEPLOYMENT_AND_OPERATIONS.md) "Setup sequence".
3. Schedule and test the backup, the retention, an isolated restore and the independent host alert: sections 4 to 7 and 11.
4. Prepare the pilot packet, then, only after the owner's authorization, activate: sections 13 and 14; the rollback card is section 15 and the operator notes are section 16.
5. Upgrades and rollbacks: section 8. Import: section 10.
