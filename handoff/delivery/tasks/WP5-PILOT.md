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

### Worker result (attempt 1) - packet written, owner review pending

Self-reported model: claude-sonnet-5-5. Base: HEAD = origin/main = `74d5bfec6700126da4105b5d97f5efe943f896f5`; digest of record
`0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba`, 779 files, equal before and after (git ls-tree form and
`npm run digest`; listings identical; nothing changed outside `handoff/`). Node v24.21.0 portable, Git Bash.

Files written (all under `handoff/`):

- `handoff/delivery/WP5_PILOT_PACKET.md` and `WP5_PILOT_PACKET.vi.md` (11 sections: release identity, URL, sender and
  recipients, samples, settings checklist, restore proof with a blank NAS form, rollback card, NAS checklist, D-1..D-15,
  unsigned authorization record, limits, evidence index). Every owner box is empty; nothing is pre-ticked; every owner
  decision reads "pending" (none is answered in `owner_decisions`).
- `handoff/delivery/evidence/WP5-PILOT/`: 8 captured messages (`msg-01`..`msg-08`, subject, raw headers, decoded body), 4 PDF
  text dumps, 4 renders `pilot-03/04/07/08-...-p1-synthetic.png`, `sample-index.txt`, run logs, health/ready record,
  digest before/after, parity, precommit self-test, preflight, `01-commands.txt`, and the generator scripts as `.mjs.txt`.
- This Results section.

Samples: generated from a clean `git archive 74d5bfe` export (`npm ci`, `build:server`), production services and job handlers,
fixed clocks, capture mode, synthetic users at `example.invalid`; `PRODUCTION_SENDING_ENABLED` never set; nothing sent. Covered:
manual original (S1), manual correction e-mailed by choice (S2), automatic with the note line off (S3) and on (S4), plus the
reminder and the outcome notice for the two automatic accounts. 8 messages, 4 PDFs (1 page each, stored hash equals the
captured attachment), 4 renders; each PNG was viewed with the image reader.

Results of the checks:

| Check | Result |
|---|---|
| EN/VI parity (`parity.mjs`) | exit 0, PARITY OK (307 lines each, 12 h2, 8 h3, 128 table rows, 34 boxes, 264 code spans, 19 links) |
| `precommit-check.mjs --self-test` | exit 0 (12 rules) |
| `precommit-check.mjs` over the new files (private temporary index, 25 files incl. the PNGs and this brief) | exit 0, 0 blocking findings, 0 warnings |
| `validate_package.py --preflight` (codex runtime Python 3.12) | exit 0, PASS, 88 translation pairs |
| Digest before and after | identical, see above |
| Health and readiness of the built export in capture mode (port 47780, stopped through its handle) | `/api/health` 200, `/api/ready` 200 (schema 13/13) |

Observations for the coordinator and the owner (no runbook step was found wrong, so nothing was stopped):

- Runbook sections 13 to 16 match what the build does: the capture folder (`mail-capture` under the private data directory),
  the recipients set per user, the frozen body, the `{SignOffStatus}` rule ("Submitted", or the note text on an automatic
  submission with the note line on) and the no-indicator rule all held in the samples.
- The manual correction (revision 2) message has the same wording as the original ("Status: Submitted"); only the revision
  number, the PDF and the totals differ. Listed in the packet as an owner wording judgement.
- The automatic PDF prints "Worked" for dates without records (R-WA8) and does not show partial leave (R-WA2); both are
  documented limits, shown in the packet.
- The reference image ID is the removed drill build of the gate, not a NAS image; the packet says so and keeps `<image-id>`
  for the NAS build.

Limits: NAS, real SMTP, reverse proxy and the separate-device copy are unobserved (owner steps). Nothing committed, sent or
edited outside the owned paths; board, STATE, NEXT_ACTION and the checkpoint untouched. No process of this task is left running.

Incident to resolve: one Bash call by this worker ran the system Python with an empty heredoc on stdin (a violation of the stdin
rule, by mistake). It wrote no file and no data, but it left a background interpreter task that loops on an error and keeps
writing to its harness output file (`b4fr6819n.output` in the session tasks folder; about 1 GB and growing about 2 MB/s at
15:05). The worker has no handle tool and must not kill by PID, so the coordinator must stop that background task.
