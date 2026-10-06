# WP5-FIXB dispatch brief

- Mission/task: timesheet-software-readiness / WP5-FIXB; package WP5; kind fix;
  attempt 1; addresses audit WP5-ASSESS-B (FIX REQUIRED).
- Scope: a bounded documentation fix for findings WP5-B-01 (Medium) and WP5-B-02 (Low)
  in [WP5_REVIEW_B](../WP5_REVIEW_B.md). No application source or test change.
- Profile/routing: timesheet-worker, requested sonnet, no override. Routing: size M,
  risk M (operations instructions for restore and rollback), novelty no. The task
  record is in English. Canonical docs are EN, with a matching VI translation.
- Base: HEAD = origin/main = e7fe5144dc62f5047c79dd5ef69d973f60dfd14d. The source
  digest is 26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081. Record
  HEAD and the digest before you start.
- Follow [FIX_FINDINGS](../../prompts/FIX_FINDINGS.md). Read AGENTS.md from disk first,
  then:
  - WP5_REVIEW_B, the sections "Findings" and "Risks and optional improvements";
  - its evidence `12-runbook-compose-config.txt` and `15-build-no-cache.txt` in
    `handoff/delivery/evidence/WP5-ASSESS-B/`;
  - docs/07 "Backup, restore and upgrades";
  - docs/11 (EN and VI), `compose.example.yaml`, `.env.example`, and the drill
    script's Compose variables.

## Required changes (docs and examples only)

1. **WP5-B-01, Compose binding and release image.** In docs/11 EN and VI:
   - In "Placeholders and conventions", define `<image>` and the four Compose
     variables. Give one documented way to set them, for example
     `<project-dir>/.env` with:
     - `TIMESHEET_ENV_FILE=<env-file>`;
     - `TIMESHEET_DATA_DIR=<data-dir>`;
     - `TIMESHEET_IMAGE=timesheet:<release-commit>`;
     - `TIMESHEET_PORT=3000`.
     Every `<compose>` command must then bind the documented env file, data folder
     and image.
   - Section 1, steps 5 and 8: use those bindings.
   - Section 6, steps 2–3: start the restored instance on `<restore-dir>`, under its
     own Compose project name, so that it never shares the live data or project.
   - Section 8, upgrade and rollback: use one image tag per release, and record the
     image ID at build time. The rollback starts the previous release tag. A
     same-tag rebuild must not be the rollback path.
   - Align the `.env.example` header path with the runbook's `<env-file>`, or say to
     set `TIMESHEET_ENV_FILE`. You may add one comment to `compose.example.yaml` that
     points at the runbook. Change no Compose behaviour.
2. **WP5-B-02, configuration retention.** In docs/11 EN and VI:
   - Section 4, step 3: keep a protected copy of `<env-file>` with the
     separate-device backup copy. It is mode 600 and never goes into git or chat.
     Keep the release commit, digest and image ID with it.
   - Add a matching line to the section 2 checklist.
3. **Optional, same sections only:** one runbook note for R-B5-4. After a restore and
   its reconciliation, take a backup, because the restored instance reports backup
   `never` until then.

Keep docs/07 unchanged unless a sentence there contradicts the fix. If one does,
change docs/07 EN and VI together and report why. Do not touch the activation,
deactivation or pilot sections; WP5-REL owns those.

## Checks (record the command, exit code and counts)

- For each documented Compose form, run `docker compose config` against a scratch
  project folder under the task folder, with synthetic placeholder values. This
  includes the live instance, the restored instance and the rollback to the previous
  tag. Save the masked output. Do not start any container. Use project names with the
  prefix `ts-wp5-fixb`.
- EN/VI parity: the same headings, steps and list items.
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
- Use the task folder `D:\.claude-tmp\timesheet\WP5-FIXB` for TEMP/TMP, scratch Compose
  folders and raw output.
- Never kill processes by PID. Never redirect to /dev/null or nul. Never remove
  anything recursively. Never write into the repository root.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write results into this brief with the Edit tool. Put masked LF `.txt` evidence in
  `handoff/delivery/evidence/WP5-FIXB/`. Do not commit.

Return at most 150 words, beginning with your self-reported model: the changed files,
the Compose config results, verify, precommit and preflight exit codes, and the final
digest.

## Results

Self-reported model: claude-sonnet-5-5. Base HEAD = origin/main = e7fe5144dc62f5047c79dd5ef69d973f60dfd14d; base digest
26fcc9691c34d408e85da4cc52fb0a113b0d75a39c34d4c5ef87bcd7339d9081 (recorded before edits).

Changed files (docs and examples only; docs/07 unchanged, no source, test or Compose behaviour change):
- `docs/11_OPERATIONS_RUNBOOK.md` and `.vi.md`: defines `<image>`, the four `TIMESHEET_*` variables in
  `<project-dir>/.env`, `<compose-restored>` and `<compose-previous>`; section 1 steps 5 and 8 (image ID at build);
  section 2 checklist line and section 4 step 3 (protected `<env-file>` copy, release commit, digest, image ID: B-02);
  section 6 step 3 (restored instance on `<restore-dir>`, own project, `--no-build`); section 7 (use `<compose-restored>`;
  take a backup after reconciliation: R-B5-4); section 8 (one tag per release, image ID recorded, rollback starts
  `<previous-image>` with a `JOB_RUNNER=off` env-file copy, no same-tag rebuild); section 9 step 3 (new tag first).
- `.env.example` header (path now `<project-dir>/timesheet.env`, found through `TIMESHEET_ENV_FILE`).
- `compose.example.yaml`: one comment pointing at the runbook.

Checks (evidence in `handoff/delivery/evidence/WP5-FIXB/`):
- `docker compose config`, synthetic values, no container started: live (project `ts-wp5-fixb-live`), restored
  (`ts-wp5-fixb-live-restored`, `/data` source = restore folder) and rollback (`ts-wp5-fixb-live-rollback`, previous
  tag, restore folder, `JOB_RUNNER=off`): all three exit 0 (`01-compose-config.txt`).
- EN/VI parity: 15 h2, 2 h3, 49 numbered steps, 35 bullets, 38 fences, 13 checkboxes in both.
- `npm run verify` (SMOKE_PORT 47790): exit 0, 76 files, 1758 tests, SMOKE PASSED (`02-verify.txt`).
- `npm run precommit-check`: exit 0. `validate_package.py --preflight`: exit 0, 85 translation pairs (`03-...txt`).
- Final `npm run digest`: ed604d0c33b144e7fb214d05d4060494542fb21a9e69cd5b61c40097685f692a (775 files, handoff/ excluded).

Not done: no activation, deactivation or pilot text (WP5-REL); the NAS stays NOT VERIFIED.
