# WP5-REL dispatch brief

- Mission/task: timesheet-software-readiness / WP5-REL; package WP5; kind
  documentation (canonical docs); attempt 1; depends on the WP5-AC13 freeze.
- Scope: the bilingual release and setup notes, plus the runbook sections that
  docs/11 defers to the WP5 pilot: pilot activation, deactivation and a rollback card.
  The freeze of this task is the WP5 package-final freeze, which WP5-GATE gates.
- Profile/routing: timesheet-worker, requested sonnet, no override. Routing: size M,
  risk H (outbound activation and rollback instructions), novelty no. The task record
  is in English. Canonical docs are EN, with a matching VI translation.
- Base: the commit and digest of the WP5-AC13 freeze, given in the dispatch prompt.
  Record HEAD and the digest before you start.

## Read

- AGENTS.md from disk first.
- docs/05, docs/06 (AC-14, AC-15 and the completion rule), docs/07, docs/09 (WP5) and
  docs/11, all in EN.
- [WP5-PLAN](WP5-PLAN.md), sections C (pilot packet outline), D (owner decisions) and
  F (carry-forward triage).
- [WP5_REVIEW_A](../WP5_REVIEW_A.md) and [WP5_REVIEW_B](../WP5_REVIEW_B.md), the
  sections on risks and pilot readiness.
- The "Owner decisions at dispatch" section below.

## Required work

1. **New `docs/12_RELEASE_NOTES.md` and `.vi.md`:**
   - the release identity: commit, source digest, `package.json` version, and the rule
     that the image ID is recorded when the image is built on the host (R-B5-1);
   - the scope by package, WP1–WP5, in a few lines each;
   - known limits and carried risks that affect a pilot user or operator. Take each
     item from WP5-PLAN section F marked PR or PB, plus R-WA1..R-WA3, R-WA8, R-B5-1,
     R-B5-2 and R-B5-4. Give each one line and point to the rule or runbook step;
   - the separation of software readiness, owner permission and the pilot result
     (docs/06);
   - a setup summary that points to docs/07 and docs/11 steps, without repeating
     them.
2. **docs/11 EN and VI, new sections after the existing ones:**
   - **Pilot activation.** Use the current env keys by name only:
     `PRODUCTION_SENDING_ENABLED`, `OUTBOUND_MODE`, the `SMTP_*` keys, `MAIL_FROM`,
     `PUBLIC_BASE_URL`, `APP_ORIGINS` and `TRUSTED_PROXY_ADDRESSES`. Cover:
     - a self-test in capture mode;
     - the pre-activation backup, and its name and hash;
     - setting the activation instant;
     - the staged first period (D-12);
     - what to check after the first real send. Provider acceptance and recipient
       receipt are separate facts.
   - **Deactivation.** Unset `PRODUCTION_SENDING_ENABLED`, set `OUTBOUND_MODE=capture`,
     clear the activation instant and restart. Keep the data. Never run two queues.
   - **Rollback card for the first installation.** Deactivate, keep the data, and
     fall back to the Excel workbook. Restore the pre-activation backup in isolation
     only if needed. State the R-A3 rule per D-1, and name the release commit, digest,
     image ID and pre-activation backup.
   - Pilot-relevant operator notes from WP5-PLAN section F:
     - migrate once before the first start (R-A2);
     - keep explicit paths for host CLI use (R-A8);
     - copy the pre-upgrade backup aside, or prune on another day (R-RA2);
     - restore into a new real folder (R-RA9);
     - save the submission settings before activation (WP3 R8, R-WA3).
3. **README.md and README.vi.md:** add one link to docs/12.
4. **`handoff/delivery/WP5_HANDOFF.md` and `.vi.md`:** a pre-gate snapshot in the
   HANDOFF form. Give the files and commits so far, the evidence paths, the open owner
   decisions and one next action (WP5-GATE). Leave the acceptance record empty.
5. Never write real host names, addresses, credentials or personal data. Use
   placeholders only. The real values live in the owner's private copy (D-11).
6. Do not change application source, tests, Compose behaviour or migrations. If a
   documented step needs a code change to be true, stop and report it.

## Owner decisions at dispatch

The coordinator fills this section before dispatch. Each line records the owner's
answer, or "pending, documented with the recommended option and marked as an owner
decision".

(Coordinator fills in at dispatch.)

## Checks

- EN/VI parity: the same headings, steps and list items for docs/11, docs/12, README
  and WP5_HANDOFF.
- Every env key you name exists in `.env.example` or `src/server/config.ts`. List the
  Grep results.
- Every command you add uses the placeholders defined in docs/11 "Placeholders and
  conventions".
- `npm run verify`, with `SMOKE_PORT` in 47790–47799 and `DATA_DIR` and
  `DATABASE_PATH` set inside the task folder.
- The precommit check, then `validate_package.py --preflight` with the workflow Python
  `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
- `npm run digest` last. Rerun it if any file changes afterwards.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, and never open an interactive
  shell.
- **NEVER feed anything to python or node through stdin.** Never pipe into head or
  tail.
- Call Node 24.21.0 by its full path; make the first shell call a trivial
  `node --version`.
- Use the task folder `D:\.claude-tmp\timesheet\WP5-REL` for TEMP/TMP and raw output.
  Never touch `%LOCALAPPDATA%\timesheet-dev`.
- Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
  anything recursively. Never write into the repository root.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Owned paths:
  - `docs/12_RELEASE_NOTES.md` and `.vi.md`;
  - `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md`;
  - `README.md` and `README.vi.md`;
  - `handoff/delivery/WP5_HANDOFF.md` and `.vi.md`;
  - this brief's Results section;
  - `handoff/delivery/evidence/WP5-REL/`, with masked LF `.txt` only.

  Do not commit.

Return at most 150 words, beginning with your self-reported model: the changed files,
the parity and env-key checks, verify, precommit and preflight exit codes, and the
final digest.

## Results

(Worker appends here.)
