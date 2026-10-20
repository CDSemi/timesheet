# WP5-UX3-AUDIT-INT dispatch brief (final recheck and integration pass)

- Mission/task: timesheet-software-readiness / WP5-UX3-AUDIT-INT; package WP5; kind audit;
  attempt 1; depends on WP5-UX3-REGATE4 (PASS required). Fresh context.
- WP5-UX3-REGATE3 on 8629441 failed only on one time-of-day dependent test. WP5-UX3-FIX5
  fixed that test, frozen at 5c101c1. WP5-UX3-REGATE4 proved that the builds are identical
  and reran the tests.
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
- Target: `reviewed_commit` = 5c101c1ca8ba5b9c1ede8b1ac8bad9f3804ab05d (the
  WP5-UX3-FIX5-FREEZE commit), with the regate digest
  95323f2d44a2a5f0cc6708f281911858b3b8a8ed1d0c1b7fc32c8a4a0174b15f (833 files).
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
