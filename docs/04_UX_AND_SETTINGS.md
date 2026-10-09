# UX and settings

## Screens

| Screen | Behavior |
|---|---|
| App shell | Desktop top bar: Timesheet, Overtime, History, Settings and, for administrators, Admin, with the user and Sign out. Phone: compact top bar and a bottom tab bar with Timesheet, Overtime, History and More; More holds Settings, Import, Admin (administrators only) and Sign out. Import (the person's own workbook and opening balance) is reached from a link in Settings on the desktop and from More on a phone; its address keeps working. The Review belongs under Timesheet and has no entry of its own |
| Timesheet | The form people know from the Excel workbook and the PDF (see "Timesheet sheet"): period bar, clock panel, a toolbar (Open a day, Show details, Change several days), the sheet, Overtime Total and signature lines |
| Day editor | A side panel beside the sheet from 1200px and a modal panel (a bottom sheet on phones) below 1200px: actual intervals, end date, confirmed breaks, label, leave in hours and minutes with `leave_kind` (vacation, sick, ot), WFH, notes, raw/eligible/credited figures computed by the server (see "Day editor") |
| Review | "What you sign": the same sheet in read-only mode with the detail rows on, beside a three-step checklist (days that need attention with acknowledgement and deficit choices, email and PDF with recipients, sign). Exact content, OT proposals, missing evidence, signature preview, explicit Sign off & Submit |
| Overtime (ledger/leave) | Posted/provisional/reserved/available balance, daily evidence, adjustments; record permission, reserve, "record use" (explicit, idempotent, on or after the leave date, partial allowed), cancel/reverse |
| History | Immutable revisions/PDFs, manual/auto origin, delivery attempts, reasoned correction and explicit resend |
| Settings/admin | Personal policy/templates and sharing (grant, change or revoke per item); users, annual holidays, sender, sharing grants and per-person submission/delivery status with recipients, without timesheet details |
| Shared timesheets | A grantee opens an owner's shared items from "Shared with me" under a persistent bar naming the owner and the shared items; actions outside the share are absent and refused by the server |

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
| Automatic signature image | Asked at signature upload as one explicit, audited authorization, pre-selected; if unticked, no image on automatic submissions until the user authorizes it later in Settings |
| Automatic submission note line | Off; when on, the PDF and email show the user's text (default "Automatic submission") |
| Show OT on PDF | On; can hide without erasing ledger |
| Notifications / outbound | Email, optional ntfy / dry-run initially |

These are declared design defaults, not claims that every value was user-confirmed. Calculation/calendar settings need an effective date. Preview changes to future/draft defaults, preserve explicit overrides and immutable revisions, and warn if next year's company calendar is missing.

## Timesheet sheet

The Timesheet page shows the form of the Excel workbook and the PDF. The header block carries the company, the title, "Employee:", "Payroll Date:" and "Period:". Two bands, "WEEK 1" and "WEEK 2", each run Monday to Sunday with the rows Day, Date, Label, Time, OT (h:mm) and Check. Check is the only row the Excel form lacks: it states each day's status in words and a shape, never by colour alone (Complete, Running, Open session, Confirm breaks, No times, Missing record, Upcoming, Calculation problem). "Show details" adds the rows "Worked on a workday" and "Worked on a day off". Below the weeks sit a legend, the "Overtime Total :" box and the signature lines.

- Label cell: the app label (Worked, Off, Vacation, Sick, Holiday, Shutdown), the holiday name for a Holiday, a second line for work from home or for OT-funded leave minutes, and a note marker. Excel's "Sick Day" and "Off Day (Overtime Used)" are not reintroduced: OT leave stays leave minutes with `leave_kind` ot (document 10, 2026-10-03 E-2). A day with no record shows no placeholder text; empty cells are blank.
- Every number is a server field shown as h:mm. The client computes no business minutes. The OT cell follows the PDF rule: the credited minutes of a complete day, "pending" while the day is incomplete or its breaks are unconfirmed, blank for a day without a record. "Overtime Total :" is the server's provisional credited total over all 14 days, including both Sundays, with a note when days are still pending; it equals the PDF total. The Excel formulas that conflict with the canonical rules are not reproduced (document 10, 2026-10-08).
- Formats are those of the PDF: US dates (MM/DD in the cells, MM/DD/YYYY in the header and period bar), durations as h:mm, times as 24-hour ranges such as 08:00-17:00 in the display zone, with several sessions listed and a running session marked. The accounting date stays the saved reporting-zone date.
- Non-working days (weekends, holidays and closures from the server calendar, never inferred from the weekday) carry one light tint with fine diagonal hatching. Today carries an accent top bar and a "Today" tag. A cell that needs input has an amber tint plus the Check text and shape.
- Signature lines: "Employee Signature" shows the signer's name when signed, or the pending-review state, with the date in the saved reporting zone and a link to the Review. "Manager Signature" shows "Not used yet" with an empty date. The signature image never appears on the Timesheet page. The lines and the link are absent in a shared view and for an imported period.
- Phones (below 768px): each week is a four-column table Day | Label | Time | OT, one row per day at least 54px tall, with no sideways scroll; the Check status folds into the Day cell and the Time cell tint. A whole row opens the day editor. The first screen shows the period card (with "<" and ">" beside the title), the one-row clock card and the compact tools, so the first day row is fully visible above the tab bar at 390x844; the page heading and the form title stay for screen readers only. Both layouts expose exactly one element per day, named by weekday and date, with an "Edit {date}" button (or "View {date}" when read-only).
- The Review uses the same sheet. In a shared view, the share bar stays above the period bar and controls outside the share are absent.

## Period bar, clock and batch mode

- Period bar: one title (period dates and a current, past or future badge), the payroll date, the due date in words with the reporting zone (for example "Due Tue 12/08/2026, 17:00 (America/Los_Angeles)"), exactly one status group (review and delivery) and "Review & sign off" (disabled with its reason for an imported period). The bar always names the current viewing zone compactly (for example "Times in America/Los_Angeles"), also when it equals the reporting zone; each day in the sheet keeps its saved accounting date. The reporting zone, display zone, the due time in the display zone and the explanation of accounting dates versus session times show in an extra note only when the display zone differs from the reporting zone. A banner says when edits to the period require a reason.
- Clock panel: one state-aware button. Clocked out shows "Clock in"; clocked in shows "Clocked in since HH:MM" with a static ringed dot and "Clock out", which opens the break confirmation. It is absent in a shared view (the owner's clock stays the owner's).
- Toolbar: "Open a day" (any date, also outside the displayed period), "Show details" and "Change several days". Batch mode is off by default: the selection boxes, "Select all", "Clear", the category choice ("Category for selected days") and "Preview changes" appear only after "Change several days" and leave with "Done". Batch category changes still preview conflicts with recorded work before saving. Without edit rights (view-only share) and for an imported period these controls are absent or disabled with their reason.

## Day editor

- From 1200px: a non-modal panel in its own column beside the sheet, so the sheet stays visible and usable. From 768 to 1199px: a modal side panel at the right edge with the page behind it inert (focus stays inside the panel), so it never covers a control that can take focus. Phones (below 768px): a modal bottom sheet of at most 86% of the screen height. Focus moves to the panel heading on open; Escape closes the panel wherever focus is (a nested dialog takes Escape first), as does Close, and focus returns to the day's date button.
- Order: a status banner, the stale/notice/error messages and the reason field (old or finalized periods), "Times" (sessions with Edit and Delete, one-tap break confirmation, Add session), "Label and leave", and "Figures (computed by the server)". The explicit end date, the visible "Input zone" and the separate save buttons ("Save session", "Save day fields") remain.
- One-tap breaks: a session with unconfirmed breaks offers "Confirm suggested breaks" (or "Confirm breaks as listed" for saved rows) and "No breaks taken"; each sends the same session update the form sends and is disabled until a required reason is typed. The suggestion is offered only when every suggested break lies inside the saved session.
- Leave is typed as "Leave hours" plus "Leave minutes" with "Leave kind"; the page converts them to the same whole `leave_minutes` (0 to 1440) and refuses fractions or out-of-range values with a message on the page.
- Label in the cell: on an editable sheet the Label cell is a picker (Worked, Off, Vacation, Sick, Holiday, Shutdown and "Work from home" = Worked with WFH) operated by mouse or keyboard. A pick is first sent as a one-entry batch preview and commits immediately only when the preview needs no reason and shows no conflict with recorded work; otherwise the existing review dialog ("Review label change for {date}") asks for the confirmation or reason. The picker is absent in a view-only share, in batch mode and for an imported period.

## Editing and review

Clock out/save confirms suggested/actual/no breaks. Unknown breaks or open intervals keep OT pending. Show explicit end date for overnight entry. Batch category changes must expose existing work conflicts and never silently delete clock evidence. Holiday work retains holiday classification and actual intervals.

Current/future draft edits audit automatically without a reason; old/finalized edits require one. Review flags attendance assumptions, incomplete OT and proposed deficits. The employee may acknowledge incomplete optional clock evidence and submit attendance. Invalid records require correction or explicit audited exclusion. Automatic submission uses valid saved attendance; for a period with no saved entries it uses the default labels (FR-03). Days without records credit no OT and create no deficit; incomplete days keep OT pending. The employee may add records later and correct the period (document 05).

Leave: the Day editor shows a non-blocking warning when the day's `ot`-kind leave minutes differ from the linked leave request's consumed minutes. It never spends or releases OT. The only way to consume reserved OT leave is the employee's "Record use" action; reservations not yet used stay visible as reserved.

## Visual standard

Plain CSS custom properties in `src/client/styles.css`; system font stack only (the content security policy allows no web fonts), with numbers, times and OT in the monospace stack. New values are added as custom properties, never as ad hoc values.

- Shape and depth: 4px corner radius (`--radius`); panels and cards use layered, diffuse soft shadows (`--shadow-panel`, `--shadow-overlay`) rather than hard borders.
- Motion: one shared transition token (`--transition`, 300 ms ease-out) on hover, active and focus states of buttons and links; a pressed button moves by a small token offset. No entrance or scroll animation; reduced-motion preferences are honored and the running-session dot is static.
- Buttons: primary (accent fill), secondary (card with accent border) and quiet (accent text), each with a visible focus ring (one shared token: a solid accent ring with a card-coloured gap, at least 3:1 against every surface in both themes).
- Touch: controls are at least 44px (`--tap-min`) below 768px and with a coarse pointer.
- Day-state colour roles (sheet rules and heads, non-working tint with hatching, today, needs input, selected, running) have light and dark values. State is never colour alone: every state also has words or a shape.
- High-density, mobile-first layout; light and dark themes follow the device.

## Email and PDF

Variables: {EmployeeName}, {PeriodStart}, {PeriodEnd}, {PayrollDate}, {SignOffStatus}, {SubmissionId}, {Revision}. Reject unknown variables; escape HTML values and validate recipients. Show setup/review previews. Normal email does not automatically include private OT notes or approval evidence. {SignOffStatus} renders "Submitted" for every submission, or the note text when an automatic submission's note line is on.

PDF: company header, salaried-exempt timesheet title, employee, payroll date, two Monday–Sunday blocks, dates/categories, optional time/OT rows, the credited OT total in h:mm over all 14 days, including both Sundays (hidden with the OT rows when Show OT on PDF is off), employee name/image/date and blank manager signature/date unless a real future approval exists. Use US Letter portrait, embedded Unicode fonts, readable long labels and bounded signature image. Remove stale year headers. Add submission/revision identifiers and sanitized filenames.

Manual sign-off requires both the employee name and a validated uploaded signature image. The unsigned automatic-image setting is separate.

The outgoing PDF and email of an automatic submission show no automatic indicator: the signature block prints the employee name and the date of the automatic submission in the saved reporting zone; the signature image appears only when the user has authorized automatic image use; a note line appears only when the user turns it on (default off; the user edits its text, default "Automatic submission"). The system still records the revision as automatic with employee review pending, empty signed_at and no sign-off, and the employee's own screens show that. Even a preauthorized signature image creates no signed_at or real sign-off. A separate OT evidence report can be exported when the user chooses.
