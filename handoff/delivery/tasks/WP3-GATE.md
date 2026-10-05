# WP3-GATE dispatch brief

- Mission/task: timesheet-software-readiness / WP3-GATE; package WP3; kind gate; attempt
  1; depends on WP3-T15-FREEZE (the package-final freeze).
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (the package-final gate), novelty no. Records in English.
- Target: `freeze_commit` = the WP3-T15-FREEZE commit (the coordinator gives the SHA in
  the dispatch prompt). Record HEAD and the source digest before and after; they must not
  change; the digest of record is the one you compute on the clean export.
- Read AGENTS.md from disk first. Then read [WP3-PLAN](WP3-PLAN.md) section E,
  [WP3-REQ](WP3-REQ.md) section E (gate items 13–16) as amended by
  [WP3-REQ2](WP3-REQ2.md), the WP3 gate lines in handoff/prompts/WP3_IMPLEMENT.md and
  WP3_REVIEW.md (accepted in GOV-WP3P), docs/06 (AC-01, AC-03, AC-04, AC-06–AC-10,
  AC-14, AC-16), the WP3-T14 gate mapping and `handoff/delivery/WP3_HANDOFF.md` (created
  by WP3-T15).
- Read-only for source, configuration, tests and governance files. Use Node 24 by full
  path; spawn children with `process.execPath`; workflow Python for the validators. Use
  `D:\timesheet-tmp\WP3-GATE` for TEMP/TMP and the clean export (outside Dropbox); delete
  only files you created; never remove folders recursively. If a shell call fails with
  ENOSPC, stop and report. Never write into the repository root; on Windows never
  redirect to /dev/null or nul from a POSIX shell. Installed Edge channel; no browser
  download. Capture mode only; no real mail.

## Gate items (record each command, exit and result)

1. Clean `git archive` export of the freeze outside Dropbox; Node 24; `npm ci`.
2. `npm run verify` with `NODE_OPTIONS=--trace-deprecation --pending-deprecation`: exit 0,
   no deprecation line; record the test count and the smoke `PASS` count (WP3-T15 noted
   that the T14 record says 46 smoke checks while its log shows 40; record the actual
   count and which record is wrong).
3. `npm run test:e2e` (desktop and mobile): all pass; collect screenshots and PDF renders.
4. Race files 20 times each: `ot-leave-concurrency`, `finalization-concurrency`,
   `deadline-race` (each round: one winner, one revision, one ledger set, one send), and
   the sharing revocation race.
5. Fault injection: restart before the PDF, after the PDF and before send, kill during
   send → uncertain; restart sends nothing; an explicit decision resends once; duplicate
   job keys enqueue once; two runners claim once.
6. Automatic submission matrix: switch on/off; an empty period with default labels, zero
   OT, no deficit; note line off/on; auto-image off/on; `signed_at` null and review
   pending in the system; no automatic indicator on outgoing PDF/email unless the note is
   on; `{SignOffStatus}` "Submitted" or the note text.
7. Private downloads: PDF and signature ID swap 404, anonymous 401, no static path,
   `no-store`; shared PDF only with the PDF item, audited.
8. GET safety: every GET route runs with zero DB changes; deep links require login.
9. Capture inspection: recipients, subject, body and PDF SHA-256 equal the snapshot; no
   secrets in DB, logs or capture metadata; no `attachment.pdf` for attachment-less
   messages; outbound mode capture throughout.
10. Visual PDF evidence: view the renders (14 dates, OT on both Sundays in the total,
    Vietnamese and long labels, bounded signature, manual name and real sign date,
    automatic name and submission date, note on/off).
11. Migrations: fresh database and an upgrade from a database created at the accepted
    WP2 source 5fafeaee72509c6110a907458643bf7582dad81a through 0004–0006;
    `integrity_check` ok, `foreign_key_check` empty.
12. LG-01…LG-10 and DF-01…DF-16 present and passing; `npm run digest`;
    `validate_orchestration.py`, `check_recovery.py` and `validate_package.py
    --preflight` (workflow Python) exit 0.
13. Sharing (AC-16): the route-inventory matrix test passes; a non-grantee and an admin
    without a share get 404; revocation effective on the next request; no re-share.
14. Admin boundary: every admin response field is in the allowlist; no timesheet
    details for a seeded period; recipient addresses present (F-Q3 (b)); the A3-01
    assertion holds.
15. The gate mapping from WP3-T14 covers every gate line of WP3_IMPLEMENT/WP3_REVIEW;
    name any line without a test.
16. Diff scope since the WP2 acceptance commit 3ead61edb1316fe926fe969988f595792590cd41:
    list the changed paths by area (no unexpected governance path other than the
    GOV-WP3P prompt change).

## Output

Results here and masked, LF evidence in handoff/delivery/evidence/WP3-GATE/ (screenshots
and renders `*-synthetic.png` only). Decision PASS or FAIL with every failing item; an
environmental flake (for example a socket-buffer error) is rerun once and recorded.
Leave no server, browser or runner process.

Return at most 200 words, beginning with your self-reported model.

## Results

Verifier: WP3-GATE attempt 1, 2026-10-05. Model: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP3-GATE/`
(masked, LF; paths and addresses masked; renders `*-synthetic.png`). Node v24.21.0 (portable, full path), TEMP/TMP =
`D:\timesheet-tmp\WP3-GATE\tmp`, clean `git archive` export of the freeze under `D:\timesheet-tmp\WP3-GATE\export`.
Capture mode only; `PRODUCTION_SENDING_ENABLED` never set; no real mail. Environmental flakes: none, no reruns needed.

Decision: **PASS** (all 16 items).

- HEAD before and after: a1cd566e59253d19f53cfd5b3a81fd27a7e9a056. Digest of record (computed on the clean export, 717
  files, handoff/ excluded): 96870f7eaf5a0e892a9682e28931b3c46cf2888a4bfae3abd242b541e6a6e729. Equals the committer's digest,
  `npm run digest` in the project folder and the `git ls-tree` form; identical after all checks (re-hashed export blobs).
- 1 export, `npm ci` exit 0 (01-npm-ci.txt).
- 2 `npm run verify` with `NODE_OPTIONS=--trace-deprecation --pending-deprecation`: exit 0, zero "deprecat" lines;
  60 files, 1384 tests passed; smoke "SMOKE PASSED" with 40 `PASS` lines, 0 `FAIL`. The WP3-T14 record ("46 checks") is
  wrong; its own log and this run show 40 (02-verify.txt).
- 3 `npm run test:e2e` (Edge): exit 0, 127 passed, 5 skipped (by design: mobile-only tests on desktop, desktop-only PDF
  render on mobile), 0 failed; 116 screenshots generated, the five `pdf-*-synthetic.png` renders and are copied as evidence.
- 4 Races, 20 fresh-process rounds each: ot-leave-concurrency 20/20, finalization-concurrency 20/20, deadline-race 20/20,
  sharing revocation race 20/20 (11-races.txt).
- 5 Fault injection, in the full run (04-vitest-verbose.txt): jobs-restart (kill before write/before rename/after rename),
  delivery-crash (kill before `sending`, kill after `sending` -> uncertain, restart sends nothing, decision route),
  delivery.test (uncertain, never retried, one explicit resend = one new attempt; duplicate send job once), jobs.test
  (duplicate business key once; lease claim by a second connection refused), jobs-restart "claim every job exactly once".
- 6 Matrix: automation.spec (2x2 note x image, empty period, switch off) and deadline.test (switch on/off, default
  labels, zero OT, no deficit, auto-image only when authorized, no sign-off, review pending), pdf-render (note off: no
  automatic indicator); renders viewed.
- 7 pdf-download, signatures, smoke: ID swap 404, anonymous 401, `no-store`, no static path; shared PDF only with the PDF
  item and audited (sharing.test).
- 8 Smoke: data_version and every table count unchanged over nine submission GETs; review.spec deep link needs login.
- 9 delivery.test (frozen snapshot, no `attachment.pdf` without attachment, no secrets in rows/logs/metadata) and smoke
  capture (PDF equals download; `mode` capture).
- 10 Renders viewed: 14 dates, OT on both Sundays 5:00 and 7:30 in 15:30, Vietnamese name and holiday labels, bounded
  signature, real sign date 10/05/2026 (manual); automatic: submission date, note text only with the note on, image
  on/off, empty period 0:00.
- 11 Migrations: tests (fresh; version 3 = 5fafeae through 0004-0006; version 4, 5) pass; 0001-0003 unchanged since 5fafeae
  (git diff shows only 0004-0006 and migrations.ts). Own script (05-migrations.txt): fresh 1-6 and v3 -> 4,5,6, each
  `integrity_check` ok, `foreign_key_check` [], user_version 6, rerun applies nothing.
- 12 LG-01..LG-10 and DF-01..DF-16 present in tests and passing; `validate_orchestration.py` 0, `check_recovery.py` 0,
  `validate_package.py --preflight` 0 (PASS, 91 scenarios) on the export; orchestration and recovery also 0 on the live tree.
- 13 sharing-matrix (11 item sets, route inventory), sharing.test (non-grantee and admin without share 404, revocation on
  next request, no re-share), smoke 404/404/401. 14 operations-status allowlist and A3-01, admin-status/automation specs,
  recipients present (F-Q3 (b)).
- 15 Mapping: every gate line of WP3_IMPLEMENT/WP3_REVIEW has a test or render; the lines the T14 mapping leaves to earlier
  tasks (races, fault injection, migration, LG/DF) were executed above. No uncovered line.
- 16 Diff since 3ead61e (597 paths: 519 A, 78 M): src/server 51, src/client 44, src/domain 4, tests 47 (e2e 10, integration
  27, support 3, client 4, domain 3), docs 01-07, 09, 10 (EN+VI), package.json/lock, smoke script, one reference example,
  README/DEVELOPMENT, handoff 425. Governance: only the GOV-WP3P WP3_IMPLEMENT/WP3_REVIEW prompts (EN+VI) plus board/STATE/
  checkpoint and the new GOV_WP3P_REVIEW and WP3_HANDOFF documents; no AGENTS/CLAUDE/docs 08/skills change (10-diff-scope.txt).
- Residual: none open. The runner left no server, browser or job process.
