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

(Verifier appends here.)
