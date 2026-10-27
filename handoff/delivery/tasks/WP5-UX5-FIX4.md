# WP5-UX5-FIX4 dispatch brief (pin the fixed nodemailer and zod)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX4, package WP5, kind fix,
  attempt 1. It depends on WP5-UX5-DEPS1 (done) and WP5-UX5-FIX3-FREEZE (done, 5b8b718),
  and addresses WP5-UX5-REGATE3 (FAIL: `npm audit --omit=dev` exit 1).
- **Profile and routing.** timesheet-worker (effort medium, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size S, risk M (production dependencies), novelty no. docs/08 row "Accepted
    finding naming file/fix/tests": no plan; reproduce first.
  - Write the task record in English.
- **The finding** (`handoff/delivery/tasks/WP5-UX5-DEPS1.md`, Results; evidence in
  `handoff/delivery/evidence/WP5-UX5-DEPS1/`):
  - zod 4.6.5 has GHSA-mrhx-c7xc-m3w5 (high), fixed in 4.6.6;
  - nodemailer 10.0.14 has GHSA-8c8m-p3m8-cjg8, GHSA-m943-m63m-w62w and
    GHSA-85x2-q946-cp5h (moderate), fixed in 10.1.4.

  Both are direct production dependencies with exact pins.
- **Coordinator decision.** Use the smallest clearing pair, **nodemailer 10.1.4 and zod
  4.6.6**, with exact pins. Change nothing else.
- **Owned paths:**
  - `package.json` (the two version strings only);
  - `package-lock.json`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-FIX4/`.

  No `src/`, test or docs change. No new dependency, no ADR.
- **Base.** HEAD = origin/main = 5b8b7184692fff683c4083c9fc5610acd47bece1, or a later commit
  that changes only `handoff/`. The digest is
  edcca1949c429251b1476c3e32e1485507ef488264429c6afe318a7fccc041ce (882 files).
- **Parallel work.** WP5-UX5-DIAG2, a read-only planner, runs at the same time in
  `D:\.claude-tmp\timesheet\WP5-UX5-DIAG2` with ports 50120-50139. Do not touch its folder
  or ports.

## Steps

1. **Record the start state.** HEAD, `git status --short` and the two current pins.
2. **Reproduce.** In a scratch `git archive` export of HEAD in your task folder, run
   `npm ci` and then `npm audit --omit=dev`. Record exit 1 and the four advisories.
3. **Make the change in the scratch export.**
   - Run `npm install --save-exact nodemailer@10.1.4 zod@4.6.6`, then `npm ci`.
   - Check that `package.json` changes only the two version strings.
   - Check that the `package-lock.json` diff touches only:
     - the nodemailer and zod entries;
     - the nested dev-only `node_modules/smtp-server/node_modules/nodemailer` entry that
       DEPS1 described.

     List the diff stat; any other package change is a stop.
   - Record every `npm warn deprecated` line. A new one is a stop.
4. **Prove it in the scratch export:**
   - `npm run lint`, `npm run typecheck`, `npm test`, `npm run verify` (smoke with
     `SMOKE_PORT` in your port range), and `npm audit --omit=dev` (must exit 0);
   - a clean `npm run build`, with `dist/` compared byte for byte to a clean build of the
     base. Expect it to be identical; list any difference.
5. **Copy the two files into the repository.** Copy `package.json` and
   `package-lock.json` from the export into the repository root. This is the one allowed
   shell copy: the lockfile is too large for the Write tool. Then:
   - check that `git diff --stat` in the repository shows only those two files outside
     `handoff/`;
   - check that `git diff` equals the export's diff against the base.

   **Do not run `npm ci`, `npm install` or any build in the repository.** Its
   `node_modules` stays as it is, and the next gate reinstalls it.
6. **Digest last.**
   - Make a clean export of the working tree (HEAD plus your two files) and compute the
     digest with the repository's digest script in that export.
   - Record the digest and the file count.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-FIX4`. Ports 50160-50179. Set TEMP, TMP,
  `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -`, NO `python -`), NO
  PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR
  `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
  - Use the Write tool for scripts and notes. Step 5's copy is the only file write through
    the shell.
  - Read outputs with the Read tool.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- Never touch `%LOCALAPPDATA%\timesheet-dev` or `.claude/worktrees/`. Use synthetic data
  only. Do not stage, commit or push.
- Write no email address except `@example.invalid`.
- **Run nothing in the background that outlives your return.** Before returning, check
  that each background command you started has ended, or stop it through its own handle.
- If a permission check denies a call, stop and report.
- Keep Results short and concrete. Finish with "Status: done".

Return at most 120 words, beginning 'Self-reported model: ...', with the exit codes, the
lockfile diff scope, the `dist/` result and the digest.

## Results

- Start: HEAD 5b8b7184692fff683c4083c9fc5610acd47bece1; no change outside `handoff/`; pins
  nodemailer 10.0.14, zod 4.6.5. Scratch export in `D:\.claude-tmp\timesheet\WP5-UX5-FIX4`,
  Node 24.21.0, npm 11.18.0.
- Reproduced on the base: `npm ci` 0, `npm audit --omit=dev` exit 1 (nodemailer 3
  advisories, zod 1), base build 0.
- Change: `npm install --save-exact nodemailer@10.1.4 zod@4.6.6` then `npm ci` (0).
  `package.json` changes only the two version strings. The lockfile diff (18+/8-) touches only
  the nodemailer and zod entries, the root dependency list and the new dev-only nested
  `node_modules/smtp-server/node_modules/nodemailer` 10.0.14. No `npm warn deprecated` line.
- Proof in the export: lint 0, typecheck 0, `npm test` 0 (101 files, 2374 tests), `npm run
  verify` 0 (smoke on port 50160), `npm audit --omit=dev` 0.
- `dist/` from a clean export with the new files vs the base build: `diff -r` exit 0,
  250 files each, byte-identical.
- The two files were copied into the repository (blob IDs equal the export's); `git diff
  --stat` outside `handoff/` shows only `package.json` and `package-lock.json`. No install or
  build ran in the repository.
- Digest of HEAD plus the two files (tree a14e73269b8befddf0ca059df6c4bd64ccfa0bb2):
  c431c508ba9d7bba73aefa09894940a1ef0dad64ef946f8934abe69ba6037443 (882 files).
- Evidence: `handoff/delivery/evidence/WP5-UX5-FIX4/`.
- Note: one `tail ... /dev/null` call slipped into a read-only check; it changed nothing.

Status: done
