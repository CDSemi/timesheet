# WP5-CALDEF-PATHS lookup brief (read-only path census before the freeze)

- **Lookup.** Mission timesheet-software-readiness, auxiliary lookup WP5-CALDEF-PATHS, before
  WP5-CALDEF-FREEZE. Read-only: you change no repository file except this brief's Results
  (short) and your task folder `D:\.claude-tmp\timesheet\WP5-CALDEF-PATHS` (outside the
  repository).
- **Profile and routing.** timesheet-light, requested haiku (docs/08: a pure listing).
- **Rules.** Read-only git only (`git fetch origin` allowed). No heredocs, no command that
  waits on stdin, no pipes into `head`/`tail`/`cat`, no `rm -r`, no PID kills, never change git
  configuration, never stage.

## Check and report

1. `git fetch origin`; HEAD and origin/main. Expected: both
   5b2f28793e1def408e7a2c57df5054917450a1f2, no new commits.
2. `git diff --cached --name-status`: expected empty.
3. **Outside `handoff/`:** `git status --short --untracked-files=all`. Expected exactly these
   34 paths, nothing else (no `export/`, `.tmp`, stray or untracked file):
   - modified (31):
     - `src/server/http/schemas.ts`, `src/server/http/errors.ts`,
       `src/server/services/timesheets.ts`, `src/server/services/timesheetCommands.ts`,
       `src/server/services/dayEntries.ts`
     - `src/client/api.ts`, `src/client/DayEditor.tsx`, `src/client/TimesheetScreen.tsx`
     - `src/client/components/DayFieldsForm.tsx`, `sessionModel.ts`, `dayModel.ts`,
       `labelPickerModel.ts`, `errors.ts`, `BatchDialog.tsx`
     - `tests/client/sessionModel.test.ts`, `labelPickerModel.test.ts`, `dayModel.test.ts`
     - `tests/e2e/day-editor.spec.ts`
     - `docs/02_TIME_AND_OT_RULES.md`, `docs/03_ARCHITECTURE_AND_DATA.md`,
       `docs/04_UX_AND_SETTINGS.md`, `docs/06_TEST_AND_ACCEPTANCE.md`,
       `docs/10_DECISIONS_AND_SOURCES.md`, `docs/12_RELEASE_NOTES.md`, each with its `.vi.md`
     - `scripts/smoke-built-server.mjs`
   - untracked (3): `tests/integration/calendar-default-change.test.ts`,
     `tests/client/errors.test.ts`, `tests/e2e/calendar-default.spec.ts`
   List any difference.
4. **Under `handoff/`:** every modified path and every untracked path (with
   `--untracked-files=all`), grouped: (a) mission records (board, STATE, NEXT_ACTION and the
   checkpoint pairs); (b) task briefs; (c) evidence files, counted per folder. Expected groups:
   task briefs and evidence folders of `WP5-GOV-DOCS-COMMIT` and `WP5-CALDEF-*`, plus four
   known untracked leftovers (`evidence/WP5-UX5-DIAG6/new-proc-detail.txt`,
   `evidence/WP5-UX5-REGATE7/10-census-sample1.txt`, `evidence/WP5-UX5-REGATE8/log-chain1.log`,
   `evidence/WP5-UX5-REGATE8/log-master.log`). Name every path outside those groups.
5. **Commit blockers** among the changed and untracked paths of steps 3 and 4 (leftovers
   excluded): basenames containing "signature" without "synthetic"; `.png` not ending in
   `-synthetic.png`; evidence files not ending in `.txt`; files over 5 MB; `.mjs`, `.js` or
   `.ts` files inside `handoff/` that ESLint would parse; CRLF line endings in any changed or
   untracked text file (name each).
6. Write the full lists to your task folder; put only counts, the outside-`handoff/` result,
   the paths outside the expected groups and the blockers into this brief's Results.

Return at most 80 words, beginning 'Self-reported model: ...'.

## Results

- HEAD and origin/main both 5b2f28793e1def408e7a2c57df5054917450a1f2 after fetch; staged list empty.
- Outside `handoff/`: 34 paths, exactly the expected 31 modified and 3 untracked; no difference.
- Under `handoff/`: 7 modified (mission records 6, GOV brief 1); 124 untracked = 8 task briefs
  (WP5-CALDEF-* and WP5-GOV-DOCS-COMMIT), 113 evidence files in expected folders (FIX 92, DOCS 6,
  SMOKE 8, PLAN 2, PLAN-REVIEW 2, EVID 1, GOV 2), plus the 4 known leftovers. No path outside the groups.
- Blockers: none (no signature names, non-synthetic PNG, non-.txt evidence, file over 5 MB, lintable code in handoff/).
- CRLF: none in changed or untracked text files (`git ls-files --eol`).
- Full lists: D:\.claude-tmp\timesheet\WP5-CALDEF-PATHS (status-all.txt, outside-handoff.txt, handoff-changes.txt, paths.txt, eol-*.txt).
- Note: a scratch file D:\.claude-tmp\scratch_status.txt was written in error and could not be removed (no rm); it is outside the repository.
- Self-reported model: claude-haiku-5-5.
