# WP5-UX3-AUDIT-INT dispatch brief (final recheck and integration pass)

- Mission/task: timesheet-software-readiness / WP5-UX3-AUDIT-INT; package WP5; kind audit;
  attempt 1; depends on WP5-UX3-REGATE5 (PASS required). Fresh context.
- WP5-UX3-REGATE3 on 8629441 failed only on one time-of-day dependent test. WP5-UX3-FIX5
  fixed that test, frozen at 5c101c1.
- WP5-UX3-REGATE4 on 5c101c1 failed only on real-clock e2e flakes. WP5-UX3-DIAG1 found two
  host buffer events and one race in a FIX4 hover test.
- WP5-UX3-FIX6 fixed that race with a one-line change, frozen at 8e55710. WP5-UX3-REGATE5
  proved that the builds are identical and reran the tests.
- The board's rule clarification, that a failure carrying ERR_NO_BUFFER_SPACE counts as a
  buffer error, applies to your e2e runs too.
- Its PASS re-accepts WP5 after UI change round 3. Per the coordinator decision of
  2026-10-19 ("WP5-UX3-FIX4 frozen at 8629441"), it is also the recheck of the A2/B2
  findings fixed by WP5-UX3-FIX4. No separate A3/B3 runs.
- History you integrate:
  - WP5-UX3-GATE attempt 1 on cecfceb failed.
  - WP5-UX3-FIX1, WP5-UX3-SWEEP and WP5-UX3-FIX2 followed.
  - WP5-UX3-REGATE passed on 7ce4e95, with one recorded timeout deviation.
  - The first area audits WP5-UX3-AUDIT-A and -B were FIX REQUIRED on 7ce4e95.
  - WP5-UX3-FIX3 followed.
  - WP5-UX3-GOV2 adopted the owner's AGENTS.md text. It was accepted by WP5-UX3-GOV2-AUDIT
    on ceb86b6 (`handoff/delivery/GOV_UX3_REVIEW2.md`).
  - WP5-UX3-REGATE2 passed on ceb86b6.
  - The rechecks WP5-UX3-AUDIT-A2 and -B2 were FIX REQUIRED on ceb86b6.
  - WP5-UX3-FIX4 followed, then WP5-UX3-REGATE3 on 8629441.
- Profile/routing: timesheet-auditor, requested opus/xhigh, no override. Routing: size L,
  risk M, novelty no.
- Records:
  - task record in English;
  - review pair `handoff/delivery/WP5_UX3_REVIEW_INT.md` and `.vi.md`, from the REVIEW
    template in `handoff/templates/`.
- Author separation: you are none of the round-3 workers, planners, verifiers or auditors
  (A, B, A2, B2, GOV2); agent IDs are on the board. Treat every report as a claim.
- Target: `reviewed_commit` = 8e557100d16b6b6eb86a48e00276835761aabfdf (the
  WP5-UX3-FIX6-FREEZE commit), with the regate digest
  507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6 (833 files).
  - Record HEAD, the digest before and after (three forms) and `reviewed_commit`.
  - Work on a clean `git archive` export with no `.git` folder (never `git init` it).
- AGENTS.md on disk at the target wins over any injected copy. An injected copy may still
  show the owner's unedited text.

## Scope

1. **Recheck of the A2/B2 findings, by your own probes and mutants on the target:**
   - F-UX3A2-1: the phone More panel closes when focus leaves it, and no focused control
     is hidden. Check both projects at 390x844, and that Escape and the focus return
     still work.
   - F-UX3A2-2: the button-link and phone-tab rings under the pointer are guarded (M4,
     M5).
   - F-UX3A2-3: Sign out aligned within 0.5px of Profile, in the menu and in More.
   - F-UX3B2-1: the removal note's absence is guarded (M6a).
   - R-A2-1: the hover scan now judges media by matching (M6b).
   - R-B2-1: "Confirm breaks" on a session ended today is guarded (M5b).
   - R-B2-4: the comment on `suggestedRows`.
   - FIX4's whole diff (`git diff ceb86b6..86294412 -- src tests docs`): regression in
     both areas, including the blur handling of the More panel (a pointer press on More,
     an outside press, a page change, entries, Escape) on a touch phone and a desktop
     narrow window.
   - FIX5's test (`git diff 86294412..5c101c1`): hour-independent, and no assertion
     weaker than FIX4's version.
   - FIX6's selector (`git diff 5c101c1..8e55710`): the race is gone, and nothing else in
     `hover.spec.ts` resolves a layout-specific element right after a viewport change.
2. **Integration of the round's records.**
   - All six area reviews (A, B, A2, B2 and the GOV reviews) and the gate records (GATE,
     REGATE, REGATE2, REGATE3).
   - Every finding is closed, or accepted as an optional risk with a reason.
   - Earlier verdicts are carried forward only where the later diffs leave them valid.
   - Map every owner item U-01..U-27, N-1, N-2, every answer G-1..G-5, Q6, the 24-hour
     chip answer and Q7 to the review that judged it. No area may be left unaudited.
   - Every attempt-1 gate FAIL reason and every sweep finding 1-13 has a verdict.
   - The REGATE timeout deviation and its AUDIT-A verdict have a verdict.
3. **Cross-area behaviour, by your own probes.**
   - The floating editor at 1280 with the session dialog, a sub-dialog and a confirmation
     stacked: Escape order, focus returns, the inert page.
   - The account menu while the editor is open (1366, non-modal), and the More panel on a
     phone while the Day editor sheet is open.
   - A shared view (view only and edit) with the new header, chips, session cards and
     dialogs.
   - The "in progress" pill in the period bar and the editor chip on a window day, under the
     simulated clock (FIX10 preload in the task folder only).
   - Settings and Administration reachable for an admin in every layout.
4. **AC-13** under the America/Los_Angeles, Asia/Tokyo and America/New_York device zones.
5. **Docs.** docs/04, docs/10 and docs/12 (EN and VI) against the frozen behaviour for the
   points above, and AGENTS.md as accepted.
6. **Mandatory checks:**
   - typecheck, lint, `npm test`, build (no advisory);
   - the FULL e2e on both projects on the real clock. A run that fails only with a network
     or buffer error is rerun once, and both runs are recorded.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX3-AUDIT-INT`. Ports 49140-49159.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every server or CLI run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash only; never cmd.exe or an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN (NO HEREDOCS, NOT EVEN EMPTY
  ONES; NO `node -e`, `python -c`, `| node`, `| python`). NEVER PIPE INTO `head` OR `tail`.
  NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stderr`, `/dev/zero` OR `nul`.
  NEVER `rm -r`.**
  - Write probes as files in the task folder and run them by path.
  - Read outputs with the Read tool.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- The workflow Python is
  `$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`.
  Write `<user>` in the evidence.
- axe-core 4.14.0, if used, goes in the task folder only.
- Never kill processes by PID. Leave nothing running.
- Create files only in the task folder, the evidence folder and the review pair. Evidence
  names end in `.txt` or `-synthetic.png` only, with at most 12 screenshots.
- Synthetic data only. No email address except the full synthetic `@example.invalid`
  form.
- If a permission check denies a call, stop and report.

## Output

- The review pair.
- Results in this file.
- Evidence in `handoff/delivery/evidence/WP5-UX3-AUDIT-INT/`.
- A decision of PASS / FIX REQUIRED / NOT VERIFIED, with numbered findings (severity,
  file:line, reproduction, expected) and optional risks.
- Return at most 250 words, beginning with your self-reported model.

## Results

### Checkpoint 1 (2026-10-20 about 05:25Z; auditor attempt 1, in progress)

- Self-reported model claude-opus-5-5 (board agent a08c43f46e599d8f4); not a WP5 author or round-3 reviewer (board check
  `02-authors.txt`). Node v24.21.0. Task folder `D:\.claude-tmp\timesheet\WP5-UX3-AUDIT-INT`.
- Digest before: 507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6 (833 files) in three equal forms (clean
  `git archive` export, `git ls-tree`, `npm run digest`); HEAD 8e557100 = origin/main; 0 non-handoff status lines.
- Mandatory checks on the clean export: typecheck 0, lint 0, `npm test` x2 0 (94 files, 2141 tests), build 0 (main chunk
  `index-DyUV--8_.js` 487.01 kB, no advisory), AC-13 0 under America/Los_Angeles, Asia/Tokyo and America/New_York; FULL e2e
  real clock exit 0: 651 passed, 67 skipped, 0 failed (desktop 329/30, mobile 322/37), 0 deprecation and 0 buffer lines.
- Probes done so far: More panel walk (0 hidden stops of 47, closes at the Tab past Sign out, both projects; base ceb86b6: never
  closes, 12 hidden), Sign out start equal to Profile (0px; base 3px), dialog stacks, menu over the 1366 editor, admin reachability
  at 13 widths, FIX6 race replica, pill on the real clock and a window day, FIX5 test at four instants. Remaining: repaired probes,
  mutants, review pair, evidence copy, digest after.

### Auditor result (attempt 1, done 2026-10-20 about 06:10Z) - decision: PASS

Self-reported model: claude-opus-5-5 (board agent a08c43f46e599d8f4), profile timesheet-auditor. Fresh context; not a WP5 author
nor a round-3 planner, worker, verifier or auditor (`02-authors.txt`); the strongest author model is claude-opus-5-5, not stronger.
Review pair `handoff/delivery/WP5_UX3_REVIEW_INT.md` and `.vi.md`; evidence `handoff/delivery/evidence/WP5-UX3-AUDIT-INT/` (index
`00-README.txt`, masked LF `.txt` and 10 `-synthetic.png`).

- Identity: HEAD = origin/main = 8e557100d16b6b6eb86a48e00276835761aabfdf before and after; 0 status lines outside `handoff/`;
  digest 507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6 (833 files) before (04:44:49Z) and after (05:37:49Z) in
  three equal forms (clean `git archive` export without `.git`, `git ls-tree`, `npm run digest`).
- Mandatory checks (clean export): typecheck 0; lint 0; `npm test` x2 0 (94 files, 2141 tests); build 0 (main 487.01 kB, no
  advisory); AC-13 0 under America/Los_Angeles, Asia/Tokyo and America/New_York (child-process TZ, probed offsets 420/-540/240);
  FULL e2e real clock exit 0 at the first run: 651 passed, 67 skipped, 0 failed (desktop 329/30, mobile 322/37), 16.3 min, 0
  deprecation and 0 buffer or network lines, so no rerun.
- Recheck: F-UX3A2-1 closed (More closes at the Tab past Sign out, 47 stops walked, 0 hidden, both projects; Escape and the return
  to More, Shift+Tab out, toggle without flicker, outside press, page change, entries all hold); F-UX3A2-2 closed (M4, M5 caught,
  `hover.spec.ts:718`); F-UX3A2-3 closed (all entries 12/42px, 0px from Profile, 16 cases; MA3 caught, `shell.spec.ts:1135`);
  F-UX3B2-1 closed (M6a caught, `day-editor.spec.ts:1882`); R-A2-1 closed (M6b caught, `hover.spec.ts:646`); R-B2-1 closed (M5b
  caught, `day-editor.spec.ts:3941`); R-B2-4 closed (comment, tests-only callers). MA1 and MA1b caught (`shell.spec.ts:779`); MA1c
  (characterization) survives in Chromium (risk R-INT-2). FIX4 diff: no regression; FIX5: passes at 00:30, 12:00, 23:45 PDT and
  01:30 PST on both projects, every FIX4 assertion kept; FIX6: replica with a 150 ms deferred matchMedia event resolves the stale
  desktop button 20/20 with the old selector, 0/20 with the new; no other post-resize resolution in `hover.spec.ts`.
- Integration: GOV_UX3_REVIEW and GOV_UX3_REVIEW2 current (no governance path changed since ceb86b6); A, B, A2, B2 findings all
  closed; GATE attempt-1 reasons closed (3c accepted as A's R2); sweep 1-13 closed; REGATE timeout deviation confirmed as load noise
  and closed (FIX3 item 12; my run 20.6-21.7 s desktop, 15.5-16.7 s phone); REGATE3 and REGATE4 failures closed by FIX5 and FIX6;
  every owner item U-01..U-27, N-1, N-2, G-1..G-5, Q6, the 24-hour chip answer and Q7 mapped to its review; the remaining risks
  carried with reasons.
- Cross-area probes: 1280 floating editor stack (editor, session dialog, notice, confirmation, discard question) with the correct
  Escape order and focus returns and an inert page; phone sheet, chips and the "Break 1" sub-dialog; More inert while the sheet is
  open; the account menu over the 1366 non-modal editor; shared view only and edit (grantee in the bar, no Check in/out, "View
  only" chip, edits only under `/api/shared/:ownerId`); "in progress" pill and chip on a simulated window day; Settings and
  Administration reachable for an administrator at 13 widths with and without a received share. axe 4.14.0: 0 violations in the
  scanned states.
- Docs: docs/04, docs/10 (487.01 kB equals the build) and docs/12 EN/VI match the behaviour; parity clean; preflight PASS (118 pairs).
- Findings: none. Optional risks: R-INT-1 (docs/04 line 7 does not spell out the More closing rules), R-INT-2 (WebKit not
  verifiable), R-INT-3 (host ERR_NO_BUFFER_SPACE seen once in a mutant run), R-INT-4 (two-row bar at 768-1023px with a share).
- Slips (read-only, no effect; `96-slips.txt`): nine pipes into head/tail and one `od -c | tail`; one file briefly written to the
  parent of the task folder and moved in. Probe repairs recorded. Nothing of mine is left running.

Status: done (decision PASS)
