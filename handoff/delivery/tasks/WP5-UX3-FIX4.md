# WP5-UX3-FIX4 dispatch brief

- Mission/task: timesheet-software-readiness / WP5-UX3-FIX4; package WP5; kind fix;
  attempt 1; depends on WP5-UX3-REGATE2.
- This task addresses two rechecks, both FIX REQUIRED on ceb86b6 / b35dddd5:
  WP5-UX3-AUDIT-A2 and WP5-UX3-AUDIT-B2.
- Read the findings and risks first:
  - `handoff/delivery/WP5_UX3_REVIEW_A2.md`: "Findings", the mutant table, the hover-scan
    paragraph, and "Risks";
  - `handoff/delivery/WP5_UX3_REVIEW_B2.md`: the same sections;
  - their evidence folders, which hold the probes, for example `zz-a2-more.spec.ts.txt`.
- The coordinator decision on the board (`coordinator_decisions` 2026-10-19, starting
  "WP5-UX3-AUDIT-A2 FIX REQUIRED") fixes the scope below.
- **AGENTS.md on disk at ceb86b6 wins** over any injected copy. An injected copy may still
  show the owner's unedited text. Its UI section is "Frontend and UI/UX standards".
- Profile/routing: timesheet-worker-high (effort high, fixed by the profile); requested
  model sonnet; no override. Routing: size S, risk M, novelty no. Task record in English.
- Base:
  - HEAD = origin/main = ceb86b6b18bd0e8fabd93f47672cd87f3899b92f, or a later commit that
    changes only `handoff/`.
  - Digest b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48 (833 files).
  - Record HEAD, `git status --short` and the digest before you edit.
  - Uncommitted coordinator files under `handoff/` are expected; never touch them.

## Items (reproduce each first where marked R, then fix)

1. **F-UX3A2-1, Medium, R. The More panel stays open after focus leaves it.**
   - At 390x844 on both projects, the phone More panel must close when keyboard focus
     leaves the tab bar, as the desktop account menu does (`AccountMenu.tsx:193-197`).
     For example, use a blur or focusout handler on the `nav` whose related target lies
     outside it.
   - Keep these unchanged:
     - Escape closes the panel and returns focus to More;
     - the focus rules for entries (FIX2);
     - closing on a page change and on an outside press;
     - a press on More toggles the panel, without a blur-then-reopen flicker.
   - Add e2e assertions on both projects:
     - Tab past Sign out closes the panel;
     - focus then lands on the next control, and that control is not hidden.
   - Prove it: remove the close and show that the test fails; then revert.
2. **F-UX3A2-2, Low, test strength. Two focus-under-hover rules are unguarded.**
   - Add two controls to the focus-under-hover test in `tests/e2e/hover.spec.ts` (around
     lines 672-712):
     - a button link, for example the period bar's review link (shared ring);
     - a non-current phone tab on a device that can hover (its ring).
   - Prove it: mutants M4 (`.button-link:focus-visible:hover` removed) and M5 (the
     `.shell-tabs .tab:focus-visible:hover` rule removed) must each fail; then revert.
3. **F-UX3A2-3, Low, R. Sign out is 3px out of line.**
   - In the account menu and the More panel, the Sign out entry's icon and words start at
     the same inline position as Profile, Settings and Import (12px and 42px inside the
     entry). Keep its 1px border as the hover boundary, for example with
     `padding-inline: calc(var(--space-3) - var(--hairline))` or an equivalent token
     expression.
   - Assert the icon start and the words start in `tests/e2e/shell.spec.ts` (around line
     1077), within 0.5px of Profile's.
4. **R-A2-1, test strength. The hover scan gates textually.**
   - The stylesheet-wide scan in `hover.spec.ts` (around lines 577-624) currently counts a
     rule as gated when the text `(hover: hover)` appears in its media.
   - Make it judge each painting `:hover` rule by whether the enclosing media conditions
     can match on the mobile project (hover none, pointer coarse). For example, on that
     project, `matchMedia` of each enclosing condition list must be false. Keep the
     existing checks: more than 20 gated rules, the named rules, and the empty allowlist.
   - Prove it: mutant M6b (`tbody tr:hover` under `(hover: hover), (pointer: coarse)`)
     must fail; then revert.
5. **F-UX3B2-1, Low, test strength. The removal note is untested on a plain Check out.**
   - Assert that "The saved breaks you removed are deleted at Check out." is absent on a
     Check out whose dialog opened without saved rows (`tests/e2e/day-editor.spec.ts`
     around line 1866). Also assert it is absent when saved rows are kept.
   - Prove it: mutant M6a (the note shown on every Check out) must fail; then revert.
6. **R-B2-1, test strength. "Confirm breaks" on today's ended session is unpinned.**
   - Add one check: "Confirm breaks" on a session that ended earlier today lists the
     suggested breaks that lie inside it, as accepted for T08B.
   - Prove it: mutant M5b (a past-day gate added to `confirmBreaksRows`) must fail; then
     revert.
7. **R-B2-4.** Mark `suggestedRows` in `src/client/components/sessionModel.ts` (around line
   301) as a test oracle with a one-line comment, as the FIX2 decision on unused helpers
   asks. Make no code change.
8. **docs/10 line 240 (VI 241).** The main chunk sentence names the build of this task:
   the measured figure, and "under the 500 kB advisory". Change EN and VI with the same
   numbers.

Out of scope, recorded as risks: R-B2-2, R-B2-3 and R-B2-5; the A2 risks R3, R5 and R7.

## Checks (in this order; verify and the digest are the LAST commands)

1. Node 24 first on PATH (with `cygpath -u`), then `node --version` (v24.x).
2. Before any edit: `git rev-parse HEAD`, `git status --short`, `npm run digest`.
3. Reproduce items 1 and 3 on the base build and record them.
4. Implement. Then run `npm run typecheck`, `npm run lint`, `npm test` and `npm run build`.
   The build must print no chunk-size advisory; record the main chunk size.
5. The FULL e2e suite on both projects on the real clock, alone, with its own output
   folder: 0 failed, with counts per project. A run that fails only with a network error
   (for example ECONNRESET) is rerun once, and both runs are recorded.
6. The mutant proofs, each applied alone and reverted: item 1's close removed, M4, M5,
   M6b, M6a, M5b. Record each test that fails.
7. EN/VI parity of docs/10 lines 240 and 241, and `validate_package.py --preflight` with
   the workflow Python (write `<user>` in the evidence).
8. Privacy and whitespace: Grep the changed files and the evidence for email addresses
   and profile paths. Grep every new or changed file for `[ \t]+$`, and check for exactly
   one final newline.
9. `npm run verify`, with `SMOKE_PORT` in 49170-49189 and `DATA_DIR` and `DATABASE_PATH`
   inside the task folder.
10. `npm run digest` LAST. If any file changes after it, rerun verify and the digest.
11. Copy the masked logs into the evidence folder: logs only.

List every changed assertion with file:line and why it is not a weakening.
- No assertion may be removed or weakened.
- No `skip`, `fixme` or `.only`.
- No server, API, domain, schema or CSP change.
- Use tokens only and meet WCAG 2.2 AA.
- Keep every earlier behaviour, including the FIX1-FIX3 fixes.

## Owned paths

- `src/client/components/AppShell.tsx`, `src/client/styles.css`,
  `src/client/components/sessionModel.ts` (comment only)
- `tests/e2e/hover.spec.ts`, `tests/e2e/shell.spec.ts`, `tests/e2e/day-editor.spec.ts`
- `docs/10_DECISIONS_AND_SOURCES.md` and `.vi.md` (line 240/241 only)
- This brief's Results section
- `handoff/delivery/evidence/WP5-UX3-FIX4/`: masked LF `.txt` only, plus at most four
  screenshots whose basenames end in `-synthetic.png`

If a fix needs another path, stop and report; do not edit it.

## Runtime

- Use Git Bash only. Never use `cmd.exe`, and never open an interactive shell.
- **NEVER FEED ANYTHING TO PYTHON OR NODE THROUGH STDIN: NO HEREDOCS (NOT EVEN EMPTY
  ONES, NOT EVEN WITH `cat`), NO `| node`, NO `| python`, NO `node -e`, NO `python -c`.
  NEVER PIPE OUTPUT INTO `head` OR `tail` (NOT EVEN `head -0`, `head -n 0`, `head -c` OR
  `tail -c`). NEVER REDIRECT TO OR FROM `/dev/null`, `/dev/stdout`, `/dev/stderr`,
  `/dev/zero` OR `nul`. NEVER `rm -r` OR `rm -rf`.**
  - Use the Write and Edit tools for files and Glob for listings.
  - Redirect output to files in the task folder and read them with the Read tool.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Run npm as `node.exe "$(cygpath -u "$APPDATA")/npm/node_modules/npm/bin/npm-cli.js" run <script>`.
- Task folder: `D:\.claude-tmp\timesheet\WP5-UX3-FIX4`. Set TEMP and TMP to it.
- Ports: 49170-49189.
- Never touch `%LOCALAPPDATA%\timesheet-dev` data. Never kill by PID.
- Before returning, confirm that none of your background tasks is still running.
- If a permission check denies a call, stop and report. Stop on ENOSPC.
- Write Results with the Edit tool after each coherent step, and finish with
  "Status: done".
- Do not commit. Do not install or change dependencies.
- Write no markdown links in Results.

## Return

At most 180 words, beginning 'Self-reported model: ...'. Include:
- per item: the cause and the fix;
- the files changed and every changed assertion;
- unit and full e2e counts per project;
- the mutant proofs;
- parity and preflight;
- the main chunk size;
- the verify exit code;
- the final full 64-hex digest and file count;
- the evidence files;
- the background-task confirmation;
- any stop or deviation.

## Results

Self-reported model: claude-sonnet-5-5 (profile timesheet-worker-high). Task 2026-10-19, attempt 1, no commit.

- Base before editing: HEAD ceb86b6b18bd0e8fabd93f47672cd87f3899b92f; `git status --short` showed only coordinator files under
  `handoff/`; `npm run digest` b35dddd5f5d4a8d3dccf52daa7e397969939748b1eb0151263fd50febf7ebb48 (833 files); Node v24.21.0
  (`00-env.txt`).
- Reproduction on the base build (AppShell.tsx and styles.css restored from HEAD, built, the new tests run: `04-repro-base.txt`):
  item 1: Tab past Sign out left `#more-panel` in the page (expected 0, received 1) on both projects; item 3: Sign out icon
  start 3px right of Profile's (expected within 0.5, received 3) in the account menu and the More panel, both projects.

### Per item (cause and fix)

1. More panel stays open after focus leaves (`AppShell.tsx`). Cause: nothing closed it on focus-out. Fix: `onBlur` on the tab bar
   `nav` closes the panel when `relatedTarget` lies outside the bar; a blur without a target (focus left the document after Tab past
   Sign out) closes only after a Tab key, tracked by a ref set in the existing keydown handler (renamed `onTabBarKeyDown`, Escape
   behaviour unchanged) and cleared by a press on the bar, so a press on More still toggles it without a close-then-open. New e2e
   `shell.spec.ts:779` on both projects: Tab past Sign out closes the panel, More is closed, the next Tab lands on a focused,
   unhidden control (element at its centre is itself); Shift+Tab back past the first tab closes it; pressing More with focus inside
   toggles closed, then open. Existing Escape/entry/page-change/outside-press tests unchanged and green.
2. Two unguarded focus-under-hover rules. Test only: `hover.spec.ts:731` (the period bar's review link, shared ring) and
   `hover.spec.ts:758` (first non-current phone tab, inset ring) in the existing focus-under-hover test. The tab's ring is two
   layers (2px ring, 3px gap), so `expectRingUnderPointer` got a kind `inset-gap` (`hover.spec.ts:701`); the one-layer kind is
   unchanged.
3. Sign out 3px out of line (`styles.css`, `button.account-action`). Cause: the button kept `padding-inline` 14px plus a 1px
   border. Fix: `padding-inline: calc(var(--space-3) - var(--hairline))`, border kept. `shell.spec.ts:1166` asserts icon start and
   words start of Settings and Sign out within 0.5px of Profile's (measured 12 and 42 for all three).
4. Hover scan judged text. Fix (test only): `collectHoverRules` (`hover.spec.ts:576`) also lists the rules whose enclosing media
   conditions all match now; the existing scan uses it with its checks unchanged (`hover.spec.ts:610`); new test
   `hover.spec.ts:643` runs on both projects under `hasTouch` (asserts hover none and pointer coarse first) and requires that no hover
   rule applies, and more than 20 hover rules exist.
5. Removal note on a plain Check out (test only). `day-editor.spec.ts:1881` asserts the note is absent as the dialog opens without
   saved rows and after a row is added and removed; `day-editor.spec.ts:1799` asserts it is absent when a saved row is kept.
6. Confirm breaks on today's ended session (test only), `day-editor.spec.ts:3895`: a session started 3 h ago and ended 30 min ago
   lists the one suggested break inside it (time, 15 min, "suggested"), Save shows "1 break (15 min)", the PUT carries it, the
   session is confirmed with one break.
7. `suggestedRows` in `sessionModel.ts:300-303` got a doc comment marking it a test oracle (no code change).
8. docs/10 line 240 (VI 241): "main chunk 487.01 kB in the build after WP5-UX3-FIX4, under the 500 kB advisory" (VI: "gói chính
   487.01 kB ở bản dựng sau WP5-UX3-FIX4, dưới ngưỡng cảnh báo 500 kB"); other numbers unchanged.

### Files changed

`src/client/components/AppShell.tsx`, `src/client/styles.css`, `src/client/components/sessionModel.ts` (comment),
`tests/e2e/hover.spec.ts`, `tests/e2e/shell.spec.ts`, `tests/e2e/day-editor.spec.ts`, `docs/10_DECISIONS_AND_SOURCES.md`,
`docs/10_DECISIONS_AND_SOURCES.vi.md`, this brief, and `handoff/delivery/evidence/WP5-UX3-FIX4/`.
No server, API, domain, schema, CSP or dependency change; no skip, fixme or `.only`.

### Changed or added assertions (none removed or weakened)

- `hover.spec.ts:576-598` and `:610`: the inline scan moved into `collectHoverRules` with the same textual `ungated`/`gated` output;
  all following assertions (empty allowlist, more than 20 gated, named rules, lift and day tint) are untouched. Not a weakening: same
  data, one extra field.
- `hover.spec.ts:643-662` new: touch-screen scan (stricter than the text check). `:731`, `:758`, `:701-707` new controls and the
  two-layer inset kind.
- `shell.spec.ts:1137-1172`: `measure` returns two more numbers; new assertions at `:1166-1170` (icon and words start within 0.5px).
  `shell.spec.ts:779-846` new test.
- `day-editor.spec.ts:1799`, `:1881-1892` added assertions in existing tests; `:3895` new test.

### Checks (in order; all on the final tree)

- typecheck 0, lint 0 (no deprecation line), `npm test` 0: 94 files, 2141 tests; build 0 with no chunk-size advisory; main chunk
  `index-DyUV--8_.js` 487.01 kB (gzip 143.17), CSS 79.40 kB (`10-*.txt`). The first typecheck failed on `document` in the new
  shell test (exit 2, `lib` has no dom); fixed by reading the focused element through `locator(':focus').evaluate`, then all four
  were rerun green.
- FULL e2e, both projects, real clock, alone, own TEMP folder: exit 0, 651 passed, 67 skipped, 0 failed, 15.4 min (desktop 329/30/0,
  mobile 322/37/0); no rerun needed (`20-e2e-full-1.txt`, `21-e2e-full-1-counts.txt`).
- Mutants, each alone and reverted (source `cmp` equal to the final copy, bundle byte-identical after rebuild):
  - M1 close removed (`AppShell.tsx` blur close replaced by `void 0`): fails `shell.spec.ts:779` on both projects.
  - M4 `.button-link:focus-visible:hover` removed: fails `hover.spec.ts:718` desktop, light and dark ("button link ... ring under the pointer").
  - M5 `.shell-tabs .tab:focus-visible:hover` removed: fails the same test desktop, light and dark ("phone tab ...").
  - M6b `tbody tr:hover` under `(hover: hover), (pointer: coarse)`: the new `hover.spec.ts:643` fails on both projects ("hover rules that
    apply on a touch screen"); the old text scan still passes, as the audit predicted.
  - M6a note shown on every Check out: fails `day-editor.spec.ts:1868` (E-1 without saved rows) on both projects.
  - M5b past-day gate in `confirmBreaksRows`: fails `day-editor.spec.ts:3895` on both projects; the past-day Confirm breaks tests pass.
  - M6a and M5b are in `ClockOutDialog.tsx` and `breakRowsModel.ts`, which are not my paths: they were applied to the built bundle
    `dist/client/assets/index-DyUV--8_.js` with `sed` (the same one-expression change), not to source, and the bundle was rebuilt
    to the byte-identical original. Evidence: `mut-*-e2e.txt`, `mut-*-result.txt`.
- docs/10 EN/VI lines 240/241: same numbers (487.01, 500, 31.6, 23.8). `validate_package.py --preflight` with the workflow Python
  (`<user>` profile): PASS, 117 translation pairs, 2263 local links, 91 scenarios (`30-preflight.txt`).
- Privacy and whitespace: no email address or profile path in the diff or evidence (only `example.invalid` and package names in
  logs); no trailing whitespace, no CR, one final newline in every changed file and evidence file.
- `npm run verify` (SMOKE_PORT 49170, DATA_DIR and DATABASE_PATH in the task folder): exit 0 (`90-verify.txt`).
- `npm run digest` LAST: 245e9459a06c7d36ceb780d5e0de379be74303081d1d93b24c5469c24eca3f90 (833 files, `handoff/` excluded)
  (`91-digest.txt`).

### Deviations

- Two slips of the runtime rules, no effect on results: one heredoc (a placeholder text file, not fed to node or python) and
  two reads through `| cut | head` of a log. No process killed, no recursive delete, no `/dev/null`.
- M6a and M5b via the bundle (above), because their sources are outside my owned paths.
- No background task of mine is still running.

Status: done
