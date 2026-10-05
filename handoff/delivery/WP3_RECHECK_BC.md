# Independent review

Translation: [WP3_RECHECK_BC.vi.md](WP3_RECHECK_BC.vi.md). Task brief and results: [WP3-RECHECK-BC](tasks/WP3-RECHECK-BC.md). Evidence: `evidence/WP3-RECHECK-BC/` (masked, LF; probes stored as `*.mjs.txt`; screenshots `*-synthetic.png`); start at [00-commands.txt](evidence/WP3-RECHECK-BC/00-commands.txt).

- Package/date/reviewer and observable model/effort: WP3, fresh recheck of areas B and C after fix round 1 (findings WP3-B-01..03 and WP3-C-01..03, with regression checks); 2026-10-05 (UTC); task WP3-RECHECK-BC attempt 1 (board kind `audit`, profile timesheet-auditor, agent `a4f9e4253ee83db68`). Self-reported model `claude-opus-5-5`; effort requested xhigh, not observable. The strongest author model of the snapshot is opus (`claude-opus-5-5`, WP3 T01/T05/T08/T09/T13B); the fix authors WP3-FIXB and WP3-FIXC ran on `claude-sonnet-5-5`. The reviewer is not weaker. WP3-RECHECK-A ran at the same time in its own clone; no file, port or process was shared.
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness:
  - Reviewed commit `2f2520e1ab80ff55938b70cd469f0bfe888e04a2` (the WP3-REGATE `freeze_commit`, equal to origin/main).
  - Source digest `eeb417d3b903b30f1c21fa0a855424da02ab1d6e1d525f2509130f3933a48410` (721 files, handoff/ excluded), equal to the regate digest, before and after, in the project folder and in the scratch clone (see "Identity" in 00-commands.txt).
  - Source complete: every command ran in a git clone of that commit under `D:\timesheet-tmp\WP3-RECHECK-BC` (outside Dropbox). A second clone at the pre-fix freeze `a1cd566` ran the same regression tests and probes to show each original scenario failing before the fix.
- Decision: PASS / FIX REQUIRED / NOT VERIFIED: **FIX REQUIRED** (two Low findings).
  - Fixed: WP3-B-01, WP3-B-02, WP3-C-01, WP3-C-02, WP3-C-03.
  - Partly fixed: WP3-B-03. The automatic OT credit that an automatic submission posts has no actor and still reads "by someone else" in the owner's History (new finding WP3-RBC-01).
  - New: WP3-RBC-02. The Review hint misses a grantee change made before the period started (for example planned leave), when the owner has not finalized the period yet.
  - No regression in area B or C.
- Scope actually inspected/executed:
  1. Diff a1cd566..2f2520e: 13 source and 10 test files, the paths that WP3-FIXB and WP3-FIXC reported. Read: AGENTS.md, the brief, WP3-AUDIT-B/C (scopes and results), WP3_REVIEW_B/C, WP3-FIXB/FIXC with their binding decisions, WP3_REVIEW prompt, the WP3_HANDOFF fix-round sections, the WP3-REGATE results, WP3-REQ:445-465 and 580-592, docs/05 "Deadline and recovery" and the board entries.
  2. Each finding: my own probe on a real SQLite file against both commits, plus the freeze's regression tests run against the a1cd566 source.
  3. Area B regressions: jobs, retries and uncertain sends (with a real killed runner process and a live concurrent runner), the activation bound and F-1, the note × image matrix, GET safety of every GET route, CSS tokens, Edge screenshots on desktop and mobile.
  4. Area C regressions: route inventory, the 11 item sets × 17 shared routes, live checks, IDOR, re-sharing, the admin boundary, the revocation race (deterministic interleavings and 20 multi-process rounds), attribution, and where the hint can and cannot appear.
  5. New code: deprecated APIs, hard-coded CSS values, query plans.

## Evidence table

| Command | Result/exit | Evidence |
|---|---|---|
| `node --version`; `git rev-parse HEAD`; ls-tree digest (project, then clone) | v24.21.0; 2f2520e; eeb417d3…48410 (721 files) | `00-commands.txt` |
| `npm ci` (clone; pre-fix clone) | exit 0; exit 0 | `01-npm-ci.txt` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` | exit 0; 62 files / 1407 tests; SMOKE PASSED, 40 `PASS` lines; 0 deprecation lines | `02-verify.txt` |
| The freeze's 9 changed or new unit/integration test files run on the a1cd566 source | exit 1; 23 failed / 140 passed: every named B-01, B-02, B-03, C-01 and C-02 regression test fails before the fix | `03-red-prefix.txt` |
| Probe B1 automation bounds (freeze; a1cd566) | exit 0, 27 PASS; exit 1, 19 PASS / 8 FAIL (B-01 reproduced) | `04-b1-automation.txt` |
| Probe B2 send recovery and jobs (freeze; a1cd566) | exit 0, 25 PASS; exit 1, 21 PASS / 4 FAIL (B-02 reproduced) | `05-b2-send-recovery.txt` |
| Probe B3 History labels (freeze; a1cd566) | exit 1, 8 PASS / 1 FAIL (WP3-RBC-01); exit 1, 5 PASS / 4 FAIL (B-03 reproduced) | `06-b3-history-labels.txt` |
| `npm run test:e2e` (Edge, desktop and mobile) | exit 0; 127 passed, 5 skipped, 0 failed (5.2 min); 0 deprecation lines | `07-e2e.txt` |
| Probe C1 authorization, attribution, hint (freeze; a1cd566) | exit 1, 84 PASS / 1 FAIL (WP3-RBC-02); exit 1, 74 PASS / 11 FAIL (C-01 and C-02 reproduced) | `08-c1-authz-hint.txt` |
| Probe C2 revocation race | exit 0; 23 PASS: 20 deterministic interleavings and the PDF refused with nothing written; the control without the re-check lets the write land; 20/20 multi-process rounds with 0 writes after the revocation | `09-c2-race.txt` |
| Probe B4 GET safety (every GET route × owner, grantee, admin, anonymous) | exit 0; 204 requests, 1 writing (the audited grantee PDF download); the owner's hint review was among them | `10-b4-get-safety.txt` |
| Probe B5 CSS tokens (freeze and a1cd566) | exit 0; 0 literals outside `:root`, 0 inline styles, radius/shadow/transition through tokens only | `11-b5-css-tokens.txt` |
| Probe B6 note × image matrix | exit 0; 30 PASS | `12-b6-note-image-matrix.txt` |
| Probe B7 query plans of the new queries | exit 0 | `13-b7-query-plans.txt` |
| Probe U1 Edge UI on the built server (desktop and mobile) | exit 1; 25 PASS / 2 FAIL (WP3-RBC-01 on both viewports); 0 overflow, 0 unnamed controls; 10 screenshots viewed | `14-u1-ui.txt`, `recheck-bc-*-synthetic.png` |
| Race and regression files × 5 fresh rounds | exit 0 in each round; 8 files / 126 tests per round (deadline-race, delivery-crash, jobs-restart, delivery, deadline, history, review-grantee-changes, sharing) | `15-race-rounds.txt` |
| Identity after; privacy check on a temporary index | see files | `16-digest-after.txt`, `17-privacy.txt` |

## Finding dispositions

| Finding | Disposition | Evidence |
|---|---|---|
| WP3-B-01 (Medium) | **Fixed.** An account created on 2026-11-12, after activation, that never saved settings gets no automatic revision for the three periods already overdue (a1cd566: 10-16, 10-30 and 11-13). It gets no timesheet row, overdue record or job either. Its first deadline after creation (payroll 11-27) is automated with 14 default-labelled days (F-1). An account created inside a period is automated at that period's deadline. Accounts created before activation still get F-1 (one revision, 14 days, no OT, no deficit, no ledger row) for the first deadline after activation, and nothing for the earlier one. Four device zones give identical results. The 4 regression tests fail on a1cd566 and pass on the freeze. | `04`, `03` |
| WP3-B-02 (Low) | **Fixed.** A real runner process was killed after `sending` was committed on the fifth (last) attempt. While its lease is valid nothing changes. One pass after expiry: the attempt is `uncertain` (`lease_expired_while_sending`), the owner sees the decision prompt, and a plain resend is refused with `delivery_uncertain` (a1cd566: still `sending`, no prompt, `delivery_in_progress`). 6 h of passes capture nothing. One decision sends exactly once; a second decision is 409; audited once; one revision. The regression test fails on a1cd566. | `05`, `03` |
| WP3-B-03 (Low) | **Partly fixed.** The raw codes are gone, and `timesheet.auto_finalize` and `deadline.overdue` read "automatic". But the actor-less `ot_ledger.credit` that the automatic submission posts still reads "OT credit posted [by someone else]" (API, client model and Edge on desktop and mobile). See WP3-RBC-01. | `06`, `14`, `recheck-bc-history-ot-credit-*-synthetic.png` |
| WP3-C-01 (Medium) | **Fixed, with WP3-RBC-02.** The owner's Review lists exactly the days whose last change came through the share, checked against my own oracle over the audit rows. An owner change takes a day over. After the owner's sign-off only later grantee changes count. The automatic submission does not reset the window. The hint is absent under `/api/shared` (404), for owner B, in the grantee's own review (which names only the grantee's own grantee) and in all 5 admin GETs. It changes no row. Hash: the shown `payload_hash` equals the canonical hash of the payload. On a copy of the database where the grantee's audit rows were re-attributed to the owner (same content, hint hidden), the hash is identical. Sign-off with the hint shown stores reviewed = payload = shown hash, and the snapshot holds no grantee name. Visible and named on desktop and mobile; E-8 tokens (4 px radius, `--rule` border, panel shadow). | `08`, `14`, screenshots |
| WP3-C-02 (Low) | **Fixed.** These stay unattributed: an admin-route revocation by an admin who holds a share, a same-second admin act before a later grant, and a grantee leaving. On a1cd566 all three admin revocations were attributed to "Example Admin". Downloads read "Downloaded by …", edits "Changed by …". All 26 attributed rows are grantee writes through `/api/shared`. | `08`, `03` |
| WP3-C-03 (Info) | **Fixed.** `src/server/types.ts` `AppEnv` comment describes `requireShare`. | diff |

## Findings

| ID | Severity | File/function | Reproduction | Expected / actual | Rule/AC | Bounded fix |
|---|---|---|---|---|---|---|
| WP3-RBC-01 | Low | `src/client/components/sharingModel.ts:177` (`SYSTEM_OPERATIONS`, used by `historyActorBadge` and `HistoryScreen.tsx:21`); the actor-less postings at `src/server/services/finalization.ts:627` and `:650` | Probe B3 / U1: an employee with auto-submit on and a Saturday OT session; activation; the deadline pass submits automatically and posts a 180-minute credit with `actor_user_id` NULL. `GET /api/history` → History shows "OT credit posted [by someone else]" (`data-history-actor="other"`). An authorized automatic deficit debit takes the same path. | Expected (coordinator decision B-03: "label system events as system events, never as 'someone else'"; WP3_REVIEW_B B-03 "label actor-less events as an automatic system action"): automatic. Actual: only three hand-listed operation codes are recognized as system events | docs/04 Screens, F-Q2, WP3-B-03 | Decide "system" from the event, not from a list. For example, the server sends `actor_is_system: true` when `actor_user_id` IS NULL (no identifier leaves the server), and `historyActorBadge` uses it. Add a test: an automatic submission with an OT credit (and an authorized deficit debit) shows "automatic". |
| WP3-RBC-02 | Low | `src/server/services/sharedActs.ts:91-94` (`granteeChangesForReview`, the `occurred_at >= start of period` window when there is no owner finalization) | Probe C1 §11: on 2026-10-05 a grantee records Vacation for 2026-10-20 (period 2026-10-12..10-25, not started yet); on 10-14 it edits 10-13. On 10-26 the owner opens Review of 2026-10-30. The hint says "1 day last changed by Synthetic Grantee" (10-13 only), but both days were last changed by the grantee. | Expected (purpose of the hint, WP3-REQ G "fabricated attestation" mitigation): every day of the period last changed through a share since the owner's previous finalization. Actual: changes made before the period start are dropped, although the work-date filter already limits the rows to the period. This matches the literal coordinator text ("since the period started"), so the coordinator should either fix it or accept the gap explicitly. | WP3-REQ C/G, coordinator decision C-01 | With no previous owner finalization, use no time lower bound: the period's work dates already bound the rows. Or record a coordinator decision that accepts the gap. Add a test: a grantee edit made before the period start is listed. |

No other defect was observed.

## Judgements requested by the brief

- **Item 5, `delivery-crash.test.ts` "claimed 0".** It reflects the new order correctly. Recovery now runs at the start of every pass that owns the send handler, before any claim. The outcome assertions (uncertain, `lease_expired_while_sending`, job in intervention `delivery_uncertain`, nothing sent later, one resend after the decision) are unchanged, and they still pass. The changed assertion fails on a1cd566 (claimed 1, intervention 1). There is one small loss: the handler's own `sending` branch (`sendJob.ts:228-232`) is no longer reached by this test. My probe B2 §3b exercises it (a re-claimed job is marked uncertain and stops permanently, nothing sent). Optional: a direct unit test.
- **Item 5, residual edge.** Acceptable. Probe B2 §3a reproduces it: the lease expires after the pass-start recovery and before the claim sweep. The job goes to intervention `lease_expired` and the attempt stays `sending`. Until the next pass (default interval 15 s) the owner sees "Sending", and a plain resend answers 409 `delivery_in_progress`. The next ordinary pass makes it `uncertain` with the prompt, and one decision sends exactly once. It is never resent. Cosmetic: the job keeps `last_error = lease_expired`, not `delivery_uncertain`.
- **Item 5, the creation bound clamping saved settings.** Correct and necessary. On a1cd566 the explicit "apply to overdue drafts" choice of an account created on 2026-12-12 submitted every period since activation (10-16 to 12-11), five of them before the account existed, most of them empty (B1 §4). The decision's first sentence ("must never finalize a period whose deadline passed before the user's account existed") outranks "keep the current behaviour". Ordinary saves keep their own instant (≥ creation, asserted). The explicit choice still submits an overdue period whose deadline is after the creation. Docs/05 does not yet state the bound (risk R5).
- **Item 6, `SHARED_ACT_OPERATIONS` instead of a recorded path or flag.** It meets the decision's outcome at this snapshot:
  - Code reading: only `timesheetCommands.audit()` (`ctx.actor`, set apart from the subject only by `requireShare`) and the shared PDF route write these codes with a foreign actor. The seed and the CLI write them with actor = owner.
  - Probe C1 §8: all 26 attributed rows were grantee writes through `/api/shared`. The admin-route, same-second, leave and `user.*` cases stay unattributed.

  It is an inference, not the recorded marker the decision named. The drift-guard test is hand-written, has five routes and checks one direction only. It does not derive the routes from `SHARED_ROUTES`, and it cannot catch a future non-shared route that writes `day_entry.*`/`work_session.*` for another person (for example an administrator import or correction in WP4). Judgement: enough for WP3; a recorded marker is not required now. It becomes required, or at least a reverse guard does, before any non-shared path may write those codes for someone else (risk R1).
- **Item 6, the grantee leaving is no longer named.** This is consistent with WP3-REQ:455-457. The leave is the grantee's own act on the share record through `/api/shares`, not an event "performed under a grant", and "events by anyone else stay unattributed". It also follows the C-02 decision. The owner still sees the share gone from the list, and the History field table shows `revoked_by_role: grantee`. Acceptable; optional wording by role (R8).
- **Item 6, the replaced time-window test.** No coverage that matters was lost. The old test inserted a synthetic row after the share ended, to check the window rule that the decision now forbids. A real write after revocation is prevented upstream by the live check and the in-transaction re-check (C2: 20/20 rounds, 0 writes after the revocation; the control proves the window is real). The new tests cover admin-route, same-second, leave and the five write routes.

## Regressions

- Area B: none.
  - Retries are 60/300/900/3600 s, then the fifth attempt.
  - A live runner's in-flight `sending` attempt is not touched by another runner's pass-start recovery, and it completes `accepted`.
  - Activation in the past is refused. Nothing is automated 30 s before a deadline. One revision per period.
  - F-1 holds for accounts created before activation.
  - The 2×2 note × image matrix gives images 0/0/1/1, the note only when on, `{SignOffStatus}` "Submitted" or the note text, and no other automatic indicator.
  - GET safety: 204 requests, only the audited grantee PDF download writes.
  - Tokens only; 0 overflow and 0 unnamed controls on desktop and mobile.
  - e2e 127 passed, 5 skipped.
- Area C: none.
  - 88 (method, path) entries as at a1cd566; exactly the 17 shared routes, and the review route is not among them.
  - 11 item sets × 17 routes as expected. Stranger and admin 404, anonymous 401, `no-store`.
  - Live revoke/leave/admin revoke/scope change/deactivations apply on the next request. IDOR 404. No re-share. The admin cannot create a share. The admin list has only the allowlisted fields.
  - No `grantee_changes`, secret or address in shared responses.
  - Race 20/20.

## Risks and optional improvements (not proven defects)

- R1: `SHARED_ACT_OPERATIONS` inference (see item 6). Before WP4 adds an import or administrator edit of day or session rows, record a marker on audit rows written through `/api/shared`, or add a reverse guard. Derive the drift guard from `SHARED_ROUTES`.
- R2: residual edge of B-02 (see item 5), at most one runner interval.
- R3: the handler's `sending` branch has no direct test any more.
- R4: never-configured accounts created before activation (the seed admin, a seed employee) are submitted automatically every period and fail `recipient_missing` (B1 §6). This is audit A R3; the coordinator kept the default, and the owner's decision is pending.
- R5: docs/05 "Deadline and recovery" does not state the account-creation bound (the WP3-FIXB doc follow-up). Add it in EN and VI.
- R6: query cost. The hint reads all of the owner's audit rows through `audit_events_owner`. The finalization lookup reads every `timesheet_revision` audit row of all users through `audit_events_entity`. Both are bounded by data size, not by request, and are fine at this scale. Optional: an owner-scoped filter.
- R7: the hint shows a count; it does not list the dates (`work_dates` is sent but not shown). Optional.
- R8: optional History wording for `share.revoke` by role ("ended by the person you shared with" / "by an administrator"), without a name.

## Required gates unrun/blocked and why

- Real SMTP, NAS deployment and production activation: forbidden before the owner's pilot authorization.
- `validate_package.py --preflight` was not run by this task (WP3-REGATE ran it, exit 0). No mandatory recheck line was left unrun.

## Disposition of previous findings

WP3-B-01, WP3-B-02, WP3-C-01, WP3-C-02 and WP3-C-03 are fixed. WP3-B-03 is partly fixed (WP3-RBC-01). WP3-RBC-02 is new. The WP3-REGATE PASS, the fix reports and the HANDOFF lines were treated as claims and re-executed: verify (62 files / 1407 tests, 40 smoke `PASS` lines) and e2e reproduce.

## Software readiness, owner permission and pilot result

- Software readiness (areas B and C): not accepted until WP3-RBC-01 and WP3-RBC-02 are fixed (or RBC-02 is accepted by decision) and rechecked.
- Owner permission for real sending or activation: not requested, not given. Pilot result: none.

## One next action

The coordinator dispatches one bounded fix for WP3-RBC-01, and for WP3-RBC-02 or a recorded decision that accepts it, under [FIX_FINDINGS](../prompts/FIX_FINDINGS.md). The freeze, the gate and a fresh B/C recheck at the new digest follow.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP3-RECHECK-BC attempt 1, agent `a4f9e4253ee83db68`. Reviewed fix authors: WP3-FIXB `a733c2b6b34235750` and WP3-FIXC `a3cd9ff3fef21b47a` (sonnet); committer WP3-FIX-FREEZE `a53d1c0a0a86519c5`; verifier WP3-REGATE `a1ae9d6bf43d5d60f`; plus the WP3 authors on the board.
- Fresh context; confirm reviewer did not author changes: fresh context. This reviewer authored nothing in WP3, including the fixes. It wrote only this report pair, the Results section of its brief and `evidence/WP3-RECHECK-BC/`. Scratch-only edits: the freeze's test files were checked out into the a1cd566 scratch clone for the red run.
- Source digest before/after; gate evidence for that snapshot: `eeb417d3…48410` before and after; WP3-REGATE evidence is for the same commit and digest.
- New report path preserving previous review history: `handoff/delivery/WP3_RECHECK_BC.md` and `.vi.md` (new); WP3_REVIEW_B/C are untouched.
- Finding dispositions and next coordinator fix/recheck task: as above; one bounded fix (RBC-01, RBC-02 or a decision), then a fresh B/C recheck.
