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

Filled 2026-10-06. The owner has not yet answered D-1..D-15 (board
`pending_owner_question`). Document each item with the recommended option, and label it
"recommended; owner decision pending (D-n)" wherever it shapes an instruction. Never
present it as decided.
- D-1 (R-A3): the older build runs with `JOB_RUNNER=off` until reconciliation.
- D-7: reminders are at-least-once after a crash on real SMTP. Say so in the known
  limits.
- D-8: a TLS certificate failure is currently classified temporary. Say so in the
  known limits, with the recommended change as pending.
- D-9: an owner-only pilot; a temporary password is set out of band; there is no
  self-service password change yet.
- D-10: one evidence-backed opening balance, or zero; no historical import for the
  pilot.
- D-11: the tracked docs hold placeholders only; real values live in the owner's
  private copy outside git.
- D-12: staged activation. In the first period: manual sign-off, the first real send
  to the owner's own address, auto-submit off and no activation instant. Enable
  automation from the next period.
- D-13: the NAS host stays NOT VERIFIED until the owner ticks the docs/11 checklist.
- D-14: the first release is declared at the owner's pilot authorization. From then
  on, fixes go through branches and pull requests (docs/08). Agents create no tag.
- D-2..D-6 and D-15: no instruction in this task depends on them. List them once under
  known limits as open owner choices with their current safe defaults.

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

Self-reported model: claude-sonnet-5-5 (timesheet-worker). Attempt 1. Documentation only; nothing
committed; no application source, test, Compose behaviour or migration changed.

Base recorded before work: HEAD = origin/main = 8e99d2c6375f71ac94faff9eb859b9b7bcf3e741; digest
1e59ad31d9af2a3f4a3aa5711647ea8742e1534b3d4f8ba4f2210beee44a3d2c (777 files). Node v24.21.0 by full path.

### Changed files

- New: `docs/12_RELEASE_NOTES.md` and `.vi.md`; `handoff/delivery/WP5_HANDOFF.md` and `.vi.md`.
- Edited: `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md` (new placeholders bullet; sections 13 pilot
  activation, 14 deactivation, 15 rollback card, 16 pilot operator notes; five command-map rows; section 1
  step 5 pointer; a status note); `README.md` and `README.vi.md` (one table row linking docs/12).
- Evidence: `handoff/delivery/evidence/WP5-REL/` (00 to 06, masked LF `.txt`).

### Facts established from the code (and documented as such)

- The activation instant has no screen: `PUT /api/admin/automation/activation` (administrator, reason
  required, not in the past, null clears). The runbook gives a same-origin browser-console call; it is marked
  owner NAS step, unverified. Not a code gap, so no stop.
- Real SMTP needs `OUTBOUND_MODE=smtp` and `PRODUCTION_SENDING_ENABLED=true`; there is no manual outbound pause
  command, so deactivation warns that a send job that runs after the switch to capture is only captured.
- The container must be recreated (`up --detach --force-recreate --no-build`) to reread the env file.
- TLS certificate failure reaches the adapter as `ESOCKET`, so it is temporary (D-8); `ETLS` is permanent.
- All D-1..D-15 are written as "recommended; owner decision pending"; none as decided. The release commit and
  digest are not written into docs/12 (a document cannot hold the digest of its own tree); they are recorded by
  the gate. docs/12 states the pre-notes base values.

### Checks

| Check | Result | Evidence |
|---|---|---|
| EN/VI parity (headings, numbered steps, list items, table rows, fences, checkboxes) for docs/11, docs/12, README, WP5_HANDOFF | all equal | `05-parity.txt` |
| Env keys named exist in `.env.example` or `src/server/config.ts` (Grep counts per key) | all 14 found (`JOB_RUNNER` in `.env.example` and `src`) | `01-env-keys.txt` |
| Placeholders | new ones defined in docs/11 "Placeholders and conventions" | docs/11 |
| `npm run verify` (SMOKE_PORT 47791; DATA_DIR and DATABASE_PATH in the task folder) | exit 0; 77 files, 1759 tests; smoke passed | `02-verify.txt` |
| `node scripts/precommit-check.mjs` and `--self-test` | exit 0 and 0 (0 staged files; nothing staged by design) | `03-precommit.txt` |
| `validate_package.py --preflight` (workflow Python) | exit 0, PASS, 87 translation pairs, 2018 local links | `04-preflight.txt` |
| `node scripts/source-digest.mjs` (last) | `0a64a75f3330cd5138c2787a28f0611c954138ad14ae914b23d966f8a30001ba`, 779 files | `06-digest.txt` |

### Blockers and notes

None. The precommit check inspects staged files only; the coordinator or committer reruns it on the staged set.
Section 13 to 16 steps are unverified on the NAS and no real mail was sent.
