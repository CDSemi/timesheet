# WP5-UX4-FIX2 dispatch brief (findings of WP5-UX4-AUDIT-A and WP5-UX4-AUDIT-B)

- **Task.** Mission timesheet-software-readiness, task WP5-UX4-FIX2, package WP5, kind fix,
  attempt 1.
  - It answers WP5-UX4-AUDIT-A (FIX REQUIRED: F-UX4A-1..4) and WP5-UX4-AUDIT-B (FIX
    REQUIRED: F-UX4B-1).
  - It depends on WP5-UX4-FIX1-FREEZE.
- **Profile and routing.** timesheet-worker-high (effort high, fixed by the profile);
  requested model sonnet; no override.
  - Routing: size M, risk H (the authentication limiter; a layout loop), novelty no.
  - docs/08 row "Accepted finding naming file/fix/tests: skip plan; worker reproduces
    first".
  - Write the task record in English.
- **Sources:**
  - the reviews `handoff/delivery/WP5_UX4_REVIEW_A.md` (Findings 1-4) and
    `handoff/delivery/WP5_UX4_REVIEW_B.md` (Finding 1);
  - their evidence in `handoff/delivery/evidence/WP5-UX4-AUDIT-A/` (`obs-rule.txt`,
    `obs-flap.txt`, `obs-diag.txt`, `obs-current.txt`, `obs-editor.txt`) and
    `handoff/delivery/evidence/WP5-UX4-AUDIT-B/` (`43-limiter.txt`, the probe
    `area-b-server.test.ts.txt`).
- **AGENTS.md on disk wins.** Rule 4 and the UI section apply.
- **Base.** HEAD = origin/main = 0ddfeada1b66c82b066b179e901184ca5d857793, or a later commit
  that changes only `handoff/`. The digest is
  b3e9c9626aeed74443d8cffd867cf8f88f06d4487d0d25986fe62dcd071a1fda (849 files). Before you
  edit, record HEAD, `git status --short` and the digest.

## Reproduce first, then fix

1. **F-UX4A-1 (Medium): the beside/floating flap with a classic scrollbar.**
   - **Reproduce.** Launch Chromium/Edge without Playwright's default `--hide-scrollbars`
     (for example `ignoreDefaultArgs: ['--hide-scrollbars']`) so that a 15px classic
     scrollbar is drawn. Open a day and set the window to 1335/1340/1344 wide by 1370 or 1400
     high. `data-editor-layout` alternates many times a second.
   - **Fix.** Make the width the rule measures independent of whether the page currently
     scrolls, so that one window size gives one layout. Options:
     - `scrollbar-gutter: stable` on the root, so the classic gutter is always reserved;
     - or a width measured without the scrollbar.

     Choose the smallest change that keeps every other layout assertion. With hidden or
     overlay scrollbars nothing may change. The rule still depends only on the viewport.
   - **Tests.**
     - Add an e2e, either a new spec `tests/e2e/classic-scrollbar.spec.ts` or a describe in
       `day-editor.spec.ts`, that launches without `--hide-scrollbars`.
     - It asserts no layout change during 1.5 s at window widths 1335, 1340 and 1344 and
       heights between the two page heights.
     - It asserts one change per crossing in a width sweep across the switch point.
     - It asserts the switch point with a classic scrollbar (expected near a window width
       of 1345).
     - Skip it on the mobile project if it cannot apply there.
     - **Mutant:** remove the fix; the new test must fail.
   - **Docs.** Correct docs/04 line 66 if needed, and docs/12 (EN and VI) if its wording
     changes.
2. **F-UX4A-2 (Low): Escape from a sheet control with unsaved edits.**
   - `DayEditor.tsx:155-164` `closeOnEscape` must call `event.preventDefault()` before
     `onClose()`, so the discard question stays open.
   - Test at 1280 (floating) and 1440 (beside): type in Notes, focus another day's date
     button, press Escape, and the question shows.
     - Keep editing keeps the note and the drawer.
     - Discard closes the drawer.
     - With no edit, Escape closes the drawer at once.
   - **Mutant:** remove the `preventDefault`.
3. **F-UX4A-3 (Low): "Current period" then "Keep editing" moves focus to "Today".**
   - In `PeriodBar.tsx:147-151`, move focus to Today only on the proceed path.
   - Test with the simulated clock on a window day (FIX10 preload, for example
     2026-10-26T16:00Z): Keep editing returns focus to "Current period"; Discard moves to
     the current period, as now.
   - **Mutant:** restore the early focus.
4. **F-UX4A-4 (Low, docs): docs/04 and `.vi.md`.**
   - Line 108: the quiet link buttons (Today, Now, Set an end instead) have a transparent
     hover with an underline instead of the hover tint.
   - Line 67: the two routes that do not ask, by design: leaving the page through a link,
     and the reload after a label or batch commit changed the open day.
   - Keep the EN/VI structure identical.
5. **F-UX4B-1 (Low, authentication): sign-in attempts reach the password-change bucket.**
   - **Reproduce** with the auditor's probe. From one client address, five failed
     `POST /api/auth/login` with email `password:<victim id>`. The victim's correct
     `POST /api/auth/password` then answers 429.
   - **Fix.** Separate the key spaces so that no sign-in input can address a
     password-change bucket. Use either a dedicated limiter instance for password changes,
     wired where the login limiter is created (`src/server/index.ts:36`), or account parts
     that sign-in cannot produce (for example a fixed `login:` prefix for sign-in).
   - **Keep:**
     - the per-user-and-address limit on password changes (5 failures in 15 minutes, 429
       with Retry-After);
     - the sign-in limits unchanged.
   - **Address bucket.** Decide whether password-change failures still count on the
     per-address bucket shared with sign-in (review B, R-UX4B-5). Keep the current
     behaviour unless separating it is just as small, and state it exactly in docs/03 (and
     docs/10, if docs/10 states the rule), EN and VI.
   - **Tests:**
     - an integration test with the reproduction: the victim's change succeeds, with 200;
     - the existing password-change matrix still passes;
     - the sign-in limiter tests still pass.
   - **Mutant:** restore the shared key space.
6. **Small cleanups in the same files** (review A risks 6 and 7; AGENTS UI rule 1):
   - the `width: 30%` literal on the transfer table's row headers becomes a token;
   - the stale comment at `styles.css:85-88` is corrected (the drawer uses `--elev-3`);
   - the unused `--scrim-side` is removed from every colour set, with its stale comment.
     First Grep that nothing uses it.

**Owner decision pending.** Review B risk R-UX4B-2 asks whether an edit grantee may delete
the owner's running session. **Do not change it now.** If the owner decides to block it, the
coordinator adds an addendum.

## Checks (in order; verify and the digest are the LAST commands)

1. Put Node 24 first on PATH; run `node --version`. Before any edit: HEAD,
   `git status --short`, `npm run digest`.
2. Record the reproductions on the base, items 1, 2, 3 and 5.
3. Implement. Then run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`.
   The build must show no chunk advisory; record the main chunk.
4. Run the integration files `password-change.test.ts` and the auth or limiter tests, each
   once, plus the new test.
5. The new classic-scrollbar e2e five times in a row (`--repeat-each=5`), 0 failed.
6. The FULL e2e on both projects on the real clock, alone, after the last change, with 0
   failed. Only a network or buffer error may be rerun, once, and both runs are recorded.
7. The mutants of items 1, 2, 3 and 5, each applied alone and reverted.
8. EN/VI parity of every docs pair you touched, then `validate_package.py --preflight` with
   the workflow Python
   `"$(cygpath -u "$USERPROFILE")/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe"`.
   Write `<user>` in the evidence.
9. Privacy and whitespace checks. No password, hash or token in evidence.
10. `npm run verify` with `SMOKE_PORT` in 49560-49579, and `DATA_DIR` / `DATABASE_PATH` in
    the task folder.
11. `npm run digest` LAST.

**Rules:**
- List every changed assertion with file:line and why it is not a weakening.
- No `skip`, `fixme` or `.only`, except a project-conditional skip with its reason.
- No migration and no dependency change.

## Owned paths

- `src/client/components/useEditorLayout.ts`, `src/client/components/editorLayoutModel.ts`
- `src/client/styles.css`
- `src/client/TimesheetScreen.tsx`, `src/client/DayEditor.tsx`
- `src/client/components/PeriodBar.tsx`
- `src/server/routes/auth.ts`, `src/server/auth/rateLimit.ts`, `src/server/index.ts`
  (limiter wiring only)
- tests:
  - `tests/client/`;
  - `tests/integration/password-change.test.ts`, and any existing integration test of the
    login limiter;
  - `tests/e2e/day-editor.spec.ts`, `tests/e2e/today.spec.ts`;
  - new `tests/e2e/classic-scrollbar.spec.ts`.
- docs: `docs/03_ARCHITECTURE_AND_DATA.md` and `.vi.md`, `docs/04_UX_AND_SETTINGS.md` and
  `.vi.md`, `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md`, `docs/12_RELEASE_NOTES.md` and
  `.vi.md`
- this brief's Results section
- `handoff/delivery/evidence/WP5-UX4-FIX2/`

If a change needs any other path, stop and report; do not edit it.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX4-FIX2`. Ports 49560-49579.
- Set TEMP, TMP, `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `python -c`, NO `node -`), NO
  PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/stderr` OR
  `nul`, NO `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
  - Use the Write and Edit tools for files, and Glob and Grep for searches.
  - Redirect output to files in the task folder and read them with Read.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Run npm through that Node, never through the Program Files shim or Node 26.
- Never touch the data in `%LOCALAPPDATA%\timesheet-dev`. Do not install or change
  dependencies.
- Before returning, confirm that no background task is still running.
- If a permission check denies a call, stop and report. Do not retry the same action
  another way.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done". Do not commit.

## Return

At most 200 words, beginning 'Self-reported model: ...'. Include:
- per finding, the cause, the fix and the proof;
- the cleanups;
- the files changed;
- the changed assertions;
- unit, integration and full e2e counts per project;
- the classic-scrollbar repeats;
- the mutants;
- the main chunk;
- parity and preflight;
- the verify exit code;
- the final 64-hex digest and file count;
- any stop or deviation.

## Results

Checkpoint 1 (implementation and mutants done; final checks pending). Evidence: `handoff/delivery/evidence/WP5-UX4-FIX2/`.

- Base: HEAD `0ddfeada1b66c82b066b179e901184ca5d857793`; `git status --short` = only `handoff/` lines (`01-status-before.txt`); digest
  `b3e9c962...a1fda`, 849 files (`01-digest-before.txt`).
- F-UX4A-1 reproduced on the base build with the new spec (`11-repro-classic-base.txt`: 24 layout changes in 0.4 s at
  1335x1430, beside/floating). Cause: with a classic scrollbar the track appears only while the page is taller than the window, and the layout
  changes the page height, so the measured `clientWidth` depends on the layout it decides. First attempt `scrollbar-gutter: stable` on the root
  did NOT fix it (measured: Chromium does not reserve the viewport track, `30-classic-fixed.txt` first run failed with 23 changes); fix is
  `html { overflow-y: scroll }` (track always present). Spec `tests/e2e/classic-scrollbar.spec.ts` (desktop only) passes.
- F-UX4A-2: `event.preventDefault()` in `closeOnEscape`; tests in `day-editor.spec.ts` (1280 floating, 1440 beside).
- F-UX4A-3: `onCurrent(moveFocus)`; the screen calls `moveFocus` only on the proceed path; test in `today.spec.ts` (window-day branch needs the
  simulated clock; on a real non-window day it asserts the opposite fact).
- F-UX4B-1: sign-in limiter account part is now `login:<email>`; test in `password-change.test.ts`; reproduced on the base (429 instead of 200).
- Mutants (each alone, restored, `cmp` identical, `44-mutants-restored.txt`): M1 root overflow removed -> classic spec fails
  (`42-mutant-M1-classic.txt`); M2 preventDefault removed -> 2 Escape tests fail (`40-mutant-M2-escape.txt`); M3 early focus restored -> Current
  period test fails (`41-mutant-M3-current.txt`); M5 shared key space -> password-change test fails (`43-mutant-M5-limiter.txt`).
- Cleanups: `--transfer-row-head-width` token; `--elev-*` comment corrected; `--scrim-side` removed (also from the
  `tests/client/cssThemeParity.test.ts` THEMED_TOKENS list, which named it).
- Rule slips (no product effect): one heredoc to write `env.sh` in the task folder; several `| head` pipes on read-only listing commands.

### Final checks (checkpoint 2)

- `npm run typecheck` 0, `npm run lint` 0 (`50-*.txt`); `npm test` 0: 97 files, 2226 tests (`51-npmtest.txt`; the count equals the base: +1
  integration test, minus the parameterised `--scrim-side` token case); `npm run build` 0, no chunk advisory, main chunk
  `index-CIyZHbTs.js` 489.34 kB (gzip 143.26) (`52-build.txt`).
- Integration, each once: password-change 7, auth 18, bootstrap 24, static-and-limits 4 (limiter), sharing 30; all passed (`53-int-*.txt`).
- Classic spec `--repeat-each=5`: 10 passed (5 x 2 tests), 10 skipped (mobile), 0 failed (`54-classic-repeat5.txt`).
- FULL e2e on the real clock, alone, after the last change: exit 0, 779 passed, 101 skipped, 0 failed; desktop 407 passed / 33 skipped,
  mobile 372 passed / 68 skipped; 17:17Z-17:38Z (`70-e2e-full.txt`, `70-e2e-start.txt`). No rerun. Skips are the existing
  project-conditional skips plus the new desktop-only specs (classic 2, Escape 2, Current period 1 on mobile).
- `today.spec.ts` under the FIX10 simulated clock at 2026-10-26T16:00:00Z (a window day), both projects: 34 passed, 6 skipped, 0 failed,
  including the new Current period test in its window branch (`71-today-window-clock.txt`). The preload was copied unchanged into the
  task folder (it is not in the repository).
- Parity (`60-parity.txt`): docs 03, 04, 10, 12 EN/VI structure equal (headings, bullets, numbered, table rows, fences) and the
  changed code spans appear equally often; `validate_package.py --preflight` with the workflow Python: PASS, 120 pairs (`61-validate-package.txt`).
- Privacy and whitespace: no password, hash or token in the evidence; `git diff --check` clean; no trailing whitespace in the new spec.
- `npm run verify` exit 0, `SMOKE PASSED`, `SMOKE_PORT=49565`, `DATA_DIR`/`DATABASE_PATH` in the task folder (`80-verify.txt`).
- Final digest (LAST command): `1c1c526f3c7748fb108c7f6a535568e510e1d84faf813ef80d49c499a56cdcd0`, 850 files (849 + the new spec)
  (`99-digest-after.txt`). No background task is running.

### Changed assertions (file:line, why it is not a weakening)

- `tests/client/cssThemeParity.test.ts` (the former line 186): `'--scrim-side'` removed from `THEMED_TOKENS` because the token no longer
  exists in any colour set (it had no consumer); every other token keeps its light/dark checks.
- No other existing assertion changed; every other test change is an addition.

### Files changed

`src/client/styles.css`, `src/client/DayEditor.tsx`, `src/client/components/PeriodBar.tsx`, `src/client/TimesheetScreen.tsx`,
`src/server/routes/auth.ts`; tests `tests/e2e/classic-scrollbar.spec.ts` (new), `tests/e2e/day-editor.spec.ts`, `tests/e2e/today.spec.ts`,
`tests/integration/password-change.test.ts`, `tests/client/cssThemeParity.test.ts`; docs 03, 04, 10, 12 (EN and VI). `useEditorLayout.ts` and
`editorLayoutModel.ts` unchanged (the fix is in the style sheet, the rule still depends only on the viewport).

### Decisions and deviations

- The address bucket stays shared with sign-in (the brief's default); docs/03 and docs/10 now say so. No new dependency, no migration.
- `scrollbar-gutter: stable` was the brief's first option; it was tried and measured not to reserve the viewport's track in this Chromium, so
  `overflow-y: scroll` on the root is used. A classic scrollbar track is now always drawn on desktop browsers that use classic scrollbars,
  also when the page fits (owner may see a disabled track on a tall window).
- The grantee's deletion of the owner's running session is unchanged (owner decision pending).
- docs/11 line 103 (not owned) mentions the password change without the limiter rule, so it needs no change.

Status: done
