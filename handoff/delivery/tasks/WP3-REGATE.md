# WP3-REGATE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-REGATE; package WP3; kind gate;
  attempt 1; depends on WP3-FIX-FREEZE (the fix-round freeze). This is the package-final
  regate that the WP3 rechecks review.
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H, novelty no. Records in English.
- Target: `freeze_commit` = the WP3-FIX-FREEZE commit. The coordinator gives the SHA and
  the committer-checked digest in the dispatch prompt.
  - Record HEAD and the source digest **first**, before any long command, and again at
    the end. They must not change.
  - The digest of record is the one you compute on the clean export.
- Read AGENTS.md from disk first. Then read:
  - [WP3-GATE](WP3-GATE.md), including its results; your gate items are its items 1–16;
  - the reviews WP3_REVIEW_A.md, WP3_REVIEW_B.md and WP3_REVIEW_C.md;
  - the WP3-FIXB and WP3-FIXC results;
  - the fix-round section of `handoff/delivery/WP3_HANDOFF.md`.
- Constraints:
  - Read-only for source, configuration, tests and governance files.
  - Node 24 by full path; spawn children with `process.execPath`; the workflow Python for
    the validators.
- Environment rules:
  - Use `D:\timesheet-tmp\WP3-REGATE` for TEMP/TMP and the clean export, outside
    Dropbox.
  - Delete only files you created; never remove folders recursively.
  - Make the first shell call a trivial `node --version`. If a call fails with ENOSPC,
    stop and report.
  - Never open an interactive shell (cmd.exe without /c, powershell without -Command or
    -File). Never kill processes by PID.
  - Never write into the repository root. On Windows, never redirect to /dev/null or nul,
    including `2>/dev/null`.
  - Use the installed Edge channel; no browser download.
  - Capture mode only; no real mail.
- If a permission check denies a call, stop and report; do not retry or rephrase it.

## Gate items (record each command, exit code and result)

1–16. Every item of WP3-GATE, unchanged, on the new freeze:
- item 2 records the test count and the smoke `PASS` count;
- item 16 lists the diff scope since a1cd566e59253d19f53cfd5b3a81fd27a7e9a056 (the first
  WP3 freeze) as well as since the WP2 acceptance commit.

17. **Fix regressions.** The regression tests for WP3-B-01..03 and WP3-C-01..03 exist and
    pass. Name each test and its file. Also check that:
    - the C-01 test proves the reviewed hash is the same with the hint shown and hidden;
    - the B-02 test covers a crash during the final permitted attempt.

18. **Fix scope.** The diff between a1cd566 and the new freeze touches only:
    - the paths reported by WP3-FIXB and WP3-FIXC;
    - handoff records.

    List any other path.

## Output

- Results go in this file; evidence in handoff/delivery/evidence/WP3-REGATE/.
  - Evidence is masked (`<email>`, `<user>`), LF, with no trailing whitespace.
  - Renders and screenshots are named `*-synthetic.png` only.
  - Run the precommit check over your evidence on a temporary index.
- Decision: PASS or FAIL, with every failing item. An environmental flake is rerun once
  and recorded.
- Leave no server, browser or runner process, and no background task.

Return at most 200 words, beginning with your self-reported model.

## Results

(Verifier appends here.)

### Verifier result - attempt 1 (timesheet-verifier; self-reported model claude-sonnet-5-5; 2026-10-05)

Decision: **PASS** (items 1-18). Evidence `handoff/delivery/evidence/WP3-REGATE/` (00-commands.txt lists every command and exit; masked, LF; renders `*-synthetic.png`). Node v24.21.0 portable by full path; clean `git archive` export of 2f2520e under `D:\timesheet-tmp\WP3-REGATE\export`; capture mode only. No flake, no rerun.

- HEAD before and after: 2f2520e1ab80ff55938b70cd469f0bfe888e04a2. Digest of record (computed on the export: git blob IDs of the 721 non-handoff files, handoff/ excluded): eeb417d3b903b30f1c21fa0a855424da02ab1d6e1d525f2509130f3933a48410. Equals the committer's digest and the `git ls-tree` form; identical at the end. `npm run digest` cannot run in the export (no .git; exit 1, not used).
- 1 `npm ci` exit 0.
- 2 `npm run verify` with `--trace-deprecation --pending-deprecation`: exit 0, 0 deprecation lines; 62 files, 1407 tests passed; SMOKE PASSED with 40 `PASS` lines, 0 FAIL (the WP3-T14 "46" remains wrong).
- 3 `npm run test:e2e` (Edge): exit 0, 127 passed, 5 skipped (by design), 0 failed; 116 screenshots; the five `pdf-*` renders and both hint screenshots copied and viewed.
- 4 Races, 20 fresh-process rounds each: ot-leave-concurrency 20/20, finalization-concurrency 20/20, deadline-race 20/20, sharing revocation race 20/20.
- 5 Fault injection (full verbose run, 1407 passed): jobs-restart (kill before write / before rename / after rename), delivery-crash (kill before `sending`; kill after `sending` -> uncertain, restart sends nothing, decision route), delivery.test (uncertain never retried, one explicit resend = one attempt, duplicate send job once), jobs.test (duplicate key once, lease refused to a second connection), jobs-restart "claim every job exactly once".
- 6-10, 13-15: covered by the same full run and e2e as in WP3-GATE (automation/deadline/pdf-render/pdf-download/signatures/sharing/sharing-matrix/admin tests; smoke GET-safety and capture). Renders viewed: 14 dates, OT 5:00 and 7:30 on both Sundays = 15:30, Vietnamese name and holiday labels, bounded signature, manual real sign date, automatic submission date, note only when on, empty period 0:00.
- 11 Migrations (own script, 05-migrations.txt): fresh 1-6; v3 (0001-0003, unchanged since 5fafeae) then 4,5,6; each `integrity_check` ok, `foreign_key_check` [], user_version 6; rerun applies nothing.
- 12 LG-01..LG-10 and DF-01..DF-16 present and passing. Workflow Python (codex runtime): `validate_orchestration.py` 0, `check_recovery.py` 0, `validate_package.py --preflight` 0 (PASS). Precommit check on a temporary index (read-tree HEAD + the evidence folder, 22 files): PASS, `diff --cached --check` 0.
- 16 Diff since 3ead61e (747 entries incl. handoff): src/server 52, src/client 46, src/domain 4, tests 50 (client 6, domain 3, e2e 10, integration 28, support 3), docs 18 (EN+VI), DEVELOPMENT/README (4), package.json/lock, one script, one reference file, handoff 569 (565 delivery + 4 prompts). Governance: only the GOV-WP3P WP3_IMPLEMENT/WP3_REVIEW prompts (EN+VI); no AGENTS/CLAUDE/docs 08/skills change. Diff since a1cd566 (177 entries): 13 src, 10 test, 154 handoff paths, nothing else (10-diff-fix.txt).
- 17 Regression tests (all pass in the full run):
  - B-01 `tests/integration/deadline.test.ts` "account creation bound (WP3-B-01 ...)": 4 tests (never submits a period due before the account existed; first deadline after creation still automated with default labels; creation period automated while the deadline is ahead; auto-submit effective instant never before creation).
  - B-02 `tests/integration/delivery.test.ts` "a process lost during the LAST permitted attempt is uncertain with the owner decision ... (WP3-B-02)": attempts 1-4 temporary failures, crash during attempt 5 after `sending`, one ordinary pass -> uncertain, job in intervention, never resent, one decision resends once. Covers the final-attempt crash. `delivery-crash.test.ts` has one pass-summary assertion change.
  - B-03 `tests/client/otModel.test.ts` (2: "words every operation an owner can see ... WP3-B-03", "names known operations and falls back to a neutral plain label") and `tests/client/sharingModel.test.ts` "labels the actor-less system events as automatic".
  - C-01 `tests/integration/review-grantee-changes.test.ts` (11 tests; hint counts, grouping, owner-only, no writes) and `tests/client/granteeChangesModel.test.ts`; `tests/e2e/sharing.spec.ts` hint on desktop and mobile. The hash test "keeps the hint out of the payload and the hash: the same payload is signed whether or not it is shown" asserts the shown hash equals the canonical hash of the payload alone and equals `buildReviewPayload` (which never sees the hint), the stored `payload_sha256`/`reviewed_sha256` equal it, and the payload and stored JSON contain neither the grantee name nor `grantee_changes`. It proves hint independence by recomputation, not by two HTTP calls with the hint toggled; sufficient because the hint is outside the hashed payload by construction.
  - C-02 `tests/integration/history.test.ts` (3 WP3-C-02 tests: admin holding a share keeps an admin-route revocation as an admin act, same-second act, grantee leaving unattributed; plus the drift guard) and `sharingModel.test.ts` "words a grantee PDF download as a download".
  - C-03 comment-only change in `src/server/types.ts` (AppEnv); no test applies.
- 18 Fix scope: the diff a1cd566..2f2520e touches exactly the FIXB and FIXC reported source and test paths (13 src, 10 tests; the FIXB deviations HistoryScreen.tsx and delivery-crash.test.ts and the FIXC deviations reviewModel.test.ts and sharing.spec.ts are listed in their results) plus handoff records (delivery tasks, WP3_HANDOFF/REVIEW A-C EN+VI, ORCHESTRATION.json, WORKFLOW_REVISION_CHECKPOINT, evidence). No other path: no docs, config, package, script or governance change.
- Residual: none open. No server, browser or runner process left by this task (the msedgewebview2 processes listed by the OS belong to other applications). Temporary files remain only under D:\timesheet-tmp\WP3-REGATE, outside Dropbox.
