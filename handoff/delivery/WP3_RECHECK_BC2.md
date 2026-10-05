# Independent review

Translation: [WP3_RECHECK_BC2.vi.md](WP3_RECHECK_BC2.vi.md). Task brief and results: [WP3-RECHECK-BC2](tasks/WP3-RECHECK-BC2.md). Earlier B/C recheck (kept unchanged): [WP3_RECHECK_BC](WP3_RECHECK_BC.md). Evidence: `evidence/WP3-RECHECK-BC2/` (masked, LF; addresses `<email>`, account `<user>`; probes stored as `*.mjs.txt`; screenshots `*-synthetic.png`); start at [00-commands.txt](evidence/WP3-RECHECK-BC2/00-commands.txt).

- Package/date/reviewer and observable model/effort: WP3, fresh recheck of fix round 2 (WP3-RBC-01, WP3-RBC-02, the send handler's `sending`-branch test, the owner decision H-Q1 (a) and the canonical documents), with regression checks of areas B and C; 2026-10-05 (UTC); task WP3-RECHECK-BC2 attempt 1 (board kind `audit`, profile timesheet-auditor, agent `a3acc7ac65de1693a` on the board). Self-reported model `claude-opus-5-5`; effort requested xhigh, not observable. The strongest author model of the snapshot is opus (`claude-opus-5-5`, WP3 T01/T05/T08/T09/T13B); the round-2 fix author WP3-FIX2 (`a6d6ed013885bf7f2`) ran on `claude-sonnet-5-5`. The reviewer is not weaker. WP3-RECHECK-A attempt 2 ran at the same time in its own clone; no file, port or process was shared (my servers used OS-assigned loopback ports).
- Exact reviewed commit SHA and source digest; unpushed commits; source completeness:
  - Reviewed commit `2d72d355e5c8876f2591ae7fdc6a8c8f0f1ca714` (the WP3-REGATE2 `freeze_commit`, on origin/main).
  - Source digest `0d513fcadb386706d21127a7c77c512a5c6e94f8f69917f7e2c6972b3127ea92` (721 files, handoff/ excluded), equal to the regate digest, before and after, in the project folder and in the scratch clone (`git ls-tree` form and `npm run digest`).
  - Source complete: every command ran in git clones under `D:\.claude-tmp\timesheet\WP3-RECHECK-BC2` (outside Dropbox): `fix2` at the freeze, `pre2` at the pre-round-2 freeze `2f2520e`, and `mut`, a second clone of the freeze used only for mutation runs (each mutation restored with `git checkout`, status empty afterwards).
- Decision: PASS / FIX REQUIRED / NOT VERIFIED: **FIX REQUIRED** (one Low finding, WP3-RBC2-01).
  - Fixed: WP3-RBC-01 and WP3-RBC-02. The direct test of the `sending` branch is meaningful (three mutations of the branch each fail it).
  - H-Q1 (a) is implemented as decided and behaves correctly in every scenario I ran. docs/05 and docs/10 state it in EN and VI in parity; D-09 is unchanged.
  - New: WP3-RBC2-01 (Low). Two deadline tests still use an account that never saved settings, so with H-Q1 they no longer exercise the guard they were written for: the F-4 activation guard of the deadline scan, and the exclusion of imported periods. A mutation that removes either guard passes the whole suite at the freeze; at `2f2520e` the same mutation fails. The brief requires that the H-Q1 test changes do not weaken coverage. Production behaviour is correct today (probe H2).
  - No regression in area B or C.
- Scope actually inspected/executed:
  1. Diff `2f2520e..2d72d35`: 7 source files, 7 test files, docs/05 and docs/10 (EN and VI), exactly the WP3-FIX2 paths. Read: AGENTS.md, the brief, WP3_RECHECK_BC (findings, items 5 and 6, risks), WP3-FIX2 with its binding decisions and results, the board `owner_decisions` entry H-Q1 (2026-10-05), docs/05 "Deadline and recovery", docs/10 (D-09 and the new 2026-10-05 entry), the WP3_REVIEW prompt, the WP3-REGATE2 results and the WP3_HANDOFF fix-round-2 section.
  2. Each round-2 item on both commits: the freeze's round-2 test files run on the `2f2520e` source, my own probes on real SQLite files against both commits, and mutations of the new code at the freeze.
  3. H-Q1 (a): a probe through the HTTP API and the production runner over eight deadlines, the mid-period save, the explicit overdue choice with the creation clamp, switching off, device zones, the admin operations status and the screens; every test, seed and e2e change made for H-Q1, checked with mutations.
  4. Area B regressions: jobs and uncertain sends (a real killed runner, a live concurrent runner), the activation bound, F-1 for configured accounts, the note × image matrix, GET safety of every GET route, CSS tokens, Edge screenshots on desktop and mobile.
  5. Area C regressions: route inventory, 11 item sets × 17 shared routes, live checks, IDOR, re-sharing, the admin boundary, the revocation race (deterministic and 20 multi-process rounds), attribution, and the hint (owner-only, outside the hash).
  6. New code: deprecated APIs, hard-coded CSS values, query plans and the cost of the now unbounded hint read.

## Evidence table

| Command | Result/exit | Evidence |
|---|---|---|
| `node --version`; `git rev-parse HEAD`; ls-tree digest (project, then clone); `npm run digest` | v24.21.0; 2d72d35; 0d513fca…7ea92 (721 files), same in the clone and with the script | `00-commands.txt`, `19-identity-after.txt` |
| `npm ci` (fix2; pre2; mut) | exit 0; exit 0; exit 0 | `01-npm-ci.txt` |
| `NODE_OPTIONS="--trace-deprecation --pending-deprecation" npm run verify` | exit 0; 62 files / 1416 tests; SMOKE PASSED, 40 `PASS` lines; 0 deprecation lines | `02-verify.txt` |
| The freeze's 6 changed round-2 test files run on the `2f2520e` source | exit 1; 10 failed / 133 passed: every named RBC-01, RBC-02 and H-Q1 test and the wording test fail before the fix; the `sending`-branch test passes there (the branch already existed) | `03-red-prefix.txt` |
| Mutations of the `sending` branch, the H-Q1 rule and the creation clamp (mut) | branch removed, `markUncertain` removed, error made retryable: each exit 1, only the new branch test fails; H-Q1 default on: 5 fail; default off: 4 fail; creation clamp removed: 3 fail | `04-mutations.txt` |
| `npm run test:e2e` (Edge, desktop and mobile) | exit 0; 127 passed, 5 skipped, 0 failed (5.4 min); 0 deprecation lines | `05-e2e.txt` |
| Probe H1, H-Q1 (a), creation bound, switch-off (fix2; pre2) | exit 0, 50 PASS; exit 1, 25 PASS / 25 FAIL (the pre-H-Q1 automation of never-configured accounts) | `06-h1-setup-bound.txt` |
| Probe B3, History system events (fix2; pre2) | exit 0, 25 PASS; exit 1, 15 PASS / 10 FAIL (WP3-RBC-01 reproduced) | `07-b3-history-system.txt` |
| Probe C1, authorization, attribution and the hint, with new section 12 (fix2; pre2) | exit 0, 91 PASS; exit 1, 89 PASS / 2 FAIL (WP3-RBC-02 reproduced) | `08-c1-authz-hint.txt` |
| Probe C2, revocation race | exit 0, 23 PASS; 20/20 multi-process rounds, 0 writes after the revocation | `09-c2-race.txt` |
| Probe B2, send recovery and jobs | exit 0, 25 PASS | `10-b2-send-recovery.txt` |
| Probe B4, GET safety (every GET route × owner, grantee, admin, anonymous) | exit 0; 204 requests, 1 writing (the audited grantee PDF download) | `11-b4-get-safety.txt` |
| Probe B5, CSS tokens | exit 0; 0 literals outside `:root`, 0 inline styles | `12-b5-css-tokens.txt` |
| Probe B6, note × image matrix | exit 0, 30 PASS | `13-b6-note-image-matrix.txt` |
| Probe B7, query plans and the cost of the hint read (fix2; pre2) | exit 0; with 50 000 old day-entry audit rows: Review median 35.5 ms (fix2) vs 1.6 ms (pre2) | `14-b7-query-cost.txt` |
| Probe U2, Edge UI on the built server (desktop and mobile) | exit 0, 28 PASS; 0 overflow, 0 unnamed controls; 8 screenshots viewed | `15-u2-ui.txt`, `recheck-bc2-*-synthetic.png` |
| Race and regression files × 5 fresh rounds | exit 0 in each round; 10 files / 184 tests per round | `16-race-rounds.txt` |
| Coverage mutations for WP3-RBC2-01 (mut; pre2) and the guard sweep | M4, M5, M5b: exit 0 at the freeze (1416 passed each, the guards untested); exit 1 at `2f2520e` (1 test each). Guard sweep: removing the `inactive_user`, `before_activation` or `not_due` skip passes in both commits; removing `finalized` fails in both | `17-coverage-mutations.txt` |
| Probe H2, the two guards with auto-on accounts (fix2; mut with each mutation) | fix2: exit 0, 10 PASS; mut + M4: exit 1, 4 FAIL; mut + M5: exit 1, 1 FAIL (the probe catches both mutants that the suite misses) | `18-h2-guards.txt` |
| `validate_package.py --preflight` (workflow Python, project folder) | exit 0; PASS, 67 translation pairs, 1358 local links, 91 scenarios (the first run stopped on my not-yet-written `00-commands.txt` link) | `20-preflight.txt` |
| Identity after; privacy check on a temporary index | see files | `19-identity-after.txt`, `21-privacy.txt` |

## Finding dispositions

| Item | Disposition | Evidence |
|---|---|---|
| WP3-RBC-01 (Low) | **Fixed.** `history.ts` sends `actor_is_system` exactly when the stored actor is NULL; the client reads only that flag. After an automatic submission with a Saturday OT session, `ot_ledger.credit` and `timesheet.auto_finalize` read "automatic" (`data-history-actor="system"`), and so does `deadline.overdue`. For all 17 events of two owners the flag equals "stored actor is NULL". The administrator's rename stays "by someone else"; the grantee edit keeps "Changed by Synthetic Grantee (shared access)"; the owner's own events have no badge; no other person's id leaves the server. On `2f2520e` the flag is missing and the credit reads "by someone else". Edge, desktop and mobile: "OT credit posted [automatic]". | `07`, `15`, `03`, `recheck-bc2-history-ot-credit-*-synthetic.png` |
| WP3-RBC-02 (Low) | **Fixed.** With no owner finalization, the hint counts every grantee change to the period's days, whatever its time: planned leave entered before the period started is listed (2 days, matching my oracle over the audit rows), also after the automatic submission. A pre-period change that the owner later took over is not listed. After the share is revoked, the change is still listed. The owner's sign-off ends the window; a later grantee change is listed alone. The review read writes nothing. On `2f2520e` the pre-period change is missing. Edge, desktop and mobile: Review of 2026-10-30 reads "2 days last changed by Example Employee Two" for two changes made before that period started. | `08` sections 11-12, `15`, `recheck-bc2-review-pre-period-hint-*-synthetic.png` |
| `sending`-branch test (RECHECK-BC item 5, R3) | **Meaningful.** The test reclaims a job whose attempt is still `sending` under a valid lease, so only the handler's own branch can act. Removing the branch, removing `markUncertain` or making the error retryable each fails exactly this test. It passes on `2f2520e` because the branch existed there; the gap was the test, not the code. | `04`, `03` |
| H-Q1 (a) | **Implemented and correct; one test-coverage defect (WP3-RBC2-01).** See the next section. | `06`, `17`, `18` |
| docs/05, docs/10 | **Done, in parity.** docs/05 "Deadline and recovery" adds both account bounds, the creation bound with its source (coordinator decision of 2026-10-05, WP3-B-01) and the saved-settings rule (H-Q1 (a)); docs/10 adds "Owner decisions — 2026-10-05 (WP3-FIX2, question H-Q1)". EN and VI say the same, sentence by sentence. The D-09 row has no diff line. | diff, `20` |

## H-Q1 (a) checks

- A never-configured account is never auto-finalized and has no delivery. Three never-configured accounts (one with an auto_deduct policy, a Saturday OT session and a short day; the seeded admin; the seeded employee) went through eight deadlines (2026-10-14 to 2027-01-20) with the production runner. Each has no automatic revision, no finalized timesheet, no PDF or send job, no delivery attempt, no ledger row, no `deadline.*` or `timesheet.auto_finalize` audit, no overdue record and no overdue or outcome notice. Its History shows no automatic event. Four device zones give identical results. On `2f2520e` all three were submitted automatically every period (8 revisions each) and failed `recipient_missing`.
- Saving mid-period. An account that saves auto-submit on at 2026-10-20 (inside 2026-10-12..10-25) gets nothing for the period due 2026-10-14, and gets the current period at its deadline (2026-10-28) and every later one. A plain first save on 2026-10-29 reaches no overdue period; automation starts at the next deadline. The explicit overdue choice submits the overdue periods due after activation (2026-10-16 and 10-30, not 10-02). For an account created on 2026-10-15 it never reaches the period due 2026-10-14 (creation clamp).
- Turning auto-submit off behaves as before. Off before a deadline gives one overdue record and no revision. Switching off mid-period gives one overdue record for the next deadline, one overdue warning decided by the reminder scan, and the period can still be signed off manually. A never-configured account can still sign off manually (the manual path is unchanged).
- Admin operations status and screens. The status lists only revisions, so never-configured accounts have no row and no fault; "Automatic submission starts" shows the system activation only; no job needs intervention for an automatic revision. Settings for an unsaved account reads "Not saved yet. Nothing is submitted for you until you save these settings with automatic submission on. It then applies to periods that fall due after you save." I found no screen, reminder text or status text that claims automation before setup.
- Test, seed and e2e changes. No seed changed. `automation.spec.ts` (interventions 2 → 0, an empty administrator revision list, the History badge) reflects H-Q1 and is stricter. The `configuredUser` helper keeps the 15 switched call sites meaningful. The B-01 test now goes through the explicit overdue choice, which also tests the clamp (the creation-clamp mutation fails 3 tests). The `settingsModel` wording test is stronger. But two tests that relied on automating a never-configured account were not switched: see WP3-RBC2-01.

## Findings

| ID | Severity | File/function | Reproduction | Expected / actual | Rule/AC | Bounded fix |
|---|---|---|---|---|---|---|
| WP3-RBC2-01 | Low | `tests/integration/deadline.test.ts:271` ("finalizes nothing while the activation instant is null") and `:786` ("never auto-submits an imported_unverified timesheet and records no overdue state for it"); guards at `src/server/services/automation.ts:191`, `:343-344` and `:204` | In the `mut` clone: (M4) make `runDeadlineScan` and `assessPeriod` ignore a NULL activation instant; (M5) move the `imported` skip after the switch-on decision; (M5b) delete the `imported` skip. Run `vitest run tests/integration tests/client tests/domain`. | Expected (WP3-FIX2 brief: update every test that relied on automating a never-configured account; WP3-RECHECK-BC2 scope 2: H-Q1 test changes must not weaken coverage): each mutation fails a test, as at `2f2520e` (M4 fails test 271; M5 and M5b fail test 786). Actual at the freeze: 62 files / 1416 tests pass under each mutation. Both tests create their user with `newUser()` and save no settings before the scan, so H-Q1 already prevents any write and the guard is never needed. The off half of test 786 saves the off switch at 2026-09-30T01:00Z, after the deadline it checks (2026-09-30T00:00Z), so no switch governs that period and this half proves nothing in either commit. The imported exclusion is therefore untested at the freeze, and no other code stops an automatic finalization of an imported period. The scan-level F-4 guard is the only guard when the activation is cleared after a scan job was queued (probe H2 a). Production behaviour is correct today (H2: 10 PASS). | AC-07, F-4 (docs/05 "Deadline and recovery": nothing is finalized before activation; imported history is excluded) | Use `configuredUser()` in test 271 (or save auto-submit on before the scan). In test 786, save auto-submit on before the first scan, and save the off switch before the deadline that the off half checks. Optionally add the "activation cleared after a scan job was queued" case. Check that M4, M5 and M5b each fail the suite again. |

The guard sweep found no other weakened guard: removing the `inactive_user`, `before_activation` or `not_due` skip passes the suite in both commits (each sits behind the candidate list, which already filters those cases), and removing the `finalized` skip fails in both. Only the activation and imported guards change from tested at `2f2520e` to untested at the freeze. Probe H2 shows that a test with an auto-on account catches both mutants. No other defect was observed.

## Regressions

- Area B: none.
  - Retries are 60/300/900/3600 s, then the fifth attempt. A runner killed after `sending` was committed on the last attempt leaves the attempt `uncertain` with the decision prompt; one decision sends exactly once; nothing is resent. A live runner's in-flight send is not touched by another runner's pass.
  - Activation in the past is refused. Nothing is automated in the last 30 s before a deadline. One revision per period.
  - F-1 for configured accounts: the empty period 2026-11-13 of an account set up earlier is submitted with 14 default-labelled days (Worked/Off), no OT, no deficit, no ledger row, review pending, no reviewed hash, no actor.
  - Note × image matrix: images 0/0/1/1, the note only when on, `{SignOffStatus}` "Submitted" or the note text, no other automatic indicator.
  - GET safety: 204 requests, only the audited grantee PDF download writes (the owner's review with a non-empty hint was among them).
  - UI tokens: no CSS change in round 2; 0 literals outside `:root`, 0 inline styles; 0 overflow and 0 unnamed controls on 8 screenshots.
  - e2e: 127 passed, 5 skipped.
- Area C: none.
  - 88 (method, path) entries as before; exactly the 17 shared routes, each with guard and handler; the review route is not among them.
  - 11 item sets × 17 routes as expected; stranger and admin 404, anonymous 401, `no-store`.
  - Live revoke, leave, admin revoke, scope change and deactivations apply on the next request; IDOR 404; no re-share; the admin cannot create a share; the admin list has only the allowlisted fields.
  - Attribution: every attributed row is a grantee write through `/api/shared`; admin-route and same-second revocations and a grantee leaving stay unattributed.
  - The hint: owner-only (absent under `/api/shared`, for owner B, in all admin GETs), outside the hash (identical `payload_hash` with the hint hidden; sign-off stores reviewed = payload = shown hash; no grantee name in the snapshot).
  - Revocation race: 20 deterministic interleavings refuse the write; 20/20 multi-process rounds with 0 writes after the revocation.

## New code

- Deprecated APIs: none. `npm run lint` (typescript-eslint `no-deprecated`) passes inside verify; 0 deprecation lines in verify, e2e and the UI probe's server output.
- Hard-coded CSS values: round 2 changed no CSS; `HistoryScreen.tsx` only changes a data attribute.
- Queries: `governingSwitch` and `hasSavedSettings` use the `submission_settings` indexes. The hint read now has no time bound when the owner has not finalized the period: it visits every day and session audit row of the owner (`audit_events_owner` index, then a temporary sort). With 50 000 old rows a Review read takes 35.5 ms median instead of 1.6 ms. This is bounded by data size, not per request, and is small at this scale (risk R1).

## Risks and optional improvements (not proven defects)

- R1: cost of the hint read without an owner finalization grows with the owner's whole day/session audit history (35.5 ms at 50 000 rows). Optional: filter by the period's work dates in SQL or index the work date.
- R2: never-configured accounts get before-deadline reminders but no overdue record or warning after a deadline (docs/05 says so explicitly). An employee who never opened Settings is not told that nothing was submitted. Worth stating in the pilot packet; the admin status does not show "not set up" either.
- R3: the deadline scan re-assesses every period since activation of every never-configured account on every pass (they never reach a final state). The cost is O(accounts × periods) per minute with a few indexed queries each; fine at this scale.
- R4: docs/05, creation bullet: "The period in which the account was created is still submitted at its deadline" is true only once the settings are saved; the lead sentence ("both only narrow what is submitted") covers it. Optional wording: "is still eligible at its deadline".
- R5: `history.test.ts` "WP3-RBC-01 … (the automatic OT credit and debit)" produces no debit. The flag is checked for every event, so coverage holds; the title overstates it.
- R6: seed-created accounts (actor NULL, CLI seed only) show "Account created [automatic]". This follows the binding rule; production accounts are created through the admin route.
- Carried: R1 of WP3_RECHECK_BC (the "through a share" marker before WP4) is now carry item 15 in the HANDOFF.

## Required gates unrun/blocked and why

- Real SMTP, NAS deployment and production activation: forbidden before the owner's pilot authorization.
- No mandatory recheck line was left unrun.

## Disposition of previous findings

WP3-RBC-01 and WP3-RBC-02 are fixed. The missing direct `sending`-branch test (RECHECK-BC item 5, R3) is restored and meaningful. RECHECK-BC R4 (never-configured accounts submitted and failing) is closed by H-Q1; R5 (docs/05 creation bound) is closed. WP3-RBC2-01 is new. The WP3-REGATE2 PASS, the WP3-FIX2 report and the HANDOFF lines were treated as claims and re-executed: verify (62 files / 1416 tests, 40 smoke `PASS` lines) and e2e (127 passed, 5 skipped) reproduce. The HANDOFF claim "14 tests relied on automating an account that never saved its settings" is incomplete: two more did (WP3-RBC2-01).

## Software readiness, owner permission and pilot result

- Software readiness (areas B and C): not accepted until WP3-RBC2-01 is fixed and rechecked. No production defect was found; the fix is test-only.
- Owner permission for real sending or activation: not requested, not given. Pilot result: none.

## One next action

The coordinator dispatches one bounded test-only fix for WP3-RBC2-01 under [FIX_FINDINGS](../prompts/FIX_FINDINGS.md), with the M4 and M5 mutations as its red check. The freeze, the gate and a fresh B/C recheck at the new digest follow.

No invented findings or unobserved passes. A partial review is not a complete acceptance.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WP3-RECHECK-BC2 attempt 1, agent `a3acc7ac65de1693a` on the board. Reviewed fix author: WP3-FIX2 `a6d6ed013885bf7f2` (sonnet, attempts 1-2); committer WP3-FIX2-FREEZE `af78db5acb44add73`; verifier WP3-REGATE2 `abb46237e2b7c9c61`; plus the WP3 authors on the board.
- Fresh context; confirm reviewer did not author changes: fresh context. This reviewer authored nothing in WP3, including both fix rounds. It wrote only this report pair, the Results section of its brief and `evidence/WP3-RECHECK-BC2/`. Scratch-only edits: the freeze's round-2 test files copied into the `pre2` clone for the red run (restored afterwards) and the mutations in `mut` and `pre2` (each restored).
- Source digest before/after; gate evidence for that snapshot: `0d513fca…7ea92` before and after; WP3-REGATE2 evidence is for the same commit and digest.
- New report path preserving previous review history: `handoff/delivery/WP3_RECHECK_BC2.md` and `.vi.md` (new); WP3_RECHECK_BC and WP3_REVIEW_B/C are untouched.
- Finding dispositions and next coordinator fix/recheck task: as above; one bounded test-only fix for WP3-RBC2-01, then a fresh B/C recheck.
