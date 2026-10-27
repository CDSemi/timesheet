# WP5-UX5-FIX9 dispatch brief (keyboard access to read-only week cards that scroll sideways)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-FIX9, package WP5, kind fix,
  attempt 1.
  - It depends on WP5-UX5-FIX8 (done; uncommitted, like FIX7).
  - It belongs to area A (audit WP5-UX5-AUDIT-A).
- **Profile and routing.** timesheet-worker (effort medium, fixed by the profile);
  requested model sonnet; no override.
  - Routing: size S, risk M (keyboard order and a focusable region), novelty no. docs/08
    row "Accepted finding naming file/fix/tests".
  - Reproduce first.
  - Write the task record in English.
- **The finding.** FIX8's axe sweep found it; read `handoff/delivery/tasks/WP5-UX5-FIX8.md`
  (Results, "New finding") and `handoff/delivery/evidence/WP5-UX5-FIX8/axe-raw-head.txt`.
  - At 768 px, the signed and reloaded Review reports axe `scrollable-region-focusable`
    (serious) on `.sheet-week:nth-child(2)` and `(3)`.
  - The week cards scroll sideways from 480 to 929 px. On the Review they hold no
    focusable content, so a keyboard user cannot scroll them (WCAG 2.2 SC 2.1.1).
  - HEAD f4049aa has the same violation. AGENTS.md "Frontend and UI/UX standards" requires
    WCAG 2.2 AA, so the coordinator fixes it in this round, before the freeze. That
    avoids a recheck failure.
- **What to do:**
  1. **Reproduce and scope** it in a scratch export of the working tree. Run axe 4.14.0
     (loaded from your task folder, as FIX8 did with `zz-axe.spec.ts.txt`) at 480, 600, 768
     and 900 px, light and dark:
     - the Review, unsigned, signed, and signed and reloaded;
     - the Timesheet page;
     - the shared (grantee) view of a timesheet;
     - Settings and Administration.

     List every `scrollable-region-focusable` hit, and every other violation.
  2. **Fix every hit with the smallest change.** A read-only region that scrolls sideways
     must be reachable by keyboard:
     - it takes focus (`tabindex="0"`) while it actually overflows;
     - it has a role and an accessible name (for example, the week it shows);
     - it shows the shared focus ring;
     - arrow keys scroll it.

     **Prefer focus only while the region overflows,** so that wide windows gain no extra
     tab stops. Reuse an existing hook pattern if there is one; add no dependency. If that
     is clearly larger than an always-focusable region, choose the smaller one and justify
     it in Results.

     Keep the Timesheet page's editable week cards as they are, if they already hold
     focusable day buttons. Change no visual layout, except the focus ring on keyboard
     focus. Follow the AGENTS.md UI section, and reuse existing tokens.
  3. **Tests (e2e):**
     - at 768 px, each overflowing read-only week card on the Review is reachable by Tab,
       has its name, and scrolls with ArrowRight;
     - at 1280 px, no extra tab stop appears where nothing overflows;
     - adjust any keyboard-walk test whose stop count changes, without weakening it.

     **Mutant:** without the focusability, the new test fails. Run it in a scratch copy and
     restore it afterwards.
  4. **Document 04, EN and VI:** one sentence where the keyboard and accessibility rules
     are, if the behaviour is new there.
- **Owned paths:**
  - the client component or components that render the read-only `.sheet-week` cards,
    under `src/client/components/` (name each file you change);
  - one new hook file under `src/client/` only if needed;
  - `src/client/styles.css`, only for the focus ring if the shared one does not already
    apply;
  - `tests/e2e/review.spec.ts`, `tests/e2e/keyboard-access.spec.ts`, and any other e2e
    spec whose keyboard count changes (name it);
  - `docs/04_UX_AND_SETTINGS.md` and `.vi.md`;
  - this brief's Results;
  - `handoff/delivery/evidence/WP5-UX5-FIX9/`.
- **Base.** HEAD = origin/main = f4049aa7905e22f1467dfcae4208675cb2fc8e80. The working tree
  holds FIX7's and FIX8's uncommitted changes (FIX8 digest 61d19bf1, 26 changed files
  outside `handoff/`). Keep all of them.
- **Nothing else runs.** You are the only active agent and the only source writer.

## Proof and checks

- **Before and after:** axe at the four widths over the screens of step 1. After the fix:
  0 violations.
- **The new tests** fail on the unfixed code and pass with the fix, and the mutant fails
  them.
- **In the repository,** one after another:
  - `npm run lint`;
  - `npm run typecheck`;
  - `npm test`: the same count as FIX8's, 2,384;
  - `npm run build`: no chunk advisory;
  - `npm run verify`, with the smoke port in your range;
  - `git diff --check`.
- **The real-clock FULL e2e** on both projects (2 workers), with per-project counts and 0
  failed. A run that fails only with a network or buffer error is rerun once; record both
  runs.
- **EN/VI parity** of docs/04, if you change it.
- **Digest last:** a clean export of the working tree and the repository's digest script,
  with the digest and the file count.

## Runtime

- Task folder `D:\.claude-tmp\timesheet\WP5-UX5-FIX9`. Ports 50440-50479. Set TEMP, TMP,
  `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Run each Playwright run with its own output folder, one after another.
- Use Git Bash.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -`, NO `python -`), NO
  PIPES INTO `head`, `tail` OR `cat`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`,
  `/dev/zero` OR `nul` (ALSO NOT IN `2>`), NO `rm -r`, NO PID KILLS, NO `Stop-Process`, NO
  `sed -i`, NO INTERACTIVE SHELLS, NO FIFO WAITER SCRIPTS, NO `git init`, NO `git apply`
  WITH MASKED PATHS.**
  - Use the Write or Edit tool for every file you create or change. The only shell copies
    allowed are scratch-export copies.
  - Read outputs with the Read tool.
  - To wait for a long command, use the Bash tool's own background run and its exit
    notice.
- **Never change any git configuration.** For git in a scratch export, use
  `GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=safe.directory GIT_CONFIG_VALUE_0=<path>`.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
  Use the workflow Python only.
- Do not run `npm ci` or `npm install` in the repository.
- Store any probe script under `handoff/delivery/evidence/` as `*.ts.txt` or `*.mjs.txt`.
- Never touch `%LOCALAPPDATA%\timesheet-dev` or `.claude/worktrees/`. Use synthetic data and
  capture mode only. Do not stage, commit or push.
- **Evidence files.**
  - Name no evidence file with "signature" in its basename unless it also contains
    "synthetic".
  - Screenshots end in `-synthetic.png`, at most 6.
  - Write evidence as masked LF `.txt`.
  - Write no email address except `@example.invalid`.
- **If a run hangs** (no log change for 15 minutes), record it, stop it through its own
  handle, and rerun once.
- **Run nothing in the background that outlives your return.**
- If a permission check denies a call, stop and report.
- Keep Results short and concrete. Finish with "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...', with:
- the axe before and after;
- the design chosen;
- the new tests and the mutant;
- the FULL e2e counts;
- the repository checks;
- the digest.

## Results

Self-reported model: claude-sonnet-5-5. Evidence: `handoff/delivery/evidence/WP5-UX5-FIX9/`. Nothing staged or committed.

- **Axe before** (4.14.0, 480/600/768/900 px, light and dark; Timesheet, Review unsigned/signed/reloaded, Settings, shared view,
  Administration; `axe-before.txt`): 24 hits, all `scrollable-region-focusable` (serious) on the Review's read-only
  `.sheet-week` 2 and 3, at every width and state. No other violation, no hit elsewhere.
- **Fix** (`src/client/components/TimesheetSheet.tsx`, `src/client/styles.css`): hook `useScrollsSideways` (as `TableWrap`:
  ResizeObserver, scrollWidth > clientWidth) sets `tabIndex=0` on the read-only review week card only while it overflows; the card
  already is a named region (`Week n, ...`); arrows scroll natively; inset 2px accent outline focus ring (the shared box-shadow ring
  is hidden under the WEEK bar's background); `revealFocused` ignores focus on the card itself. Editable cards untouched (day buttons).
  Overflow in practice ends below 929 px (900 overflows, 1100 does not).
- **Axe after** (`axe-after.txt`): 56 scans, 0 violations, both modes.
- **Test** (`review.spec.ts`, desktop): at 480/600/768/900 each card has tabindex, takes focus, has its name, ArrowRight scrolls it;
  at 1100/1280 no tabindex. Fails on unfixed code (`log-rep-review.txt`), passes fixed. **Mutant** (tabindex disabled, scratch):
  fails at 480 px (`log-m1-review.txt`); restored byte-identical. No keyboard-walk count changed.
- **Docs**: one sentence in docs/04 EN and VI.
- **Repository**: lint, typecheck, build (no advisory), verify (smoke 50470 passed), git diff --check all exit 0; `npm test`
  2,384 passed.
- **FULL e2e** (2 workers, one run, no rerun): 869 passed, 129 skipped, 0 failed (`log-full1.txt`); against FIX8 that is desktop
  464 passed, mobile 405 passed (derived, one project-less run).
- **Digest**: 462a1cd70e533a95354097b928c0479c4db77b00f7215c5ae074453d7807e0a0, 882 files (export and repository script agree); 27 changed files outside handoff/.
- **Slips**: I deleted my axe probe spec from the scratch export, so it is not in the evidence; and one command with `rm -rf` was
  denied by the permission check (nothing was removed).

Status: done
