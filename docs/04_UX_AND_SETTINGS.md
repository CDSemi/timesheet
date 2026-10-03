# UX and settings

## Screens

| Screen | Behavior |
|---|---|
| Timesheet | Two-week desktop view/mobile day list; category/time, due date, completeness, review/delivery status, batch edits |
| Day editor | Actual intervals, end date, confirmed breaks, category, leave minutes with `leave_kind` (vacation, sick, ot), WFH, expected finish, raw/eligible/credited minutes |
| Review | Exact content, OT proposals, missing evidence, deficit choices, recipients/email preview, signature preview, explicit Sign off & Submit |
| OT ledger/leave | Posted/provisional/reserved/available balance, daily evidence, adjustments; record permission, reserve, "record use" (explicit, idempotent, on or after the leave date, partial allowed), cancel/reverse |
| History | Immutable revisions/PDFs, manual/auto origin, delivery attempts, reasoned correction and explicit resend |
| Settings/admin | Personal policy/templates; users, annual holidays, sender and operational status with scoped access |

Use hours/minutes, never 1.30 for 1h30. Display current viewing zone and saved accounting date. Keep ordinary flows free of DB/job terminology. Actual clock values are not seeded from a schedule.

## Proposed defaults

| Setting | Default |
|---|---|
| Normal calendar / reporting zone | Mon–Fri / America/Los_Angeles |
| Display zone | Device/current zone; does not affect calculation |
| Reference / required work | 08:00–17:00 / 480 minutes |
| Breaks | 15+30+15 excluded; shift-relative suggestions requiring confirmation |
| N / M | 30 strictly exceeded / 30 nearest, exact midpoint down |
| Non-working-calendar time | All eligible, no B/N, same M |
| Deficit | ignore; optional auto_deduct or choose_at_signoff |
| Payroll / due | Anchor 2026-10-02, every 14 days; prior Tuesday 17:00 |
| Reminder offsets | 24 hours and 2 hours |
| Unsigned auto-submit | Enabled preference after sender setup; real sending remains disabled until activation |
| Automatic signature image | Off; explicit prior authorization may enable |
| Show OT on PDF | On; can hide without erasing ledger |
| Notifications / outbound | Email, optional ntfy / dry-run initially |

These are declared design defaults, not claims that every value was user-confirmed. Calculation/calendar settings need an effective date. Preview changes to future/draft defaults, preserve explicit overrides and immutable revisions, and warn if next year's company calendar is missing.

## Editing and review

Clock out/save confirms suggested/actual/no breaks. Unknown breaks or open intervals keep OT pending. Show explicit end date for overnight entry. Batch category changes must expose existing work conflicts and never silently delete clock evidence. Holiday work retains holiday classification and actual intervals.

Current/future draft edits audit automatically without a reason; old/finalized edits require one. Review flags attendance assumptions, incomplete OT and proposed deficits. The employee may acknowledge incomplete optional clock evidence and submit attendance. Invalid records require correction or explicit audited exclusion. Automatic submission uses valid saved attendance and marks unresolved OT pending.

Leave: the Day editor shows a non-blocking warning when the day's `ot`-kind leave minutes differ from the linked leave request's consumed minutes. It never spends or releases OT. The only way to consume reserved OT leave is the employee's "Record use" action; reservations not yet used stay visible as reserved.

## Visual standard

Plain CSS custom properties in `src/client/styles.css`; 4px corner radius; 300 ms ease-out transitions on interactive states (hover, active, focus); high-density, mobile-first layout.

## Email and PDF

Variables: {EmployeeName}, {PeriodStart}, {PeriodEnd}, {PayrollDate}, {SignOffStatus}, {SubmissionId}, {Revision}. Reject unknown variables; escape HTML values and validate recipients. Show setup/review previews. Normal email does not automatically include private OT notes or approval evidence.

PDF: company header, salaried-exempt timesheet title, employee, payroll date, two Monday–Sunday blocks, dates/categories, optional time/OT rows, total including both Sundays, employee name/image/date and blank manager signature/date unless a real future approval exists. Use US Letter portrait, embedded Unicode fonts, readable long labels and bounded signature image. Remove stale year headers. Add submission/revision identifiers and sanitized filenames.

Manual sign-off requires both the employee name and a validated uploaded signature image. The unsigned automatic-image setting is separate.

Automatic PDF/email visibly says employee review is pending. Even a preauthorized signature image creates no signed_at or real sign-off. A separate OT evidence report can be exported when the user chooses.
