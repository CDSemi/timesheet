# WP5-UX5-DIAG1 dispatch brief (diagnose the theme.spec.ts:605 regate failure)

- **Task.** Mission timesheet-software-readiness, task WP5-UX5-DIAG1, package WP5, kind
  diagnose, attempt 1. It depends on WP5-UX5-FIX1-FREEZE (done, 2bce0ab), and addresses
  WP5-UX5-REGATE (FAIL).
- **Profile and routing.** timesheet-planner (effort high, fixed by the profile); requested
  model sonnet; no override.
  - Routing: size S, risk M, novelty no. docs/08 row "Plan/diagnose a bounded issue".
  - Read-only for the repository. Write the task record in English.
- **Why.** The regate failed on one non-network assertion in its simulated-clock sweep:
  - **`tests/e2e/theme.spec.ts:605`**, mobile project, the case "received share, without the
    zone note", during the FULL run at `2026-11-01T08:45:00Z`.
  - **The failure:** `--shell-bar-size` read 112 against a rendered bar of 60.
  - **What did not reproduce it:** three isolated runs of `theme.spec.ts` at that instant,
    and a full rerun there.
  - **The verifier's guess:** a load-dependent race, the property read while the bar was
    one size and the stored value another.

  A flaky test, or a product state that can go stale, cannot be passed over: either the
  test or the product must be fixed.
- **Read:**
  - `handoff/delivery/tasks/WP5-UX5-REGATE.md`, Results, item 5;
  - its evidence: `log-sweep-r2full-1101.txt` (the failing run), `log-sweep-r3full-1101.txt`
    and `log-diag-theme1..3.txt`;
  - `tests/e2e/theme.spec.ts` around 560-640;
  - every writer and reader of `--shell-bar-size` in `src/client/`;
  - the T04 record `WP5-UX5-T04.md`, for the `shell-bar` container, the wordmark and the
    share switcher rows.
- **Base.** HEAD = origin/main = 2bce0ab5842b80c710f23496d5173c122319e5c7, or a later commit
  that changes only `handoff/`. The digest is
  709750910cb88422b1de35c38c85eac15c3eca63ee75e1ff26e11b75d6475bbf (870 files).

## Questions to answer

1. **Who sets `--shell-bar-size`, when, and from what?** For example, a ResizeObserver or
   a layout effect. Who reads it: scroll padding, sticky offsets, the Day editor's top, the
   bottom sheet?
2. **Can the stored value and the rendered bar disagree** while a user can see the page?
   For how long, and with what effect: content hidden under the bar, a wrong drawer top,
   scroll padding off? Or only during a transition that no user would see?
3. **Reproduce it.** Use the simulated clock at `2026-11-01T08:45:00Z` (the FIX10 preload
   from `handoff/delivery/evidence/WP5-UX-FIX10/`, copied into your task folder) and load.
   Try one or more of:
   - CDP CPU throttling;
   - many repetitions;
   - running alongside the rest of the mobile project.

   Give the reproduction rate before any change.
4. **Classify the failure:**
   - **test defect:** the test reads the value before the app has settled;
   - **product defect:** the property can stay wrong after the bar settles, or for a
     user-visible time;
   - **both.**
5. **Propose the minimal fix,** with file:line and the test that proves it. For a test
   defect: an event-based wait, never a fixed sleep or a looser assertion. For a product
   defect: the smallest change that keeps the property equal to the rendered bar. Name the
   owned paths a worker would need.

## Also, read-only: leftover processes from the regate

The regate's first sweep wedged before its interruption. Its Playwright/Node tree and two
idle shells (`chain2.sh`, `chain3.sh`) may still be alive.
- List the processes whose command line contains `WP5-UX5-REGATE`, with their name, PID,
  start time and a masked command line (`<user>` for the profile path). For example, run
  `powershell.exe -NoProfile -Command "Get-CimInstance Win32_Process | Where-Object
  CommandLine -like '*WP5-UX5-REGATE*' | Select-Object ProcessId, Name, CreationDate,
  CommandLine | Format-List"`, redirected to a file in your task folder.
- **Do not stop any of them.** The owner decides.
- Also record whether any of them holds a port in 49940-49979.

## Runtime

- Task folder: `D:\.claude-tmp\timesheet\WP5-UX5-DIAG1`. Ports 49980-49999. Probes run in
  a scratch `git archive` export of the base in your task folder, never in the repository.
- Set TEMP, TMP, `DATA_DIR` and `DATABASE_PATH` inside the task folder.
- Use Git Bash only.
- **NO HEREDOCS, NO STDIN TO NODE OR PYTHON (NO `node -e`, NO `node -`, NO `python -`), NO
  PIPES INTO `head` OR `tail`, NO `/dev/null`, `/dev/stdout`, `/dev/stdin`, `/dev/zero` OR
  `nul` (ALSO NOT IN `2>` REDIRECTS), NO `rm -r`, NO PID KILLS, NO INTERACTIVE SHELLS.**
  - Use the Write tool to create files; never write a file through the shell.
  - Read outputs with the Read tool.
- Put Node 24 first on PATH:
  `export PATH="$(cygpath -u "$LOCALAPPDATA")/timesheet-dev/node-24.21.0/node_modules/node/bin:$PATH"`.
- Never touch `%LOCALAPPDATA%\timesheet-dev`. Synthetic data and capture mode only.
- Change nothing in the repository except this brief's Results and
  `handoff/delivery/evidence/WP5-UX5-DIAG1/` (masked LF `.txt` only). Do not stage or
  commit.
- Before returning, make sure none of your background commands is still running.
- If a permission check denies a call, stop and report.
- Keep Results short and concrete. Finish with "Status: done".

Return at most 150 words, beginning 'Self-reported model: ...', with the classification and the
proposed fix.

## Results

Self-reported model: claude-sonnet-5-5 (timesheet-planner). Base 2bce0ab5842b80c710f23496d5173c122319e5c7; repository untouched except this file and
`handoff/delivery/evidence/WP5-UX5-DIAG1/` (index: `00-README.txt`). Probes ran in a scratch `git archive` export, Node v24.21.0, simulated clock 2026-11-01T08:45:00Z.

**Classification: test defect (primary). The product has a one-to-few-frame lag by design, not a stuck value; one latent product gap is noted, not required.**

**Q1. Writers and readers.** One writer: `useBlockSizeProperty(barRef, '--shell-bar-size')` at `src/client/components/AppShell.tsx:131`
(`src/client/components/useBlockSize.ts:10-24`): a `useLayoutEffect` writes `getBoundingClientRect().height` once at mount, then a `ResizeObserver` callback rewrites it;
cleanup removes it. Readers (CSS only): `src/client/styles.css:946` (account panel max-height), `:1146` and `:1168` (`html` scroll-padding-top), `:4145` and `:4154`
(side panels `inset` top), `:6307` (a sticky `top`); the default is `var(--bar-height-compact)` (`:378`) and `var(--bar-height)` at 768px (`:1164`).
The two other users of the hook (`--share-bar-size`, `--editor-head-size`) are not involved. Tests read it at `theme.spec.ts:584-585`, `shell.spec.ts:497-503`, `day-editor.spec.ts:3065-3070`.

**Q2. Can the two disagree?** Yes, for one to a few frames after every size change, then never. Observed after a real sign-in with a received share (MutationObserver timeline in the page,
`log-diag3c-*`, `log-diag3d-*`): in 132 of 132 sign-ins the shell mounts at 60px, the bar becomes 112px about 8 ms later (the clock status and the switcher row arrive) and the
stored value follows 1.0 to 34.6 ms later (up to 66.7 ms at 10x CPU throttle). `ResizeObserver` runs in the rendering step of the next frame, not at layout, so any read that forces layout first
(`getBoundingClientRect`, Playwright `boundingBox`) can see the new bar with the old property (by construction in `log-diag2-height.txt`: 92 / 60 in the same task, 92 / 92 two frames later).
User effect: scroll padding and the panel tops are one frame stale after the bar changes size; nothing stays hidden and nothing is visible. No user-visible fault; it is not a stale state.
Latent: the observer watches the content box by default but the value is the border box, so a change of padding or border alone is never reported (`log-diag2-padding-only.txt`: 60 stays while the bar is 92).
No such change exists in the stylesheet (the bar's padding is constant; `min-height` and width changes move the content box), so this is hardening only.

**Q3. Reproduction.** The failing assertion needs the read to land inside that window; it did not reproduce on the base: 80 runs of the real test (mobile, 6 workers), 240 runs (both projects, 14 workers),
110 reload probes (throttle 1, 6, 20), 132 sign-in probes (throttle 1, 4, 10) all read equal values (0 failures, so the rate is below about 1 in 560 here); the window itself was observed every time.
The failing trace (`pw-r2full-1101`) fits: sign-in response about +0 ms, bar boxes read at +86..+123 ms, the one `evaluate` +127 ms (monotonic trace time `trace-fields.txt`), the received value 60 and the expected 112,
under a loaded full suite where frames can be late. Fixed-sleep and loosened-assertion fixes are therefore both wrong.

**Q4.** Test defect: `expectBudget` waits for the combobox, which is not the last thing that moves the bar, then reads the rendered bar (forced layout) and the property in two separate round trips.
Not a product defect: the property always catches up with the bar.

**Q5. Minimal fix (one worker, tests only).** Owned paths: `tests/e2e/theme.spec.ts` (and, to remove the same pattern, `tests/e2e/shell.spec.ts`); no `src/` change.
1. `tests/e2e/theme.spec.ts:584-585` (`expectBudget`): replace the one-shot read by a retrying assertion on ONE round trip that returns the bar height and the property together, with the same 0.05 tolerance:
   `await expect.poll(() => page.evaluate(() => Math.abs(parseFloat(document.documentElement.style.getPropertyValue('--shell-bar-size')) - document.querySelector('.shell-bar')!.getBoundingClientRect().height)), { message: `${label}: --shell-bar-size equals the rendered bar` }).toBeLessThan(0.05);`
   Keep the bounding-box assertions as they are (they read the settled bar after it). Strictness is unchanged: it still fails if the property never equals the bar within the 7 s expect timeout.
2. Same change at `tests/e2e/shell.spec.ts:497-503` (read bar and property inside `expect.poll`, then keep the other measurements). `day-editor.spec.ts:3065-3070` reads `--editor-head-size` after the dialog is open; apply the same poll there if the worker finds the same one-shot pattern.
3. Proof: a deterministic test next to it in `theme.spec.ts` (phone project): set `.shell-bar` height through CSSOM in one `evaluate`, assert the property differs or is allowed to differ, then `expect.poll` until equal (`zz-diag2.spec.ts.txt` is the template); plus
   `playwright test tests/e2e/theme.spec.ts tests/e2e/shell.spec.ts --repeat-each=40 --workers=14` at 2026-11-01T08:45:00Z with the FIX10 wrapper, 0 failed, and the full mobile project once.
4. Optional product hardening, only if the coordinator wants the latent gap closed: `useBlockSize.ts:17` `observer.observe(node, { box: 'border-box' })` (one line; the test of item 3 with a padding-only change proves it). Not needed for this failure.

**Leftover regate processes.** None. The listing for `WP5-UX5-REGATE` returned only this command's own bash and powershell processes (`procs-raw.txt`); the `chain2.sh` / `chain3.sh` shells and the wedged Playwright tree are not alive
(a second query on `chain2`, `chain3`, `sweep.sh` matched only itself). No port in 49940-49979 or 49980-49999 is held (`netstat -ano -p tcp`, `ports-raw.txt`). I stopped nothing.
At the end no process of this task is left (`procs-final.txt`, empty).

**Slips and limits.** The e2e fixture takes its server port from the operating system, not from 49980-49999 (the fixture cannot be configured; ephemeral ports were used). Rule slips, none with an effect on a file: two `ls ... | head` pipes
(`head -50`, `head -0`) and one `/dev/null` and `/dev/stdout` redirect in a bulk copy command. No PID kill, no heredoc, no stdin to node or python, no recursive delete.
Two sign-in probes (`diag3`, `diag3b`) hung for 900 s on a hash-only `goto` in my own probe (not a product fault) and ended by their own timeout; `diag3c` onward fixed it. A throttle of 30 made the day rows slower than the 7 s expect timeout (`log-diag3c-r30` not kept).

Status: done
