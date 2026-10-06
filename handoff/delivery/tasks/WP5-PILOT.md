# WP5-PILOT dispatch brief

- Mission/task: timesheet-software-readiness / WP5-PILOT; package WP5; kind
  documentation (handoff only); attempt 1; depends on WP5-GATE (PASS).
- Scope: the concrete pilot packet for owner review, produced from the gated freeze.
  It contains placeholders and synthetic samples only. The owner keeps the real values
  in a private copy outside git (D-11). This task writes only under `handoff/`, so the
  source digest does not change.
- Profile/routing: timesheet-worker, requested sonnet, no override. Routing: size M,
  risk H (privacy, outbound wording), novelty no. The task record is in English. The
  packet is bilingual: EN is authoritative, and VI must match it.
- Base: the WP5-GATE `freeze_commit` and digest, given in the dispatch prompt. Record
  HEAD and the digest before and after; they must not change.

## Read

- AGENTS.md from disk first.
- [WP5-PLAN](WP5-PLAN.md), sections C and D.
- docs/05, docs/06 (AC-14 and the completion rule), docs/07, docs/11 and docs/12.
- The WP5-GATE results, including the image ID, the drill and restore figures, and
  the release identity.
- The board `pending_owner_question` (D-1..D-15) and any answers recorded in
  `owner_decisions`.

## Required work

1. Write `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`, following the WP5-PLAN
   section C table. Include:
   - **URL:** a placeholder, plus the check steps for `/api/ready`, sign-in and a deep
     link;
   - **sender and recipients:**
     - the field names, and where each value is set;
     - the capture-mode self-test;
     - the first real send going to the owner's own address, if D-12 is as
       recommended;
   - **email and PDF samples:**
     - generate them from the gated freeze in capture mode, with synthetic users at
       `example.invalid`;
     - cover a manual revision, and an automatic revision with the note line off and
       on;
     - save the subject, the headers and the body as `.txt`;
     - render each PDF page as `*-synthetic.png` and view it;
   - **settings checklist:** env key names only; the reporting zone, payroll
     calendar, the 2026 and 2027 holiday lists, policy B/N/M, deficit mode,
     reminders, auto-submit, note line, image authorization, activation instant and
     first pilot period;
   - **restore proof:**
     - the development-machine figures from WP5-GATE;
     - a blank target-restore form for the owner's NAS run, based on docs/11
       sections 4, 6 and 7;
   - **rollback:** the docs/11 rollback card, filled with the release commit, digest
     and the WP5-GATE image ID, and the pre-activation backup as a placeholder;
   - **release identity and the NAS checklist:** NAS NOT VERIFIED until the owner
     ticks it;
   - **owner decisions:** D-1..D-15 with the recommendation and the current answer,
     or "pending";
   - **authorization record:** an unsigned checklist that keeps software readiness,
     owner permission, provider acceptance and recipient receipt as separate facts.
     Nothing is pre-ticked.
2. Never write real host names, addresses, credentials, signatures or personal data.
   Never set `PRODUCTION_SENDING_ENABLED`. Never send real mail.
3. Do not change source, tests or docs outside `handoff/`. If the packet reveals that
   a runbook step is wrong, stop and report it.

## Checks

- EN/VI parity.
- Run the precommit check over the new files, including the PNGs.
- Run `validate_package.py --preflight` with the workflow Python.
- The digest before and after must be identical.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-PILOT`. Ports 47780–47789.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER feed anything to python or node through stdin.** Never pipe into head or
  tail.
- Stop only processes you spawned, through their own handle. Never kill by PID.
- Never redirect to /dev/null or nul. Never remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Owned paths:
  - `handoff/delivery/WP5_PILOT_PACKET.md` and `.vi.md`;
  - this brief's Results section;
  - `handoff/delivery/evidence/WP5-PILOT/`, holding masked LF `.txt` captures and
    `*-synthetic.png` renders only.

  Do not commit.

Return at most 150 words, beginning with your self-reported model.

## Results

(Worker appends here.)
