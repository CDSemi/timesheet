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

## Confirmed orchestration change — 2026-10-02
The owner requested a single Claude prompt, vendor-neutral work roles, a coordinator-only
main agent, subagents selected by task complexity for planning/diagnosis/implementation/
fixes/verification/independent audit, and durable recovery after usage reset.
Document 08 and ORCHESTRATE replace the former vendor split and no-subagent/model-change
policy. They do not change business rules, WP1–WP5 gates, subscription billing or the
owner's real-activation boundary. Independent means separate author/reviewer context
and executed current-source evidence, not necessarily a different vendor.
Official subagent/model/resume/checkpoint capabilities were checked on 2026-10-02;
the actual local Claude client/account has not been exercised by this documentation change.
No automatic reset scheduler is configured.

## Owner decisions — 2026-10-02 (commits and routing)

- Commit/push authorization (owner standing decision, confirmed directly in the main session): only `timesheet-committer` commits and pushes; directly on `main` with a push after every commit until the first release, then side branches and PRs; no amend, force-push, history rewrite or tags; no secrets, signatures or personal data. Rules in document 08, "Commits and pushes".
- Adaptive routing: the owner delegated model choice per dispatch to the coordinator under the document 08 rubric (size, risk, novelty). Profiles fix role and effort. Fable/best/opusplan, max effort and speed changes still need an owner decision.
- Coordinator decision (reversible): task briefs/results under `handoff/delivery/tasks/` are English-only; Vietnamese stays for human-facing documents, prompts, templates, NEXT_ACTION, CHECKPOINT/HANDOFF/REVIEW and chat.

## Coordinator decisions — workflow audit fixes (2026-10-02 America/Los_Angeles, WF-AUDIT findings WF-A-01..WF-A-10)

Reversible coordinator decisions made for task WF-FIX1; none changes a business rule.

- Governance scope (WF-A-02): workflow tasks use package `GOV`, outside `authorized_scope` (WP1–WP5). GOV tasks are exempt from the active-package running check, and a done GOV audit needs `reviewed_commit`. A GOV PASS is identified by its reviewed commit and is superseded only by a change to a governance path (listed in document 08). State and records (NEXT_ACTION, STATE, board, checkpoints, this document) are not governance paths.
- Privacy gate (WF-A-03, WF-A-09): `scripts/precommit-check.mjs` now blocks unquoted YAML/INI secrets, PDF/image/signature files whose basename lacks `synthetic` (`reference/fixtures/` and `reference/examples/` stay allowed) and concrete user-profile paths. Deferral: evidence already committed (it contains the Windows account name in some logs) is not rewritten; no history rewrite and no retroactive redaction commit is planned. New evidence is masked with `<user>`; the committer may mask staged evidence logs under the rules in document 08.
- Effort `max` (WF-A-04): removed from the validator's allowed efforts. Adding it back needs an owner decision, consistent with document 08.
- Package-final snapshot (WF-A-10): defined in document 08 as the snapshot whose audit PASS would accept the package, including FIX REQUIRED rechecks that unlock the next package. It keeps a separate verifier gate; `gate_included` is for intermediate S-size fixes only. The coordinator re-plans the F-01 chain on the board accordingly.

## Owner decisions — 2026-10-03 (WP2, reply "dùng đề xuất")

The owner adopted the WP2-PLAN section E recommendations.

- E-2: OT-funded leave is not a day category. Day entries carry leave minutes with `leave_kind` vacation | sick | ot. L for deficits (R-05) is the leave minutes the employee entered. The UI warns when the day's ot-kind leave minutes differ from the leave request's consumed minutes. OT is never auto-spent.
- E-3: OT leave is consumed only by an explicit, idempotent employee "record use" action on or after the leave date; partial use is allowed. An unconsumed reservation stays reserved until used or cancelled, and WP3 review flags it. WP2 needs no job runner.
- E-8: keep plain CSS; the visual standard is CSS custom properties, 4px radius and 300 ms ease-out transitions on interactive states (document 04). The AGENTS.md UI section is amended by a separate governance task.

## Coordinator decisions — WP2 routine defaults (2026-10-03, reversible; the owner may veto)

Basis: WP2-PLAN section E; none changes a confirmed requirement.

- E-1: at Clock out the present break list is the complete set and replaces saved rows; an omitted list keeps saved rows (unconfirmed days only).
- E-4: holiday import preserves explicit labels and manual calendar dates.
- E-5: insufficient available balance at reservation returns 409 and creates nothing.
- E-6: provisional balance = credited minutes of complete days in unfinalized periods.
- E-7: permission evidence is a text reference until the WP3 file store exists.
- E-9: add `@playwright/test` with a separate `test:e2e` script.
- E-10: payroll rows of unfinalized periods are refreshed; finalized rows are refused.
- E-11: the admin sets a temporary password out of band.
- E-12: warn from 1 October when next-year calendar dates are missing.
- E-13: WP2 history is the audit trail plus policy/calendar versions.

## Coordinator decision — WP2-ADV-REVIEW finding ADV-A-02 (2026-10-03, reversible; the owner may veto)

- R-05 applied to corrections: a correction that raises a deficit debit is a new debit of the increase. The increase is checked against the available balance (`canDebit`); when the balance cannot cover it, the increase stays pending with no ledger entry (no silent overdraft). A correction that lowers a posted credit after it was spent is still kept and flagged for reconciliation (R-06, LG-08), because it states a historical fact. This applies the existing R-05 and R-06 and changes no confirmed requirement. Source: WP2-ADV-REVIEW (ADV-A-02), task WP2-ADVFIX.
