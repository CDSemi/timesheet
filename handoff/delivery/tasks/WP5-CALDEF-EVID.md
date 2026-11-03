# WP5-CALDEF-EVID dispatch brief (rename the fix's evidence to .txt before the freeze)

- **Task.** Mission timesheet-software-readiness, task WP5-CALDEF-EVID, package WP5, kind
  documentation, attempt 1, depends on WP5-CALDEF-DOCS (done). Handoff-only: you change no
  file outside the paths below.
- **Why.** The freeze commits evidence only as LF `.txt` files (or `-synthetic.png`). The
  WP5-CALDEF-FIX evidence folder holds about 80 files with other extensions (`.log`,
  `.build.log`, `.tsv`, `.out`), so the freeze would unstage them while the board names some of
  them as evidence, and stop.
- **Profile and routing.** timesheet-light (low), requested sonnet (renames plus reference
  updates, not a pure listing), no override. Size S, risk L, novelty no. Task record in
  English.
- **Runs beside** WP5-CALDEF-SMOKE, which owns `scripts/smoke-built-server.mjs` and the
  WP5-CALDEF-SMOKE task and evidence paths. Do not touch them, nor any source, test or document
  file, nor any shared record (board, STATE, NEXT_ACTION, checkpoints).

## Work

1. In `handoff/delivery/evidence/WP5-CALDEF-FIX/` and its subfolders `mutants/` and `tools/`,
   and in `handoff/delivery/evidence/WP5-CALDEF-DOCS/`, list every file whose name does not
   end in `.txt`.
2. Rename each one by turning its final extension into a suffix: `name.ext` becomes
   `name-ext.txt` (for example `12-npm-test.log` -> `12-npm-test-log.txt`,
   `M10.build.log` -> `M10.build-log.txt`, `00-summary.tsv` -> `00-summary-tsv.txt`,
   `01-client-run.out` -> `01-client-run-out.txt`). Use `git mv` only if the file is tracked
   (none should be); otherwise a plain move. Do not change content, except that CRLF line
   endings become LF; record which files you converted.
3. Update every reference to an old name:
   - in the Results of `handoff/delivery/tasks/WP5-CALDEF-FIX.md` and
     `handoff/delivery/tasks/WP5-CALDEF-DOCS.md`;
   - inside the evidence files of those two folders (for example a summary that names its
     logs).
   Change only the file names in those references; no other wording.
4. Search both folders and both briefs once more for any old name; expect none.
5. Write `handoff/delivery/evidence/WP5-CALDEF-EVID/renames.txt`: old name, new name, CRLF
   converted yes/no, one line each; then the count, and the search result of step 4.

## Writable paths

`handoff/delivery/evidence/WP5-CALDEF-FIX/` (renames and name references only),
`handoff/delivery/evidence/WP5-CALDEF-DOCS/` (same), the Results sections of
`handoff/delivery/tasks/WP5-CALDEF-FIX.md` and `WP5-CALDEF-DOCS.md` (name references only),
this brief's Results, `handoff/delivery/evidence/WP5-CALDEF-EVID/`.

## Rules

No heredocs (write scripts with the Write tool, in a scratch folder outside the repository),
no command that waits on stdin, no `rm -r`, no `sed -i`, no PID kills. Never invent evidence.

## Results

(append: count renamed, count converted to LF, references updated per file, final search
result, slips)

Recorded by the coordinator from the worker's report (self-reported claude-sonnet-5-5); the
worker did not fill this section itself.

- Renamed 80 untracked files by plain move to `name-ext.txt`: 27 in `WP5-CALDEF-FIX/`, 53 in
  `WP5-CALDEF-FIX/mutants/`, none in `tools/` or `WP5-CALDEF-DOCS/`. Mapping:
  `handoff/delivery/evidence/WP5-CALDEF-EVID/renames.txt`.
- CRLF converted: 0 (none of the 80 had CRLF).
- References updated: `tasks/WP5-CALDEF-FIX.md` Results 11; `tasks/WP5-CALDEF-DOCS.md` 0;
  `WP5-CALDEF-FIX/tools/zz-caldef-repro.test.ts.txt` 1. `tools/caldef-mutate.mjs.txt` left as
  executed (lines 126, 132, 147 build the old names).
- Final search: no non-`.txt` file in the two folders.
- Note: `WP5-CALDEF-DOCS/03-preflight.txt` has CRLF line endings (outside the rename scope).
- Slips: one `rm` of the worker's own temporary file.
