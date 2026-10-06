# WP5-FINAL-AUDIT dispatch brief

- Mission/task: timesheet-software-readiness / WP5-FINAL-AUDIT; package WP5; kind
  audit; attempt 1; depends on WP5-GATE (PASS) and WP5-PILOT.
- Scope: the final independent WP5 audit on the package-final freeze. It has three
  parts:
  - recheck findings WP5-B-01 and WP5-B-02;
  - recheck area B on the new digest;
  - an integration pass over the release notes and the pilot packet.

  WP5-ASSESS-A attempt 2 runs at the same time. It is a separate fresh auditor that
  covers the area-A delta, so this audit does not repeat that work.
- Profile/routing: timesheet-auditor (xhigh), model opus. Routing: size L, risk H,
  novelty no.
- Fresh context: you authored no WP1–WP5 change. You are not the WP5-ASSESS-A or
  WP5-ASSESS-B auditor of attempt 1, and not the WP5-ASSESS-A attempt-2 auditor.
- Language: the task record is in English. `WP5_REVIEW_FINAL.md` and its `.vi.md`
  follow the REVIEW form.
- Target: `reviewed_commit` is the WP5-GATE `freeze_commit`. The coordinator gives the
  SHA and the gate digest in the dispatch prompt. Record HEAD and the digest before
  and after: in the repository, in the `git ls-tree` form and on your export.

## Read

- AGENTS.md, from disk.
- [WP5_REVIEW](../../prompts/WP5_REVIEW.md) and the documents it names, plus docs/11
  and docs/12.
- [WP5_REVIEW_B](../WP5_REVIEW_B.md), its findings and risks.
- The results of WP5-FIXB, WP5-AC13, WP5-REL, WP5-GATE and WP5-PILOT, with their
  evidence. Inspect it; do not trust the summaries.
- `handoff/delivery/WP5_PILOT_PACKET.md` and `handoff/delivery/WP5_HANDOFF.md`.

## Scope

1. **WP5-B-01 and WP5-B-02.**
   - Run `docker compose config` for each documented form yourself: the live
     instance, the restored instance and the rollback to the previous tag.
   - Start the restored instance on a restore folder under its own project, using a
     backup you made with synthetic data. Check that it binds the right data and
     image and starts paused.
   - Check the env-file retention step and the checklist line.
2. **Area B on the new digest.**
   - Two clean exports with byte-identical `dist/`.
   - The image is non-root and has no forbidden files.
   - Run the drill `--wp3`, stages 1–6, or justify relying on the WP5-GATE drill
     after you inspect its evidence.
   - Operations privacy holds.
3. **Release notes and runbook additions (docs/12, the docs/11 activation,
   deactivation and rollback card).**
   - Every step is executable with the documented placeholders.
   - Every env key exists in `.env.example` or `src/server/config.ts`.
   - Owner decisions appear as pending wherever the owner has not answered.
   - EN/VI parity.
   - Nothing contradicts docs/05, docs/06 or docs/07.
4. **The pilot packet.**
   - It is complete against WP5-PLAN section C.
   - The samples come from the gated freeze. Recipients are `example.invalid`, and
     the PDFs are rendered and synthetic.
   - It holds no real host, address, credential, signature or personal data.
   - The authorization record keeps software readiness, owner permission, provider
     acceptance and recipient receipt separate, with nothing pre-ticked.
5. **Overall verdict** under the docs/06 block list, for software readiness only.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-FINAL-AUDIT`. Ports 47760–47779.
- Docker:
  - Use Compose project `ts-wp5-final`; one-off containers use the same prefix.
  - Use non-TTY flags only.
  - Remove your image by exact tag and your project by name.
  - Record `docker ps --all --filter name=ts-wp5-final`; it must be empty.
- Set `DATA_DIR` and `DATABASE_PATH` inside the task folder for every CLI or server run.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Use Git Bash only, never cmd.exe, and never an interactive shell.
- **NEVER feed anything to python or node through stdin.** Never pipe into head or
  tail.
- Stop only processes you spawned, through their own handle. Never kill by PID.
- Never redirect to /dev/null or nul. Never remove anything recursively.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Do not fix anything, send real mail or set `PRODUCTION_SENDING_ENABLED`.

## Output

- `handoff/delivery/WP5_REVIEW_FINAL.md` and `.vi.md`.
- Results appended to this file with the Edit tool.
- Masked LF `.txt` evidence in `handoff/delivery/evidence/WP5-FINAL-AUDIT/`, with
  probes saved as `*.mjs.txt`.
- Decision: exactly PASS, FIX REQUIRED or NOT VERIFIED. List findings separately, each
  with file and function, reproduction, expected and actual results, rule or AC ID,
  and a bounded fix.
- Separate software readiness, owner permission and the real pilot outcome.
- Leave nothing running.

Return at most 200 words, beginning with your self-reported model.

## Results

### Auditor result (attempt 1) - decision: FIX REQUIRED (two Low documentation findings)

Self-reported model: claude-opus-5-5 (fresh `timesheet-auditor` subagent; authored no WP1-WP5 change; not the WP5-ASSESS-A
attempt 1 or 2 or WP5-ASSESS-B auditor; the attempt-2 report was not read). Report: `handoff/delivery/WP5_REVIEW_FINAL.md`
and `.vi.md`. Evidence: `handoff/delivery/evidence/WP5-FINAL-AUDIT/` (index `00-README.txt`). Raw output stayed in
`D:\.claude-tmp\timesheet\WP5-FINAL-AUDIT`.

Target and digest:
- `reviewed_commit` 74d5bfec6700126da4105b5d97f5efe943f896f5 = WP5-GATE `freeze_commit`; HEAD = origin/main before and after.
- Digest 0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba (779 files) before and after:
  - in the repository (`scripts/source-digest.mjs`);
  - in the `git ls-tree` form;
  - on two clean `git archive` exports. Their tars are identical, and the export listing equals the ls-tree listing.
- Nothing outside `handoff/` changed.

| Scope item | Result |
|---|---|
| 1. WP5-B-01 / WP5-B-02 | Resolved. `docker compose config` exit 0 for `<compose>`, `<compose-restored>` and `<compose-previous>`, with the variables in `<project-dir>/.env`, from an unrelated folder (`12-*`). Restored-instance start: synthetic data was backed up (section 13 step 3 commands) and the live instance stopped. The backup was restored in the documented one-off container form. `<compose-restored> up --detach --no-build` started it under its own project, with `/data` = `<restore-dir>` and the release image (same ID). It was healthy, logged `PAUSED (reason: restored)` and was point in time: the post-backup session gives 404 (`20-*`..`25-*`). The env-file copy step (section 4 step 3) and the section 2 checklist line are present in EN and VI. The backup manifest holds no configuration (`26-*`) |
| 2. Area B | PASS. `npm ci` exit 0/0 (lockfile unchanged, 0 deprecation lines). `dist/` is byte-identical across two exports (230 files) and equals the `546cdda` dist. Drill `--wp3` stages 1-6: exit 0, 208 PASS, 0 FAIL, 5 min. The image runs as 10001, with forbidden files 0 and dev packages 0. Operations privacy holds. `npm run verify` exit 0 (77 files, 1759 tests, SMOKE PASSED). AC-13 alone x2 plus `TZ=Asia/Tokyo` exit 0. `npm audit --omit=dev` 0 |
| 3. Release notes and runbook additions | Env keys all exist. Owner decisions are pending everywhere. EN/VI parity holds. No contradiction with docs/05, 06 or 07. The activation console step was run verbatim in headless Edge: it is executable and safe (admin cookie Secure/HttpOnly/SameSite=Strict, origin check 403, past 422, reason 422, audited, the clear works). Restart keeps the env, a recreate rereads it, and the server refuses smtp without the flag. Exception: WP5-F-01 |
| 4. Pilot packet | Complete against section C. Samples come from the gated freeze, `example.invalid` only, PDFs rendered and synthetic (2 of 4 viewed). The gate figures match. A privacy scan is clean. The authorization record keeps four facts separate, with 0 of 35 boxes ticked. Exception: WP5-F-02 |
| 5. Overall | No blocking defect under the docs/06 block list. FIX REQUIRED for two Low documentation findings |

Findings:
- **WP5-F-01 (Low).** docs/11 EN and VI (section 13 steps 2 and 4, section 14 step 4) and the packet EN and VI (section 2
  self-test, section 6 step 1).
  - They tell the operator to check that the administrator status shows "the flag off/on". The status has no such field: it
    shows only "Sender address: Configured" and the outbound mode (`17-*`, `18-*`).
  - "The server and the CLI refuse to start" without the flag is wrong for `cli.js migrate`, which exits 0 (`19-*`).
  - Fix: name the observable facts, and check the flag in `<env-file>` without printing values.
- **WP5-F-02 (Low).** Packet EN and VI, section 8: "a small follow-up before the package-final freeze" is stale. The freeze
  `74d5bfe` exists, and the D-8 recommendation differs from the current default. Fix: say that a differing answer causes a
  fix round before activation and a refresh of the packet identity.

Risks and observations:
- R-F1: the restored instance inherits the live SMTP env during the pilot; the pause protects it.
- R-F2: promoting restored data to live is not documented.
- R-F3: three image IDs for one source.
- R-F4: host commands need root.
- R-F5: the instant shows in the browser zone.
- R-F6: the console paste guard.
- R-F7: R-B5-2 is still open.
- O-1: WP5_HANDOFF calls WP5-B-01 "low"; fix it in WP5-ACCREC.
- O-2: recorded deviations of this audit:
  - `--name`, `-T` and `MSYS_NO_PATHCONV=1` added to documented commands;
  - three probe errors were fixed and rerun, and all runs are kept;
  - one stray `cp ... 2>/dev/null` in a shell call, against the runtime rule, with no effect on any result.

Runtime and cleanup:
- Ports used:
  - 47761, for the live and restored instances, one at a time;
  - 47762, for smoke;
  - the drill and the previous-build servers use OS-chosen loopback ports by design.
- Docker projects were `ts-wp5-final`, `ts-wp5-final-live` and `ts-wp5-final-live-restored`. All are down by name.
- The images `ts-wp5-final-timesheet:drill` and `:74d5bfe` were removed by exact tag.
- `docker ps --all --filter name=ts-wp5-final` is empty, with no network, volume or listener on 47760-47779 (`36-*`).
- No process of this task is left running.
- `PRODUCTION_SENDING_ENABLED` was never set, and no real mail was sent.

Preflight PASS (90 pairs) after the report was written.

Next action: one bounded documentation fix for WP5-F-01 and WP5-F-02 (`addresses_audit: WP5-FINAL-AUDIT`; it may share a
task with the WP5-ASSESS-A attempt-2 findings). Then a freeze, a gate and a recheck of the changed lines. O-1 goes into
WP5-ACCREC.
