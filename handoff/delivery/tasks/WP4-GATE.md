# WP4-GATE dispatch brief

- Mission/task: timesheet-software-readiness / WP4-GATE; package WP4; kind gate;
  attempt 1; depends on WP4-T13-FREEZE (the package-final freeze).
- Profile/routing: timesheet-verifier, requested sonnet/medium, no override. Routing:
  size L, risk H (the package-final gate), novelty no. Records in English.
- Target: `freeze_commit` is the WP4-T13-FREEZE commit; the coordinator gives the SHA in
  the dispatch prompt.
  - Record HEAD and the source digest before and after. They must not change.
  - The digest of record is the one you compute on the clean export. Cross-check it
    with the `git ls-tree` form.
- Read AGENTS.md from disk first. Then read:
  - [WP4-PLAN](WP4-PLAN.md), section E;
  - the WP4 gate lines in `handoff/prompts/WP4_IMPLEMENT.md` and
    [WP4_REVIEW](../../prompts/WP4_REVIEW.md);
  - docs/06 (AC-11, AC-12, AC-15 and the regressions AC-01, AC-03, AC-08, AC-16);
  - docs/07 and the new docs/11 runbook;
  - `handoff/delivery/WP4_HANDOFF.md`;
  - the WP4-T12 drill results in [WP4-T12](WP4-T12.md).
- Read-only for source, configuration, tests and governance files.

## Runtime

- Use Git Bash only. Never use `cmd.exe` in any form, PowerShell without `-Command`, or
  any interactive shell.
- Call Node 24 by its full portable path, or put it first on PATH in Git Bash. Spawn
  children with `process.execPath`. Use the workflow Python for the validators. Keep
  shell calls in the foreground.
- Working folders:
  - Use `D:\.claude-tmp\timesheet\WP4-GATE` for TEMP/TMP, the clean export
    (`...\WP4-GATE\export`), the WP3 export (`git archive 49651c8`, `...\WP4-GATE\wp3`),
    drill work folders and all raw output.
  - Put only masked `.txt` copies and `*-synthetic.png` images in evidence.
  - Delete only files you created; never remove folders recursively.
- Docker:
  - Use the Compose project name `ts-wp4-gate`, and remove only that project, by name.
  - Never push, log in or prune. Publish ports on loopback only.
- Edge and mail: use the installed Edge channel, with no browser download. Capture mode
  only; never send real mail.
- Never kill processes by PID. Never write into the repository root. Never redirect to
  /dev/null or nul.
- If a call is denied by a permission check, stop and report. Do not retry or rephrase
  it.
- If a shell call fails with ENOSPC, stop and report.
- Write your results into this brief with the Edit tool.

## Gate items (record each command, exit code and result)

1. **Export and install.** Make a clean `git archive` export of the freeze outside
   Dropbox, using Node 24. Then run `npm ci`.
   - It must print no deprecation line.
   - Record the `npm audit` summary as information only.
2. **Verify.** Run `npm run verify` with
   `NODE_OPTIONS=--trace-deprecation --pending-deprecation`.
   - It must exit 0 with no deprecation line.
   - Record the test count; WP4-T12 reported 75 files and 1710 tests.
   - Record the smoke PASS count, including `/api/ready`.
3. **End-to-end tests.** Run `npm run test:e2e` for desktop and mobile; all must pass.
   Record the counts. WP4-T11 reported 145 passed and 5 skipped.
4. **Drill.** Run `npm run drill:container -- --work <gate>\drill --project ts-wp4-gate
   --wp3 <gate>\wp3`.
   - It must exit 0 with `DRILL STAGES 1-6 PASSED`. Record the per-stage PASS counts.
   - Confirm stage 1's image boundary: the forbidden-file scan and the non-root user.
   - Confirm stage 3: the restored instance stays paused and sends nothing.
   - Confirm stage 5: the old binary refuses the upgraded database, and the paired
     restore runs with nothing sent.
   - Confirm stage 6: the import no-op and the single opening balance.
5. **Workbook.** Check each of the following, from tests or the drill, naming the test:
   - The tracked template hash is still
     `47ef42d5e4a9b7aea0be545ed563d3d22987609b59bd846c1c08dec2d29c6331`.
   - The preview's source SHA-256 equals `sha256` of the uploaded bytes.
   - The mapping version is 1.
   - The three README defects are flagged.
   - Unknown labels, duplicates and conflicts are reported.
   - Commit needs explicit decisions, and a second identical commit adds nothing.
   - The opening balance needs minutes, a date, a reason and evidence, and posts once.
   - Imported periods get no reminder, deadline action or send across a simulated
     deadline.
6. **Upgrade and rollback runbook.**
   - Drill stages 4–5 pass.
   - Every command in docs/11 maps to a drill step or is labelled an owner NAS step.
     Cross-check the WP4-T13 command map, and name any command that is unmapped and
     unlabelled.
7. **Migrations.** Run a fresh 1→13 migration and upgrades from:
   - a database created by the accepted WP3 source 49651c8 (schema 6);
   - a populated v12 database (the tests).

   For each, `integrity_check` must be ok, `foreign_key_check` empty, and a rerun must
   apply nothing.
8. **Races, 10 fresh-process rounds each.** Each round must give one winner and no
   duplicate. Run:
   - `ot-leave-concurrency`;
   - `finalization-concurrency`;
   - `deadline-race`;
   - the sharing revocation race;
   - the concurrent workbook-import commit;
   - the concurrent opening-balance post.
9. **Privacy and admin boundary.**
   - Every admin operations and users field is in its allowlist, including
     `not_set_up` and `retention`.
   - `/api/health` and `/api/ready` carry no personal data.
   - The manifest carries no personal data.
   - The import and opening-balance routes answer 404 to other users, administrators
     and share grantees.
   - The private import source is never served.
10. **NAS target.** Mark it NOT VERIFIED unless the owner supplied access; list the
    owner steps from docs/11. If you run an arm64 emulated build, label it emulation.
11. **Validators.**
    - `node scripts/precommit-check.mjs` on the export.
    - `validate_package.py --preflight`, `validate_orchestration.py` and
      `check_recovery.py`, run with the workflow Python
      `C:\Users\<user>\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe`.
      Write `<user>` in the evidence.
    - Then run `npm run digest` last, together with the `git ls-tree` digest form.
12. **Diff scope** since the WP3 acceptance source 49651c8bb91d56bf6c6966405257537ec7ca474b.
    - List the changed paths by area.
    - Name every governance path changed. Expected: only the removal of
      `.claude/skills/readme-md/` (the GOV-SKILL-REMOVE cycle, audited PASS), besides
      handoff records.
13. **Mapping.** Every gate line of WP4_IMPLEMENT and WP4_REVIEW has a test, a drill
    step or a NOT VERIFIED label. Name any line without one.

## Output

- Write the results in this file, and masked LF evidence in
  `handoff/delivery/evidence/WP4-GATE/`.
- Decide PASS or FAIL, naming every failing item.
- Rerun an environmental flake once and record it.
- Leave no server, browser, container, runner or background process.

Return at most 200 words, beginning with your self-reported model.

## Results

(Verifier appends here.)
