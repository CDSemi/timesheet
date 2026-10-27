# WP5-UX5-DEPS1 dispatch brief (diagnose the new npm audit advisories)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-DEPS1, package WP5, kind
  diagnose, attempt 1. It depends on WP5-UX5-FIX3-FREEZE (done, 5b8b718), and addresses
  WP5-UX5-REGATE3 (FAIL).
- **Profile and routing.** timesheet-planner (effort high, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size S, risk M (production dependencies, security), novelty no. docs/08 row
    "Plan/diagnose a bounded issue".
  - Read-only for the repository. Write the task record in English.
  - WP5-UX5-DIAG2 (the sweep failures) runs in parallel in another task folder; do not
    touch its folder or ports.
- **Why.** In REGATE3, `npm audit --omit=dev` exited 1 with two advisories: **nodemailer
  (moderate)** and **zod (high)**. The package files have not changed since 7aafa21, and
  REGATE2's audit on the same files was clean, so the advisories are new in the database.
  The gate requires a clean production audit, or a recorded and justified decision.
- **Read:** `handoff/delivery/evidence/WP5-UX5-REGATE3/10-audit.txt`, `package.json`,
  `package-lock.json`, every import of `zod` and `nodemailer` in `src/`, and the ADRs that
  name either package (`docs/adr/`).
- **Base.** HEAD = origin/main = 5b8b7184692fff683c4083c9fc5610acd47bece1, or a later commit
  that changes only `handoff/`. The digest is
  edcca1949c429251b1476c3e32e1485507ef488264429c6afe318a7fccc041ce (882 files).

## Questions to answer

1. **The advisories.** Run `npm audit --omit=dev --json` in a scratch export. For each
   advisory record:
   - its GHSA ID, title, severity and published date;
   - the vulnerable range, the installed version, and whether the package is direct or
     transitive (with the dependency path);
   - the first fixed version.
2. **Reachability.**
   - Which APIs of each package does the app use, with file:line?
   - Is the vulnerable code path reachable with the inputs the app passes, in particular
     input from users or from the network?
   - Give a short, evidence-based exposure statement for each.
3. **Fix options.** For each package:
   - the smallest upgrade that clears the advisory, and whether `npm audit fix` without
     `--force` reaches it;
   - whether it is a major version, with the breaking changes that affect our usage (from
     the package's changelog or release notes);
   - any deprecation the upgrade brings: AGENTS.md rule 11 forbids deprecated APIs, and
     `npm run lint` must pass.
4. **Probe the fix** in the scratch export, never in the repository:
   - apply the proposed upgrade, then `npm ci`, `npm run lint`, `npm run typecheck`,
     `npm test`, `npm run verify` and `npm audit --omit=dev`;
   - record each exit code and count, and any deprecation warning;
   - compare the clean build's `dist/` with the base's and list which areas change
     (`dist/server`, `dist/domain`, `dist/client`), so the next gate knows what to rerun.
5. **Recommend** the exact change: the `package.json` lines and the lockfile update
   command, the owned paths a worker needs, and any test to add or adjust. If no fix
   exists yet, say so, and give the safest option with its residual risk for the owner.
   No new dependency and no ADR unless the fix truly needs one.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-DEPS1`. Ports 50140-50159 (`SMOKE_PORT` in
  that range). The probe runs in a scratch `git archive` export of the base in your task
  folder.
- Set TEMP, TMP, `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -`, NO `python -`), NO
  PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR
  `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
  - Use the Write tool to create files; never write a file through the shell.
  - Read outputs with the Read tool.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- Never touch `%LOCALAPPDATA%\timesheet-dev`. Synthetic data and capture mode only.
- Change nothing in the repository except this brief's Results and
  `handoff/delivery/evidence/WP5-UX5-DEPS1/` (masked LF `.txt` only). Do not stage or
  commit. Never touch `.claude/worktrees/`. Never run `npm install`, `npm update` or
  `npm audit fix` in the repository.
- Write no email address except `@example.invalid`.
- **Run nothing in the background that outlives your return.** Before returning, check
  that each background command you started has ended, or stop it through its own handle.
- If a permission check denies a call, stop and report.
- Keep Results short and concrete. Finish with "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...', with the advisories, exposure
and the recommended fix.

## Results

Base: HEAD 5b8b7184692fff683c4083c9fc5610acd47bece1 (`git archive` export, `npm ci` exit 0 on Node v24.21.0). The
repository's `package.json`, `package-lock.json` and `src/` were not changed. Evidence:
`handoff/delivery/evidence/WP5-UX5-DEPS1/10-advisories.txt`, `20-exposure.txt`, `30-probe.txt`.

**Advisories** (`npm audit --omit=dev`, exit 1; both packages are direct production dependencies, exact pins):

| Package | Installed | GHSA | Severity | Vulnerable | First fixed | Published |
|---|---|---|---|---|---|---|
| zod | 4.6.5 | GHSA-mrhx-c7xc-m3w5 (CVE-2023-54404): memory exhaustion validating large arrays | high, 7.5 | < 4.6.6 | 4.6.6 (latest 4.6.7) | 2026-10-01, reviewed by GitHub 2026-10-23 |
| nodemailer | 10.0.14 | GHSA-8c8m-p3m8-cjg8 (nested comment), GHSA-m943-m63m-w62w (";" in group), GHSA-85x2-q946-cp5h (">" in quoted local part), all addressparser | moderate, 6.5 | >= 3.0.0, < 10.1.4 | 10.1.4 (latest 10.2.1) | 2026-10-23 |

New because they were published/reviewed on 2026-10-23, after REGATE2; the package files are unchanged.

**Exposure.**
- nodemailer: not reachable. `MailComposer` (`src/server/mail/message.ts:114`,
  `src/server/services/notifications.ts:435`) is the only path to `addressparser` (mime-node); `SMTPConnection`
  (`smtpAdapter.ts:79`) does not use it. Every address is checked first by `SINGLE_ADDRESS`
  (`message.ts:20,105,109`; `notifications.ts:420,432-433`; `config.ts:144,150`), which rejects `< > ( ) , ; : "`,
  backslash and whitespace, the characters all three payloads need.
- zod: reachable in principle, bounded. `readJson` (`src/server/http/validation.ts:13`) parses arrays (for example
  `schemas.ts:58,120,301`), but the global 64 KiB body limit (`app.ts:38,103-109`) caps an array at about 32,000
  elements, so memory stays in megabytes. No unauthenticated route takes an array. Assessment from code, not a
  reproduced exploit.

**Fix options.** `npm audit fix` without `--force` does not reach it (exact pins; npm says `--force`, though
`isSemVerMajor` is false). Both fixes are minor/patch (nodemailer 10.0.14 to 10.1.4 is a minor bump of the 10.x line,
zod 4.6.5 to 4.6.6 a patch). No breaking change affects our usage: 10.1.0 hardens SMTP/pool behaviour (one
`connect()` per `SMTPConnection`, which we respect); no deprecation of `MailComposer` or `SMTPConnection`.

**Probe** (scratch exports, Node 24.21.0), minimal upgrade nodemailer 10.1.4 and zod 4.6.6: `npm ci` 0; `npm run lint` 0
(no deprecation); `npm run typecheck` 0; `npm test` 0 (101 files, 2374 tests); `npm run verify` 0 (smoke PASSED);
`npm audit --omit=dev` 0 ("found 0 vulnerabilities"). The audit's own suggestion (10.2.1 and 4.6.7) passes the same
checks. `dist/` after a clean build is identical to the base for `dist/server`, `dist/domain` and `dist/client`
(`diff -rq` empty); a fixed synthetic message builds to the same 5293 bytes (same SHA-256) before and after. Only
`node_modules` changes. The lockfile gains a dev-only nested `node_modules/smtp-server/node_modules/nodemailer` 10.0.14
(smtp-server pins it exactly); a full `npm audit` already failed before on dev tools (vite, vitest and others) and is
out of this gate's scope.

**Recommendation** (one worker task, size XS, risk low):
- `package.json`: `"nodemailer": "10.1.4"` (was 10.0.14) and `"zod": "4.6.6"` (was 4.6.5); keep exact pins.
- Lockfile: in a scratch copy or the worker's checkout (Dropbox EBUSY applies in place) run
  `npm install --save-exact nodemailer@10.1.4 zod@4.6.6`, then `npm ci`; the lockfile changes the two entries plus the
  nested dev nodemailer entry above (35 diff lines).
- Owned paths: `package.json`, `package-lock.json`. No `src/` or test change, no new dependency, no ADR
  (no ADR names either package). Optional: use 10.2.1 and 4.6.7 (the latest, also verified) to reduce the chance of a
  further advisory within days; the smallest clearing pair is 10.1.4 and 4.6.6.
- Rerun after the change: `npm ci`, `npm run verify`, `npm audit --omit=dev`, and the clean-export digest
  (`npm run digest` changes because the package files change). `dist/` needs no rerun of the browser sweeps for
  content reasons: it is byte-identical; the server tests and smoke are the relevant gate.
- Residual risk: none known for the app with the chosen pair; the nested dev nodemailer 10.0.14 under smtp-server stays
  vulnerable but is test-only and outside `--omit=dev`.

Commands run (all in `D:\.claude-tmp\timesheet\WP5-UX5-DEPS1`): `git archive`; `npm ci`; `npm audit --omit=dev --json`
(exit 1); `npm ls`; `npm view`; `npm pack nodemailer@10.2.1` (read CHANGELOG); `npm install --save-exact ...` (scratch
only); `npm run lint|typecheck|test|verify|build`; `npm audit --omit=dev` (exit 0); `npm audit fix --dry-run` (scratch);
`diff -rq` of the dist trees; the probe script. Nothing remains running.

Status: done
