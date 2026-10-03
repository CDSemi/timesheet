# Independent workflow recheck: WF-AUDIT findings on the governance fix commit

Completed from [REVIEW](../templates/REVIEW.md). Translation: [WORKFLOW_RECHECK.vi.md](WORKFLOW_RECHECK.vi.md). Task record: [WF-AUDIT2](tasks/WF-AUDIT2.md). Findings under recheck: [WORKFLOW_REVIEW](WORKFLOW_REVIEW.md) (WF-A-01..WF-A-10).

- **Package/date/reviewer and observable model/effort:** Board package GOV. Reviewed 2026-10-03 UTC (2026-10-02 America/Los_Angeles). Fresh `timesheet-auditor` subagent. Self-reported model `claude-opus-5-5`; effort not observable. The tool set matches the auditor profile.
- **Exact reviewed commit SHA and source digest; unpushed commits; source completeness:** freeze commit `c219d79a2c202861b719473cdffb0efb59f14290` = `origin/main`; no unpushed commits. Source digest `d4d49149221e45459937d26bdd1258d681341b73712d8564a852c9131c5429d2` (532 files, `handoff/` excluded). It is the same in the Dropbox checkout and in a scratch clone at that SHA, and equals the WF-GATE2 digest. Nothing outside `handoff/` was changed before or after the audit. Reviewed range: the cumulative governance change `1a25275..c219d79`, with the fix commit `fd77a87..c219d79` reviewed line by line. The source is complete.
- **Decision: FIX REQUIRED.** All three Medium findings are fixed, and their original probes now behave as required. Six of the seven Low findings are fixed; for WF-A-09 the already committed evidence is explicitly deferred by a recorded decision. Every mandatory check passes. Three Low items remain open without a recorded deferral: the rest of WF-A-10 and two new findings, WF-R-01 and WF-R-02. Under the brief, an open Low finding needs either a fix or a recorded deferral before a PASS. There is no new Medium or High finding.

## Scope actually inspected/executed

Read from disk: AGENTS.md (first), the WF-AUDIT2 brief, WORKFLOW_REVIEW and its evidence, and the full diff `fd77a87..c219d79`: nine profiles, docs 08 and 10 with their pairs, RESUME (+vi), NEXT_ACTION (+vi), STATE, `validate_orchestration.py`, `check_recovery.py` and `precommit-check.mjs`. Also read in full: the current validator, check_recovery and precommit script, doc 08 (EN and VI), ORCHESTRATE, FIX_FINDINGS, the REVIEW template, the board (working tree and as committed), the checkpoint, and the WF-FIX1, WF-FREEZE2 and WF-GATE2 reports. Those reports were treated as claims to check. Application source is unchanged: `git diff 1a25275 c219d79 -- src tests package-lock.json skills-lock.json` is empty, and package.json gained only the `precommit-check` script in fd77a87.

## Evidence table

| Command | Result / exit | Evidence |
|---|---|---|
| `git rev-parse HEAD origin/main`; `npm run digest` (Node 24.21.0); status outside `handoff/`, before | c219d79 both; d4d49149…29d2; none | [0-identity-before](evidence/WF-AUDIT2/0-identity-before.txt) |
| validator and check_recovery on the working-tree board | 1 / 1: "Unfinished dependency: WF-AUDIT2". WF-GATE2 has decision PASS but status still `running` (observation 4) | [1-validator-recovery](evidence/WF-AUDIT2/1-validator-recovery.txt) |
| Scratch clone at c219d79 (outside Dropbox, per-process safe.directory): digest, validator, check_recovery on the committed board | digest equal; 0 PASS (9 profiles, 16 tasks); 0 PASS, 67 checks | [2-clone-validator-recovery](evidence/WF-AUDIT2/2-clone-validator-recovery.txt) |
| Own probes `3-probes.py` (24 in-memory boards built from the real board) | run 1: 21/24, because the probe itself pointed a report at a missing file; run 2: 24/24 as expected, exit 0 | [3-probes.py](evidence/WF-AUDIT2/3-probes.py), [run 1](evidence/WF-AUDIT2/3-probes-output-run1.txt), [run 2](evidence/WF-AUDIT2/3-probes-output.txt) |
| `precommit-check.mjs --self-test` (checkout and clone); 22 staged-set probes in the clone | 0 / 0 (35 path, 59 line samples); 22/22 as expected; clone clean afterwards | [4-precommit](evidence/WF-AUDIT2/4-precommit-selftest-and-probes.txt), [5 script](evidence/WF-AUDIT2/5-precommit-probes.sh) |
| Spaced secret values in the clone | 6 spaced forms exit 0; the same value without spaces exits 1 | [5b script](evidence/WF-AUDIT2/5b-spaced-secret-probes.sh), [5b output](evidence/WF-AUDIT2/5b-spaced-secret-probes.txt) |
| Range privacy scans with the c219d79 rules | fd77a87..c219d79: 79 files, 0 findings. 1a25275..c219d79: 152 files, 13 profile-path blocks in exactly the 7 files listed by WF-A-09 (deferred) | [6-range-privacy](evidence/WF-AUDIT2/6-range-privacy.txt) |
| `npm ci`; `npm run lint` with `--trace-deprecation --pending-deprecation` (Node 24.21.0, clone) | 0; 0, no warnings | [7-lint](evidence/WF-AUDIT2/7-lint.txt) |
| Replay of WF-AUDIT `2-probes.py` against the c219d79 validator | probe 6 (documentation self-audit) is now rejected and probe 10b shows EFFORTS without `max`. Probe 10 still accepts because it injects `max` into the in-memory profile and skips `parse_profile`; the real file path rejects it (next row) | [8-replay](evidence/WF-AUDIT2/8-replay-wf-audit-probes.txt) |
| Real-file profile tampering in the clone | `max` (expert, worker), `ultracode` and `fable` all give exit 1; unmodified profiles give 0 | [9-profile-tamper](evidence/WF-AUDIT2/9-profile-tamper.txt) |
| `validate_package.py --preflight` (workflow Python); `git diff --check 1a25275 c219d79`; non-handoff scope | 0 (43 pairs, 532 links, 91 scenarios); 0; 13 workflow paths only | [10-preflight-diffcheck](evidence/WF-AUDIT2/10-preflight-diffcheck.txt) |
| Runtime and board observations | edited profile body loaded; injected AGENTS.md stale; board status lag | [11-observations](evidence/WF-AUDIT2/11-observations.txt) |
| Leftover-wording search at c219d79 | no "Sonnet/high" and no "unless … in your context" remain; the gate-included wording remains (WF-A-10) | [12-wording-grep](evidence/WF-AUDIT2/12-wording-grep.txt) |
| Identity after; privacy scan of this audit's own and the uncommitted gate/freeze evidence | see the task record Results | [13-identity-after](evidence/WF-AUDIT2/13-identity-after.txt) |

## Disposition of previous findings (WF-A-01..WF-A-10)

| ID | Sev | Status | Basis |
|---|---|---|---|
| WF-A-01 | Medium | Fixed | Doc 08:26,30,32,36 (+vi) states one rule; the auditor profile (lines 25-26) has no fallback exception; the validator (`validate_audits`) no longer bypasses `fallback_unavailable`; "Sonnet/high" is gone. Probes B1–B3 (Sonnet `fallback_unavailable` auditor over an Opus fix or documentation author, running or done) are rejected. B4 (all authors Sonnet) is accepted, which is the permitted case. B6: a verifier is not an author. |
| WF-A-02 | Medium | Fixed (see WF-R-01) | Package `GOV` sits outside `authorized_scope`; running GOV tasks are exempt; a done GOV audit needs a 40-hex `reviewed_commit` (D1, D2); the governance-path list is in doc 08:64 (+vi). Replay of probe 8 (D3): the GOV PASS stays valid after the F-01 digest change. D4–D6: WP1-F01-FIX runs only on a WF-AUDIT2 PASS. The board relabels all WF-* tasks to GOV. |
| WF-A-03 | Medium | Fixed (see WF-R-02) | The five original probes (unquoted `SMTP_PASSWORD`, `api_token`, signature PNG and PDF under evidence, `/c/Users/<name>`) now exit 1. Placeholders pass. The self-test covers each case. |
| WF-A-04 | Low | Fixed | `max` was removed from EFFORTS; the real-file tampering and E1/E2 are rejected. |
| WF-A-05 | Low | Fixed | Authors = every non-gate/audit/commit task of the package (current and previous attempts) plus `author_agent_ids`. C1–C3 (documentation author attempts 2 and 1, planner) are rejected with an empty `author_agent_ids`. |
| WF-A-06 | Low | Fixed | RESUME.md:5-11 and .vi:5-10 take state from the board and checkpoint and delegate inspection. This is consistent with ORCHESTRATE step 1 and doc 08:54. |
| WF-A-07 | Low | Fixed | All eight non-coordinator profiles read AGENTS.md from disk, and doc 08:34 (+vi) records the restart effect. This auditor's injected copy was stale and the disk read corrected it (observation 3). |
| WF-A-08 | Low | Fixed | The committer profile (lines 16-17) and doc 08:74 (+vi) pin Node 24. WF-FREEZE2 recorded `v24.21.0`. |
| WF-A-09 | Low | Fixed for new evidence; committed evidence deferred | Profile paths now block, and the masking exception is limited to staged evidence logs. The deferral of retroactive redaction is recorded in docs/10:85 (+vi:86). The 13 remaining occurrences are exactly the 7 files listed by WF-A-09; the fix range adds none. |
| WF-A-10 | Low | Partially open | Doc 08:62 defines the package-final snapshot, and the board chain is FIX → FREEZE → separate GATE → AUDIT → ACCEPT with English task records. The contradiction in the cited NEXT_ACTION lines remains (see the table below). |

## Findings

| ID | Sev | File:line | Reproduction / observation | Required change |
|---|---|---|---|---|
| WF-A-10 (residual) | Low | handoff/NEXT_ACTION.md:33-34 (.vi:32); handoff/prompts/ORCHESTRATE.md:25-26 (.vi:23); handoff/prompts/FIX_FINDINGS.md:5 (.vi:5); board `coordinator_decisions` "S-size fix audits may include the gate" | 12-wording-grep: NEXT_ACTION still routes the F-01 audit "with the gate included", and both prompts let any S-size fix audit include the gate. Doc 08:62 limits `gate_included` to intermediate S-size fixes and keeps a separate gate for package-final snapshots, which include the F-01 recheck. The board correctly has WP1-F01-GATE. | Align NEXT_ACTION (+vi) with the board (coordinator state; no GOV cycle needed). Qualify ORCHESTRATE and FIX_FINDINGS (+vi) as "intermediate S-size fix" (a governance change), or record a deferral in docs/10 (+vi) stating that doc 08 governs. Mark the board decision as superseded. |
| WF-R-01 | Low | handoff/delivery/validate_orchestration.py:252-258, 264-265, 283-291; docs/08:64 | Probe D9: a done GOV audit PASS whose gate has a different `freeze_commit` from the audit's `reviewed_commit` is accepted. Gate and audit are bound only by source digest, and that digest excludes `handoff/`, where prompts, templates, validators and check_recovery live. A governance fix that touches only `handoff/` (such as the WF-A-10 prompt wording) keeps digest d4d49149…, so the old WF-GATE2 would satisfy a new audit. | For GOV audits, require a gate dependency whose `freeze_commit` equals `reviewed_commit`, and add a check_recovery probe. Otherwise record a deferral. |
| WF-R-02 | Low | scripts/precommit-check.mjs:17-20, 39; self-test sample `assign('password', 'two words here')` | 5b: a secret in the app-password layout used by common SMTP providers (four groups of four letters separated by spaces; synthetic letters) passes in every form: unquoted YAML, double or single quotes, env, `export`, and JSON. The same value without spaces is blocked. WP4 configures SMTP. | Block secret-named assignments whose value matches that spaced layout, quoted or unquoted, and add self-test cases. Otherwise record a deferral with the residual-risk reasoning: `.env` files are blocked by path, and the committer reads the diff. |

## Coordinator choices judged

- **Exact `noreply@anthropic.com` allowlist: sound.** It is a single non-personal address required by the attribution trailer, compared case-insensitively against the full match. P10, P11 and the self-test block other local parts, other domains and suffixed domains. P13 passes the trailer.
- **Unquoted-secret heuristic (digit, symbol or 12+ characters): acceptable as a heuristic.** It avoids type words (P16 `password: required`) and catches typical generated secrets (P1, P2, P7, P8). Known misses that are acceptable: letters-only values of 6–11 characters (L1, L2) and values containing a colon (L3). The spaced-value miss is WF-R-02. The script header calls the check heuristic, and doc 08:74 still requires reading the diff.
- **Profile-path blocking for added lines: sound.** Source files block too (P9). The masking exception is limited to staged evidence logs and to the account segment. Placeholders and shared accounts pass (P14). A real account path blocks without being printed (R1). Accepted limit: a mangled `C--Users-<name>` folder form (L4).
- **GOV package and governance-path list: sound, with one validator gap (WF-R-01).** Optional additions: `.agents/` (the Codex skill copies, including commit-message) and `docs/agents/`. A GOV PASS is "superseded only by a later governance change", but that remains prose; the validator cannot detect it without git.
- **WF-FIX1 `addresses_audit` instead of a dependency: correct.** The validator's dependency semantics mean "the dependency passed", so depending on the FIX REQUIRED audit is rejected (D7). The field preserves traceability. It is neither documented nor validated (D8 accepts a dangling reference); this is an optional improvement.
- **Not rewriting committed evidence: correct.** The owner forbids history rewrites, and a redaction commit would not remove the name from public history. The deferral is recorded in docs/10 (+vi).
- **Re-planned WP1-F01 chain: matches doc 08**, apart from the NEXT_ACTION and prompt wording (WF-A-10).

## Risks and optional improvements (no change required)

- The working-tree board does not validate until WF-GATE2 is set to `done` (observation 4). No GOV accept-commit task exists yet, and WP1-F01-FIX depends directly on WF-AUDIT2. Pending WP1-F01-* tasks still carry baseline fd77a87.
- The uncommitted `evidence/WF-GATE2/preflight-system-python.txt` contains 7 unmasked user-profile paths. The accept commit will block on them until the committer masks the account segment, as doc 08 allows (observation 7).
- Document `addresses_audit` in doc 08 and validate that it names an existing audit with FIX REQUIRED or NOT VERIFIED.
- Models of earlier attempts are not recorded, so an earlier Opus attempt would not raise the strength floor. Non-Claude authors are ranked by their requested alias (carried over from WF-AUDIT).
- `mask()` prints the first two characters of an account name. A running audit is checked for author separation only once it is done (behaviour predating this change).

## Required gates unrun/blocked and why

None of the mandatory checks went unrun. `npm run verify` was not repeated: application source is unchanged and WF-GATE2 ran it on the same digest. The real-board validator and check_recovery fail only because of the coordinator's board status lag (observation 4); the committed board passes in the clone.

## Software readiness, owner permission and pilot result

Unchanged. WP1 is FIX REQUIRED with F-01 open, and WP2 has not started. No owner pilot permission was sought, and nothing was sent or deployed.

## One next action

The coordinator sets WF-GATE2 to `done` and corrects NEXT_ACTION (+vi). Then, for WF-A-10 (prompt wording), WF-R-01 and WF-R-02, it chooses one of two paths:

- one bounded GOV fix (ORCHESTRATE/FIX_FINDINGS +vi, the GOV commit binding in the validator with a probe, the spaced-secret rule with self-test cases), followed by a freeze commit, a gate and a fresh recheck; or
- recording an explicit deferral decision for each item in docs/10 (+vi), followed by a short fresh recheck of those records on c219d79.

## Independent subagent provenance

- Review task/attempt, reviewer ID and reviewed author IDs: WF-AUDIT2 attempt 1; board agent ID `aace091e55c54c3b0`. Authors: `a232a5b7f6cdec442` (WF-REVIEW), `ae6c446dc434f85d6` (WF-IMPL-TOOLING), `afbd2f9ae6ec1fce3` and `ad742f3b42890d674` (WF-IMPL-DOCS), `a2a9ec20d51be6815` (WF-FIX1), all Sonnet 5.5. First auditor: `a80f8351bbd2fd196` (WF-AUDIT). The coordinator (Opus 5.5) wrote state and records only.
- Fresh context; confirm reviewer did not author changes: confirmed. This auditor wrote only this report pair, the WF-AUDIT2 task record and `evidence/WF-AUDIT2/`. It is not weaker than the strongest author model.
- Source digest before/after; gate evidence for that snapshot: before d4d49149…29d2; after: see 13-identity-after. WF-GATE2 PASS on the same commit and digest.
- New report path preserving previous review history: new file; WORKFLOW_REVIEW and the WF-AUDIT evidence are unchanged.
- Finding dispositions and next coordinator fix/recheck task: see "One next action".
