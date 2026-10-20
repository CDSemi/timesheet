# WP5-UX3-FIX6 dispatch brief (one-line test fix)

- Mission/task: timesheet-software-readiness / WP5-UX3-FIX6; package WP5; kind fix;
  attempt 1; depends on WP5-UX3-DIAG1.
- Profile/routing: timesheet-worker, requested sonnet, no override. Routing: size S,
  risk L.
- Base: HEAD = origin/main = 5c101c1ca8ba5b9c1ede8b1ac8bad9f3804ab05d, digest
  95323f2d44a2a5f0cc6708f281911858b3b8a8ed1d0c1b7fc32c8a4a0174b15f.
  - Record HEAD, `git status --short` and `npm run digest` BEFORE the edit.
  - Uncommitted coordinator files under `handoff/` are expected; never touch them.

## Task

Apply the fix proved by WP5-UX3-DIAG1 (`handoff/delivery/tasks/WP5-UX3-DIAG1.md`, "Failure
2"):
- In `tests/e2e/hover.spec.ts` at line 754, replace
  `page.locator('[data-day]:not(.nonworking) [data-day-button]').first()` with
  `page.locator('[data-day]:not(.nonworking) .sheet-day-button').first()`.
- Update the comment at about line 752 to say why: only the phone table's day button has
  this class, so the `toBeVisible` wait cannot resolve the desktop sheet button before the
  media-query layout swap.

Change nothing else.

## Checks

1. Node 24 first on PATH; `node --version`.
2. The ring test repeated: `--grep "keyboard focus ring stays under the pointer"` on the
   desktop project with `--repeat-each=30` and 2 workers. All must pass.
3. The whole of `hover.spec.ts` on both projects. All must pass.
4. `npm test`, lint and typecheck.
5. Whitespace: no trailing blanks, one final newline.
6. `npm run verify` with `SMOKE_PORT` in 49290-49299 and `DATA_DIR`/`DATABASE_PATH` in the
   task folder.
7. `npm run digest` LAST.

## Owned paths

- `tests/e2e/hover.spec.ts`
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-FIX6/` (masked LF `.txt` only)

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX3-FIX6`. Ports 49290-49299.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`), NO PIPES INTO
  `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stderr` OR `nul`, NO `rm -r`, NO PID
  KILLS.**
  - Use the Write and Edit tools for files.
  - Redirect output to files in the task folder and read them with Read.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Leave nothing running.
- If a permission check denies a call, stop and report.
- Write Results with the Edit tool and finish with "Status: done". Do not commit.

## Return

At most 100 words, beginning 'Self-reported model: ...'. Include:
- the diff summary;
- each check's result;
- the verify exit code;
- the final digest and file count.

## Results

- Baseline: HEAD 5c101c1, digest 95323f2d... (833 files), Node v24.21.0.
- Diff: tests/e2e/hover.spec.ts only; selector now `.sheet-day-button`, comment line added.
- Ring test x30 desktop, 2 workers: 60 passed. hover.spec.ts both projects: 70 passed.
- npm test: 2141 passed. lint 0. typecheck 0. Whitespace clean, final newline present.
- verify exit 0 (SMOKE_PORT 49290).
- Final digest 507de97c7dc3e351219b505bb5f1bb5094eac7b766eec635e727ce997a45f2b6 (833 files).
- Evidence: handoff/delivery/evidence/WP5-UX3-FIX6/. Nothing left running.

Status: done
