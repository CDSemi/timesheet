# Product requirements

## Purpose

A personal timesheet tool, ready for isolated coworker accounts later. Record attendance, actual work and internal OT credits; produce the familiar C&D PDF; request employee sign-off; email by the configured deadline. OT supports evidence for a manager discussion; this is not a wage/payroll calculator. Huy initially acts as employee and administrator. A manager portal is future scope.

| ID | Requirement | Package |
|---|---|---|
| FR-01 | Local login, private ownership, user administration and deactivation | WP1/WP2 |
| FR-02 | Fourteen-day periods, payroll anchor and separate deadline | WP1 |
| FR-03 | Default Worked on scheduled weekdays, Holiday on company holidays, Off otherwise | WP2 |
| FR-04 | Edit Worked/Off/Vacation/Sick/Holiday/Shutdown, partial leave and multiple dates | WP2 |
| FR-05 | Configurable reference start/end/breaks, 480-minute target, flexible arrival | WP1/WP2 |
| FR-06 | Manual entry, Clock in/out, multiple sessions, UTC and overnight support | WP1/WP2 |
| FR-07 | Daily OT, strict N activation, midpoint-down M rounding, off-calendar OT | WP1 |
| FR-08 | Optional deficit deduction automatically or at sign-off; no absence-day debit | WP1/WP2 |
| FR-09 | Traceable OT ledger, corrections, recorded manager permission and partial leave conversion | WP2 |
| FR-10 | Explicit employee sign-off bound to immutable revision | WP3 |
| FR-11 | Familiar PDF; manual sign-off requires name and signature image; automatic image configurable | WP3 |
| FR-12 | Recipient/templates, notifications, deadline switch and durable delivery | WP3 |
| FR-13 | Annual company holiday calendar and effective policy versions | WP2 |
| FR-14 | Audit actor/time/before-after; require reasons for old/finalized edits | WP1/WP2 |
| FR-15 | Docker, persistence, backup/restore and operational recovery | WP4 |
| FR-16 | Controlled Excel import and evidenced opening OT balance | WP4 |

## Calendar and attendance

The workbook has Friday payroll every 14 days. For payroll P, the period is P−18 through P−5 inclusive; due day P−3 is Tuesday. Seed anchor: payroll 2026-10-02, period 2026-09-14…2026-09-27. Proposed deadline hour: 17:00 America/Los_Angeles, configurable; the workbook does not establish that hour. Payroll-date exceptions are explicit.

The dashboard highlights the oldest unresolved period without redefining “current.” R-07 defines current by the next configured payroll on/after reporting-zone today. Older unsent periods still require edit reasons.

WFH is a location property that may render as the familiar label. Personal Off/Vacation/Sick does not turn a normal-calendar Tuesday into weekend OT. Full/partial leave is expressed in minutes. Planned attendance labels are not actual clock records or employee attestations. Missing clock data creates no invented hours, OT or deficit. Attendance submission may proceed while optional OT evidence remains pending.

## Initial boundary

Two isolated test users must work throughout the first release. Administrator status does not automatically grant private timesheet/signature access. Future manager access needs explicit assignment.

Initial scope includes holiday CSV import, basic user administration, email notifications and OT evidence export. Optional ntfy may remain disabled. Deferred: paid payroll calculations, HR synchronization, SMS, public registration, native mobile apps, manager portal, arbitrary report designer and multi-node hosting.

The tracked workbook is a [sanitized template sample](../inputs/README.md); no personal original is retained. Import history as `imported_unverified`; do not infer genuine sign-off, sent email or zero OT from its blank caches, 8.5-hour formula or dynamic signature dates.
