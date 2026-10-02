# Decisions and sources

Latest explicit user requirements outrank the earlier quoted proposal and workbook formulas. English is authoritative. Document 02 owns calculations, 03 data invariants, 05 submission, 09 sequencing. Change a real contradiction explicitly in both languages.

## Confirmed requirements

Eight hours/day; configurable start/end and N/M; flexible arrival; midpoint-down examples 75→60 and 76→90; daily calculations without week/period netting; all off-calendar work OT-eligible; non-worked leave/off no debit. Optional deficit handling, manager-permitted OT leave conversion, UTC/current-zone display, overnight support, old-edit reasons and automatic audit. Sign-off plus configurable unsigned deadline submission, email/template/notification/image settings, individual ownership and later manager access. Docker on Synology; familiar Excel PDF. Bilingual docs, phase prompts and subscription-first usage.

## Design defaults

These close gaps without another interview; they are not invented user confirmations.

| ID | Default |
|---|---|
| D-01 | Hono/TypeScript + React/Vite + SQLite + pdf-lib; one container. C# and Next.js remain viable alternatives. |
| D-02 | Exclude all three example breaks, shift suggestions with arrival, confirm actual/no breaks; unknown stays pending. |
| D-03 | N is strict activation, not a deductible; nearest M with exact half down. |
| D-04 | All off-calendar minutes bypass B/N but retain M; show raw eligible minutes even when credit rounds to zero. |
| D-05 | Overnight stays in starting daily bucket; split calendar eligibility at local boundaries. Saved reporting zone owns accounting. |
| D-06 | Deficits default ignore; exact deductions, no silent overdraft. Overnight actual minutes fulfill attendance; missing/full non-worked leave does not cause debit. |
| D-07 | Post OT at immutable finalization; provisional separate. Reserve approved leave, consume on leave date, 1:1 minutes. |
| D-08 | Mon–Fri, America/Los_Angeles, prior Tuesday 17:00; hour/zone are proposed, not established by workbook. |
| D-09 | Auto-submit preference enabled after setup; dry-run until activation; auto-image off; no fabricated sign-off. |
| D-10 | Email first, ntfy optional, SMS deferred; authenticated review links sufficient initially. |
| D-11 | Explicit annual company holiday versions; personal absence is separate from calendar classification. |
| D-12 | Current = earliest payroll on/after reporting-zone today; highlighting an old unresolved period does not make it current. |
| D-13 | English initial UI permitted; bilingual docs required; manager portal later. |
| D-14 | Confirmed Max 20x; retain bounded workload planning, zero planned reserve spend and no paid API. Workload is not a quota promise. |

## Account evidence update

On 2026-09-30, the user supplied a plan screenshot showing Max with 20x Pro usage. This establishes the Claude tier, not remaining allowance or extra-usage settings. Payment details are not reproduced.

## Workbook evidence

The [sanitized template](../reference/inputs/Timesheet_Rev8_2026.xlsx) supports the 14-day Friday-payroll/Tuesday-due form. It does not establish legal payroll policy, true past signature dates, email delivery or opening OT balance. [Input notes](../reference/inputs/README.md) record what was removed, its hash and formula defects. On 2026-09-30 the owner removed all personal data (dated attendance sheets, name, signature and metadata) and published the template as a public sample; the personal original is not retained.

Replace the earlier proposal's 8.5-hour calculation/debit, auto-sign wording, in-memory-only scheduling assumption and live-file-only backup shortcut. Exactly-once ordinary SMTP delivery must not be assumed.

## Official references

Reviewed during preparation on **2026-09-29**; Claude Desktop/model/Max and ChatGPT model controls rechecked on **2026-09-30**. Choices/defaults/estimates are project judgments; sources document capabilities and constraints. Pin supported dependency versions during implementation, not from undated assumptions.

| Source | Use |
|---|---|
| [Hono on Node](https://hono.dev/docs/getting-started/nodejs) | Node application baseline |
| [SQLite WAL](https://www.sqlite.org/wal.html) | Local-host/WAL constraints |
| [SQLite backup](https://www.sqlite.org/backup.html) | Consistent backup |
| [pdf-lib](https://pdf-lib.js.org/) | PDF generation/embedding |
| [ntfy configuration](https://docs.ntfy.sh/config/) | Optional notification adapter |
| [Next.js self-hosting](https://nextjs.org/docs/app/guides/self-hosting) | Alternative assessed |
| [ChatGPT models](https://learn.chatgpt.com/docs/models) | Work/Codex models and controls |
| [ChatGPT pricing/usage](https://learn.chatgpt.com/docs/pricing) | Included usage and credit/speed distinctions |
| [Workspace usage limits](https://learn.chatgpt.com/docs/enterprise/usage-limits) | Workspace controls; verify actual Business UI |
| [Claude Code Desktop](https://code.claude.com/docs/en/desktop) | Local project selection, model/effort menus and permission modes |
| [Claude model configuration](https://code.claude.com/docs/en/model-config) | Model names, selectors and effort |
| [Claude Max](https://support.claude.com/en/articles/11049741-what-is-the-max-plan) | Max tiers |
| [Claude usage practices](https://support.claude.com/en/articles/9797557-usage-limit-best-practices) | Usage dashboard and allowance planning |

Public checks did not inspect account quota, actual billing controls, NAS architecture, credentials or recipients. Verify those in the real client/setup. Availability can change; the dated model list is not permanent entitlement.
