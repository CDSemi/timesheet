# Time and OT rules

This document owns calculations. Preserve raw inputs, policy/calendar versions and explainable ledger movements.

## R-01 — units and completeness

Store UTC instants with second precision, date-only accounting dates separately, and integer ledger minutes. Intervals are half-open [start,end); end follows start. Reject same-user overlaps across all work dates; breaks must be inside work sessions and non-overlapping. Open/missing sessions or unknown break information are incomplete, not zero work. They create no automatic ledger credit/debit.

Subtract confirmed excluded breaks; aggregate seconds first, then floor each daily regular/non-working aggregate to complete minutes once. Retain seconds as evidence. Minute-entry UI writes :00; live clocks retain seconds. Do not round each session.

## R-02 — schedule and flexible arrival

Default B=480 worked minutes, reference 08:00–17:00. Excluded breaks: 10:00–10:15, 12:00–12:30, 14:30–14:45 (60 minutes total). Treating all three as excluded is an explicit internal-tracker design interpretation, not a payroll classification.

Each break has placement, duration and `counts_as_work`. Default suggestions shift with first clock-in: a 09:00 start moves breaks to 11:00, 13:00 and 15:30. Confirm suggested breaks, edit actuals or explicitly confirm none at save/Clock out/review. Unknown is different from confirmed zero; never deduct future breaks on a short/open shift.

Expected finish = actual start + required work + excluded breaks/interruptions. With 60 excluded minutes, 07:00/08:00/09:00 starts imply 16:00/17:00/18:00. Reference clock time alone creates no OT/deficit. Validate consistency between configured reference duration, required minutes and breaks.

## R-03 — work date and eligibility

An overnight session normally belongs to its starting `work_date` in the saved reporting IANA zone (default America/Los_Angeles). Multiple sessions share one daily B. Browser-zone changes and midnight do not reset that target.

Split actual net work at reporting-zone calendar boundaries. R = minutes on scheduled weekdays excluding company holidays/closures; O = minutes outside that calendar. Holiday/closure overrides weekday. Personal leave/Off labels do not change calendar eligibility.

Example default: Friday 22:00–Saturday 02:00, no breaks, has R=120, O=120, credited OT=120, recorded on Friday. Monday 22:00–Tuesday 07:00 less 60 breaks has R=480, O=0, OT=0. B/N/M use the policy effective for the work date; calendar classification uses the version effective on each segment date.

## R-04 — daily formula

B=480, N=30, M=30 by default; all integer minutes, B>0, N>=0, M>=1.

1. Excess E=max(0,R−B).
2. Weekday eligible A=E only if E>N; otherwise A=0.
3. Off-calendar eligible is all O; apply neither B nor N.
4. Eligible T=A+O.
5. Round T once per work date to nearest multiple of M; an exact midpoint rounds down. With q=floor(T/M), r=T mod M, credit=M×(q+1 if 2r>M, otherwise q).

N activates eligibility; it is not a deducted allowance. M applies to both classes. Keep raw, eligible and credited values distinct. JavaScript Math.round alone has the wrong tie rule.

| Weekday excess | Credit |
|---:|---:|
| 30 | 0 |
| 31 | 30 |
| 45 | 30 |
| 46 | 60 |
| 75 | 60 |
| 76 | 90 |

On a fully non-working day, 120 worked credits 120; 15 is eligible but rounds to 0; 16 credits 30. Separate days with +20 each credit zero each. Never net weekly or across a two-week period.

## R-05 — deficits

Only complete confirmed actual work on a scheduled work date with attendance expected can create a deficit. With attendance-fulfilling leave L capped at B, where L is the leave minutes the employee entered on that day (any `leave_kind`: vacation, sick or ot): required=max(0,B−L); deficit=max(0,required−(R+O)). Overnight O counts toward attendance while separately OT-eligible. Leave neither counts as actual work nor lowers the regular OT target B.

A non-worked full-day Off/Holiday/Vacation/Sick/Shutdown creates no credit or debit. Missing records remain incomplete. Four hours work + four hours leave has neither deficit nor OT.

Modes: `ignore` default, `auto_deduct`, `choose_at_signoff`. Debit exact deficit minutes without N/M. Manual review shows the decision; automatic submission in choose mode leaves it pending with no debit. Insufficient available balance leaves the proposed debit pending, not silently negative. Known credits may still post.

## R-06 — ledger and OT leave

Draft credits are provisional. Finalizing a manual/automatic immutable revision transactionally posts computable credits and authorized deficits once, independent of email acceptance. Automatic origin remains unconfirmed. Incomplete days post nothing; delivery retries post nothing again.

OT-funded leave is not a day category. A day entry carries leave minutes and a `leave_kind` of `vacation`, `sick` or `ot`. Changing a leave label or `leave_kind` never spends OT. The UI warns when the day's `ot`-kind leave minutes differ from the consumed minutes of the linked leave request; the warning never changes a balance.

Record explicit manager permission: name/identity, date, evidence and self-recorded versus future authenticated approval. Reserve approved minutes. OT leave is consumed only by an explicit, idempotent employee "record use" action, allowed on or after the leave date; no automatic or job-driven consumption exists. Partial use is supported. An unconsumed reservation stays reserved until it is used or cancelled; WP3 review flags it. Release unused cancellations and compensate already-used reversals. Default 1:1, so eight hours costs 480 minutes, not 510.

Posted balance=sum(deltas); available=posted−active reservations. Prevent concurrent double spending transactionally. Unique source-event keys prevent duplicate postings. Correct a posted credit by its difference: old 60 → new 90 adds +30. Link original and correction revisions. A truthful correction may make the balance negative; retain and flag it rather than erase used leave.

## R-07 — history and zones

Policies/calendars are versioned with effective dates; changes apply prospectively and never silently rewrite finalized snapshots. Old corrections retain historical rules unless a separately documented retroactive policy correction is explicitly chosen.

Current means the earliest configured payroll date on/after today's date in the reporting zone. Older unsent periods are still old. Current/future drafts need no edit reason; any old or finalized revision needs one. Always audit actor, UTC time and before/after.

Use actual `signed_at`, never TODAY(). Manual time entry must show and use its selected input zone, defaulting to the current display zone; conversion must preserve the saved accounting date. Display instants in the viewer's current zone while keeping accounting dates unchanged. PDF/deadline use the saved reporting zone. Reject nonexistent DST local times; require explicit offset/fold for ambiguous times. Duration is elapsed UTC time.

See [fixture guide](../reference/fixtures/README.md) for independent expected examples.
